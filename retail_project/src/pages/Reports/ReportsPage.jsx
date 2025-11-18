import React, { useEffect, useState } from "react";

export default function ReportsPage() {
  const STORAGE_SALES = "rt_sales_v1";

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    revenue: 0,
    profit: 0,
    itemsSold: 0,
    transactions: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [profitChartData, setProfitChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [timeRange, setTimeRange] = useState("month");

  const COLORS = [
    "#2563eb",
    "#7c3aed",
    "#0ea5e9",
    "#f97316",
    "#dc2626",
    "#059669",
    "#b91c1c",
    "#9333ea",
    "#0284c7",
    "#d97706",
  ];

  useEffect(() => {
    const loadSales = () => {
      const storedSales = JSON.parse(localStorage.getItem(STORAGE_SALES)) || [];
      setSales(storedSales);
    };

    loadSales();
    window.addEventListener("storage", loadSales);

    return () => window.removeEventListener("storage", loadSales);
  }, []);

  useEffect(() => {
    generateReport();
  }, [sales, timeRange]);

  const generateReport = () => {
    const summaryData = {
      revenue: 0,
      profit: 0,
      itemsSold: 0,
      transactions: 0,
    };

    const byPeriod = {};
    const productStats = {};

    const now = new Date();
    let cutoff = new Date();

    switch (timeRange) {
      case "day":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "3month":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case "6month":
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "9month":
        cutoff.setMonth(now.getMonth() - 9);
        break;
      case "year":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoff = new Date(0);
    }

    const filtered = sales.filter((sale) => new Date(sale.date) >= cutoff);

    filtered.forEach((sale) => {
      const { date, price, cost, qty, productName } = sale;

      summaryData.revenue += price * qty;
      summaryData.profit += (price - cost) * qty;
      summaryData.itemsSold += qty;
      summaryData.transactions++;

      if (productName) {
        if (!productStats[productName]) {
          productStats[productName] = { qty: 0, profit: 0 };
        }
        productStats[productName].qty += qty;
        productStats[productName].profit += (price - cost) * qty;
      }

      let label;
      if (timeRange === "day") {
        label = new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (["week", "month"].includes(timeRange)) {
        label = new Date(date).toLocaleDateString();
      } else {
        label = new Date(date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      }

      byPeriod[label] = (byPeriod[label] || 0) + price * qty;
    });

    setSummary(summaryData);
    setChartData(Object.entries(byPeriod));

    const sorted = Object.entries(productStats).sort(
      (a, b) => b[1].qty - a[1].qty
    );

    setTopProducts(sorted.slice(0, 5));

    // ✅ FIX: Only 5 products in profit chart
    setProfitChartData(
      sorted.slice(0, 5).map(([name, data]) => [name, data.profit])
    );
  };

  const formatNumber = (n) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

  useEffect(() => {
    if (chartData.length) drawChart();
  }, [chartData]);

  const drawChart = () => {
    const canvas = document.getElementById("salesChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const padding = 36;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const max = Math.max(...chartData.map((d) => d[1]), 1);
    const barW = w / chartData.length;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    chartData.forEach(([label, value], i) => {
      const x = padding + i * barW + 6;
      const barH = (value / max) * (h - 10);

      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fillRect(x, padding + (h - barH), barW - 12, barH);

      if (barW > 40) {
        ctx.fillStyle = "#111";
        ctx.font = "10px sans-serif";
        ctx.fillText(label, x, height - 8);
      }
    });
  };

  useEffect(() => {
    if (profitChartData.length) drawProfitChart();
  }, [profitChartData]);

  const drawProfitChart = () => {
    const canvas = document.getElementById("profitChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const padding = 36;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const max = Math.max(...profitChartData.map((d) => d[1]), 1);
    const barW = w / profitChartData.length;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    profitChartData.forEach(([label, value], i) => {
      const x = padding + i * barW + 6;
      const barH = (value / max) * (h - 10);

      ctx.fillStyle = COLORS[(i + 2) % COLORS.length];
      ctx.fillRect(x, padding + (h - barH), barW - 12, barH);

      ctx.fillStyle = "#111";
      ctx.font = "10px sans-serif";
      ctx.fillText(label, x, height - 8);
    });
  };

  const downloadReport = () => {
    const text = `
Retail Report Summary (${timeRange.toUpperCase()})
------------------------------------
Revenue: ₹${formatNumber(summary.revenue)}
Profit: ₹${formatNumber(summary.profit)}
Items Sold: ${formatNumber(summary.itemsSold)}
Transactions: ${summary.transactions}
`;

    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "retail_report.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="p-8 bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl shadow-2xl min-h-[85vh] border border-gray-300">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-md border">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          📊 Reports Dashboard
        </h2>

        <div className="flex gap-3 items-center">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm hover:border-gray-400 transition"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="3month">3 Months</option>
            <option value="6month">6 Months</option>
            <option value="9month">9 Months</option>
            <option value="year">Year</option>
          </select>

          <button
            onClick={downloadReport}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-md"
          >
            Download
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border p-5 rounded-xl shadow-md text-center">
          <h4 className="text-sm text-gray-600">Total Revenue</h4>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">
            ₹{formatNumber(summary.revenue)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border p-5 rounded-xl shadow-md text-center">
          <h4 className="text-sm text-gray-600">Total Profit</h4>
          <p className="text-2xl font-extrabold text-green-700 mt-1">
            ₹{formatNumber(summary.profit)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border p-5 rounded-xl shadow-md text-center">
          <h4 className="text-sm text-gray-600">Items Sold</h4>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">
            {formatNumber(summary.itemsSold)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-200 border p-5 rounded-xl shadow-md text-center">
          <h4 className="text-sm text-gray-600">Transactions</h4>
          <p className="text-2xl font-extrabold text-gray-700 mt-1">
            {summary.transactions}
          </p>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white border rounded-xl p-6 mb-10 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-700">
          Revenue Overview ({timeRange.toUpperCase()})
        </h4>
        <canvas
          id="salesChart"
          className="w-full h-64 bg-gray-100 rounded-lg shadow-inner"
        />
      </div>

      {/* PROFIT CHART */}
      <div className="bg-white border rounded-xl p-6 mb-10 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-700">
          Profit Comparison – Top 5 Products ({timeRange.toUpperCase()})
        </h4>
        <canvas
          id="profitChart"
          className="w-full h-64 bg-gray-100 rounded-lg shadow-inner"
        />
      </div>

      {/* TOP PRODUCTS LIST */}
      <div className="bg-white border rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">
          Top 5 Best-Selling Products
        </h4>

        {topProducts.length === 0 ? (
          <p className="text-gray-600 text-sm">No sales during this period.</p>
        ) : (
          <ul className="space-y-3">
            {topProducts.map(([name, stats], i) => (
              <li
                key={i}
                className="flex justify-between bg-gray-50 border p-4 rounded-lg shadow-sm hover:bg-gray-100 transition"
              >
                <span className="font-medium text-gray-800">
                  {i + 1}. {name}
                </span>
                <span className="text-gray-700">
                  {stats.qty} sold —{" "}
                  <span className="text-green-700 font-bold">
                    ₹{formatNumber(stats.profit)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
