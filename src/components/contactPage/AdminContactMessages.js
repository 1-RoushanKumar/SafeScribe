import React, { useEffect, useState } from "react";
import api from "../../services/api"; // Adjust path if needed
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);

  // Here we define a function to fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await api.get("/admin/contact-messages");
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages", error);
      toast.error("Error fetching messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Function to handle deleting a single message
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/message/${id}`);
      toast.success("Message deleted successfully");
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message", error);
      toast.error("Failed to delete message");
    }
  };

  // Function to handle deleting all messages
  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all messages?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/message/delete-all`);
      toast.success("All messages deleted successfully");
      fetchMessages();
    } catch (error) {
      console.error("Error deleting all messages", error);
      toast.error("Failed to delete all messages");
    }
  };

  // Function to handle changing the status of a message logic is written in backend
  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/message/${id}/status`, null, {
        params: { status },
      });
      toast.success("Status updated");
      fetchMessages();
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Failed to update status");
    }
  };

  // Define the status options for the select dropdown
  const statusOptions = ["PENDING", "IN_PROGRESS", "RESOLVED"];

  const getStatusBadge = (status) => {
    const baseClass = "px-2 py-1 rounded text-xs font-semibold";
    switch (status) {
      case "PENDING":
        return (
          <span className={`${baseClass} bg-yellow-200 text-yellow-800`}>
            PENDING
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className={`${baseClass} bg-blue-200 text-blue-800`}>
            IN PROGRESS
          </span>
        );
      case "RESOLVED":
        return (
          <span className={`${baseClass} bg-green-200 text-green-800`}>
            RESOLVED
          </span>
        );
      default:
        return (
          <span className={`${baseClass} bg-gray-200 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  // Render the component
  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Contact Messages</h2>
        <button
          onClick={handleDeleteAll}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Delete All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Message</th>
              <th className="p-3 font-semibold">Timestamp</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Change Status</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, index) => (
              <tr
                key={msg.id || index}
                className="border-b hover:bg-gray-50 even:bg-gray-50"
              >
                <td className="p-3 font-medium">{msg.name}</td>
                <td className="p-3 text-blue-600">{msg.email}</td>
                <td className="p-3 text-gray-700">{msg.message}</td>
                <td className="p-3 text-sm text-gray-500">{msg.timestamp}</td>
                <td className="p-3">{getStatusBadge(msg.status)}</td>
                <td className="p-3">
                  <select
                    value={msg.status}
                    onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No contact messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminContactMessages;
