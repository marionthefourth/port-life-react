import React, {useEffect, useState} from 'react';
import { CzmlDataSource, Viewer } from "resium";
import { useNavigate } from "react-router-dom";

import { useCookies } from 'react-cookie';

const styles = {
  logoutBtn: {
    position: "absolute",
    left: "57vh",
    top: "2vh",
    zIndex: "900000",
    textTransform: "uppercase",
    fontSize: "0.8rem",
    border: "none",
    padding: "0.3rem 0.5rem",
    fontWeight: "bold",
    boxShadow: "3px 5px 8px rgba(0, 0, 0, 0.4)"
  },
  loadVizBtn: {
    position: "absolute",
    left: "2vh",
    top: "2vh",
    zIndex: "900000",
    textTransform: "uppercase",
    fontSize: "0.8rem",
    border: "none",
    padding: "0.3rem 0.5rem",
    fontWeight: "bold",
    boxShadow: "3px 5px 8px rgba(0, 0, 0, 0.4)"
  },
  dateInpt: {
    position: "absolute",
    left: "24vh",
    top: "2vh",
    zIndex: "900000",
    fontSize: "0.8rem",
    border: "none",
    padding: "0.3rem 0.5rem",
    fontWeight: "bold",
    boxShadow: "3px 5px 8px rgba(0, 0, 0, 0.4)"
  },
  loadCZMLBtn: {
    position: "absolute",
    left: "44vh",
    top: "2vh",
    zIndex: "900000",
    textTransform: "uppercase",
    fontSize: "0.8rem",
    border: "none",
    padding: "0.3rem 0.5rem",
    fontWeight: "bold",
    boxShadow: "3px 5px 8px rgba(0, 0, 0, 0.4)"
  }
};

