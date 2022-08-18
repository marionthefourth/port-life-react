import React, {useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import { Navigate, useNavigate } from "react-router-dom";

const styles = {
    primaryFeatureOne: {
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
  };

export function MetricViewer() {

    const [csvData, setCSVData] = useState({});
    const [chartTitle, setChartTitle] = useState("");

    const [primaryChartIndex, setPrimaryChartIndex] = useState(0);
    const [primaryHasFeature, setPrimaryHasFeature] = useState(false);
    const [primaryFeatureIndex, setPrimaryFeatureIndex] = useState(0);
    const [primaryFeatureText, setPrimaryFeatureText] = useState("");
    const [secondaryChartIndex, setSecondaryChartIndex] = useState(0);
    const [secondaryFeatureIndex, setSecondaryFeatureIndex] = useState(0);
    const [scaleIndex, setScaleIndex] = useState(0);
    
    const navigate = useNavigate();

    const scale = {
        0: "Daily",
        1: "Monthly Average"
    }

    const primarySet = {
        0: "Power Output",
        1: "Ship/Financial",
        2: "Air Quality"
    }

    function getPrimaryFull(index) {
        return `Primary Dataset: ${primarySet[index]}`
    }

    function getFeatureFull(primaryIndex, featureIndex) {
        const primary = {
            0: {
                0: "Power Output"
            },
            1: {
                0: "Carrier Count",
                1: "TEUs",
                2: "Total Revenue",
            },
            2: {
                0: "Xiamen Sensor Data",
                1: "Hongwen Sensor Data",
                2: "Gulangyu Sensor Data"
            }
        }

        return `Feature: ${primary[primaryIndex][featureIndex]}`
    }

    function getFeatureMinumum(primaryIndex, featureIndex) {
        const primary = {
            0: {
                0: "Power Output"
            },
            1: {
                0: "Carrier Count",
                1: "TEUs",
                2: "Total Revenue",
            },
            2: {
                0: "Xiamen Sensor Data",
                1: "Hongwen Sensor Data",
                2: "Gulangyu Sensor Data"
            }
        }

        return primary[primaryIndex][featureIndex]

    }

    function getScaleFull(index) {
        return `Data Date Scale: ${scale[index]}`
    }

    function getScaleMinimum(index) {
        return `${scale[index]}`
    }
    
    const [scaleText, setScaleText] = useState(getScaleFull(0));
    const [primaryText, setPrimaryText] = useState(getPrimaryFull(0))

    const [powerOutputOptions, setPowerOutputOptions] = useState({});
    const [powerOutputSeries, setPowerOutputSeries] = useState([]);
    const [shipDataOptions, setShipDataOptions] = useState({});
    const [shipDataSeries, setShipDataSeries] = useState([]);
    const [shipDataChartType, setShipDataChartType] = useState("line");
    const [airQualityOptions, setAirQualityOptions] = useState({});
    const [airQualitySeries, setAirQualitySeries] = useState([]);
    
    function numberWithCommas(numberValue) {
        return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function loadCSVData() {
        const url = "https://raw.githubusercontent.com/marionthefourth/port-life-react/merging-and-displaying-czml/src/json/dataset.json";
    
        fetch(url).then(response => response.json()).then(jsonResponse => {
            onUpdate(jsonResponse, 0, 0, 0);
            setCSVData(jsonResponse);
        });
    }

    function returnToMap() {
        navigate("/demo");
    }

    function toggleScale() {
        setScaleIndex(cur => {
            switch (cur) {
                case 0:
                    cur = 1;
                    break;
                case 1:
                    cur = 0;
                    break;
            }

            setScaleText(getScaleFull(cur));
            setPrimaryChartIndex(pCur => {
                setPrimaryFeatureIndex(fCur => {
                    onUpdate(csvData, pCur, fCur, cur);
                    return fCur;
                })
                return pCur;
            })
            
        })
    }

    function togglePrimary() {
        setPrimaryChartIndex(cur => {
            var hasFeature = true;
            switch (cur) {
                case 0:
                    cur = 1;
                    break;
                case 1:
                    cur = 2;
                    break;
                case 2:
                    cur = 0;
                    hasFeature = false;
                    break;
            }
            setPrimaryHasFeature(hasFeature);
            setPrimaryText(getPrimaryFull(cur));
            setPrimaryFeatureIndex(fCur => 0);
            setPrimaryFeatureText(getFeatureFull(cur, 0));
            onUpdate(csvData, cur, 0, scaleIndex);
            return cur;
        })
    }

    function togglePrimaryFeature() {
        setPrimaryFeatureIndex(cur => {
            var chartType = "line";
            switch(primaryChartIndex){
                case 0:
                    break;
                case 1:
                case 2:
                    switch (cur) {
                        case 0:
                            chartType = "line"
                            cur = 1;
                            break;
                        case 1:
                            
                            cur = 2;
                            break;
                        case 2:
                            cur = 0;
                            break;
                    }
                    break;
            }
            
            setPrimaryFeatureText(getFeatureFull(primaryChartIndex, cur));
            onUpdate(csvData, primaryChartIndex, cur, scaleIndex);
            return cur;
        })
    }

    function getMonthAndYear(dateValue) {
        const dateFormat = new Date(dateValue);
        return `${dateFormat.getMonth()+1}/${dateFormat.getFullYear()}`
    }

    function onUpdate(dataset, indexSelected, featureIndex, scaleIndex) {
        setPrimaryFeatureIndex(cur => {
            setSecondaryFeatureIndex(fCur => {
                return featureIndex;
            });

            setScaleIndex(sCur => {
                setScaleText(getScaleFull(scaleIndex));
                return scaleIndex;
            });

            switch(indexSelected) {
                case 0:
                    setChartTitle(`Xiamen Port ${getScaleMinimum(scaleIndex)} Power Output`);
                    switch (scaleIndex) {
                        case 0:
                            dailyPowerOutputData(dataset["Power Output"]);
                            break;
                        case 1:
                            averagePowerOutputDataByMonth(dataset["Power Output"]);
                            break;
                    }
                    break;
                case 1:
                    const feature = {
                        0: "Carrier Count",
                        1: "TEU",
                        2: "Total Revenue"
                    }

                    setChartTitle(`Xiamen Port ${getScaleMinimum(scaleIndex)} ${feature[featureIndex]}`);
                    switch (scaleIndex) {
                        case 0:
                            dailyShipDataFeature(dataset["Ship Data"], feature[featureIndex]);
                            break;
                        case 1:
                            averageShipDataFeatureByMonth(dataset["Ship Data"], feature[featureIndex]);
                            break;
                    }
                    break;
                case 2:
                    switch (scaleIndex) {
                        case 0:
                            break;
                        case 1:
                            break;
                    }
                    break;
            }
            return indexSelected;
        });
        
    }

    function averageShipDataFeatureByMonth(dataset, feature) {
        const monthAndYearMatched = {}
        const averagePerMonth = {}

        for (const day in dataset) {
            const monthAndYear = getMonthAndYear(day);
            const data = dataset[day];

            const teu = data["TEU"];
            const totalRevenue = data["Total Revenue"];
            const carrierCount = data["Carrier Count"];

            if (monthAndYear in monthAndYearMatched) {

                monthAndYearMatched[monthAndYear]["Carrier Count"].push(carrierCount);
                monthAndYearMatched[monthAndYear]["TEU"].push(teu);
                monthAndYearMatched[monthAndYear]["Total Revenue"].push(totalRevenue);
            } else {
                monthAndYearMatched[monthAndYear] = {
                    "Carrier Count": [carrierCount],
                    "TEU": [teu],
                    "Total Revenue": [totalRevenue]
                }
            }
        }

        for (const monthAndYear in monthAndYearMatched) {
            var teuTotal = 0;
            var bulkCarrierTotal = 0;
            var containerShipTotal = 0;
            var generalCargoTotal = 0;
            var totalRevenueCombined = 0;
            const count = monthAndYearMatched[monthAndYear].length;

            for (const i in monthAndYearMatched[monthAndYear]) {
                const dateData = monthAndYearMatched[monthAndYear]
                const carrierData = dateData["Carrier Count"][i];
                const teuData = dateData["TEU"][i];
                const totalRevenueData = dateData["Total Revenue"][i];
                console.log(carrierData);
                if (teuData) {
                    teuTotal += teuData;
                }

                if (carrierData) {
                    bulkCarrierTotal += carrierData["Bulk Carrier"];
                    containerShipTotal += carrierData["Container Ship"];
                    generalCargoTotal += carrierData["General Cargo"];
                }

                if (totalRevenueData) {
                    totalRevenueCombined += totalRevenueData;

                }
            }

            averagePerMonth[monthAndYear] = {
                "Carrier Count": {
                    "Bulk Carrier": bulkCarrierTotal/count,
                    "Container Ship": containerShipTotal/count,
                    "General Cargo": generalCargoTotal/count,
                },
                "TEU": numberWithCommas(teuTotal/count),
                "Total Revenue": `$${numberWithCommas(totalRevenueCombined/count)}`
            }

        }

        // TODO - Must hook up all the average values
        switch (feature) {
            case "Carrier Count":
                break;
            case "TEU":
                break;
            case "Total Revenue":
                break;
        }
    }

    function dailyShipDataFeature(dataset, feature) {
        const newKeys = [];
        const teuValues = [];
        const bulkCarrierValues = [];
        const containerShipValues = [];
        const generalCargoValues = [];
        const totalRevenueValues = []; 

        for (const day in dataset) {
            const data = dataset[day];
            switch (feature) {
                case "Carrier Count":
                    const carrierData = data["Carrier Count"];
                    if (carrierData) {
                        bulkCarrierValues.push(carrierData["Bulk Carrier"]);
                        containerShipValues.push(carrierData["Container Ship"]);
                        generalCargoValues.push(carrierData["General Cargo"]);
                        newKeys.push(day);
                    }
                    break;
                case "TEU":
                    const teuData = data["TEU"];
                    if (teuData) {
                        teuValues.push(teuData);
                        newKeys.push(day);
                    }
                    break;
                case "Total Revenue":
                    const totalRevenueData = data["Total Revenue"];
                    if (totalRevenueData) {
                        totalRevenueValues.push(totalRevenueData);
                        newKeys.push(day);
                    }
                    break;
            }
        }

        setShipDataOptions(createOptions("Date", newKeys.reverse()));

        switch (feature) {
            case "Carrier Count":
                setShipDataChartType(cur => {
                    setShipDataSeries([
                        createSeries("Bulk Carriers", bulkCarrierValues.reverse()),
                        createSeries("Container Ships", containerShipValues.reverse()),
                        createSeries("General Cargo", generalCargoValues.reverse())
                    ]);
                    return "bar";
                })
                break;
            case "TEU":
                setShipDataChartType(cur => {
                    setShipDataSeries([createSeries("TEUs", teuValues.reverse())]);
                    return "bar";
                });
                break;
            case "Total Revenue":
                setShipDataChartType(cur => {
                    setShipDataSeries([createSeries("Total Revenue", totalRevenueValues.reverse())]);
                    return "bar";
                });
                break;
        }
        
    }

    function averagePowerOutputDataByMonth(dataset) {
        const monthAndYearMatched = {}
        const averagePerMonth = {}

        for (const day in dataset) {
            // console.log(day);
            const monthAndYear = getMonthAndYear(day);
            if (monthAndYear in monthAndYearMatched) {
                monthAndYearMatched[monthAndYear].push(dataset[day]);
            } else {
                monthAndYearMatched[monthAndYear] = [dataset[day]];
            }
        }

        for (const monthAndYear in monthAndYearMatched) {
            var total = 0;
            const count = monthAndYearMatched[monthAndYear].length;

            for (const i in monthAndYearMatched[monthAndYear]) {
                total += monthAndYearMatched[monthAndYear][i];
            }

            averagePerMonth[monthAndYear] = `${(total/count).toFixed(2)}MW`

        }

        const newKeys = Object.keys(averagePerMonth).reverse();
        const newValues = Object.values(averagePerMonth).reverse();
        setPowerOutputOptions(createOptions("Date", newKeys));
        setPowerOutputSeries([createSeries("Power Output", newValues)]);
    }

    function dailyPowerOutputData(dataset) {
        const newKeys = Object.keys(dataset).reverse();
        const newValues = Object.values(dataset).reverse();
        // console.log(`Keys: ${newKeys}`)
        // console.log(`Values: ${newValues}`)
        setPowerOutputOptions(createOptions("Date", newKeys));
        setPowerOutputSeries([createSeries("Power Output", newValues)]);
    }

    function createOptions(id, data) {
        return {
            chart: {
                id: id
            },
            xaxis: {
                categories: data
            }
        }
    }

    function createSeries(name, data) {
        return {
              name: name,
              data: data
        }
    }

    useEffect(() => {
        loadCSVData();
        
    }, [])
      
    return (
        <div className="app">
            <button style={styles.logoutBtn} onClick={returnToMap}>Return To Map</button>
            <button style={styles.logoutBtn} onClick={togglePrimary}>{primaryText}</button>
            {
                primaryHasFeature == true && 
                <button style={styles.logoutBtn} onClick={togglePrimaryFeature}>{primaryFeatureText}</button>
            }
            
            <button style={styles.logoutBtn} onClick={toggleScale}>{scaleText}</button>
            <div className="row">
                <div className="mixed-chart">
                    <p className="ChartTitle">{chartTitle}</p>
                    { primaryChartIndex === 0 &&
                        <Chart
                            options={powerOutputOptions}
                            series={powerOutputSeries}
                            type="line"
                            width="1000"
                        />
                    }
                    { primaryChartIndex === 1 &&
                        <Chart
                            options={shipDataOptions}
                            series={shipDataSeries}
                            type={shipDataChartType}
                            width="1000"
                        />
                    }
                    { primaryChartIndex === 2 &&
                        <Chart
                            options={airQualityOptions}
                            series={airQualitySeries}
                            type="bar"
                            width="1000"
                        />
                    }
                </div>
            </div>
        </div>
    )
}
