import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Adjust the import path as necessary

//This component for the contact page where users can send messages to the admin
// It includes a form with fields for name, email, and message.
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const isLoggedIn = !!localStorage.getItem("JWT_TOKEN");

  // Prefill name and email if user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      const storedUser = localStorage.getItem("USER");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setFormData((prev) => ({
            ...prev,
            name: user.username || "",
            email: user.email || "",
          }));
        } catch (e) {
          console.error("Failed to parse user info from localStorage", e);
        }
      }
    }
  }, [isLoggedIn]);

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/contact", formData);
      setSubmitted(true);
      setFormData((prev) => ({
        ...prev,
        message: "", // Keep name and email, clear message
      }));
    } catch (err) {
      setError("Failed to submit form. Please try again.");
      console.error("Error submitting contact form:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-74px)] bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Contact Us</h1>
        <p className="text-gray-600 mb-6">
          We'd love to hear from you! If you have any questions or feedback,
          feel free to reach out to us.
        </p>

        {submitted && (
          <p className="text-green-600 font-medium mb-4">
            Thank you for your message! 🎉
          </p>
        )}

        {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

        <form onSubmit={onSubmitHandler} className="space-y-5">
          <div>
            <label
              className="block text-left text-gray-700 mb-2 font-medium"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onChangeHandler}
              required
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label
              className="block text-left text-gray-700 mb-2 font-medium"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChangeHandler}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label
              className="block text-left text-gray-700 mb-2 font-medium"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={onChangeHandler}
              required
              placeholder="Write your message..."
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200 transform hover:scale-105"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
