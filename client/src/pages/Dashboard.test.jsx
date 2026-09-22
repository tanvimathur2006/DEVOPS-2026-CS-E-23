
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
  within,
} from "@testing-library/react";

import Dashboard from "./Dashboard";
import students from "../data/studentData";
import { StudentProvider } from "../context/StudentContext.jsx";

beforeEach(() => {
  vi.restoreAllMocks();

  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            count: students.length,
            data: students.map((student) => ({
              ...student,
              _id: String(student.id),
            })),
          }),
      })
    )
  );
});

const renderDashboard = () => {
  return render(
    <StudentProvider>
      <Dashboard />
    </StudentProvider>
  );
};

describe("Dashboard page", () => {
  it("renders the dashboard heading and overview", async () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", {
        name: "Dashboard",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Overview of student records."
      )
    ).toBeInTheDocument();

    await screen.findByText(
      String(students.length)
    );
  });

  it("displays the total number of students", async () => {
    renderDashboard();

    const totalStudentsText =
      await screen.findByText(
        String(students.length)
      );

    const totalStudentsCard =
      totalStudentsText.closest(".stat-card");

    expect(totalStudentsCard).toBeInTheDocument();

    expect(
      within(totalStudentsCard).getByRole(
        "heading",
        {
          level: 2,
          name: String(students.length),
        }
      )
    ).toBeInTheDocument();
  });

  it("displays the branch statistics", async () => {
    renderDashboard();

    const branchHeading =
      await screen.findByRole("heading", {
        name: "Students by Branch",
      });

    const branchSection =
      branchHeading.closest(".dashboard-card");

    expect(branchSection).toBeInTheDocument();

    const branchCounts = students.reduce(
      (counts, student) => {
        counts[student.branch] =
          (counts[student.branch] || 0) + 1;

        return counts;
      },
      {}
    );

    for (const [branch, count] of Object.entries(
      branchCounts
    )) {
      const branchItem = within(branchSection)
        .getByText(branch)
        .closest(".bar-item");

      expect(branchItem).toBeInTheDocument();

      expect(
        within(branchItem).getByText(
          String(count),
          {
            selector: "strong",
          }
        )
      ).toBeInTheDocument();
    }
  });

  it("displays the year statistics", async () => {
    renderDashboard();

    const yearHeading =
      await screen.findByRole("heading", {
        name: "Students by Year",
      });

    const yearSection =
      yearHeading.closest(".dashboard-card");

    expect(yearSection).toBeInTheDocument();

    const yearCounts = students.reduce(
      (counts, student) => {
        counts[student.year] =
          (counts[student.year] || 0) + 1;

        return counts;
      },
      {}
    );

    for (const [year, count] of Object.entries(
      yearCounts
    )) {
      const yearItem = within(yearSection)
        .getByText(year)
        .closest(".year-item");

      expect(yearItem).toBeInTheDocument();

      expect(
        within(yearItem).getByText(
          String(count),
          {
            selector: "strong",
          }
        )
      ).toBeInTheDocument();
    }
  });

  it("displays the recent students section", async () => {
    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: "Recent Students",
      })
    ).toBeInTheDocument();

    for (const student of students.slice(0, 5)) {
      expect(
        await screen.findByText(student.name)
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          new RegExp(student.studentId)
        )
      ).toBeInTheDocument();
    }
  });

  it("calculates the correct branch bar width", async () => {
    renderDashboard();

    const branchHeading =
      await screen.findByRole("heading", {
        name: "Students by Branch",
      });

    const branchSection =
      branchHeading.closest(".dashboard-card");

    const branchCounts = students.reduce(
      (counts, student) => {
        counts[student.branch] =
          (counts[student.branch] || 0) + 1;

        return counts;
      },
      {}
    );

    for (const [branch, count] of Object.entries(
      branchCounts
    )) {
      const branchItem = within(branchSection)
        .getByText(branch)
        .closest(".bar-item");

      const barFill =
        branchItem.querySelector(".bar-fill");

      const expectedWidth =
        `${(count / students.length) * 100}%`;

      expect(barFill).toHaveStyle({
        width: expectedWidth,
      });
    }
  });
});
