import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    gender: "",
    age: "",
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email";
    if (!form.username.trim()) return "Username is required";
    if (!form.password) return "Password is required";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";
    if (form.age && (Number(form.age) <= 0 || Number(form.age) > 120))
      return "Enter a valid age";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    const payload = {
      email: form.email.trim(),
      username: form.username.trim(),
      phone: form.phone.trim(),
      password: form.password,
      storeName: form.storeName?.trim() || null,
      gender: form.gender || null,
      age: form.age ? Number(form.age) : null,
    };

    try {
      setBusy(true);
      const res = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg =
          data?.message || data?.error || `Signup failed (${res.status})`;
        setMessage({ type: "error", text: errMsg });
        setBusy(false);
        return;
      }

      setMessage({
        type: "success",
        text: data?.message || "Account created successfully",
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (error) {
      console.error("Signup error:", error);
      setMessage({
        type: "error",
        text: "Network error — please check backend or try again",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-white">
      {/* 🧭 Transparent Navbar (same as Home) */}
      <nav className="flex items-center justify-between px-8 py-4 fixed top-0 left-0 w-full bg-transparent backdrop-blur-md border-b border-white/10 z-20">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold cursor-pointer text-white/90 hover:text-white transition"
        >
          RetailHub
        </h1>

        <div className="flex space-x-8 text-lg font-semibold">
          <button
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white transition"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-white/80 hover:text-white transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-white/80 hover:text-white transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* 🧾 Transparent Signup Form */}
      <div className="flex justify-center items-center flex-grow px-4 mt-24">
        <div className="w-full max-w-3xl p-10 rounded-3xl border border-white/20 bg-transparent backdrop-blur-sm shadow-2xl">
          {/* Title */}
          <h2 className="text-4xl font-extrabold mb-4 text-center text-white drop-shadow-sm">
            Create Your Account
          </h2>
          <p className="text-center text-white/70 mb-6">
            Please fill in the details below to sign up and get started.
          </p>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-md text-sm text-center ${
                message.type === "error"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-green-500/20 text-green-300 border border-green-500/30"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  required
                />
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Store Name
              </label>
              <input
                name="storeName"
                type="text"
                value={form.storeName}
                onChange={handleChange}
                placeholder="Enter store name"
                className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* Gender + Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <option value="" disabled className="bg-gray-800 text-white">
                    Select Gender
                  </option>
                  <option value="Male" className="bg-gray-900 text-white">
                    Male
                  </option>
                  <option value="Female" className="bg-gray-900 text-white">
                    Female
                  </option>
                  <option value="Other" className="bg-gray-900 text-white">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Age
                </label>
                <input
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-lg shadow-lg transition duration-300 ${
                busy
                  ? "bg-white/20 text-white/60 cursor-not-allowed"
                  : "border-2 border-white/60 text-white hover:bg-white/10 hover:scale-105"
              }`}
            >
              {busy ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/70">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-white hover:underline hover:text-white/90 font-semibold"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
