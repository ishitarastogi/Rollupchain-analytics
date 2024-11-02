// src/pages/FrameworksPage.js

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
import "./FrameworksPage.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const FrameworksPage = () => {
  const [frameworksData, setFrameworksData] = useState([]);
  const [pieChartData, setPieChartData] = useState({});
  const [transactionsBarData, setTransactionsBarData] = useState({});
  const [verticalsBarData, setVerticalsBarData] = useState({});
  const [daBarData, setDaBarData] = useState({});
  const [l2l3BarData, setL2l3BarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processFrameworksData = async () => {
      try {
        const sheetData = await fetchGoogleSheetData();

        // Filter out chains without a framework
        const filteredData = sheetData.filter(
          (row) => row.framework && row.framework.trim() !== ""
        );

        // Group chains by framework
        const frameworksMap = {};

        filteredData.forEach((chain) => {
          const framework = chain.framework.trim();
          if (!frameworksMap[framework]) {
            frameworksMap[framework] = [];
          }
          frameworksMap[framework].push({
            name: chain.name,
            da: chain.da
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "--"),
            l2OrL3: chain.l2OrL3
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "--"),
            vertical: chain.vertical
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "--"),
            totalTransactions:
              chain.totalTransactions === "--"
                ? 0
                : Number(chain.totalTransactions),
          });
        });

        // Prepare data for table and charts
        const frameworksArray = Object.keys(frameworksMap).map((framework) => {
          const topChains = frameworksMap[framework]
            .sort((a, b) => b.totalTransactions - a.totalTransactions)
            .slice(0, 5)
            .map((chain) => chain.name);

          const totalChains = frameworksMap[framework].length;

          const totalTransactions = frameworksMap[framework].reduce(
            (sum, chain) => sum + chain.totalTransactions,
            0
          );

          return {
            framework,
            topChains,
            totalChains,
            totalTransactions,
            chains: frameworksMap[framework],
          };
        });

        // Prepare data for pie chart (distribution of chains across frameworks)
        const pieData = {
          labels: frameworksArray.map((f) => f.framework),
          datasets: [
            {
              label: "Number of Chains",
              data: frameworksArray.map((f) => f.totalChains),
              backgroundColor: generateColorPalette(frameworksArray.length),
              hoverOffset: 4,
            },
          ],
        };

        // Prepare data for transactions bar chart
        const transactionsBarData = {
          labels: frameworksArray.map((f) => f.framework),
          datasets: [
            {
              label: "Total Transactions",
              data: frameworksArray.map((f) => f.totalTransactions),
              backgroundColor: "rgba(255, 99, 132, 0.6)", // Changed color
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        };

        // Prepare data for verticals bar chart
        const verticalCategories = Array.from(
          new Set(
            frameworksArray.flatMap((f) =>
              f.chains.flatMap((chain) => chain.vertical)
            )
          )
        ).filter((vertical) => vertical !== "--");

        const verticalsBarData = {
          labels: frameworksArray.map((f) => f.framework),
          datasets: verticalCategories.map((vertical, index) => ({
            label: vertical,
            data: frameworksArray.map(
              (f) =>
                f.chains.filter((chain) => chain.vertical.includes(vertical))
                  .length
            ),
            backgroundColor: getDistinctColor(index),
          })),
        };

        // Prepare data for DA bar chart
        const daCategories = Array.from(
          new Set(
            frameworksArray.flatMap((f) =>
              f.chains.flatMap((chain) => chain.da)
            )
          )
        ).filter((da) => da !== "--");

        const daBarData = {
          labels: frameworksArray.map((f) => f.framework),
          datasets: daCategories.map((da, index) => ({
            label: da,
            data: frameworksArray.map(
              (f) => f.chains.filter((chain) => chain.da.includes(da)).length
            ),
            backgroundColor: getDistinctColor(index),
          })),
        };

        // Prepare data for L2/L3 bar chart
        const l2l3Categories = Array.from(
          new Set(
            frameworksArray.flatMap((f) =>
              f.chains.flatMap((chain) => chain.l2OrL3)
            )
          )
        ).filter((l2l3) => l2l3 !== "--");

        const l2l3BarData = {
          labels: frameworksArray.map((f) => f.framework),
          datasets: l2l3Categories.map((l2l3, index) => ({
            label: l2l3,
            data: frameworksArray.map(
              (f) =>
                f.chains.filter((chain) => chain.l2OrL3.includes(l2l3)).length
            ),
            backgroundColor: getDistinctColor(index),
          })),
        };

        setFrameworksData(frameworksArray);
        setPieChartData(pieData);
        setTransactionsBarData(transactionsBarData);
        setVerticalsBarData(verticalsBarData);
        setDaBarData(daBarData);
        setL2l3BarData(l2l3BarData);
        setLoading(false);
      } catch (err) {
        console.error("Error processing frameworks data:", err);
        setError("Failed to load frameworks data.");
        setLoading(false);
      }
    };

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

    processFrameworksData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading frameworks data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="frameworks-page">
      <h2>Frameworks Overview</h2>
      <div className="frameworks-container">
        <div className="frameworks-table-container">
          <h3>Frameworks and Top 5 Chains</h3>
          <table className="frameworks-table">
            <thead>
              <tr>
                <th>Framework Name (Total Chains)</th>
                <th>Top 5 Chains by Tx Count</th>
              </tr>
            </thead>
            <tbody>
              {frameworksData.map((framework, index) => (
                <tr key={index}>
                  <td>{`${framework.framework} (${framework.totalChains})`}</td>
                  <td>
                    {framework.topChains.length > 0
                      ? framework.topChains.join(", ")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="frameworks-pie-chart-container">
          <h3>Distribution of Framework Chains</h3>
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

      <div className="frameworks-bar-charts-grid">
        <div className="frameworks-bar-chart-container">
          <h3>Total Transactions per Framework</h3>
          <Bar
            data={transactionsBarData}
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
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Frameworks",
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

        <div className="frameworks-bar-chart-container">
          <h3>Verticals Usage per Framework</h3>
          <Bar
            data={verticalsBarData}
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
                    text: "Number of Chains",
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
                  stacked: true,
                  title: {
                    display: true,
                    text: "Frameworks",
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

        <div className="frameworks-bar-chart-container">
          <h3>DA Usage per Framework</h3>
          <Bar
            data={daBarData}
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
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                },
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: "Frameworks",
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

        <div className="frameworks-bar-chart-container">
          <h3>L2/L3 Usage per Framework</h3>
          <Bar
            data={l2l3BarData}
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
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                },
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: "Frameworks",
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

export default FrameworksPage;
