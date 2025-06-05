import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Here user can see the messages they sent to the admin
//And Track the status of their messages
//Here we have to logic if user is logged in then we will fetch the messages from the backend directly without entering the email
// If user is not logged in then we will ask the user to enter their email and then fetch the messages
const MyMessages = () => {
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("JWT_TOKEN");
    const storedUser = localStorage.getItem("USER");

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.email) {
          setEmail(user.email);
          setIsLoggedIn(true);
          fetchMessages(user.email);
        }
      } catch (err) {
        console.error("Failed to parse user info from localStorage", err);
      }
    }
  }, []);

  const fetchMessages = async (emailToFetch) => {
    try {
      const response = await api.get(`/contact/my-messages`, {
        params: { email: emailToFetch },
      });
      setMessages(response.data);
      if (response.data.length === 0) {
        toast.info("No messages found for this email");
      }
    } catch (error) {
      console.error("Error fetching messages", error);
      toast.error("Failed to fetch messages");
    }
  };

  const handleFetchMessages = () => {
    if (!email) {
      toast.warning("Please enter your email");
      return;
    }
    fetchMessages(email);
  };

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

  return (
    <div className="p-5 max-w-2xl mx-auto min-h-[493px] flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 className="text-2xl font-bold mb-4">Check Your Messages</h2>

      {!isLoggedIn && (
        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 w-full mb-2"
          />
          <button
            onClick={handleFetchMessages}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Fetch Messages
          </button>
        </div>
      )}

      <div className="overflow-x-auto min-h-[150px] border border-gray-200 rounded-md p-4 flex-grow">
        {messages.length > 0 ? (
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-semibold">Message</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{msg.message}</td>
                  <td className="p-3">{getStatusBadge(msg.status)}</td>
                  <td className="p-3 text-sm text-gray-500">{msg.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 pt-8">
            {isLoggedIn
              ? "No messages found for your email."
              : "Please enter your email and click 'Fetch Messages'."}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyMessages;
