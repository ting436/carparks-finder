import { ReactNode } from 'react';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Map",
};

export default function Layout({
  children,
}: Readonly<{ 
  children: ReactNode; 
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}