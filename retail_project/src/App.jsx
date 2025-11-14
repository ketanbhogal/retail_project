import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard Pages
import DashboardHome from "./pages/Dashboard/DashboardHome";
import ProductList from "./pages/Products/ProductList";
import AddProduct from "./pages/Products/AddProduct";
import SalesList from "./pages/Sales/SalesList";
import AddSale from "./pages/Sales/AddSale";
import ReportsPage from "./pages/Reports/ReportsPage";
import UserManagement from "./pages/Users/UserManagement";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/ProfilePage"; // ✅ Added import

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

// ✅ Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" replace />;
}

// ✅ Public Route Wrapper
function PublicRoute({ children }) {
  const token = localStorage.getItem("authToken");
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* ✅ Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes under dashboard */}
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<ProductList />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="sales" element={<SalesList />} />
          <Route path="add-sale" element={<AddSale />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<ProfilePage />} /> {/* ✅ Added Profile route */}
        </Route>

        {/* ✅ Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
