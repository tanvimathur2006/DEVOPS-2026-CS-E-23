# Student Management System

A web-based Student Management System built with React and Vite. The application provides a simple interface for managing student records, viewing student information, monitoring dashboard statistics, and generating student reports.

## Features

- Dashboard with student statistics and visualizations
- Student list and navigation
- Add new student records
- Edit existing student records
- Delete student records
- View detailed student information
- Student CRUD functionality
- Automatic student report generation
- PDF report generation
- Automated frontend testing with Vitest
- Continuous Integration with Jenkins

## Technology Stack

- **Frontend:** React
- **Build Tool:** Vite
- **Language:** JavaScript
- **Testing:** Vitest
- **CI:** Jenkins
- **Report Generation:** Python and ReportLab

## Project Structure

```text
student-management-system/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── generate_report.py
├── Jenkinsfile
└── README.md
```

> The exact folder contents may vary as the project evolves.

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python 3 (required for report generation)
- Git

### Installation

Clone the repository and move into the frontend directory:

```bash
git clone <repository-url>
cd student-management-system/client
```

Install the frontend dependencies:

```bash
npm install
```

## Running the Application

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Testing

Run the automated test suite:

```bash
npm test
```

The project uses Vitest for testing React components and application functionality.

## Production Build

Create a production build with:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Student Management

The application supports the complete student management flow:

1. Open the Students section.
2. View the existing student records.
3. Add a new student.
4. Open a student's details.
5. Edit student information when required.
6. Delete a student record when required.
7. Generate a report for the required student.

## Report Generation

The project includes automatic report generation using Python and ReportLab.

The report functionality is intended to produce a formatted student report containing the available student information and performance data.

## Continuous Integration

The project uses Jenkins for automated CI.

The Jenkins pipeline is used to:

1. Check out the project source code.
2. Install frontend dependencies.
3. Run the automated tests.
4. Detect build or test failures early.

Changes pushed to the configured branches can trigger the Jenkins pipeline through the project's CI/webhook configuration.

## Development Workflow

A typical development workflow is:

```text
Create/modify feature
        ↓
Run tests locally
        ↓
Run production build
        ↓
Commit changes
        ↓
Push branch
        ↓
Jenkins CI
        ↓
Review / Merge
```

## Testing Status

The frontend test suite currently includes tests covering areas such as:

- Students page
- Student details
- Add student
- Edit student
- Dashboard statistics
- CRUD functionality

## Contributors

This project was developed as a team project. Contributions include frontend development, student management functionality, automated testing, report generation, and CI/Jenkins integration.

## License

This project is developed for academic purposes.
