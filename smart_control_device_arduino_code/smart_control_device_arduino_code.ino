
#include <ESP8266WiFi.h>
#include <EEPROM.h>
#include <DNSServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>
#include <PubSubClient.h>
#include <Arduino.h>
#include <assert.h>
#include <IRremoteESP8266.h>
#include <IRrecv.h>
#include <IRac.h>
#include <IRtext.h>
#include <IRutils.h>
#include <typeinfo>
#include "DHT.h"
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiClient.h>

int test = 0;

const char* ssid_ap = "ESP8266-Access-Point";
const char* password_ap = "123456789";
int vadilation = 0;

/* Soft AP network parameters */
IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);

WiFiClient espClient;
PubSubClient client(espClient);
ESP8266WebServer server(80);

const char* myHostname = "esp8266";


DNSServer dnsServer;
const byte DNS_PORT = 53;

unsigned long buttonPressedTime = 0;
const int delayDuration = 10000;  // 10 seconds delay


// constants won't change. They're used here to set pin numbers:
const int buttonPin = 12;  // the number of the pushbutton pin
int counter = 0;
// variables will change:
int buttonState = 0;  // variable for reading the pushbutton status


uint8_t check_wifi_status = 0;
uint8_t run_ap_mode = 0;
uint8_t run_ap_test = 0;

//mqtt

const char* mqtt_broker = "w33.kynoci.com"; // MQTT server name
const int mqtt_port = 1883; // MQTT Port
const char* mqtt_username = "newera";
const char* mqtt_password = "newera2023";
const char* topic = "esp8266/test";


// IR Receiver
// The Serial connection baud rate.
// i.e. Status message will be sent to the PC at this baud rate.
// Try to avoid slow speeds like 9600, as you will miss messages and
// cause other problems. 115200 (or faster) is recommended.
// NOTE: Make sure you set your Serial Monitor to the same speed.
uint8_t ir_reciver_on = 0;

const uint16_t kRecvPin = 14;

const uint32_t kBaudRate = 115200;

// As this program is a special purpose capture/decoder, let us use a larger
// than normal buffer so we can handle Air Conditioner remote codes.
const uint16_t kCaptureBufferSize = 1024;

#if DECODE_AC
// Some A/C units have gaps in their protocols of ~40ms. e.g. Kelvinator
// A value this large may swallow repeats of some protocols
const uint8_t kTimeout = 50;
#else   // DECODE_AC
// Suits most messages, while not swallowing many repeats.
const uint8_t kTimeout = 15;
#endif  // DECODE_AC

const uint16_t kMinUnknownSize = 12;

const uint8_t kTolerancePercentage = kTolerance;  // kTolerance is normally 25%
#define LEGACY_TIMING_INFO false

// Use turn on the save buffer feature for more complete capture coverage.
IRrecv irrecv(kRecvPin, kCaptureBufferSize, kTimeout, true);
decode_results results;  // Somewhere to store the results

//IR Transmitter
const uint16_t kIrLed = 4;  // ESP8266 GPIO pin to use. Recommended: 4 (D2).
IRsend irsend(kIrLed);      // Set the GPIO to be used to sending the message.
//EEPROM
//SSID and Pass
const int eepromSSID = 0;
const int eepromPass = 32;
//auto status
const int eepromautostatus = 64;

//Backend API
const char* host = "https://tezi.kynoci.com:8000/api/signal/";  
const char* host_autoac = "https://tezi.kynoci.com:8000/api/autoac/";
const char* host_check = "https://tezi.kynoci.com:8000/api/button-status/";

//BUZZER
const int buzzerPin = 15;


//DHT22
#define DHTPIN 13
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
int dht_status = 0;

/** Is this an IP? */
boolean isIp(String str) {
  for (size_t a = 0; a < str.length(); a++) {
    int c = str.charAt(a);
    if (c != '.' && (c < '0' || c > '9')) { return false; }
  }
  return true;
}

/** IP to String? */
String toStringIp(IPAddress ip) {
  String res = "";
  for (int a = 0; a < 3; a++) { res += String((ip >> (8 * a)) & 0xFF) + "."; }
  res += String(((ip >> 8 * 3)) & 0xFF);
  return res;
}

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
            html { display: inline-block; text-align: center;}
    h2 {font-size: 3.0rem; }
    p {font-size: 1.5rem; }
    input {margin-bottom: 5%;}
    </style>
