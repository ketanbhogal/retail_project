import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const STORAGE_PRODUCTS = "rt_products_v1";
const STORAGE_SALES = "rt_sales_v1";

export default function Sidebar() {
  const [productCount, setProductCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const readCounts = () => {
      try {
        const pRaw = localStorage.getItem(STORAGE_PRODUCTS);
        const sRaw = localStorage.getItem(STORAGE_SALES);
        const p = pRaw ? JSON.parse(pRaw) : [];
        const s = sRaw ? JSON.parse(sRaw) : [];
        setProductCount(Array.isArray(p) ? p.length : 0);
        setSalesCount(Array.isArray(s) ? s.length : 0);
      } catch {
        setProductCount(0);
        setSalesCount(0);
      }
    };

    readCounts();

    const onStorage = (e) => {
      if (e.key === STORAGE_PRODUCTS || e.key === STORAGE_SALES) readCounts();
    };
    window.addEventListener("storage", onStorage);

    const t = setInterval(readCounts, 900);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // clear authentication
    navigate("/login"); // redirect to login
  };

  // ✅ Added Profile route below Reports
  const menu = [
    { label: "Dashboard", to: "/dashboard", emoji: "🏠" },
    { label: "Inventory", to: "/dashboard/inventory", emoji: "📦" },
    { label: "Sales History", to: "/dashboard/sales", emoji: "🧾" },
    { label: "Reports", to: "/dashboard/reports", emoji: "📊" },
    { label: "Profile", to: "/dashboard/profile", emoji: "👤" }, // ✅ Profile route
    { label: "Settings", to: "/dashboard/settings", emoji: "⚙️" },
  ];

  const activeClass =
    "flex items-center gap-3 px-4 py-3 rounded-md font-medium bg-blue-50 text-blue-600";
  const inactiveClass =
    "flex items-center gap-3 px-4 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-100";

  return (
    <aside className="w-64 h-screen bg-white rounded-xl p-5 shadow-lg fixed left-4 top-4 flex flex-col justify-between">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-white"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
          >
            RT
          </div>
          <div>
            <h3 className="text-lg font-semibold">RetailTrack</h3>
            <small className="text-sm text-gray-500">Inventory SaaS UI</small>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-3">
          <ul className="space-y-1">
            {menu.map((m) => (
              <li key={m.to}>
                <NavLink
                  to={m.to}
                  end
                  className={({ isActive }) =>
                    isActive ? activeClass : inactiveClass
                  }
                >
                  <span className="text-base">{m.emoji}</span>
                  <span>{m.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Plan / Counts card */}
        <div className="mt-6 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
          <div className="flex justify-between items-center">
            <strong>Plan</strong>
          </div>

          <div className="mt-3 text-gray-600">
            <div className="flex justify-between">
              <span>Products:</span>
              <strong>{productCount}</strong>
            </div>
            <div className="flex justify-between mt-1">
              <span>Sales:</span>
              <strong>{salesCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Logout Button */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 mt-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md transition duration-200"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
