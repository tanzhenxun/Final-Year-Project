from django.contrib import admin
from .models import Mqtt, Status, Signal,AutoAC

admin.site.register(Mqtt)
admin.site.register(Status)
admin.site.register(Signal)
admin.site.register(AutoAC)