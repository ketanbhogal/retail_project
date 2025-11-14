import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="w-screen h-screen bg-gray-100 flex justify-center items-start overflow-y-auto p-0 m-0">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen overflow-auto p-0">
        <div className="p-6"> 
          <Outlet />
        </div>
      </div>

    </div>
  );
}
