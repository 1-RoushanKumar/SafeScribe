import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Blocks } from "react-loader-spinner";
import toast from "react-hot-toast";
import { auditLogsTruncateTexts } from "../../utils/truncateText.js"; // Ensure this path is correct
import Errors from "../Errors.js"; // Assuming this component is styled well
import moment from "moment";
import { MdDateRange, MdVisibility } from "react-icons/md"; // Added MdVisibility icon

// First, define the columns for the DataGrid table
export const auditLogcolumns = [
  {
    field: "actions",
    headerName: "Action",
    minWidth: 160,
    flex: 0.8, // Make column flexible
    headerAlign: "left", // Align header to left
    align: "left", // Align content to left
    editable: false,
    disableColumnMenu: true,
    renderHeader: () => (
      <span className="font-semibold text-gray-700 text-base">Action</span>
    ),
    renderCell: (params) => (
      <div className="font-medium text-gray-800">{params?.value}</div>
    ),
  },
  {
    field: "username",
    headerName: "User Name",
    minWidth: 180,
    flex: 1, // Make column flexible
    editable: false,
    disableColumnMenu: true,
    headerAlign: "left",
    align: "left",
    renderHeader: () => (
      <span className="font-semibold text-gray-700 text-base">User Name</span>
    ),
    renderCell: (params) => (
      <div className="font-medium text-gray-800">{params?.value}</div>
    ),
  },
  {
    field: "timestamp",
    headerName: "Time Stamp",
    disableColumnMenu: true,
    minWidth: 220,
    flex: 1.2, // Give more space
    editable: false,
    headerAlign: "center",
    align: "center",
    renderHeader: () => (
      <span className="font-semibold text-gray-700 text-base">Time Stamp</span>
    ),
    renderCell: (params) => {
      return (
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <MdDateRange className="text-lg text-purple-500" />{" "}
          {/* Styled icon */}
          <span className="text-sm">{params?.value}</span>
        </div>
      );
    },
  },
  {
    field: "noteid",
    headerName: "Note ID",
    disableColumnMenu: true,
    minWidth: 150,
    flex: 0.7, // Smaller column
    editable: false,
    headerAlign: "center",
    align: "center",
    renderHeader: () => (
      <span className="font-semibold text-gray-700 text-base">Note ID</span>
    ),
    renderCell: (params) => (
      <div className="font-medium text-gray-800">{params?.value}</div>
    ),
  },
  {
    field: "note",
    headerName: "Note Content",
    minWidth: 280, // Increased width for content
    flex: 1.5, // More flexible for content
    editable: false,
    headerAlign: "left", // Align content header to left
    disableColumnMenu: true,
    align: "left", // Align cell content to left
    renderHeader: () => (
      <span className="font-semibold text-gray-700 text-base">
        Note Content
      </span>
    ),
    renderCell: (params) => {
      let content = "";
      try {
        // Safely parse JSON
        const parsedContent = JSON.parse(params?.value);
        content = parsedContent?.content || "";
      } catch (e) {
        content = params?.value || ""; // Fallback if not valid JSON
      }
      const truncatedResponse = auditLogsTruncateTexts(content);

      return (
        <p className="text-gray-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
          {truncatedResponse}
        </p>
      );
    },
  },
  {
    field: "action",
    headerName: "Details", // Changed header to 'Details'
    minWidth: 120,
    flex: 0.6, // Smaller column
    editable: false,
    headerAlign: "center",
    align: "center",
    sortable: false,
    disableColumnMenu: true,
    renderHeader: () => (
      <span className="font-semibold text-gray-700 text-base">Details</span>
    ),
    renderCell: (params) => {
      return (
        <Link
          to={`/admin/audit-logs/${params.row.noteId}`}
          className="w-full h-full flex justify-center items-center"
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-1 text-sm transition-colors duration-200 ease-in-out">
            <MdVisibility className="text-lg" /> {/* Added icon */}
            <span>View</span>
          </button>
        </Link>
      );
    },
  },
];

// Main component for displaying all audit logs
const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Set to true initially

  // Function to fetch audit logs from the server
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/audit");
      setAuditLogs(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch audit logs.");
      toast.error("Error fetching audit logs.");
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch audit logs when the component mounts
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Map audit log data to rows for the DataGrid table
  const rows = auditLogs.map((item) => {
    // Format timestamp using moment.js
    const formattedDate = moment(item.timestamp).format(
      "MMMM DD, YYYY, hh:mm:ss A"
    ); // Added seconds for precision

    return {
      id: item.id, // Unique ID for each row
      noteId: item.noteId,
      actions: item.action,
      username: item.username,
      timestamp: formattedDate,
      noteid: item.noteId, // Keeping both noteId and noteid for flexibility, though one might suffice
      note: item.noteContent,
    };
  });

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-74px)]">
      {" "}
      {/* Page background and min-height */}
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* Centering and max-width for content */}
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 mt-4">
          System Audit Logs
        </h1>
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px]">
            <Blocks
              height="80"
              width="80"
              color="#4F46E5" // Updated spinner color
              ariaLabel="loading-blocks"
              wrapperClass="blocks-wrapper"
              visible={true}
            />
            <span className="text-gray-700 text-lg font-medium mt-4">
              Loading audit logs...
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden p-6">
            {" "}
            {/* Card-like styling for DataGrid */}
            {rows.length === 0 ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md shadow-sm max-w-lg mx-auto">
                <p className="font-semibold text-center">
                  No audit logs available.
                </p>
                <p className="text-sm text-center">
                  There are no recorded actions in the system yet.
                </p>
              </div>
            ) : (
              <div style={{ height: 500, width: "100%" }}>
                {" "}
                {/* DataGrid requires explicit height */}
                <DataGrid
                  rows={rows}
                  columns={auditLogcolumns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10, // Increased default page size
                      },
                    },
                  }}
                  disableRowSelectionOnClick
                  pageSizeOptions={[5, 10, 20]} // More pagination options
                  disableColumnResize
                  // Custom styling for DataGrid elements using MUI's sx prop
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#F3F4F6", // Light gray background for headers
                      color: "#1F2937", // Darker text for headers
                      fontWeight: "bold",
                      fontSize: "1rem",
                      borderBottom: "2px solid #E5E7EB", // Subtle border below headers
                    },
                    "& .MuiDataGrid-cell": {
                      borderColor: "#E5E7EB", // Lighter border for cells
                      padding: "12px 16px", // More padding
                    },
                    "& .MuiDataGrid-row:nth-of-type(odd)": {
                      backgroundColor: "#F9FAFB", // Zebra striping for rows
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: "#EFF6FF", // Light blue on row hover
                      cursor: "pointer",
                    },
                    border: "none", // Remove outer border of DataGrid
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
