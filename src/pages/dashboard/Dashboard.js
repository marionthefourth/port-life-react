import React, {useEffect, useState} from 'react';
import { CzmlDataSource, Viewer } from "resium";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

const styles = {
  logoutBtn: {
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
    left: "2vh",
    top: "8vh",
    zIndex: "900000",
    fontSize: "0.8rem",
    border: "none",
    padding: "0.3rem 0.5rem",
    fontWeight: "bold",
    boxShadow: "3px 5px 8px rgba(0, 0, 0, 0.4)"
  },
  loadCZMLBtn: {
    position: "absolute",
    left: "30vh",
    top: "8vh",
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

              case "Border":
                break;

              case "Date":
                item.label.text = `Date: ${date}`;
                break;

              case "Ship Count":
                var shipCount = "TBD";

                if (shipData) {
                  const bulkCarrierCount = shipData["Carrier Count"]["Bulk Carrier"];
                  const generalCargoCount = shipData["Carrier Count"]["General Cargo"];
                  const containerShipCount = shipData["Carrier Count"]["Container Ship"];

                  shipCount = `${numberWithCommas(bulkCarrierCount + containerShipCount + generalCargoCount)} Ships`;
                } else {

                }

                item.label.text = `Ship Count: ${shipCount}`;
                break;

              case "TEU Capacity":
                var teuValue = "TBD"
                if (shipData) {
                  teuValue = numberWithCommas(shipData["TEU"]);
                } else {
                  
                }

                item.label.text = `TEU Capacity: ${teuValue}`;
                break;

              case "Total Revenue":
                var totalRevenue = "TBD";
                if (shipData) {
                  totalRevenue = `$${numberWithCommas(shipData["Total Revenue"])}`;
                } else {

                }

                item.label.text = `Total Revenue: ${totalRevenue}`;
                break;

              case "Value Per TEU":
                // item.label.text = `Value Per TEU: TBD`
                break;

              case "Condition":
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

              case "Power Output":
                var powerOutput = "TBD"
                if (electricData) {
                  powerOutput = `${electricData.toFixed(2)}MW`;
                } else {

                }
                item.label.text = `Power Output of Port: ${powerOutput}`;
                break;
              case "CO": case "PM2.5": case "PM10": 
              case "NO2": case "SO2": case "O3": case "Primary Value":

                var airMetric = "TBD";

                if (aqData) {
                  const port = getPort(item, aqData);
                  // console.log(port);
                  if (port) {
                    airMetric = port[item.name];
                  }
                } else {

                }

                if (item.name !== "Primary Value") {
                  item.label.text = `${item.name}: ${airMetric}`
                } else {
                  item.label.text = airMetric
                }
                break;   
            
              default:
                break;
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
      <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      <input style={styles.dateInpt} id="dateInput" placeholder='Example Date: 7/9/2022'/>
      <button style={styles.loadCZMLBtn} onClick={loadCZMLFile}>Load CZML</button>
      <div className="resium-wrapper">
        <Viewer full>
          <CzmlDataSource data={czmlData}/>
        </Viewer>
      </div>
    </div>
  );
}
