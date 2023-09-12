from rest_framework import serializers
from .models import Mqtt, Status, Signal, AutoAC

class MqttSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mqtt
        fields = ['id', 'temperature','humidity', 'datetime']

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['id', 'buttonStatus']

class SignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signal
        fields = ['id', 'signalOn','signalOff']

class AutoACSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoAC
        fields = ['id', 'auto_status','auto_higher','auto_lower']