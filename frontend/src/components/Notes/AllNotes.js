import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import NoteItems from "./NoteItems";
import { FiFilePlus } from "react-icons/fi"; // For the "Create New Note" button icon
import { MdOutlineNotes } from "react-icons/md"; // New icon for the main title
import { Blocks } from "react-loader-spinner"; // For the main loading spinner
import Errors from "../Errors";

const AllNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true); // Set to true initially as data is being fetched
  const [error, setError] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError(false); // Clear previous errors
    try {
      const response = await api.get("/notes");
      const parsedNotes = response.data.map((note) => ({
        ...note,
        // Safely parse content, assuming it's always a JSON string with a 'content' key
        parsedContent: JSON.parse(note.content).content || "",
      }));
      setNotes(parsedNotes);
    } catch (err) {
      console.error("Error fetching notes:", err);
      // More user-friendly error message
      setError(
        err.response?.data?.message ||
          "Failed to load notes. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section: Title and Create Note Button (when notes exist) */}
        {!loading && notes?.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4 border-gray-200">
            <h1 className="font-extrabold text-gray-900 text-3xl sm:text-4xl lg:text-5xl flex items-center gap-3 mb-4 sm:mb-0">
              <MdOutlineNotes className="text-blue-600 text-4xl sm:text-5xl" />
              My Notes
            </h1>
            <Link to="/create-note" className="flex-shrink-0">
              <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg font-medium">
                <FiFilePlus className="mr-2" size={20} />
                Create New Note
              </button>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-[500px] bg-white rounded-lg shadow-md">
            <Blocks
              height="80"
              width="80"
              color="#4F46E5" // A vibrant blue/indigo color
              ariaLabel="blocks-loading"
              visible={true}
            />
            <span className="text-gray-700 text-lg font-medium mt-4">
              Loading your notes...
            </span>
          </div>
        ) : (
          <>
            {/* Empty Notes State */}
            {notes?.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-lg shadow-md p-6 text-center">
                <MdOutlineNotes className="text-gray-400 text-8xl mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  No Notes Yet!
                </h2>
                <p className="text-gray-600 mb-8 text-lg max-w-md">
                  It looks like you haven't created any notes. Start organizing
                  your thoughts and ideas now!
                </p>
                <Link to="/create-note">
                  <button className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-xl font-semibold">
                    <FiFilePlus className="mr-3" size={28} />
                    Create Your First Note
                  </button>
                </Link>
              </div>
            ) : (
              // Display Notes Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                {notes.map((item) => (
                  <NoteItems key={item.id} {...item} id={item.id} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllNotes;
