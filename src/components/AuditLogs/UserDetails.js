import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useForm } from "react-hook-form";
import InputField from "../InputField/InputField"; // Assuming this is styled well
import { Blocks } from "react-loader-spinner";
import Buttons from "../../utils/Buttons"; // Assuming this handles basic styling
import toast from "react-hot-toast";
import Errors from "../Errors"; // Assuming this is styled well

// UserDetails component is used to show and update user details.
const UserDetails = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset, // Added reset to clear password field after successful update
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const [loading, setLoading] = useState(true); // Set initial loading to true as data is fetched on mount
  const [updateRoleLoader, setUpdateRoleLoader] = useState(false);
  const [passwordLoader, setPasswordLoader] = useState(false);

  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Fetches user details using the userId from the URL
  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/user/${userId}`);
      setUser(response.data);
      setSelectedRole(response.data.role?.roleName || "");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch user details.");
      console.error("Error fetching user details", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetches available roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get("/admin/roles");
      setRoles(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch roles.");
      console.error("Error fetching roles", err);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchRoles();
  }, [fetchUserDetails, fetchRoles]);

  // Set form values once user data is loaded
  useEffect(() => {
    if (user) {
      setValue("username", user.userName);
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Handles updating the user's role
  const handleUpdateRole = async () => {
    setUpdateRoleLoader(true);
    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append("roleName", selectedRole);

      await api.put(`/admin/update-role`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      fetchUserDetails(); // Re-fetch to display updated role
      toast.success("User role updated successfully!");
    } catch (err) {
      console.error("Update Role Failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update role.");
    } finally {
      setUpdateRoleLoader(false);
    }
  };

  // Handles updating the user's password
  const handleSavePassword = async (data) => {
    setPasswordLoader(true);
    const newPassword = data.password;

    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append("password", newPassword);

      await api.put(`/admin/update-password`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      setIsEditingPassword(false);
      reset({ password: "" }); // Clear password field after successful update
      toast.success("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error(err?.response?.data || "Failed to update password.");
    } finally {
      setPasswordLoader(false);
    }
  };

  // Handles updating account statuses (lock, expire, enabled, credentialsExpire)
  const handleCheckboxChange = async (e, updateUrl) => {
    const { name, checked } = e.target;
    setLoading(true); // Show loader for status updates

    let message = `Account ${name} status updated successfully.`;
    if (name === "lock") {
      message = `Account lock status updated to ${
        checked ? "locked" : "unlocked"
      }.`;
    } else if (name === "expire") {
      message = `Account expiry status updated to ${
        checked ? "expired" : "not expired"
      }.`;
    } else if (name === "enabled") {
      message = `Account enabled status updated to ${
        checked ? "enabled" : "disabled"
      }.`;
    } else if (name === "credentialsExpire") {
      message = `Credentials expiry status updated to ${
        checked ? "expired" : "not expired"
      }.`;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append(name, checked);

      await api.put(updateUrl, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      fetchUserDetails(); // Re-fetch to reflect new status
      toast.success(message);
    } catch (err) {
      console.error(`Error updating ${name}:`, err);
      toast.error(
        err?.response?.data?.message || `Failed to update ${name} status.`
      );
    } finally {
      setLoading(false); // Hide loader
    }
  };

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div className="sm:px-8 px-4 py-8 bg-gray-100 min-h-[calc(100vh-74px)]">
      {" "}
      {/* Added background color for the page */}
      {loading && !user ? ( // Only show full-page loader if user data is initially loading
        <div className="flex flex-col justify-center items-center h-72">
          <span>
            <Blocks
              height="70"
              width="70"
              color="#4fa94d"
              ariaLabel="blocks-loading"
              visible={true}
            />
          </span>
          <span className="text-gray-700 mt-2 font-medium">
            Fetching user details...
          </span>
        </div>
      ) : (
        user && ( // Only render content if user data is available
          <>
            {/* Profile Information Section */}
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
                Profile Information
              </h2>
              <form
                onSubmit={handleSubmit(handleSavePassword)}
                className="space-y-4"
              >
                <InputField
                  label="Username"
                  required
                  id="username"
                  type="text"
                  message="Username is required"
                  placeholder="Enter username"
                  register={register}
                  errors={errors}
                  readOnly // Username should typically not be editable here
                />
                <InputField
                  label="Email"
                  required
                  id="email"
                  type="text"
                  message="Email is required"
                  placeholder="Enter email"
                  register={register}
                  errors={errors}
                  readOnly // Email should typically not be editable here
                />
                <InputField
                  label="Password"
                  required
                  autoFocus={isEditingPassword}
                  id="password"
                  type="password"
                  message="Password is required and must be at least 6 characters"
                  placeholder={
                    isEditingPassword
                      ? "Enter new password (min 6 chars)"
                      : "••••••••"
                  }
                  register={register}
                  errors={errors}
                  readOnly={!isEditingPassword}
                  minLength={6} // Added minLength validation
                />

                {!isEditingPassword ? (
                  <Buttons
                    type="button"
                    onClickhandler={() => setIsEditingPassword(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                  >
                    Change Password
                  </Buttons>
                ) : (
                  <div className="flex items-center gap-4">
                    <Buttons
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                    >
                      {passwordLoader ? "Saving..." : "Save New Password"}
                    </Buttons>
                    <Buttons
                      type="button"
                      onClickhandler={() => {
                        setIsEditingPassword(false);
                        setValue("password", ""); // Clear password field on cancel
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                    >
                      Cancel
                    </Buttons>
                  </div>
                )}
              </form>
            </div>

            {/* Admin Actions Section */}
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
                Admin Actions
              </h2>

              {/* Role Update */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4 mb-4">
                  <label
                    htmlFor="role-select"
                    className="text-gray-700 text-lg font-medium mr-2"
                  >
                    User Role:
                  </label>
                  <select
                    id="role-select"
                    className="flex-grow max-w-xs px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
                    value={selectedRole}
                    onChange={handleRoleChange}
                  >
                    {roles.map((role) => (
                      <option key={role.roleId} value={role.roleName}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                </div>
                <Buttons
                  type="button"
                  onClickhandler={handleUpdateRole}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                >
                  {updateRoleLoader ? "Updating..." : "Update Role"}
                </Buttons>
              </div>

              <hr className="my-6" />

              {/* Account Status Checkboxes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Account Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      id="lock-account"
                      className="form-checkbox h-5 w-5 text-red-600 rounded focus:ring-red-500"
                      type="checkbox"
                      name="lock"
                      checked={!user?.accountNonLocked}
                      onChange={(e) =>
                        handleCheckboxChange(e, "/admin/update-lock-status")
                      }
                    />
                    <label
                      htmlFor="lock-account"
                      className="text-gray-700 font-medium cursor-pointer"
                    >
                      Lock Account
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="account-expiry"
                      className="form-checkbox h-5 w-5 text-yellow-600 rounded focus:ring-yellow-500"
                      type="checkbox"
                      name="expire"
                      checked={!user?.accountNonExpired}
                      onChange={(e) =>
                        handleCheckboxChange(e, "/admin/update-expiry-status")
                      }
                    />
                    <label
                      htmlFor="account-expiry"
                      className="text-gray-700 font-medium cursor-pointer"
                    >
                      Account Expired
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="account-enabled"
                      className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      type="checkbox"
                      name="enabled"
                      checked={user?.enabled}
                      onChange={(e) =>
                        handleCheckboxChange(e, "/admin/update-enabled-status")
                      }
                    />
                    <label
                      htmlFor="account-enabled"
                      className="text-gray-700 font-medium cursor-pointer"
                    >
                      Account Enabled
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="credentials-expired"
                      className="form-checkbox h-5 w-5 text-orange-600 rounded focus:ring-orange-500"
                      type="checkbox"
                      name="credentialsExpire"
                      checked={!user?.credentialsNonExpired}
                      onChange={(e) =>
                        handleCheckboxChange(
                          e,
                          `/admin/update-credentials-expiry-status`
                        )
                      }
                    />
                    <label
                      htmlFor="credentials-expired"
                      className="text-gray-700 font-medium cursor-pointer"
                    >
                      Credentials Expired
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default UserDetails;
