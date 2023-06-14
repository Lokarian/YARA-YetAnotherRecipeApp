import json

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import serializers

from recipes.models import Recipe, RecipeBook, RecipeBookAccess, Ingredient, RecipeStep


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('id', 'name', 'amount')


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ('id', 'description', 'step_number')


class RecipeSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True)
    steps = StepSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ('id', 'title', 'description', 'ingredients', 'steps', 'image')


class RecipeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ('id', 'title', 'description', 'image')


class RecipeBookUserSerializer(serializers.RelatedField):
    queryset = RecipeBookAccess.objects.all()

    def to_representation(self, value):
        return {
            'username': value.user.username,
            'access_level': value.access_level,
        }


class RecipeBookSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()

    class Meta:
        model = RecipeBook
        fields = ('id', 'title', 'description', 'users')

    def get_users(self, obj):
        recipe_book_accesses = obj.recipebookaccess_set.all()
        users_data = []
        for access in recipe_book_accesses:
            user_data = {
                'username': access.user.username,
                'access_level': access.get_access_level_display(),
                'user_id': access.user.id,
            }
            users_data.append(user_data)
        return users_data


class RecipeBookListSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()

    class Meta:
        model = RecipeBook
        fields = ('id', 'title', 'description', 'users')

    def get_users(self, obj):
        recipe_book_accesses = obj.recipebookaccess_set.all()
        users_data = []
        for access in recipe_book_accesses:
            user_data = {
                'username': access.user.username,
                'access_level': access.get_access_level_display(),
                'user_id': access.user.id,
            }
            users_data.append(user_data)
        return users_data
