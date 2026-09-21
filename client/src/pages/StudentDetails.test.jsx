import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import StudentDetails from "./StudentDetails";
import students from "../data/studentData";
import { StudentProvider } from "../context/StudentContext.jsx";

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

const renderStudentDetails = (id) => {
  return render(
    <StudentProvider>
      <MemoryRouter initialEntries={[`/students/${id}`]}>
        <Routes>
          <Route
            path="/students/:id"
            element={<StudentDetails />}
          />
        </Routes>
      </MemoryRouter>
    </StudentProvider>
  );
};

describe("StudentDetails page", () => {
  it("renders details for a valid student ID", () => {
    const student = students[0];

    renderStudentDetails(student.id);

    expect(
      screen.getByRole("heading", { name: "Student Details" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: student.name })
    ).toBeInTheDocument();

    expect(screen.getByText(student.email)).toBeInTheDocument();
    expect(screen.getByText(student.phone)).toBeInTheDocument();
    expect(screen.getByText(student.branch)).toBeInTheDocument();
  });

  it("shows Student Not Found for an invalid student ID", () => {
    renderStudentDetails("999999");

    expect(
      screen.getByRole("heading", { name: "Student Not Found" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The requested student record could not be found."
      )
    ).toBeInTheDocument();
  });

  it("handles a non-numeric student ID gracefully", () => {
    renderStudentDetails("invalid-id");

    expect(
      screen.getByRole("heading", { name: "Student Not Found" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("The requested student record could not be found.")
    ).toBeInTheDocument();
  });

  it("provides a link back to the Students page when the student is not found", () => {
    renderStudentDetails("999999");

    const backLinks = screen.getAllByRole("link", {
      name: "← Back to Students",
    });

    expect(backLinks).toHaveLength(1);
    expect(backLinks[0]).toHaveAttribute("href", "/students");
  });
});