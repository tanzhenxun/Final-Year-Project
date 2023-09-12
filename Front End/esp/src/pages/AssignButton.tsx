import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import "./AssignButton.css";
import {
  caretForwardOutline,
  checkmarkOutline,
  closeOutline,
} from "ionicons/icons";
import { SetStateAction, useEffect, useState } from "react";
import { Client } from "paho-mqtt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {} from "@fortawesome/free-regular-svg-icons";
import {
  faWind,
  faDroplet,
  faPowerOff,
  faSpinner,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Navigation, Pagination, Controller } from "swiper/modules";
import { Swiper as SwiperType } from "swiper/types";
import "./AssignButton.css";
import React from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const AssignButton: React.FC = () => {
  const [CheckDevicesStatusColor, setCheckDevicesStatusColor] =
    useState<string>("warning");
  const [CheckDevicesStatusIcon, setCheckDevicesStatusIcon] =
    useState<string>(closeOutline);
  const [Assigntext, setAssigntext] = useState<string>(
    "Click any button to assign AC signal data"
  );
  // const swiper = useSwiperSlide();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [slide, setSlide] = React.useState(0);

  const handleStartOnboarding = () => {
    setShowOnboardingModal(true);
    setSlide(0);
  };

  const handleFinishOnboarding = () => {
    setShowOnboardingModal(false);
  };


  const swiperRef = React.useRef(null);

  const client = new Client("w33.kynoci.com", Number(15676), "/ws", "");
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived_Connect;

  if (!client.isConnected()) {
    client.connect({
      useSSL: true,
      userName: "newera",
      password: "newera2023",
      onSuccess: onConnect,
      onFailure: fail,
    });
    // Reconnect if the connection is lost
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!client.isConnected()) {
      }
    }, 1000);

    return () => clearInterval(intervalId); // cleanup
  }, []);

  function fail() {
    setCheckDevicesStatusColor("danger");
    setCheckDevicesStatusIcon(closeOutline);
    console.log("unconnect mqtt");
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
    if (message.destinationName == "esp/ir-receiver-check") {
      const name = message.payloadString;
      if (name == "done") {
        setAssigntext("Done. Click On Other Button To Assign");
      } else {
        setAssigntext("*Error. Please Click On Again Other Button To Assign");
      }
    }
  }

  const receiverOn = () => {
    if (!client) {
      return;
    }
    client.send("esp/ir-receiver", "on");
    setTimeout(() => {
      setAssigntext("Now Click on Real Controller Buton One Times");
    }, 200); // Delay of 1 second (1000 milliseconds)
    console.log("on");
  };

  const receiverOff = () => {
    if (!client) {
      return;
    }
    client.send("esp/ir-receiver", "off");
    setTimeout(() => {
      setAssigntext("Now Click on Real Controller Buton One Times");
    }, 200); // Delay of 1 second (1000 milliseconds)
    console.log("off");
  };

  const onboardingSlides = [
    {
      title: "Click Button to Recive Signal Data",
      description:
        " Click any button to initiate the signal data capturing process. Once the initial press is successful, the prompt will change to 'Now Click on Real Controller Button.' ",
        image: "/Assign_button_img1.png",
    },
    {
      title: "Click On or Off to IR Receiver Component",
      description:
        "Proceed to align the real controller with the target IR receiver component switch it On or Off, as shown in the provided image.",
      image: "/Assign_button_img2.jpeg",
    },
    {
      title: "Succesfully Done",
      description:
        "After successfully completing Step 2, the prompt will update to 'Done. Click On Other Button To Assign.' This signifies that you can now remotely control your air conditioner using this app.",
      image: "/Assign_button_img3.png",
    },
  ];

  // function to handle the previous button click
  const handlePrevClick = () => {
    // get the Swiper instance
    const swiper = swiperRef.current.swiper;
    // check if it exists
    if (swiper) {
      // go to the previous slide
      swiper.slidePrev();
    }
  };

  // function to handle the next button click
  const handleNextClick = () => {
    // get the Swiper instance
    const swiper = swiperRef.current.swiper;
    // check if it exists
    if (swiper) {
      // go to the next slide
      swiper.slideNext();
    }
  };



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton text="Back" />
          </IonButtons>
          <IonTitle> Assign Button</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRow>
          <IonCol className="seperate ion-align-items-center ion-justify-content-center">
            <h1 className="ion-no-margin ion-padding-vertical">Connection </h1>
            <FontAwesomeIcon icon={faSpinner} className="fa-lg ion-margin-start" spin />
          </IonCol>
        </IonRow>
        <IonGrid fixed={true}>
        <IonRow className="seperate ion-align-items-center ion-justify-content-between ">
          <IonCol>
            {Assigntext}
            </IonCol>
            <IonCol size="auto">
            <IonButton onClick={handleStartOnboarding}  fill="clear" className="ion-no-margin  info-btn " >
              <FontAwesomeIcon icon={faCircleInfo} className="fa-lg"/>
              </IonButton>
          </IonCol>
        </IonRow>
        </IonGrid>
        <div className="seperate ion-align-items-center ion-justify-content-evenly">
          <IonButton shape="round" onClick={receiverOn}>
            <div className="px-3">ON</div>
          </IonButton>
          <IonButton className="" shape="round" onClick={receiverOff}>
            <div className="px-3">OFF</div>
          </IonButton>
        </div>

        <IonModal
          isOpen={showOnboardingModal}
          onDidDismiss={handleFinishOnboarding}
        >
          <IonContent fullscreen={true}>
            <div className="relative">
              <div className="absolute">
                <div className="relative vhvw">
                  <div className="showOnTop">
                    <div className="d-flex justify-content-between vw-100">
                      {slide == 0 && (
                        <>
                          <IonButton
                            fill="clear"
                            className=""
                            onClick={handleFinishOnboarding}
                          >
                            Skip
                          </IonButton>
                          <IonButton
                            fill="clear"
                            className=""
                            onClick={handleNextClick}
                          >
                            Next
                          </IonButton>
                        </>
                      )}
                      {slide == 1 && (
                        <>
                          <IonButton
                            fill="clear"
                            className=""
                            onClick={handlePrevClick}
                          >
                            Pervious
                          </IonButton>
                          <IonButton
                            fill="clear"
                            className=""
                            onClick={handleNextClick}
                          >
                            Next
                          </IonButton>
                        </>
                      )}
                      {slide == 2 && (
                        <>
                          <IonButton
                            fill="clear"
                            className=""
                            onClick={handlePrevClick}
                          >
                            Pervious
                          </IonButton>
                          <IonButton
                            fill="clear"
                            className=""
                            onClick={handleFinishOnboarding}
                          >
                            Finish
                          </IonButton>
                        </>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination]}
              spaceBetween={50}
              slidesPerView={1}
              // navigation
              pagination={{ clickable: true }}
              onSwiper={(swiper) => console.log(swiper)}
              onSlideChange={(swiper) => {
                console.log("Slide index changed to: ", swiper.activeIndex);
                setSlide(swiper.activeIndex);
              }}
              className="seperate"
            >
              {onboardingSlides.map((slide, index) => (
                <SwiperSlide key={index} className="center-content">
                  <img src={slide.image} alt={slide.title} className="assign_btn-img" />
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                </SwiperSlide>
              ))}
            </Swiper>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AssignButton;
