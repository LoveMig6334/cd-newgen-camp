"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaBars, FaHome, FaTimes } from "react-icons/fa";

interface NavBarProps {
  eventName?: string;
  eventYear?: number;
  eventSlug?: string;
}

const Navbar = ({ eventName, eventYear, eventSlug }: NavBarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = eventName ?? "CD Smart Campus";
  const applicationHref =
    eventYear && eventSlug
      ? `/events/${eventYear}/${eventSlug}/application`
      : null;

  const links = [{ title: "หน้าหลัก", icon: <FaHome />, href: "/" }];

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-blue-600">
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
                {displayName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {links.map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className="flex items-center px-3 py-2 font-medium text-gray-600 hover:text-blue-600 transition duration-300"
                >
                  {link.icon ? <span className="mr-2">{link.icon}</span> : null}
                  {link.title}
                </Link>
              </motion.div>
            ))}
            {applicationHref ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={applicationHref}
                  className="flex items-center px-4 py-2 font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition duration-300"
                >
                  สมัครค่าย
                </Link>
              </motion.div>
            ) : null}
          </div>

          {/* Mobile Hamburger */}
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
      {mobileMenuOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-lg rounded-b-lg mx-4 overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition duration-300"
              >
                {link.icon ? <span className="mr-2">{link.icon}</span> : null}
                {link.title}
              </Link>
            ))}
            {applicationHref ? (
              <Link
                href={applicationHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2 font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition duration-300"
              >
                สมัครค่าย
              </Link>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </nav>
  );
};

export default Navbar;
