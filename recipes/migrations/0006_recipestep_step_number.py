# Generated by Django 4.2.2 on 2023-06-13 18:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0005_delete_produce_rename_produce_ingredient_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipestep',
            name='step_number',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
