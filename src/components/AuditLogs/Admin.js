import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminSidebar from "./AdminAreaSidebar";
import UserList from "./UserList";
import UserDetails from "./UserDetails";
import { useMyContext } from "../../store/ContextApi";
import AuditLogsDetails from "./AuditLogsDetails";
import AdminAuditLogs from "./AdminAuditLogs";

const Admin = () => {
  // Access the openSidebar hook using the useMyContext hook from the ContextProvider
  const { openSidebar } = useMyContext();
  return (
    // The Admin component returns the sidebar and the main content area.
    // The sidebar is displayed on the left side of the screen and contains links to different pages.
    <div className="flex">
      <AdminSidebar />
      <div
        className={`transition-all overflow-hidden flex-1 duration-150 w-full min-h-[calc(100vh-74px)] ${
          openSidebar ? "lg:ml-52 ml-12" : "ml-12"
        }`}
      >
        {/* Links to different pages */}
        <Routes>
          <Route path="audit-logs" element={<AdminAuditLogs />} />{" "}
          {/* This route renders the AdminAuditLogs component when the path is "/admin/audit-logs" */}
          <Route path="audit-logs/:noteId" element={<AuditLogsDetails />} />{" "}
          {/* If you see there is no button for this in the sidebar because we can access this using Views button inside the Audit-log detail page*/}
          <Route path="users" element={<UserList />} />
          <Route path="users/:userId" element={<UserDetails />} />
          {/* Add other routes as necessary */}
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
