
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load the backend .env file, falling back to the project-root .env.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const Student = require("../src/models/Student");

const sampleStudents = [
  {
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
    studentId: "STU002",
    name: "Ananya Patel",
    email: "ananya.patel@example.com",
    phone: "9876543211",
    branch: "Electronics",
    year: "2nd Year",
    gender: "Female",
    dateOfBirth: "2005-08-21",
    address: "Ahmedabad, Gujarat",
  },
  {
    studentId: "STU003",
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "9876543212",
    branch: "Mechanical",
    year: "4th Year",
    gender: "Male",
    dateOfBirth: "2003-02-15",
    address: "Delhi",
  },
  {
    studentId: "STU004",
    name: "Ishita Singh",
    email: "ishita.singh@example.com",
    phone: "9876543213",
    branch: "Computer Science",
    year: "1st Year",
    gender: "Female",
    dateOfBirth: "2006-11-03",
    address: "Lucknow, Uttar Pradesh",
  },
  {
    studentId: "STU005",
    name: "Kabir Mehta",
    email: "kabir.mehta@example.com",
    phone: "9876543214",
    branch: "Civil",
    year: "3rd Year",
    gender: "Male",
    dateOfBirth: "2004-07-19",
    address: "Jaipur, Rajasthan",
  },
];

async function importStudents() {
  const mongoUri =
    process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MongoDB URI not found. Check the environment variable used by your backend."
    );
  }

  let inserted = 0;
  let skipped = 0;

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    for (const student of sampleStudents) {
      // Check both unique fields to avoid duplicate-key errors.
      const existing = await Student.findOne({
        $or: [
          { studentId: student.studentId },
          { email: student.email },
        ],
      });

      if (existing) {
        console.log(`Skipped ${student.studentId}: already exists.`);
        skipped++;
        continue;
      }

      await Student.create(student);
      console.log(`Imported ${student.studentId}: ${student.name}`);
      inserted++;
    }

    console.log("\nImport finished.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped: ${skipped}`);
  } finally {
    await mongoose.disconnect();
  }
}

importStudents().catch((error) => {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
});
