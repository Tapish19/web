import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function Project() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const load = async () => {
      const [projectsRes, tasksRes] = await Promise.all([
        API.get("/projects"),
        API.get(`/tasks/project/${id}`)
      ]);

      const currentProject = projectsRes.data.find((p) => p._id === id) || null;
      setProject(currentProject);
      if (currentProject?.members?.length) {
        setAssignedTo((prev) => prev || currentProject.members[0]._id);
      }

      setTasks(tasksRes.data);
    };

    load();
  }, [id]);

  const refreshTasks = async () => {
    const tasksRes = await API.get(`/tasks/project/${id}`);
    setTasks(tasksRes.data);
  };

  const createTask = async () => {
    if (!title.trim() || !assignedTo || !dueDate) return;

    await API.post("/tasks", { title: title.trim(), projectId: id, assignedTo, dueDate });
    setTitle("");
    refreshTasks();
  };

  const updateStatus = async (taskId, status) => {
    await API.put(`/tasks/${taskId}`, { status });
    refreshTasks();
  };

  const updateDueDate = async (taskId, nextDueDate) => {
    if (!nextDueDate) return;
    await API.put(`/tasks/${taskId}`, { dueDate: nextDueDate });
    refreshTasks();
  };

  return (
    <div>
      <h2>Tasks</h2>

      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
        <option value="">Assign member</option>
        {project?.members?.map((member) => (
          <option key={member._id} value={member._id}>
            {member.name} ({member.role})
          </option>
        ))}
      </select>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button onClick={createTask}>Add Task</button>

      {tasks.map((t) => (
        <div key={t._id} style={{ marginTop: 12 }}>
          <div>
            <strong>{t.title}</strong> - {t.status}
          </div>
          <div>Assignee: {t.assignedTo?.name || "Unassigned"}</div>
          <div>
            Due: {new Date(t.dueDate).toLocaleDateString()} {" "}
            <input
              type="date"
              defaultValue={new Date(t.dueDate).toISOString().slice(0, 10)}
              onChange={(e) => updateDueDate(t._id, e.target.value)}
            />
          </div>
          <button onClick={() => updateStatus(t._id, "todo")}>To Do</button>
          <button onClick={() => updateStatus(t._id, "in-progress")}>In Progress</button>
          <button onClick={() => updateStatus(t._id, "done")}>Done</button>
        </div>
      ))}
    </div>
  );
}
