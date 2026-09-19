import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import StudentDetails from "./StudentDetails";

describe("Student Details page", () => {
  it("renders the Student Details heading", () => {
    render(
      <MemoryRouter initialEntries={["/students/1"]}>
        <Routes>
          <Route path="/students/:id" element={<StudentDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Student Details" })
    ).toBeInTheDocument();
  });

  it("renders the student information", () => {
    render(
      <MemoryRouter initialEntries={["/students/1"]}>
        <Routes>
          <Route path="/students/:id" element={<StudentDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Aarav Sharma" })
    ).toBeInTheDocument();

    expect(screen.getAllByText("STU001").length).toBeGreaterThan(0);

    expect(
      screen.getByText("aarav.sharma@example.com")
    ).toBeInTheDocument();
  });
});