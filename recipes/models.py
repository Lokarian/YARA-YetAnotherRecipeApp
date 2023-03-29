from django.db import models
from django.contrib.auth.models import User
import uuid


def filename_with_uuid(instance, filename):
    ext = filename.split('.')[-1]
    filename = "%s.%s" % (uuid.uuid4(), ext)
    return 'uploads/' + filename


# Create your models here.

class Recipe(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to=filename_with_uuid, null=True, blank=True)
    ingredients = models.ManyToManyField('Ingredient')
    steps = models.ManyToManyField('RecipeStep')
    # each recipe has to be in one recipe book
    recipe_book = models.ForeignKey('RecipeBook', on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Ingredient(models.Model):
    name = models.CharField(max_length=200)
    amount = models.CharField(max_length=200)

    def __str__(self):
        return self.amount + ' x ' + self.name


class RecipeStep(models.Model):
    description = models.TextField()

    # image = models.ImageField(upload_to='images/recipe_steps/')

    def __str__(self):
        return self.description[:50] + '...' if len(self.description) > 50 else self.description


class RecipeBook(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    users = models.ManyToManyField(User, through='RecipeBookAccess', related_name='recipebooks')

    @property
    def recipes(self):
        return self.recipe_set.all()

    def __str__(self):
        return self.title


class RecipeBookAccess(models.Model):
    ACCESS_LEVELS = (
        ('R', 'Read'),
        ('F', 'Full'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipebook = models.ForeignKey(RecipeBook, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=1, choices=ACCESS_LEVELS)

    def __str__(self):
        return f'{self.recipebook} - {self.access_level}'
