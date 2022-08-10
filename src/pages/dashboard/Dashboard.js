import React, {useEffect, useState} from 'react';
import { CzmlDataSource, Viewer } from "resium";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { getAllCSVFiles, mergeAirQualityData, processPowerOutputData, processShipData } from '../../services/core';


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

  function loadCSVData() {    

    getAllCSVFiles().then((csvFiles) => {

        let [
            xiamen, hongwen, gulangyu, marineTraffic, powerOutput, 
            futureXiamen, futureHongwen, futureGulangyu, futurePowerOutput
        ] = csvFiles;

        // Process Air Quality Data
        var airQuality = {};
        
        const sensors = [xiamen, hongwen, gulangyu];
        
        for (const sensorIndex in sensors) {
            mergeAirQualityData(airQuality, sensors[sensorIndex], sensorIndex);
        }

        // console.log(airQuality);

        // Process Ship Data

        var shipData = processShipData(marineTraffic);

        // console.log(shipData);

        var powerData = processPowerOutputData(powerOutput);

        var data = {
          "Air Quality": airQuality,
          "Ship Data": shipData,
          "Power Output": powerData
        }

        console.log(data)
        // console.log(powerData);
        setCSVData(cur => data)
        // createCZML(date, airQuality, marineTraffic);
    }).catch(err => {
        console.log(err);
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

  // const file = "../../../gen_core.czml"

  const coreFile =  require("../../czml/gen_core.czml");

  // this requests the file and executes a callback with the parsed result once
  // it is available

  const loadCZMLFile = async () => {

    const inputDate = document.getElementById("dateInput");

    if (inputDate) {
      const date = inputDate.value;
      console.log(date);
      getData(date);
      // const jsonData = require("../../czml/gen_core.czml"); 
      // console.log(jsonData);
      // setCZMLData(cur => jsonData).
  
      fetch(coreFile)
        .then(response => response.json())
        .then(jsonResponse => {
          for (const i in jsonResponse) {
  
            console.log(jsonResponse[i]);
  
          }
          // console.log(jsonResponse)
          setCZMLData(jsonResponse);
        });
    }

    
  }

  function getData(date) {
    if (csvData) {
      const airQualityData = csvData["Air Quality"][date];
      const shipData = csvData["Ship Data"][date];
      const powerOutput = csvData["Power Output"][date];

      console.log(airQualityData);
      console.log(shipData);
      console.log(powerOutput);
    }
  }

  return(
    <>
      <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      <input style={styles.dateInpt} id="dateInput"/>
      <button style={styles.loadCZMLBtn} onClick={loadCZMLFile}>Load CZML</button>
      <div className="resium-wrapper">
        <Viewer full>
          <CzmlDataSource data={czmlData}/>
        </Viewer>
      </div>
    </>
  );
}
