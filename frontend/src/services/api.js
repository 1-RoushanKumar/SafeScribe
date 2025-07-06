import axios from "axios";

console.log("API URL:", process.env.REACT_APP_API_URL);

// Create an Axios instance
const api = axios.create({
  // base url which is common for all requests on backend
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  // Set default headers
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor to include JWT and CSRF tokens
// This interceptor will run before every request
api.interceptors.request.use(
  async (config) => {
    // Get the JWT token from local storage and set it in the headers
    // This token is used for authentication
    const token = localStorage.getItem("JWT_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get the CSRF token from local storage and set it in the headers
    let csrfToken = localStorage.getItem("CSRF_TOKEN");
    // If the CSRF token is not available, fetch it from the server
    if (!csrfToken) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/csrf-token`, //this is url we created in the backend to get csrf token
          { withCredentials: true }
        );
        // The CSRF token is returned in the response data
        // Set the CSRF token in the headers and local storage
        csrfToken = response.data.token;
        localStorage.setItem("CSRF_TOKEN", csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    }

    // Set the CSRF token in the headers
    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
    console.log("X-XSRF-TOKEN " + csrfToken);
    //return the config object to continue with the request
    // This config object contains all the headers and other information about the request
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Export the api instance to use it in other files
// This instance can be used to make API calls
export default api;


//you are wondering how this csrf token and jwt token are set in the local storage
// when you login to the application, the backend will send the jwt token and csrf token in the response headers.
// the code for this is written in file login.js.