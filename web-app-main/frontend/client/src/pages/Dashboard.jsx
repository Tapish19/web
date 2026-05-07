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

  const [projectStats, setProjectStats] =
    useState({});

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

      const statsEntries =
        await Promise.all(
          res.data.map(async (project) => {
            const tasksRes =
              await API.get(
                `/tasks/project/${project._id}`
              );

            const totalTasks =
              tasksRes.data.length;

            const statusCount =
              tasksRes.data.reduce(
                (acc, task) => {
                  const status =
                    task.status ||
                    "todo";
                  acc[status] =
                    (acc[status] || 0) +
                    1;
                  return acc;
                },
                {}
              );

            const today =
              new Date();

            today.setHours(
              0,
              0,
              0,
              0
            );

            const overdueTasks =
              tasksRes.data.filter(
                (task) =>
                  task.dueDate &&
                  new Date(
                    task.dueDate
                  ) < today &&
                  task.status !==
                    "done"
              ).length;

            return [
              project._id,
              {
                totalTasks,
                statusCount,
                overdueTasks,
              },
            ];
          })
        );

      setProjectStats(
        Object.fromEntries(
          statsEntries
        )
      );

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
        padding: "28px",
        borderRadius: "18px",
        background:
          "linear-gradient(145deg, #f5f3ff 0%, #eef2ff 45%, #fdf2f8 100%)",
        boxShadow:
          "0 12px 35px rgba(76, 29, 149, 0.12)",
        border:
          "1px solid #ddd6fe",
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

        <h2 style={{ color: "#312e81" }}>Dashboard</h2>

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
            "1px solid #ddd6fe",
          borderRadius: "12px",
          marginBottom: "30px",
          background: "#ffffffcc",
          boxShadow: "0 8px 20px rgba(139, 92, 246, 0.08)",
        }}
      >

        <h3
          style={{
            marginBottom: "16px",
            color: "#4338ca",
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
            color: "#4338ca",
          }}
        >
          Your Projects
        </h3>

        {projects.length === 0 ? (

          <p style={{ color: "#6b7280" }}>No projects found.</p>

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
                  "1px solid #ddd6fe",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "16px",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)",
                boxShadow:
                  "0 6px 18px rgba(79, 70, 229, 0.08)",
              }}
            >

              <h4
                style={{
                  marginBottom: "10px",
                  color: "#4c1d95",
                }}
              >
                {p.title || p.name}
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
                  color: "#6d28d9",
                }}
              >
                Task title: {p.title || "Untitled task"}
              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
}
