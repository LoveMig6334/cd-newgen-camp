import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaHome,
  FaSignInAlt,
  FaTimes,
} from "react-icons/fa";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default values
  const appName = "CD Smart Campus";
  const loginText = "เข้าสู่ระบบ";

  // Default navigation links with icons
  const defaultLinks = [
    { title: "หน้าหลัก", icon: <FaHome />, href: "/" },
    // { title: "หลักสูตร", icon: <FaBook />, href: "/courses" },
    // { title: "นักเรียน", icon: <FaUsers />, href: "/students" },
    // { title: "เกี่ยวกับเรา", icon: <FaInfoCircle />, href: "/about" },
    { title: "ปฏิทิน", icon: <FaCalendarAlt />, href: "/calendar" },
    // { title: "ช่วยเหลือ", icon: <FaQuestion />, href: "/help" }
  ];

  const handleLogin = () => {
    console.log("Login clicked");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and App Name */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center">
              <div className="text-blue-600 mr-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                {appName}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {defaultLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                className="flex items-center px-3 py-2 font-medium text-gray-600 hover:text-blue-600 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.title}
              </motion.a>
            ))}
            <motion.button
              onClick={handleLogin}
              className="flex items-center px-4 py-2 font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignInAlt className="mr-2" />
              {loginText}
            </motion.button>
          </div>

          {/* Mobile Navigation Button (Hamburger) */}
          <div className="flex md:hidden">
            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-lg rounded-b-lg mx-4 overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {defaultLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                className="flex items-center px-3 py-2 font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.title}
              </motion.a>
            ))}
            <motion.button
              onClick={handleLogin}
              className="w-full flex items-center font-bold justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignInAlt className="mr-2" />
              {loginText}
            </motion.button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
