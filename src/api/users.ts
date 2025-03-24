const API_BASE_URL = "http://localhost:5000/api/users"; // Adjust if needed

export const getUserProfile = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/${userId}`, {
    method: "GET",
    credentials: "include", // To handle cookies if using sessions
  });

  return response.json();
};
