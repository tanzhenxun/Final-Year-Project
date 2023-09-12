import paho.mqtt.client as mqtt
from django.http import JsonResponse
from .models import Mqtt, Status, Signal, AutoAC
from .serializers import MqttSerializer, StatusSerializer, SignalSerializer, AutoACSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg
from datetime import datetime

@api_view(['GET','POST'])
def update_autoac(request):
    if request.method == 'GET':
        autoac = AutoAC.objects.all()
        serializer = AutoACSerializer(autoac, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AutoACSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST'])
def update_signal(request):
    if request.method == 'GET':
        signal = Signal.objects.all()
        serializer = SignalSerializer(signal, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = SignalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST'])
def update_status(request):
    if request.method == 'GET':
        status = Status.objects.all()
        serializer = StatusSerializer(status, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = StatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    #     status = request.POST.get('status')

    #     # Update the status in the "Status" table using Django ORM
    #     # Replace 'YourStatusModel' with the appropriate model representing the "Status" table
    #     # Assuming you have a model field named 'status'
    #     Status.objects.update(status=status)

    #     return JsonResponse({'status': 'success'})

    # return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def calculate_average_data(request):
    # Get all SensorData objects and group them by date
    queryset = Mqtt.objects.values('datetime__date')

    # Annotate the average temperature and humidity for each date
    queryset = queryset.annotate(average_temperature=Avg('temperature'), average_humidity=Avg('humidity'))

    # Iterate over the queryset and print the results
    data = []
    for item in queryset:
        average_temperature = item['average_temperature']
        average_humidity = item['average_humidity']
        date = item['datetime__date']  # Access the date value
        print(f"Date: {date}, Average Temperature: {average_temperature}, Average Humidity: {average_humidity}")
        data.append({
            'date': date,
            'average_temperature': average_temperature,
            'average_humidity': average_humidity
        })
    return JsonResponse(data, safe=False)


@api_view(['GET', 'POST'])
def mqtt_list(request, format=None):
    if request.method == 'GET':
        mqtt = Mqtt.objects.all()
        serializer = MqttSerializer(mqtt, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = MqttSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def mqtt_detail(request, id, format=None):
    try:
        mqtt = Mqtt.objects.get(pk=id)
    except Mqtt.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MqttSerializer(mqtt)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = MqttSerializer(mqtt, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        mqtt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker")
    client.subscribe("esp/temperature")

def on_message(client, userdata, msg):
    value = float(msg.payload.decode())
    temperature_reading = Mqtt(value=value)
    temperature_reading.save()
