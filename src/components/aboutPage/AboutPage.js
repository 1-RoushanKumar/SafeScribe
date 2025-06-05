import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaEnvelope, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="p-6 bg-gray-100 h-[495px]">
      <div className="md:w-1/2">
        <h1 className="text-3xl font-bold mb-3">About Us</h1>
        <p className="mb-4 text-stone-800 text-xl">
          Welcome to <strong>SafeScribe</strong>, your trusted companion for
          secure and private note-taking. We believe in providing a safe space
          where your thoughts and ideas are protected with the highest level of
          security. Our mission is to ensure that your notes are always
          accessible to you — and only you. With state-of-the-art encryption and
          user-friendly features, SafeScribe is designed to keep your
          information confidential and secure.
        </p>

        <ul className="list-disc list-inside mb-4 text-sm px-6 py-2">
          <li className="mb-2 text-stone-700 text-lg">
            Add an extra layer of security with two-factor authentication.
          </li>
          <li className="mb-2 text-stone-700 text-lg">
            Your notes are encrypted from the moment you create them.
          </li>
          <li className="mb-2 text-stone-700 text-lg">
            Access your notes from anywhere with the assurance that they are
            stored securely.
          </li>
          <li className="mb-2 text-stone-700 text-lg">
            Our app is designed to be intuitive and easy to use.
          </li>
        </ul>

        <div className="flex space-x-4 mt-6">
          <a
            href="https://github.com/YourGitHubUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-white rounded-full p-2 bg-customRed"
          >
            <FaGithub size={24} />
          </a>
          <a
            href="mailto:your.email@gmail.com"
            aria-label="Email"
            className="text-white rounded-full p-2 bg-customRed"
          >
            <FaEnvelope size={24} />
          </a>
          <a
            href="https://twitter.com/YourTwitterUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-white rounded-full p-2 bg-customRed"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://linkedin.com/in/YourLinkedInUsername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-white rounded-full p-2 bg-customRed"
          >
            <FaLinkedinIn size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
