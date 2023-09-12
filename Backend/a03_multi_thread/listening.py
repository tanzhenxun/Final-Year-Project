
import os
import sys

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mqtt_django_testing.settings')

# # Add the Django project path to sys.path
django_project_path = "/home/engineer/tezi/04_api/mqtt/a02_mqtt_django_testing"
sys.path.append(django_project_path)

# # Import Django and setup

import django, datetime
import pytz
django.setup()

from mqtt_django_testing.models import Mqtt, Status, Signal, AutoAC


# Define the update_database function
def update_database(tem,hum):
    # Update the database with the received value
    # malaysia_timezone = pytz.timezone('Asia/Kuala_Lumpur')
    mqtt_object= Mqtt(temperature=tem, humidity=hum)
    # print(datetime.datetime.now(malaysia_timezone))

    mqtt_object.save()

    # Additional processing or logic can be added here

    # Print the updated objects
    objects = Mqtt.objects.all()
    for obj in objects:
        print(obj.datetime)

def update_status(value):
    try:
        status_object = Status.objects.get(pk=1)
        status_object.buttonStatus = value
        status_object.save()
        print("Database updated successfully.")
    except Status.DoesNotExist:
        # If the object doesn't exist, create it with the provided value and primary key
        status_object = Status.objects.create(pk=1, buttonStatus=value)
        print("Database row created and updated successfully.")

def update_signal_on(signalon):
    try:
        signal_object = Signal.objects.get(pk=1)
        signal_object.signalOn = signalon
        signal_object.save()
        print("Database updated successfully.")
    except Signal.DoesNotExist:
        # If the object doesn't exist, create it with the provided value and primary key
        signal_object = Signal.objects.create(pk=1, signalOn=signalon, signalOff=signalon)
        print("Database row created and updated successfully.")

def update_signal_off(signaloff):
    try:
        signal_object = Signal.objects.get(pk=1)
        signal_object.signalOff = signaloff
        signal_object.save()
        print("Database updated successfully.")
    except Signal.DoesNotExist:
        # If the object doesn't exist, create it with the provided value and primary key
        signal_object = Signal.objects.create(pk=1, signalOn=signaloff, signalOff=signalon)
        print("Database row created and updated successfully.")


def update_autostatus(auto_status):
    try:
        AutoAC_object = AutoAC.objects.get(pk=1)
        AutoAC_object.auto_status = auto_status
        AutoAC_object.save()
        print("Database updated successfully.")
    except AutoAC.DoesNotExist:
        # If the object doesn't exist, create it with the provided value and primary key
        # daminwork = "0"
        AutoAC_object = AutoAC.objects.create(pk=1, auto_status=auto_status, auto_higher="0" , auto_lower="0")
        print("Database row created and updated successfully.")

def update_autoACValue(auto_lower, auto_higher):
    try:
        AutoAC_object = AutoAC.objects.get(pk=1)
        AutoAC_object.auto_lower = auto_lower #Lower than this value will auto off 
        AutoAC_object.auto_higher = auto_higher#Higher than this value will auto on 
        AutoAC_object.save()
        print("Database updated successfully.")
    except AutoAC.DoesNotExist:
        # daminwork = "0"
        # If the object doesn't exist, create it with the provided value and primary key
        AutoAC_object = AutoAC.objects.create(pk=1, auto_status="auto_lower", auto_lower=auto_lower, auto_higher=auto_higher)
        print("Database row created and updated successfully.")
