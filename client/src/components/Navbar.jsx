function Navbar() {
  return (
    <header className="navbar" aria-label="Application header">
      <div className="navbar-brand">
        <h2>Student Management System</h2>
      </div>

      <div className="navbar-user" aria-label="Current user">
        <span>Admin</span>
      </div>
    </header>
  );
}

export default Navbar;