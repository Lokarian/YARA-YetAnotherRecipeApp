"""YetAnotherRecipeApp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework import routers
from . import views
from django.urls import include, path


router = routers.DefaultRouter()
router.register(r'recipeBooks', views.RecipeBookViewSet)
router.register(r'recipes', views.RecipeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('processUrl/', views.process_url, name='processUrl'),
    path('imageProxy/', views.image_proxy, name='image-proxy'),
    path('generateRecipeThumbnail/', views.generate_thumbnails, name='generateRecipeThumbnail'),
]
