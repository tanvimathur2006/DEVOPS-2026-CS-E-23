import { Link } from "react-router-dom";
import students from "../data/studentData";

function Students() {
  return (
    <section>
      <h1>Students</h1>

      <table>
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
                <Link to={`/students/${student.id}`}>View</Link>{" "}
                <Link to={`/students/${student.id}/edit`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Students;