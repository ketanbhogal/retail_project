import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo / Brand Name */}
        <h1 className="text-2xl font-extrabold tracking-wide">
          Retail<span className="text-yellow-300">Hub</span>
        </h1>

        {/* Navigation Links */}
        <ul className="flex space-x-8 text-lg font-medium">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-yellow-300 transition duration-200 ${
                  isActive ? "text-yellow-300 border-b-2 border-yellow-300 pb-1" : ""
                }`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `hover:text-yellow-300 transition duration-200 ${
                  isActive ? "text-yellow-300 border-b-2 border-yellow-300 pb-1" : ""
                }`
              }
            >
              Login
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `hover:text-yellow-300 transition duration-200 ${
                  isActive ? "text-yellow-300 border-b-2 border-yellow-300 pb-1" : ""
                }`
              }
            >
              Signup
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
