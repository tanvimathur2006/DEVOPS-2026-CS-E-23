const API_URL = "http://localhost:5000/api/students";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const getStudents = async () => {
  const response = await fetch(API_URL);
  return handleResponse(response);
};

export const getStudentById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  return handleResponse(response);
};

export const createStudent = async (student) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });

  return handleResponse(response);
};

export const updateStudent = async (id, student) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });

  return handleResponse(response);
};

export const deleteStudent = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};