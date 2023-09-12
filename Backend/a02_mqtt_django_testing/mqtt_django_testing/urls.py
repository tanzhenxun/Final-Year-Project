"""
URL configuration for mqtt_django_testing project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include , path
from mqtt_django_testing import views
from rest_framework.urlpatterns import format_suffix_patterns 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/mqtt-tem/', views.mqtt_list),
    path('api/button-status/', views.update_status),
    path('api/signal/', views.update_signal),
    path('mqtt-tem/<int:id>', views.mqtt_detail),
    path('api/average/', views.calculate_average_data),
    path('api/autoac/', views.update_autoac),
]

urlpatterns = format_suffix_patterns(urlpatterns)