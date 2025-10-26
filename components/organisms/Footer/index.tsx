import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Image src="/SatuDev.png" alt="SatuDev" width={30} height={30} />
          <span className="text-md font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            SatuDev
          </span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SatuDev Solution. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href="/privacy-policy"
            className="text-sm text-muted-foreground hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="text-sm text-muted-foreground hover:underline"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