</head>
<body>
    <h2>Please fill in  your home wifi SSID and Password.</h2>
    <p>This make our devices can link your home wifi, then can remote this devices control air conditioner</p>
    <form action="action" method="post">
        Enter Wifiname: <input type="text" name="input_message_ssid">
        Enter Password: <input type="text" name="input_message_pass">
        <input style="display: flex; float: right; " type="submit" value="Submit">
      </form>
</body>
</html>)rawliteral";

const char error_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML>
<html>
<head>
  <title>error</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html {font-family: Times New Roman; display: inline-block; text-align: center;}
    h2 {font-size: 3.0rem; color: #FF0000;}
  </style>
</head>
<body>
  <h2>Error 404</h2>
</body>
</html>)rawliteral";

boolean captivePortal() {
  if (!isIp(server.hostHeader()) && server.hostHeader() != (String(myHostname) + ".local")) {
    Serial.println("Request redirected to captive portal");
    server.sendHeader("Location", String("http://") + toStringIp(server.client().localIP()), true);
    server.send(302, "text/plain", "");
    server.client().stop();
    return true;
  }
  return false;
}

void connecthtml() {
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Pragma", "no-cache");
  server.sendHeader("Expires", "-1");
  server.send_P(200, "text/html", index_html);
}

void notFound() {
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Pragma", "no-cache");
  server.sendHeader("Expires", "-1");
  server.send_P(404, "text/html", error_html);
}


void ap_mode() {
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, netMsk);
  WiFi.softAP(ssid_ap, password_ap);
  Serial.println("");
  Serial.println("WiFi AP Mode");
  Serial.println("SSID: " + String(ssid_ap));
  Serial.println("Password: " + String(password_ap));
  dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  if (MDNS.begin(myHostname)) {
    Serial.println("MDNS responder started");
  }

  server.on("/", connecthtml);
  server.on("/generate_204", connecthtml);
  server.on("/action", HTTP_POST, action);
  server.onNotFound(notFound);

  server.begin();
  Serial.println("HTTP server started");
}

void action() {
  String input_message_ssid = server.arg("input_message_ssid");
  String input_message_pass = server.arg("input_message_pass");

  if (input_message_ssid.length() > 0 && input_message_pass.length() > 0) {
    Serial.println("Clearing EEPROM");
    for (int i = 0; i < EEPROM.length(); i++) {
      EEPROM.write(i, 0);
    }

    Serial.println("Writing SSID to EEPROM: " + input_message_ssid);
    for (int i = 0; i < input_message_ssid.length(); ++i) {
      EEPROM.put(eepromSSID + i, input_message_ssid[i]);
    }

    Serial.println("Writing Password to EEPROM: " + input_message_pass);
    for (int i = 0; i < input_message_pass.length(); ++i) {
      EEPROM.put(eepromPass + i, input_message_pass[i]);
    }
    EEPROM.commit();
    server.send(200, "text/html", "<h2>Configuration Saved</h2>");
    delay(3000);
    ESP.restart();
  } else {
    server.send(200, "text/html", "<h2>Please enter valid values</h2>");
    delay(2000);
    connecthtml();
  }
}
int dht_start_record = 0;
void mqtt_connect() {
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);
  while (!client.connected()) {
    String client_id = "esp8266-client-";
    client_id += String(WiFi.macAddress());
    Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
    if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("Public emqx mqtt broker connected");
      client.subscribe("esp/ir-receiver");
      client.subscribe("esp/auto-status");
      client.subscribe("esp/ir-receiver-reset");
      client.subscribe("esp/on-off-sta");
      client.subscribe("esp/ac-auto");
      dht_start_record = 1;
      delay(1000);
    } else {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
    delay(2000);
  }
  delay(2000);
}


