# import paho.mqtt.client as mqtt
# from .models import Mqtt 

# from django.shortcuts import render
# from django.http import JsonResponse

# from .serializers import MqttSerializer
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status


# MQTT_BROKER_HOST = 'w33.kynoci.com'
# MQTT_BROKER_PORT = 1883


# class StartupScriptMiddleware:
#     def on_connect(self, client, userdata, flags, rc):
#         print("Connected to MQTT broker")
#         client.subscribe("esp/temperature")

#     def on_message(self, client, userdata, msg):
#         temperature = float(msg.payload.decode())
#         temperature_reading = Mqtt(temperature=temperature)
#         temperature_reading.save()

#     def __init__(self, get_response):
#         self.get_response = get_response
#         client = mqtt.Client()
#         client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
#         client.on_connect = self.on_connect
#         client.on_message = self.on_message

#     def __call__(self, request):
#         # Your middleware logic here
#         response = self.get_response(request)
#         return response

