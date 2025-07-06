import React from "react";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaEnvelope,
  FaTwitter,
  FaLinkedinIn,
  FaHome,
} from "react-icons/fa"; // Imported FaHome icon

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        {/* Navigation Links */}
        <ul className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-lg font-medium">
          <li>
            {/* New Home Link */}
            <Link
              to="/"
              className="hover:text-blue-400 transition-colors duration-300 flex items-center gap-1"
            >
              <FaHome size={18} /> Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="hover:text-blue-400 transition-colors duration-300"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="hover:text-blue-400 transition-colors duration-300"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:text-blue-400 transition-colors duration-300"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="hover:text-blue-400 transition-colors duration-300"
            >
              Privacy Policy
            </Link>
          </li>
        </ul>

        {/* Copyright Information */}
        <p className="text-sm text-gray-400 text-center flex-shrink-0">
          <span>&copy; {currentYear} SafeScribe. All rights reserved.</span>
        </p>

        {/* Social Media Icons */}
        <div className="flex justify-center lg:justify-end gap-5">
          <a
            href="https://github.com/YourGitHubUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-gray-300 hover:text-white border-2 border-gray-600 hover:border-blue-500 rounded-full p-2 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
          >
            <FaGithub size={22} />
          </a>
          <a
            href="mailto:your.email@gmail.com"
            className="text-gray-300 hover:text-white border-2 border-gray-600 hover:border-blue-500 rounded-full p-2 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            aria-label="Email"
          >
            <FaEnvelope size={22} />
          </a>
          <a
            href="https://twitter.com/YourTwitterUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-gray-300 hover:text-white border-2 border-gray-600 hover:border-blue-500 rounded-full p-2 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
          >
            <FaTwitter size={22} />
          </a>
          <a
            href="https://linkedin.com/in/YourLinkedInUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-gray-300 hover:text-white border-2 border-gray-600 hover:border-blue-500 rounded-full p-2 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
          >
            <FaLinkedinIn size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