void ir_reciver() {
  Serial.println("ir");
  assert(irutils::lowLevelSanityCheck() == 0);

  Serial.printf("\n" D_STR_IRRECVDUMP_STARTUP "\n", kRecvPin);

  irrecv.setTolerance(kTolerancePercentage);  // Override the default tolerance.
  irrecv.enableIRIn();                        // Start the receiver
}
uint8_t ir_counter = 0;
void parseStringToArray(String input, uint16_t* outputArray, int arraySize) {
  char str[input.length() + 1];
  input.toCharArray(str, sizeof(str));

  char* token = strtok(str, ",");
  int i = 0;
  while (token != NULL && i < arraySize) {
    outputArray[i] = atoi(token);
    token = strtok(NULL, ",");
    i++;
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
  Serial.print("Message:");
  payload[length] = '\0';
  const char* value = (char*)payload;
  Serial.println(value);
  // Check if the received topic and value meet the condition
  if (strcmp(topic, "esp/ir-receiver") == 0 && strcmp(value, "on") == 0) {
    // Start the IR receiver
    ir_reciver();
    // Receive and process IR signals for a specific duration or maximum number of signals
    uint8_t ir_counter = 0;
    // Check if an IR signal is received
    while (true) {
      if (irrecv.decode(&results)) {
        Serial.println(millis());
        // ir_receive_signal();
        String word = resultToHumanReadableBasic(&results);
        // if (word.indexOf("UNKNOWN") == -1 && word.indexOf("MWM") == -1) {  // Send message to mqtt have save signal without UNKNOWN and
        String output = resultToSourceCode(&results);
        int firstopenrowdata = output.indexOf("[", output.indexOf("["));
        // Serial.println(firstopenrowdata);
        int firstclosingrowdata = output.indexOf(']', output.indexOf(']'));
        // Serial.println(firstclosingrowdata);
        String eepromRawdata = output.substring(firstopenrowdata + 1, firstclosingrowdata);
        // Serial.println("1   " + eepromRawdata);

        int firstOpenBracket = output.indexOf('{', output.indexOf('{'));
        // Serial.println(firstOpenBracket);
        int firstClosingBracket = output.indexOf('}', output.indexOf('}'));
        // Serial.println(firstClosingBracket);
        String eepromSignal = output.substring(firstOpenBracket + 1, firstClosingBracket);
        eepromSignal.replace(" ", "");
        Serial.println(eepromSignal);
        const uint8_t* payloadBuffer = reinterpret_cast<const uint8_t*>(eepromSignal.c_str());

        client.publish_P("esp/ir-transmitter-on", payloadBuffer, eepromSignal.length(), true);
        client.publish("esp/ir-receiver-check", "done");
        break;
      }
      delay(100);
      // Wait for a short duration before checking for the next signal
    }

    // Stop the IR receiver if needed
    irrecv.disableIRIn();
    Serial.println("IR receiver stopped");
  }

  if (strcmp(topic, "esp/ir-receiver") == 0 && strcmp(value, "off") == 0) {
    Serial.println("IR receiver started");
    // Start the IR receiver
    ir_reciver();
    // Receive and process IR signals for a specific duration or maximum number of signals
    uint8_t ir_counter = 0;
    // Check if an IR signal is received
    delay(1000);
    while (true) {
      if (irrecv.decode(&results)) {
        Serial.println(millis());
        // ir_receive_signal();
        String word = resultToHumanReadableBasic(&results);
        delay(1000);
        // Send message to mqtt have save signal without UNKNOWN and
        String output = resultToSourceCode(&results);

        int firstopenrowdata = output.indexOf('[', output.indexOf('['));
        Serial.println(firstopenrowdata);
        int firstclosingrowdata = output.indexOf(']', output.indexOf(']'));
        Serial.println(firstclosingrowdata);
        String eepromRawdata = output.substring(firstopenrowdata + 1, firstclosingrowdata);
        Serial.println("1   " + eepromRawdata);

        int firstOpenBracket = output.indexOf('{', output.indexOf('{'));
        Serial.println(firstOpenBracket);
        int firstClosingBracket = output.indexOf('}', output.indexOf('}'));
        Serial.println(firstClosingBracket);
        String eepromSignal = output.substring(firstOpenBracket + 1, firstClosingBracket);
        eepromSignal.replace(" ", "");
        Serial.println("2   " + eepromSignal);
        const uint8_t* payloadBuffer = reinterpret_cast<const uint8_t*>(eepromSignal.c_str());
        client.publish_P("esp/ir-transmitter-off", payloadBuffer, eepromSignal.length(), true);
        client.publish("esp/ir-receiver-check", "done");
        break;
      }
      delay(10);
      // Wait for a short duration before checking for the next signal
    }

    // Stop the IR receiver if needed
    irrecv.disableIRIn();
    Serial.println("IR receiver stopped");
  }
  //EEPROM clear ir_receiver on signal tommorrow check
  if (strcmp(topic, "esp/ir-receiver-reset") == 0 && strcmp(value, "on") == 0) {
    for (int i = eepromSSID; i < eepromSSID + 30; i++) {
      EEPROM.write(i, 0);
    }
    for (int i = eepromPass; i < eepromPass + 30; i++) {
      EEPROM.write(i, 0);
    }
    EEPROM.commit();
    ESP.restart();
  }

  if (strcmp(topic, "esp/on-off-sta") == 0 && strcmp(value, "on") == 0) {
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();
    HTTPClient http;
    http.begin(*client, host);
    int httpResponseCode = http.GET();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
      DynamicJsonDocument doc(2048);  // Adjust the size as per your JSON data size
      DeserializationError error = deserializeJson(doc, payload);

      if (error) {
        Serial.println("JSON parsing failed!");
      } else {
        if (doc.is<JsonArray>()) {
          JsonArray jsonArray = doc.as<JsonArray>();

          // Loop through the array elements
          for (JsonVariant value : jsonArray) {
            // Extracting the buttonStatus and id for each element
            int id = value["id"];
            String signalOn = value["signalOn"];
            int numCommasOn = std::count(signalOn.begin(), signalOn.end(), ',') + 1;
            // Extract integers from the formatted string and store them in the rawData array
            uint16_t rawDataOn[numCommasOn];
            parseStringToArray(signalOn, rawDataOn, numCommasOn);
            irsend.sendRaw(rawDataOn, numCommasOn, 38);
            Serial.print(signalOn);
          }
        }
      }
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
  if (strcmp(topic, "esp/on-off-sta") == 0 && strcmp(value, "off") == 0) {
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();
    HTTPClient http;
    http.begin(*client, host);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
      DynamicJsonDocument doc(2048);  // Adjust the size as per your JSON data size
      DeserializationError error = deserializeJson(doc, payload);

      if (error) {
        Serial.println("JSON parsing failed!");
      } else {
        if (doc.is<JsonArray>()) {
          JsonArray jsonArray = doc.as<JsonArray>();

          // Loop through the array elements
          for (JsonVariant value : jsonArray) {
            // Extracting the buttonStatus and id for each element
            int id = value["id"];
            String signalOff = value["signalOff"];
            int numCommasOff = std::count(signalOff.begin(), signalOff.end(), ',') + 1;
            // Extract integers from the formatted string and store them in the rawData array
            uint16_t rawDataOff[numCommasOff];
            parseStringToArray(signalOff, rawDataOff, numCommasOff);
            irsend.sendRaw(rawDataOff, numCommasOff, 38);
            delay(1000);
            irsend.sendRaw(rawDataOff, numCommasOff, 38);
          }
        }
      }
    } else {
      // Serial.print("Error code: ");
      // Serial.println(httpResponseCode);
    }
    http.end();
  }
  Serial.println("-----------------------");
}

int auto_ac_status = 0;
float auto_ac_lower = 0;
float auto_ac_higher = 0;

void auto_ac() {
  std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
  client->setInsecure();
  HTTPClient http;
  http.begin(*client, host_autoac);
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);
      DynamicJsonDocument doc(2048);  // Adjust the size as per your JSON data size
      DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.println("JSON parsing failed!");
    } else {
      if (doc.is<JsonArray>()) {
        JsonArray jsonArray = doc.as<JsonArray>();

        // Loop through the array elements
        for (JsonVariant value : jsonArray) {
          // Extracting the buttonStatus and id for each element
          int id = value["id"];
          String auto_status = value["auto_status"];
          float auto_lower = value["auto_lower"];
          float auto_higher = value["auto_higher"];
          if (auto_status == "on") {
            auto_ac_status = 1;
            auto_ac_lower = auto_lower;
            auto_ac_higher = auto_higher;
          } else{
            auto_ac_status = 0;
          }
        }
      }
    }
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

