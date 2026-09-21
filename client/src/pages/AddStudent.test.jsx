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
} from "@testing-library/react";
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
      Object.keys(storage).forEach(
        (key) => delete storage[key]
      );
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

const fillValidStudentForm = () => {
  fireEvent.change(
    screen.getByLabelText("Student ID"),
    {
      target: { value: "STU999" },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Name"),
    {
      target: { value: "Test Student" },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Email"),
    {
      target: {
        value: "test@example.com",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Phone"),
    {
      target: { value: "9876543210" },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Branch"),
    {
      target: {
        value: "Computer Science",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Year"),
    {
      target: { value: "1st Year" },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Gender"),
    {
      target: { value: "Male" },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Date of Birth"),
    {
      target: { value: "2005-01-01" },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Address"),
    {
      target: { value: "Test Address" },
    }
  );
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

    expect(
      screen.getByLabelText("Student ID")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Phone")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Branch")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Year")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Gender")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Date of Birth")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Address")
    ).toBeInTheDocument();

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

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please fill in all required fields."
    );
  });

  it("rejects an invalid email address", () => {
    renderAddStudent();

    fireEvent.change(
      screen.getByLabelText("Student ID"),
      {
        target: { value: "STU999" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Name"),
      {
        target: { value: "Test Student" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: { value: "invalid-email" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Phone"),
      {
        target: { value: "9876543210" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Branch"),
      {
        target: {
          value: "Computer Science",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Year"),
      {
        target: { value: "1st Year" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Gender"),
      {
        target: { value: "Male" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Date of Birth"),
      {
        target: { value: "2005-01-01" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Address"),
      {
        target: { value: "Test Address" },
      }
    );

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please enter a valid email address."
    );
  });

  it("rejects whitespace-only required text fields", () => {
    renderAddStudent();

    fireEvent.change(
      screen.getByLabelText("Student ID"),
      {
        target: { value: "   " },
      }
    );

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please fill in all required fields."
    );
  });

  it("assigns ID 1 when adding a student to an empty list", () => {
    localStorage.setItem(
      "students",
      JSON.stringify([])
    );

    renderAddStudent();

    fillValidStudentForm();

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    const savedStudents = JSON.parse(
      localStorage.getItem("students")
    );

    expect(savedStudents).toHaveLength(1);
    expect(savedStudents[0].id).toBe(1);
    expect(savedStudents[0].name).toBe(
      "Test Student"
    );
  });

  it("assigns the next ID after the highest existing ID", () => {
    const existingStudents = [
      {
        id: 2,
        studentId: "STU002",
        name: "Student Two",
        email: "two@example.com",
        phone: "9876543210",
        branch: "Computer Science",
        year: "2nd Year",
        gender: "Male",
        dateOfBirth: "2004-01-01",
        address: "Address Two",
      },
      {
        id: 7,
        studentId: "STU007",
        name: "Student Seven",
        email: "seven@example.com",
        phone: "9876543211",
        branch: "Electronics",
        year: "3rd Year",
        gender: "Female",
        dateOfBirth: "2003-01-01",
        address: "Address Seven",
      },
      {
        id: 4,
        studentId: "STU004",
        name: "Student Four",
        email: "four@example.com",
        phone: "9876543212",
        branch: "Mechanical",
        year: "1st Year",
        gender: "Other",
        dateOfBirth: "2005-01-01",
        address: "Address Four",
      },
    ];

    localStorage.setItem(
      "students",
      JSON.stringify(existingStudents)
    );

    renderAddStudent();

    fillValidStudentForm();

    const form = screen
      .getByRole("button", {
        name: "Add Student",
      })
      .closest("form");

    fireEvent.submit(form);

    const savedStudents = JSON.parse(
      localStorage.getItem("students")
    );

    expect(savedStudents).toHaveLength(4);
    expect(savedStudents[3].id).toBe(8);
    expect(savedStudents[3].name).toBe(
      "Test Student"
    );
  });
});