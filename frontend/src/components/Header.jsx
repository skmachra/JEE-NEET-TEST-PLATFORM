import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth";
import axios from "axios";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, setUser, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const logoutcall = async () => {
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL+"/api/v1/users/logout", {}, {
        withCredentials: true, // Ensures cookies are sent
      });
      console.log(response.data.message); // "User logged out successfully"
      return true;
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message);
      return false;
    } 
  };
  const logout = async () => {
    const isLoggedOut = await logoutcall();
    if (isLoggedOut) {
      setUser(null); // Clear user data from context
      setIsLoggedIn(false); // Update the state of isLoggedIn to false
      navigate("/login"); // Redirect to login page 
    }
  };
  
  const menuItems =  user?.isadmin ? [
      { name: "Home", link: "/" },
      { name: "Bookmark", link: "/bookmark" },
      { name: "Test", link: "/test" },
      { name: "Admin", link: "/admin" },
      { name: "Logout", action: () => logout()},
    ]
    : isLoggedIn
    ? [
      { name: "Home", link: "/" },
      { name: "Bookmark", link: "/bookmark" },
      { name: "Test", link: "/test" },
      { name: "Logout", action: () => logout()},
    ]
    :
    [
      { name: "Home", link: "/" },
      { name: "Bookmark", link: "/bookmark" },
      { name: "Test", link: "/test" },
      { name: "Login", link: "/login" },
      { name: "Register", link: "/register" },
    ];

  return (
    <header>
      <nav className="w-full flex justify-between items-center shadow-custom py-2 px-9 bg-blue-600 relative font-montserrat">
      <div className="text-2xl text-white font-bold">
          <Link to="/">JEE-NEET TEST</Link>
        </div>

        <button
          className={`text-white text-3xl ${isMenuOpen ? "fixed" : ""} sm:hidden focus:outline-none z-50 top-3 right-9`}
          onClick={toggleMenu}
        >
          <i className={`fas z-50 ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>

        <ul
          className={`${isMenuOpen
            ? "fixed top-0 right-0 bg-blue-600 w-1/2 h-full flex flex-col items-center z-40 transform translate-x-0 transition-all duration-500 ease-in-out"
            : "fixed top-0 right-[-100%] bg-blue-600 w-1/2 h-full flex flex-col items-center z-40 transform translate-x-full transition-all duration-500 ease-in-out"
            } sm:flex sm:flex-row sm:items-center sm:space-x-8 sm:static sm:bg-transparent sm:w-auto sm:h-auto sm:translate-x-0`}
        >
          {menuItems.map((item, index) => (
            item.action ? (
              <li key={index} className={`pl-8 max-640:mt-10 list-none`}>
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsMenuOpen(false)
                  }}
                  className="relative max-xl:p-2 inline-block text-white no-underline text-center uppercase transition-all duration-150 ease-in-out group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-transparent transition-all duration-150 ease-in-out group-hover:w-full"></span>
                  <span className="absolute bottom-[-6px] left-0 h-[3px] w-full bg-white rounded-full transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100"></span>
                </button>
              </li>
            ) : (
              <li key={index} className={`pl-8 max-640:mt-10 list-none`}>

                <Link
                  onClick={()=> setIsMenuOpen(false)}
                  to={item.link}
                  className="relative max-xl:p-2 inline-block text-white no-underline text-center uppercase transition-all duration-150 ease-in-out group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-transparent transition-all duration-150 ease-in-out group-hover:w-full"></span>
                  <span className="absolute bottom-[-6px] left-0 h-[3px] w-full bg-white rounded-full transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100"></span>
                </Link>
              </li>)
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