String check_ac_status = "";

void check_status() {
  std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
  client->setInsecure();
  HTTPClient http;
  http.begin(*client, host_check);
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);
      DynamicJsonDocument doc(2048);  // Adjust the size as per your JSON data size
      DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.println("JSON parsing failed!");
    } else {
      if (doc.is<JsonArray>()) {
        JsonArray jsonArray = doc.as<JsonArray>();

        // Loop through the array elements
        for (JsonVariant value : jsonArray) {
          // Extracting the buttonStatus and id for each element
          int id = value["id"];
          String buttonStatus = value["buttonStatus"];
          check_ac_status = buttonStatus;
        }
      }
    }
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  EEPROM.begin(512);  // Initialize EEPROM with max size
  delay(5000);
  char stored_ssid[512 + 1];  // Add 1 for null terminator
  char stored_pass[512 + 1];  // Add 1 for null terminator

  for (int i = 0; i < 512; i++) {
    stored_ssid[i] = EEPROM.read(eepromSSID + i);
    stored_pass[i] = EEPROM.read(eepromPass + i);
  }
  stored_ssid[512] = '\0';  // Null terminate the ssid char array
  stored_pass[512] = '\0';  // Null terminate the password char array

  String ssid = String(stored_ssid);
  String password = String(stored_pass);

  Serial.println(ssid);
  Serial.println(password);

  WiFi.begin(ssid, password);
  Serial.println(WiFi.status());
  while (WiFi.status() != WL_CONNECTED && check_wifi_status < 20) {
    delay(500);
    Serial.print(".");
    check_wifi_status++;
  }
  if (check_wifi_status >= 20) {
    Serial.println("no connection, restarting");
    run_ap_mode = 1;
  }
  if (run_ap_mode == 0) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    mqtt_connect();
    delay(100);
    Serial.println("");
  }
  irrecv.setTolerance(kTolerancePercentage);
  irrecv.enableIRIn();


  pinMode(buttonPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  dht.begin();
  irsend.begin();
}

