from . import views
from django.urls import include, path
from rest_framework import routers
from rest_framework.authtoken import views as auth_views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', auth_views.obtain_auth_token, name='login'),
    path('register/', views.register_request, name='register'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
