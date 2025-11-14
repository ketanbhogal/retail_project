import React, { useEffect, useState } from "react";

export default function Settings() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    notifications: true,
    theme: localStorage.getItem("theme") || "light",
  });

  const [message, setMessage] = useState("");

  // ✅ Apply theme change instantly
  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("theme") || "light";

    if (storedTheme === "dark") {
      root.classList.add("dark");
    } else if (storedTheme === "light") {
      root.classList.remove("dark");
    } else {
      // system default
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, []);

  // ✅ Whenever dropdown changes
  useEffect(() => {
    const root = document.documentElement;

    if (form.theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (form.theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
      localStorage.setItem("theme", "system");
    }
  }, [form.theme]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      setMessage("⚠️ Passwords do not match!");
      return;
    }

    setMessage("✅ Settings updated successfully!");
  };

  return (
    <div className="w-full min-h-screen p-8 bg-gray-100 dark:bg-gray-900 flex justify-center transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Manage your account information, preferences, and theme.
        </p>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="flex items-center space-x-3 mt-2">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={form.notifications}
                onChange={handleChange}
                className="w-5 h-5 accent-blue-600"
              />
              <label
                htmlFor="notifications"
                className="text-gray-700 dark:text-gray-200"
              >
                Enable email notifications
              </label>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Confirm new password"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
                Theme
              </label>
              <select
                name="theme"
                value={form.theme}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="md:col-span-2 flex justify-end pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg transition duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