unsigned long previousMillis = 0;     // will store the last time the subprocess was updated
unsigned long previousMillis_5s = 0;  // will store the last time the subprocess was updated
const long interval = 60000;          // the time we need to wait
const long interval_5s = 5000;        // the time we need to wait
void loop() {
  buttonState = digitalRead(buttonPin);

  if (run_ap_mode == 1) {
    if (buttonState == LOW) {
      if (counter != 0) {
        Serial.print("The current value is ");
        Serial.println(counter);
        if (counter == 10) {
          run_ap_test = 1;
        }
        counter = 0;
      } else {
        Serial.println("low");
      }
    } else {
      while (counter < 10) {
        if (digitalRead(buttonPin) == LOW) {
          Serial.println(counter);
          break;
        } else {
          Serial.println(counter);
          if (counter > 8) {
            analogWrite(buzzerPin, 127);
            delay(500);
            analogWrite(buzzerPin, 0);
          }
          counter++;
        }
        delay(1000);
      }
    }
  }



  while (run_ap_test == 1 && check_wifi_status < 60) {
    ap_mode();
    delay(1000);
    check_wifi_status++;
  }
  if (check_wifi_status >= 55) {
    Serial.println("no device connection ap mode");
  }

  // // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float dhthumidity = dht.readHumidity();
  // // Read temperature as Celsius (the default)
  float dhttemperature = dht.readTemperature();
  // // Read temperature as Fahrenheit (isFahrenheit = true)
  float f = dht.readTemperature(true);
  char humidityStr[10];  // Adjust the array size based on the maximum length of your expected humidity value
  dtostrf(dhthumidity, 4, 2, humidityStr);

  // Convert the float value to a char array
  char temperatureStr[10];                        // Adjust the array size based on the maximum length of your expected temperature value
  dtostrf(dhttemperature, 4, 2, temperatureStr);  // Convert float to string with 4 digits before the decimal point and 2 after it

  // Check if any reads failed and exit early (to try again).
  if (isnan(dhthumidity) || isnan(dhttemperature) || isnan(f)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(humidityStr);
  Serial.print(F("%  Temperature: "));
  Serial.print(temperatureStr);
  Serial.print(F("°C "));
  // Convert char arrays to String objects
  String temperatureString = String(dhttemperature);
  String humidityString = String(dhthumidity);
  // Concatenate the String objects
  String tem_hum_combine = temperatureString + " , " + humidityString;
  const char* tem_hum_com = tem_hum_combine.c_str();

  unsigned long currentMillis = millis();  // save the current time
  // 10second
  if (currentMillis - previousMillis_5s >= interval_5s) {
    previousMillis_5s = currentMillis;  // remember the current time
    client.publish("esp/current", tem_hum_com);
    client.publish("esp/mqtt", "connect");
  }

  // 60 second
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;  // remember the current time
    client.publish("esp/dht", tem_hum_com);
  }
  Serial.println(check_ac_status);

  auto_ac();
  if (auto_ac_status == 1) {
    delay(500);
    check_status();
    if (dhttemperature > auto_ac_higher && check_ac_status == "off") {
      client.publish("esp/on-off-sta", "on");
      client.publish("esp/alert", "on");
    } else if (dhttemperature < auto_ac_lower && check_ac_status == "on") {
      client.publish("esp/on-off-sta", "off");
      client.publish("esp/alert", "off");
    }
  }
  Serial.println("");
  client.loop();
  delay(500);
  dnsServer.processNextRequest();
  server.handleClient();
}