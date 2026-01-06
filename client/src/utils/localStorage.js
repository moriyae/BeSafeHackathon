const STORAGE_KEY = "currentUser";

// Helper function to get current user data from local storage
export function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEY);
  if (!user) {
    return null;
  }

  try{
    return JSON.parse(user);
  } catch{ 
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// Helper function to save user data to local storage
export function saveUser(user) {
    const userString = JSON.stringify(user);
    localStorage.setItem("currentUser", userString);
}

// Helper function to remove user data from local storage
export function logout(){
    localStorage.removeItem("currentUser");
}