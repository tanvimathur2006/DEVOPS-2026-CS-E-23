const express = require("express");

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

// Capture the mounted route template before async controllers or error
// handling unwind Express's router stack and clear req.baseUrl / req.route.
router.use((req, res, next) => {
  const isCollectionRoute = req.path === "/" || req.path === "";
  const isIdRoute = /^\/[^/]+\/?$/.test(req.path);

  if (req.method === "GET" && isCollectionRoute) {
    req.metricsRoute = "/api/students/";
  } else if (req.method === "POST" && isCollectionRoute) {
    req.metricsRoute = "/api/students/";
  } else if (isIdRoute && ["GET", "PUT", "DELETE"].includes(req.method)) {
    req.metricsRoute = "/api/students/:id";
  }

  next();
});

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
