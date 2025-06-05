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

  const navItemClasses = "py-2 cursor-pointer hover:text-slate-300";

  return (
    <header className="h-headerHeight z-50 text-textColor bg-headerColor shadow-sm flex items-center sticky top-0">
      <nav className="sm:px-10 px-4 flex w-full h-full items-center justify-between">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-2"
        >
          <FaShieldAlt className="text-customRed text-2xl sm:text-3xl" />
          <h3 className="font-montserrat font-semibold text-lg sm:text-2xl tracking-wider uppercase text-logoText">
            SafeScribe
          </h3>
          <PiNotePencilFill className="text-customRed text-xl sm:text-2xl" />
        </Link>

        <ul
          className={`lg:static absolute left-0 top-16 w-full lg:w-fit lg:px-0 sm:px-10 px-4 lg:bg-transparent bg-headerColor ${
            headerToggle
              ? "min-h-fit max-h-navbarHeight lg:py-0 py-4 shadow-md shadow-slate-700 lg:shadow-none"
              : "h-0 overflow-hidden"
          } lg:h-auto transition-all duration-100 font-montserrat text-textColor flex lg:flex-row flex-col lg:gap-8 gap-2`}
        >
          {token && (
            <>
              <li
                className={`${navItemClasses} ${
                  pathName === "/notes" ? "font-semibold" : ""
                }`}
              >
                <Link to="/notes" onClick={handleNavClick}>
                  My Notes
                </Link>
              </li>
              <li
                className={`${navItemClasses} ${
                  pathName === "/create-note" ? "font-semibold" : ""
                }`}
              >
                <Link to="/create-note" onClick={handleNavClick}>
                  Create Note
                </Link>
              </li>
            </>
          )}

          <li
            className={`${navItemClasses} ${
              pathName === "/contact" ? "font-semibold" : ""
            }`}
          >
            <Link to="/contact" onClick={handleNavClick}>
              Contact
            </Link>
          </li>

          <li
            className={`${navItemClasses} ${
              pathName === "/about" ? "font-semibold" : ""
            }`}
          >
            <Link to="/about" onClick={handleNavClick}>
              About
            </Link>
          </li>

          <li
            className={`${navItemClasses} ${
              pathName === "/my-messages" ? "font-semibold" : ""
            }`}
          >
            <Link to="/my-messages" onClick={handleNavClick}>
              My Messages
            </Link>
          </li>

          {token ? (
            <>
              <li
                className={`${navItemClasses} ${
                  pathName === "/profile" ? "font-semibold" : ""
                }`}
              >
                <Link to="/profile" onClick={handleNavClick}>
                  Profile
                </Link>
              </li>
              {isAdmin && (
                <li
                  className={`${navItemClasses} uppercase ${
                    pathName.startsWith("/admin") ? "font-semibold" : ""
                  }`}
                >
                  <Link to="/admin/users" onClick={handleNavClick}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    handleNavClick();
                  }}
                  className="w-24 text-center bg-customRed font-semibold px-4 py-2 rounded-sm cursor-pointer hover:text-slate-300"
                >
                  LogOut
                </button>
              </li>
            </>
          ) : (
            <li className="w-24 text-center bg-btnColor font-semibold px-4 py-2 rounded-sm cursor-pointer hover:text-slate-300">
              <Link to="/signup" onClick={handleNavClick}>
                SignUp
              </Link>
            </li>
          )}
        </ul>
        <button
          onClick={() => setHeaderToggle(!headerToggle)}
          className="lg:hidden block cursor-pointer text-textColor shadow-md hover:text-slate-400"
          aria-label={headerToggle ? "Close menu" : "Open menu"}
          aria-expanded={headerToggle}
        >
          {headerToggle ? (
            <RxCross2 className="text-2xl" />
          ) : (
            <IoMenu className="text-2xl" />
          )}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
