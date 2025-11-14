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
  const [timeRange, setTimeRange] = useState("month"); // default filter

  // ✅ Load sales data from localStorage every time it changes (like inventory)
  useEffect(() => {
    const loadSales = () => {
      const storedSales = JSON.parse(localStorage.getItem(STORAGE_SALES)) || [];
      setSales(storedSales);
    };

    loadSales();

    // Listen for other tabs or components changing localStorage
    window.addEventListener("storage", loadSales);

    return () => {
      window.removeEventListener("storage", loadSales);
    };
  }, []);

  // ✅ Generate report whenever sales or range changes
  useEffect(() => {
    generateReport();
  }, [sales, timeRange]);

  const generateReport = () => {
    const summaryData = { revenue: 0, profit: 0, itemsSold: 0, transactions: 0 };
    const byPeriod = {};

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

    // ✅ Filter sales within selected time range
    const filtered = sales.filter((sale) => new Date(sale.date) >= cutoff);

    filtered.forEach((sale) => {
      const { date, price, cost, qty } = sale;
      summaryData.revenue += price * qty;
      summaryData.profit += (price - cost) * qty;
      summaryData.itemsSold += qty;
      summaryData.transactions++;

      let label;
      if (timeRange === "day") {
        label = new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (["week", "month"].includes(timeRange)) {
        label = new Date(date).toLocaleDateString();
      } else {
        label = new Date(date).toLocaleString("default", { month: "short", year: "numeric" });
      }

      byPeriod[label] = (byPeriod[label] || 0) + price * qty;
    });

    setSummary(summaryData);
    setChartData(Object.entries(byPeriod));
  };

  const formatNumber = (n) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

  // ✅ Draw chart dynamically
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
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(x, padding + (h - barH), barW - 12, barH);

      if (barW > 40) {
        ctx.fillStyle = "#111";
        ctx.font = "10px sans-serif";
        ctx.fillText(label, x, height - 8);
      }
    });
  };

  const downloadReport = () => {
    const text = `
Retail Report Summary (${timeRange.toUpperCase()} VIEW)
---------------------
Total Revenue: ₹${formatNumber(summary.revenue)}
Total Profit: ₹${formatNumber(summary.profit)}
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
    <section className="p-6 bg-white rounded-xl shadow-lg min-h-[80vh]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          📊 Reports
        </h2>

        <div className="flex gap-3 items-center">
          {/* Dropdown */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="3month">3 Months</option>
            <option value="6month">6 Months</option>
            <option value="9month">9 Months</option>
            <option value="year">Year</option>
          </select>

          {/* Download Button */}
          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <h4 className="text-sm text-gray-600">Total Revenue</h4>
          <p className="text-xl font-bold text-blue-700">
            ₹{formatNumber(summary.revenue)}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <h4 className="text-sm text-gray-600">Total Profit</h4>
          <p className="text-xl font-bold text-green-700">
            ₹{formatNumber(summary.profit)}
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-center">
          <h4 className="text-sm text-gray-600">Items Sold</h4>
          <p className="text-xl font-bold text-indigo-700">
            {formatNumber(summary.itemsSold)}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
          <h4 className="text-sm text-gray-600">Transactions</h4>
          <p className="text-xl font-bold text-gray-700">
            {summary.transactions}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">
          Revenue Overview ({timeRange.toUpperCase()} VIEW)
        </h4>
        <canvas id="salesChart" className="w-full h-64 bg-white rounded-lg" />
      </div>
    </section>
  );
}
