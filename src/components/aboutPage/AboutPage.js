import React from "react";
import {
  FaGithub,
  FaEnvelope,
  FaTwitter,
  FaLinkedinIn,
  FaLock,
  FaShieldAlt,
  FaCloud,
  FaHandPointRight,
} from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";

const AboutPage = () => {
  return (
    <div className="min-h-[calc(100vh-74px)] bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-xl p-8 sm:p-10 lg:p-12 transform hover:shadow-2xl transition-all duration-300">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <MdOutlineSecurity className="text-blue-600 text-5xl sm:text-6xl" />
          About SafeScribe
        </h1>
        <p className="mb-8 text-gray-700 text-lg sm:text-xl leading-relaxed">
          Welcome to{" "}
          <strong className="text-blue-600 font-bold">SafeScribe</strong>, your
          trusted companion for secure and private note-taking. We believe in
          providing a safe space where your thoughts and ideas are protected
          with the highest level of security. Our mission is to ensure that your
          notes are always accessible to you — and only you. With
          state-of-the-art encryption and user-friendly features, SafeScribe is
          designed to keep your information confidential and secure.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Our Core Principles:
        </h2>
        <ul className="space-y-3 mb-8">
          <li className="flex items-start text-gray-700 text-lg">
            <FaShieldAlt className="text-blue-500 text-2xl mt-1 mr-3 flex-shrink-0" />
            <p>
              <strong>Enhanced Security:</strong> Add an extra layer of
              protection with features like two-factor authentication.
            </p>
          </li>
          <li className="flex items-start text-gray-700 text-lg">
            <FaLock className="text-blue-500 text-2xl mt-1 mr-3 flex-shrink-0" />
            <p>
              <strong>End-to-End Encryption:</strong> Your notes are encrypted
              from the moment you create them, ensuring privacy.
            </p>
          </li>
          <li className="flex items-start text-gray-700 text-lg">
            <FaCloud className="text-blue-500 text-2xl mt-1 mr-3 flex-shrink-0" />
            <p>
              <strong>Secure Accessibility:</strong> Access your notes from
              anywhere with the assurance that they are stored securely.
            </p>
          </li>
          <li className="flex items-start text-gray-700 text-lg">
            <FaHandPointRight className="text-blue-500 text-2xl mt-1 mr-3 flex-shrink-0" />
            <p>
              <strong>Intuitive Design:</strong> Our app is designed to be
              intuitive and easy to use, focusing on a seamless user experience.
            </p>
          </li>
        </ul>
        <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4 sm:gap-6">
          <a
            href="https://github.com/YourGitHubUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110 flex items-center justify-center p-3 rounded-full bg-gray-100 hover:bg-blue-100 shadow-sm"
          >
            <FaGithub size={28} />
          </a>
          <a
            href="mailto:your.email@gmail.com"
            aria-label="Email"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110 flex items-center justify-center p-3 rounded-full bg-gray-100 hover:bg-blue-100 shadow-sm"
          >
            <FaEnvelope size={28} />
          </a>
          <a
            href="https://twitter.com/YourTwitterUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110 flex items-center justify-center p-3 rounded-full bg-gray-100 hover:bg-blue-100 shadow-sm"
          >
            <FaTwitter size={28} />
          </a>
          <a
            href="https://linkedin.com/in/YourLinkedInUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110 flex items-center justify-center p-3 rounded-full bg-gray-100 hover:bg-blue-100 shadow-sm"
          >
            <FaLinkedinIn size={28} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
