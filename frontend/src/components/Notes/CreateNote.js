import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { MdNoteAdd } from "react-icons/md"; // Changed to MdNoteAdd for a more "create" feel
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners"; // Import a better spinner

const CreateNote = () => {
  const navigate = useNavigate();
  const [editorContent, setEditorContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (content, delta, source, editor) => {
    setEditorContent(content);
  };

  const handleSubmit = async () => {
    // Check if the content is truly empty, ignoring HTML tags
    const plainTextContent = editorContent.replace(/<[^>]*>/g, "").trim();
    if (plainTextContent.length === 0) {
      return toast.error("Note content cannot be empty.");
    }

    setLoading(true);
    try {
      const noteData = { content: editorContent };
      await api.post("/notes", noteData);
      toast.success("Note created successfully!");
      navigate("/notes");
    } catch (err) {
      toast.error("Failed to create note. Please try again.");
      console.error("Error creating note:", err); // Log error for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 sm:p-10 lg:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10">
        {/* Heading Section */}
        <div className="flex items-center gap-3 pb-6 border-b border-gray-200 mb-8">
          <MdNoteAdd className="text-blue-600 text-5xl" />{" "}
          {/* Larger, more vibrant icon */}
          <h1 className="font-sans text-gray-900 text-3xl sm:text-4xl font-extrabold leading-tight">
            Create New Note
          </h1>
        </div>

        {/* ReactQuill Editor Section */}
        <div className="mb-12 h-[300px] sm:h-[350px] lg:h-[400px]">
          {" "}
          {/* Increased height for more editing space */}
          <ReactQuill
            className="h-[calc(100%-42px)] border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200" // Added rounded corners, subtle border, and focus styles
            theme="snow" // Use the default snow theme
            value={editorContent}
            onChange={handleChange}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }], // Added false for no header
                [{ size: ["small", false, "large", "huge"] }], // Added custom sizes
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                  { list: "ordered" },
                  { list: "bullet" },
                  { indent: "-1" },
                  { indent: "+1" },
                ],
                ["link", "image"], // Added link and image options
                [{ color: [] }, { background: [] }], // Added color and background options
                [{ align: [] }], // Added text alignment
                ["clean"],
              ],
            }}
          />
        </div>

        {/* Create Note Button */}
        <div className="flex justify-end pt-4">
          {" "}
          {/* Aligned button to the right */}
          <Buttons
            disabled={loading}
            onClickhandler={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-lg flex items-center justify-center gap-2" // Enhanced button styles
          >
            {loading ? (
              <>
                <ClipLoader color="#fff" size={20} /> {/* Integrated spinner */}
                <span>Creating...</span>
              </>
            ) : (
              "Create Note"
            )}
          </Buttons>
        </div>
      </div>
    </div>
  );
};

export default CreateNote;
