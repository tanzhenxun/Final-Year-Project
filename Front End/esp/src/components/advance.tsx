import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  useIonViewWillEnter,
  useIonViewDidEnter,
  IonRow,
  IonCol,
  IonInput,
  IonItem,
  IonLabel,
  IonToggle,
} from "@ionic/react";
import "./advance.css";
import axios from "axios";
import { Client } from "paho-mqtt";
import React, { useEffect, useState } from "react";
interface Data {
  id: number;
  buttonStatus: boolean;
}

interface Value {
  id: number;
  auto_status: string;
  auto_higher: string;
  auto_lower: string;
}

const Test: React.FC = () => {
  const client = new Client("w33.kynoci.com", Number(15676), "/ws", "");

  var high = "";
  const [isToggleEnabled, setIsToggleEnabled] = useState<boolean>();
  const [offAcValue, setOffAcValue] = useState("");
  const [onAcValue, setOnAcValue] = useState("");
  const [value, setValue] = useState<Value[]>([]);
  const handleOnAcChange = (e: any) => {
    setOnAcValue(e.target.value);
  };
  const handleOffAcChange = (e: any) => {
    setOffAcValue(e.target.value);
  };
  useEffect(() => {
    fetchAutoStatus();
  }, []);
  const fetchAutoStatus = async () => {
    try {
      const response = await fetch("https://tezi.kynoci.com:8000/api/autoac/");
      const data = await response.json();
      const auto_status = data[0].auto_status;
      const auto_high = data[0].auto_higher;
      setValue(data);
      high = data[0].auto_higher;
      setIsToggleEnabled(auto_status === "on" ? true : false);
    } catch (error) {
      console.error("Error fetching auto status:", error);
    }
  };
  
  const valueOn = value.map((data) => data.auto_higher);
  const valueOff = value.map((data) => data.auto_lower);
  
  const isSubmitButtonEnabled =
    isToggleEnabled && (onAcValue.trim() !== "" || offAcValue.trim() !== "");   
    
  let high_text = "" ;
  let lower_text = "" ;

  const handleSubmit = (event:any) => {
    event.preventDefault(); // Prevent default form submission behavior
    
    if (client.isConnected()) {
      if(onAcValue.trim() !== ""){
        high_text = onAcValue;
      }else{
        high_text = valueOn[0];
      }
      if(offAcValue.trim() !== ""){
        lower_text = offAcValue;
      }else{
        lower_text = valueOff[0];
      }

      const topic = "esp/auto-ac-value";
      const payload = high_text + "," + lower_text;
      const qos = 0;
      client.send(topic, payload, qos, false);
    } else {
      console.log("MQTT client not connected. Cannot send signal.");
    }
  };

  console.log("sf" + isToggleEnabled);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived_Connect;

  // Reconnect if the connection is lost

  // const disconnecttwominutes = () =>{
  //   client.disconnect();
  //   console.log('Disconnecting client every 2 minutes');
  // }
  if (!client.isConnected()) {
    client.connect({
      useSSL: true,
      userName: "newera",
      password: "newera2023",
      onSuccess: onConnect,
      onFailure: fail,
      reconnect: true,
    });
    // Reconnect if the connection is lost
  }

  function fail(errorMessage: any) {
    console.error("Failed to connect to MQTT broker: ", errorMessage);
  }

  function onConnect() {
    console.log("Success to connect mqtt");
    client.subscribe("esp/#");
  }

  //output error
  function onConnectionLost(responseObject: {
    errorCode: number;
    errorMessage: any;
  }) {
    if (responseObject.errorCode !== 0) {
      const name = `onConnectionLost: ${responseObject.errorMessage}`;
      // setDestinationLight(name);
      console.log(`onConnectionLost: ${responseObject.errorMessage}`);
    }
  }

  //if loop to catch the topic you want
  function onMessageArrived_Connect(message: {
    destinationName: any;
    payloadString: any;
  }) {
    if (message.destinationName == "esp/ir-receiver") {
      const name = message.payloadString;
      // console.log(`onMessage: ${name}`);
      // setDestinationLight(name);
      if (name == "on") {
        // setCheckACStatusColor("sucess");
        // setCheckACsStatusText("ON");
      } else {
        // setCheckACStatusColor("medium");
        // setCheckACsStatusText("OFF");
      }
    }
    if (message.destinationName == "esp/on-off-sta") {
      const name = message.payloadString;
      // console.log(`onMessage: ${name}`);
      // setDestinationLight(name);
      if (name == "on") {
        console.log("on");
      } else {
        console.log("off");
      }
    }
  }

  const handleToggleChange = () => {
    if (client.isConnected()) {
      const topic = "esp/auto-status";
      console.log(isToggleEnabled);
      const payload = isToggleEnabled ? "off" : "on";
      const qos = 0;
      client.send(topic, payload, qos, false);
      console.log(isToggleEnabled);
      setIsToggleEnabled(!isToggleEnabled);
    } else {
      console.log("MQTT client not connected. Cannot send signal.");
    }
  };
  return (
    <>
      <IonRow>
        <IonCol size="12">
          <IonItem className="empty-border">
            <IonToggle
              justify="space-between"
              checked={isToggleEnabled}
              onIonChange={handleToggleChange}
            >
              Open Automatic Switch
              <IonLabel>
                <p>
                  Set your perfection temperature when need switch on or off
                </p>
              </IonLabel>
            </IonToggle>
          </IonItem>
        </IonCol>
        {isToggleEnabled && (
          <>
            <IonCol size="12">
              <IonItem className="separate">
                <IonInput
                  label="ON AC Value"
                  labelPlacement="stacked"
                  value={onAcValue}
                  onIonChange={handleOnAcChange}
                  placeholder={"Current value:" + valueOn}
                ></IonInput>
                <IonInput
                  label="OFF AC Value"
                  labelPlacement="stacked"
                  value={offAcValue}
                  onIonChange={handleOffAcChange}
                  placeholder={"Current value:" + valueOff}
                ></IonInput>
              </IonItem>
            </IonCol>
            <IonCol className="seperate ion-justify-content-end" size="12">
              <button className="hacky-hack" />
              <IonButton
              //have bug: IonButton type="submit" does not submit form when enter pressed in inputs
                type="submit"
                disabled={!isSubmitButtonEnabled}
                onClick={handleSubmit}
              >
                Submit
              </IonButton>
            </IonCol>
          </>
        )}
      </IonRow>
    </>
  );
};

export default Test;
