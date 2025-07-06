import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { DataGrid } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import { Blocks } from "react-loader-spinner";
import Errors from "../Errors.js"; // Assuming this component is styled well
import moment from "moment";
import { Link } from "react-router-dom";
import { MdOutlineEmail, MdDateRange, MdVisibility } from "react-icons/md"; // Added MdVisibility for the action button

// DataGrid columns for the user list table
export const userListsColumns = [
  {
    field: "username",
    headerName: "User Name",
    minWidth: 200,
    flex: 1, // Allows column to grow/shrink
    headerAlign: "left", // Align header text to left
    align: "left", // Align cell content to left
    editable: false,
    disableColumnMenu: true,
    renderHeader: (params) => (
      <span className="font-semibold text-gray-700 text-base">User Name</span>
    ),
    renderCell: (params) => (
      <div className="font-medium text-gray-800">{params?.value}</div>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 250,
    flex: 1.2, // Slightly more flexible than username
    editable: false,
    headerAlign: "left",
    align: "left",
    disableColumnMenu: true,
    renderHeader: (params) => (
      <span className="font-semibold text-gray-700 text-base">Email</span>
    ),
    renderCell: (params) => {
      return (
        <div className="flex items-center gap-2 text-gray-700">
          <MdOutlineEmail className="text-lg text-blue-500" />{" "}
          {/* Styled icon */}
          <span>{params?.value}</span>
        </div>
      );
    },
  },
  {
    field: "created",
    headerName: "Created At",
    minWidth: 200,
    flex: 1,
    headerAlign: "center",
    align: "center",
    editable: false,
    disableColumnMenu: true,
    renderHeader: (params) => (
      <span className="font-semibold text-gray-700 text-base">Created At</span>
    ),
    renderCell: (params) => {
      return (
        <div className="flex justify-center items-center gap-2 text-gray-600">
          <MdDateRange className="text-lg text-purple-500" />{" "}
          {/* Styled icon */}
          <span className="text-sm">{params?.value}</span>
        </div>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 120,
    flex: 0.7, // Smaller column
    headerAlign: "center",
    align: "center",
    editable: false,
    disableColumnMenu: true,
    renderHeader: (params) => (
      <span className="font-semibold text-gray-700 text-base">Status</span>
    ),
    renderCell: (params) => {
      const statusColor =
        params.value === "Active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {params?.value}
        </span>
      );
    },
  },
  {
    field: "action",
    headerName: "Action",
    minWidth: 120,
    flex: 0.7, // Smaller column
    headerAlign: "center",
    align: "center",
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: (params) => (
      <span className="font-semibold text-gray-700 text-base">Action</span>
    ),
    renderCell: (params) => {
      return (
        <Link
          to={`/admin/users/${params.id}`}
          className="w-full h-full flex items-center justify-center"
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-1 text-sm transition-colors duration-200 ease-in-out">
            <MdVisibility className="text-lg" /> {/* Added view icon */}
            <span>View</span>
          </button>
        </Link>
      );
    },
  },
];

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Set to true initially
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/getusers");
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch users.");
        toast.error("Error fetching users.");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const rows = users.map((item) => {
    const formattedDate = moment(item.createdDate).format(
      "MMMM DD, YYYY, hh:mm A"
    );

    return {
      id: item.userId,
      username: item.userName,
      email: item.email,
      created: formattedDate,
      status: item.enabled ? "Active" : "Inactive",
    };
  });

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-74px)]">
      {" "}
      {/* Added page background and min-height */}
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* Centering content */}
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 mt-4">
          All System Users
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
              Fetching user data...
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden p-6">
            {" "}
            {/* Card-like styling for the DataGrid */}
            {rows.length === 0 ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md shadow-sm max-w-lg mx-auto">
                <p className="font-semibold text-center">
                  No users found in the system.
                </p>
                <p className="text-sm text-center">
                  The user list is currently empty.
                </p>
              </div>
            ) : (
              <div style={{ height: 500, width: "100%" }}>
                {" "}
                {/* DataGrid requires explicit height */}
                <DataGrid
                  rows={rows}
                  columns={userListsColumns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10, // Increased default page size
                      },
                    },
                  }}
                  disableRowSelectionOnClick
                  pageSizeOptions={[5, 10, 20]} // More pagination options
                  disableColumnResize // Keep this if desired
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

export default UserList;
