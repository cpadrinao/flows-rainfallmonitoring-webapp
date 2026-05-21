import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F.L.O.W.S. | Rainfall Monitoring System",
  description: "Flood and Local Observatory Warning System (F.L.O.W.S.) - Real-time rainfall telemetry and emergency alerts for Barangay Rizal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-[#F9FAFB] font-sans">
        {children}
      </body>
    </html>
  );
}

