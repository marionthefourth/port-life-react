import React, {useEffect, useState} from 'react';
import { CzmlDataSource, Viewer } from "resium";
import { useNavigate } from "react-router-dom";
import { v4 } from 'uuid';
import * as Papa from 'papaparse';
import { useCookies } from 'react-cookie';
import { adjustLabel, fixBillboard, fixOutlineWidth, fixPolyline, getAllCSVFiles, getAllCZMLFiles, mergeAirQualityData, processPowerOutputData, processShipData } from '../../services/core';


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

  const coreFile =  require("../../czml/gen_core.czml");
  const coreJSON = require("../../json/gen_data.json")

  function loadCSVData() {   

    JSON.parse(coreJSON)
    fetch(coreJSON).then(response => {
      console.log(response);
    })
    /*
    fetch(coreJSON)
        .then(response => response.json())
        .then(jsonResponse => {
          for (const i in jsonResponse) {
  
            console.log(jsonResponse[i]);
  
          }
          // console.log(jsonResponse)
          setCSVData(jsonResponse);
    });
    */
  }

  useEffect(() => {
    // loadCSVData();
  });

  const logout = async () => {
    removeCookie('userAuthorized');
    window.location.reload(true);
    navigate("/");
  }

  // const file = "../../../gen_core.czml"



  // this requests the file and executes a callback with the parsed result once
  // it is available

  const loadCZMLFile = async () => {

    const inputDate = document.getElementById("dateInput");

    if (inputDate.value) {
      var date = new Date(inputDate.value);
      date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
      console.log(date);
      // getData(date);
      // const jsonData = require("../../czml/gen_core.czml"); 
      // console.log(jsonData);
      // setCZMLData(cur => jsonData).
  
      fetch(coreFile)
        .then(response => response.json())
        .then(jsonResponse => {
          /*
          for (const i in jsonResponse) {
  
            console.log(jsonResponse[i]);
  
          }
          */
          // console.log(jsonResponse)
          setCZMLData(jsonResponse);
        });
    } else {
      fetch(coreFile)
        .then(response => response.json())
        .then(jsonResponse => {
          /*
          for (const i in jsonResponse) {
  
            console.log(jsonResponse[i]);
  
          }
          */
          // console.log(jsonResponse)
          setCZMLData(jsonResponse);
      });
    }

    
  }

  function createCZML(date) {
    
    getAllCZMLFiles().then(function(czmlArray) {
        // console.log(czmlArray[0].toJSON());
        // Parse Files
        const coreCZML = [];
        // const documentHeader = createDocumentHeader();
        const documentHeader = {
            "id": "document",
            "version": "1.0"
        }
        coreCZML.push(documentHeader);

        const czmlKeys = {}

        for (const i in czmlArray) {

            const czml = JSON.parse(czmlArray[i].toString());

            const header = czml.shift();
            const name = header.id;
            
            const grandKey = name + " Data";
            
            // const category = createGrand(grandKey);
            const category = {
                "id": v4(),
                "name": grandKey 
            }
            const id = category.id;
            coreCZML.push(category);

            czmlKeys[name] = {
                "id": id,
            }

            for (const z in czml) {
                
                const item = czml[z];

                adjustLabel(item);
                fixOutlineWidth(item);

                switch (name) {
                    case "Electrical":
                        if (item.name) {
                            czmlKeys[name][item.name] = item.id
                        }

                        item["parent"] = category.id;
                        break;
                    case "Financial":

                        if (item.name) {
                            czmlKeys[name][item.name] = item.id
                        }

                        item["parent"] = category.id;

                        switch (item.name) {
                            case "Border":
                                break;
                            case "Date":
                                // item.label.text = `Date: XX/XX/XXXX`
                                break;
                            case "Ship Type":
                                break;
                            case "TEU Capacity":
                                //item.label.text = `TEU Capacity: TBD`
                                break;
                            case "Total Revenue":
                                // item.label.text = `Total Revenue: TBD`
                                break;
                            case "Value Per TEU":
                                // item.label.text = `Value Per TEU: TBD`
                                break;
                        }
                        break;
                    case "Air Quality":
                        // Need to capture
                        if (item.id !== "Port Name" && item.id.includes("Port")) {

                            // const port = createParent(item.name, id);
                            const port = {
                                "id": v4(),
                                "parent": id,
                                "name": item.name,
                            }

                            if (czmlKeys[name]["ports"]) {
                                czmlKeys[name]["ports"].push({"id": port.id})
                            } else {
                                czmlKeys[name]["ports"] = [{"id": port.id}]
                            }

                        } else {

                            const portIndex = parseInt(item.parent.split(" ")[1]) - 1;
                            const parentID = czmlKeys[name]["ports"][portIndex].id;
                            item.parent = parentID;

                            switch (item.name) {
                                case "Pin":
                                    break;
                                case "Port Name":
                                    break;
                                case "Ranges":
                                    break;
                                case "Condition":
                                    break;
                                default:
                                    const itemName = item.name.split(" ");
                                    if (itemName[1] === "Value") {
                                        var value = "TBD"
                                        switch (itemName[0]) {
                                            case "CO":
                                                break;
                                            case "PM2.5": case "Primary":
                                                break;
                                            case "PM10":
                                                break;
                                            case "NO2":
                                                break;
                                            case "SO2":
                                                break;
                                            case "O3":
                                                break; 
                                        }

                                        // item.label.text = value;
                                    }
                            }

                            czmlKeys[name]['ports'][portIndex][item.name] = item.id;

                            break;

                        }
                        switch (item.name) {
                            case "Xiamen":
                            case "Hongwen, Xiamen":
                            case "Gulangyu, Xiamen":
                                // const parent = createParent(item.name, id);
                                const parent = {
                                    "id": v4(),
                                    "parent": id,
                                    "name": item.name,
                                }
                                item.parent = id;
                                item.id = parent.id;
                                
                                break;
                            default:
                                
                        }
                        break;
                    case "Electrical Grid":
                        if (item.name) {
                            // item["parent"] = category.id;
                            if (item.parent === czmlKeys[name].id) {
                                // One of the Parents, not Children
                                czmlKeys[name][item.name] = {
                                    "id": item.id,
                                    "items": []
                                }
                            }
                        } else {
                            for (const key in czmlKeys[name]) {
                                // On of the children
                                const parent = czmlKeys[name][key];
                                // console.log(parent);
                                if (item.parent === parent.id) {
                                    parent.items.push(item.id);
                                }
                            }
                        }

                        fixBillboard(item);
                        fixPolyline(item);

                        switch (item.name) {
                            case "Power Lines":
                                break;
                            case "Power Line Cranes":
                                break;
                            case "Power Line Columns":
                                
                                
                                break;
                            default:
                                break;
                        }
                        break;
                }

                coreCZML.push(item);
            }
        }

        console.log(czmlKeys);

        setCZMLData(cur => coreCZML)
        
    }, function(err) {
        // an error occurre
        console.log(err);
    });
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
      <input style={styles.dateInpt} id="dateInput" placeholder='Example Date: 7/9/2022'/>
      <button style={styles.loadCZMLBtn} onClick={loadCZMLFile}>Load CZML</button>
      <div className="resium-wrapper">
        <Viewer full>
          <CzmlDataSource data={czmlData}/>
        </Viewer>
      </div>
    </>
  );
}
