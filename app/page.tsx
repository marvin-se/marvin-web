"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const brandColor = "#182C53";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If not loading and a user exists, redirect to the browse page.
    if (!loading && user) {
      router.push("/browse");
    }
  }, [user, loading, router]);

  // While loading or if the user is logged in, don't render the landing page.
  if (loading || user) {
    return null; // Or a loading spinner
  }

  // If not loading and no user, render the landing page.
  return (
    <div className="relative min-h-screen"> 
      {/* BACKGROUND IMAGE */}
      <img
        src="/bg-browse.svg"
        alt="background"
        className="pointer-events-none absolute top-0 left-0 -z-50 w-full h-auto object-top object-contain"
      />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="flex flex-col items-center space-y-4 max-w-3xl">
            
            {/* CampusTrade Ana Başlık Kutusu */}
            <div className="drop-shadow-lg filter">
              {/* TEK KUTU YAPISI: İç içe div yerine tek div ve border kullandık */}
              <div 
                className="px-8 py-4 md:px-12 md:py-6 flex items-center justify-center rounded-full border-[3px]"
                style={{ 
                  backgroundColor: "#FFF5F5", 
                  borderColor: brandColor 
                }}
              >
                <h1 
                  className="text-4xl md:text-6xl font-bold font-sans tracking-wide"
                  style={{ color: brandColor }}
                >
                  CampusTrade
                </h1>
              </div>
            </div>

            {/* Alt Başlık Kutusu */}
            <div className="drop-shadow-md filter mt-2">
               {/* TEK KUTU YAPISI */}
               <div 
                  className="px-6 py-2 md:px-10 md:py-3 flex items-center justify-center rounded-full border-[2px]"
                  style={{ 
                    backgroundColor: "#ffffff",
                    borderColor: `${brandColor}80` // %50 opaklık için hex kodu
                  }}
              >
                <p 
                  className="text-sm md:text-xl font-medium"
                  style={{ color: brandColor }}
                >
                  Your campus marketplace for buying and selling used items
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
          <div className="max-w-4xl w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16" style={{ color: brandColor }}>
              Why CampusTrade?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Feature 1 */}
              <div className="space-y-4">
                <div>
                  <Image    
                    src="/uni-icon.png"
                    alt="University icon"
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: brandColor }}>University-Focused</h3>
                <p className="text-gray-700">
                  Connect only with verified students from your university. Buy and sell within your trusted campus community.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-4">
                <div>
                  <Image    
                    src="/money-icon.png"
                    alt="Money icon"
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: brandColor }}>Save Money</h3>
                <p className="text-gray-700">
                  Find incredible deals on textbooks, electronics, and furniture. Save up to 50% compared to retail prices.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-4">
                <div>
                  <Image    
                    src="/safe-icon.png"
                    alt="Safe icon"
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: brandColor }}>Safe & Secure</h3>
                <p className="text-gray-700">
                  University-verified profiles and direct messaging ensure safe, transparent transactions.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-4">
                <div>
                  <Image    
                    src="/easy-icon.png"
                    alt="Safe icon"
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: brandColor }}>Easy Browsing</h3>
                <p className="text-gray-700">
                  Browse by category, price, and university. Find exactly what you need in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
          <div className="max-w-2xl w-full text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: brandColor }}>
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-700">
              Join students already using CampusTrade to find great deals and connect with their campus community.
            </p>

            <Button
              onClick={() => router.push("/auth/login")}
              size="lg"
              className="px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white"
              style={{ backgroundColor: brandColor }}
            >
              Start Browsing
            </Button>

            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/auth/login?tab=register")}
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
