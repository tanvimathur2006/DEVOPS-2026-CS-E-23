import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AddStudent from "./AddStudent";
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

const renderAddStudent = () => {
  return render(
    <StudentProvider>
      <MemoryRouter>
        <AddStudent />
      </MemoryRouter>
    </StudentProvider>
  );
};

describe("Add Student page", () => {
  it("renders the Add Student heading", () => {
    renderAddStudent();

    expect(
      screen.getByRole("heading", { name: "Add Student" })
    ).toBeInTheDocument();
  });

  it("renders the student form", () => {
    renderAddStudent();

    expect(
      screen.getByRole("heading", { name: "Student Information" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Student ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Branch")).toBeInTheDocument();
    expect(screen.getByLabelText("Year")).toBeInTheDocument();
    expect(screen.getByLabelText("Gender")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add Student" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancel" })
    ).toBeInTheDocument();
  });
});
