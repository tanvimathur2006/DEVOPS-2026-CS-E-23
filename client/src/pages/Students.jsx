import students from "../data/studentData";

function Students() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage and view all student records.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2>Student Records</h2>
        </div>

        {students.length === 0 ? (
          <p>No student records found.</p>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Year</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.studentId}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.branch}</td>
                    <td>{student.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Students;