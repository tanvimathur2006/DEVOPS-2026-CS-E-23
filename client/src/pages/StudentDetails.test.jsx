import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

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

const renderStudentDetails = (id = mockStudent._id) =>
  render(
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

describe("StudentDetails page", () => {
  it("renders details for a valid student ID", async () => {
    renderStudentDetails();

    expect(
      await screen.findByRole("heading", {
        name: mockStudent.name,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Student Details",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(mockStudent.email)
    ).toBeInTheDocument();

    expect(
      screen.getByText(mockStudent.phone)
    ).toBeInTheDocument();

    expect(
      screen.getByText(mockStudent.branch)
    ).toBeInTheDocument();
  });

  it("shows Student Not Found for an invalid student ID", async () => {
    renderStudentDetails("999999");

    expect(
      await screen.findByRole("heading", {
        name: "Student Not Found",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The requested student record could not be found."
      )
    ).toBeInTheDocument();
  });

  it("handles a non-numeric student ID gracefully", async () => {
    renderStudentDetails("invalid-id");

    expect(
      await screen.findByRole("heading", {
        name: "Student Not Found",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The requested student record could not be found."
      )
    ).toBeInTheDocument();
  });

  it("provides a link back to the Students page when the student is not found", async () => {
    renderStudentDetails("999999");

    await screen.findByRole("heading", {
      name: "Student Not Found",
    });

    const backLinks = screen.getAllByRole("link", {
      name: "← Back to Students",
    });

    expect(backLinks).toHaveLength(1);

    expect(backLinks[0]).toHaveAttribute(
      "href",
      "/students"
    );
  });
});

