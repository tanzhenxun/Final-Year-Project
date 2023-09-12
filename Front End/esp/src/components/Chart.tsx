

import React, { useEffect, useRef, useState } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonContent,useIonViewWillEnter,
  useIonViewWillLeave, 
  IonPage,
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar} from '@ionic/react';

import { Bar, Line, Pie } from "react-chartjs-2";
import { CategoryScale , CartesianScaleOptions, Chart } from "chart.js";
import { Chart as ChartJS } from "chart.js/auto";
interface MqttData {
  id: number;
  temperature: string;
  humidity: string;
  datetime: string;
}
interface MqttAverage {
  date: string;
  average_temperature: string;
  average_humidity: string;
}
import "./Chart.css";
const TemperatureChart: React.FC = () => {
  
  
  
  const [mqttAverage, setMqttAverage] = useState<MqttAverage[]>([]); //have avwraga data so have 2 set
  const [mqttData, setMqttData] = useState<MqttData[]>([]); 
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const refreshInterval = setInterval(fetchGraph, 10000); // Refresh every 1 minute (adjust as needed)
    // Clear the interval when the component is unmounted
    return () => clearInterval(refreshInterval);
  }, []);
  const fetchGraph = async () => {
    try {
      console.log("qwe");
      const date_value = await fetch('https://tezi.kynoci.com:8000/api/mqtt-tem');
      const average_value = await fetch('https://tezi.kynoci.com:8000/api/average');
      const data = await date_value.json();
      const average = await average_value.json();
      setMqttData(data);
      setMqttAverage(average);
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  useIonViewWillLeave(() => {
    ChartJS.unregister(CategoryScale);
  }, []);
  
  const [selectedSegment, setSelectedSegment] = useState<string>('day');

  const handleSegmentChange = (event: CustomEvent) => {
    setSelectedSegment(event.detail.value);
  };

  // console.log(data)
  const desiredDataPoints = 5; // Number of data points to display
  const startingIndex = Math.max(mqttAverage.length - desiredDataPoints, 0);
  const limitedData = mqttAverage.slice(startingIndex);
  console.log(mqttData);
  /**
   * Display temperature and humidity by recent date 
   */
  var filteredData: any[] = [];
  var hoursAndMinutes: any[] = [];
  if(selectedSegment === "day"){
    // Get current date
    const currentDate = new Date();
    // Filter date to display based on current data
    filteredData = mqttData.filter((data) => {
      const dateObj = new Date(data.datetime);
      return (
        dateObj.getDate() === currentDate.getDate() &&
        dateObj.getMonth() === currentDate.getMonth() &&
        dateObj.getFullYear() === currentDate.getFullYear()
        );
    });
    hoursAndMinutes = filteredData.map((data) => {
      const dateObj = new Date(data.datetime);
      const hours = ('0' + dateObj.getHours()).slice(-2);
      const minutes = ('0' + dateObj.getMinutes()).slice(-2);
      return `${hours}:${minutes}`;
    });
  } else if(selectedSegment === "week" ){

    const desiredDataPoints = 7; // Number of days to display
    const currentDate = new Date(); // Current date
    const startingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - desiredDataPoints + 1); // Calculate the starting date based on the desired number of days
    filteredData = mqttAverage.filter((data) => {
      const itemDate = new Date(data.date);
      return itemDate >= startingDate;
    });
    hoursAndMinutes = filteredData.map((data) => {
      const dateObj = new Date(data.date);
      const year = (dateObj.getFullYear());
      const month = (('0' + (dateObj.getMonth() + 1)).slice(-2));
      const date = (('0' + dateObj.getDate()).slice(-2));
      const hours = ('0' + dateObj.getHours()).slice(-2);
      const minutes = ('0' + dateObj.getMinutes()).slice(-2);
      return `${year}/${month}/${date}`;
    });
  } else{
    const desiredDataPoints = 30; // Number of days to display
    const currentDate = new Date(); // Current date
    const startingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - desiredDataPoints + 1); // Calculate the starting date based on the desired number of days
    filteredData = mqttAverage.filter((data) => {
      const itemDate = new Date(data.date);
      return itemDate >= startingDate;
    });
    hoursAndMinutes = filteredData.map((data) => {
      const dateObj = new Date(data.date);
      const year = (dateObj.getFullYear());
      const month = (('0' + (dateObj.getMonth() + 1)).slice(-2));
      const date = (('0' + dateObj.getDate()).slice(-2));
      const hours = ('0' + dateObj.getHours()).slice(-2);
      const minutes = ('0' + dateObj.getMinutes()).slice(-2);
      return `${year}/${month}/${date}`;
    });
  }
  // Get hours and minutes do x-asix 
  console.log(filteredData.map((mqttData) => mqttData.temperature));
  console.log("filteredData");
  console.log(hoursAndMinutes);
  var tem_graph
  var hum_graph
  if(selectedSegment==="day"){
    tem_graph = filteredData.map((data) => data.temperature)
    hum_graph = filteredData.map((data) => data.humidity)
  }else{
    tem_graph = filteredData.map((data) => data.average_temperature)
    hum_graph = filteredData.map((data) => data.average_humidity)
  }
  console.log(tem_graph);
  console.log(hum_graph);
