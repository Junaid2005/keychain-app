"use client"

import React, { useState, useEffect } from "react";
// import { useTheme } from "next-themes";
import { Label } from "./ui/label";
import Link from "next/link";

const ThemeImage: React.FC = () => {
//   const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // To ensure it only renders after the client is ready and avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid server-side rendering issues
  
//   const darkImageSrc = "/dark-theme-image.png"; // Image path for dark theme
//   const lightImageSrc = "/light-theme-image.png"; // Image path for light theme

  return (
    // <Image
    //   src={theme === "dark" ? darkImageSrc : lightImageSrc}
    //   alt="Theme Image"
    //   width="100"
    //   height="10"
    // />
    <Link href="/" passHref>
      <Label className="cursor-pointer text-lg">Keychain</Label>
    </Link>
  );
};

export default ThemeImage;
