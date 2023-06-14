import re
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import render, redirect
from rest_framework.decorators import action, authentication_classes, api_view, permission_classes
from rest_framework.generics import CreateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .forms import NewUserForm
from django.contrib.auth import login, get_user_model
from django.contrib import messages
from rest_framework import viewsets, status
from rest_framework import permissions
from .serializers import *


# Create your views here.

# allow anyone to register
@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def register_request(request):
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    # check if valid username and not already in use
    if username and User.objects.filter(username=username).exists():
        return Response({'error': 'Username already in use.'}, status=status.HTTP_400_BAD_REQUEST)
    # check if email regex valid
    if email and not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return Response({'error': 'Invalid email address.'}, status=status.HTTP_400_BAD_REQUEST)
    # check if valid email and not already in use
    if email and User.objects.filter(email=email).exclude(username=username).exists():
        return Response({'error': 'Email address already in use.'}, status=status.HTTP_400_BAD_REQUEST)
    # check if valid password
    if password and len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
    #create user
    user = User.objects.create_user(username=username, email=email, password=password)
    #create token for user and return it
    token = Token.objects.create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)


class SmallResultsSetPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 10


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited. on query all only show username
    """
    queryset = User.objects.all().order_by('-username')
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = SmallResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'retrieve':
            return UserSerializer
        return UserSerializer

    @action(detail=False, methods=['GET'])
    def current(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        # only allow retrieve for own user or admin
        if request.user.is_superuser or request.user.id == kwargs['pk']:
            return super().retrieve(request, *args, **kwargs)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        # only allow update for own user or admin
        if request.user.is_superuser or request.user.id == kwargs['pk']:
            return super().update(request, *args, **kwargs)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Retrieve the search query parameter value from the request
        search_query = request.query_params.get('search', None)

        if search_query:
            # Perform search filtering based on username or email fields using SQL LIKE query
            queryset = queryset.filter(Q(username__icontains=search_query) | Q(email__icontains=search_query))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
