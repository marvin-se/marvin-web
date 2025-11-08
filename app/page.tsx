import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/login');
  return null; 
}
