import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Projects";

import Navbar from "./components/Navbar";

// Protected Route
const PrivateRoute = ({
  children,
}) => {

  const token =
    localStorage.getItem("token");

  return token ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
};

export default function App() {

  const [isAuthenticated,
    setIsAuthenticated
  ] = useState(false);

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    setIsAuthenticated(
      !!token
    );

  }, []);

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* ROOT */}

        <Route
          path="/"
          element={
            isAuthenticated ? (
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

        {/* PUBLIC */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* PROTECTED */}

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

        {/* 404 */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}