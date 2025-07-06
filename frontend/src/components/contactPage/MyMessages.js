import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiMail,
  FiSearch,
  FiMessageSquare,
  FiInfo,
  FiLoader,
} from "react-icons/fi"; // Added more icons
import { ClipLoader } from "react-spinners"; // For loading spinner

// Here user can see the messages they sent to the admin
// And Track the status of their messages
// Here we have to logic if user is logged in then we will fetch the messages from the backend directly without entering the email
// If user is not logged in then we will ask the user to enter their email and then fetch the messages
const MyMessages = () => {
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state for initial fetch
  const [fetchingUserMessages, setFetchingUserMessages] = useState(false); // New loading state for manual fetch

  useEffect(() => {
    const token = localStorage.getItem("JWT_TOKEN");
    const storedUser = localStorage.getItem("USER");

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.email) {
          setEmail(user.email);
          setIsLoggedIn(true);
          fetchMessages(user.email); // Initial fetch for logged-in users
        } else {
          setLoading(false); // If token exists but email isn't in USER, don't auto-fetch
        }
      } catch (err) {
        console.error("Failed to parse user info from localStorage", err);
        setLoading(false);
      }
    } else {
      setLoading(false); // No token, no auto-fetch
    }
  }, []);

  const fetchMessages = async (emailToFetch) => {
    setFetchingUserMessages(true); // Start manual fetch loading
    try {
      const response = await api.get(`/contact/my-messages`, {
        params: { email: emailToFetch },
      });
      setMessages(response.data);
      if (response.data.length === 0) {
        toast.info("No messages found for this email address.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages. Please try again.");
      setMessages([]); // Clear messages on error
    } finally {
      setLoading(false); // Initial loading complete
      setFetchingUserMessages(false); // Manual fetch loading complete
    }
  };

  const handleFetchMessages = () => {
    if (!email.trim()) {
      toast.warning("Please enter your email address to fetch messages.");
      return;
    }
    fetchMessages(email.trim());
  };

  const getStatusBadge = (status) => {
    const baseClass =
      "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    switch (status) {
      case "PENDING":
        return (
          <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
            Pending
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className={`${baseClass} bg-blue-100 text-blue-700`}>
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className={`${baseClass} bg-green-100 text-green-700`}>
            Resolved
          </span>
        );
      default:
        return (
          <span className={`${baseClass} bg-gray-100 text-gray-700`}>
            {status || "Unknown"}
          </span>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date);
    } catch (e) {
      console.error("Invalid timestamp:", timestamp, e);
      return timestamp; // Return original if parsing fails
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={true}
      />

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center justify-center gap-3">
          <FiMessageSquare className="text-blue-600 text-4xl" />
          My Messages
        </h2>

        {/* Email Input Section for Non-Logged-In Users */}
        {!isLoggedIn && (
          <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
            <p className="text-blue-800 text-lg mb-4 text-center font-medium">
              Enter your email to view your messages:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                />
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
              <button
                onClick={handleFetchMessages}
                disabled={fetchingUserMessages}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg w-full sm:w-auto"
              >
                {fetchingUserMessages ? (
                  <>
                    <ClipLoader size={20} color="#fff" /> Fetching...
                  </>
                ) : (
                  <>
                    <FiSearch className="text-xl" /> Fetch Messages
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading State for Messages Table */}
        {loading || fetchingUserMessages ? (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg shadow-inner">
            <FiLoader className="animate-spin text-blue-500 text-5xl mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              Loading your messages...
            </p>
          </div>
        ) : (
          /* Messages Table or Empty State */
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-md">
            {messages.length > 0 ? (
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-32">
                      Status
                    </th>{" "}
                    {/* Fixed width for status */}
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-40">
                      Sent On
                    </th>{" "}
                    {/* Fixed width for timestamp */}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg, index) => (
                    <tr
                      key={msg.id || index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-gray-800 text-base max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {msg.message}
                      </td>
                      <td className="p-4">{getStatusBadge(msg.status)}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatTimestamp(msg.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg">
                <FiInfo className="text-blue-400 text-6xl mx-auto mb-4" />
                <p className="text-xl font-medium mb-2">
                  {isLoggedIn
                    ? "You haven't sent any messages yet."
                    : "Enter your email above to see your messages."}
                </p>
                {!isLoggedIn && (
                  <p className="text-gray-600">
                    If you're logged in, your messages should appear
                    automatically.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMessages;
