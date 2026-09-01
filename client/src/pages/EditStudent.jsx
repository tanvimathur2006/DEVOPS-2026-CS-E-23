import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudents } from "../context/useStudents";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { students, updateStudent } = useStudents();

  const student = students.find(
    (student) => student.id === Number(id)
  );

  const [formData, setFormData] = useState(() => {
    if (!student) {
      return {
        studentId: "",
        name: "",
        email: "",
        phone: "",
        branch: "",
        year: "",
        gender: "",
        dateOfBirth: "",
        address: "",
      };
    }

    return {
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      branch: student.branch,
      year: student.year,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
    };
  });

  if (!student) {
    return (
      <section>
        <h1>Student Not Found</h1>
        <p>The student you are trying to edit does not exist.</p>

        <button onClick={() => navigate("/students")}>
          Back to Students
        </button>
      </section>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    updateStudent({
      id: student.id,
      ...formData,
    });

    navigate(`/students/${student.id}`);
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Edit Student</h1>
          <p>Update student information.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2>Student Information</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>
              <option value="Computer Science">
                Computer Science
              </option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          <div>
            <label htmlFor="year">Year</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <button type="submit">Save Changes</button>

            <button
              type="button"
              onClick={() =>
                navigate(`/students/${student.id}`)
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditStudent;