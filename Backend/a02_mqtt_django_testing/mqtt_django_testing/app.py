from django.apps import AppConfig

class YourAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mqtt_django_testing'

    def ready(self):
        import mqtt_django_testing.signals  # Import the signals module