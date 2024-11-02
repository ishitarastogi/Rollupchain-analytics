// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import WeeklyTransactionsChart from "./components/WeeklyTransactionsChart";
import Table from "./components/Table";
import VerticalsPage from "./pages/VerticalsPage";
import DAPage from "./pages/DAPage";
import FrameworksPage from "./pages/FrameworksPage";
import RaaSProvidersPage from "./pages/RaaSProvidersPage";
import HeaderBox from "./components/HeaderBox"; // Import the HeaderBox component
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          {/* Header Card */}
          <HeaderBox
            title="Rollup Terminal"
            description="Welcome to the Rollup Terminal. Here you can monitor weekly transactions and explore detailed analytics."
          />

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <WeeklyTransactionsChart />
                  <Table />
                </>
              }
            />
            <Route path="/verticals" element={<VerticalsPage />} />
            <Route path="/da" element={<DAPage />} />
            <Route path="/frameworks" element={<FrameworksPage />} />
            <Route path="/raas-providers" element={<RaaSProvidersPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
