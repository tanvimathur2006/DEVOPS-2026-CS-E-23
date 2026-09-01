
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Students from "./Students";
import students from "../data/studentData";
import { StudentProvider } from "../context/StudentContext";

const renderStudents = () => {
  return render(
    <StudentProvider>
      <MemoryRouter>
        <Students />
      </MemoryRouter>
    </StudentProvider>
  );
};

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
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
  });
});

describe("Students page", () => {
  it("renders the Students heading", () => {
    renderStudents();

    expect(
      screen.getByRole("heading", { name: "Students" })
    ).toBeInTheDocument();
  });

  it("renders the student table", () => {
    renderStudents();

    expect(
      screen.getByRole("columnheader", { name: "Student ID" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Email" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Branch" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Year" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Actions" })
    ).toBeInTheDocument();
  });

  it("renders all students from the student data", () => {
    renderStudents();

    students.forEach((student) => {
      expect(screen.getByText(student.name)).toBeInTheDocument();
      expect(screen.getByText(student.email)).toBeInTheDocument();
    });
  });

  it("renders View and Edit links for students", () => {
    renderStudents();

    expect(
      screen.getAllByRole("link", { name: "View" }).length
    ).toBe(students.length);

    expect(
      screen.getAllByRole("link", { name: "Edit" }).length
    ).toBe(students.length);
  });

  it("renders Delete buttons for students", () => {
    renderStudents();

    expect(
      screen.getAllByRole("button", { name: "Delete" }).length
    ).toBe(students.length);
  });
});
