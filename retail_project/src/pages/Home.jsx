import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-center text-white">
      {/* Navbar */}
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

      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center flex-grow px-6 mt-24">
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-6 text-white/90 drop-shadow-lg">
          Welcome to <span className="text-white">RetailHub</span>
        </h1>

        <p className="text-xl sm:text-2xl font-medium mb-10 max-w-2xl text-white/70 leading-relaxed">
          Streamline your store operations, manage inventory, track sales, and
          generate insightful reports — all in one smart retail management
          platform.
        </p>

        <button
          onClick={handleGetStarted}
          className="px-10 py-3 border-2 border-white/80 text-white/90 text-lg font-semibold rounded-full hover:bg-white/10 hover:scale-105 transition duration-300"
        >
          Get Started
        </button>

        <p className="mt-6 text-sm text-white/70">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-white hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
