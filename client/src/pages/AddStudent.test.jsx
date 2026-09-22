
import {
  describe,
  expect,
  it,
  beforeEach,
  vi,
} from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AddStudent from "./AddStudent";
import { StudentProvider } from "../context/StudentContext.jsx";

const newStudent = {
  _id: "507f1f77bcf86cd799439099",
  studentId: "STU999",
  name: "Test Student",
  email: "test@example.com",
  phone: "9876543210",
  branch: "Computer Science",
  year: "1st Year",
  gender: "Male",
  dateOfBirth: "2005-01-01",
  address: "Test Address",
};

beforeEach(() => {
  vi.restoreAllMocks();

  vi.stubGlobal(
    "fetch",
    vi.fn((url, options = {}) => {
      if (options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: newStudent,
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            count: 0,
            data: [],
          }),
      });
    })
  );
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

const fillValidStudentForm = () => {
  fireEvent.change(screen.getByLabelText("Student ID"), {
    target: { value: "STU999" },
  });

  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Test Student" },
  });

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "test@example.com" },
  });

  fireEvent.change(screen.getByLabelText("Phone"), {
    target: { value: "9876543210" },
  });

  fireEvent.change(screen.getByLabelText("Branch"), {
    target: { value: "Computer Science" },
  });

  fireEvent.change(screen.getByLabelText("Year"), {
    target: { value: "1st Year" },
  });

  fireEvent.change(screen.getByLabelText("Gender"), {
    target: { value: "Male" },
  });

  fireEvent.change(screen.getByLabelText("Date of Birth"), {
    target: { value: "2005-01-01" },
  });

  fireEvent.change(screen.getByLabelText("Address"), {
    target: { value: "Test Address" },
  });
};

describe("Add Student page", () => {
  it("renders the Add Student heading", () => {
    renderAddStudent();

    expect(
      screen.getByRole("heading", {
        name: "Add Student",
      })
    ).toBeInTheDocument();
  });

  it("renders the student form", () => {
    renderAddStudent();

    expect(
      screen.getByRole("heading", {
        name: "Student Information",
      })
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
      screen.getByRole("button", {
        name: "Add Student",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cancel",
      })
    ).toBeInTheDocument();
  });

  it("shows an error when required fields are empty", () => {
    renderAddStudent();

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please fill in all required fields."
    );
  });

  it("rejects an invalid email address", () => {
    renderAddStudent();

    fireEvent.change(screen.getByLabelText("Student ID"), {
      target: { value: "STU999" },
    });

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test Student" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid-email" },
    });

    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "9876543210" },
    });

    fireEvent.change(screen.getByLabelText("Branch"), {
      target: { value: "Computer Science" },
    });

    fireEvent.change(screen.getByLabelText("Year"), {
      target: { value: "1st Year" },
    });

    fireEvent.change(screen.getByLabelText("Gender"), {
      target: { value: "Male" },
    });

    fireEvent.change(screen.getByLabelText("Date of Birth"), {
      target: { value: "2005-01-01" },
    });

    fireEvent.change(screen.getByLabelText("Address"), {
      target: { value: "Test Address" },
    });

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a valid email address."
    );
  });

  it("rejects whitespace-only required text fields", () => {
    renderAddStudent();

    fireEvent.change(screen.getByLabelText("Student ID"), {
      target: { value: "   " },
    });

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please fill in all required fields."
    );
  });

  it("submits a valid student to the API", async () => {
    renderAddStudent();

    fillValidStudentForm();

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/students",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });

    const postCall = fetch.mock.calls.find(
      ([, options]) => options?.method === "POST"
    );

    expect(postCall).toBeDefined();
    expect(JSON.parse(postCall[1].body)).toEqual({ studentId: "STU999", name: "Test Student", email: "test@example.com", phone: "9876543210", branch: "Computer Science", year: "1st Year", gender: "Male", dateOfBirth: "2005-01-01", address: "Test Address", });
  });
});