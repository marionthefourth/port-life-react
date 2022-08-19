import React, {useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";

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
    const [filterYearIndex, setFilterYearIndex] = useState(0);
    const [filterYearValues, setFilterYearValues] = useState([2022]);
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

    function getFilterYearFull(values, index) {
        return `Filter Year: ${values[index]}`
    }
    
    const [scaleText, setScaleText] = useState(getScaleFull(0));
    const [primaryText, setPrimaryText] = useState(getPrimaryFull(0))


    const [filterYearText, setFilterYearText] = useState(getFilterYearFull([2022],0));
    const [powerOutputOptions, setPowerOutputOptions] = useState({});
    const [powerOutputSeries, setPowerOutputSeries] = useState([]);
    const [shipDataOptions, setShipDataOptions] = useState({});
    const [shipDataSeries, setShipDataSeries] = useState([]);
    const [shipDataChartType, setShipDataChartType] = useState("line");
    const [airQualityOptions, setAirQualityOptions] = useState({});
    const [airQualitySeries, setAirQualitySeries] = useState([]);
    const [airQualityChartType, setAirQualityChartType] = useState("bar");

    
    function numberWithCommas(numberValue) {
        return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function loadCSVData() {
        const url = "https://raw.githubusercontent.com/marionthefourth/port-life-react/merging-and-displaying-czml/src/json/dataset.json";
    
        fetch(url).then(response => response.json()).then(jsonResponse => {
            onUpdate(jsonResponse, 0, 0, 0, 0);
            setCSVData(jsonResponse);
        });
    }

    function returnToMap() {
        navigate("/demo");
    }

    function toggleYearFilter() {
        setFilterYearValues(values => {
            setFilterYearIndex(index => {
                if (index + 1 <= values.length - 1) {
                    index += 1;
                } else {
                    index = 0;
                }
                setFilterYearText(getFilterYearFull(values, index));
                return index
            });

            
            return values;
        })
    }

    function toggleScale() {
        setScaleIndex(sCur => {
            if (sCur === 0) {
                sCur = 1
            } else {
                sCur = 0
            }

            setScaleText(getScaleFull(sCur));
            onUpdate(csvData, primaryChartIndex, primaryFeatureIndex, sCur, filterYearIndex);
            
            return sCur;
        })
    }

    function togglePrimary() {
        setPrimaryChartIndex(primaryCur => {
            var hasFeature;

            if (primaryCur > 1) {
                primaryCur = 0
                hasFeature = false;
            } else {
                primaryCur += 1;
                hasFeature = true;
            }

            setPrimaryHasFeature(hasFeature);
            setPrimaryText(getPrimaryFull(primaryCur));
            setPrimaryFeatureIndex(0);
            setFilterYearIndex(0);
            setPrimaryFeatureText(getFeatureFull(primaryCur, 0));
            onUpdate(csvData, primaryCur, 0, scaleIndex, 0);
            return primaryCur;
        })
    }

    function togglePrimaryFeature() {
        setPrimaryFeatureIndex(cur => {
            var chartType = "bar";
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
                default:
                    break;
            }
            
            setShipDataChartType(chartType);
            // console.log(`${primaryChartIndex} | ${cur} | ${scaleIndex}`)
            setPrimaryFeatureText(getFeatureFull(primaryChartIndex, cur));
            onUpdate(csvData, primaryChartIndex, cur, scaleIndex);
            return cur;
        })
    }

    function getMonthAndYear(dateValue) {
        const dateFormat = new Date(dateValue);
        return `${dateFormat.getMonth()+1}/${dateFormat.getFullYear()}`;
    }

    function getYear(dateValue) {
        const dateFormat = new Date(dateValue);
        return dateFormat.getFullYear();
    }

    function onUpdate(dataset, indexSelected, featureIndex, scaleIndex, yearIndex=0) {
        setPrimaryFeatureIndex(cur => {

            setPrimaryFeatureIndex(featureIndex);
            setScaleText(getScaleFull(scaleIndex));
            setScaleIndex(scaleIndex);

            const powerOuputFeatures = {
                0: "Power Output"
            }

            const financialFeatures = {
                0: "Carrier Count",
                1: "TEU",
                2: "Total Revenue"
            }

            const airQualityFeatures = {
                0: "Xiamen",
                1: "Hongwen",
                2: "Gulangyu"
            }

            const titles = {
                0: powerOuputFeatures[featureIndex],
                1: financialFeatures[featureIndex],
                2: airQualityFeatures[featureIndex]
            }

            var data;
            const isDaily = scaleIndex === 0;
            const title = titles[indexSelected];

            setChartTitle(`Xiamen Port ${getScaleMinimum(scaleIndex)} ${title}`);

            switch(indexSelected) {
                case 0:
                    data = dataset["Power Output"];
                    isDaily ? dailyPowerOutputData(data): averagePowerOutputDataByMonth(data);
                    break;
                case 1:
                    data = dataset["Ship Data"];
                    isDaily ? dailyShipDataFeature(data, title): averageShipDataFeatureByMonth(data, title);
                    break;
                case 2:
                    data = dataset["Air Quality"];
                    isDaily ? dailyAirQualityDataFeature(data, title, yearIndex): averageAirQualityDataFeatureByMonth(data, title)
                    break;
                default:
                    break;
            }
            return indexSelected;
        });
        
    }

    function averageAirQualityDataFeatureByMonth(dataset, feature) {

    }

    function dailyAirQualityDataFeature(dataset, feature, yearIndex=0) {
        const newKeys = [];
        const pm25Values = [];
        const pm10Values = [];
        const o3Values = [];
        const no2Values = [];
        const so2Values = []; 
        const coValues = [];

        const yearValues = [];

        for (const day in dataset) {
            const data = dataset[day];
            const year = getYear(day);

            if (!yearValues.includes(year)) {
                yearValues.push(year);
            }

            if (yearValues[yearIndex]) {
                if (yearValues[yearIndex] === year) {
                    const sensorData = data[feature];

                    // console.log(sensorData)
                    if (sensorData) {
                        pm25Values.push(sensorData["PM2.5"]);
                        pm10Values.push(sensorData["PM10"]);
                        o3Values.push(sensorData["O3"]);
                        no2Values.push(sensorData["NO2"]);
                        so2Values.push(sensorData["SO2"]);
                        coValues.push(sensorData["CO"]);
                        newKeys.push(day);
                    }
                }
            }
            
            
        }

        setAirQualityOptions(createOptions("Date", newKeys.reverse()));

        setAirQualityChartType(cur => {
            setAirQualitySeries([
                createSeries("PM2.5", pm25Values.reverse()),
                createSeries("PM10", pm10Values.reverse()),
                createSeries("O3", o3Values.reverse()),
                createSeries("NO2", no2Values.reverse()),
                createSeries("SO2", so2Values.reverse()),
                createSeries("CO", coValues.reverse()),
            ]);
            return "line";
        })
    }

    function averageShipDataFeatureByMonth(dataset, feature) {

        const monthAndYearMatched = {}
        const averagePerMonth = {}
        const teuValues = [];
        const bulkCarrierValues = [];
        const containerShipValues = [];
        const generalCargoValues = [];
        const totalRevenueValues = [];

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

        const newKeys = Object.keys(averagePerMonth).reverse();
        
        for (const monthAndYear in monthAndYearMatched) {

            var teuTotal = 0;
            var bulkCarrierTotal = 0;
            var containerShipTotal = 0;
            var generalCargoTotal = 0;
            var totalRevenueCombined = 0;

            const dateData = monthAndYearMatched[monthAndYear];

            // TODO - Must hook up all the average values
            switch (feature) {
                case "Carrier Count":
                    const carrierData = dateData["Carrier Count"]
                    var count = 0;
                    if (carrierData) {
                        newKeys.push(monthAndYear);
                        for (const index in carrierData) {
                            for (const type in carrierData[index]) {
                                const shipCount = carrierData[index][type];
                                switch (type) {
                                    case "Bulk Carrier":
                                        bulkCarrierTotal += shipCount;
                                        break;
                                    case "Container Ship":
                                        containerShipTotal += shipCount;
                                        break;
                                    case "General Cargo":
                                        generalCargoTotal += shipCount;
                                        break;
                                    default:
                                        break;
                                }
                            }
                            count += 1;
                            
                        }

                        bulkCarrierValues.push(bulkCarrierTotal/count);
                        containerShipValues.push(containerShipTotal/count);
                        generalCargoValues.push(generalCargoTotal/count);
                    }
                    break;
                case "TEU":
                    const teuData = dateData["TEU"];
                    if (teuData) {
                        newKeys.push(monthAndYear);
                        for (const index in teuData) {
                            teuTotal +=  teuData[index];
                        }
                        teuValues.push(numberWithCommas(teuTotal/teuData.length));
                    }
                    break;
                case "Total Revenue":
                    const totalRevenueData = dateData["Total Revenue"];
                    if (totalRevenueData) {
                        newKeys.push(monthAndYear);
                        for (const i in totalRevenueData) {
                            totalRevenueCombined += totalRevenueData[i];
                        }
                        totalRevenueValues.push(numberWithCommas(totalRevenueCombined/totalRevenueData.length));
                    }
                    break;
                default:
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
                });
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
            default:
                break;
        }

        
    }

    function dailyShipDataFeature(dataset, feature, yearIndex=0) {
        const newKeys = [];
        const teuValues = [];
        const bulkCarrierValues = [];
        const containerShipValues = [];
        const generalCargoValues = [];
        const totalRevenueValues = []; 

        const yearValues = [];

        for (const day in dataset) {
            const year = getYear(day);

            if (!yearValues.includes(year)) {
                yearValues.push(year);
            }

            if (yearValues[yearIndex]) {
                if (yearValues[yearIndex] === year) {
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
            default:
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
        setFilterYearValues([2022]);
        setFilterYearText(getFilterYearFull([2022], 0));
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
            },
            theme: {
                palette: 'palette1' // upto palette10
            }
        }
    }

    function createSeries(name, data) {
        return {
                name: name,
                data: data,
        }
        
    }

    useEffect(() => {
        loadCSVData();
    }, [])
      
    return (
        <div className="MetricViewer">
            <span className="MetricViewer">
                <button style={styles.logoutBtn} onClick={returnToMap}>Return To Map</button>
            </span>
            <br/>
            <span>
                <button style={styles.logoutBtn} onClick={togglePrimary}>{primaryText}</button>
                {
                    primaryHasFeature === true && 
                    <button style={styles.logoutBtn} onClick={togglePrimaryFeature}>{primaryFeatureText}</button>
                }
                <button style={styles.logoutBtn} onClick={toggleYearFilter}>{filterYearText}</button>
                <button style={styles.logoutBtn} onClick={toggleScale}>{scaleText}</button>
            </span>
            <br/>
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
                            type={airQualityChartType}
                            width="1000"
                        />
                    }
                </div>
            </div>
        </div>
    )
}
