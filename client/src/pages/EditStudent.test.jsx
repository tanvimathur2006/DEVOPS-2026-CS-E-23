import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EditStudent from "./EditStudent";

describe("Edit Student page", () => {
  it("renders the Edit Student heading", () => {
    render(<EditStudent />);

    expect(
      screen.getByRole("heading", { name: "Edit Student" })
    ).toBeInTheDocument();
  });

  it("renders the edit form placeholder message", () => {
    render(<EditStudent />);

    expect(
      screen.getByText("The edit form will appear here.")
    ).toBeInTheDocument();
  });
});