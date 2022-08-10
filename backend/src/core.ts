import { createDocumentHeader, createGrand, createParent, ElectricalGridCZMLParentKeys, FinancialCZMLKeys, CZMLKeys, AirQualityCZMLParentKeys, AirQualityCZMLKeys, AirQualityMetricKeys, createChild } from "./types";

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

const czmlRoot = "backend/czml"
const actualCSVRoot = "backend/csvs/actual"
const futureCSVRoot = "backend/csvs/future"

const czmlFiles = {
    "Financial Data":       `${czmlRoot}/financial.czml`,
    "Air Quality Data":     `${czmlRoot}/air_quality.czml`,
    "Electrical Grid":      `${czmlRoot}/electrical_grid.czml`,
    "Electrical Data":      `${czmlRoot}/electrical.czml`
}

const airQualityCSVFiles = {
    "Xiamen":   `${actualCSVRoot}/xiamen_aq.csv`,
    "Hongwen":  `${actualCSVRoot}/hongwen_aq.csv`,
    "Gulangyu": `${actualCSVRoot}/gulangyu_aq.csv`,
}

const marineTrafficCSVFiles = {
    "Marine Traffic": `${actualCSVRoot}/marine_traffic.csv`
}

const powerOutputCSVFiles = {
    "Power Output": `${actualCSVRoot}/power_output.csv`
}

const futureAirQualityCSVFiles = {
    "Xiamen":   `${futureCSVRoot}/future_xiamen_aq.csv`,
    "Hongwen":  `${futureCSVRoot}/future_hongwen_aq.csv`,
    "Gulangyu": `${futureCSVRoot}/future_gulangyu_aq.csv`
}

const futurePowerOutputFiles = {
    "Power Output":   `${futureCSVRoot}/future_power_output.csv`,
}

function getFile(fileName: string) {
    return fs.readFileAsync(fileName);
}

function getAllCZMLFiles() {
    var promises = [];

    for (const key in czmlFiles) {
        promises.push(getFile(czmlFiles[key]));
    }

    // return promise that is resolved when all .czml files are done loading
    return Promise.all(promises);
}

export function getAllCSVFiles() {
    const files = []

    // Reading file
    let readFile =(filename)=>{
        return new Promise(function(resolve, reject){
            fs.readFile(filename, 'utf8', function(err, data){
                if(err){
                    reject(err)
                }else{
                    resolve(data)
                }
            });
        });
    }

    for (const key in airQualityCSVFiles) {
        files.push(readFile(airQualityCSVFiles[key]));
    }

    for (const key in marineTrafficCSVFiles) {
        files.push(readFile(marineTrafficCSVFiles[key]));
    }

    for (const key in powerOutputCSVFiles) {
        files.push(readFile(powerOutputCSVFiles[key]));
    }

    for (const key in futureAirQualityCSVFiles) {
        files.push(readFile(futureAirQualityCSVFiles[key]));
    }

    for (const key in futurePowerOutputFiles) {
        files.push(readFile(futurePowerOutputFiles[key]));
    }

    return Promise.all(files);
}

