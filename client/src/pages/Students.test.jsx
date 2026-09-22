
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Students from "./Students";
import { StudentProvider } from "../context/StudentContext.jsx";

const mockStudents = [
  {
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
  },
  {
    _id: "507f1f77bcf86cd799439012",
    studentId: "STU002",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "9876543211",
    branch: "Information Technology",
    year: "2nd Year",
    gender: "Female",
    dateOfBirth: "2005-03-20",
    address: "Mumbai, Maharashtra",
  },
];

const renderStudents = () => {
  return render(
    <StudentProvider>
      <MemoryRouter>
        <Students />
      </MemoryRouter>
    </StudentProvider>
  );
};

beforeEach(() => {
  vi.restoreAllMocks();

  vi.stubGlobal(
    "fetch",
    vi.fn((url, options = {}) => {
      if (options.method === "DELETE") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: "Student deleted successfully",
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            count: mockStudents.length,
            data: mockStudents,
          }),
      });
    })
  );

  vi.stubGlobal(
    "confirm",
    vi.fn(() => true)
  );
});

describe("Students page", () => {
  it("renders the Students heading", () => {
    renderStudents();

    expect(
      screen.getByRole("heading", {
        name: "Students",
      })
    ).toBeInTheDocument();
  });

  it("renders the student table", async () => {
    renderStudents();

    expect(
      await screen.findByRole("columnheader", {
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

  it("renders all students from the API", async () => {
    renderStudents();

    for (const student of mockStudents) {
      expect(
        await screen.findByText(student.name)
      ).toBeInTheDocument();

      expect(
        screen.getByText(student.email)
      ).toBeInTheDocument();
    }
  });

  it("renders View and Edit links for students", async () => {
    renderStudents();

    await screen.findByText("Aarav Sharma");

    expect(
      screen.getAllByRole("link", {
        name: "View",
      }).length
    ).toBe(mockStudents.length);

    expect(
      screen.getAllByRole("link", {
        name: "Edit",
      }).length
    ).toBe(mockStudents.length);
  });

  it("renders Delete buttons for students", async () => {
    renderStudents();

    await screen.findByText("Aarav Sharma");

    expect(
      screen.getAllByRole("button", {
        name: "Delete",
      }).length
    ).toBe(mockStudents.length);
  });

  it("deletes a student after confirmation", async () => {
    renderStudents();

    const studentToDelete = await screen.findByText(
      "Aarav Sharma"
    );

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Delete",
      })[0]
    );

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this student?"
    );

    await waitFor(() => {
      expect(studentToDelete).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", {
          name: "Delete",
        }).length
      ).toBe(mockStudents.length - 1);
    });
  });

  it("does not delete a student when deletion is cancelled", async () => {
    window.confirm.mockReturnValueOnce(false);

    renderStudents();

    const studentToKeep = await screen.findByText(
      "Aarav Sharma"
    );

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Delete",
      })[0]
    );

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this student?"
    );

    expect(studentToKeep).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Delete",
      }).length
    ).toBe(mockStudents.length);
  });
});

describe("Students empty state", () => {
  it("shows an empty state when there are no students", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              count: 0,
              data: [],
            }),
        })
      )
    );

    renderStudents();

    expect(
      await screen.findByText(
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
    vi.stubGlobal(
      "fetch",
      vi.fn((url, options = {}) => {
        if (options.method === "DELETE") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                message: "Student deleted successfully",
              }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              count: 1,
              data: [mockStudents[0]],
            }),
        });
      })
    );

    renderStudents();

    expect(
      await screen.findByText(mockStudents[0].name)
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(
      await screen.findByText(
        "No student records found."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(mockStudents[0].name)
    ).not.toBeInTheDocument();
  });
});
