
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

  it("renders the edit form with student information", async () => {
    renderEditStudent();

    await screen.findByDisplayValue("STU001");

    expect(
      screen.getByLabelText("Student ID")
    ).toHaveValue("STU001");

    expect(
      screen.getByLabelText("Name")
    ).toHaveValue("Aarav Sharma");

    expect(
      screen.getByLabelText("Email")
    ).toHaveValue("aarav.sharma@example.com");

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

  it("shows an error when a required field is cleared", async () => {
    renderEditStudent();

    const nameInput = await screen.findByDisplayValue(
      "Aarav Sharma"
    );

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

  it("rejects an invalid phone number", async () => {
    renderEditStudent();

    const phoneInput = await screen.findByDisplayValue(
      "9876543210"
    );

    fireEvent.change(phoneInput, {
      target: { value: "123" },
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
      "Please enter a valid 10-digit phone number."
    );
  });

  it("rejects whitespace-only address", async () => {
    renderEditStudent();

    const addressInput = await screen.findByDisplayValue(
      "Pune, Maharashtra"
    );

    fireEvent.change(addressInput, {
      target: { value: "   " },
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

  it("shows Student Not Found for an invalid student ID", async () => {
    renderEditStudentWithInvalidId();

    await screen.findByRole("heading", {
      name: "Student Not Found",
    });

    expect(
      screen.getByText(
        "The student you are trying to edit does not exist."
      )
    ).toBeInTheDocument();
  });

  it("does not show the edit form for an invalid student ID", async () => {
    renderEditStudentWithInvalidId();

    await screen.findByRole("heading", {
      name: "Student Not Found",
    });

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