import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  StudentProvider,
} from "./StudentContext.jsx";
import { useStudents } from "./useStudents";

describe("StudentContext", () => {
  beforeEach(() => {
    const storage = {};

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key) => storage[key] ?? null),

      setItem: vi.fn((key, value) => {
        storage[key] = String(value);
      }),

      removeItem: vi.fn((key) => {
        delete storage[key];
      }),

      clear: vi.fn(() => {
        Object.keys(storage).forEach(
          (key) => delete storage[key]
        );
      }),
    });
  });

  it("uses initial students when localStorage is empty", () => {
    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    expect(result.current.students.length).toBeGreaterThan(0);
  });

  it("uses valid students from localStorage", () => {
    const savedStudents = [
      {
        id: 100,
        studentId: "TEST100",
        name: "Test Student",
        email: "test@example.com",
        phone: "9876543210",
        branch: "Computer Science",
        year: "1st Year",
        gender: "Other",
        dateOfBirth: "2005-01-01",
        address: "Test Address",
      },
    ];

    localStorage.setItem(
      "students",
      JSON.stringify(savedStudents)
    );

    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    expect(result.current.students).toEqual(
      savedStudents
    );
  });

  it("falls back to initial students when localStorage contains malformed JSON", () => {
    localStorage.setItem(
      "students",
      "{invalid-json"
    );

    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    expect(result.current.students.length).toBeGreaterThan(0);
  });

  it("falls back to initial students when localStorage contains non-array data", () => {
    localStorage.setItem(
      "students",
      JSON.stringify({
        id: 1,
        name: "Invalid Data",
      })
    );

    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    expect(result.current.students.length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.students)).toBe(
      true
    );
  });

  it("adds a student to the student list", () => {
    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    const initialCount = result.current.students.length;

    const newStudent = {
      id: 999,
      studentId: "TEST999",
      name: "New Student",
      email: "new@example.com",
      phone: "9876543210",
      branch: "Computer Science",
      year: "1st Year",
      gender: "Other",
      dateOfBirth: "2005-01-01",
      address: "Test Address",
    };

    act(() => {
      result.current.addStudent(newStudent);
    });

    expect(result.current.students).toHaveLength(
      initialCount + 1
    );

    expect(
      result.current.students
    ).toContainEqual(newStudent);
  });

  it("updates an existing student", () => {
    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    const existingStudent = result.current.students[0];

    const updatedStudent = {
      ...existingStudent,
      name: "Updated Student",
    };

    act(() => {
      result.current.updateStudent(updatedStudent);
    });

    expect(
      result.current.students.find(
        (student) => student.id === existingStudent.id
      )
    ).toEqual(updatedStudent);
  });

  it("deletes an existing student", () => {
    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    const existingStudent = result.current.students[0];

    act(() => {
      result.current.deleteStudent(existingStudent.id);
    });

    expect(
      result.current.students
    ).not.toContainEqual(existingStudent);
  });

  it("returns a student by ID", () => {
    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    const existingStudent = result.current.students[0];

    expect(
      result.current.getStudentById(existingStudent.id)
    ).toEqual(existingStudent);
  });

  it("returns undefined for an invalid student ID", () => {
    const { result } = renderHook(
      () => useStudents(),
      {
        wrapper: StudentProvider,
      }
    );

    expect(
      result.current.getStudentById(999999)
    ).toBeUndefined();
  });
});