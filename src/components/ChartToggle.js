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
import { FaDownload } from "react-icons/fa";
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

const ChartToggle = ({ raasData, rollupsData, sheetData, filters }) => {
  const [chartType, setChartType] = useState("pie");
  const [dataType, setDataType] = useState("raas");
  const [minTransactions, setMinTransactions] = useState("");
  const [maxTransactions, setMaxTransactions] = useState("");
  const chartRef = useRef(null);

  const colorMap = {
    Gelato: "#ff3b57",
    Conduit: "#46BDC6",
    Alchemy: "#4185F4",
    Caldera: "#EC6731",
    Altlayer: "#B28AFE",
    Self: "#FF0000",
  };

  // Enhanced filter to include all desired filter options
  const filteredRollups = sheetData.filter(
    (row) =>
      (!filters.raasProviders || row.raas === filters.raasProviders) &&
      (!filters.verticals || row.vertical === filters.verticals) &&
      (!filters.frameworks || row.framework === filters.frameworks) &&
      (!filters.das || row.da === filters.das) &&
      (!filters.l2OrL3 || row.l2OrL3 === filters.l2OrL3)
  );

  let filteredRollupsLabels = [];
  let filteredRollupsDataValues = [];
  let filteredRollupsColors = [];

  Object.entries(rollupsData).forEach(([label, value]) => {
    const rollup = filteredRollups.find((row) => row.name === label);

    // Apply min and max transaction filters if set
    if (
      rollup &&
      (minTransactions === "" || value >= parseInt(minTransactions, 10)) &&
      (maxTransactions === "" || value <= parseInt(maxTransactions, 10))
    ) {
      filteredRollupsLabels.push(label);
      filteredRollupsDataValues.push(value);
      filteredRollupsColors.push(colorMap[rollup.raas] || "#4185F4");
    }
  });

  let aggregatedRaasData = {};
  filteredRollupsLabels.forEach((label, index) => {
    const rollup = filteredRollups.find((row) => row.name === label);
    if (rollup && rollup.raas) {
      aggregatedRaasData[rollup.raas] =
        (aggregatedRaasData[rollup.raas] || 0) +
        filteredRollupsDataValues[index];
    }
  });

  const filteredRaasLabels = Object.keys(aggregatedRaasData);
  const filteredRaasDataValues = Object.values(aggregatedRaasData);
  const filteredRaasBackgroundColors = filteredRaasLabels.map(
    (label) => colorMap[label] || "#000000"
  );

  const createGradient = (ctx, chartArea, color) => {
    if (!color) {
      color = "#000000"; // Fallback color if color is undefined
    }
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    return gradient;
  };

  const barRollupsData = {
    labels: filteredRollupsLabels,
    datasets:
      filteredRollupsLabels.length > 0
        ? [
            {
              label: "Total Transactions by Rollups Name",
              data: filteredRollupsDataValues,
              backgroundColor: function (context) {
                const { chart, dataIndex } = context;
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                const color = filteredRollupsColors[dataIndex];

                if (!chartArea) {
                  return color || "#000000"; // Ensure fallback color if color is undefined
                }

                return createGradient(ctx, chartArea, color);
              },
              borderColor: filteredRollupsColors.map(
                (color) => color || "#000000"
              ), // Fallback color for undefined entries
              borderWidth: 2,
              barThickness: 4,
            },
          ]
        : [], // If no data, return an empty dataset
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
        backgroundColor: function (context) {
          const { chart, dataIndex } = context;
          const ctx = chart.ctx;
          const chartArea = chart.chartArea;
          const color = filteredRaasBackgroundColors[dataIndex];

          if (!chartArea) {
            return color;
          }

          return createGradient(ctx, chartArea, color);
        },
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
          size: 14,
        },
        textShadowBlur: 6,
        textShadowColor: "rgba(0, 0, 0, 0.7)",
      },
    },
    layout: {
      padding: 10,
    },
    cutout: "60%",
    radius: "80%",
    maintainAspectRatio: false,
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
        barPercentage: 0.8,
        categoryPercentage: 0.6,
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
    maintainAspectRatio: false,
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const handleDataTypeChange = (e) => {
    setDataType(e.target.value);
  };

  const downloadChart = () => {
    const chartInstance = chartRef.current;
    if (chartInstance) {
      const url = chartInstance.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "chart.png";
      link.click();
    }
  };

  return (
    <div className="chart-toggle-container">
      <div className="chart-header">
        <div className="dropdowns-container">
          <div className="chart-toggle-dropdown">
            <label htmlFor="dataType">Select Data Type: </label>
            <select
              id="dataType"
              value={dataType}
              onChange={handleDataTypeChange}
            >
              <option value="raas">Total Transactions by RaaS Provider</option>
              <option value="rollups">
                Total Transactions by Rollups Name
              </option>
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

          {dataType === "rollups" && (
            <div className="transaction-filters">
              <label htmlFor="minTransactions">Min Transactions: </label>
              <input
                type="number"
                id="minTransactions"
                value={minTransactions}
                onChange={(e) => setMinTransactions(e.target.value)}
              />
              <label htmlFor="maxTransactions">Max Transactions: </label>
              <input
                type="number"
                id="maxTransactions"
                value={maxTransactions}
                onChange={(e) => setMaxTransactions(e.target.value)}
              />
            </div>
          )}
        </div>

        <button onClick={downloadChart} className="download-icon">
          <FaDownload />
        </button>
      </div>

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

        {dataType === "rollups" && filteredRollupsLabels.length > 0 ? (
          <Bar data={barRollupsData} options={barOptions} ref={chartRef} />
        ) : (
          dataType === "rollups" && (
            <p>No rollups match the specified transaction criteria.</p>
          )
        )}
      </div>
    </div>
  );
};

export default ChartToggle;
