import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faLink,
  faWallet,
  faCube,
  faUserCheck,
  faCompass,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <nav className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <FontAwesomeIcon icon={faCompass} className="logo-icon" />
        <span>Rollup Explorer</span>
      </div>

      <ul>
        {/* Home Button */}
        <li className="sidebar-home">
          <Link to="/" className="home-link">
            <FontAwesomeIcon icon={faHome} /> Home
          </Link>
        </li>

        {/* Ecosystem Category */}
        <li className="sidebar-category">
          <FontAwesomeIcon icon={faCube} /> Ecosystem
        </li>
        <ul className="sidebar-subcategories">
          <li>
            <Link to="/verticals" className="subcategory-link">
              Vertical
            </Link>
          </li>
          <li>
            <Link to="/frameworks" className="subcategory-link">
              Framework
            </Link>
          </li>
          <li>
            <Link to="/da" className="subcategory-link">
              Data Availability
            </Link>
          </li>
        </ul>
      </ul>
    </nav>
  );
};

export default Sidebar;
