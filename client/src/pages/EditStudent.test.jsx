import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import EditStudent from "./EditStudent";
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

const renderEditStudentWithInvalidId = () => {
  return render(
    <StudentProvider>
      <MemoryRouter
        initialEntries={["/students/999999/edit"]}
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
};

describe("Edit Student page", () => {
  it("renders the Edit Student heading", () => {
    renderEditStudent();

    expect(
      screen.getByRole("heading", {
        name: "Edit Student",
      })
    ).toBeInTheDocument();
  });

  it("renders the edit form", () => {
    renderEditStudent();

    expect(
      screen.getByRole("heading", {
        name: "Student Information",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Student ID")
    ).toHaveValue("STU001");

    expect(
      screen.getByLabelText("Name")
    ).toHaveValue("Aarav Sharma");

    expect(
      screen.getByLabelText("Email")
    ).toHaveValue(
      "aarav.sharma@example.com"
    );

    expect(
      screen.getByLabelText("Phone")
    ).toHaveValue("9876543210");

    expect(
      screen.getByLabelText("Branch")
    ).toHaveValue("Computer Science");

    expect(
      screen.getByLabelText("Year")
    ).toHaveValue("3rd Year");

    expect(
      screen.getByLabelText("Gender")
    ).toHaveValue("Male");

    expect(
      screen.getByLabelText("Date of Birth")
    ).toHaveValue("2004-05-12");

    expect(
      screen.getByLabelText("Address")
    ).toHaveValue("Pune, Maharashtra");

    expect(
      screen.getByRole("button", {
        name: "Save Changes",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cancel",
      })
    ).toBeInTheDocument();
  });

  it("shows an error when a required field is cleared", () => {
    renderEditStudent();

    const nameInput = screen.getByLabelText("Name");

    fireEvent.change(nameInput, {
      target: { value: "" },
    });

    const form = screen
      .getByRole("button", {
        name: "Save Changes",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please fill in all required fields."
    );
  });

  it("rejects an invalid phone number", () => {
    renderEditStudent();

    fireEvent.change(
      screen.getByLabelText("Phone"),
      {
        target: { value: "123" },
      }
    );

    const form = screen
      .getByRole("button", {
        name: "Save Changes",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please enter a valid 10-digit phone number."
    );
  });

  it("rejects whitespace-only address", () => {
    renderEditStudent();

    fireEvent.change(
      screen.getByLabelText("Address"),
      {
        target: { value: "   " },
      }
    );

    const form = screen
      .getByRole("button", {
        name: "Save Changes",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please fill in all required fields."
    );
  });

  it("shows Student Not Found for an invalid student ID", () => {
    renderEditStudentWithInvalidId();

    expect(
      screen.getByRole("heading", {
        name: "Student Not Found",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The student you are trying to edit does not exist."
      )
    ).toBeInTheDocument();
  });

  it("does not show the edit form for an invalid student ID", () => {
    renderEditStudentWithInvalidId();

    expect(
      screen.queryByRole("heading", {
        name: "Student Information",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Save Changes",
      })
    ).not.toBeInTheDocument();
  });
});