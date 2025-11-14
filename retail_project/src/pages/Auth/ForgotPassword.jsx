import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password reset link sent to " + email);
    // Here you will later connect backend like Firebase / Node API
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-20 px-4 overflow-auto">
      <div className="bg-white text-gray-800 p-10 rounded-3xl shadow-2xl w-full max-w-xl mt-10">

        {/* Title */}
        <h2 className="text-4xl font-extrabold mb-4 text-center text-teal-600 drop-shadow-sm">
          Forgot Password
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Enter your email to receive password reset instructions.
        </p>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition duration-300 shadow-md hover:shadow-lg text-lg"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-semibold hover:underline hover:text-teal-800"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
