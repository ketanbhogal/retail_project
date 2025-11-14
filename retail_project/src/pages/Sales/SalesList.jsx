// src/pages/SaleHistory.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function SaleHistory() {
  const STORAGE_PRODUCTS = "rt_products_v1";
  const STORAGE_SALES = "rt_sales_v1";
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null or { type: "add"|"edit", data: saleObj }
  const [tableHeight, setTableHeight] = useState("calc(100vh - 380px)"); // fallback

  // UID helper
  const uid = () => `s_${Math.random().toString(36).slice(2, 9)}`;

  // Load initial data and seed demo products if not present
  useEffect(() => {
    try {
      const pRaw = localStorage.getItem(STORAGE_PRODUCTS);
      const sRaw = localStorage.getItem(STORAGE_SALES);
      if (pRaw) setProducts(JSON.parse(pRaw));
      else {
        const demo = [
          { id: `p_${Date.now()}_1`, name: "Rice - Basmati", sku: "RICE-BAS", unit: "kg", qty: 120, cost: 40, price: 55 },
          { id: `p_${Date.now()}_2`, name: "Milk", sku: "MILK-1L", unit: "litre", qty: 500, cost: 30, price: 45 },
          { id: `p_${Date.now()}_3`, name: "Soap Bar", sku: "SOAP-100", unit: "piece", qty: 200, cost: 12, price: 25 },
        ];
        localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(demo));
        setProducts(demo);
      }
      if (sRaw) setSales(JSON.parse(sRaw));
      else setSales([]);
    } catch (e) {
      console.error("Failed to read localStorage", e);
      setProducts([]);
      setSales([]);
    }
  }, []);

  // Keep counts in sync across tabs (optional)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_PRODUCTS) {
        try { setProducts(JSON.parse(e.newValue || "[]")); } catch {}
      }
      if (e.key === STORAGE_SALES) {
        try { setSales(JSON.parse(e.newValue || "[]")); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // helpers to save
  const saveProducts = (arr) => {
    setProducts(arr);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(arr));
  };
  const saveSales = (arr) => {
    setSales(arr);
    localStorage.setItem(STORAGE_SALES, JSON.stringify(arr));
  };

  // Filtered sales with search
  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...sales].slice().reverse();
    return [...sales].slice().reverse().filter((s) => {
      const pn = (s.productName || "").toLowerCase();
      const sku = (products.find((p) => p.id === s.productId)?.sku || "").toLowerCase();
      const ds = new Date(s.date).toLocaleString().toLowerCase();
      return pn.includes(q) || sku.includes(q) || ds.includes(q);
    });
  }, [sales, search, products]);

  const totals = useMemo(() => {
    const revenue = filteredSales.reduce((sum, s) => sum + (s.price * s.qty), 0);
    const profit = filteredSales.reduce((sum, s) => sum + ((s.price - s.cost) * s.qty), 0);
    const items = filteredSales.reduce((sum, s) => sum + s.qty, 0);
    return { revenue, profit, items };
  }, [filteredSales]);

  // Modal control
  const openRecordModal = (preselectedProductId = null) => {
    setModal({ type: "add", data: { productId: preselectedProductId, qty: 1, price: "", date: new Date().toISOString().slice(0, 16) } });
  };

  const openEditModal = (sale) => {
    setModal({
      type: "edit",
      data: {
        ...sale,
        date: new Date(sale.date).toISOString().slice(0, 16),
      },
    });
  };

  const closeModal = () => setModal(null);

  // Add or update sale:
  // - when adding: reduce product.qty by qty
  // - when editing: revert original sale's qty to product then apply new qty (handles product change)
  const handleSaveSale = (formData) => {
    const productId = formData.get("product");
    const qty = Number(formData.get("qty"));
    const price = Number(formData.get("price"));
    const dateStr = formData.get("date");
    if (!productId || qty <= 0 || isNaN(price) || price <= 0 || !dateStr) {
      alert("Please fill all fields correctly.");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      alert("Product not found.");
      return;
    }

    let updatedProducts = [...products];
    let updatedSales = [...sales];

    if (modal.type === "edit") {
      // edit existing sale (modal.data contains old sale)
      const old = modal.data;
      // 1) revert stock of old sale's product
      updatedProducts = updatedProducts.map((p) =>
        p.id === old.productId ? { ...p, qty: +(p.qty + old.qty).toFixed(6) } : p
      );

      // 2) now reduce stock for the new values (new product)
      const targetProd = updatedProducts.find((p) => p.id === productId);
      if (!targetProd) { alert("Product not found"); return; }

      if (qty > targetProd.qty) {
        if (!window.confirm("Selling more than available stock. Continue?")) {
          // restore original products from localStorage to be safe
          updatedProducts = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS) || "[]");
          return;
        }
      }

      updatedProducts = updatedProducts.map((p) =>
        p.id === productId ? { ...p, qty: +(p.qty - qty).toFixed(6) } : p
      );

      // update sale entry
      const updatedEntry = {
        id: old.id,
        productId,
        productName: product.name,
        unit: product.unit,
        qty,
        price,
        cost: product.cost,
        date: new Date(dateStr).toISOString(),
      };
      updatedSales = updatedSales.map((s) => (s.id === old.id ? updatedEntry : s));
    } else {
      // new sale
      const targetProd = updatedProducts.find((p) => p.id === productId);
      if (!targetProd) { alert("Product not found"); return; }
      if (qty > targetProd.qty) {
        if (!window.confirm("Selling more than available stock. Continue?")) {
          return;
        }
      }
      updatedProducts = updatedProducts.map((p) =>
        p.id === productId ? { ...p, qty: +(p.qty - qty).toFixed(6) } : p
      );

      const entry = {
        id: uid(),
        productId,
        productName: product.name,
        unit: product.unit,
        qty,
        price,
        cost: product.cost,
        date: new Date(dateStr).toISOString(),
      };
      updatedSales.push(entry);
    }

    // Persist
    saveProducts(updatedProducts);
    saveSales(updatedSales);
    closeModal();
  };

  const handleDeleteSale = (saleId) => {
    if (!window.confirm("Delete sale? This won't restore stock automatically.")) return;
    const next = sales.filter((s) => s.id !== saleId);
    saveSales(next);
  };

  // Format number
  const fmt = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  // make table area take available space (works with DashboardLayout padding)
  useEffect(() => {
    // compute based on window height and offsets (approx values)
    const update = () => {
      // header + controls heights ~ 240-300px depending on screen; give safe spacing
      const topOffset = 240;
      const h = Math.max(200, window.innerHeight - topOffset);
      setTableHeight(`${h}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU or date..."
            className="px-3 py-2 border rounded-lg w-80 focus:outline-none"
          />
          <button
            onClick={() => openRecordModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Record Sale
          </button>
          <button
            onClick={() => { /* optional: export */ 
              const rows = [["Date","Product","Qty","Unit","Price","Cost","Revenue","Profit"]];
              sales.forEach(s => rows.push([new Date(s.date).toLocaleString(), s.productName, s.qty, s.unit, s.price, s.cost, (s.qty * s.price).toFixed(2), ((s.price - s.cost) * s.qty).toFixed(2)]));
              const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "sales.csv"; a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* table card */}
      <div className="bg-white rounded-xl shadow border border-gray-100">
        <div style={{ height: tableHeight, overflow: "auto" }} className="p-4">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-center px-4 py-3 font-medium">Qty</th>
                <th className="text-left px-4 py-3 font-medium">Unit</th>
                <th className="text-left px-4 py-3 font-medium">Revenue</th>
                <th className="text-left px-4 py-3 font-medium">Profit</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-10 text-gray-500">
                    No sales yet.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3">{new Date(s.date).toLocaleString()}</td>
                    <td className="px-4 py-3">{s.productName}</td>
                    <td className="px-4 py-3 text-center">{s.qty}</td>
                    <td className="px-4 py-3">{s.unit}</td>
                    <td className="px-4 py-3">₹{fmt(s.qty * s.price)}</td>
                    <td className="px-4 py-3">₹{fmt((s.price - s.cost) * s.qty)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSale(s.id)}
                          className="px-3 py-1 text-sm bg-red-50 text-red-600 border rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* totals */}
      <div className="mt-4 flex gap-6 text-sm text-gray-800">
        <div>Total Revenue: <b>₹{fmt(totals.revenue)}</b></div>
        <div>Total Profit: <b>₹{fmt(totals.profit)}</b></div>
        <div>Items Sold: <b>{fmt(totals.items)}</b></div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              const fm = new FormData(ev.target);
              handleSaveSale(fm);
            }}
            className="relative z-10 bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3">{modal.type === "edit" ? "Edit Sale" : "Record Sale"}</h3>

            <div className="space-y-3">
              <label className="block text-sm">Product</label>
              <select
                name="product"
                defaultValue={modal.data?.productId || (products[0] && products[0].id) || ""}
                className="w-full border rounded p-2"
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.unit}) - {p.qty}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Quantity</label>
                  <input
                    name="qty"
                    type="number"
                    step="any"
                    defaultValue={modal.data?.qty ?? 1}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">Price per Unit (₹)</label>
                  <input
                    name="price"
                    type="number"
                    step="any"
                    defaultValue={modal.data?.price ?? ""}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm">Date & Time</label>
                <input
                  name="date"
                  type="datetime-local"
                  defaultValue={modal.data?.date ?? new Date().toISOString().slice(0, 16)}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                {modal.type === "edit" ? "Save" : "Record"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
