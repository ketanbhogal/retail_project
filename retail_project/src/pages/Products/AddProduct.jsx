import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const navigate = useNavigate();
  const STORAGE_PRODUCTS = "rt_products_v1";

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    unit: "piece",
    qty: "",
    cost: "",
    price: "",
  });

  const [message, setMessage] = useState("");

  const units = ["piece", "kg", "litre", "box", "packet"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    navigate("/dashboard/inventory"); // ✅ Corrected route
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Load existing products
    const existing = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS)) || [];

    // Check if product with same name & SKU exists
    const existingIndex = existing.findIndex(
      (p) =>
        p.name.trim().toLowerCase() === product.name.trim().toLowerCase() &&
        p.sku.trim().toLowerCase() === product.sku.trim().toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update existing product’s quantity, cost, and price
      const updatedProduct = {
        ...existing[existingIndex],
        qty: Number(existing[existingIndex].qty) + Number(product.qty || 0),
        cost: Number(product.cost),
        price: Number(product.price),
      };

      existing[existingIndex] = updatedProduct;
      localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(existing));
      setMessage("✅ Stock Updated Successfully!");
    } else {
      // Add as a new product
      const newProduct = {
        id: "p_" + Math.random().toString(36).substr(2, 9),
        ...product,
        qty: Number(product.qty),
        cost: Number(product.cost),
        price: Number(product.price),
      };
      const updated = [...existing, newProduct];
      localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(updated));
      setMessage("✅ Product Added Successfully!");
    }

    // Redirect to inventory after short delay
    setTimeout(() => {
      navigate("/dashboard/inventory"); // ✅ Corrected route
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center items-start overflow-hidden p-0 m-0">
      <div className="bg-white w-full max-w-5xl p-8 mt-10 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold mb-6">Add / Edit Product</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Product Name */}
          <div>
            <label className="font-semibold text-gray-700">Product Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Rice - Basmati"
              value={product.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="font-semibold text-gray-700">SKU</label>
            <input
              type="text"
              name="sku"
              placeholder="e.g. RICE-BAS"
              value={product.sku}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
              required
            />
          </div>

          {/* Unit */}
          <div>
            <label className="font-semibold text-gray-700">Unit</label>
            <select
              name="unit"
              value={product.unit}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg bg-white"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="font-semibold text-gray-700">Quantity</label>
            <input
              type="number"
              name="qty"
              placeholder="e.g. 120"
              value={product.qty}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
              required
            />
          </div>

          {/* Cost */}
          <div>
            <label className="font-semibold text-gray-700">
              Cost Per Unit (₹)
            </label>
            <input
              type="number"
              name="cost"
              placeholder="e.g. 40"
              value={product.cost}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="font-semibold text-gray-700">
              Selling Price Per Unit (₹)
            </label>
            <input
              type="number"
              name="price"
              placeholder="e.g. 55"
              value={product.price}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
              required
            />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Save Product
            </button>
          </div>

          {message && (
            <p className="text-green-600 font-medium col-span-2 mt-2">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
