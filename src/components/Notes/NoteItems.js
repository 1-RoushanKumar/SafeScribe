import { MdRemoveRedEye } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import { IconButton } from "@mui/material";
import { truncateText } from "../../utils/truncateText";
import { Link } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import moment from "moment";

const NoteItems = ({ parsedContent, id, createdAt }) => {
  const formattedDate = moment(createdAt).format("D MMMM YYYY");

  return (
    <div
      className="
        sm:px-4 px-2 py-5 
        shadow-lg shadow-slate-400 
        bg-noteColor 
        rounded-xl 
        min-h-96 max-h-96 
        relative overflow-hidden
        hover:scale-105 hover:shadow-xl 
        transition-transform duration-200
      "
    >
      <p
        className="text-black font-customWeight ql-editor"
        dangerouslySetInnerHTML={{ __html: truncateText(parsedContent) }}
      ></p>

      <div className="flex justify-between items-center absolute bottom-5 sm:px-5 px-2 left-0 w-full text-slate-700">
        <span>{formattedDate}</span>
        <Link to={`/notes/${id}`}>
          <Tooltip title="View Note">
            <IconButton>
              <MdRemoveRedEye className="text-slate-700 hover:text-blue-600 transition-colors duration-200" />
            </IconButton>
          </Tooltip>
        </Link>
      </div>
    </div>
  );
};

export default NoteItems;
