from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.utils import json

from recipes.models import RecipeBook, Recipe, RecipeBookAccess
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


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Recipe.objects.all()
        recipe_book = self.request.query_params.get('recipe_book', None)
        if recipe_book is not None:
            queryset = queryset.filter(recipe_book=recipe_book)
        return queryset

    def list(self, request, *args, **kwargs):
        self.serializer_class = RecipeListSerializer
        # only allow list for own user or admin
        if request.user.is_superuser:
            return super().list(request, *args, **kwargs)
        book_access = RecipeBookAccess.objects.filter(user=request.user)
        if book_access:
            return super().list(request, *args, **kwargs)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

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
        recipeBook_id = request.data['recipe_book']
        if not request.user.is_superuser:
            if not recipeBook_id:
                return Response(status=status.HTTP_403_FORBIDDEN)
            book_access = RecipeBookAccess.objects.get(user=request.user, recipe_book=recipeBook_id)
            if book_access.access_level != 'W':
                return Response(status=status.HTTP_403_FORBIDDEN)
        book_access = RecipeBookAccess.objects.get(user=request.user, recipe_book=request.data['recipe_book'])

        # ingredient arrives as json, parse and create new ingredient for each
        ingredient = request.data['ingredients']
        print(ingredient)
