import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {

  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {

    try {

      setLoading(true);

      setError("");

      const res =
        await API.get("/projects");

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

    if (!title.trim()) {

      setError(
        "Project title is required"
      );

      return;
    }

    try {

      setCreating(true);

      setError("");

      const res =
        await API.post(
          "/projects",
          {
            title: title.trim(),
          }
        );

      setProjects((prev) => [
        res.data,
        ...prev,
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

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    navigate("/login");

  };

  if (loading) {
    return (
      <p
        style={{
          padding: "40px",
        }}
      >
        Loading dashboard...
      </p>
    );
  }

  return (

    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >

      {/* TOP BAR */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >

        <h2>Dashboard</h2>

        <button
          onClick={logout}
          style={{
            padding:
              "10px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>

      </div>

      {/* ERROR */}

      {error && (

        <p
          style={{
            color: "red",
            marginBottom: "16px",
          }}
        >
          {error}
        </p>

      )}

      {/* CREATE PROJECT */}

      <div
        style={{
          padding: "20px",
          border:
            "1px solid #ccc",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >

        <h3
          style={{
            marginBottom: "16px",
          }}
        >
          Create Project
        </h3>

        <input
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            border:
              "1px solid #ccc",
          }}
        />

        <button
          onClick={createProject}
          disabled={creating}
          style={{
            padding:
              "12px 18px",
            background: "#9333ea",
            color: "white",
            border: "none",
            borderRadius: "8px",
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

      {/* PROJECTS */}

      <div>

        <h3
          style={{
            marginBottom: "16px",
          }}
        >
          Your Projects
        </h3>

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
                border:
                  "1px solid #ccc",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "16px",
                cursor: "pointer",
              }}
            >

              <h4
                style={{
                  marginBottom: "10px",
                }}
              >
                {p.name}
              </h4>

              {p.description && (
                <p>
                  {p.description}
                </p>
              )}

              <div
                style={{
                  marginTop: "10px",
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