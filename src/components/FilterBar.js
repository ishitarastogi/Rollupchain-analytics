// src/components/FilterBar.js

import React from "react";
import { FaColumns } from "react-icons/fa";
import "./FilterBar.css";

const FilterBar = ({
  filters,
  setFilters,
  setSortConfig,
  uniqueOptions,
  resetFiltersAndSorting,
  setShowSettings,
}) => {
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    resetFiltersAndSorting(); // Reset both filters and sorting
  };

  return (
    <div className="filter-bar">
      {/* Dropdowns Section */}
      <div className="filter-dropdowns">
        {/* Controlled Dropdown for Rollups */}
        <select
          name="rollups"
          value={filters.rollups}
          onChange={handleFilterChange}
          aria-label="Filter by Rollups"
        >
          <option value="">All Rollups</option>
          {uniqueOptions.rollups?.map((rollup, index) => (
            <option key={index} value={rollup}>
              {rollup}
            </option>
          ))}
        </select>

        {/* Controlled Dropdown for Frameworks */}
        <select
          name="frameworks"
          value={filters.frameworks}
          onChange={handleFilterChange}
          aria-label="Filter by Frameworks"
        >
          <option value="">All Frameworks</option>
          {uniqueOptions.frameworks?.map((framework, index) => (
            <option key={index} value={framework}>
              {framework}
            </option>
          ))}
        </select>

        {/* Controlled Dropdown for DAs */}
        <select
          name="das"
          value={filters.das}
          onChange={handleFilterChange}
          aria-label="Filter by DAs"
        >
          <option value="">All DAs</option>
          {uniqueOptions.das?.map((da, index) => (
            <option key={index} value={da}>
              {da}
            </option>
          ))}
        </select>

        {/* Controlled Dropdown for Verticals */}
        <select
          name="verticals"
          value={filters.verticals}
          onChange={handleFilterChange}
          aria-label="Filter by Verticals"
        >
          <option value="">All Verticals</option>
          {uniqueOptions.verticals?.map((vertical, index) => (
            <option key={index} value={vertical}>
              {vertical}
            </option>
          ))}
        </select>

        {/* Controlled Dropdown for RaaS Providers */}
        <select
          name="raasProviders"
          value={filters.raasProviders}
          onChange={handleFilterChange}
          aria-label="Filter by RaaS Providers"
        >
          <option value="">All RaaS Providers</option>
          {uniqueOptions.raasProviders?.map((provider, index) => (
            <option key={index} value={provider}>
              {provider}
            </option>
          ))}
        </select>

        {/* Controlled Dropdown for L2/L3 */}
        <select
          name="l2OrL3"
          value={filters.l2OrL3}
          onChange={handleFilterChange}
          aria-label="Filter by L2/L3"
        >
          <option value="">All L2/L3</option>
          {uniqueOptions.l2OrL3?.map((l2OrL3, index) => (
            <option key={index} value={l2OrL3}>
              {l2OrL3}
            </option>
          ))}
        </select>
      </div>

      {/* Actions Section */}
      <div className="filter-actions-container">
        {/* Date Range Buttons */}
        <div className="date-range">
          <button
            className={filters.dateRange === "All" ? "active" : ""}
            onClick={() => setFilters({ ...filters, dateRange: "All" })}
            aria-label="Select All Time Range"
          >
            All
          </button>
          <button
            className={filters.dateRange === "1W" ? "active" : ""}
            onClick={() => setFilters({ ...filters, dateRange: "1W" })}
            aria-label="Select 1 Week Time Range"
          >
            1W
          </button>
          <button
            className={filters.dateRange === "1M" ? "active" : ""}
            onClick={() => setFilters({ ...filters, dateRange: "1M" })}
            aria-label="Select 1 Month Time Range"
          >
            1M
          </button>
          <button
            className={filters.dateRange === "3M" ? "active" : ""}
            onClick={() => setFilters({ ...filters, dateRange: "3M" })}
            aria-label="Select 3 Months Time Range"
          >
            3M
          </button>
          <button
            className={filters.dateRange === "1Y" ? "active" : ""}
            onClick={() => setFilters({ ...filters, dateRange: "1Y" })}
            aria-label="Select 1 Year Time Range"
          >
            1Y
          </button>
        </div>

        {/* Filter Action Buttons */}
        <div className="filter-actions">
          <button
            className="reset-button"
            onClick={resetFilters}
            aria-label="Reset All Filters"
          >
            Reset Filters
          </button>
          <button
            className="columns-button"
            onClick={() => setShowSettings(true)}
            aria-label="Adjust Columns"
            title="Adjust Columns"
          >
            <FaColumns /> Columns
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
