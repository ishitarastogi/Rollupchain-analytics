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

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeaderBox
                    title="Rollup Explorer"
                    description="Welcome to the Rollup Explorer to understand appchain trends."
                  />
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
