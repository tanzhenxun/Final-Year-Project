import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import "./Home.css";
import {
  wifi,
  wifiOutline,
  thermometerOutline,
  caretForwardOutline,
  arrowForwardOutline,
  closeOutline,
} from "ionicons/icons";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-regular-svg-icons";
import { Network } from "@capacitor/network/";
import {
  faWind,
  faDroplet,
  faPowerOff,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { Client } from "paho-mqtt";
import mqtt from "mqtt";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Chart from "../components/Chart";
import Advance from "../components/advance";
import { LocalNotifications } from "@capacitor/local-notifications";
import { BackgroundMode } from "@ionic-native/background-mode";

const Home: React.FC = () => {
  const randomClientId = "client-" + Math.floor(Math.random() * 1000000);
  const client = new Client(
    'w33.kynoci.com',
    Number(15676),
    "/ws",
    randomClientId
  );

  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived_Connect;

  const [WifiLinkCricle, setWifiLinkCricle] = useState<any>();
  const [WifiLinkStatus, setWifiLinkStatus] = useState<any>();
  const [CheckACStatusColor, setCheckACStatusColor] =
    useState<string>("medium");
  const [CheckACStatusText, setCheckACsStatusText] = useState<string>("OFF");
  const [Check, setCheck] = useState<any>();

  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string>("control");
  const handleSegmentChange = (event: CustomEvent) => {
    setSelectedSegment(event.detail.value);
  };
  // const [mqttData, setMqttData] = useState<Data[]>([]);
  const [isOn, setIsOn] = useState<boolean>();

  //Current Value
  const [CurrentValues, setCurrentValues] = useState({
    valueTem: "",
    valueHum: "",
  });
  //Check have link to device
  let timer: ReturnType<typeof setTimeout>;
  const [connectionStatus, setConnectionStatus] = useState<string | null>();
  // const [Check, setCheck] = useState<string>();

  useEffect(() => {
    fetchButtonStatus();
  }, []);

  const fetchButtonStatus = async () => {
    try {
      const response = await fetch(
        "https://tezi.kynoci.com:8000/api/button-status/"
      );
      const data = await response.json();
      const testing = data[0].buttonStatus; // Assuming the response contains a property 'isOn' indicating the status
      console.log(testing);
      setIsOn(testing === "on" ? true : false); // Assuming the response contains a property 'isOn' indicating the status
    } catch (error) {
      console.error("Error fetching button status:", error);
    }
  };
  const [testing, setTesting] = useState(false);
  useEffect(() => {
    const intervalId = setInterval(() => {
      Network.getStatus().then(setStatus);
    }, 2000); // run check every second

    const handler = Network.addListener("networkStatusChange", setStatus);
    Network.getStatus().then(setStatus);
    return () => {
      clearInterval(intervalId);
      handler.remove();
    };
  }, []);

    


  console.log(connectionStatus);
  function setStatus(status: any) {
    if (status.connected === true && status.connectionType === "wifi") {
      console.log(status);
      setTesting(true);
    } else {
      console.log(status);
      setTesting(false);
    }
  }

  useEffect(() => {
    if (testing === true && connectionStatus === 'connect') {
      setWifiLinkCricle("success");
      setWifiLinkStatus("link");
    }else{
      setWifiLinkCricle("danger");
      setWifiLinkStatus("unlink");
    }
  }, [testing, connectionStatus]);



  // Reconnect if the connection is lost

  // const disconnecttwominutes = () =>{
  //   client.disconnect();
  //   console.log('Disconnecting client every 2 minutes');
  // }

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

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (!client.isConnected()) {
  //       // Reconnect if the connection is lost
  //       client.connect({
  //         userName: "newera",
  //         password: "newera2023",
  //         useSSL: false,
  //         onSuccess: onConnect,
  //         onFailure: fail,
  //         reconnect:true
  //       });
  //     }
  //   }, 10000);

  //   return () => clearInterval(intervalId); // cleanup
  // }, []);
  
  let reconnectInterval;
  const MAX_RECONNECT_ATTEMPTS = 5;
  let reconnectAttempts = 0;


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
      if (name == "on") {
        setCheckACStatusColor("sucess");
        setCheckACsStatusText("ON");
      } else {
        setCheckACStatusColor("medium");
        setCheckACsStatusText("OFF");
      }
    }
    // if (message.destinationName == "esp/on-off-sta") {
    //   const name = message.payloadString;
    //   if (name == "on") {
    //     setCheck("on");
    //   } else {
    //     setCheck("off");
    //   }
    // }

    if (message.destinationName == "esp/mqtt") {
      const name = message.payloadString;
      console.log(name);
        if (name === "connect") {
          setConnectionStatus("connect");
        }
      }
      if (message.destinationName == "esp/current") {
      const name = message.payloadString;
      const [valueTem, valueHum] = name.split(",");
      setCurrentValues({ valueTem, valueHum });
    }
    if (message.destinationName == "esp/alert") {
      const name = message.payloadString;
      if(name == "on"){
        scheduleLocalNotificationOn();
      }else {
        scheduleLocalNotificationOff();
      }
    }
  }
  const sendSignal = async () => {
    if (client.isConnected()) {
      const topic = "esp/on-off-sta";
      console.log(isOn);
      const payload = isOn ? "off" : "on";
      const qos = 0;
      client.send(topic, payload, qos, false);
      console.log(isOn);
      setIsOn(!isOn);
    } else {
      console.log("MQTT client not connected. Cannot send signal.");
    }
  };
  const iconClass = isOn ? "thermometerOutlineBlue" : "thermometerOutlineRed";

  BackgroundMode.enable();

  // Auto Switch On
  const scheduleLocalNotificationOn = async () => {
    const notifRequest = {
      title: `Auto Swicth On`,
      body:`Your room temperature ${CurrentValues.valueTem}°C has higher than preset switch-on parameter!`,
      largeBody:`Your room temperature ${CurrentValues.valueTem}°C has higher than preset switch-on parameter!`,
      id: 1,
      // schedule: { at: new Date(Date.now() + 1000) }, // Show the notification 5 seconds from now
      sound: '', // Set an empty string for sound (mute)
      smallIcon: 'drawable/icon', // Optional, use the name of the icon in the Android project
      iconColor: '#488aff', // Optional, set the notification icon color
    };

    try {
      await LocalNotifications.schedule({ notifications: [notifRequest] });
      console.log('Local notification scheduled successfully On!');
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  };

  // Auto Switch Off
  const scheduleLocalNotificationOff = async () => {
    const notifRequest = {
      title: 'Auto Swicth Off',
      body:`Your room temperature ${CurrentValues.valueTem}°C has lower than preset switch-off parameter!`,
      largeBody:`Your room temperature ${CurrentValues.valueTem}°C has lower than the preset switch-off parameter!`,
      id: 1,
      // schedule: { at: new Date(Date.now() + 1000) }, // Show the notification 5 seconds from now
      sound: '', // Set an empty string for sound (mute)
      smallIcon: 'drawable/icon', // Optional, use the name of the icon in the Android project
      iconColor: '#488aff', // Optional, set the notification icon color
    };

    try {
      await LocalNotifications.schedule({ notifications: [notifRequest] });
      console.log('Local notification scheduled successfully Off! ');
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <div className="d-flex ion-align-items-center ion-justify-content-between">
            <IonTitle>Remote AC </IonTitle>
            <IonItem
              button
              className="ion-margin-vertical m-0"
              routerLink="/tab1"
              lines="none"
            >
              <FontAwesomeIcon icon={faGear} className="fa-2x" />
            </IonItem>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* <IonRow>
        <IonItem
              button
              className="ion-margin-vertical m-0"
              routerLink="/alert"
              lines="none"
            >
              <FontAwesomeIcon icon={faGear} className="fa-2x" />
            </IonItem>
        </IonRow> */}
        <IonRow>
          <IonCol className="ion-text-center">
            <IonButton
              className="mt-2"
              shape="round"
              color={WifiLinkCricle}
              onClick={() => {
                if (WifiLinkStatus == "link") {
                  setShowAlert1(true);
                } else {
                  setShowAlert2(true);
                }
              }}
            >
              <h4 className="py-2 px-5">{WifiLinkStatus}</h4>
            </IonButton>
            <IonAlert
              isOpen={showAlert1}
              onDidDismiss={() => setShowAlert1(false)}
              cssClass="my-custom-class"
              header={"Yes!"}
              message={"Your Internet is Working!"}
              buttons={["OK"]}
            />
            <IonAlert
              isOpen={showAlert2}
              onDidDismiss={() => setShowAlert2(false)}
              cssClass="my-custom-class"
              header={"OOPS!"}
              subHeader={"No Internet Connection"}
              message={
                "Make sure you connected to WI-Fi or check again device has fill in correct  SSID or password.  "
              }
              buttons={["OK"]}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonCard className="seperate ion-justify-content-evenly">
              <IonCardHeader className="ion-justify-content-center">
                <IonCardSubtitle>Current</IonCardSubtitle>
                <IonCardTitle>
                  <h1 className="ion-no-margin ion-padding-bottom">
                    Temperature
                  </h1>
                  <h1 className="ion-no-margin ion-padding-bottom">Humidity</h1>
                </IonCardTitle>
              </IonCardHeader>

              <IonCardHeader className="ion-no-padding seperate ion-justify-content-center">
                <IonCardTitle className="seperate ion-align-items-center ion-no-margin ">
                  <h1 className="text-no-wrap">{CurrentValues.valueTem}°C</h1>
                  <IonIcon
                    icon={thermometerOutline}
                    className="fa-2x iconClass"
                  ></IonIcon>
                </IonCardTitle>
                <IonCardTitle className="seperate ion-align-items-center ion-no-margin">
                  <FontAwesomeIcon
                    icon={faDroplet}
                    className="fa-2x faDroplet"
                  />
                  <h1>{CurrentValues.valueHum}%</h1>
                </IonCardTitle>
              </IonCardHeader>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonSegment value={selectedSegment} onIonChange={handleSegmentChange}>
            <IonSegmentButton value="control">
              <IonLabel>Control</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="event">
              <IonLabel>Event</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="advance">
              <IonLabel>Advance</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonRow>
        {selectedSegment === "control" && (
          <IonRow className="ion-margin-top">
            <IonCol className=" seperate flex-column ion-align-items-center ion-justify-content-center">
              <IonButton
                color={isOn ? "success" : "medium"}
                className=""
                id="button"
                onClick={sendSignal}
              >
                <FontAwesomeIcon icon={faPowerOff} className="fa-3x fa-cog" />
              </IonButton>
              <div className="seperate ion-align-items-center ion-justify-content-center pt-3">
                {isOn && (
                  <FontAwesomeIcon
                    icon={faWind}
                    flip="both"
                    className="fa-lg"
                  />
                )}

                <h3 className="ion-no-margin ion-padding-horizontal">
                  {isOn ? "ON" : "OFF"}
                </h3>
                {isOn && (
                  <FontAwesomeIcon
                    icon={faWind}
                    flip="vertical"
                    className="fa-lg"
                  />
                )}
              </div>
            </IonCol>
          </IonRow>
        )}
        {selectedSegment === "event" && <Chart />}
        {selectedSegment === "advance" && <Advance />}
      </IonContent>
    </IonPage>
  );
};

export default Home;
