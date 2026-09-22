import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import EditStudent from "./EditStudent";
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

const renderEditStudent = () =>
  render(
    <StudentProvider>
      <MemoryRouter
        initialEntries={[
          "/students/507f1f77bcf86cd799439011/edit",
        ]}
      >
        <Routes>
          <Route
            path="/students/:id/edit"
            element={<EditStudent />}
          />
        </Routes>
      </MemoryRouter>
    </StudentProvider>
  );

describe("Edit Student page", () => {
  it("renders the Edit Student heading", () => {
    renderEditStudent();

    expect(
      screen.getByRole("heading", {
        name: "Edit Student",
      })
    ).toBeInTheDocument();
  });

  it("renders the edit form with student information", async () => {
    renderEditStudent();

    expect(
      await screen.findByDisplayValue("STU001")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Aarav Sharma")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("aarav.sharma@example.com")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("9876543210")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Computer Science")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("3rd Year")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Male")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("2004-05-12")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Pune, Maharashtra")
    ).toBeInTheDocument();
  });
});
