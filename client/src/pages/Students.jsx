import { Link } from "react-router-dom";
import students from "../data/studentData";

function Students() {
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmed) {
      console.log("Delete student:", id);
    }
  };

  if (students.length === 0) {
    return (
      <section aria-labelledby="students-heading">
        <h1 id="students-heading">Students</h1>

        <div role="status" aria-live="polite">
          <p>No students found.</p>
          <p>There are no student records available yet.</p>
          <Link to="/students/add">Add a student</Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="students-heading">
      <h1 id="students-heading">Students</h1>

      <div
        className="table-responsive"
        role="region"
        aria-label="Student records table"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Student ID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Branch</th>
              <th scope="col">Year</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <th scope="row">{student.studentId}</th>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.branch}</td>
                <td>{student.year}</td>
                <td>
                  <Link to={`/students/${student.id}`}>View</Link>{" "}
                  <Link to={`/students/${student.id}/edit`}>Edit</Link>{" "}
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
    </section>
  );
}

export default Students;