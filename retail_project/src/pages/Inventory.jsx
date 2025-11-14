// src/pages/Products/Inventory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Inventory.jsx
 * - Full-screen friendly layout that fills the dashboard area.
 * - Keeps all behavior from your reference code (localStorage keys, add/edit/sell/delete, export csv).
 * - Table area is scrollable and will not leave a white patch on the right.
 */

const STORAGE_PRODUCTS = "rt_products_v1";
const STORAGE_SALES = "rt_sales_v1";

function uid() {
  return "p_" + Math.random().toString(36).slice(2, 9);
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  // seed demo (same as reference)
  const demo = [
    { id: uid(), name: "Rice - Basmati", sku: "RICE-BAS", unit: "kg", qty: 120, cost: 40, price: 55 },
    { id: uid(), name: "Milk", sku: "MILK-1L", unit: "litre", qty: 500, cost: 30, price: 45 },
    { id: uid(), name: "Soap Bar", sku: "SOAP-100", unit: "piece", qty: 200, cost: 12, price: 25 },
  ];
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(demo));
  return demo;
}

function saveProducts(arr) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(arr));
}

function loadSales() {
  try {
    const raw = localStorage.getItem(STORAGE_SALES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveSales(arr) {
  localStorage.setItem(STORAGE_SALES, JSON.stringify(arr));
}

export default function Inventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(() => loadProducts());
  const [sales, setSales] = useState(() => loadSales());
  const [query, setQuery] = useState("");

  // modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // product object or null
  const [sellContext, setSellContext] = useState({ productId: null, qty: 1, price: "", date: "" });

  useEffect(() => {
    // keep local state in sync if localStorage is changed externally
    const onStorage = (e) => {
      if (e.key === STORAGE_PRODUCTS) setProducts(loadProducts());
      if (e.key === STORAGE_SALES) setSales(loadSales());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // helpers
  const updateProducts = (arr) => {
    setProducts(arr);
    saveProducts(arr);
  };
  const updateSales = (arr) => {
    setSales(arr);
    saveSales(arr);
  };

  // actions
  const handleExportInventory = () => {
    const rows = [["Product", "SKU", "Unit", "Qty", "Cost", "Price", "ValueLeft"]];
    products.forEach((p) =>
      rows.push([p.name, p.sku, p.unit, p.qty, p.cost, p.price, (p.qty * p.price).toFixed(2)])
    );
    downloadCSV(rows, "inventory.csv");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete product?")) return;
    const next = products.filter((p) => p.id !== id);
    updateProducts(next);
  };

  const handleEditOpen = (id) => {
    const p = products.find((x) => x.id === id);
    setEditingProduct({ ...p });
    setEditModalOpen(true);
  };

  const handleEditSave = (data) => {
    const next = products.map((p) => (p.id === data.id ? { ...p, ...data } : p));
    updateProducts(next);
    setEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleSellOpen = (preselectedId = null) => {
    setSellContext({
      productId: preselectedId || (products[0] && products[0].id) || null,
      qty: 1,
      price: "",
      date: new Date().toISOString().slice(0, 16),
    });
    setSellModalOpen(true);
  };

  const recordSale = ({ productId, qty, price, date }) => {
    const p = products.find((x) => x.id === productId);
    if (!p) {
      alert("Product not found");
      return;
    }
    qty = Number(qty);
    price = Number(price);
    if (isNaN(qty) || qty <= 0) {
      alert("Invalid quantity");
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert("Invalid price");
      return;
    }
    if (qty > p.qty) {
      if (!window.confirm("Selling more than stock. Continue?")) return;
    }
    // reduce stock
    const updatedProducts = products.map((x) => (x.id === p.id ? { ...x, qty: +(x.qty - qty).toFixed(3) } : x));
    updateProducts(updatedProducts);

    // record sale
    const sale = {
      id: "s_" + Math.random().toString(36).slice(2, 9),
      productId,
      productName: p.name,
      unit: p.unit,
      qty,
      price,
      cost: p.cost,
      date: new Date(date).toISOString(),
    };
    const nextSales = [...sales, sale];
    updateSales(nextSales);

    setSellModalOpen(false);
    alert("Sale recorded");
  };

  // CSV helper
  const downloadCSV = (rows, filename = "export.csv") => {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // filter products by query
  const visibleProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    // Outer wrapper takes the full available space from layout (DashboardLayout provides ml-64 etc.)
    <div className="w-full h-full min-h-screen flex flex-col p-6 bg-transparent">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product or SKU..."
            className="px-3 py-2 border rounded-lg w-72 focus:outline-none"
          />
          <button
            onClick={() => navigate("/dashboard/add-product")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Product
          </button>
          <button
            onClick={handleExportInventory}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Card container fills remaining height so table uses all vertical space */}
      <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col">
        {/* Table header row inside card */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Products list</div>
            <div className="text-sm text-gray-600">{products.length} products</div>
          </div>
        </div>

        {/* Scrollable table area - this fills available card space */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 border-b">Product</th>
                <th className="text-left px-4 py-3 border-b">SKU</th>
                <th className="text-left px-4 py-3 border-b">Unit</th>
                <th className="text-left px-4 py-3 border-b">Qty</th>
                <th className="text-left px-4 py-3 border-b">Cost/Unit</th>
                <th className="text-left px-4 py-3 border-b">Selling/Unit</th>
                <th className="text-left px-4 py-3 border-b">Value Left</th>
                <th className="text-right px-4 py-3 border-b">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                visibleProducts.map((p) => (
                  <tr key={p.id} className="border-t last:border-b">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.sku}</td>
                    <td className="px-4 py-3">{p.unit}</td>
                    <td className="px-4 py-3">{p.qty}</td>
                    <td className="px-4 py-3">₹{p.cost}</td>
                    <td className="px-4 py-3">₹{p.price}</td>
                    <td className="px-4 py-3">₹{(p.qty * p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEditOpen(p.id)}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSellOpen(p.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Sell
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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

      {/* Edit Modal */}
      {editModalOpen && editingProduct && (
        <Modal onClose={() => { setEditModalOpen(false); setEditingProduct(null); }}>
          <EditProductForm
            product={editingProduct}
            onCancel={() => { setEditModalOpen(false); setEditingProduct(null); }}
            onSave={(data) => handleEditSave(data)}
          />
        </Modal>
      )}

      {/* Sell Modal */}
      {sellModalOpen && (
        <Modal onClose={() => setSellModalOpen(false)}>
          <SellForm
            products={products}
            context={sellContext}
            onChange={(ctx) => setSellContext((s) => ({ ...s, ...ctx }))}
            onCancel={() => setSellModalOpen(false)}
            onRecord={() =>
              recordSale({
                productId: sellContext.productId,
                qty: sellContext.qty,
                price: sellContext.price,
                date: sellContext.date,
              })
            }
          />
        </Modal>
      )}
    </div>
  );
}

/* Modal wrapper */
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-2xl p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">{children}</div>
      </div>
    </div>
  );
}

/* EditProductForm */
function EditProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: product.id,
    name: product.name || "",
    sku: product.sku || "",
    unit: product.unit || "piece",
    qty: product.qty || 0,
    cost: product.cost || 0,
    price: product.price || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: name === "qty" || name === "cost" || name === "price" ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Product name required");
    if (!form.sku.trim()) return alert("SKU required");
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">{product.id ? "Edit Product" : "Add Product"}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input name="sku" value={form.sku} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit</label>
          <select name="unit" value={form.unit} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 bg-white">
            <option value="kg">kg</option>
            <option value="litre">litre</option>
            <option value="piece">piece</option>
            <option value="box">box</option>
            <option value="packet">packet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input name="qty" type="number" step="any" value={form.qty} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost per Unit (₹)</label>
          <input name="cost" type="number" step="any" value={form.cost} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price per Unit (₹)</label>
          <input name="price" type="number" step="any" value={form.price} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border bg-gray-50">Cancel</button>
        <button type="submit" className="px-5 py-2 rounded bg-blue-600 text-white">Save</button>
      </div>
    </form>
  );
}

/* SellForm */
function SellForm({ products, context, onChange, onCancel, onRecord }) {
  const prod = products.find((p) => p.id === context.productId) || products[0] || null;

  useEffectOnce(() => {
    if (prod && !context.price) onChange({ price: prod.price });
  });

  return (
    <div>
      <h3 className="text-xl font-semibold">Record Sale</h3>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm text-gray-700">Product</label>
          <select
            value={context.productId || ""}
            onChange={(e) => onChange({ productId: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2 bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.unit}) - {p.qty} left
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Quantity</label>
            <input
              type="number"
              step="any"
              value={context.qty}
              onChange={(e) => onChange({ qty: e.target.value })}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Price per Unit (₹)</label>
            <input
              type="number"
              step="any"
              value={context.price}
              onChange={(e) => onChange({ price: e.target.value })}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            value={context.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded border bg-gray-50">Cancel</button>
        <button onClick={onRecord} className="px-5 py-2 rounded bg-blue-600 text-white">Record</button>
      </div>
    </div>
  );
}

/* small hook: run effect once */
function useEffectOnce(fn) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(fn, []);
}
