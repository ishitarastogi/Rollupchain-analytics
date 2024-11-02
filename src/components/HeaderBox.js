// src/components/HeaderBox.js

import React from "react";
import "./HeaderBox.css";

const HeaderBox = ({ title, description }) => {
  return (
    <div className="header-card">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default HeaderBox;