export function processShipData(shipData) {
    const marineTraffic = {}

    const elementKeys = {
        0: "Vessel Name",
        1: "Day of Arrival",
        2: "Time of Arrival",
        3: "Voyage Origin Port",
        4: "Origin Port Country",
        5: "Voyage Time Underway",
        6: "Voyage Distance Travelled",
        7: "Leg Time Underway",
        8: "Leg Distance Travelled",
        9: "Load Condition",
        10: "Voyage Origin Port Atd",
        11: "Vessel Type - Generic",
        12: "Vessel Type - Detailed",
        13: "Commercial Market",
        14: "Commercial Size Class",
        15: "Capacity - Dwt",
        16: "Capacity - Teu",
        17: "$ Value",
        18: "Revenue per Ship"
    }

    var set = shipData.split('\n');

    for (const part in set) {
        const line = set[part].split("\r")[0];
        // console.log(line);
        if (line.includes("Day of Arrival")) {

        } else {
            const breakdown = line.split(",");
            
            var date = "";
            var vesselName = "";
            for (const sIndex in breakdown) {

                const index = parseInt(sIndex);
                const value = breakdown[index];
                const elementKey = elementKeys[index];

                // console.log(`${elementKey} (${index}) | ${value}`);
                switch (index) {
                    case 0:
                        vesselName = value;
                        break;
                    case 1:
                        date = standardizeDate(value)
                        if (marineTraffic[date]) {
                            // superSet[date][sensorKey] = {}
                        } else {
                            marineTraffic[date] = {
                                "Carrier Count": {
                                    "Bulk Carrier": 0,
                                    "Container Ship": 0,
                                    "General Cargo": 0
                                },
                                "TEU": 0,
    
                                "Total Revenue": 0
                            }
                        }
                        break;
                    case 12:
                        marineTraffic[date]["Carrier Count"][value] += 1
                        break;
                    case 16:
                        const teu = parseInt(value)
                        marineTraffic[date]["TEU"] += teu;
                        marineTraffic[date]["Total Revenue"] += teu * 500;
                        break;
                    
                }
                
            }
        }
    }

    return marineTraffic;

}

export function processPowerOutputData(outputData) {
    const powerOutput = {}
    const elementKeys = {
        0: "Date",
        1: "Time at Berth",
        2: "TEU",
        3: "Crane KW",
        4: "Port KW - added shore power"
    }

    var set = outputData.split('\n');

    for (const part in set) {
        const line = set[part].split("\r")[0];
        // console.log(line);
        if (line.includes("Date")) {

        } else {
            const breakdown = line.split(",");
            if (breakdown[4] && breakdown[0]) {
                const date = standardizeDate(breakdown[0]);
                powerOutput[date] = {
                    "Output": parseFloat(breakdown[4])
                }
            }
            
        }
    }

    return powerOutput;

}

export function mergeAirQualityData(superSet, minorSet, sensorIndex) {

    var sensorKeys = {
        0: "Xiamen",
        1: "Hongwen",
        2: "Gulangyu"
    }

    var elementKeys = {
        0: "Date",
        1: "Primary Value",
        2: "Conditon",
        3: "PM2.5",
        4: "PM10",
        5: "O3",
        6: "NO2",
        7: "SO2",
        8: "CO"
    }

    var set = minorSet.split('\n');

    const sensorKey = sensorKeys[sensorIndex]

    // console.log(`~~~~${sensorKey}~~~~`)
    // console.log(set1)
    for (const part in set) {
        const line = set[part].split("\r")[0];
        // console.log(line);
        if (line.includes("Date")) {
            // Skip
        } else {
            const breakdown = line.split(",");
            
            var date = "";
            for (const sIndex in breakdown) {

                const index = parseInt(sIndex);
                const value = breakdown[index];
                const elementKey = elementKeys[index];

                // console.log(`${elementKey} (${index}) | ${value}`);

                if (index === 0) {
                    date = standardizeDate(value);
                    if (superSet[date]) {
                        superSet[date][sensorKey] = {}
                    } else {
                        superSet[date] = {
                            [sensorKey]: {}
                        }
                    }
                    // console.log(superSet);
                } else {
                    // console.log(superSet[date])
                    superSet[date][sensorKey][elementKey] = value;
                }
                
            }
        }

    }
    
}

function fixBillboard(item) {
    if (item["billboard"]) {
        if (item["billboard"]["width"]) {
            item.billboard.width = parseFloat(item.billboard.width);
        }
        if (item["billboard"]["height"]) {
            item.billboard.height = parseFloat(item.billboard.height);
        }
    }
}

function fixPolyline(item) {
    if (item["polyline"]) {
        if (item["polyline"]["width"]) {
            item.polyline.width = parseFloat(item.polyline.width);
        }
    }
}

