import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { useMyContext } from "../store/ContextApi";
import { FaShieldAlt } from "react-icons/fa";
import { PiNotePencilFill } from "react-icons/pi";

const Navbar = () => {
  const [headerToggle, setHeaderToggle] = useState(false);
  const pathName = useLocation().pathname;
  const navigate = useNavigate();

  const { token, setToken, setCurrentUser, isAdmin, setIsAdmin } =
    useMyContext();

  const handleLogout = () => {
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USER");
    localStorage.removeItem("CSRF_TOKEN");
    localStorage.removeItem("IS_ADMIN");
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
    navigate("/login");
  };

  const handleNavClick = () => {
    setHeaderToggle(false);
  };

  const navItemClasses =
    "py-2 cursor-pointer hover:text-slate-300 transition-all duration-200 relative group";

  return (
    <header className="h-headerHeight z-50 text-textColor bg-gradient-to-r from-headerColor to-slate-900 shadow-lg border-b border-slate-700/30 flex items-center sticky top-0 backdrop-blur-md">
      <nav className="sm:px-10 px-4 flex w-full h-full items-center justify-between">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
        >
          <div className="relative">
            <FaShieldAlt className="text-customRed text-2xl sm:text-3xl drop-shadow-lg" />
            <div className="absolute inset-0 text-customRed text-2xl sm:text-3xl animate-pulse opacity-20">
              <FaShieldAlt />
            </div>
          </div>
          <h3 className="font-montserrat font-bold text-lg sm:text-2xl tracking-wider uppercase text-logoText bg-gradient-to-r from-logoText to-slate-300 bg-clip-text">
            SafeScribe
          </h3>
          <PiNotePencilFill className="text-customRed text-xl sm:text-2xl drop-shadow-lg hover:rotate-12 transition-transform duration-200" />
        </Link>

        <ul
          className={`lg:static absolute left-0 top-16 w-full lg:w-fit lg:px-0 sm:px-10 px-4 lg:bg-transparent bg-gradient-to-b from-headerColor to-slate-900 ${
            headerToggle
              ? "min-h-fit max-h-navbarHeight lg:py-0 py-6 shadow-xl shadow-slate-900/50 lg:shadow-none border-b border-slate-700/30 lg:border-none"
              : "h-0 overflow-hidden"
          } lg:h-auto transition-all duration-300 ease-in-out font-montserrat text-textColor flex lg:flex-row flex-col lg:gap-8 gap-3`}
        >
          {token && (
            <>
              <li
                className={`${navItemClasses} ${
                  pathName === "/notes" ? "font-semibold text-customRed" : ""
                }`}
              >
                <Link to="/notes" onClick={handleNavClick} className="block">
                  My Notes
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-customRed transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li
                className={`${navItemClasses} ${
                  pathName === "/create-note"
                    ? "font-semibold text-customRed"
                    : ""
                }`}
              >
                <Link
                  to="/create-note"
                  onClick={handleNavClick}
                  className="block"
                >
                  Create Note
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-customRed transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </>
          )}

          <li
            className={`${navItemClasses} ${
              pathName === "/contact" ? "font-semibold text-customRed" : ""
            }`}
          >
            <Link to="/contact" onClick={handleNavClick} className="block">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-customRed transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>

          <li
            className={`${navItemClasses} ${
              pathName === "/about" ? "font-semibold text-customRed" : ""
            }`}
          >
            <Link to="/about" onClick={handleNavClick} className="block">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-customRed transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>

          <li
            className={`${navItemClasses} ${
              pathName === "/my-messages" ? "font-semibold text-customRed" : ""
            }`}
          >
            <Link to="/my-messages" onClick={handleNavClick} className="block">
              My Messages
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-customRed transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>

          {token ? (
            <>
              <li
                className={`${navItemClasses} ${
                  pathName === "/profile" ? "font-semibold text-customRed" : ""
                }`}
              >
                <Link to="/profile" onClick={handleNavClick} className="block">
                  Profile
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-customRed transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              {isAdmin && (
                <li
                  className={`${navItemClasses} uppercase ${
                    pathName.startsWith("/admin")
                      ? "font-semibold text-customRed"
                      : ""
                  }`}
                >
                  <Link
                    to="/admin/users"
                    onClick={handleNavClick}
                    className="block"
                  >
                    Admin
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-customRed transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    handleNavClick();
                  }}
                  className="w-24 text-center bg-gradient-to-r from-customRed to-red-600 hover:from-red-600 hover:to-customRed font-semibold px-4 py-2 rounded-lg cursor-pointer hover:text-white transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95"
                >
                  LogOut
                </button>
              </li>
            </>
          ) : (
            <li className="w-24 text-center bg-gradient-to-r from-btnColor to-blue-600 hover:from-blue-600 hover:to-btnColor font-semibold px-4 py-2 rounded-lg cursor-pointer hover:text-white transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95">
              <Link to="/signup" onClick={handleNavClick}>
                SignUp
              </Link>
            </li>
          )}
        </ul>
        <button
          onClick={() => setHeaderToggle(!headerToggle)}
          className="lg:hidden block cursor-pointer text-textColor shadow-md hover:text-slate-400 transition-all duration-200 p-2 rounded-lg hover:bg-slate-800/50 active:scale-95"
          aria-label={headerToggle ? "Close menu" : "Open menu"}
          aria-expanded={headerToggle}
        >
          {headerToggle ? (
            <RxCross2 className="text-2xl transition-transform duration-200 hover:rotate-90" />
          ) : (
            <IoMenu className="text-2xl transition-transform duration-200 hover:scale-110" />
          )}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
