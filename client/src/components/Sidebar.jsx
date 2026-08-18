import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <span>SMS</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/students" className="sidebar-link">
          Students
        </NavLink>

        <NavLink to="/students/add" className="sidebar-link">
          Add Student
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;