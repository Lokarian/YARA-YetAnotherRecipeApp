from django.contrib.auth.models import User
from rest_framework import serializers

from recipes.models import Recipe, RecipeBook, RecipeBookAccess


class RecipeSerializer(serializers.ModelSerializer):
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

    def to_internal_value(self, data):
        user = User.objects.get(username=data['username'])
        access_level = data['access_level']
        return RecipeBookAccess(user=user, access_level=access_level)


class RecipeBookSerializer(serializers.ModelSerializer):
    users = RecipeBookUserSerializer(many=True)

    class Meta:
        model = RecipeBook
        fields = ('title', 'description', 'users')

    def update(self, instance, validated_data):
        users_data = validated_data.pop('users', None)
        if users_data is not None:
            instance.recipebookaccess_set.all().delete()
            for user_data in users_data:
                access = RecipeBookAccess(
                    recipebook=instance,
                    user=User.objects.get(username=user_data['username']),
                    access_level=user_data['access_level'],
                )
                access.save()
        return super().update(instance, validated_data)


class RecipeBookListSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeBook
        fields = ('id', 'title', 'description')
