import { createDocumentHeader, createGrand, createParent, ElectricalGridCZMLParentKeys, FinancialCZMLKeys, CZMLKeys, AirQualityCZMLParentKeys, AirQualityCZMLKeys, AirQualityMetricKeys, createChild } from "./types";

const Papa = require('papaparse');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

const czmlRoot = "backend/czml"
const csvRoot = "backend/csvs"

const czmlFiles = {
    "Financial Data":       `${czmlRoot}/financial.czml`,
    "Air Quality Data":     `${czmlRoot}/air_quality.czml`,
    // "Electrical Grid":   `${root}/electrical_grid.czml`,
    "Electrical Data":      `${czmlRoot}/electrical.czml`
}

const airQualityCSVFiles = {
    "Xiamen":   `${csvRoot}/xiamen_aq.csv`,
    "Hongwen":  `${csvRoot}/hongwen_aq.csv`,
    "Gulangya": `${csvRoot}/gulangya_aq.csv`,
}

const marineTrafficCSVFiles = {
    "Marine Traffic": `${csvRoot}/marine_traffic.csv`
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

function getAllCSVFiles() {
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

    return Promise.all(files);
}

function dynamicImport(item, id) {
    var obj;
    if (id === 1) {
        obj = {
            "PM2.5": item["pm25"],
            "PM10": item["pm10"],
            "CO": item["co"],
            "SO2": item["so2"],
            "NO2": item["no2"],
            "O3": item["o3"],
        }
    } else {
        obj = {
            "Date": item["Day of Arrival"],
            "Vessel Type": item["Vessel Type - Detailed"],
            "TEU": item["Capacity - Teu"],
            "Value Per TEU": item["$ Value"],
            "Total Revenue": item["Revenue per Ship"]
        }
    }
    
    return obj;
}

export function loadCSV() {
    const file_node = fs.createReadStream('../csvs/aq.csv');
    var aqData = {}
    var marineData = {};

    Papa.parse(file_node, {
        header: true,
        dynamicTyping: true,
        complete: function (results_node) {
            const promises = [];
            console.log("---------------")
            console.log("AQ File")
            for (let i = 0; i < results_node.data.length; ++i) {
                //console.log("In the read loop: " + results_node.data[i]);
                console.log
                const item = results_node.data[i]
                aqData[item['date']] = dynamicImport(item, 1);
                promises.push(dynamicImport(results_node.data[i], 1));
                // promises.push(import_item(results_node.data[i]));
            }

            Promise.all(promises).then((results) => {
                console.log("All done", results);
            })
        }
    });
}

export function pushCSVintoCZML(date: string) {    

    getAllCSVFiles().then((csvFiles) => {

        let [xiamen, hongwen, gulangya, marineTraffic] = csvFiles;

        var airQuality = {};
        const sensors = [xiamen, hongwen, gulangya];
        for (const sensorIndex in sensors) {
            mergeAirQualityData(airQuality, sensors[sensorIndex], sensorIndex);
        }
        // console.log(xiamen);
        console.log(airQuality);

        // createCZML(date, airQuality, marineTraffic);
    }).catch(err => {
        console.log(err);
    });
}

export function mergeAirQualityData(superSet, minorSet, sensorIndex) {

    var sensorKeys = {
        0: "Xiamen",
        1: "Hongwen",
        2: "Gulangya"
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

    console.log(`~~~~${sensorKey}~~~~`)
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

                console.log(`${elementKey} (${index}) | ${value}`);

                if (index === 0) {
                    date = value;
                    if (superSet[date]) {
                        // superSet[date][sensorKey] = {}
                    } else {
                        superSet[date] = {
                            [sensorKey]: {}
                        }
                    }
                    // console.log(superSet);
                } else {
                    superSet[date][sensorKey][elementKey] = value;
                }
                
            }
        }

    }
    
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

                if (item.label) {
                    item.label.scale = "0.5";
                    // item.label.horizontalOrigin = "RIGHT";
                    item.label.showBackground = true;
                    item.label.verticalOrigin = "CENTER";
                }

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

// pushCSVintoCZML("")
createCZML("", "", "");