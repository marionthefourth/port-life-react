import { createDocumentHeader, createGrand, createParent, ElectricalGridCZMLParentKeys, FinancialCZMLKeys, CZMLKeys, AirQualityCZMLParentKeys, AirQualityCZMLKeys, AirQualityMetricKeys, createChild } from "./types";

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));


function wow() {
    /*
    import express from 'express';


    const app = express();
    const port = 3000;
    
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });
    
    app.listen(port, () => {
        console.log("🚀 Server ready at: " + port);
    
    });
    */
}

const root = "backend/czml"

const files = {
    "Financial Data":   `${root}/financial.czml`,
    "Air Quality Data": `${root}/air_quality.czml`,
    "Electrical Grid":  `${root}/electrical_grid.czml`
}

function getCZMLFile(fileName: string) {
    return fs.readFileAsync(fileName);
}

function getAllCZMLFiles() {
    var promises = [];

    for (const key in files) {
        promises.push(getCZMLFile(files[key]));
    }

    // return promise that is resolved when all .czml files are done loading
    return Promise.all(promises);
}

function modifyFinancialItem(item) {
    
}

export function createCZML(date) {
    
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
                    // item.label.scale = "0.5";
                    // item.label.horizontalOrigin = "LEFT";
                    item.label.showBackground = true;
                    // item.label.verticalOrigin = "CENTER";
                }

                switch (name as CZMLKeys) {
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
                            item["parent"] = category.id;
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


createCZML("");