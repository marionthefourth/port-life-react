const actualCSVRoot = "backend/csvs/actual"
const fullAirQualityRoot = "backend/csvs/full"
const futureCSVRoot = "backend/csvs/future"

const xiamenFilename = "xiamen_aq";
const hongwenFilename = "hongwen_aq";
const gulangyuFilename = "gulangyu_aq";

const fullPrefix = "full_";
const futurePrefix = "future_";

const csvFileExtension = "csv";

const airQualityCSVFiles = {
    "Xiamen":   `${fullAirQualityRoot}/${fullPrefix}${xiamenFilename}.${csvFileExtension}`,
    "Hongwen":  `${fullAirQualityRoot}/${fullPrefix}${hongwenFilename}.${csvFileExtension}`,
    "Gulangyu": `${fullAirQualityRoot}/${fullPrefix}${gulangyuFilename}.${csvFileExtension}`,
}

const marineTrafficCSVFiles = {
    "Marine Traffic": `${actualCSVRoot}/marine_traffic.${csvFileExtension}`
}

const powerOutputCSVFiles = {
    "Power Output": `${actualCSVRoot}/power_output.${csvFileExtension}`
}

const futureAirQualityCSVFiles = {
    "Xiamen":   `${futureCSVRoot}/${futurePrefix}${xiamenFilename}.${csvFileExtension}`,
    "Hongwen":  `${futureCSVRoot}/${futurePrefix}${hongwenFilename}.${csvFileExtension}`,
    "Gulangyu": `${futureCSVRoot}/${futurePrefix}${gulangyuFilename}.${csvFileExtension}`,
}

const futurePowerOutputFiles = {
    "Power Output":   `${futureCSVRoot}/${futurePrefix}power_output.${csvFileExtension}`,
}

// Parse Category Files

function parseShipData(shipData) {
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

function parsePowerOutputData(outputData) {
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
                powerOutput[date] = parseFloat(breakdown[4]);
            }
            
        }
    }

    return powerOutput;

}

function parseAirQualityData(superSet, minorSet, sensorIndex) {

    var sensorKeys = {
        0: "Xiamen",
        1: "Hongwen",
        2: "Gulangyu"
    }

    var elementKeys = {
        0: "Date",
        1: "PM2.5",
        2: "PM10",
        3: "O3",
        4: "NO2",
        5: "SO2",
        6: "CO"
    }

    var set = minorSet.split('\n');

    const sensorKey = sensorKeys[sensorIndex]

    // console.log(`~~~~${sensorKey}~~~~`)
    // console.log(set1)
    for (const part in set) {
        const line = set[part].split("\r")[0];
        // console.log(line);
        if (line.includes("date")) {
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
                } else if (index === 1) { 
                    const primaryValue = value;
                    
                    
                    var condition = "";

                    if (value < 51) {
                        condition = "Good"
                    } else if (value < 101) {
                        condition = "Moderate"
                    } else {
                        condition = "Unhealthy"
                    }

                    superSet[date][sensorKey]["Condition"] = condition;
                    superSet[date][sensorKey][elementKey] = primaryValue;

                } else if (index > 1) {
                    // console.log(superSet[date])
                    superSet[date][sensorKey][elementKey] = value;
                }
                
            }
        }

    }
    
}

// Main Functions

function getAllCSVFiles() {

    const files = []

    var Promise = require('bluebird');
    var fs = Promise.promisifyAll(require('fs'));

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

    const sources = [
        airQualityCSVFiles, marineTrafficCSVFiles, powerOutputCSVFiles, 
        futureAirQualityCSVFiles, futurePowerOutputFiles
    ];

    sources.map( (source) => {
        for (const key in source) {
            files.push(readFile(source[key]));
        }
    });

    return Promise.all(files);
}

function mergeCSVFiles() {
    getAllCSVFiles().then((csvFiles) => {

        let [
            xiamen, hongwen, gulangyu, marineTraffic, powerOutput, 
            futureXiamen, futureHongwen, futureGulangyu, futurePowerOutput
        ] = csvFiles;
        
        // Process Air Quality Data
        var airQuality = {};
        
        const sensors = [xiamen, hongwen, gulangyu];

        //console.log(sensors)
        
        for (const sensorIndex in sensors) {
            parseAirQualityData(airQuality, sensors[sensorIndex], sensorIndex);
        }

        // console.log(airQuality);

        // Process Ship Data

        var shipData = parseShipData(marineTraffic);

        // console.log(shipData);

        var powerData = parsePowerOutputData(powerOutput);

        var data = {
          "Air Quality": airQuality,
          "Ship Data": shipData,
          "Power Output": powerData
        }

        // console.log(data)

        createDataset(data);
        // console.log(powerData);
        // createCZML(date, airQuality, marineTraffic);
    }).catch(err => {
        console.log(err);
    });
}

function createDataset(csvData) {
    var dictstring = JSON.stringify(csvData);
    var fs = require('fs');
    fs.writeFile("dataset.json", dictstring, (err) => {
        if (err) {
            console.log(err)
        }
    });
}

mergeCSVFiles()