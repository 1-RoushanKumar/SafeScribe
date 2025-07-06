import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useMyContext } from "../../store/ContextApi";
import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InputField from "../InputField/InputField"; // Assuming this is a custom styled input
import { useForm } from "react-hook-form";
import Buttons from "../../utils/Buttons"; // Assuming this is a custom styled button
import Switch from "@mui/material/Switch";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Blocks } from "react-loader-spinner";
import moment from "moment";
import Errors from "../Errors";
import {
  MdOutlineSecurity,
  MdLock,
  MdCheckCircle,
  MdAccountCircle,
  MdEmail,
  MdKey,
  MdHistory,
} from "react-icons/md"; // Added more relevant icons

const UserProfile = () => {
  const { currentUser, token } = useMyContext();

  const [loginSession, setLoginSession] = useState(null);
  const [credentialExpireDate, setCredentialExpireDate] = useState(null);
  const [pageError, setPageError] = useState(false);

  const [accountExpired, setAccountExpired] = useState(false);
  const [accountLocked, setAccountLock] = useState(false);
  const [accountEnabled, setAccountEnabled] = useState(false);
  const [credentialExpired, setCredentialExpired] = useState(false);

  const [openAccount, setOpenAccount] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);

  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // Step 1: Default/Status, Step 2: Enable/Verify QR

  const [loading, setLoading] = useState(false); // For credential update
  const [pageLoader, setPageLoader] = useState(true); // For initial page load
  const [twofaActionLoader, setTwofaActionLoader] = useState(false); // For 2FA enable/disable
  const [twofaVerifyLoader, setTwofaVerifyLoader] = useState(false); // For 2FA code verification

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: currentUser?.username,
      email: currentUser?.email,
      password: "",
    },
    mode: "onTouched",
  });

  // Fetch 2FA status on component mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const response = await api.get(`/auth/user/2fa-status`);
        setIs2faEnabled(response.data.is2faEnabled);
        setStep(response.data.is2faEnabled ? 1 : 1); // If already enabled, just show status
      } catch (error) {
        setPageError(
          error?.response?.data?.message || "Error fetching 2FA status."
        );
        toast.error("Failed to load 2FA status.");
      } finally {
        setPageLoader(false);
      }
    };
    fetch2FAStatus();
  }, []);

  // Update form fields and account statuses when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      setValue("username", currentUser.username);
      setValue("email", currentUser.email);
      setAccountExpired(!currentUser.accountNonExpired);
      setAccountLock(!currentUser.accountNonLocked);
      setAccountEnabled(currentUser.enabled);
      setCredentialExpired(!currentUser.credentialsNonExpired);

      const expiredFormatDate = moment(
        currentUser?.credentialsExpiryDate
      ).format("D MMMM YYYY");
      setCredentialExpireDate(expiredFormatDate);
    }
  }, [currentUser, setValue]);

  // Decode token for last login session
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const lastLoginSession = moment
        .unix(decodedToken.iat)
        .format("dddd, D MMMM YYYY, h:mm A");
      setLoginSession(lastLoginSession);
    }
  }, [token]);

  // Enable 2FA
  const enable2FA = async () => {
    setTwofaActionLoader(true);
    try {
      const response = await api.post(`/auth/enable-2fa`);
      setQrCodeUrl(response.data);
      setStep(2); // Move to verification step
      toast.success("Scan QR code and verify with your authenticator app.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error enabling 2FA.");
    } finally {
      setTwofaActionLoader(false);
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    setTwofaActionLoader(true);
    try {
      await api.post(`/auth/disable-2fa`);
      setIs2faEnabled(false);
      setQrCodeUrl("");
      setStep(1); // Reset to default step
      toast.success("Two-Factor Authentication disabled successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error disabling 2FA.");
    } finally {
      setTwofaActionLoader(false);
    }
  };

  // Verify 2FA code
  const verify2FA = async () => {
    if (!code || code.trim().length === 0) {
      return toast.error("Please enter the 2FA code to verify.");
    }

    setTwofaVerifyLoader(true);
    try {
      const formData = new URLSearchParams();
      formData.append("code", code);

      await api.post(`/auth/verify-2fa`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      toast.success("Two-Factor Authentication verified and enabled!");
      setIs2faEnabled(true);
      setStep(1); // Back to status view
      setCode(""); // Clear the code input
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Invalid 2FA Code. Please try again."
      );
    } finally {
      setTwofaVerifyLoader(false);
    }
  };

  // Update user credentials
  const handleUpdateCredential = async (data) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("newUsername", data.username);
      if (data.password) {
        // Only send password if it's provided
        formData.append("newPassword", data.password);
      }

      await api.post("/auth/update-credentials", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      toast.success("Credentials updated successfully!");
      setValue("password", ""); // Clear password field after successful update
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers for account status switches (only if admin is logged in)
  const handleAccountExpiryStatus = async (event) => {
    const isChecked = event.target.checked;
    setAccountExpired(isChecked); // Optimistic update
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("expire", isChecked);
      await api.put("/auth/update-expiry-status", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success(
        `Account expiry status updated to ${
          isChecked ? "Expired" : "Not Expired"
        }.`
      );
    } catch (error) {
      setAccountExpired(!isChecked); // Revert on error
      toast.error("Failed to update account expiry status.");
    }
  };

  const handleAccountLockStatus = async (event) => {
    const isChecked = event.target.checked;
    setAccountLock(isChecked); // Optimistic update
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("lock", isChecked);
      await api.put("/auth/update-lock-status", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success(
        `Account lock status updated to ${isChecked ? "Locked" : "Unlocked"}.`
      );
    } catch (error) {
      setAccountLock(!isChecked); // Revert on error
      toast.error("Failed to update account lock status.");
    }
  };

  const handleAccountEnabledStatus = async (event) => {
    const isChecked = event.target.checked;
    setAccountEnabled(isChecked); // Optimistic update
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("enabled", isChecked);
      await api.put("/auth/update-enabled-status", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success(
        `Account enabled status updated to ${
          isChecked ? "Enabled" : "Disabled"
        }.`
      );
    } catch (error) {
      setAccountEnabled(!isChecked); // Revert on error
      toast.error("Failed to update account enabled status.");
    }
  };

  const handleCredentialExpiredStatus = async (event) => {
    const isChecked = event.target.checked;
    setCredentialExpired(isChecked); // Optimistic update
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("expire", isChecked);
      await api.put("/auth/update-credentials-expiry-status", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success(
        `Credentials expiry status updated to ${
          isChecked ? "Expired" : "Not Expired"
        }.`
      );
    } catch (error) {
      setCredentialExpired(!isChecked); // Revert on error
      toast.error("Failed to update credentials expiry status.");
    }
  };

  // Accordion toggle handlers
  const onOpenAccountHandler = () => {
    setOpenAccount(!openAccount);
    setOpenSetting(false);
  };
  const onOpenSettingHandler = () => {
    setOpenSetting(!openSetting);
    setOpenAccount(false);
  };

  if (pageError) {
    return <Errors message={pageError} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {pageLoader ? (
        <div className="flex flex-col justify-center items-center h-[500px]">
          <Blocks
            height="80"
            width="80"
            color="#4F46E5"
            ariaLabel="blocks-loading"
            visible={true}
          />
          <span className="text-gray-700 text-lg font-medium mt-4">
            Loading user profile...
          </span>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Left Panel: User Profile & Account Settings */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex flex-col items-center mb-8">
              <Avatar
                alt={currentUser?.username}
                src="/static/images/avatar/1.jpg"
                sx={{ width: 96, height: 96, bgcolor: "#4F46E5" }} // Larger avatar, custom color
                className="mb-4 text-white font-bold text-4xl" // Tailwind for text
              >
                {currentUser?.username
                  ? currentUser.username.charAt(0).toUpperCase()
                  : "U"}
              </Avatar>
              <h2 className="font-extrabold text-3xl text-gray-900 mb-2">
                {currentUser?.username}
              </h2>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                <MdAccountCircle /> {currentUser && currentUser["roles"][0]}
              </p>
            </div>

            {/* Update User Credentials Accordion */}
            <Accordion
              expanded={openAccount}
              onChange={onOpenAccountHandler}
              sx={{
                mb: 2, // Margin bottom
                boxShadow: "none", // Remove default Accordion shadow
                "&.Mui-expanded": { margin: "8px 0" }, // Keep consistent margin when expanded
                "&:before": { display: "none" }, // Remove default line
                border: "1px solid #E5E7EB", // Custom border
                borderRadius: "8px", // Rounded corners
                overflow: "hidden", // Ensure border radius applies
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                  backgroundColor: "#F9FAFB", // Light background for summary
                  borderBottom: openAccount ? "1px solid #E5E7EB" : "none", // Border when open
                  "& .MuiAccordionSummary-content": {
                    py: 1, // Vertical padding
                    alignItems: "center",
                    gap: 1,
                  },
                }}
              >
                <MdKey className="text-gray-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Update User Credentials
                </h3>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 3, pb: 2, px: 3 }}>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleSubmit(handleUpdateCredential)}
                >
                  <InputField
                    label="Username"
                    required
                    id="username"
                    className="w-full"
                    type="text"
                    message="Username is required."
                    placeholder="Enter new username"
                    register={register}
                    errors={errors}
                  />
                  <InputField
                    label="Email"
                    required
                    id="email"
                    className="w-full"
                    type="email"
                    message="Email is required."
                    placeholder="Your email address"
                    register={register}
                    errors={errors}
                    readOnly
                    // You might want to style readOnly input differently
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        color: "rgba(0, 0, 0, 0.6)", // Slightly darker text for disabled
                        backgroundColor: "#F0F0F0", // Light gray background
                        cursor: "not-allowed",
                      },
                    }}
                  />
                  <InputField
                    label="New Password (optional)"
                    id="password"
                    className="w-full"
                    type="password"
                    message="Password must be at least 6 characters."
                    placeholder="Leave empty to keep current password"
                    register={register}
                    errors={errors}
                    min={6}
                  />
                  <Buttons
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-200 w-full flex justify-center items-center"
                    type="submit"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Blocks height="20" width="20" color="#fff" />{" "}
                        Updating...
                      </span>
                    ) : (
                      "Update Credentials"
                    )}
                  </Buttons>
                </form>
              </AccordionDetails>
            </Accordion>

            {/* Account Settings Accordion */}
            <Accordion
              expanded={openSetting}
              onChange={onOpenSettingHandler}
              sx={{
                mb: 2, // Margin bottom
                boxShadow: "none", // Remove default Accordion shadow
                "&.Mui-expanded": { margin: "8px 0" }, // Keep consistent margin when expanded
                "&:before": { display: "none" }, // Remove default line
                border: "1px solid #E5E7EB", // Custom border
                borderRadius: "8px", // Rounded corners
                overflow: "hidden", // Ensure border radius applies
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                sx={{
                  backgroundColor: "#F9FAFB", // Light background for summary
                  borderBottom: openSetting ? "1px solid #E5E7EB" : "none", // Border when open
                  "& .MuiAccordionSummary-content": {
                    py: 1, // Vertical padding
                    alignItems: "center",
                    gap: 1,
                  },
                }}
              >
                <MdLock className="text-gray-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Account Status & Security
                </h3>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 3, pb: 2, px: 3 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  {/* Account Expired */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-700 font-medium">
                      Account Expired
                    </span>
                    <Switch
                      checked={accountExpired}
                      onChange={handleAccountExpiryStatus}
                      inputProps={{ "aria-label": "Account Expired switch" }}
                      color="primary"
                    />
                  </div>
                  {/* Account Locked */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-700 font-medium">
                      Account Locked
                    </span>
                    <Switch
                      checked={accountLocked}
                      onChange={handleAccountLockStatus}
                      inputProps={{ "aria-label": "Account Locked switch" }}
                      color="primary"
                    />
                  </div>
                  {/* Account Enabled */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-700 font-medium">
                      Account Enabled
                    </span>
                    <Switch
                      checked={accountEnabled}
                      onChange={handleAccountEnabledStatus}
                      inputProps={{ "aria-label": "Account Enabled switch" }}
                      color="primary"
                    />
                  </div>
                  {/* Credential Expired */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-700 font-medium">
                      Credentials Expired
                    </span>
                    <Switch
                      checked={credentialExpired}
                      onChange={handleCredentialExpiredStatus}
                      inputProps={{ "aria-label": "Credential Expired switch" }}
                      color="primary"
                    />
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <h4 className="text-base font-semibold text-gray-800 mb-2">
                    Credential Expiry Date
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-md text-gray-700 text-sm">
                    Your credentials will expire on{" "}
                    <span className="font-semibold">
                      {credentialExpireDate || "N/A"}
                    </span>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            {/* Last Login Session */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MdHistory className="text-gray-600 text-xl" />
                Last Login Session
              </h3>
              <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
                <p className="text-gray-700 text-sm">
                  Your last login session was on: <br />
                  <span className="font-semibold text-blue-600">
                    {loginSession || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Multi-Factor Authentication */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlineSecurity className="text-blue-600 text-3xl" />
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-gray-600 text-base mb-4">
              Add an additional layer of security to your account by enabling
              2FA.
            </p>

            <div className="flex items-center gap-3 mb-6">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  is2faEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {is2faEnabled ? "Activated" : "Deactivated"}
              </span>
              <p className="text-gray-700 font-medium">
                2FA Status: {is2faEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>

            {/* 2FA Enable/Disable Button */}
            <Buttons
              disabled={twofaActionLoader}
              onClickhandler={is2faEnabled ? disable2FA : enable2FA}
              className={`py-2.5 px-6 rounded-md text-white font-semibold transition duration-200 flex items-center justify-center gap-2 ${
                is2faEnabled
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {twofaActionLoader ? (
                <span className="flex items-center gap-2">
                  <Blocks height="20" width="20" color="#fff" /> Processing...
                </span>
              ) : (
                <>{is2faEnabled ? "Disable 2FA" : "Enable 2FA"}</>
              )}
            </Buttons>

            {/* 2FA Verification Step (QR Code & Input) */}
            {step === 2 &&
              !is2faEnabled && ( // Only show if 2FA is not enabled yet and we are in step 2
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center shadow-inner">
                  <h3 className="font-bold text-xl text-blue-800 mb-4">
                    Scan QR Code to Setup 2FA
                  </h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Open your authenticator app (e.g., Google Authenticator,
                    Authy) and scan the QR code below.
                  </p>
                  {qrCodeUrl ? (
                    <div className="flex justify-center mb-6">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code for 2FA"
                        className="w-48 h-48 border border-gray-300 rounded-md p-2 bg-white"
                      />
                    </div>
                  ) : (
                    <p className="text-red-500 font-semibold mb-4">
                      QR Code not available. Please try enabling 2FA again.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <input
                      type="text"
                      placeholder="Enter 6-digit 2FA code"
                      value={code}
                      required
                      maxLength={6}
                      className="flex-grow border border-gray-300 px-4 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <Buttons
                      disabled={twofaVerifyLoader || !code}
                      onClickhandler={verify2FA}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-md transition duration-200 flex items-center justify-center gap-2"
                    >
                      {twofaVerifyLoader ? (
                        <span className="flex items-center gap-2">
                          <Blocks height="20" width="20" color="#fff" />{" "}
                          Verifying...
                        </span>
                      ) : (
                        <>
                          <MdCheckCircle className="text-xl" /> Verify 2FA
                        </>
                      )}
                    </Buttons>
                  </div>
                  <p className="text-blue-600 text-xs mt-3">
                    Enter the code from your authenticator app within 30
                    seconds.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
