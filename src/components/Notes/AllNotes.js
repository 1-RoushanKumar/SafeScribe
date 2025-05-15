import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import NoteItems from "./NoteItems"; // Importing the NoteItems component to display individual notes if you see when we click MyNotes comes for that user each note card is called NoteItems
import { FiFilePlus } from "react-icons/fi";
import { Blocks } from "react-loader-spinner";
import Errors from "../Errors";

//AllNotes component is used to display all the notes created by the user.
const AllNotes = () => {
  //here we define the state variables using useState hook
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  //fetchNotes function is used to fetch all the notes from the backend using axios
  const fetchNotes = async () => {
    setLoading(true);
    try {
      // Sending a GET request to the backend to fetch all notes
      // The response is stored in the response variable.
      const response = await api.get("/notes");

      // The response data is an array of notes.
      // We are mapping through the response data and parsing the content of each note.
      const parsedNotes = response.data.map((note) => ({
        ...note, // Spread all existing properties of the note object into the new object
        parsedContent: JSON.parse(note.content).content, // Add a new property 'parsedContent' extracted from the parsed JSON
        //We using note.content because in our backend we are using content as the key (you can see it in postman when we are creating a note)
        //Then you thinking why (note.content).content why two times content because in our backend we are using content as the key and in the frontend we are using content as the key so to avoid confusion we are using note.content
      }));

      // Setting the parsed notes to the notes state variable.
      setNotes(parsedNotes);
    } catch (error) {
      setError(error.response.data.message);
      console.error("Error fetching notes", error);
    } finally {
      setLoading(false);
    }
  };

  //useEffect hook is used to fetch all the notes when the component is mounted
  // The empty dependency array [] means that this effect will only run once when the component is mounted.
  useEffect(() => {
    //calling the function here to fetch all notes
    fetchNotes();
  }, []);

  //to show an errors
  if (error) {
    return <Errors message={error} />;
  }

  // The component returns a JSX element that renders the AllNotes page.
  return (
    <div className="min-h-[calc(100vh-74px)] sm:py-10 sm:px-5 px-0 py-4">
      <div className="w-[92%] mx-auto ">
        {/* The title of the page is displayed here. */
        /* If the loading state is false and there are notes, display the title. */}
        {!loading && notes && notes?.length > 0 && (
          <h1 className="font-montserrat  text-slate-800 sm:text-4xl text-2xl font-semibold ">
            My Notes
          </h1>
        )}
        {/* If the loading state is true, display a loading spinner. */}
        {/* The Blocks component is a loading spinner that is displayed while the notes are being fetched. */}
        {/* It is a part of the react-loader-spinner library. */}
        {loading ? (
          <div className="flex  flex-col justify-center items-center  h-72">
            <span>
              <Blocks
                height="70"
                width="70"
                color="#4fa94d"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                visible={true}
              />
            </span>
            <span>Please wait...</span>
          </div>
        ) : (
          <>
            {/* If there are no notes, display a message to the user. */}
            {/* The message encourages the user to create a new note. */}
            {/* The Link component is used to navigate to the CreateNote page when the button is clicked. */}
            {/* The button has an icon (FiFilePlus) and a label "Create New Note". */}
            {notes && notes?.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-96  p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    You didn't create any note yet
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Start by creating a new note to keep track of your thoughts.
                  </p>
                  <div className="w-full flex justify-center">
                    <Link to="/create-note">
                      <button className="flex items-center px-4 py-2 bg-btnColor text-white rounded  focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <FiFilePlus className="mr-2" size={24} />
                        Create New Note
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              // If there are notes, display them in a grid layout.
              // The grid layout is responsive and adjusts the number of columns based on the screen size.
              <>
                <div className="pt-10 grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-y-10 gap-x-5 justify-center">
                  {/* The notes are mapped to the NoteItems component, which displays each note. */}
                  {/* The NoteItems component is passed the note data as props. */}
                  {/* The key prop is used to uniquely identify each note in the list. */}
                  {/* The id prop is passed to the NoteItems component to identify the note. */}
                  {/* The parsedContent prop is passed to display the content of the note. */}
                  {/* The createdAt prop is passed to display the creation date of the note. */}
                  {notes.map((item) => (
                    <NoteItems key={item.id} {...item} id={item.id} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllNotes;
