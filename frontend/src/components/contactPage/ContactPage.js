import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  FiUser,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!localStorage.getItem("JWT_TOKEN");

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
    setSubmitted(false);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/contact", formData);
      setSubmitted(true);
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));
    } catch (err) {
      setError("Failed to submit your message. Please try again.");
      console.error("Error submitting contact form:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-74px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-2xl w-full text-center border border-gray-100 transform hover:shadow-2xl transition-all duration-300">
        {" "}
        {/* Increased max-w-lg to max-w-2xl */}
        <h1 className="text-4xl font-extrabold mb-3 text-gray-900 leading-tight">
          Contact Us
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          We'd love to hear from you! Send us a message, and we'll get back to
          you as soon as possible.
        </p>
        {submitted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-center text-left">
            <FiCheckCircle className="text-xl mr-3" />
            <span className="font-semibold">
              Thank you for your message!
            </span>{" "}
            We've received it and will be in touch shortly.
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-center text-left">
            <FiXCircle className="text-xl mr-3" />
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div>
            <label
              className="block text-left text-gray-700 mb-2 font-semibold text-base"
              htmlFor="name"
            >
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onChangeHandler}
                required
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              />
              <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>
          </div>
          <div>
            <label
              className="block text-left text-gray-700 mb-2 font-semibold text-base"
              htmlFor="email"
            >
              Your Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChangeHandler}
                required
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              />
              <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>
          </div>
          <div>
            <label
              className="block text-left text-gray-700 mb-2 font-semibold text-base"
              htmlFor="message"
            >
              Your Message
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={onChangeHandler}
                required
                placeholder="Write your message here..."
                rows="5"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-y"
              ></textarea>
              <FiMessageSquare className="absolute left-4 top-4 text-gray-400 text-lg" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ClipLoader color="#fff" size={20} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FiSend size={20} /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
