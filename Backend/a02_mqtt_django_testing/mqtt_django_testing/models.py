from django.db import models
import datetime 

class Mqtt(models.Model):
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    datetime = models.DateTimeField(default=datetime.datetime.now)

    def __str__(self):
        return f"Mqtt value: {self.temperature} + {self.datetime}"

class Status(models.Model):
    buttonStatus = models.CharField(max_length=255)

    def __str__(self):
        return f"Status: {self.buttonStatus}"

class Signal(models.Model):
    signalOn = models.CharField(max_length=255)
    signalOff = models.CharField(max_length=255)

    def __str__(self):
        return f"Signal: {self.signalOn} + {self.signalOff}"

class AutoAC(models.Model):
    auto_status = models.CharField(max_length=255)
    auto_higher = models.DecimalField(max_digits=5, decimal_places=2)
    auto_lower = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"AutoAC: {self.auto_status} + {self.auto_higher} +{self.auto_lower}"