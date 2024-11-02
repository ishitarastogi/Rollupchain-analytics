// src/services/fetchGoogleSheetData.js
import axios from "axios";

// Securely access your API key from environment variables
const GOOGLE_SHEET_API_KEY = process.env.REACT_APP_GOOGLE_SHEET_API_KEY;

// Replace with your own Google Sheets ID and sheet name
const SPREADSHEET_ID = "1IuSBmbdAu_fdQ4X3VCgAEz1wSxdYiJe8Kn5lUtnr2tg";
const SHEET_NAME = "Sheet1";
const RANGE = "A2:Z1000";

// Construct the Google Sheets API URL
const GOOGLE_SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=AIzaSyAG8hFaegrHjZ5Wn8D7XmCAh8ydDnuH4WI`;

// Function to fetch stats from the explorer's API
const fetchExplorerStats = async (blockExplorerUrl) => {
  try {
    const statsResponse = await axios.get(`${blockExplorerUrl}/api/v2/stats`, {
      timeout: 5000,
    });

    const chartsResponse = await axios.get(
      `${blockExplorerUrl}/api/v2/stats/charts/transactions`,
      { timeout: 5000 }
    );

    const totalAddresses = statsResponse.data.total_addresses;
    const totalTransactions = statsResponse.data.total_transactions;
    const transactionsToday = statsResponse.data.transactions_today;

    // Sum the transaction counts from the last 30 days
    const transactionChartData = chartsResponse.data.chart_data;
    const last30DaysTxCount = transactionChartData.reduce(
      (sum, day) => sum + day.tx_count,
      0
    );

    return {
      totalAddresses,
      totalTransactions,
      transactionsToday,
      last30DaysTxCount,
    };
  } catch (error) {
    console.error("Error fetching explorer stats:", error);
    return {
      totalAddresses: "--",
      totalTransactions: "--",
      transactionsToday: "--",
      last30DaysTxCount: "--",
    };
  }
};

// Fetch Google Sheets data directly using the Google Sheets API
export const fetchGoogleSheetData = async () => {
  try {
    const response = await axios.get(GOOGLE_SHEET_URL, { timeout: 5000 });
    const sheetData = response.data.values;

    // Create an initial parsed data with placeholders for block explorer data
    const parsedData = sheetData.map((rowData) => ({
      name: rowData[0] || "--",
      blockExplorerUrl: rowData[1]?.trim() || "--",
      raas: rowData[3] || "--",
      launchDate: rowData[7] || "--",
      vertical: rowData[8] || "--",
      framework: rowData[9] || "--",
      da: rowData[10] || "--",
      l2OrL3: rowData[11] || "--",
      settlement: rowData[12] || "--", // Include settlement data from column 14 (index 13)
      totalAddresses: "--",
      totalTransactions: "--",
      transactionsToday: "--",
      last30DaysTxCount: "--",
      tvl: "--",
    }));

    // Fetch block explorer data for each chain
    const enhancedData = await Promise.all(
      parsedData.map(async (dataRow) => {
        if (dataRow.blockExplorerUrl && dataRow.blockExplorerUrl !== "--") {
          const explorerStats = await fetchExplorerStats(
            dataRow.blockExplorerUrl
          );
          return {
            ...dataRow,
            totalAddresses: explorerStats.totalAddresses,
            totalTransactions: explorerStats.totalTransactions,
            transactionsToday: explorerStats.transactionsToday,
            last30DaysTxCount: explorerStats.last30DaysTxCount,
          };
        } else {
          return dataRow;
        }
      })
    );

    return enhancedData;
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    throw error;
  }
};

// Export fetchBlockExplorerData if needed elsewhere
export const fetchBlockExplorerData = async (dataRow) => {
  try {
    const explorerStats = await fetchExplorerStats(dataRow.blockExplorerUrl);

    // Return updated row data with fetched block explorer stats
    return {
      ...dataRow,
      totalAddresses: explorerStats.totalAddresses,
      totalTransactions: explorerStats.totalTransactions,
      transactionsToday: explorerStats.transactionsToday,
      last30DaysTxCount: explorerStats.last30DaysTxCount,
    };
  } catch (error) {
    console.error("Error fetching block explorer data:", error);
    return dataRow;
  }
};
