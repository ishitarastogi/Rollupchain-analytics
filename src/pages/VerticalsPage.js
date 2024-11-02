// src/pages/VerticalsPage.js

import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2"; // Import Pie and Bar from react-chartjs-2
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js"; // Import necessary components from chart.js
import { fetchGoogleSheetData } from "../services/fetchGoogleSheetData";
import "./VerticalsPage.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const VerticalsPage = () => {
  const [verticalsData, setVerticalsData] = useState([]);
  const [pieChartData, setPieChartData] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [daChartData, setDaChartData] = useState({});
  const [l2l3ChartData, setL2l3ChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processVerticalsData = async () => {
      try {
        const sheetData = await fetchGoogleSheetData();

        // Filter out chains without a vertical
        const filteredData = sheetData.filter(
          (row) => row.vertical && row.vertical.trim() !== ""
        );

        // Group chains by vertical
        const verticalsMap = {};

        filteredData.forEach((chain) => {
          const vertical = chain.vertical.trim();
          if (!verticalsMap[vertical]) {
            verticalsMap[vertical] = [];
          }
          verticalsMap[vertical].push({
            name: chain.name,
            da: chain.da
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "--"),
            l2OrL3: chain.l2OrL3
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "--"),
            totalTransactions:
              chain.totalTransactions === "--"
                ? 0
                : Number(chain.totalTransactions),
          });
        });

        // Prepare data for table and bar chart
        const verticalsArray = Object.keys(verticalsMap).map((vertical) => {
          // Sort chains by totalTransactions in descending order and take top 5
          const topChains = verticalsMap[vertical]
            .sort((a, b) => b.totalTransactions - a.totalTransactions)
            .slice(0, 5)
            .map((chain) => chain.name);

          const totalChains = verticalsMap[vertical].length;

          // Calculate total transactions for the bar chart
          const totalTransactions = verticalsMap[vertical].reduce(
            (sum, chain) => sum + chain.totalTransactions,
            0
          );

          return {
            vertical,
            topChains,
            totalChains,
            totalTransactions,
            chains: verticalsMap[vertical],
          };
        });

        // Prepare data for pie chart (distribution of chains across verticals)
        const pieData = {
          labels: verticalsArray.map((v) => v.vertical),
          datasets: [
            {
              label: "Number of Chains",
              data: verticalsArray.map((v) => v.totalChains),
              backgroundColor: generateColorPalette(verticalsArray.length),
              hoverOffset: 4,
            },
          ],
        };

        // Prepare data for bar chart (total transactions per vertical)
        const barData = {
          labels: verticalsArray.map((v) => v.vertical),
          datasets: [
            {
              label: "Total Transactions",
              data: verticalsArray.map((v) => v.totalTransactions),
              backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue with opacity
              borderColor: "rgba(54, 162, 235, 1)", // Blue solid
              borderWidth: 1,
            },
          ],
        };

        // Prepare data for DA bar chart
        const daCategories = Array.from(
          new Set(
            verticalsArray.flatMap((v) => v.chains.flatMap((chain) => chain.da))
          )
        ).filter((da) => da !== "--");

        const daData = {
          labels: verticalsArray.map((v) => v.vertical),
          datasets: daCategories.map((da, index) => ({
            label: da,
            data: verticalsArray.map(
              (v) => v.chains.filter((chain) => chain.da.includes(da)).length
            ),
            backgroundColor: getColor(index),
          })),
        };

        // Prepare data for L2/L3 bar chart
        const l2l3Categories = Array.from(
          new Set(
            verticalsArray.flatMap((v) =>
              v.chains.flatMap((chain) => chain.l2OrL3)
            )
          )
        ).filter((l2l3) => l2l3 !== "--");

        const l2l3Data = {
          labels: verticalsArray.map((v) => v.vertical),
          datasets: l2l3Categories.map((l2l3, index) => ({
            label: l2l3,
            data: verticalsArray.map(
              (v) =>
                v.chains.filter((chain) => chain.l2OrL3.includes(l2l3)).length
            ),
            backgroundColor: getColor(index + daCategories.length),
          })),
        };

        setVerticalsData(verticalsArray);
        setPieChartData(pieData);
        setBarChartData(barData);
        setDaChartData(daData);
        setL2l3ChartData(l2l3Data);
        setLoading(false);
      } catch (err) {
        console.error("Error processing verticals data:", err);
        setError("Failed to load verticals data.");
        setLoading(false);
      }
    };

    processVerticalsData();
  }, []);

  // Function to generate a color palette
  const generateColorPalette = (numColors) => {
    const colors = [];
    const baseColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#C9CBCF",
      "#B3E5FC",
      "#DCEDC8",
      "#FFE0B2",
      // Add more colors if needed
    ];
    for (let i = 0; i < numColors; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  };

  // Function to get distinct colors for stacked bars
  const getColor = (index) => {
    const palette = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#C9CBCF",
      "#B3E5FC",
      "#DCEDC8",
      "#FFE0B2",
      "#A8E6CF",
      "#FFD3B6",
      "#FFAAA5",
      "#FF8C94",
      "#8ECAE6",
      "#2196F3",
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#F7CAC9",
    ];
    return palette[index % palette.length];
  };

  if (loading) {
    return <div className="loading-message">Loading verticals data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="verticals-page">
      <h2>Verticals Overview</h2>
      <div className="verticals-container">
        {/* Left Side: Table */}
        <div className="verticals-table-container">
          <h3>Verticals and Top 5 Chains</h3>
          <table className="verticals-table">
            <thead>
              <tr>
                <th>Vertical Name (Total Chains)</th>
                <th>Top 5 Chains by Tx Count</th>
              </tr>
            </thead>
            <tbody>
              {verticalsData.map((vertical, index) => (
                <tr key={index}>
                  <td>{`${vertical.vertical} (${vertical.totalChains})`}</td>
                  <td>
                    {vertical.topChains.length > 0
                      ? vertical.topChains.join(", ")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Pie Chart */}
        <div className="verticals-pie-chart-container">
          <h3>Distribution of Vertical Chains</h3>
          <Pie data={pieChartData} />
        </div>
      </div>

      {/* Bar Chart Below */}
      <div className="verticals-bar-chart-container">
        <h3>Total Transactions per Vertical</h3>
        <Bar
          data={barChartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false, // Hide legend if only one dataset
              },
              tooltip: {
                enabled: true,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Total Transactions",
                  color: "#fff",
                },
                ticks: {
                  color: "#fff",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Verticals",
                  color: "#fff",
                },
                ticks: {
                  color: "#fff",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
            },
          }}
        />
      </div>

      {/* Additional Bar Charts: DA and L2/L3 */}
      <div className="additional-charts-container">
        {/* DA Usage Bar Chart */}
        <div className="additional-chart">
          <h3>DA Usage per Vertical</h3>
          <Bar
            data={daChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                tooltip: {
                  enabled: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Number of DA",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Verticals",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                },
              },
            }}
          />
        </div>

        {/* L2/L3 Usage Bar Chart */}
        <div className="additional-chart">
          <h3>L2/L3 Usage per Vertical</h3>
          <Bar
            data={l2l3ChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                tooltip: {
                  enabled: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Number of L2/L3",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Verticals",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VerticalsPage;
