import { useContext } from "react";
import { StudentContext } from "./StudentContext.js";

export function useStudents() {
  return useContext(StudentContext);
}