export function Dashboard() {
  const [cookies, setCookie, removeCookie] = useCookies(['userAuthorized']);
  const [czmlData, setCZMLData] = useState([]);
  const [csvData, setCSVData] = useState({});

  const navigate = useNavigate();

  const coreFile =  require("../../czml/port-life.czml");
  const coreJSON = require("../../json/dataset.json");

  function loadCSVData() {
    const url = "https://raw.githubusercontent.com/marionthefourth/port-life-react/merging-and-displaying-czml/src/json/dataset.json";

    fetch(url).then(response => response.json()).then(jsonResponse => {
      setCSVData(jsonResponse)
    });
  }

  useEffect(() => {
    loadCSVData();
  });

  const logout = async () => {
    removeCookie('userAuthorized');
    window.location.reload(true);
    navigate("/");
  }

  function loadViz() {
    navigate("/viz");
  }

  function getFormattedDate(dateValue) {
    const dateFormat = new Date(dateValue);
    return `${dateFormat.getMonth()+1}/${dateFormat.getDate()}/${dateFormat.getFullYear()}`;
  }

  function numberWithCommas(numberValue) {
    return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function getPort(item, dataSet) {
    switch (item.parent) {
      case "3393649e-7b0b-4d38-a3db-f60a83e0e7fc":
        if (dataSet["Xiamen"]){
          return dataSet["Xiamen"];
        }
        break;
      case "2ba68fae-48e7-4c04-9aae-dee6bf0db091":
        if (dataSet["Hongwen"]){
          return dataSet["Hongwen"];
        }
        break;
      case "34edb0f3-6457-4a1e-a9a3-e9c5620a8294":
        if (dataSet["Gulangyu"]){
          return dataSet["Gulangyu"];
        }
        break;
      default:
        return undefined;
    }
  }

  function getPortName(item, dataSet) {
    switch (item.parent) {
      case "3393649e-7b0b-4d38-a3db-f60a83e0e7fc":
        return "Xiamen";
      case "2ba68fae-48e7-4c04-9aae-dee6bf0db091":
        return "Hongwen, Xiamen";
      case "34edb0f3-6457-4a1e-a9a3-e9c5620a8294":
        return "Gulangyu, Xiamen";
      default:
        return undefined;
    }
  }

  function printReceivedData(shipData, aqData, electricData) {
    console.log("Ship Data");
    console.log(shipData);
    console.log("--------");
    console.log("AQ Data");
    console.log(aqData);
    console.log("-------");
    console.log("Electric Data");
    console.log(electricData);
    console.log("-------");
  }

  const loadCZMLFile = async () => {

    const inputDate = document.getElementById("dateInput");

    if (inputDate.value) {

      const date = getFormattedDate(inputDate.value);
      console.log(date);

      fetch(coreFile).then(response => response.json()).then(jsonResponse => {

        setCSVData(csv => {

          var shipData = csv["Ship Data"][date];
          var aqData = csv["Air Quality"][date];
          var electricData = csv["Power Output"][date];

          // printReceivedData(shipData, aqData, electricData);

          if (!shipData) {
            console.log("Financial/Ship Data Generated");
          }

          if (!aqData) {
            console.log("Air Quality Data Generated");
          }

          if (!electricData) {
            console.log("Electric Data Generated");
          }

          for (const z in jsonResponse) {

            const item = jsonResponse[z];

            switch (item.name) {

              case "Financial/Ship Information":

                var teuValue = 0;
                var shipCount = 0;
                var totalRevenue = 0;
                var bulkCarrierCount = 0;
                var generalCargoCount = 0;
                var containerShipCount = 0;

                if (shipData) {
                  bulkCarrierCount = shipData["Carrier Count"]["Bulk Carrier"];
                  generalCargoCount = shipData["Carrier Count"]["General Cargo"];
                  containerShipCount = shipData["Carrier Count"]["Container Ship"];
                } else {

                }

                teuValue = numberWithCommas(shipData["TEU"]);
                totalRevenue = `$${numberWithCommas(shipData["Total Revenue"])}`;
                shipCount = `${numberWithCommas(bulkCarrierCount + containerShipCount + generalCargoCount)} Ships`;

                const valuePerTEUText = `TEU Value: $500`;
                const shipCountText = `Ship Count: ${shipCount}`;
                const teuCapacityText = `TEU Capacity: ${teuValue}`;
                const totalRevenueText = `Total Revenue: ${totalRevenue}`;

                // "\nShip count: 25 ships\nTEU Capacity: 1028\nTEU Value: $500\nRevenue: $514,000\n",
                item.label.text = `\n${shipCountText}\n${teuCapacityText}\n${valuePerTEUText}\n${totalRevenueText}\n`;
                break;

              case "Gulangyu Sensor Air Quality":
              case "Xiamen Sensor Air Quality":
              case "Hongwen Sensor Air Quality":

                var sensorName = "TBD";
                var pm25 = "TBD";
                var pm10 = "TBD";
                var o3 = "TBD";
                var so2 = "TBD";
                var co = "TBD";

                if (aqData) {

                  const port = getPort(item, aqData);
                  
                  if (port) {
                    sensorName = getPortName(item, aqData);
                    pm25 = port["PM2.5"];
                    pm10 = port["PM10"];
                    o3 = port["O3"];
                    so2 = port["SO2"];
                    co = port["CO"];
                  }

                } else {

                }

                const pm25Text = `PM2.5: ${pm25}`;
                const pm10Text = `PM10: ${pm10}`;
                const o3Text = `O3: ${o3}`;
                const so2Text = `SO2: ${so2}`;
                const coText = `CO: ${co}`;

                // "\nGulangyu, Xiamen\nPM2.5: 30\nPM10: 10\nO3: 11\nNO2: 3\nSO2: 5\nCO: 3\n",
                item.label.text = `\n${sensorName}\n${pm25Text}\n${pm10Text}\n${o3Text}\n${so2Text}\n${coText}\n`

                break;
              case "Power Output":
                var powerOutput = "TBD"
                if (electricData) {
                  powerOutput = `${electricData.toFixed(2)}MW`;
                } else {

                }
                item.label.text = `Power Output of Port: ${powerOutput}`;
                break;
                          
              default:
                /*
                if (item.name.includes("Condition")) {
                  var condition = "TBD";

                  if (aqData) {
                    const port = getPort(item, aqData);
  
                    if (port) {
                      condition = port[item.name];
  
                      var conditionColor;
  
                      switch (condition) {
  
                        case "Good":
                          conditionColor = [0.19999999999999996, 1, 0.2970833333333335, 1];
                          break;
  
                        case "Moderate":
                          conditionColor = [1,0.6554322916666666,0.08999999999999997,1];
                          break;
  
                        case "Unhealthy":
                          conditionColor = [1,0,0,1];
                          break;
  
                      }
  
                      item.label.fillColor.rgbaf = conditionColor;
                    }
                  } else {
  
                  }
  
                  item.label.text = condition;
  
                  break;
                }
                */
                
            }
          }
          setCZMLData(jsonResponse);
        });  
      });
    } else {
      fetch(coreFile)
        .then(response => response.json())
        .then(jsonResponse => {
          setCZMLData(jsonResponse);
      });
    }
  }

  return(
    <div>
      <div className="button wrapper">
        <button style={styles.loadVizBtn} onClick={loadViz}>Display Data Charts</button>
        <input style={styles.dateInpt} id="dateInput" placeholder='Example Date: 7/9/2022'/>
        <button style={styles.loadCZMLBtn} onClick={loadCZMLFile}>Load CZML</button>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>
      <div className="resium-wrapper">
        <Viewer full>
          <CzmlDataSource data={czmlData}/>
          
        </Viewer>
      </div>
    </div>
  );
}
