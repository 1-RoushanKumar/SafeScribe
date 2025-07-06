import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useMyContext } from "../../store/ContextApi";


/* The OAuth2RedirectHandler component is responsible for handling the redirect from the OAuth2 provider. */
/* It extracts the token from the URL, decodes it, and stores it in local storage. */
const OAuth2RedirectHandler = () => {
  /* The useNavigate hook is used to programmatically navigate to different routes in the application. */
  const navigate = useNavigate();
  const location = useLocation();
  // useMyContext is a custom hook that provides access to the context API.which we created in the ContextApi.js file.
  const { setToken, setIsAdmin } = useMyContext();

  // The useEffect hook is used to perform side effects in functional components.
  useEffect(() => {
    // The URLSearchParams interface provides utility methods to work with the query string of a URL.
    const params = new URLSearchParams(location.search);
    //Here we are getting the token from the URL.
    const token = params.get("token");
    console.log("OAuth2RedirectHandler: Params:", params.toString());
    console.log("OAuth2RedirectHandler: Token:", token);

    // If the token is present in the URL, decode it and store it in local storage.
    if (token) {
      try {
        // Decode the JWT token to extract user information
        // The jwtDecode function is used to decode the JWT token and extract the payload.
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        // Store the token in local storage
        localStorage.setItem("JWT_TOKEN", token);

        // Create a user object from the decoded token
        // The user object contains the username and roles of the user.
        const user = {
          username: decodedToken.sub, //because we setting username as subject in the backend where we create the token in JwtUtil.java file
          roles: decodedToken.roles.split(","),
        };
        console.log("User Object:", user);
        localStorage.setItem("USER", JSON.stringify(user));

        // Update context state
        setToken(token);
        setIsAdmin(user.roles.includes("ADMIN"));

        // Delay navigation to ensure local storage operations complete
        setTimeout(() => {
          console.log("Navigating to /notes");
          navigate("/notes");
        }, 100); // 100ms delay
      } catch (error) {
        console.error("Token decoding failed:", error);
        navigate("/login");
      }
    } else {
      console.log("Token not found in URL, redirecting to login");
      navigate("/login");
    }
  }, [location, navigate, setToken, setIsAdmin]);

  return <div>Redirecting...</div>;
};

export default OAuth2RedirectHandler;
