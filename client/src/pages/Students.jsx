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
    </section>
  );
}

export default Students;