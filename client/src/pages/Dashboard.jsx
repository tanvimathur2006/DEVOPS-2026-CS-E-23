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
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <header className="page-header">
        <div>
          <h1 id="dashboard-heading">Dashboard</h1>
          <p>Overview of student records.</p>
        </div>
      </header>

      <div className="stats-grid" aria-label="Student statistics overview">
        <article className="stat-card" aria-labelledby="total-students-label">
          <div className="stat-card-icon" aria-hidden="true">👥</div>

          <div>
            <p id="total-students-label">Total Students</p>
            <h2>{totalStudents}</h2>
          </div>
        </article>

        <article className="stat-card" aria-labelledby="computer-science-label">
          <div className="stat-card-icon" aria-hidden="true">💻</div>

          <div>
            <p id="computer-science-label">Computer Science</p>
            <h2>{branchCounts["Computer Science"] || 0}</h2>
          </div>
        </article>

        <article className="stat-card" aria-labelledby="electronics-label">
          <div className="stat-card-icon" aria-hidden="true">📡</div>

          <div>
            <p id="electronics-label">Electronics</p>
            <h2>{branchCounts["Electronics"] || 0}</h2>
          </div>
        </article>

        <article className="stat-card" aria-labelledby="mechanical-label">
          <div className="stat-card-icon" aria-hidden="true">⚙️</div>

          <div>
            <p id="mechanical-label">Mechanical</p>
            <h2>{branchCounts["Mechanical"] || 0}</h2>
          </div>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card" aria-labelledby="students-by-branch-heading">
          <div className="card-header">
            <h2 id="students-by-branch-heading">Students by Branch</h2>
          </div>

          <div className="bar-list" aria-label="Branch distribution chart">
            {Object.entries(branchCounts).map(([branch, count]) => (
              <div className="bar-item" key={branch}>
                <div className="bar-label">
                  <span>{branch}</span>
                  <strong>{count}</strong>
                </div>

                <div className="bar-background" aria-hidden="true">
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
        </section>

        <section className="dashboard-card" aria-labelledby="students-by-year-heading">
          <div className="card-header">
            <h2 id="students-by-year-heading">Students by Year</h2>
          </div>

          <div className="year-list" aria-label="Year distribution overview">
            {Object.entries(yearCounts).map(([year, count]) => (
              <div className="year-item" key={year}>
                <span>{year}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="dashboard-card recent-students" aria-labelledby="recent-students-heading">
        <div className="card-header">
          <h2 id="recent-students-heading">Recent Students</h2>
        </div>

        <div className="recent-student-list" aria-label="Recent student list">
          {students.slice(0, 5).map((student) => (
            <div className="recent-student" key={student.id}>
              <div className="student-avatar" aria-hidden="true">
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
      </section>
    </section>
  );
}

export default Dashboard;