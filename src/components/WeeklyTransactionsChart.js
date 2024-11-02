// src/components/WeeklyTransactionsChart.js

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";
import { fetchGoogleSheetData } from "../services/fetchGoogleSheetData";
import "./WeeklyTransactionsChart.css";

ChartJS.register(TimeScale, LinearScale, BarElement, Tooltip, Legend);

const WeeklyTransactionsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        // Fetch the initial data from your Google Sheet
        const sheetData = await fetchGoogleSheetData();

        // Filter out chains that have block explorer URLs
        const chainsWithExplorer = sheetData.filter(
          (row) => row.blockExplorerUrl
        );

        const allTransactionData = [];

        for (const chain of chainsWithExplorer) {
          try {
            // Get the date range
            const oneYearAgo = DateTime.now().minus({ years: 1 }).toISODate();
            const today = DateTime.now().toISODate();

            // Fetch the transaction data
            const chartsResponse = await fetch(
              `${chain.blockExplorerUrl}/api/v2/stats/charts/transactions?from=${oneYearAgo}&to=${today}`
            );
            const chartsData = await chartsResponse.json();

            const chainData = chartsData.chart_data.map((dataPoint) => ({
              date: DateTime.fromISO(dataPoint.date).startOf("day"),
              tx_count: dataPoint.tx_count,
              chain: chain.name,
            }));

            allTransactionData.push(...chainData);
          } catch (error) {
            console.error(
              `Error fetching transaction data for ${chain.name}:`,
              error
            );
          }
        }

        if (allTransactionData.length === 0) {
          setLoading(false);
          return;
        }

        // Filter data from the last year
        const oneYearAgo = DateTime.now().minus({ years: 1 });
        const filteredData = allTransactionData.filter(
          (dataPoint) => dataPoint.date >= oneYearAgo
        );

        // Aggregate daily data into weekly totals
        const weeklyTotals = {};

        filteredData.forEach((dataPoint) => {
          const weekStart = dataPoint.date.startOf("week");
          const key = weekStart.toISODate();

          if (!weeklyTotals[key]) {
            weeklyTotals[key] = 0;
          }

          weeklyTotals[key] += dataPoint.tx_count;
        });

        // Prepare data for the chart
        const labels = Object.keys(weeklyTotals).sort();
        const data = labels.map((label) => weeklyTotals[label]);

        setChartData({
          labels: labels.map((date) => DateTime.fromISO(date).toJSDate()),
          datasets: [
            {
              label: "Weekly Total Transactions",
              data,
              backgroundColor: "rgba(255, 59, 87, 0.6)", // Updated to FF3B57 with 60% opacity
              borderColor: "rgba(255, 59, 87, 1)", // Updated to FF3B57 with full opacity
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading chart data...</div>;
  }

  return (
    <div className="weekly-transactions-chart">
      <h2>Weekly Total Transactions (1 Month)</h2>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "week",
                  tooltipFormat: "MMM dd, yyyy",
                  displayFormats: {
                    week: "MMM dd, yyyy",
                  },
                },
                title: {
                  display: true,
                  text: "Week Starting",
                  color: "#fff",
                },
                ticks: {
                  color: "#fff",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
              y: {
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
            },
            plugins: {
              legend: {
                labels: {
                  color: "#fff",
                },
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
          }}
        />
      ) : (
        <p>No data available for the chart.</p>
      )}
    </div>
  );
};

export default WeeklyTransactionsChart;
