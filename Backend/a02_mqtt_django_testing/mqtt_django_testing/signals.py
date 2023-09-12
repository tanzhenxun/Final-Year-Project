from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver

@receiver(post_migrate)
def run_initial_function(sender, **kwargs):
    print("Hello asdfsddddddddddd")
    pass