from django.contrib import admin

# Register your models here.

from .models import *

admin.site.register(Recipe)
admin.site.register(Produce)
admin.site.register(Ingredient)
admin.site.register(RecipeStep)
admin.site.register(RecipeBook)
admin.site.register(RecipeBookAccess)
