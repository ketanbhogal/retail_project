import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.email.trim() || !form.password.trim()) {
      setMessage({ type: "error", text: "Email and password are required" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.message || data?.error || "Invalid credentials";
        setMessage({ type: "error", text: errMsg });
        setLoading(false);
        return;
      }

      const token = data?.token || data?.jwt;
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userEmail", form.email);
      }

      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setMessage({ type: "error", text: "Invalid Credential" });
    } finally {
      setLoading(false);
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

      {/* 🔹 Login Form Section */}
      <div className="flex justify-center items-center flex-grow px-4 mt-24">
        <div className="w-full max-w-md p-8 rounded-3xl bg-transparent border border-white/10 backdrop-blur-sm shadow-2xl">
          {/* Title */}
          <h2 className="text-4xl font-extrabold mb-4 text-center text-white drop-shadow-md">
            Welcome Back
          </h2>
          <p className="text-center text-white/70 mb-6">
            Login to your account to continue managing your store.
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 font-semibold mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-white/90 font-semibold mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition duration-200"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-lg shadow-md transition duration-300 ${
                loading
                  ? "bg-white/20 text-white/60 cursor-not-allowed"
                  : "border-2 border-white/60 text-white hover:bg-white/10 hover:scale-105"
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center my-6">
            <span className="w-1/4 border-t border-white/20"></span>
            <span className="mx-3 text-white/50">or</span>
            <span className="w-1/4 border-t border-white/20"></span>
          </div>

          {/* Social Buttons (UI only) */}
          <div className="flex flex-col space-y-4">
            <button
              type="button"
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-white/30 text-white/80 hover:bg-white/10 transition duration-300"
              onClick={() => window.alert("Google login not implemented")}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                alt="Google"
                className="w-6 h-6"
              />
              Continue with Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-white/30 text-white/80 hover:bg-white/10 transition duration-300"
              onClick={() => window.alert("Facebook login not implemented")}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                alt="Facebook"
                className="w-6 h-6"
              />
              Continue with Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/70">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-white hover:underline hover:text-white/90"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
