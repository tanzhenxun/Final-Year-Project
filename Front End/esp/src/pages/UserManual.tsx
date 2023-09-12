import {
  IonBackButton,
  IonButtons,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import "./UserManual.css";
import { caretForwardOutline, checkmarkOutline, closeOutline } from "ionicons/icons";
import { SetStateAction, useEffect, useState } from "react";
import { Client } from 'paho-mqtt';

const UserManual: React.FC = () => {
  const client = new Client("w33.kynoci.com", Number(15676), '/ws', "");
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived_Connect;

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!client.isConnected()) {
        // Reconnect if the connection is lost
        client.connect({
          userName: "newera",
          password: "newera2023",
          useSSL: true,
          onSuccess: onConnect,
          onFailure: fail
        });
      }
    }, 1000);

    return () => clearInterval(intervalId); // cleanup
  }, []);

  function fail(){
  }

  function onConnect() {
    console.log('Success to connect mqtt');
    client.subscribe('esp/#')
  }

  //output error
  function onConnectionLost(responseObject: { errorCode: number; errorMessage: any; }) {
    if (responseObject.errorCode !== 0) {
      const name = (`onConnectionLost: ${responseObject.errorMessage}`);
      console.log(`onConnectionLost: ${responseObject.errorMessage}`);
    }
  }

  //if loop to catch the topic you want
  function onMessageArrived_Connect(message: {
    destinationName: any; payloadString: any; 
  }) {}


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" >
          <IonButtons slot="start">
            <IonBackButton text="Back" />
          </IonButtons>
          <IonTitle> User Manual </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRow>
          <IonCol>
            <IonItem
              button
              detail={true}
              detailIcon={caretForwardOutline}
              className="ion-margin-vertical"
              routerDirection="forward"
              routerLink="/tab2"
            >
              <IonLabel>
                <h3>Setup Device Manual</h3>
              </IonLabel>
            </IonItem>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonItem
              button
              detail={true}
              detailIcon={caretForwardOutline}
              className="ion-margin-vertical"
              routerDirection="forward"
              routerLink="/assignbutton"
            >
              <IonLabel>
                <h3>Activate buttons assign mode</h3>
              </IonLabel>
            </IonItem>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
    
  );
};

export default UserManual;
