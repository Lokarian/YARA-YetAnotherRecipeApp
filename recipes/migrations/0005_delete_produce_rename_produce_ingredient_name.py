# Generated by Django 4.1.7 on 2023-03-27 23:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("recipes", "0004_produce_image_alter_ingredient_produce_and_more"),
    ]

    operations = [
        migrations.DeleteModel(name="Produce",),
        migrations.RenameField(
            model_name="ingredient", old_name="produce", new_name="name",
        ),
    ]