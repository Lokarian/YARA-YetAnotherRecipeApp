from io import BytesIO

import requests
from PIL import Image
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from recipe_scrapers import scrape_me
from rest_framework import viewsets, permissions, status, pagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.utils import json
from rest_framework.views import APIView

from YetAnotherRecipeApp.promptHelper import run_edit_task, run_chat_task, generate_images
from recipes.models import RecipeBook, Recipe, RecipeBookAccess, RecipeStep, Ingredient
from recipes.serializers import RecipeBookSerializer, RecipeSerializer, RecipeListSerializer, RecipeBookListSerializer


class RecipeBookViewSet(viewsets.ModelViewSet):
    queryset = RecipeBook.objects.all()
    serializer_class = RecipeBookSerializer
    permission_classes = [permissions.IsAuthenticated]
    list_serializer_class = RecipeBookListSerializer

    def get_queryset(self):
        queryset = RecipeBook.objects.all()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(users__in=[self.request.user])
        # prefetch users on detail view
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('users')
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return self.list_serializer_class
        return self.serializer_class

    def retrieve(self, request, *args, **kwargs):
        # only allow retrieve for own user or admin
        if request.user.is_superuser or RecipeBook.objects.get(id=kwargs['pk']).users.filter(
                id=request.user.id).exists():
            return super().retrieve(request, *args, **kwargs)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def list(self, request, *args, **kwargs):
        # Only allow list for own user or admin
        if request.user.is_superuser:
            return super().list(request, *args, **kwargs)

        # Get the user's recipe book accesses
        recipe_book_accesses = RecipeBookAccess.objects.filter(user=request.user)

        # if queryparameter write is set to true, only return recipebooks with full access
        if request.query_params.get('write') == 'true':
            recipe_book_accesses = recipe_book_accesses.filter(access_level="Full")
        # Get the recipe book IDs for the user's accesses
        recipe_book_ids = recipe_book_accesses.values_list('recipebook_id', flat=True)

        # Filter the RecipeBook queryset based on the user's access
        queryset = RecipeBook.objects.filter(id__in=recipe_book_ids)

        serializer = self.list_serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        users = json.loads(request.data['users'])
        recipe_book = RecipeBook(title=request.data['title'], description=request.data['description'])
        recipe_book.save()
        # add the users to the recipebook
        for user in users:
            user_obj = User.objects.get(username=user['username'])
            access_level = user['access_level']
            RecipeBookAccess.objects.create(user=user_obj, recipebook=recipe_book, access_level=access_level)
        # return with data serialized by serializer_class
        return Response(status=status.HTTP_201_CREATED, data=self.serializer_class(recipe_book).data)

    def update(self, request, *args, **kwargs):
        # check for write access
        book_access = RecipeBookAccess.objects.get(user=request.user, recipebook=kwargs['pk'])
        # if superuser or write access
        if request.user.is_superuser or book_access.access_level == 'Full':
            super().update(request, *args, **kwargs)
            # remove all current accesses and add the new ones
            recipe_book = RecipeBook.objects.get(id=kwargs['pk'])
            recipe_book.users.clear()
            users = json.loads(request.data['users'])
            for user in users:
                user_obj = User.objects.get(username=user['username'])
                access_level = user['access_level']
                RecipeBookAccess.objects.create(user=user_obj, recipebook=recipe_book, access_level=access_level)
            return Response(status=status.HTTP_200_OK, data=self.serializer_class(recipe_book).data)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class RecipePagination(pagination.PageNumberPagination):
    page_size = 10  # Adjust the page size as needed
    page_size_query_param = 'page_size'
    max_page_size = 100


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = RecipePagination

    def get_queryset(self):
        queryset = Recipe.objects.all()
        recipe_book = self.request.query_params.get('recipe_book', None)
        if recipe_book is not None:
            queryset = queryset.filter(recipe_book=recipe_book)
        return queryset

    def list(self, request, *args, **kwargs):
        # Check if the user is a superuser
        if request.user.is_superuser:
            queryset = self.queryset
        else:
            # Filter recipes based on recipe access for the user
            queryset = self.queryset.filter(recipe_book__recipebookaccess__user=request.user)

        # Filter by search text
        search_text = request.query_params.get('search')
        if search_text:
            queryset = queryset.filter(title__icontains=search_text)

        # Perform pagination
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        # only allow retrieve for own user or admin
        if request.user.is_superuser:
            return super().retrieve(request, *args, **kwargs)
        book_access = RecipeBookAccess.objects.filter(user=request.user)
        if book_access:
            return super().retrieve(request, *args, **kwargs)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def create(self, request, *args, **kwargs):
        print(request.data)
        # check for write access
        recipeBook_id = request.data['recipeBookId']
        if not request.user.is_superuser:
            if not recipeBook_id:
                return Response(status=status.HTTP_403_FORBIDDEN)
            book_access = RecipeBookAccess.objects.get(user=request.user, recipebook_id=recipeBook_id)
            if book_access.access_level != 'Full':
                return Response(status=status.HTTP_403_FORBIDDEN)

        recipe = Recipe(title=request.data['title'], description=request.data['description'],
                        image=request.data['image'], recipe_book_id=recipeBook_id)
        recipe.save()

        steps = json.loads(request.data['steps'])
        for step in steps:
            RecipeStep.objects.create(recipe=recipe, description=step['description'], step_number=step['step_number'])
        ingredients = json.loads(request.data['ingredients'])
        for ingredient in ingredients:
            Ingredient.objects.create(recipe=recipe, name=ingredient['name'], amount=ingredient['amount'])
        return Response(status=status.HTTP_201_CREATED, data=self.serializer_class(recipe).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_url(request):
    url = request.data['url']
    try:
        scraper = scrape_me(url)
        json_obj = scraper.to_json()
    except Exception as e:
        scraper = scrape_me(url, wild_mode=True)
        json_obj = scraper.to_json()
    try:
        # try to parse the ingredients with openai integration
        parsed_ingredients = run_edit_task("ingredient_amount_seperation",
                                           json.dumps(json_obj['ingredients'], ensure_ascii=False))
        json_obj['ingredients'] = json.loads(parsed_ingredients)
    except Exception as e:
        # fallback to primitive ingredient list
        json_obj['ingredients'] = list(map(lambda x: {'amount': '', 'name': x}, json_obj['ingredients']))
    return Response(status=status.HTTP_200_OK, data=json_obj)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def image_proxy(request):
    image_url = request.GET.get('url')
    if not image_url:
        return Response({'error': 'Image URL is required.'}, status=400)

    # Fetch the image from the provided URL
    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return Response({'error': 'Failed to fetch the image.'}, status=400)

    # Set the appropriate content type for the response
    content_type = response.headers.get('content-type', 'image/jpeg')
    headers = {'Content-Type': content_type}

    # Return the image content as binary data
    return HttpResponse(response.content, content_type=content_type)


@api_view(['post'])
@permission_classes([permissions.IsAuthenticated])
def generate_thumbnails(request):
    recipe_json = request.data['recipe_json']
    image_prompt = run_chat_task("recipe_thumbnail_prompt", recipe_json)
    # if prompt starts with "Prompt:" remove it
    if image_prompt.startswith("Prompt:"):
        image_prompt = image_prompt[7:]
    images = generate_images(image_prompt, 1, True)
    return Response(status=status.HTTP_200_OK, data=list(map(lambda x: x['b64_json'], images)))