const perDay = {
    labels: hoursAndMinutes ,
    datasets: [
      {
        label: "Temperature",
        backgroundColor: ["#FF8E8E", "rgba(255,99,132,0.2)", "#FFFFF"],
        borderColor: "rgba(232,84,111,1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(232,99,132,1)",
        data: tem_graph,
        pointStyle: "circle",
        pointRadius: 2,
        pointHoverRadius: 8,
      },
      {
        label: "Humidity",
        yAxisID: "humidity",
        backgroundColor: ["#8E8EFF", "rgba(99,132,255,0.2)", "#FFFFF"],
        borderColor: "rgba(84,111,232,1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(99,132,255,0.4)",
        hoverBorderColor: "rgba(99,132,255,1)",
        data: hum_graph,
        pointStyle: "circle",
        pointRadius: 2,
        pointHoverRadius: 8,
      },
    ],
    
  }

  const plugins_tem_hum:any = {
    beforeDatasetsDraw: (chart:any) =>{
          const {ctx,tooltip,scales:{x,y}, chartArea:{top,bottom}} = chart;
          console.log(chart.tooltip._active);
            if(tooltip._active[0]){
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'grey';
            ctx.moveTo(tooltip._active[0].element.x, top);
            ctx.lineTo(tooltip._active[0].element.x, bottom);
            ctx.stroke();
            ctx.restore();
            }
        },
  }


  // Seperate tempearture and humidity display on right and left 
  const option_tem_hum:any = {
    // tension:0.3,
    // maintainAspectRatio: true,
    responsive: true,
    pointRadius:0,
    pointHoverRadius:7,
    pointHitRadius:10,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        fill: true,
      },
    },
    
    hover: {
      mode: 'index',
      intersect: false,
      fill: true,
    },
    scales: {
      x: {
        ticks: {
          display: selectedSegment, //this will remove only the label
      }
      },
      y: {
        beginAtZero: true,
        position: "left",
        type: "linear",
        display: true,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Temperature",
          font: {
            size: 14,
          },
        },
      },
      humidity: {
        beginAtZero: true,
        position: "right",
        type: "linear",
        display: true,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Humidity",
          font: {
            size: 14,
          },
        },
      },
    },
  }
  return (
      <>
      <IonSegment value={selectedSegment} onIonChange={handleSegmentChange} class='segment-sm'>
      <IonSegmentButton value="day" className='graph_seg_button'>
        <IonLabel className='graph_margin'>Day</IonLabel>
      </IonSegmentButton>
      <IonSegmentButton value="week" className='graph_seg_button'>
        <IonLabel className='graph_margin'>Week</IonLabel>
      </IonSegmentButton>
      <IonSegmentButton value="monthly" className='graph_seg_button'>
        <IonLabel className='graph_margin'>Monthly</IonLabel>
      </IonSegmentButton>
    </IonSegment>
      {selectedSegment === 'day' && (
        <div>
          <p className='ion-text-center'></p>
          <Line id="myChart" data={perDay} options={option_tem_hum} plugins={[plugins_tem_hum]}/>
        </div>
      )}
      {selectedSegment === 'week' && (
        <div>
          {/* <p>This is the content for the 'Week' option.</p> */}
          <Line data={perDay} options={option_tem_hum} plugins={[plugins_tem_hum]}/>
        </div>
      )}
      {selectedSegment === 'monthly' && (
        <div>
          {/* Content for 'Monthly' option */}
          {/* <p>This is the content for the 'Monthly' option.</p> */}
          <Line data={perDay} options={option_tem_hum} plugins={[plugins_tem_hum]}/>
          
        </div>
      )}
      </>
  );
};

export default TemperatureChart;

