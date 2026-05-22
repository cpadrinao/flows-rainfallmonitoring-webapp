import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "F.L.O.W.S. | Rainfall Monitoring Dashboard",
  description: "Flood and Local Observatory Warning System (F.L.O.W.S.) - Real-time rainfall telemetry and emergency alerts for Barangay Rizal.",
  icons: {
    icon: "/flowsnoname.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${robotoMono.variable}`}>
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-[#F9FAFB] font-sans">
        {children}
      </body>
    </html>
  );
}

