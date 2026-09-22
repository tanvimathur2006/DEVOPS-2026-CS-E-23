import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import StudentDetails from "./StudentDetails";
import { StudentProvider } from "../context/StudentContext.jsx";

const mockStudent = {
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
            count: 1,
            data: [mockStudent],
          }),
      })
    )
  );
});

const renderStudentDetails = () =>
  render(
    <StudentProvider>
      <MemoryRouter
        initialEntries={[
          "/students/507f1f77bcf86cd799439011",
        ]}
      >
        <Routes>
          <Route
            path="/students/:id"
            element={<StudentDetails />}
          />
        </Routes>
      </MemoryRouter>
    </StudentProvider>
  );

describe("Student Details page", () => {
  it("renders the Student Details heading", () => {
    renderStudentDetails();

    expect(
      screen.getByRole("heading", {
        name: "Student Details",
      })
    ).toBeInTheDocument();
  });

  it("renders the student information", async () => {
    renderStudentDetails();

    expect(
      await screen.findByRole("heading", {
        name: "Aarav Sharma",
      })
    ).toBeInTheDocument();

    expect(screen.getAllByText("STU001").length).toBeGreaterThan(0);

    expect(
      screen.getByText("aarav.sharma@example.com")
    ).toBeInTheDocument();
  });
});
