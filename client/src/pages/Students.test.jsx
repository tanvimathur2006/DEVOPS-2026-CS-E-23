import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Students from "./Students";
import { StudentProvider } from "../context/StudentContext.jsx";

const mockStudents = [
  {
    _id: "507f1f77bcf86cd799439011",
    studentId: "STU001",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "9876543210",
    branch: "Computer Science",
    year: "3rd Year",
    gender: "Male",
    dateOfBirth: "2004-05-12",
    address: "Pune, Maharashtra",
  },
  {
    _id: "507f1f77bcf86cd799439012",
    studentId: "STU002",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "9876543211",
    branch: "Information Technology",
    year: "2nd Year",
    gender: "Female",
    dateOfBirth: "2005-03-20",
    address: "Mumbai, Maharashtra",
  },
];

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
  vi.restoreAllMocks();

  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            count: mockStudents.length,
            data: mockStudents,
          }),
      })
    )
  );
});

describe("Students page", () => {
  it("renders the Students heading", () => {
    renderStudents();

    expect(
      screen.getByRole("heading", { name: "Students" })
    ).toBeInTheDocument();
  });

  it("renders the student table", async () => {
    renderStudents();

    expect(
      await screen.findByRole("columnheader", { name: "Student ID" })
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

  it("renders all students from the API", async () => {
    renderStudents();

    for (const student of mockStudents) {
      expect(await screen.findByText(student.name)).toBeInTheDocument();
      expect(screen.getByText(student.email)).toBeInTheDocument();
    }
  });

  it("renders View and Edit links for students", async () => {
    renderStudents();

    await screen.findByText("Aarav Sharma");

    expect(
      screen.getAllByRole("link", { name: "View" }).length
    ).toBe(mockStudents.length);

    expect(
      screen.getAllByRole("link", { name: "Edit" }).length
    ).toBe(mockStudents.length);
  });

  it("renders Delete buttons for students", async () => {
    renderStudents();

    await screen.findByText("Aarav Sharma");

    expect(
      screen.getAllByRole("button", { name: "Delete" }).length
    ).toBe(mockStudents.length);
  });
});
