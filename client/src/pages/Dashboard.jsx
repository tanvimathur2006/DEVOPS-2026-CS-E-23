import students from "../data/studentData";

function Dashboard() {
  const totalStudents = students.length;

  const branchCounts = students.reduce((counts, student) => {
    counts[student.branch] = (counts[student.branch] || 0) + 1;
    return counts;
  }, {});

  const yearCounts = students.reduce((counts, student) => {
    counts[student.year] = (counts[student.year] || 0) + 1;
    return counts;
  }, {});

  return (
    <section className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of student records.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>

          <div>
            <p>Total Students</p>
            <h2>{totalStudents}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">💻</div>

          <div>
            <p>Computer Science</p>
            <h2>{branchCounts["Computer Science"] || 0}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">📡</div>

          <div>
            <p>Electronics</p>
            <h2>{branchCounts["Electronics"] || 0}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">⚙️</div>

          <div>
            <p>Mechanical</p>
            <h2>{branchCounts["Mechanical"] || 0}</h2>
          </div>
        </div>
      </div>

      {/* Branch and Year Statistics */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Students by Branch</h2>
          </div>

          <div className="bar-list">
            {Object.entries(branchCounts).map(([branch, count]) => (
              <div className="bar-item" key={branch}>
                <div className="bar-label">
                  <span>{branch}</span>
                  <strong>{count}</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / totalStudents) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Students by Year</h2>
          </div>

          <div className="year-list">
            {Object.entries(yearCounts).map(([year, count]) => (
              <div className="year-item" key={year}>
                <span>{year}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="dashboard-card recent-students">
        <div className="card-header">
          <h2>Recent Students</h2>
        </div>

        <div className="recent-student-list">
          {students.slice(0, 5).map((student) => (
            <div className="recent-student" key={student.id}>
              <div className="student-avatar">
                {student.name.charAt(0)}
              </div>

              <div>
                <h3>{student.name}</h3>
                <p>
                  {student.studentId} • {student.branch}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;