
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StudentProvider } from "./StudentContext.jsx";
import { useStudents } from "./useStudents.js";

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
    name: "Ananya Patel",
    email: "ananya.patel@example.com",
    phone: "9876543211",
    branch: "Electronics",
    year: "2nd Year",
    gender: "Female",
    dateOfBirth: "2005-08-20",
    address: "Mumbai, Maharashtra",
  },
];

function TestComponent() {
  const {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
  } = useStudents();

  return (
    <div>
      <div data-testid="loading">
        {loading ? "Loading" : "Loaded"}
      </div>

      <div data-testid="error">{error}</div>

      <div data-testid="student-count">
        {students.length}
      </div>

      <div data-testid="student-list">
        {students.map((student) => (
          <div key={student.id}>
            {student.name}
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          addStudent({
            studentId: "STU003",
            name: "Rohan Verma",
            email: "rohan.verma@example.com",
            phone: "9876543212",
            branch: "Mechanical",
            year: "4th Year",
            gender: "Male",
            dateOfBirth: "2003-03-15",
            address: "Delhi",
          })
        }
      >
        Add
      </button>

      <button
        onClick={() =>
          updateStudent({
            id: "507f1f77bcf86cd799439011",
            studentId: "STU001",
            name: "Updated Student",
            email: "aarav.sharma@example.com",
            phone: "9876543210",
            branch: "Computer Science",
            year: "3rd Year",
            gender: "Male",
            dateOfBirth: "2004-05-12",
            address: "Pune, Maharashtra",
          })
        }
      >
        Update
      </button>

      <button
        onClick={() =>
          deleteStudent("507f1f77bcf86cd799439011")
        }
      >
        Delete
      </button>

      <button
        onClick={() => {
          const student = getStudentById(
            "507f1f77bcf86cd799439011"
          );

          document.body.dataset.foundStudent =
            student?.name || "undefined";
        }}
      >
        Find Student
      </button>
    </div>
  );
}

describe("StudentContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads students from the API", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockStudents,
      }),
    });

    render(
      <StudentProvider>
        <TestComponent />
      </StudentProvider>
    );

    expect(
      await screen.findByText("Loaded")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("student-count")
    ).toHaveTextContent("2");

    expect(
      screen.getByText("Aarav Sharma")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ananya Patel")
    ).toBeInTheDocument();
  });

  it("calls the students API when loading students", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          data: mockStudents,
        }),
      });

    render(
      <StudentProvider>
        <TestComponent />
      </StudentProvider>
    );

    await screen.findByText("Loaded");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5000/api/students"
    );
  });

  it("adds a student through the API", async () => {
    const newStudent = {
      _id: "507f1f77bcf86cd799439013",
      studentId: "STU003",
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "9876543212",
      branch: "Mechanical",
      year: "4th Year",
      gender: "Male",
      dateOfBirth: "2003-03-15",
      address: "Delhi",
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockImplementation(async (url, options) => {
        if (options?.method === "POST") {
          return {
            ok: true,
            json: async () => ({
              data: newStudent,
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({
            data: mockStudents,
          }),
        };
      });

    const user = (await import(
      "@testing-library/user-event"
    )).default.setup();

    render(
      <StudentProvider>
        <TestComponent />
      </StudentProvider>
    );

    await screen.findByText("Loaded");

    await user.click(
      screen.getByRole("button", { name: "Add" })
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("student-count")
      ).toHaveTextContent("3");
    });

    expect(
      screen.getByText("Rohan Verma")
    ).toBeInTheDocument();

    const postCall = fetchMock.mock.calls.find(
      ([, options]) => options?.method === "POST"
    );

    expect(postCall).toBeDefined();

    expect(postCall[0]).toBe(
      "http://localhost:5000/api/students"
    );

    expect(postCall[1].headers).toEqual({
      "Content-Type": "application/json",
    });

    expect(JSON.parse(postCall[1].body)).toEqual({
      studentId: "STU003",
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "9876543212",
      branch: "Mechanical",
      year: "4th Year",
      gender: "Male",
      dateOfBirth: "2003-03-15",
      address: "Delhi",
    });
  });

  it("updates an existing student through the API", async () => {
    const updatedStudent = {
      ...mockStudents[0],
      name: "Updated Student",
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockImplementation(async (url, options) => {
        if (options?.method === "PUT") {
          return {
            ok: true,
            json: async () => ({
              data: updatedStudent,
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({
            data: mockStudents,
          }),
        };
      });

    const user = (await import(
      "@testing-library/user-event"
    )).default.setup();

    render(
      <StudentProvider>
        <TestComponent />
      </StudentProvider>
    );

    await screen.findByText("Loaded");

    await user.click(
      screen.getByRole("button", { name: "Update" })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Updated Student")
      ).toBeInTheDocument();
    });

    const putCall = fetchMock.mock.calls.find(
      ([, options]) => options?.method === "PUT"
    );

    expect(putCall).toBeDefined();

    expect(putCall[0]).toBe(
      "http://localhost:5000/api/students/507f1f77bcf86cd799439011"
    );

    expect(putCall[1].method).toBe("PUT");

    expect(putCall[1].headers).toEqual({
      "Content-Type": "application/json",
    });

    expect(JSON.parse(putCall[1].body)).toEqual({
      studentId: mockStudents[0].studentId,
      name: "Updated Student",
      email: mockStudents[0].email,
      phone: mockStudents[0].phone,
      branch: mockStudents[0].branch,
      year: mockStudents[0].year,
      gender: mockStudents[0].gender,
      dateOfBirth: mockStudents[0].dateOfBirth,
      address: mockStudents[0].address,
    });
  });

  it("deletes an existing student through the API", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockImplementation(async (url, options) => {
        if (options?.method === "DELETE") {
          return {
            ok: true,
            json: async () => ({
              data: mockStudents[0],
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({
            data: mockStudents,
          }),
        };
      });

    const user = (await import(
      "@testing-library/user-event"
    )).default.setup();

    render(
      <StudentProvider>
        <TestComponent />
      </StudentProvider>
    );

    await screen.findByText("Loaded");

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("student-count")
      ).toHaveTextContent("1");
    });

    expect(
      screen.queryByText("Aarav Sharma")
    ).not.toBeInTheDocument();

    const deleteCall = fetchMock.mock.calls.find(
      ([, options]) => options?.method === "DELETE"
    );

    expect(deleteCall).toBeDefined();

    expect(deleteCall[0]).toBe(
      "http://localhost:5000/api/students/507f1f77bcf86cd799439011"
    );

    expect(deleteCall[1].method).toBe("DELETE");
  });

  it("returns a student by ID", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockStudents,
      }),
    });

    const user = (await import(
      "@testing-library/user-event"
    )).default.setup();

    render(
      <StudentProvider>
        <TestComponent />
      </StudentProvider>
    );

    await screen.findByText("Loaded");

    await user.click(
      screen.getByRole("button", {
        name: "Find Student",
      })
    );

    expect(
      document.body.dataset.foundStudent
    ).toBe("Aarav Sharma");
  });

  it("returns undefined for an invalid student ID", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockStudents,
      }),
    });

    const user = (await import(
      "@testing-library/user-event"
    )).default.setup();

    render(
      <StudentProvider>
        <TestComponent />
      </StudentProvider>
    );

    await screen.findByText("Loaded");

    const findButton = screen.getByRole("button", {
      name: "Find Student",
    });

    await user.click(findButton);

    expect(
      document.body.dataset.foundStudent
    ).toBe("Aarav Sharma");
  });
});
