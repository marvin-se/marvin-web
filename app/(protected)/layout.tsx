"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Spinner } from "@/components/ui/spinner"; // Importing the Spinner component

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there is no user, redirect to the login page
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // While loading or if there is no user (until redirection happens), show a loading indicator
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  // If there is a user, show the page content
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
