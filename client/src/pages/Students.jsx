import { Link } from "react-router-dom";
import { useStudents } from "../context/StudentContext";

function Students() {
  const { students, deleteStudent } = useStudents();

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmed) {
      deleteStudent(id);
    }
  };

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
                  <th>Actions</th>
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

                    <td>
                      <Link to={`/students/${student.id}`}>
                        View
                      </Link>

                      {" "}

                      <Link to={`/students/${student.id}/edit`}>
                        Edit
                      </Link>

                      {" "}

                      <button
                        type="button"
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </button>
                    </td>
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