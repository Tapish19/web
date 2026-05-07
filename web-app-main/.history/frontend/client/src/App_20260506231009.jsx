import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Projects";

import Navbar from "./components/Navbar";

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const token =
    localStorage.getItem("token");

  return token ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Redirect root */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/project/:id"
          element={
            <PrivateRoute>
              <Project />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}