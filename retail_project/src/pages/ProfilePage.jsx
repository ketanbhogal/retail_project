// src/pages/ProfilePage.jsx
import { useState } from "react";

export default function ProfilePage() {
  const [preview, setPreview] = useState(""); // ✅ removed placeholder image
  const [form, setForm] = useState({
    storeName: "",
    storeType: "",
    storeAddress: "",
    ownerName: "",
    ownerContact: "",
    email: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profile = { ...form, profilePic: preview };
    console.log("Store Profile Saved:", profile);
    alert("✅ Store profile saved successfully!");
    setForm({
      storeName: "",
      storeType: "",
      storeAddress: "",
      ownerName: "",
      ownerContact: "",
      email: "",
    });
    setPreview(""); // ✅ Reset to empty, not placeholder
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-gray-200">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">
          Store Profile
        </h2>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-600 mb-3 bg-gray-200 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-14 h-14 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12zm-9 9a9 9 0 1118 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <label
            htmlFor="profilePic"
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-md transition-all shadow-md"
          >
            Upload Picture
          </label>
          <input
            type="file"
            id="profilePic"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-medium text-gray-700">Store Name</label>
            <input
              type="text"
              id="storeName"
              value={form.storeName}
              onChange={handleChange}
              placeholder="Enter your store name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Store Type</label>
            <select
              id="storeType"
              value={form.storeType}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">Select type</option>
              <option value="Grocery">Grocery</option>
              <option value="Clothing">Clothing</option>
              <option value="Electronics">Electronics</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-gray-700">Store Address</label>
            <textarea
              id="storeAddress"
              value={form.storeAddress}
              onChange={handleChange}
              placeholder="Enter full address"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="Enter owner name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Owner Contact</label>
            <input
              type="tel"
              id="ownerContact"
              value={form.ownerContact}
              onChange={handleChange}
              placeholder="10-digit number"
              pattern="[0-9]{10}"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@domain.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-lg text-lg font-semibold shadow-md transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
