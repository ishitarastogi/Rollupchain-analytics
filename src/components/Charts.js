import React, { useState, useRef } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./ChartToggle.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels
);

const ChartToggle = ({ raasData, rollupsData, sheetData }) => {
  const [chartType, setChartType] = useState("pie");
  const [dataType, setDataType] = useState("raas");
  const [minTx, setMinTx] = useState(0);
  const [maxTx, setMaxTx] = useState(Infinity);
  const chartRef = useRef(null);

  const colorMap = {
    Gelato: "#ff3b57",
    Conduit: "#46BDC6",
    Alchemy: "#4185F4",
    Caldera: "#EC6731",
    Altlayer: "#B28AFE",
    Self: "#FF0000",
  };

  let filteredRollupsLabels = [];
  let filteredRollupsDataValues = [];
  let filteredRollupsColors = [];

  Object.entries(rollupsData).forEach(([label, value]) => {
    if (value >= minTx && value <= maxTx) {
      filteredRollupsLabels.push(label);
      filteredRollupsDataValues.push(value);

      const rollup = sheetData.find((row) => row.name === label);
      const rollupRaas = rollup ? rollup.raas : null;
      filteredRollupsColors.push(colorMap[rollupRaas] || "#4185F4");
    }
  });

  let aggregatedRaasData = {};
  filteredRollupsLabels.forEach((label, index) => {
    const rollup = sheetData.find((row) => row.name === label);
    const rollupRaas = rollup ? rollup.raas : null;

    if (rollupRaas) {
      if (!aggregatedRaasData[rollupRaas]) {
        aggregatedRaasData[rollupRaas] = 0;
      }
      aggregatedRaasData[rollupRaas] += filteredRollupsDataValues[index];
    }
  });

  const filteredRaasLabels = Object.keys(aggregatedRaasData);
  const filteredRaasDataValues = Object.values(aggregatedRaasData);
  const filteredRaasBackgroundColors = filteredRaasLabels.map(
    (label) => colorMap[label] || "#000000"
  );

  const createGradient = (ctx, color) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    return gradient;
  };

  const barRollupsData = {
    labels: filteredRollupsLabels,
    datasets: [
      {
        label: "Total Transactions by Rollups Name",
        data: filteredRollupsDataValues,
        backgroundColor: filteredRollupsColors.map((color) =>
          createGradient(chartRef.current?.ctx, color)
        ),
        borderColor: filteredRollupsColors,
        borderWidth: 2,
        barThickness: 4,
        hoverBackgroundColor: filteredRollupsColors.map((color) =>
          color.replace("1)", "0.8)")
        ),
      },
    ],
  };

  const pieRaasData = {
    labels: filteredRaasLabels,
    datasets: [
      {
        label: "Total Transactions by RaaS Provider",
        data: filteredRaasDataValues,
        backgroundColor: filteredRaasBackgroundColors,
        hoverOffset: 4,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const barRaasData = {
    labels: filteredRaasLabels,
    datasets: [
      {
        label: "Total Transactions by RaaS Provider",
        data: filteredRaasDataValues,
        backgroundColor: filteredRaasBackgroundColors.map((color) =>
          createGradient(chartRef.current?.ctx, color)
        ),
        borderColor: filteredRaasBackgroundColors,
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (acc, val) => acc + val,
            0
          );
          const percentage = ((value / total) * 100).toFixed(2);
          return `${percentage}%`;
        },
        color: "#fff",
        font: {
          weight: "bold",
          size: 16,
        },
        textShadowBlur: 6,
        textShadowColor: "rgba(0, 0, 0, 0.7)",
      },
    },
    layout: {
      padding: 30,
    },
    cutout: "50%",
    radius: "95%",
  };

  const barOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#fff",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#fff",
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#fff",
          callback: function (value) {
            return value.toLocaleString();
          },
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
    },
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const handleDataTypeChange = (e) => {
    setDataType(e.target.value);
  };

  return (
    <div className="chart-toggle-container">
      <div className="chart-toggle-dropdown">
        <label htmlFor="dataType">Select Metrics: </label>
        <select id="dataType" value={dataType} onChange={handleDataTypeChange}>
          <option value="raas">Total Transactions by RaaS Provider</option>
          <option value="rollups">Total Transactions by Rollups Name</option>
        </select>
      </div>

      {dataType === "raas" && (
        <div className="chart-toggle-dropdown">
          <label htmlFor="chartType">Select Chart Type: </label>
          <select
            id="chartType"
            value={chartType}
            onChange={handleChartTypeChange}
          >
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      )}

      <div className="chart-wrapper">
        {dataType === "raas" && (
          <>
            {chartType === "pie" ? (
              <Pie data={pieRaasData} options={pieOptions} ref={chartRef} />
            ) : (
              <Bar data={barRaasData} options={barOptions} ref={chartRef} />
            )}
          </>
        )}

        {dataType === "rollups" && (
          <Bar data={barRollupsData} options={barOptions} ref={chartRef} />
        )}
      </div>
    </div>
  );
};

export default ChartToggle;
