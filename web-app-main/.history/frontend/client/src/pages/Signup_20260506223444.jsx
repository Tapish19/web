import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ role: "member" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const signup = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSubmitting(true);
      await API.post("/auth/signup", form);
      navigate("/login", { state: { message: "Signup successful. Please log in." } });
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={signup}>
      <h2>Signup</h2>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />

      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" disabled={submitting}>{submitting ? "Signing up..." : "Signup"}</button>
      {error && <p>{error}</p>}
    </form>
  );
}
