import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../context/StudentContext";

function AddStudent() {
  const navigate = useNavigate();
  const { students, addStudent } = useStudents();

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newStudent = {
      id:
        students.length > 0
          ? Math.max(...students.map((student) => student.id)) + 1
          : 1,
      ...formData,
    };

    addStudent(newStudent);

    navigate("/students");
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Add Student</h1>
          <p>Add a new student record.</p>
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
            <button type="submit">Add Student</button>

            <button
              type="button"
              onClick={() => navigate("/students")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddStudent;