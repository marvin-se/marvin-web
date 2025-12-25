import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg">CampusTrade</h4>
            <p className="text-sm text-muted-foreground">Your trusted campus marketplace.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link>
            <Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CampusTrade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
