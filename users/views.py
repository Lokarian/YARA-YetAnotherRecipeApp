from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from rest_framework.response import Response

from .forms import NewUserForm
from django.contrib.auth import login
from django.contrib import messages
from rest_framework import viewsets, status
from rest_framework import permissions
from .serializers import *


# Create your views here.

def register_request(request):
    if request.method == "POST":
        form = NewUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Registration successful.")
            return redirect("/")
        messages.error(request, "Unsuccessful registration. Invalid information.")
    form = NewUserForm()
    return render(request=request, template_name="registration/register.html", context={"register_form": form})


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited. on query all only show username
    """
    queryset = User.objects.all().order_by('-username')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'retrieve':
            return UserSerializer
        return UserSerializer

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
