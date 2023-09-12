import React, { useEffect, useState } from "react";
import { Plugins } from "@capacitor/core";
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonRow,
  IonCol,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonText,
  IonButtons,
  IonBackButton,
  IonImg,
} from "@ionic/react";
import {Browser} from "@capacitor/browser";

const SetupDeviceManual : React.FC = () => {
  const OpenDevicesWebsite = async () => {
    await Browser.open({ url: "http://192.168.4.1" });
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="ion-align-items-center">
          <IonButtons slot="start">
            <IonBackButton text="Back" />
          </IonButtons>
          <IonTitle>Setup Devices Manual</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRow>
          <IonCol>
            <IonCard>
              <IonImg
                alt="Button Images"
                src={"/button1.png"}
              ></IonImg>
              <IonCardHeader>
                <IonCardSubtitle>Step 1</IonCardSubtitle>
                <IonCardTitle className="">Reset to Default</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                Please click this button 10 second reset devices change to
                default.
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>Step 2</IonCardSubtitle>
                <IonCardTitle className="">
                  Connect Devices Hotspot
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                Please change your wifi ssid to connected your devices:
                <br></br>
                <strong>SSID:</strong> Nodemcu <br></br>
                <strong>Password:</strong> 123456
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>Step 3</IonCardSubtitle>
                <IonCardTitle className="">Setup Home Wifi</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="ion-no-padding ion-padding-horizontal">
                Please click below link enter Home <strong>SSID</strong> and  
                <strong> Password</strong> to send the wifi configuration to the
                devices module for paring.
              </IonCardContent>
              <IonButton fill="clear" onClick={OpenDevicesWebsite}>
                <strong>Link to website</strong>
              </IonButton>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>Step 4</IonCardSubtitle>
                <IonCardTitle className="">Check Connected</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                Please set back you wifi and return dashboard check have{" "}
                <IonText color="success">GREEN</IonText> box then finished, if not
                please do again from Step 1.
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default SetupDeviceManual;
