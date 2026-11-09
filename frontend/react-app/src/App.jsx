import { useEffect, useState } from "react";
import "./App.css";

function getDeadlineText(dateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dateValue);
  dueDate.setHours(0, 0, 0, 0);

  const days = Math.round((dueDate - today) / 86400000);

  if (days < 0) return `Overdue by ${Math.abs(days)} day(s)`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function App() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Should-Do");
  const [message, setMessage] = useState("Loading assignments...");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch("/api/assignments")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load assignments");
        return response.json();
      })
      .then((data) => {
        setAssignments(data);
        setMessage(data.length === 0 ? "No assignments yet." : "");
      })
      .catch((error) => {
        console.error(error);
        setMessage("Could not load assignments. Check that the backend is running.");
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("Saving assignment...");

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate, status: "Pending", priority }),
      });

      if (!response.ok) throw new Error("Could not save assignment");

      const savedAssignment = await response.json();
      setAssignments((current) => [...current, savedAssignment]);
      setTitle("");
      setDueDate("");
      setMessage("Assignment saved.");
      setPriority("Should-Do");
    } catch (error) {
      console.error(error);
      setMessage("Could not save assignment. Please try again.");
    }
  }

  async function handlePriorityChange(assignment, newPriority) {
  try {
    const response = await fetch(`/api/assignments/${assignment._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: assignment.title,
        dueDate: assignment.dueDate,
        status: assignment.status || "Pending",
        priority: newPriority,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not update priority");
    }

    const updatedAssignment = await response.json();

    setAssignments((current) =>
      current.map((item) =>
        item._id === updatedAssignment._id ? updatedAssignment : item
      )
    );

    setMessage("Priority updated.");
  } catch (error) {
    console.error(error);
    setMessage("Could not update priority. Please try again.");
  }
}

  async function handleStatusChange(assignment, newStatus) {
    try {
      const response = await fetch(`/api/assignments/${assignment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignment.title,
          dueDate: assignment.dueDate,
          status: newStatus,
          priority: assignment.priority || "Should-Do",
        }),
      });

      if (!response.ok) throw new Error("Could not update status");

      const updatedAssignment = await response.json();
      setAssignments((current) =>
        current.map((item) =>
          item._id === updatedAssignment._id ? updatedAssignment : item
        )
      );
      setMessage("Status updated.");
    } catch (error) {
      console.error(error);
      setMessage("Could not update status. Please try again.");
    }
  }

  async function handleEdit(assignment) {
    const updatedTitle = window.prompt(
      "Enter the new assignment name:",
      assignment.title
    );
    if (updatedTitle === null) return;

    const currentDueDate = new Date(assignment.dueDate)
      .toISOString()
      .slice(0, 10);
    const updatedDueDate = window.prompt(
      "Enter the new due date (YYYY-MM-DD):",
      currentDueDate
    );
    if (updatedDueDate === null) return;

    try {
      const response = await fetch(`/api/assignments/${assignment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          dueDate: updatedDueDate,
          status: assignment.status || "Pending",
          priority: assignment.priority || "Should-Do",
        }),
      });

      if (!response.ok) throw new Error("Could not update assignment");

      const savedAssignment = await response.json();
      setAssignments((current) =>
        current.map((item) =>
          item._id === savedAssignment._id ? savedAssignment : item
        )
      );
      setMessage("Assignment updated.");
    } catch (error) {
      console.error(error);
      setMessage("Could not update assignment. Please try again.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this assignment?")) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete assignment");

      setAssignments((current) =>
        current.filter((assignment) => assignment._id !== id)
      );
      setMessage("Assignment deleted.");
    } catch (error) {
      console.error(error);
      setMessage("Could not delete assignment. Please try again.");
    }
  }

  const pendingAssignments = assignments.filter(
    (assignment) => (assignment.status || "Pending") === "Pending"
  );
  const submittedCount = assignments.length - pendingAssignments.length;
  const pendingCount = pendingAssignments.length;
  const completionRate = assignments.length
    ? Math.round((submittedCount / assignments.length) * 100)
    : 0;

  const upcomingAssignments = [...pendingAssignments]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const filteredAssignments = assignments.filter((assignment) => {
    if (statusFilter === "All") return true;
    return (assignment.status || "Pending") === statusFilter;
  });

  const nextDeadline = upcomingAssignments[0];

  return (
    <div className="app-shell" id="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">▰</span>
          <span>StudySpace</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#dashboard">▦ <span>Dashboard</span></a>
          <a className="nav-item" href="#assignments">▤ <span>Assignments</span></a>
          <a className="nav-item" href="#deadlines">◷ <span>Calendar</span></a>
          <a className="nav-item" href="#assignments">✓ <span>To-Do</span></a>
          <a className="nav-item" href="#progress">◉ <span>Focus</span></a>
        </nav>

        <div className="sidebar-profile">
          <span className="profile-avatar">S</span>
          <span>Student</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="page-header">
          <div>
            <p className="welcome-text">Welcome back</p>
            <h1>Dashboard</h1>
            <p className="page-subtitle">Here’s your assignment progress.</p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => document.getElementById("assignment-title")?.focus()}
          >
            + New assignment
          </button>
        </header>

        {message && <p className="notice" role="status">{message}</p>}

        <section className="stats-grid">
          <article className="stat-card stat-indigo">
            <span>Overall Completion</span>
            <strong>{completionRate}%</strong>
            <small>{submittedCount} completed</small>
          </article>
          <article className="stat-card stat-blue">
            <span>Total Assignments</span>
            <strong>{assignments.length}</strong>
            <small>Saved in your planner</small>
          </article>
          <article className="stat-card stat-cyan">
            <span>Next Deadline</span>
            <strong className="deadline-stat">
              {nextDeadline
                ? new Date(nextDeadline.dueDate).toLocaleDateString(undefined, {
                    weekday: "long",
                  })
                : "All clear"}
            </strong>
            <small>
              {nextDeadline
                ? getDeadlineText(nextDeadline.dueDate)
                : "No pending deadlines"}
            </small>
          </article>
          <article className="stat-card stat-lavender">
            <span>Total Pending</span>
            <strong>{pendingCount}</strong>
            <small>Waiting to be completed</small>
          </article>
        </section>

        <section className="overview-grid">
          <article className="panel" id="deadlines">
            <div className="panel-heading">
              <h2>♢ Upcoming Deadlines</h2>
              <span className="panel-count">{upcomingAssignments.length}</span>
            </div>

            {upcomingAssignments.length === 0 ? (
              <p className="empty-state">No upcoming deadlines. You’re all caught up!</p>
            ) : (
              <div className="deadline-list">
                {upcomingAssignments.map((assignment) => (
                  <div className="deadline-item" key={assignment._id}>
                    <div>
                      <strong>{assignment.title}</strong>
                      <span>{getDeadlineText(assignment.dueDate)}</span>
                    </div>
                    <time>{new Date(assignment.dueDate).toLocaleDateString()}</time>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel productivity-panel" id="progress">
            <div className="panel-heading">
              <h2>Weekly Productivity</h2>
              <span className="panel-caption">Assignment progress</span>
            </div>
            <div className="progress-content">
              <div
                className="progress-ring"
                style={{ "--progress": `${completionRate * 3.6}deg` }}
              >
                <div>
                  <strong>{completionRate}%</strong>
                  <span>complete</span>
                </div>
              </div>
              <div className="progress-legend">
                <p><i className="legend-dot submitted-dot" /> Submitted <strong>{submittedCount}</strong></p>
                <p><i className="legend-dot pending-dot" /> Pending <strong>{pendingCount}</strong></p>
              </div>
            </div>
          </article>
        </section>

        <section className="panel assignment-panel" id="assignments">
          <div className="panel-heading assignment-heading">
            <div>
              <p className="section-kicker">YOUR PLANNER</p>
              <h2>Prioritize Your Week</h2>
            </div>
            <div className="filter-control">
              <label htmlFor="statusFilter">Show</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>
          </div>

          <form className="assignment-form" onSubmit={handleSubmit}>
            <input
              id="assignment-title"
              type="text"
              placeholder="Assignment name"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <input
              aria-label="Due date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />

            <select
            aria-label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            >
            <option value="Must-Do">Must-Do</option>
            <option value="Should-Do">Should-Do</option>
            <option value="Can Wait">Can Wait</option>
            </select>
            <button className="primary-button" type="submit">Add assignment</button>
            
          
          </form>

          {filteredAssignments.length === 0 ? (
            <p className="empty-state">No assignments match this filter.</p>
          ) : (
           <div className="priority-board">
  {["Must-Do", "Should-Do", "Can Wait"].map((priorityName) => {
    const columnAssignments = filteredAssignments.filter(
      (assignment) =>
        (assignment.priority || "Should-Do") === priorityName
    );

    return (
      <section
        className={`priority-column priority-${priorityName
          .toLowerCase()
          .replace(/\s+/g, "-")}`}
        key={priorityName}
      >
        <div className="priority-column-heading">
          <h3>{priorityName}</h3>
          <span>{columnAssignments.length}</span>
        </div>

        {columnAssignments.length === 0 ? (
          <p className="empty-state">No assignments here.</p>
        ) : (
          columnAssignments.map((assignment) => (
            <article className="priority-task" key={assignment._id}>
              <h4>{assignment.title}</h4>
              <p>Due {new Date(assignment.dueDate).toLocaleDateString()}</p>

              <div className="priority-task-actions">
                <select
                  aria-label={`Status for ${assignment.title}`}
                  value={assignment.status || "Pending"}
                  onChange={(event) =>
                    handleStatusChange(assignment, event.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                </select>

                <select
                  aria-label={`Priority for ${assignment.title}`}
                  value={assignment.priority || "Should-Do"}
                  onChange={(event) =>
                    handlePriorityChange(assignment, event.target.value)
                  }
                >
                  <option value="Must-Do">Must-Do</option>
                  <option value="Should-Do">Should-Do</option>
                  <option value="Can Wait">Can Wait</option>
                </select>

                <button
                  type="button"
                  className="quiet-button"
                  onClick={() => handleEdit(assignment)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(assignment._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    );
  })}
</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;