import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import StudentDetails from "./pages/StudentDetails";

import { StudentProvider } from "./context/StudentContext.jsx";

function App() {
  return (
    <StudentProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/add" element={<AddStudent />} />
            <Route
              path="/students/:id/edit"
              element={<EditStudent />}
            />
            <Route
              path="/students/:id"
              element={<StudentDetails />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </StudentProvider>
  );
}

export default App;