function fixOutlineWidth(item) {
    if (item["label"]) {
        if (item["label"]["outlineWidth"]) {
            item.label.outlineWidth = parseInt(item.label.outlineWidth)
        }
    }
}

function adjustLabel(item) {
    if (item.label) {
        item.label.scale = "0.5";
        // item.label.horizontalOrigin = "RIGHT";
        item.label.showBackground = true;
        item.label.verticalOrigin = "CENTER";
    }
}

function loadCSV() {
    getAllCSVFiles().then((csvFiles) => {

        let [
            xiamen, hongwen, gulangyu, marineTraffic, powerOutput, 
            futureXiamen, futureHongwen, futureGulangyu, futurePowerOutput
        ] = csvFiles;
        
        // Process Air Quality Data
        var airQuality = {};
        
        const sensors = [xiamen, hongwen, gulangyu];

        console.log(sensors)
        
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

        createDataFile(data);
        // console.log(powerData);
        // createCZML(date, airQuality, marineTraffic);
    }).catch(err => {
        console.log(err);
    });
}

export function createCZML(date: string, airQuality, marineTraffic) {
    
    getAllCZMLFiles().then(function(czmlArray) {
        // console.log(czmlArray[0].toJSON());
        // Parse Files
        const coreCZML = [];
        const documentHeader = createDocumentHeader();
        coreCZML.push(documentHeader);

        const czmlKeys = {}

        for (const i in czmlArray) {

            const czml = JSON.parse(czmlArray[i].toString());

            const header = czml.shift();
            const name = header.id as CZMLKeys;
            
            const grandKey = name + " Data";
            
            const category = createGrand(grandKey);
            const id = category.id;
            coreCZML.push(category);

            czmlKeys[name] = {
                "id": id,
            }

            for (const z in czml) {
                
                const item = czml[z];

                adjustLabel(item);
                fixOutlineWidth(item);

                switch (name as CZMLKeys) {
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

                        switch (item.name as FinancialCZMLKeys) {
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

                            const port = createParent(item.name, id);

                            if (czmlKeys[name]["ports"]) {
                                czmlKeys[name]["ports"].push({"id": port.id})
                            } else {
                                czmlKeys[name]["ports"] = [{"id": port.id}]
                            }

                        } else {

                            const portIndex = parseInt(item.parent.split(" ")[1]) - 1;
                            const parentID = czmlKeys[name]["ports"][portIndex].id;
                            item.parent = parentID;

                            switch (item.name as AirQualityCZMLKeys) {
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
                                        switch (itemName[0] as AirQualityMetricKeys) {
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
                        switch (item.name as AirQualityCZMLParentKeys) {
                            case "Xiamen":
                            case "Hongwen, Xiamen":
                            case "Gulangyu, Xiamen":
                                const parent = createParent(item.name, id);
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

                        switch (item.name as ElectricalGridCZMLParentKeys) {
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

        createCoreFile(coreCZML);
        
    }, function(err) {
        // an error occurre
        console.log(err);
    });
}

function standardizeDate(date) {
    var standardize = date;
    standardize = new Date(date);
    standardize = `${standardize.getMonth()+1}/${standardize.getDate()}/${standardize.getFullYear()}`
    return standardize
}

function createCoreFile(czmlData) {
    // console.log(czml);

    var dictstring = JSON.stringify(czmlData);
    var fs = require('fs');
    fs.writeFile("gen_core.czml", dictstring, (err) => {
        if (err) {
            console.log(err)
        }
    });
}

function createDataFile(csvData) {
    var dictstring = JSON.stringify(csvData);
    var fs = require('fs');
    fs.writeFile("gen_data.json", dictstring, (err) => {
        if (err) {
            console.log(err)
        }
    });
}


loadCSV()
// loadCSVData("")
//createCZML("", "", "");