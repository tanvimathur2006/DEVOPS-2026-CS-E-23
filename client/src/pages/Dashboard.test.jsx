import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Dashboard from "./Dashboard";
import students from "../data/studentData";

describe("Dashboard page", () => {
  it("renders the dashboard heading and overview", () => {
    render(<Dashboard />);

    expect(
      screen.getByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Overview of student records.")
    ).toBeInTheDocument();
  });

  it("displays the total number of students", () => {
    render(<Dashboard />);

    const totalStudentsCard = screen
      .getByText("Total Students")
      .closest(".stat-card");

    expect(totalStudentsCard).toBeInTheDocument();

    expect(
      within(totalStudentsCard).getByRole("heading", {
        level: 2,
        name: String(students.length),
      })
    ).toBeInTheDocument();
  });

  it("displays the branch statistics", () => {
    render(<Dashboard />);

    const branchSection = screen
      .getByRole("heading", { name: "Students by Branch" })
      .closest(".dashboard-card");

    const branchCounts = students.reduce((counts, student) => {
      counts[student.branch] = (counts[student.branch] || 0) + 1;
      return counts;
    }, {});

    Object.entries(branchCounts).forEach(([branch, count]) => {
      const branchItem = within(branchSection)
        .getByText(branch)
        .closest(".bar-item");

      expect(branchItem).toBeInTheDocument();

      expect(
        within(branchItem).getByText(String(count), {
          selector: "strong",
        })
      ).toBeInTheDocument();
    });
  });

  it("displays the year statistics", () => {
    render(<Dashboard />);

    const yearSection = screen
      .getByRole("heading", { name: "Students by Year" })
      .closest(".dashboard-card");

    const yearCounts = students.reduce((counts, student) => {
      counts[student.year] = (counts[student.year] || 0) + 1;
      return counts;
    }, {});

    Object.entries(yearCounts).forEach(([year, count]) => {
      const yearItem = within(yearSection)
        .getByText(year)
        .closest(".year-item");

      expect(yearItem).toBeInTheDocument();

      expect(
        within(yearItem).getByText(String(count), {
          selector: "strong",
        })
      ).toBeInTheDocument();
    });
  });

  it("displays the recent students section", () => {
    render(<Dashboard />);

    expect(
      screen.getByRole("heading", { name: "Recent Students" })
    ).toBeInTheDocument();

    students.slice(0, 5).forEach((student) => {
      expect(screen.getByText(student.name)).toBeInTheDocument();

      expect(
        screen.getByText(new RegExp(student.studentId))
      ).toBeInTheDocument();
    });
  });

  it("calculates the correct branch bar width", () => {
    render(<Dashboard />);

    const branchSection = screen
      .getByRole("heading", { name: "Students by Branch" })
      .closest(".dashboard-card");

    const branchCounts = students.reduce((counts, student) => {
      counts[student.branch] = (counts[student.branch] || 0) + 1;
      return counts;
    }, {});

    Object.entries(branchCounts).forEach(([branch, count]) => {
      const branchItem = within(branchSection)
        .getByText(branch)
        .closest(".bar-item");

      const barFill = branchItem.querySelector(".bar-fill");

      const expectedWidth = `${(count / students.length) * 100}%`;

      expect(barFill).toHaveStyle({
        width: expectedWidth,
      });
    });
  });
});