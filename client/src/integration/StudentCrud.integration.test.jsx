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
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import AddStudent from "../pages/AddStudent";
import EditStudent from "../pages/EditStudent";
import StudentDetails from "../pages/StudentDetails";
import { StudentProvider } from "../context/StudentContext.jsx";
import students from "../data/studentData";

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

const renderApp = (initialRoute) => {
  return render(
    <StudentProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/students"
            element={<Students />}
          />

          <Route
            path="/students/add"
            element={<AddStudent />}
          />

          <Route
            path="/students/:id/edit"
            element={<EditStudent />}
          />

          <Route
            path="/students/:id"
            element={<StudentDetails />}
          />

          <Route
            path="/"
            element={<Dashboard />}
          />
        </Routes>
      </MemoryRouter>
    </StudentProvider>
  );
};

const fillAddStudentForm = () => {
  fireEvent.change(
    screen.getByLabelText("Student ID"),
    {
      target: {
        value: "STU999",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Name"),
    {
      target: {
        value: "Integration Student",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Email"),
    {
      target: {
        value: "integration@example.com",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Phone"),
    {
      target: {
        value: "9876543210",
      },
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
      target: {
        value: "1st Year",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Gender"),
    {
      target: {
        value: "Other",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Date of Birth"),
    {
      target: {
        value: "2005-01-01",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText("Address"),
    {
      target: {
        value: "Integration Test Address",
      },
    }
  );
};

describe("Student CRUD integration", () => {
  it("adds a student and displays it in the Students list", async () => {
    const user = userEvent.setup();

    renderApp("/students/add");

    fillAddStudentForm();

    await user.click(
      screen.getByRole("button", {
        name: "Add Student",
      })
    );

    expect(
      screen.getByRole("heading", {
        name: "Students",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Integration Student")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "integration@example.com"
      )
    ).toBeInTheDocument();
  });

  it("edits a student and displays the updated information", async () => {
    const user = userEvent.setup();

    const student = students[0];

    renderApp(
      `/students/${student.id}/edit`
    );

    const nameInput = screen.getByLabelText(
      "Name"
    );

    await user.clear(nameInput);

    await user.type(
      nameInput,
      "Updated Integration Student"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save Changes",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Student Details",
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", {
        name: "Updated Integration Student",
      })
    ).toBeInTheDocument();
  });

  it("deletes a student and removes it from the Students list", async () => {
    const user = userEvent.setup();

    const studentToDelete = students[0];

    renderApp("/students");

    expect(
      screen.getByText(
        studentToDelete.name
      )
    ).toBeInTheDocument();

    const deleteButtons =
      screen.getAllByRole("button", {
        name: "Delete",
      });

    await user.click(deleteButtons[0]);

    expect(
      window.confirm
    ).toHaveBeenCalledWith(
      "Are you sure you want to delete this student?"
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          studentToDelete.name
        )
      ).not.toBeInTheDocument();
    });
  });

  it("keeps the dashboard student count consistent after deletion", async () => {
    const user = userEvent.setup();

    const initialCount = students.length;

    render(
      <StudentProvider>
        <MemoryRouter
          initialEntries={["/students"]}
        >
          <Routes>
            <Route
              path="/students"
              element={
                <>
                  <Students />
                  <Dashboard />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </StudentProvider>
    );

    const deleteButtons =
      screen.getAllByRole("button", {
        name: "Delete",
      });

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      const totalStudentsCard =
        screen
          .getByText("Total Students")
          .closest(".stat-card");

      expect(
        totalStudentsCard
      ).toBeInTheDocument();

      expect(
        totalStudentsCard.querySelector("h2")
      ).toHaveTextContent(
        String(initialCount - 1)
      );
    });
  });
});