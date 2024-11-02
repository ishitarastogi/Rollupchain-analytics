// src/pages/VerticalsPage.js

import React, { useEffect, useState } from "react";
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
  const [verticalsFrameworksBarData, setVerticalsFrameworksBarData] = useState(
    {}
  );
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
          const verticals = chain.vertical
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v !== "--");

          verticals.forEach((vertical) => {
            if (!verticalsMap[vertical]) {
              verticalsMap[vertical] = [];
            }
            verticalsMap[vertical].push({
              name: chain.name,
              framework: chain.framework ? chain.framework.trim() : "N/A",
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
        });

        // Prepare data for table and pie chart
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
              backgroundColor: "rgba(255, 99, 132, 0.6)",
              borderColor: "rgba(255, 99, 132, 1)",
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
            backgroundColor: getDistinctColor(index),
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
            backgroundColor: getDistinctColor(index),
          })),
        };

        // Prepare data for Frameworks per Vertical stacked bar chart
        const frameworksSet = new Set(
          verticalsArray.flatMap((v) =>
            v.chains.map((chain) => chain.framework)
          )
        );
        const frameworksArrayUnique = Array.from(frameworksSet).filter(
          (fw) => fw !== "N/A"
        );

        const frameworksPerVerticalData = {
          labels: verticalsArray.map((v) => v.vertical),
          datasets: frameworksArrayUnique.map((framework, index) => ({
            label: framework,
            data: verticalsArray.map(
              (v) =>
                v.chains.filter((chain) => chain.framework === framework).length
            ),
            backgroundColor: getDistinctColor(index),
          })),
        };

        setVerticalsData(verticalsArray);
        setPieChartData(pieData);
        setBarChartData(barData);
        setDaChartData(daData);
        setL2l3ChartData(l2l3Data);
        setVerticalsFrameworksBarData(frameworksPerVerticalData);
        setLoading(false);
      } catch (err) {
        console.error("Error processing verticals data:", err);
        setError("Failed to load verticals data.");
        setLoading(false);
      }
    };

    processVerticalsData();
  }, []);

  // Function to generate a color palette with distinct colors
  const generateColorPalette = (numColors) => {
    const colors = [
      "#FF6633",
      "#FF33FF",
      "#00B3E6",
      "#E6B333",
      "#3366E6",
      "#999966",
      "#99FF99",
      "#B34D4D",
      "#80B300",
      "#809900",
      "#E6B3B3",
      "#6680B3",
      "#66991A",
      "#FF99E6",
      "#CCFF1A",
      "#FF1A66",
      "#E6331A",
      "#33FFCC",
      "#66994D",
      "#B366CC",
      "#4D8000",
      "#B33300",
      "#CC80CC",
      "#66664D",
      "#991AFF",
      "#E666FF",
      "#4DB3FF",
      "#1AB399",
      "#E666B3",
      "#33991A",
      "#CC9999",
      "#B3B31A",
      "#00E680",
      "#4D8066",
      "#809980",
      "#E6FF80",
      "#1AFF33",
      "#999933",
      "#FF3380",
      "#CCCC00",
      "#66E64D",
      "#4D80CC",
      "#9900B3",
      "#E64D66",
      "#4DB380",
      "#FF4D4D",
      "#99E6E6",
      "#6666FF",
      // Add more colors if needed
    ];
    return colors.slice(0, numColors);
  };

  // Function to get distinct colors for categories
  const getDistinctColor = (index) => {
    const colors = [
      // Same color array as above
      "#FF6633",
      "#FF33FF",
      "#00B3E6",
      "#E6B333",
      "#3366E6",
      "#999966",
      "#99FF99",
      "#B34D4D",
      "#80B300",
      "#809900",
      "#E6B3B3",
      "#6680B3",
      "#66991A",
      "#FF99E6",
      "#CCFF1A",
      "#FF1A66",
      "#E6331A",
      "#33FFCC",
      "#66994D",
      "#B366CC",
      "#4D8000",
      "#B33300",
      "#CC80CC",
      "#66664D",
      "#991AFF",
      "#E666FF",
      "#4DB3FF",
      "#1AB399",
      "#E666B3",
      "#33991A",
      "#CC9999",
      "#B3B31A",
      "#00E680",
      "#4D8066",
      "#809980",
      "#E6FF80",
      "#1AFF33",
      "#999933",
      "#FF3380",
      "#CCCC00",
      "#66E64D",
      "#4D80CC",
      "#9900B3",
      "#E64D66",
      "#4DB380",
      "#FF4D4D",
      "#99E6E6",
      "#6666FF",
      // Add more colors if needed
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading verticals data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="verticals-page">
      <h2>Verticals Overview</h2>
      <div className="verticals-container">
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

        <div className="verticals-pie-chart-container">
          <h3>Distribution of Vertical Chains</h3>
          <Pie
            data={pieChartData}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#fff",
                  },
                },
                tooltip: {
                  enabled: true,
                  titleColor: "#fff",
                  bodyColor: "#fff",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="verticals-bar-charts-grid">
        <div className="verticals-bar-chart-container">
          <h3>Total Transactions per Vertical</h3>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                  labels: {
                    color: "#fff",
                  },
                },
                tooltip: {
                  enabled: true,
                  titleColor: "#fff",
                  bodyColor: "#fff",
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
                },
              },
            }}
          />
        </div>

        <div className="verticals-bar-chart-container">
          <h3>DA Usage per Vertical</h3>
          <Bar
            data={daChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#fff",
                  },
                },
                tooltip: {
                  enabled: true,
                  titleColor: "#fff",
                  bodyColor: "#fff",
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
                },
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: "Verticals",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
                  },
                },
              },
            }}
          />
        </div>

        <div className="verticals-bar-chart-container">
          <h3>L2/L3 Usage per Vertical</h3>
          <Bar
            data={l2l3ChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#fff",
                  },
                },
                tooltip: {
                  enabled: true,
                  titleColor: "#fff",
                  bodyColor: "#fff",
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
                },
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: "Verticals",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
                  },
                },
              },
            }}
          />
        </div>

        <div className="verticals-bar-chart-container">
          <h3>Frameworks per Vertical</h3>
          <Bar
            data={verticalsFrameworksBarData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#fff",
                  },
                },
                tooltip: {
                  enabled: true,
                  titleColor: "#fff",
                  bodyColor: "#fff",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Number of Frameworks",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
                  },
                },
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: "Verticals",
                    color: "#fff",
                  },
                  ticks: {
                    color: "#fff",
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
