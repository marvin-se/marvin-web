"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CircleUser, Heart, MessageSquare, LogOut, ArrowLeftRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const showAuthButtons = !pathname.startsWith('/auth');
  
  // Dynamically set the logo link based on the current path
  const logoHref = pathname.startsWith('/auth') ? '/' : '/browse';

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200" style={{ backgroundColor: '#F5F6F8' }}>
      <div className="flex h-16 items-center pl-6">
        <div className="mr-4 flex items-center gap-3">
          <Link href={logoHref} className="flex items-center gap-1">
            <div className="relative h-10 w-auto aspect-square"> 
              <Image
                src="/logo.png"
                alt="CampusTrade Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#182C53' }}>
              CampusTrade
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4 pr-4">
          {user && (
            <Link href="/create-listing">
              <Button className="text-white rounded-lg" style={{ backgroundColor: '#72C69B' }}>
                Create Listing
              </Button>
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={`@${user.fullName}`} />
                    <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <CircleUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/purchase-sales">
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    <span>Purchase & Sales</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            showAuthButtons && (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/login?tab=register">
                  <Button className="text-white rounded-lg" style={{ backgroundColor: '#72C69B' }}>Register</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  )
}
