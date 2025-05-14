import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import AllNotes from "./components/Notes/AllNotes";
import NoteDetails from "./components/Notes/NoteDetails";
import CreateNote from "./components/Notes/CreateNote";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import AccessDenied from "./components/Auth/AccessDenied";
import Admin from "./components/AuditLogs/Admin";
import UserProfile from "./components/Auth/UserProfile";
import ForgotPassword from "./components/Auth/ForgotPassword";
import OAuth2RedirectHandler from "./components/Auth/OAuth2RedirectHandler";
import { Toaster } from "react-hot-toast";
import NotFound from "./components/NotFound";
import ContactPage from "./components/contactPage/ContactPage";
import AboutPage from "./components/aboutPage/AboutPage";
import ResetPassword from "./components/Auth/ResetPassword";
import Footer from "./components/Footer/Footer";

// This is the main App component that sets up the routing for the application.
// It uses React Router to define different routes for the application.
const App = () => {
  return (
    // The Router component wraps the entire application to enable routing.
    // Routing means that the application can navigate between different pages without reloading the entire page.
    // The Routes component defines the different routes for the application.
    <Router>
      {/* The Navbar component is displayed at the top of the application. */}
      <Navbar />
      <Toaster position="bottom-center" reverseOrder={false} />
      {/* The Routes component defines the different routes for the application. */}
      {/* Each Route component defines a path and the component that should be rendered when that path is accessed. */}
      {/* The element prop specifies the component to render when the route matches. */}
      {/* You can see that these routes are not protected using the ProtectedRoute component. */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* The following routes are protected using the ProtectedRoute component. */}
        {/* This means that the user must be authenticated to access these routes. */}

        <Route
          path="/notes/:id"
          element={
            // The ProtectedRoute component checks if the user is authenticated before rendering the NoteDetails component.
            <ProtectedRoute>
              <NoteDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <AllNotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-note"
          element={
            <ProtectedRoute>
              <CreateNote />
            </ProtectedRoute>
          }
        />

        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminPage={true}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* The following route is used to handle any undefined routes. */}
        {/* If the user tries to access a route that is not defined, they will be redirected to the NotFound component. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
