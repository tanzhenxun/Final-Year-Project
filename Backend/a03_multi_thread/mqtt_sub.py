import paho.mqtt.client as mqtt

from listening import update_database, update_signal_on, update_signal_off, update_autostatus, update_autoACValue,update_status


def on_connect(mqttc, obj, flags, rc):
    print("rc: "+str(rc))

def on_message(mqttc, obj, msg):
    print(msg.topic+" "+str(msg.qos)+" "+str(msg.payload))
    if msg.topic == "esp/dht":
        value = str(msg.payload.decode())
        values = msg.payload.decode().split(",")
        if len(values) == 2:
            temperature = float(values[0].strip())
            humidity = float(values[1].strip())
            print("Temperature: " + str(temperature))
            print("Humidity: " + str(humidity))
            update_database(temperature,humidity)
    elif msg.topic == "esp/on-off-sta":
        value = str(msg.payload.decode())
        print("Status: " + str(value))
        update_status(value)
    elif msg.topic == "esp/ir-transmitter-on":
        signalon = str(msg.payload.decode())
        print("SignalOn: " + str(signalon))
        update_signal_on(signalon)
    elif msg.topic == "esp/ir-transmitter-off":
        signaloff = str(msg.payload.decode())
        print("SignalOff: " + str(signaloff))
        update_signal_off(signaloff)
    elif msg.topic == "esp/auto-status":
        autostatus = str(msg.payload.decode())
        print("Autostatus: " + str(autostatus))
        update_autostatus(autostatus)
    elif msg.topic == "esp/auto-ac-value":
        autoACValue = msg.payload.decode().split(",")
        print("AutoACValue: " + str(autoACValue))
        if len(autoACValue) == 2:
            autoACValuelow = float(autoACValue[0].strip())
            autoACValuehigh = float(autoACValue[1].strip())
            print("autoACValuelow: " + str(autoACValuelow))
            print("autoACValuehigh: " + str(autoACValuehigh))
            update_autoACValue(autoACValuelow, autoACValuehigh)

# If you want to use a specific client id, use
# mqttc = mqtt.Client("client-id")
# but note that the client id must be unique on the broker. Leaving the client
# id parameter empty will generate a random id for you.
Mqtt = mqtt.Client()
Mqtt.on_message = on_message
Mqtt.on_connect = on_connect

username = "babi"
password = "chu"
Mqtt.username_pw_set(username, password)
# Uncomment to enable debug messages
Mqtt.connect("192.168.8.3", 1883, 60)
Mqtt.subscribe("esp/#")

Mqtt.loop_forever()