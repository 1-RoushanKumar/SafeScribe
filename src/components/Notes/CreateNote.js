import React, { useState } from "react";
import ReactQuill from "react-quill"; // Importing ReactQuill for rich text editing
import "react-quill/dist/quill.snow.css"; // Importing the default styles for ReactQuill
import { MdNoteAlt } from "react-icons/md"; // Importing the note icon from react-icons
import { useNavigate } from "react-router-dom"; // Importing useNavigate from react-router-dom for navigation
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast"; // Importing the toast library for notifications

const CreateNote = () => {
  const navigate = useNavigate();
  //set the content of the reactquill
  // This state variable will hold the content of the note being created.
  const [editorContent, setEditorContent] = useState("");
  // This state variable will hold the loading state of the note creation process.
  const [loading, setLoading] = useState(false);

  // This function handles the change event of the ReactQuill editor.
  // It updates the editorContent state variable with the new content.
  const handleChange = (content, delta, source, editor) => {
    setEditorContent(content);
  };

  //this function handles the submission of the note.
  // It is called when the user clicks the "Create Note" button.
  const handleSubmit = async () => {
    if (editorContent.trim().length === 0) {
      return toast.error("Note content is required");
    }
    try {
      setLoading(true);
      // noteData is the data that we are going to send to the backend
      const noteData = { content: editorContent }; //here we taken {content: editorContent} because in our backend we are using content as the key (you can see it in postman when we are creating a note)
      // Sending a POST request to the backend ("/api/notes) to create a new note (here we don't need to add /api because we have already added it in the api.js using axios)
      await api.post("/notes", noteData);
      // If the request is successful, we show a success message and navigate to the notes page.
      toast.success("Note create successful");
      navigate("/notes"); //it will navigate to the notes page.
    } catch (err) {
      toast.error("Error creating note");
    } finally {
      setLoading(false);
    }
  };

  // The component returns a JSX element that renders the CreateNote page.
  return (
    <div className="min-h-[calc(100vh-74px)] p-10">
      <div className="flex items-center gap-1 pb-5">
        <h1 className="font-montserrat  text-slate-800 sm:text-4xl text-2xl font-semibold ">
          Create New Note
        </h1>
        {/* The MdNoteAlt icon is displayed next to the title. */}
        <MdNoteAlt className="text-slate-700 text-4xl" />
      </div>

      {/* This is handling the quill editor content */}
      <div className="h-72 sm:mb-20  lg:mb-14 mb-28 ">
        <ReactQuill
          className="h-full "
          value={editorContent}
          onChange={handleChange}
          //  The modules prop is used to customize the toolbar of the ReactQuill editor.
          // The toolbar includes options for formatting text, adding headers, and creating lists.
          modules={{
            toolbar: [
              [
                {
                  header: [1, 2, 3, 4, 5, 6],
                },
              ],
              [{ size: [] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              ["clean"],
            ],
          }}
        />
      </div>

      {/* The Create Note button is displayed below the editor. */}
      {/* When clicked, it calls the handleSubmit function to create the note. */}
      {/* The button is disabled when loading is true to prevent multiple submissions. */}
      <Buttons
        disabled={loading}
        onClickhandler={handleSubmit}
        className="bg-customRed  text-white px-4 py-2 hover:text-slate-300 rounded-sm"
      >
        {loading ? <span>Loading...</span> : " Create Note"}
      </Buttons>
    </div>
  );
};

export default CreateNote;
