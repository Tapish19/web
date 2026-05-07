import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  // Hide navbar on auth pages
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/";

  useEffect(() => {
    const syncToken = () => {
      setToken(
        localStorage.getItem("token")
      );
    };

    window.addEventListener(
      "storage",
      syncToken
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncToken
      );
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);

    navigate("/login");
  };

  if (hideNavbar) {
    return null;
  }

  return (
    <nav
      style={{
        width: "100%",
        padding: "16px 24px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      <h2
        style={{
          margin: 0,
          cursor: "pointer",
        }}
        onClick={() =>
          navigate("/dashboard")
        }
      >
        Project Manager
      </h2>

      <div
        style={{
          display: "flex",
          gap: "12px",
        }}
      >
        {token ? (
          <>
            <button
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Dashboard
            </button>

            <button onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

            <button
              onClick={() =>
                navigate("/signup")
              }
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}