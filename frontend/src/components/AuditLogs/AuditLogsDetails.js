import React, {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import api from "../../services/api";
import {DataGrid} from "@mui/x-data-grid";
import {Blocks} from "react-loader-spinner";
import Errors from "../Errors.js"; // Assuming this component is styled well
import moment from "moment";

// Importing columns from the auditlogs utility file
import {auditLogscolumn} from "../../utils/tableColumn.js";

// The AuditLogsDetails component is used to display the details of a specific audit log for a note.
const AuditLogsDetails = () => {
    const {noteId} = useParams();
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true); // Set to true initially as data fetching starts on mount
    const [error, setError] = useState(null);

    // Memoized function to fetch audit logs for a specific note
    const fetchSingleAuditLogs = useCallback(async () => {
        setLoading(true);
        try {
            const {data} = await api.get(`/audit/note/${noteId}`);
            setAuditLogs(data);
            if (data.length === 0) {
                // If the array is empty, it might mean no logs found for that ID, not necessarily an "error"
                // You might want a different message or UI for this specific case
                console.log(`No audit logs found for Note ID: ${noteId}`);
            }
        } catch (err) {
            // Catch specific 404 or other errors to distinguish from no data
            if (err.response && err.response.status === 404) {
                setError(
                    "No audit logs found for the specified Note ID. It might be invalid."
                );
            } else {
                setError(err?.response?.data?.message || "Failed to fetch audit logs.");
            }
            console.error("Error fetching audit logs:", err);
        } finally {
            setLoading(false);
        }
    }, [noteId]);

    // Effect hook to fetch audit logs when component mounts or noteId changes
    useEffect(() => {
        if (noteId) {
            fetchSingleAuditLogs();
        }
    }, [noteId, fetchSingleAuditLogs]);

    // Prepare rows data for DataGrid
    const rows = auditLogs.map((item) => {
        const formattedDate = moment(item.timestamp).format(
            "MMMM DD, YYYY, hh:mm:ss A"
        ); // Added seconds for more precision

        return {
            id: item.id, // Ensure each row has a unique 'id'
            noteId: item.noteId,
            actions: item.action,
            username: item.username,
            timestamp: formattedDate,
            noteid: item.noteId, // Duplicate, consider removing if 'noteId' is sufficient
            // Ensure noteContent is always a string, even if null/undefined from backend
            note: item.noteContent || 'N/A (Content not available)', // Fallback for null/undefined content
        };
    });

    if (error) {
        return <Errors message={error}/>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-[calc(100vh-74px)]">
            {" "}
            {/* Added background and min-height */}
            <div className="max-w-7xl mx-auto">
                {" "}
                {/* Centering and max-width for content */}
                <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 mt-4">
                    {" "}
                    {/* Enhanced heading */}
                    Audit Log for{" "}
                    <span className="text-blue-600">Note ID - {noteId}</span>
                </h1>
                {loading ? (
                    <div className="flex flex-col justify-center items-center min-h-[400px]">
                        {" "}
                        {/* Centered loader */}
                        <Blocks
                            height="80"
                            width="80"
                            color="#4F46E5" // A more vibrant color for the spinner
                            ariaLabel="loading-blocks"
                            wrapperClass="blocks-wrapper"
                            visible={true}
                        />
                        <span className="text-gray-700 text-lg font-medium mt-4">
              Loading audit logs...
            </span>{" "}
                        {/* More descriptive text */}
                    </div>
                ) : (
                    <>
                        {auditLogs.length === 0 ? (
                            <div
                                className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md shadow-sm max-w-lg mx-auto">
                                <p className="font-semibold text-center">
                                    No audit logs found for this Note ID.
                                </p>
                                <p className="text-sm text-center">
                                    Please ensure the Note ID is correct or check if any actions
                                    have been performed on it.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-xl overflow-hidden p-6">
                                {" "}
                                {/* Card-like styling for the DataGrid */}
                                <div style={{height: 500, width: "100%"}}>
                                    {" "}
                                    {/* DataGrid requires explicit height and width */}
                                    <DataGrid
                                        rows={rows}
                                        columns={auditLogscolumn}
                                        initialState={{
                                            pagination: {
                                                paginationModel: {
                                                    pageSize: 10, // Increased default page size
                                                },
                                            },
                                        }}
                                        pageSizeOptions={[5, 10, 20]} // More page size options
                                        disableRowSelectionOnClick
                                        // Styling for DataGrid via sx prop
                                        sx={{
                                            "& .MuiDataGrid-columnHeaders": {
                                                backgroundColor: "#F3F4F6", // Light gray background for headers
                                                color: "#1F2937", // Darker text for headers
                                                fontWeight: "bold",
                                                fontSize: "1rem",
                                            },
                                            "& .MuiDataGrid-row:nth-of-type(odd)": {
                                                backgroundColor: "#F9FAFB", // Zebra striping for rows
                                            },
                                            "& .MuiDataGrid-cell": {
                                                borderColor: "#E5E7EB", // Lighter border for cells
                                            },
                                            border: "none", // Remove outer border of DataGrid
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogsDetails;