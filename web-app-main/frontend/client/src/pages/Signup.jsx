import { useState } from "react";
import API, { getApiErrorMessage } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const signup = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      setError("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");
      setSubmitting(true);

      // Role should NEVER come from frontend
      await API.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/login", {
        state: {
          message: "Signup successful. Please log in.",
        },
      });
    } catch (err) {
      const backendMsg = err.response?.data?.msg;
      const networkIssue = !err.response;

      setError(
        backendMsg ||
          (networkIssue
            ? "Cannot reach API. Check VITE_API_URL / backend URL and CORS settings."
            : "Signup failed. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "24px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <form onSubmit={signup}>
        <h2>Signup</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
          }}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
          }}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "10px",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Signing up..." : "Signup"}
        </button>

        {error && (
          <p
            style={{
              color: "red",
              marginTop: "12px",
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}