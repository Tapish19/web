import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
    });

  const [title, setTitle] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        projectsRes,
        summaryRes,
      ] = await Promise.all([
        API.get("/projects"),

        API.get(
          "/tasks/dashboard/summary"
        ),
      ]);

      setProjects(projectsRes.data);

      setSummary(summaryRes.data);

    } catch (err) {

      setError(
        err.response?.data?.msg ||
          "Failed to load dashboard"
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

      const res = await API.post(
        "/projects",
        {
          title: title.trim(),
        }
      );

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
        maxWidth: "1000px",
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

      {/* SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",

          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <SummaryCard
          title="Total Tasks"
          value={summary.total}
        />

        <SummaryCard
          title="To Do"
          value={summary.todo}
        />

        <SummaryCard
          title="In Progress"
          value={summary.inProgress}
        />

        <SummaryCard
          title="Completed"
          value={summary.done}
        />

        <SummaryCard
          title="Overdue"
          value={summary.overdue}
        />
      </div>

      {/* CREATE PROJECT */}

      <div
        style={{
          marginBottom: "32px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "12px",
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
            padding: "12px",
            marginBottom: "12px",
          }}
        />

        <button
          onClick={createProject}
          disabled={creating}
        >
          {creating
            ? "Creating..."
            : "Create Project"}
        </button>
      </div>

      {/* PROJECTS */}

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
                border:
                  "1px solid #ccc",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "18px",
                cursor: "pointer",
              }}
            >
              <h4>{p.title}</h4>

              <p>
                Members:{" "}
                {p.members?.length ||
                  0}
              </p>

              <p>
                Created by:{" "}
                {p.createdBy?.name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
}) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <h4>{title}</h4>

      <h2>{value}</h2>
    </div>
  );
}