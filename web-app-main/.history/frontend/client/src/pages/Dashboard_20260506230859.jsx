import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/projects");

      setProjects(res.data);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    // Validation
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const res = await API.post("/projects", {
        title: title.trim(),
      });

      // Add directly instead of refetching
      setProjects((prev) => [
        ...prev,
        res.data,
      ]);

      setTitle("");
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Failed to create project"
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h2>Dashboard</h2>

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

      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <h3>Create Project</h3>

        <input
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
          }}
        />

        <button
          onClick={createProject}
          disabled={creating}
          style={{
            padding: "10px 16px",
            cursor: creating
              ? "not-allowed"
              : "pointer",
          }}
        >
          {creating
            ? "Creating..."
            : "Create Project"}
        </button>
      </div>

      <div>
        <h3>Your Projects</h3>

        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              onClick={() =>
                navigate(
                  `/project/${p._id}`
                )
              }
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
                cursor: "pointer",
              }}
            >
              <h4>{p.title}</h4>

              {p.description && (
                <p>
                  {p.description}
                </p>
              )}

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                }}
              >
                Members:{" "}
                {p.members?.length || 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}