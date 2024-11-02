// src/components/Table.js
import React, { useState, useEffect } from "react";
import {
  fetchGoogleSheetData,
  fetchBlockExplorerData,
} from "../services/fetchGoogleSheetData";
import FilterBar from "./FilterBar";
import "./Table.css";

const Table = () => {
  // **State Variables**
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rollups: "",
    frameworks: "",
    das: "",
    verticals: "",
    raasProviders: "",
    l2OrL3: "",
    dateRange: "All",
  });
  const [uniqueOptions, setUniqueOptions] = useState({
    rollups: [],
    frameworks: [],
    das: [],
    verticals: [],
    raasProviders: [],
    l2OrL3: [],
  });

  // State for column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    launchDate: true,
    tps: false,
    totalTransactions: true,
    totalAddresses: true,
    transactionsToday: true,
    last30DaysTxCount: true,
    l2OrL3: true,
    settlement: true,
    framework: false,
    da: false,
    vertical: false,
    raas: false,
  });

  // State for toggling the settings modal
  const [showSettings, setShowSettings] = useState(false);

  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const getData = async () => {
      try {
        const initialData = await fetchGoogleSheetData();
        const enrichedData = await Promise.all(
          initialData.map(async (row) => {
            const updatedRow = await fetchBlockExplorerData(row);
            return updatedRow;
          })
        );
        setSheetData(enrichedData);

        const rollups = [...new Set(enrichedData.map((row) => row.name))];
        const frameworks = [
          ...new Set(enrichedData.map((row) => row.framework)),
        ];
        const das = [...new Set(enrichedData.map((row) => row.da))];
        const verticals = [...new Set(enrichedData.map((row) => row.vertical))];
        const raasProviders = [...new Set(enrichedData.map((row) => row.raas))];
        const l2OrL3 = [...new Set(enrichedData.map((row) => row.l2OrL3))];

        setUniqueOptions({
          rollups,
          frameworks,
          das,
          verticals,
          raasProviders,
          l2OrL3,
        });

        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    getData();
  }, []);

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === "--" || isNaN(num)) return "--";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toString();
  };

  // Updated filterData function with date range filtering
  const filterData = (data) => {
    return data.filter((row) => {
      const now = new Date();
      const launchDate = new Date(row.launchDate);
      let dateMatch = true;

      if (filters.dateRange !== "All") {
        const timeDiff = now - launchDate;
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = oneDay * 7;
        const oneMonth = oneDay * 30;
        const threeMonths = oneDay * 90;
        const oneYear = oneDay * 365;

        switch (filters.dateRange) {
          case "1W":
            dateMatch = timeDiff <= oneWeek;
            break;
          case "1M":
            dateMatch = timeDiff <= oneMonth;
            break;
          case "3M":
            dateMatch = timeDiff <= threeMonths;
            break;
          case "1Y":
            dateMatch = timeDiff <= oneYear;
            break;
          default:
            dateMatch = true;
        }
      }

      return (
        dateMatch &&
        (!filters.rollups || row.name === filters.rollups) &&
        (!filters.frameworks || row.framework === filters.frameworks) &&
        (!filters.das || row.da === filters.das) &&
        (!filters.verticals || row.vertical === filters.verticals) &&
        (!filters.raasProviders || row.raas === filters.raasProviders) &&
        (!filters.l2OrL3 || row.l2OrL3 === filters.l2OrL3)
      );
    });
  };

  const filteredData = filterData(sheetData);

  // Sorting function
  const sortedData = React.useMemo(() => {
    if (sortConfig.key) {
      return [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle numeric and string values
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        } else {
          return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
      });
    } else {
      return filteredData;
    }
  }, [filteredData, sortConfig]);

  // Function to handle sorting
  const handleSort = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Reset filters and sorting
  const resetFiltersAndSorting = () => {
    setFilters({
      rollups: "",
      frameworks: "",
      das: "",
      verticals: "",
      raasProviders: "",
      l2OrL3: "",
      dateRange: "All",
    });
    setSortConfig({ key: null, direction: "asc" }); // Reset sorting
  };

  // Determine if any row has L2/L3 as 'L3' to conditionally display the Settlement column
  const hasL3 = sortedData.some((row) => row.l2OrL3 === "L3");

  if (loading) {
    return <div className="loading-message">Loading data, please wait...</div>;
  }

  return (
    <div>
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        setSortConfig={setSortConfig}
        uniqueOptions={uniqueOptions}
        resetFiltersAndSorting={resetFiltersAndSorting}
        setShowSettings={setShowSettings}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Column Settings</h2>
            {Object.keys(columnVisibility).map((columnKey) => (
              <label key={columnKey}>
                <input
                  type="checkbox"
                  checked={columnVisibility[columnKey]}
                  onChange={() =>
                    setColumnVisibility({
                      ...columnVisibility,
                      [columnKey]: !columnVisibility[columnKey],
                    })
                  }
                />
                {columnKey === "l2OrL3"
                  ? "L2/L3"
                  : columnKey.charAt(0).toUpperCase() +
                    columnKey.slice(1).replace(/([A-Z])/g, " $1")}
              </label>
            ))}
            <button
              className="close-button"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columnVisibility.name && (
                  <th
                    onClick={() => handleSort("name")}
                    className={
                      sortConfig.key === "name"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Rollup Name <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.launchDate && (
                  <th
                    onClick={() => handleSort("launchDate")}
                    className={
                      sortConfig.key === "launchDate"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Launch Date <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.tps && (
                  <th
                    onClick={() => handleSort("tps")}
                    className={
                      sortConfig.key === "tps"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    TPS <span className="sort-icon">⇅</span>
                  </th>
                )}

                {columnVisibility.totalTransactions && (
                  <th
                    onClick={() => handleSort("totalTransactions")}
                    className={
                      sortConfig.key === "totalTransactions"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Total Transactions <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.totalAddresses && (
                  <th
                    onClick={() => handleSort("totalAddresses")}
                    className={
                      sortConfig.key === "totalAddresses"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Total Addresses <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.transactionsToday && (
                  <th
                    onClick={() => handleSort("transactionsToday")}
                    className={
                      sortConfig.key === "transactionsToday"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Daily Transactions <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.last30DaysTxCount && (
                  <th
                    onClick={() => handleSort("last30DaysTxCount")}
                    className={
                      sortConfig.key === "last30DaysTxCount"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    30 Day Tx Count <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.l2OrL3 && (
                  <th
                    onClick={() => handleSort("l2OrL3")}
                    className={
                      sortConfig.key === "l2OrL3"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    L2/L3 <span className="sort-icon">⇅</span>
                  </th>
                )}
                {hasL3 && columnVisibility.settlement && (
                  <th
                    onClick={() => handleSort("settlement")}
                    className={
                      sortConfig.key === "settlement"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Settlement <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.framework && (
                  <th
                    onClick={() => handleSort("framework")}
                    className={
                      sortConfig.key === "framework"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Framework <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.da && (
                  <th
                    onClick={() => handleSort("da")}
                    className={
                      sortConfig.key === "da"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    DA <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.vertical && (
                  <th
                    onClick={() => handleSort("vertical")}
                    className={
                      sortConfig.key === "vertical"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    Vertical <span className="sort-icon">⇅</span>
                  </th>
                )}
                {columnVisibility.raas && (
                  <th
                    onClick={() => handleSort("raas")}
                    className={
                      sortConfig.key === "raas"
                        ? sortConfig.direction === "asc"
                          ? "sort-asc"
                          : "sort-desc"
                        : ""
                    }
                  >
                    RaaS Provider <span className="sort-icon">⇅</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index}>
                  {columnVisibility.name && <td>{row.name}</td>}
                  {columnVisibility.launchDate && (
                    <td>
                      {row.launchDate
                        ? new Date(row.launchDate).toLocaleDateString()
                        : "--"}
                    </td>
                  )}
                  {columnVisibility.tps && <td>--</td>}
                  {columnVisibility.totalTransactions && (
                    <td>{formatNumber(Number(row.totalTransactions))}</td>
                  )}
                  {columnVisibility.totalAddresses && (
                    <td>{formatNumber(Number(row.totalAddresses))}</td>
                  )}
                  {columnVisibility.transactionsToday && (
                    <td>{formatNumber(Number(row.transactionsToday))}</td>
                  )}
                  {columnVisibility.last30DaysTxCount && (
                    <td>{formatNumber(Number(row.last30DaysTxCount))}</td>
                  )}
                  {columnVisibility.l2OrL3 && <td>{row.l2OrL3}</td>}
                  {hasL3 && columnVisibility.settlement && (
                    <td>{row.l2OrL3 === "L3" ? row.settlement : "--"}</td>
                  )}
                  {columnVisibility.framework && <td>{row.framework}</td>}
                  {columnVisibility.da && <td>{row.da}</td>}
                  {columnVisibility.vertical && <td>{row.vertical}</td>}
                  {columnVisibility.raas && <td>{row.raas}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Table;
