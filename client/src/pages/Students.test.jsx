import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Students from "./Students";
import students from "../data/studentData";

describe("Students page", () => {
  it("renders the Students heading", () => {
    render(
      <MemoryRouter>
        <Students />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Students" })
    ).toBeInTheDocument();
  });

  it("renders the student table", () => {
    render(
      <MemoryRouter>
        <Students />
      </MemoryRouter>
    );

    expect(screen.getByRole("columnheader", { name: "Student ID" }))
      .toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "Name" }))
      .toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "Email" }))
      .toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "Branch" }))
      .toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "Year" }))
      .toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "Actions" }))
      .toBeInTheDocument();
  });

  it("renders all students from the student data", () => {
    render(
      <MemoryRouter>
        <Students />
      </MemoryRouter>
    );

    students.forEach((student) => {
      expect(screen.getByText(student.name)).toBeInTheDocument();
      expect(screen.getByText(student.email)).toBeInTheDocument();
    });
  });

  it("renders View and Edit links for students", () => {
    render(
      <MemoryRouter>
        <Students />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("link", { name: "View" }).length)
      .toBe(students.length);

    expect(screen.getAllByRole("link", { name: "Edit" }).length)
      .toBe(students.length);
  });
});