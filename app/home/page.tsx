"use client";
import Footer from "@/app/components/UI/Footer";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Features } from "./sections/features";
import { Hero } from "./sections/hero";
import { Login } from "./sections/login";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroSection = document.getElementById("hero-bg");
      if (heroSection) {
        heroSection.style.backgroundPositionY = `${scrollY * 0.5}px`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById("mobile-menu");
      const mobileMenuButton = document.getElementById("mobile-menu-button");

      if (
        mobileMenu &&
        mobileMenuButton &&
        !mobileMenu.contains(event.target as Node) &&
        !mobileMenuButton.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    console.log("Logging in with OAuth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>CD Smart Campus | แพลตฟอร์มระบบบริการนักเรียนออนไลน์</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Main Content */}
      <Hero />
      <Features />
      <Login />

      {/* Footer */}
      <Footer />
    </div>
  );
}
