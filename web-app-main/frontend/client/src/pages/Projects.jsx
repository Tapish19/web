import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../services/api";

export default function Project() {
  const { id } = useParams();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [memberEmail, setMemberEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [addingMember, setAddingMember] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {

      setLoading(true);
      setError("");

      const [
        projectsRes,
        tasksRes,
      ] = await Promise.all([
        API.get("/projects"),

        API.get(
          `/tasks/project/${id}`
        ),
      ]);

      const currentProject =
        projectsRes.data.find(
          (p) => p._id === id
        ) || null;

      setProject(currentProject);

      if (
        currentProject?.members
          ?.length &&
        !assignedTo
      ) {
        setAssignedTo(
          currentProject.members[0]._id
        );
      }

      setTasks(tasksRes.data);

    } catch (err) {

      setError(
        err.response?.data?.msg ||
          "Failed to load project"
      );

    } finally {

      setLoading(false);

    }
  };

  const addMember = async () => {
    if (!memberEmail.trim()) {
      setError("Member email required");
      return;
    }

    try {

      setAddingMember(true);
      setError("");

      const res = await API.put(
        `/projects/${id}/members`,
        {
          email:
            memberEmail.trim(),
        }
      );

      setProject(res.data);

      setMemberEmail("");

    } catch (err) {

      setError(
        err.response?.data?.msg ||
          "Failed to add member"
      );

    } finally {

      setAddingMember(false);

    }
  };

  const createTask = async () => {
    if (
      !title.trim() ||
      !assignedTo ||
      !dueDate
    ) {
      setError(
        "All task fields are required"
      );

      return;
    }

    try {

      setCreating(true);
      setError("");

      const res = await API.post(
        "/tasks",
        {
          title: title.trim(),
          projectId: id,
          assignedTo,
          dueDate,
        }
      );

      setTasks((prev) => [
        ...prev,
        res.data,
      ]);

      setTitle("");
      setDueDate("");

    } catch (err) {

      setError(
        err.response?.data?.msg ||
          "Failed to create task"
      );

    } finally {

      setCreating(false);

    }
  };

  const updateStatus = async (
    taskId,
    status
  ) => {
    try {

      const res = await API.put(
        `/tasks/${taskId}`,
        {
          status,
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? res.data
            : task
        )
      );

    } catch (err) {

      setError(
        err.response?.data?.msg ||
          "Failed to update status"
      );

    }
  };

  const updateDueDate = async (
    taskId,
    nextDueDate
  ) => {
    if (!nextDueDate) return;

    try {

      const res = await API.put(
        `/tasks/${taskId}`,
        {
          dueDate: nextDueDate,
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? res.data
            : task
        )
      );

    } catch (err) {

      setError(
        err.response?.data?.msg ||
          "Failed to update due date"
      );

    }
  };

  if (loading) {
    return <p>Loading project...</p>;
  }

  const statusSummary =
    tasks.reduce(
      (acc, task) => {
        const status =
          task.status || "todo";
        acc[status] =
          (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

  const nextDueTask =
    [...tasks]
      .filter((task) => task.dueDate)
      .sort(
        (a, b) =>
          new Date(a.dueDate) -
          new Date(b.dueDate)
      )[0];

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
      <h2 style={{ color: "#312e81" }}>
        {project?.title ||
          "Project Tasks"}
      </h2>

      <div
        style={{
          marginTop: "14px",
          marginBottom: "20px",
          padding: "14px 16px",
          borderRadius: "10px",
          border: "1px solid #ddd6fe",
          background: "#f8f7ff",
          color: "#4338ca",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <div>
          Total tasks: {tasks.length}
        </div>
        <div>
          Status: To Do{" "}
          {statusSummary.todo || 0},
          In Progress{" "}
          {statusSummary[
            "in-progress"
          ] || 0}
          , Done{" "}
          {statusSummary.done || 0}
        </div>
        <div>
          Due:{" "}
          {nextDueTask?.dueDate
            ? new Date(
                nextDueTask.dueDate
              ).toLocaleDateString()
            : "No due date"}
        </div>
      </div>

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

      {/* TEAM SECTION */}

      <div
        style={{
          marginBottom: "24px",
          padding: "20px",
          border: "1px solid #ddd6fe",
          borderRadius: "12px",
          background: "#ffffffcc",
          boxShadow:
            "0 8px 20px rgba(139, 92, 246, 0.08)",
        }}
      >
        <h3 style={{ color: "#4338ca" }}>Team Members</h3>

        <div
          style={{
            marginBottom: "16px",
          }}
        >
          {project?.members?.map(
            (member) => (
              <div key={member._id}>
                {member.name} (
                {member.email})
              </div>
            )
          )}
        </div>

        <input
          type="email"
          placeholder="Enter member email"
          value={memberEmail}
          onChange={(e) =>
            setMemberEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        />

        <button
          onClick={addMember}
          disabled={addingMember}
          style={{
            padding: "10px 16px",
            background: "#9333ea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: addingMember
              ? "not-allowed"
              : "pointer",
          }}
        >
          {addingMember
            ? "Adding..."
            : "Add Member"}
        </button>
      </div>

      {/* CREATE TASK */}

      <div
        style={{
          marginBottom: "24px",
          padding: "20px",
          border: "1px solid #ddd6fe",
          borderRadius: "12px",
          background: "#ffffffcc",
          boxShadow:
            "0 8px 20px rgba(139, 92, 246, 0.08)",
        }}
      >
        <h3 style={{ color: "#4338ca" }}>Create Task</h3>

        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        />

        <select
          value={assignedTo}
          onChange={(e) =>
            setAssignedTo(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        >
          <option value="">
            Assign member
          </option>

          {project?.members?.map(
            (member) => (
              <option
                key={member._id}
                value={member._id}
              >
                {member.name} (
                {member.role})
              </option>
            )
          )}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) =>
            setDueDate(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        />

        <button
          onClick={createTask}
          disabled={creating}
          style={{
            padding: "10px 16px",
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
            : "Add Task"}
        </button>
      </div>

      {/* TASKS */}

      <div>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((t) => (
            <div
              key={t._id}
              style={{
                border:
                  "1px solid #ddd6fe",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)",
                boxShadow:
                  "0 6px 18px rgba(79, 70, 229, 0.08)",
              }}
            >
              <div>
                <strong>
                  {t.title}
                </strong>
              </div>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                Status: {t.status}
              </div>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                Assignee:{" "}
                {t.assignedTo?.name ||
                  "Unassigned"}
              </div>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                Due:{" "}
                {t.dueDate
                  ? new Date(
                      t.dueDate
                    ).toLocaleDateString()
                  : "No due date"}
              </div>

              <div
                style={{
                  marginTop: "10px",
                }}
              >
                <input
                  type="date"
                  value={
                    t.dueDate
                      ? new Date(
                          t.dueDate
                        )
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    updateDueDate(
                      t._id,
                      e.target.value
                    )
                  }
                />
              </div>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() =>
                    updateStatus(
                      t._id,
                      "todo"
                    )
                  }
                >
                  To Do
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      t._id,
                      "in-progress"
                    )
                  }
                >
                  In Progress
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      t._id,
                      "done"
                    )
                  }
                >
                  Done
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
