from django.shortcuts import render
from django.views.generic import ListView

from .models import *


# Create your views here.

# new class based view for recipe list
class RecipeListView(ListView):
    model = Recipe
    template_name = 'recipes/recipe_list.html'
    context_object_name = 'recipes'


def recipe_detail(request, pk):
    recipe = Recipe.objects.get(pk=pk)
    return render(request, 'recipes/recipe_detail.html', {'recipe': recipe})


def recipe_create(request):
    # TODO: create a form for creating a new recipe
    pass
