import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Message from signup page
  const successMessage = location.state?.message;

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const login = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const res = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // Store token
      localStorage.setItem(
        "token",
        res.data.token
      );

      // Optional: store user data
      if (res.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        padding: "24px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <form onSubmit={login}>
        <h2>Login</h2>

        {successMessage && (
          <p
            style={{
              color: "green",
              marginBottom: "12px",
            }}
          >
            {successMessage}
          </p>
        )}

        {error && (
          <p
            style={{
              color: "red",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        <div
          style={{
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          <p>
            Don&apos;t have an account?
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/signup")
            }
            style={{
              marginTop: "8px",
            }}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}