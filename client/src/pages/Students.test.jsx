import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
} from "react-router-dom";

import Students from "./Students";
import students from "../data/studentData";
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

  vi.stubGlobal("confirm", vi.fn(() => true));
});

const renderStudents = () => {
  return render(
    <StudentProvider>
      <MemoryRouter>
        <Students />
      </MemoryRouter>
    </StudentProvider>
  );
};

describe("Students page", () => {
  it("renders the Students heading", () => {
    renderStudents();

    expect(
      screen.getByRole("heading", {
        name: "Students",
      })
    ).toBeInTheDocument();
  });

  it("renders the student table", () => {
    renderStudents();

    expect(
      screen.getByRole("columnheader", {
        name: "Student ID",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Name",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Email",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Branch",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Year",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Actions",
      })
    ).toBeInTheDocument();
  });

  it("renders all students from the student data", () => {
    renderStudents();

    students.forEach((student) => {
      expect(
        screen.getByText(student.name)
      ).toBeInTheDocument();

      expect(
        screen.getByText(student.email)
      ).toBeInTheDocument();
    });
  });

  it("renders View and Edit links for students", () => {
    renderStudents();

    expect(
      screen.getAllByRole("link", {
        name: "View",
      }).length
    ).toBe(students.length);

    expect(
      screen.getAllByRole("link", {
        name: "Edit",
      }).length
    ).toBe(students.length);
  });

  it("renders Delete buttons for students", () => {
    renderStudents();

    expect(
      screen.getAllByRole("button", {
        name: "Delete",
      }).length
    ).toBe(students.length);
  });

  it("deletes a student after confirmation", async () => {
    const user = userEvent.setup();
    const studentToDelete = students[0];

    renderStudents();

    expect(
      screen.getByText(studentToDelete.name)
    ).toBeInTheDocument();

    const deleteButtons =
      screen.getAllByRole("button", {
        name: "Delete",
      });

    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this student?"
    );

    expect(
      screen.queryByText(studentToDelete.name)
    ).not.toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Delete",
      }).length
    ).toBe(students.length - 1);
  });

  it("does not delete a student when deletion is cancelled", async () => {
    const user = userEvent.setup();

    window.confirm.mockReturnValueOnce(false);

    const studentToKeep = students[0];

    renderStudents();

    expect(
      screen.getByText(studentToKeep.name)
    ).toBeInTheDocument();

    const deleteButtons =
      screen.getAllByRole("button", {
        name: "Delete",
      });

    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this student?"
    );

    expect(
      screen.getByText(studentToKeep.name)
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Delete",
      }).length
    ).toBe(students.length);
  });
});

describe("Students empty state", () => {
  it("shows an empty state when there are no students", () => {
    localStorage.setItem(
      "students",
      JSON.stringify([])
    );

    renderStudents();

    expect(
      screen.getByText(
        "No student records found."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("columnheader", {
        name: "Student ID",
      })
    ).not.toBeInTheDocument();
  });

  it("shows the empty state after deleting the only student", async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      "students",
      JSON.stringify([students[0]])
    );

    renderStudents();

    expect(
      screen.getByText(students[0].name)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(
      screen.getByText(
        "No student records found."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(students[0].name)
    ).not.toBeInTheDocument();
  });
});