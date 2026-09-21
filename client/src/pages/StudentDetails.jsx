import { Link, useParams } from "react-router-dom";
import { useContext } from "react";
import { StudentContext } from "../context/StudentContext.js";

function StudentDetails() {
  const { id } = useParams();
  const { getStudentById } = useContext(StudentContext);

  const student = getStudentById(id);

  if (!student) {
    return (
      <section>
        <div className="page-header">
          <h1>Student Not Found</h1>
          <p>The requested student record could not be found.</p>
        </div>

        <Link to="/students" className="back-link">
          ← Back to Students
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Student Details</h1>
          <p>Complete information for {student.name}.</p>
        </div>
      </div>

      <div className="dashboard-card student-details-card">
        <div className="student-details-header">
          <div className="student-details-avatar">
            {student.name.charAt(0)}
          </div>

          <div>
            <h2>{student.name}</h2>
            <p>{student.studentId}</p>
          </div>
        </div>

        <div className="student-details-grid">
          <div className="detail-item">
            <span>Student ID</span>
            <strong>{student.studentId}</strong>
          </div>

          <div className="detail-item">
            <span>Name</span>
            <strong>{student.name}</strong>
          </div>

          <div className="detail-item">
            <span>Email</span>
            <strong>{student.email}</strong>
          </div>

          <div className="detail-item">
            <span>Phone</span>
            <strong>{student.phone}</strong>
          </div>

          <div className="detail-item">
            <span>Branch</span>
            <strong>{student.branch}</strong>
          </div>

          <div className="detail-item">
            <span>Year</span>
            <strong>{student.year}</strong>
          </div>

          <div className="detail-item">
            <span>Gender</span>
            <strong>{student.gender}</strong>
          </div>

          <div className="detail-item">
            <span>Date of Birth</span>
            <strong>{student.dateOfBirth}</strong>
          </div>

          <div className="detail-item detail-item-full">
            <span>Address</span>
            <strong>{student.address}</strong>
          </div>
        </div>

        <div className="student-details-actions">
          <Link to="/students" className="back-link">
            ← Back to Students
          </Link>
        </div>
      </div>
    </section>
  );
}

export default StudentDetails;