import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import EditStudent from "./EditStudent";
import { StudentProvider } from "../context/StudentContext";

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

const renderEditStudent = () => {
  return render(
    <StudentProvider>
      <MemoryRouter initialEntries={["/students/1/edit"]}>
        <Routes>
          <Route
            path="/students/:id/edit"
            element={<EditStudent />}
          />
        </Routes>
      </MemoryRouter>
    </StudentProvider>
  );
};

describe("Edit Student page", () => {
  it("renders the Edit Student heading", () => {
    renderEditStudent();

    expect(
      screen.getByRole("heading", { name: "Edit Student" })
    ).toBeInTheDocument();
  });

  it("renders the edit form", () => {
    renderEditStudent();

    expect(
      screen.getByRole("heading", { name: "Student Information" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Student ID")).toHaveValue("STU001");
    expect(screen.getByLabelText("Name")).toHaveValue("Aarav Sharma");
    expect(
      screen.getByLabelText("Email")
    ).toHaveValue("aarav.sharma@example.com");

    expect(screen.getByLabelText("Phone")).toHaveValue("9876543210");
    expect(screen.getByLabelText("Branch")).toHaveValue(
      "Computer Science"
    );
    expect(screen.getByLabelText("Year")).toHaveValue("3rd Year");
    expect(screen.getByLabelText("Gender")).toHaveValue("Male");
    expect(screen.getByLabelText("Date of Birth")).toHaveValue(
      "2004-05-12"
    );
    expect(screen.getByLabelText("Address")).toHaveValue(
      "Pune, Maharashtra"
    );

    expect(
      screen.getByRole("button", { name: "Save Changes" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancel" })
    ).toBeInTheDocument();
  });
});