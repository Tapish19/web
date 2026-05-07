import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = async () => {
      const res = await API.get("/projects");
      setProjects(res.data);
    };

    loadProjects();
  }, []);

  const createProject = async () => {
    await API.post("/projects", { title });
    const res = await API.get("/projects");
    setProjects(res.data);
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <input placeholder="Project title" onChange={e => setTitle(e.target.value)} />
      <button onClick={createProject}>Create Project</button>

      {projects.map(p => (
        <div key={p._id} onClick={() => navigate(`/project/${p._id}`)}>
          {p.title}
        </div>
      ))}
    </div>
  );
}
