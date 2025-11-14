import React, { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_PRODUCTS = "rt_products_v1";
const STORAGE_SALES = "rt_sales_v1";

function uid() {
  return "p_" + Math.random().toString(36).slice(2, 9);
}

function seedIfEmpty() {
  if (!localStorage.getItem(STORAGE_PRODUCTS)) {
    const demo = [
      { id: uid(), name: "Rice - Basmati", sku: "RICE-BAS", unit: "kg", qty: 120, cost: 40, price: 55 },
      { id: uid(), name: "Milk", sku: "MILK-1L", unit: "litre", qty: 500, cost: 30, price: 45 },
      { id: uid(), name: "Soap Bar", sku: "SOAP-100", unit: "piece", qty: 200, cost: 12, price: 25 },
    ];
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(demo));
  }
  if (!localStorage.getItem(STORAGE_SALES)) {
    localStorage.setItem(STORAGE_SALES, JSON.stringify([]));
  }
}

export default function DashboardHome() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [filter, setFilter] = useState("Month"); // <-- Active time range filter
  const revCanvasRef = useRef(null);

  // Load data from localStorage
  const loadData = useCallback(() => {
    seedIfEmpty();
    try {
      const pRaw = localStorage.getItem(STORAGE_PRODUCTS);
      const sRaw = localStorage.getItem(STORAGE_SALES);
      setProducts(pRaw ? JSON.parse(pRaw) : []);
      setSales(sRaw ? JSON.parse(sRaw) : []);
    } catch (e) {
      console.error("Failed to parse storage data", e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const onStorage = (e) => {
      if (e.key === STORAGE_PRODUCTS || e.key === STORAGE_SALES) loadData();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadData]);

  // Derived Stats
  const totalRevenue = sales.reduce((s, r) => s + (Number(r.price) || 0) * (Number(r.qty) || 0), 0);
  const totalProfit = sales.reduce(
    (s, r) => s + ((Number(r.price) || 0) - (Number(r.cost) || 0)) * (Number(r.qty) || 0),
    0
  );
  const lowStockCount = products.filter((p) => {
    const threshold = p.unit === "kg" || p.unit === "litre" ? 10 : 20;
    return Number(p.qty) <= threshold;
  }).length;

  // Helpers: recent sales & inventory
  const recentSales = sales.slice(-5).reverse();
  const inventorySnapshot = products.slice(0, 6);

  // Compute chart data by selected filter
  const computeSeries = useCallback(() => {
    const now = new Date();
    let rangeDays = 30;

    switch (filter) {
      case "Day":
        rangeDays = 1;
        break;
      case "Week":
        rangeDays = 7;
        break;
      case "Month":
        rangeDays = 30;
        break;
      case "3M":
        rangeDays = 90;
        break;
      case "6M":
        rangeDays = 180;
        break;
      case "Year":
        rangeDays = 365;
        break;
      default:
        rangeDays = 30;
    }

    const lastN = {};
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      lastN[d.toLocaleDateString()] = 0;
    }

    sales.forEach((s) => {
      const d = new Date(s.date || Date.now()).toLocaleDateString();
      if (d in lastN) {
        lastN[d] += (Number(s.price) || 0) * (Number(s.qty) || 0);
      }
    });

    return Object.entries(lastN);
  }, [sales, filter]);

  // Draw Bar Chart
  const drawBarChart = useCallback((canvas, data) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padding = 36;
    const innerW = w - padding * 2;
    const innerH = h - padding * 2;
    const vals = data.map((d) => d[1]);
    const max = Math.max(...vals, 1);
    const barW = innerW / Math.max(data.length, 1);

    ctx.fillStyle = "#eef2ff";
    ctx.fillRect(0, 0, w, h);

    data.forEach((d, i) => {
      const x = padding + i * barW + 6;
      const barH = (d[1] / max) * (innerH - 10);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(x, padding + (innerH - barH), Math.max(4, barW - 12), barH);
      if (barW > 40) {
        ctx.fillStyle = "#111827";
        ctx.font = "11px sans-serif";
        const lbl = String(d[0]).split("/").slice(0, 2).join("/");
        ctx.fillText(lbl, x, h - 8);
      }
    });
  }, []);

  // Redraw when sales/filter changes
  useEffect(() => {
    const canvas = revCanvasRef.current;
    if (!canvas) return;
    const data = computeSeries();
    drawBarChart(canvas, data);

    const handleResize = () => drawBarChart(canvas, data);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sales, filter, computeSeries, drawBarChart]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  const filters = ["Day", "Week", "Month", "3M", "6M", "Year"];

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search product, SKU or customer..."
            className="px-3 py-2 border rounded-lg w-72"
          />
          <div className="flex gap-3">
            <div className="bg-white p-3 rounded-lg shadow text-sm">
              <small className="text-gray-500">Total Revenue</small>
              <div className="font-semibold">₹{Number(totalRevenue).toLocaleString()}</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow text-sm">
              <small className="text-gray-500">Total Profit</small>
              <div className="font-semibold">₹{Number(totalProfit).toLocaleString()}</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow text-sm">
              <small className="text-gray-500">Low Stock</small>
              <div className="font-semibold">{lowStockCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Sales</h3>
              <div className="text-sm text-gray-500">{sales.length} total</div>
            </div>
            {recentSales.length === 0 ? (
              <div className="text-gray-500 p-6">No sales recorded yet.</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600 border-b">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3">Total</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((s, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm text-gray-700">
                          {new Date(s.date).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-sm">{s.productName || s.product || "—"}</td>
                        <td className="py-3 px-3 text-sm">{s.qty}</td>
                        <td className="py-3 px-3 text-sm font-semibold text-blue-600">
                          ₹{((Number(s.price) || 0) * (Number(s.qty) || 0)).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              s.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {s.status || "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inventory Snapshot */}
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <h3 className="text-lg font-semibold mb-3">Inventory Snapshot</h3>
            {(searchQ ? filteredProducts : inventorySnapshot).length === 0 ? (
              <div className="text-gray-500 p-6">No products found.</div>
            ) : (
              <div className="space-y-2">
                {(searchQ ? filteredProducts : inventorySnapshot).map((p) => (
                  <div key={p.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.sku} • <span className="text-gray-600">{p.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{p.qty}</div>
                      <div className="text-xs text-gray-500">₹{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chart + Filters */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Revenue (last {filter === "Day" ? "24h" : filter})
              </h3>
              <div className="text-sm text-gray-500">{sales.length} transactions</div>
            </div>
            <div className="h-56">
              <canvas ref={revCanvasRef} className="w-full h-full" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
            <h4 className="font-semibold mb-2">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Prototype UI — data stored in browser (localStorage). Connect a backend to persist centrally.
      </div>
    </div>
  );
}
