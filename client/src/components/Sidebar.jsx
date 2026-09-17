import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <span>SMS</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          Students
        </NavLink>

        <NavLink
          to="/students/add"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          Add Student
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;