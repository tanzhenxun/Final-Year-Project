# Generated by Django 4.2.1 on 2023-06-13 15:26

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mqtt_django_testing', '0006_mqtt_datetime'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mqtt',
            name='datetime',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]
