import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.jsx
export const metadata = {
  title: "Retro – Chat with Your Documents",
  description:
    "Upload your PDFs and chat with them instantly. Retro lets you ask questions, summarize key insights, and understand your documents faster — powered by AI.",
  keywords: [
    "AI PDF chat",
    "Chat with documents",
    "AI summarizer",
    "Retro app",
    "ChatGPT for PDFs",
    "Document assistant",
  ],
  authors: [{ name: "Prince Chidera", url: "https://github.com/prince24-web" }],
  creator: "Prince Chidera",
  openGraph: {
    title: "Retro – Chat with Your Documents",
    description:
      "Upload your PDFs and chat with them instantly. Summarize, ask questions, and get insights — all in one place.",
    url: "https://retro-ai.vercel.app", // <-- change to your real domain
    siteName: "Retro",
    images: [
      {
        url: "/image.png", // Recommended size: 1200x630
        width: 1200,
        height: 630,
        alt: "Retro – Chat with Your Documents",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retro - Chat with Your Documents",
    description:
      "Upload your PDFs and chat with them instantly. Summarize, ask questions, and get insights powered by AI.",
    creator: "@Devprinze", // your X username
    images: ["/image.png"],
  },
  icons: {
    icon: "/image.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
