import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StudentDetails from "./StudentDetails";

describe("Student Details page", () => {
  it("renders the Student Details heading", () => {
    render(<StudentDetails />);

    expect(
      screen.getByRole("heading", { name: "Student Details" })
    ).toBeInTheDocument();
  });

  it("renders the student information message", () => {
    render(<StudentDetails />);

    expect(
      screen.getByText("Student information will appear here.")
    ).toBeInTheDocument();
  });
});