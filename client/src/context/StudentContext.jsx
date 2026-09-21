import { useEffect, useState } from "react";
import initialStudents from "../data/studentData";
import { StudentContext } from "./StudentContext.js";

export function StudentProvider({ children }) {
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem("students");

    if (!savedStudents) {
      return initialStudents;
    }

    try {
      const parsedStudents = JSON.parse(savedStudents);

      if (!Array.isArray(parsedStudents)) {
        return initialStudents;
      }

      return parsedStudents;
    } catch {
      return initialStudents;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "students",
      JSON.stringify(students)
    );
  }, [students]);

  const addStudent = (student) => {
    setStudents((currentStudents) => [
      ...currentStudents,
      student,
    ]);
  };

  const updateStudent = (updatedStudent) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === updatedStudent.id
          ? updatedStudent
          : student
      )
    );
  };

  const deleteStudent = (id) => {
    setStudents((currentStudents) =>
      currentStudents.filter(
        (student) => student.id !== id
      )
    );
  };

  const getStudentById = (id) => {
    return students.find(
      (student) => student.id === Number(id)
    );
  };

  return (
    <StudentContext.Provider
      value={{
        students,
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