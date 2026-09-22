import { useEffect, useState } from "react";
import { StudentContext } from "./StudentContext.js";

const API_URL = "http://localhost:5000/api/students";

const normalizeStudent = (student) => ({
  ...student,
  id: student._id,
});

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch students"
        );
      }

      setStudents((result.data || []).map(normalizeStudent));
    } catch (err) {
      setError(err.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (student) => {
    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to add student"
        );
      }

      const newStudent = normalizeStudent(result.data);

      setStudents((currentStudents) => [
        ...currentStudents,
        newStudent,
      ]);

      return newStudent;
    } catch (err) {
      setError(err.message || "Failed to add student");
      throw err;
    }
  };

  const updateStudent = async (updatedStudent) => {
    try {
      setError("");

      const { id, ...studentData } = updatedStudent;

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update student"
        );
      }

      const updated = normalizeStudent(result.data);

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === id ? updated : student
        )
      );

      return updated;
    } catch (err) {
      setError(err.message || "Failed to update student");
      throw err;
    }
  };

  const deleteStudent = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete student"
        );
      }

      setStudents((currentStudents) =>
        currentStudents.filter((student) => student.id !== id)
      );
    } catch (err) {
      setError(err.message || "Failed to delete student");
      throw err;
    }
  };

  const getStudentById = (id) => {
    return students.find((student) => String(student.id) === String(id));
  };
  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        error,
        fetchStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}