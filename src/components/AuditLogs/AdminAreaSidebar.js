import React from "react";
import { FaArrowLeft, FaArrowRight, FaUser, FaEnvelope } from "react-icons/fa";
import { LiaBlogSolid } from "react-icons/lia";
import { Link, useLocation } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { useMyContext } from "../../store/ContextApi";

// This Sidebar component is used to display the sidebar in the admin area of the application.
// It contains links to different pages and handles the opening and closing of the sidebar.
const Sidebar = () => {
  // Access the openSidebar and setOpenSidebar function using the useMyContext hook from the ContextProvider
  const { openSidebar, setOpenSidebar } = useMyContext();

  //access the current path
  const pathName = useLocation().pathname;

  return (
    <div
      className={`fixed p-2 top-[74px] min-h-[calc(100vh-74px)] max-h-[calc(100vh-74px)] z-20 left-0 bg-gray-800 shadow-lg ${
        // Changed bg-headerColor to a more common bg-gray-800 for demonstration, added shadow
        openSidebar ? "w-52" : "w-16" // Slightly increased collapsed width for better icon visibility
      } transition-all duration-300 ease-in-out overflow-hidden`} // Smoother transition, added overflow-hidden
    >
      <div className="min-h-10 max-h-10 flex justify-end items-center mb-4">
        {" "}
        {/* Adjusted margin-bottom for spacing */}
        {openSidebar ? (
          <button
            className="flex w-full text-gray-300 justify-end items-center gap-2 pr-2 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200" // Refined text color, added hover background
            onClick={() => setOpenSidebar(!openSidebar)}
          >
            <span>
              <FaArrowLeft className="text-base" /> {/* Slightly larger icon */}
            </span>
            <span className="font-semibold text-sm">Collapse</span>{" "}
            {/* Changed text to Collapse, slightly smaller font */}
          </button>
        ) : (
          <Tooltip title="Expand Sidebar" placement="right">
            {" "}
            {/* Added placement for tooltip */}
            <button
              className="flex w-full text-gray-300 justify-center items-center gap-1 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200" // Refined text color, added hover background
              onClick={() => setOpenSidebar(!openSidebar)}
            >
              <span>
                <FaArrowRight className="text-xl" /> {/* Larger icon */}
              </span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* Sidebar links */}
      <div className="flex flex-col gap-2">
        {" "}
        {/* Reduced gap for more compact list */}
        {/* All Users Link */}
        <Tooltip
          title={`${openSidebar ? "Manage Users" : "Users"}`}
          placement="right"
        >
          <Link
            to="/admin/users"
            className={`flex text-gray-300 items-center ${
              openSidebar ? "pl-2" : "justify-center"
            } gap-3 ${
              // Added pl-2 for expanded state, justify-center for collapsed state
              pathName.startsWith("/admin/users")
                ? "bg-blue-600 text-white shadow-md" // Stronger active state background, white text, subtle shadow
                : "bg-transparent hover:bg-gray-700 hover:text-white" // Clearer hover state
            } min-h-10 max-h-10 py-2 rounded-md transition-all duration-200 ease-in-out`} // Smoother transition for active/hover states
          >
            <span className={`${openSidebar ? "w-6" : "w-full text-center"}`}>
              {" "}
              {/* Ensures icon positioning */}
              <FaUser className="text-lg" /> {/* Slightly larger icon */}
            </span>
            <span
              className={`whitespace-nowrap ${
                // Prevents text wrapping
                !openSidebar
                  ? "opacity-0 absolute left-full -translate-x-full"
                  : "opacity-100" // More robust opacity control
              } transition-all font-medium text-sm duration-300 ease-in-out`} // Smoother text transition, slightly smaller font, medium weight
            >
              All Users
            </span>
          </Link>
        </Tooltip>
        {/* Audit Logs Link */}
        <Tooltip
          title={`${openSidebar ? "View Audit Logs" : "Logs"}`}
          placement="right"
        >
          <Link
            to="/admin/audit-logs"
            className={`flex text-gray-300 items-center ${
              openSidebar ? "pl-2" : "justify-center"
            } gap-3 ${
              pathName.startsWith("/admin/audit-logs")
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent hover:bg-gray-700 hover:text-white"
            } min-h-10 max-h-10 py-2 rounded-md transition-all duration-200 ease-in-out`}
          >
            <span className={`${openSidebar ? "w-6" : "w-full text-center"}`}>
              <LiaBlogSolid className="text-xl" />
            </span>
            <span
              className={`whitespace-nowrap ${
                !openSidebar
                  ? "opacity-0 absolute left-full -translate-x-full"
                  : "opacity-100"
              } transition-all font-medium text-sm duration-300 ease-in-out`}
            >
              Audit Logs
            </span>
          </Link>
        </Tooltip>
        {/* Contact Messages Link */}
        <Tooltip
          title={`${openSidebar ? "View Contact Messages" : "Messages"}`}
          placement="right"
        >
          <Link
            to="/admin/contact-messages"
            className={`flex text-gray-300 items-center ${
              openSidebar ? "pl-2" : "justify-center"
            } gap-3 ${
              pathName.startsWith("/admin/contact-messages")
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent hover:bg-gray-700 hover:text-white"
            } min-h-10 max-h-10 py-2 rounded-md transition-all duration-200 ease-in-out`}
          >
            <span className={`${openSidebar ? "w-6" : "w-full text-center"}`}>
              <FaEnvelope className="text-lg" />
            </span>
            <span
              className={`whitespace-nowrap ${
                !openSidebar
                  ? "opacity-0 absolute left-full -translate-x-full"
                  : "opacity-100"
              } transition-all font-medium text-sm duration-300 ease-in-out`}
            >
              Messages
            </span>
          </Link>
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;
