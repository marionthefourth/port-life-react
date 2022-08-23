import { createDocumentHeader, createGrand, createParent, ElectricalGridCZMLParentKeys, FinancialCZMLKeys, CZMLKeys, AirQualityCZMLParentKeys, AirQualityCZMLKeys, AirQualityMetricKeys } from "./types";

const czmlRoot = "backend/czml";

const financialFilename = "financial";
const airQualityFilename = "air_quality";
const electricalGridFilename = "electrical_grid";
const electricalFilename = "electrical";

const czmlFileExtension = "czml";

const czmlFiles = {
    "Financial Data":   `${czmlRoot}/${financialFilename}.${czmlFileExtension}`,
    "Air Quality Data": `${czmlRoot}/${airQualityFilename}.${czmlFileExtension}`,
    "Electrical Grid":  `${czmlRoot}/${electricalGridFilename}.${czmlFileExtension}`,
    "Electrical Data":  `${czmlRoot}/${electricalFilename}.${czmlFileExtension}`
}

// CZML File Alterations

function convertBillboardWidthAndHeightToFloat(item) {
    if (item["billboard"]) {
        if (item["billboard"]["width"]) {
            item.billboard.width = parseFloat(item.billboard.width);
        }
        if (item["billboard"]["height"]) {
            item.billboard.height = parseFloat(item.billboard.height);
        }
    }
}

function convertPolylineWidthToFloat(item) {
    if (item["polyline"]) {
        if (item["polyline"]["width"]) {
            item.polyline.width = parseFloat(item.polyline.width);
        }
    }
}

function convertLabelOutlineWidthToInt(item) {
    if (item["label"]) {
        if (item["label"]["outlineWidth"]) {
            item.label.outlineWidth = parseInt(item.label.outlineWidth)
        }
    }
}

function standardizeLabelVisibility(item) {
    if (item.label) {
        item.label.scale = "0.5";
        item.label.horizontalOrigin = "LEFT";
        item.label.showBackground = true;
        item.label.verticalOrigin = "CENTER";
    }
}

// Parsing Category Elements

function parseElectricCZMLElement(czmlKeys, name, category, item) {
    if (item.name) {
        czmlKeys[name][item.name] = item.id
    }

    item["parent"] = category.id;
}

function parseAirQualityCZMLElement(czmlKeys, name, id, item) {
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
                break;
        }

        czmlKeys[name]['ports'][portIndex][item.name] = item.id;

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
            break;
            
    }
}

function parseElectricalGridCZMLElement(czmlKeys, name, item) {
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

    convertBillboardWidthAndHeightToFloat(item);
    convertPolylineWidthToFloat(item);

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
}

function parseFinancialCZMLElement(czmlKeys, name, category, item) {
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
}

// Main Functions

function getAllCZMLFiles() {
    var promises = [];

    for (const key in czmlFiles) {
        promises.push(getFile(czmlFiles[key]));
    }

    // return promise that is resolved when all .czml files are done loading
    return Promise.all(promises);
}

function mergeCZMLFiles() {
    
    getAllCZMLFiles().then(function(czmlArray) {
        const coreCZML = [];
        const documentHeader = createDocumentHeader();
        coreCZML.push(documentHeader);

        const czmlKeys = {}

        for (const i in czmlArray) {

            const czml = JSON.parse(czmlArray[i].toString());

            const name = czml.shift().id as CZMLKeys;
            
            const grandKey = `${name} Data`;
            
            const category = createGrand(grandKey);
            coreCZML.push(category);

            const id = category.id;
            
            czmlKeys[name] = {
                "id": id,
            }

            for (const z in czml) {
                
                const item = czml[z];

                standardizeLabelVisibility(item);
                convertLabelOutlineWidthToInt(item);



                switch (name as CZMLKeys) {
                    case "Electrical":
                        parseElectricCZMLElement(czmlKeys, name, category, item); break;
                    case "Financial":
                        parseFinancialCZMLElement(czmlKeys, name, category, item);
                        
                        
                        break;
                    case "Air Quality":
                        parseAirQualityCZMLElement(czmlKeys, name, id, item);
                        break;
                    case "Electrical Grid":
                        parseElectricalGridCZMLElement(czmlKeys, name, item);
                        
                        
                        break;
                }

                coreCZML.push(item);
            }
        }

        console.log(czmlKeys);

        createPortLifeCZML(coreCZML);
        
    }, function(err) {
        // an error occurre
        console.log(err);
    });
}

function createPortLifeCZML(czmlData) {
    var dictstring = JSON.stringify(czmlData);
    var fs = require('fs');
    fs.writeFile("port-life.czml", dictstring, (err) => {
        if (err) {
            console.log(err)
        }
    });
}

mergeCZMLFiles();