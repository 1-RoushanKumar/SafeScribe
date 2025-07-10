import {MdDateRange} from "react-icons/md";
// Remove auditLogsTruncateTexts as we'll handle truncation/full view here
// import { auditLogsTruncateTexts } from "./truncateText";

// Import Material-UI components
import React from 'react'; // Make sure React is imported for JSX in renderCell
import {Box, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button} from "@mui/material";
import {Visibility as VisibilityIcon} from '@mui/icons-material';

// Define a separate React functional component for the Note Content cell
// This component can use React Hooks.
const NoteContentCell = ({params}) => {
    // React Hooks are now called inside a React functional component
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // First, check if the value itself is null or undefined
    if (params.value === null || params.value === undefined) {
        return (
            <p className="text-gray-500 italic text-sm">
                Note was deleted.
            </p>
        );
    }

    let fullContent = '';
    try {
        const parsedContent = JSON.parse(params.value);
        fullContent = parsedContent?.content || '';
    } catch (e) {
        fullContent = params.value || '';
    }

    // If, after parsing, fullContent is still empty (e.g., if the original JSON was {"content":""})
    // or if the parsed content is just whitespace after stripping, consider it "deleted" too.
    if (fullContent.trim() === '' && (params.row.actions === "Note Deleted" || params.row.actions === "DELETE")) {
        return (
            <p className="text-gray-500 italic text-sm">
                Note was deleted.
            </p>
        );
    }

    // Ensure fullContent is a string before calling replace
    const plainTextContent = typeof fullContent === 'string' ? fullContent.replace(/<[^>]*>/g, ' ').trim() : '';
    const displayContent = plainTextContent.length > 100
        ? plainTextContent.substring(0, 97) + "..."
        : plainTextContent;

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            overflow: 'hidden',
        }}>
            <Tooltip title={plainTextContent} enterDelay={500}>
                <span style={{flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {displayContent}
                </span>
            </Tooltip>
            {plainTextContent.length > 100 && (
                <>
                    <IconButton onClick={handleClickOpen} size="small" color="primary"
                                aria-label="view full content">
                        <VisibilityIcon fontSize="small"/>
                    </IconButton>
                    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                        <DialogTitle>Full Note Content</DialogTitle>
                        <DialogContent dividers>
                            <div dangerouslySetInnerHTML={{__html: fullContent}}/>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
};


export const auditLogscolumn = [
    {
        field: "actions",
        headerName: "Action",
        width: 160,
        headerAlign: "center",
        align: "center",
        editable: false,
        headerClassName: "text-black font-semibold border",
        cellClassName: "text-slate-700 font-normal border",
        renderHeader: (params) => <span className="ps-10">Action</span>,
    },

    {
        field: "username",
        headerName: "UserName",
        width: 200,
        editable: false,
        headerAlign: "center",
        disableColumnMenu: true,
        align: "center",
        headerClassName: "text-black font-semibold border",
        cellClassName: "text-slate-700 font-normal border",
        renderHeader: (params) => <span className="ps-10">UserName</span>,
    },

    {
        field: "timestamp",
        headerName: "TimeStamp",
        width: 220,
        editable: false,
        headerAlign: "center",
        disableColumnMenu: true,
        align: "center",
        headerClassName: "text-black font-semibold border",
        cellClassName: "text-slate-700 font-normal border",
        renderHeader: (params) => <span className="ps-10">TimeStamp</span>,
        renderCell: (params) => {
            return (
                <div className="flex items-center justify-center gap-1">
          <span>
            <MdDateRange className="text-slate-700 text-lg"/>
          </span>
                    <span>{params?.row?.timestamp}</span>
                </div>
            );
        },
    },
    {
        field: "noteid",
        headerName: "NoteId",
        disableColumnMenu: true,
        width: 150,
        editable: false,
        headerAlign: "center",
        align: "center",
        headerClassName: "text-black font-semibold border",
        cellClassName: "text-slate-700 font-normal border",
        renderHeader: (params) => <span>NoteId</span>,
    },
    {
        field: "note",
        headerName: "Note Content",
        flex: 1, // Use flex to make it expand
        minWidth: 350, // Keep your original width as minimum
        disableColumnMenu: true,
        editable: false,
        headerAlign: "center",
        align: "left", // Changed align to left for better text flow
        headerClassName: "text-black font-semibold ",
        cellClassName: "text-slate-700 font-normal ",
        renderHeader: (params) => <span className="ps-10">Note Content</span>,
        // Now, render the custom component
        renderCell: (params) => <NoteContentCell params={params}/>,
    },
];