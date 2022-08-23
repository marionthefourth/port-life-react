import { HorizontalOrigin } from 'cesium';
import { v4 } from 'uuid';

export interface Abstract {
    "id": string
}

export interface DocumentHeader extends Abstract {
    "id": "document",
    "version": "1.0"
}

export interface Grand extends Abstract {
    "name": string
}

export interface Parent extends Grand {
    "parent": string
}

export interface Child extends Parent {
    "position": {
        "cartographicDegrees": Array<number>
    }
}

export interface Label extends Child {
    "label": {
        "text": string,
        "verticalOrigin": VerticalOrigin,
        "horizontalOrigin": HorizontalOrigin,
        "showBackground": Boolean,
        "heightReference": HeightReference,
        "disableDepthTestDistance": number
    }
}

type VerticalOrigin = 
    | "BOTTOM"

type HeightReference = 
    | "RELATIVE_TO_GROUND";

const MAX_DEPTH_TEST_DISTANCE = 1000000000;

export type FinancialCZMLKeys =
    | "Border"
    | "Date"
    | "Ship Type"
    | "TEU Capacity"
    | "Value Per TEU"
    | "Total Revenue";

export type ElectricalGridCZMLParentKeys = 
    | "Power Lines"
    | "Power Line Columns"
    | "Power Line Cranes";

export type ElectricalCZMLKeys = 
    | "Power Output";

export type AirQualityCZMLParentKeys = 
    | "Xiamen"
    | "Gulangyu, Xiamen"
    | "Hongwen, Xiamen";

export type AirQualityCZMLKeys = 
    | "Pin"
    | "Ranges"
    | "Condition"
    | "Port Name"
    | "Primary Value"
    | "PM2.5 Label"
    | "PM2.5 Value"
    | "CO Label"
    | "CO Value"
    | "NO2 Label"
    | "NO2 Value"
    | "PM10 Label"
    | "PM10 Value"
    | "SO2 Label"
    | "SO2 Value"
    | "O3 Label"
    | "O3 Value";

export type AirQualityMetricKeys = 
    | "CO"
    | "PM2.5"
    | "NO2"
    | "PM10"
    | "SO2"
    | "O3"
    | "Primary"

export type CZMLKeys = 
    | "Financial"
    | "Air Quality"
    | "Electrical"
    | "Electrical Grid";

export function createGrand(name:string): Grand {
    return {
        "id": v4(),
        "name": name 
    }
}

export function createParent(name: string, grandID: string): Parent {
    return {
        "id": v4(),
        "parent": grandID,
        "name": name,
    }
}

export function createChild(name: string, parentID: string, cartographicDegrees:Array<number>): Child {
    return {
        "id": v4(),
        "parent": parentID,
        "name": name,
        "position": {
            "cartographicDegrees": cartographicDegrees
        }
    }
}

export function createLabel(text: string) {
    return {
        "text": text,
        "style": "FILL",
        "verticalOrigin": "BOTTOM",
        "heightReference": "RELATIVE_TO_GROUND",
        "disableDepthTestDistance": 1000000000
    }
}

export function createDocumentHeader(): DocumentHeader {
    return {
        "id": "document",
        "version": "1.0"
    }
}



export function createShipChild(name: string, parentID: string) {

}

export function createPortHeader(name: string, cartographicDegrees:Array<number>, parentID: string) {
    return {
        "id": v4(),
        "parent": parentID,
        "position": {
            "carotographicDegrees": cartographicDegrees
        },
        "label": {
            "text": name,
            "style": "FILL",
            "verticalOrigin": "BOTTOM",
            "heightReference": "RELATIVE_TO_GROUND",
            "disableDepthTestDistance": 1000000000
        }
    }
}

export function createAirQualityDetailItem(name: string, cartographicDegrees:Array<number>, parentID: string, value:number) {
    return {
        "id": v4(),
        "parent": parentID,
        "position": {
            "cartographicDegrees": cartographicDegrees
        },
        "label": {
            "text": name,
            "verticalOrigin": "BOTTOM",
            "heightReference": "RELATIVE_TO_GROUND",
            "disableDepthTestDistance": 1000000000
        }
    }
}