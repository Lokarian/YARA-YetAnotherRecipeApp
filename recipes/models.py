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


class Produce(models.Model):
    name = models.CharField(max_length=200)

    # image = models.ImageField(upload_to='images/produce/')

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    produce = models.ForeignKey(Produce, on_delete=models.DO_NOTHING)
    amount = models.CharField(max_length=200)


class RecipeStep(models.Model):
    description = models.TextField()
    # image = models.ImageField(upload_to='images/recipe_steps/')


class RecipeBook(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    users = models.ManyToManyField(User, through='RecipeBookAccess', related_name='recipebooks')

    @property
    def recipes(self):
        return self.recipe_set.all()


class RecipeBookAccess(models.Model):
    ACCESS_LEVELS = (
        ('R', 'Read'),
        ('F', 'Full'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipebook = models.ForeignKey(RecipeBook, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=1, choices=ACCESS_LEVELS)
