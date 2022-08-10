import * as fs from 'fs';
var Promise = require('bluebird');

//var fs = Promise.promisifyAll(require('fs'));

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

function getFile(fileName) {
    return fs.readFileAsync(fileName);
}

export function getAllCZMLFiles() {
    var promises = [];

    for (const key in czmlFiles) {
        promises.push(getFile(czmlFiles[key]));
    }

    // return promise that is resolved when all .czml files are done loading
    return Promise.all(promises);
}

function getAllCSVUrls() {
    const urls = []

    for (const key in airQualityCSVFiles) {
        urls.push(airQualityCSVFiles[key]);
    }

    for (const key in marineTrafficCSVFiles) {
        urls.push(marineTrafficCSVFiles[key]);
    }

    for (const key in powerOutputCSVFiles) {
        urls.push(powerOutputCSVFiles[key]);
    }

    for (const key in futureAirQualityCSVFiles) {
        urls.push(futureAirQualityCSVFiles[key]);
    }

    for (const key in futurePowerOutputFiles) {
        urls.push(futurePowerOutputFiles[key]);
    }

    return urls;
}

export function altGetAllCSVFiles() {
    return Promise.all(getAllCSVUrls().map(u=>fetch(u)));
}

export function getAllCSVFiles() {
    const files = []

    // Reading file
    let readFile = (filename) =>{
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
                        date = value;
                        date = new Date(date);
                        date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
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
                var date = breakdown[0];
                date = new Date(date);
                date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
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
                    date = value;
                    date = new Date(date);
                    date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
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

export function fixBillboard(item) {
    if (item["billboard"]) {
        if (item["billboard"]["width"]) {
            item.billboard.width = parseFloat(item.billboard.width);
        }
        if (item["billboard"]["height"]) {
            item.billboard.height = parseFloat(item.billboard.height);
        }
    }
}

export function fixPolyline(item) {
    if (item["polyline"]) {
        if (item["polyline"]["width"]) {
            item.polyline.width = parseFloat(item.polyline.width);
        }
    }
}

export function fixOutlineWidth(item) {
    if (item["label"]) {
        if (item["label"]["outlineWidth"]) {
            item.label.outlineWidth = parseInt(item.label.outlineWidth)
        }
    }
}

export function adjustLabel(item) {
    if (item.label) {
        item.label.scale = "0.5";
        // item.label.horizontalOrigin = "RIGHT";
        item.label.showBackground = true;
        item.label.verticalOrigin = "CENTER";
    }
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

// loadCSVData("")
//createCZML("", "", "");