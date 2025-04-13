"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Define the correct prop types
interface HeaderLinkType {
  href: string;
  text: string;
  underline?: boolean;
}

const HeaderLink: React.FC<HeaderLinkType> = ({ href, text, underline = false }) => {
  return (
    <Button variant="link" asChild>
      <Link href={href} className={underline ? "underline" : ""}>
        {text}
      </Link>
    </Button>
  );
};

export default HeaderLink;
