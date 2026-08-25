import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AddStudent from "./AddStudent";

describe("Add Student page", () => {
  it("renders the Add Student heading", () => {
    render(<AddStudent />);

    expect(
      screen.getByRole("heading", { name: "Add Student" })
    ).toBeInTheDocument();
  });

  it("renders the student form placeholder message", () => {
    render(<AddStudent />);

    expect(
      screen.getByText("The student form will appear here.")
    ).toBeInTheDocument();
  });
});