import { MdRemoveRedEye } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip"; //
import { IconButton } from "@mui/material";
import { truncateText } from "../../utils/truncateText"; // Importing the truncateText function from utils
import { Link } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import moment from "moment"; // Importing moment.js for date formatting

//The is the NoteItems component that displays individual notes.
// It takes parsedContent, id, and createdAt as props.
const NoteItems = ({ parsedContent, id, createdAt }) => {
  // The parsedContent is the content of the note that will be displayed.
  const formattedDate = moment(createdAt).format("D MMMM YYYY");
  return (
    <div className="sm:px-5 px-2 py-5 shadow-md bg-noteColor shadow-white rounded-lg min-h-96 max-h-96 relative overflow-hidden ">
      {/* The parsedContent is displayed as HTML using dangerouslySetInnerHTML. */}
      {/*The truncateText function is used to limit the length of the content displayed. */}
      {/* The text is styled using Tailwind CSS classes. */}
      <p
        className="text-black font-customWeight ql-editor"
        // The dangerouslySetInnerHTML attribute is used to set the inner HTML of the element.
        // It is used to display the parsedContent as HTML.
        // The __html property is used to set the HTML content.
        dangerouslySetInnerHTML={{ __html: truncateText(parsedContent) }}
      ></p>
      <div className="flex justify-between items-center  absolute bottom-5 sm:px-5 px-2 left-0 w-full text-slate-700">
        <span>{formattedDate}</span>
        <Link to={`/notes/${id}`}>
          {" "}
          <Tooltip title="View Note">
            <IconButton>
              <MdRemoveRedEye className="text-slate-700" />
            </IconButton>
          </Tooltip>
        </Link>
      </div>
    </div>
  );
};

export default NoteItems;
