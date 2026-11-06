import { Link, NavLink, useLocation } from "react-router-dom";

function Sidebar() {
  const { pathname } = useLocation();
  const studentsSectionActive =
    pathname === "/students" ||
    (pathname.startsWith("/students/") && pathname !== "/students/add");

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <span>SMS</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          Dashboard
        </NavLink>

        <Link
          to="/students"
          aria-current={studentsSectionActive ? "page" : undefined}
          className={`sidebar-link${studentsSectionActive ? " active" : ""}`}
        >
          Students
        </Link>

        <NavLink
          to="/students/add"
          end
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          Add Student
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
