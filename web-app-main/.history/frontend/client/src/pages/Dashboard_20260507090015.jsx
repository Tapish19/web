import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Plus,
  LogOut,
} from "lucide-react";

export default function Dashboard() {

  const tasks = [
    {
      id: 1,
      name: "Setup Login Website Revamp",
      assigned: "Lee",
      status: "To Do",
      due: "2026-05-08",
    },
  ];

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <h1 className="logo">
          ProjectFlow
        </h1>

        <nav className="nav">

          <button className="nav-btn">
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button className="nav-btn">
            <FolderKanban size={18} />
            Projects
          </button>

          <button className="nav-btn active">
            <ListTodo size={18} />
            Tasks
          </button>

        </nav>

        <div className="sidebar-actions">

          <button className="primary-btn">
            <Plus size={16} />
            New Project
          </button>

          <button className="primary-btn">
            <Plus size={16} />
            New Task
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* TOPBAR */}

        <div className="topbar card">

          <div>
            <h2>Tasks</h2>
            <p>Manage tasks</p>
          </div>

          <div className="topbar-right">

            <div className="user-chip">
              tapish
            </div>

            <button className="logout-btn">
              <LogOut size={16} />
              Logout
            </button>

          </div>

        </div>

        {/* STATS */}

        <div className="stats-grid">

          <div className="card stat-card">
            <h3>Total Tasks</h3>
            <h1>1</h1>
          </div>

          <div className="card stat-card">
            <h3>In Progress</h3>
            <h1>0</h1>
          </div>

          <div className="card stat-card">
            <h3>Done</h3>
            <h1>0</h1>
          </div>

          <div className="card stat-card">
            <h3>Projects</h3>
            <h1>1</h1>
          </div>

        </div>

        {/* TABLE */}

        <div className="table-card card">

          <div className="table-header">
            <h2>Tasks</h2>
          </div>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Assigned</th>
                <th>Status</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {tasks.map((task) => (

                <tr key={task.id}>

                  <td>
                    {task.name}
                  </td>

                  <td>
                    {task.assigned}
                  </td>

                  <td>
                    <span className="status todo">
                      {task.status}
                    </span>
                  </td>

                  <td>
                    {task.due}
                  </td>

                  <td>
                    <span className="no-access">
                      No Access
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}