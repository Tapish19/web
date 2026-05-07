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

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h2>
        {project?.title ||
          "Project Tasks"}
      </h2>

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
          padding: "16px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <h3>Team Members</h3>

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
          }}
        />

        <button
          onClick={addMember}
          disabled={addingMember}
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
          padding: "16px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <h3>Create Task</h3>

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
          }}
        />

        <button
          onClick={createTask}
          disabled={creating}
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
                  "1px solid #ccc",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
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