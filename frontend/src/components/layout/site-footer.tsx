import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Shield, Sparkles, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo subtitle="Campus Event Ticketing" />
            <p className="max-w-md text-sm text-slate-500 leading-relaxed">
              EventFlow is the official campus event ticketing and student engagement platform.
              Discover campus fests, technical hackathons, workshops, and sports tournaments in one place.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Shield className="size-4 text-emerald-500" />
              <span>Secure campus session authentication & verified reservations</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link href="/registrations" className="text-slate-600 transition-colors hover:text-indigo-600">
                  My Bookings & Tickets
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Organizer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Categories
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/events?category=Technology" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Technical & Coding
                </Link>
              </li>
              <li>
                <Link href="/events?category=Cultural" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Cultural & Fests
                </Link>
              </li>
              <li>
                <Link href="/events?category=Workshops" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link href="/events?category=Music" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Music & Concerts
                </Link>
              </li>
              <li>
                <Link href="/events?category=Sports" className="text-slate-600 transition-colors hover:text-indigo-600">
                  Sports & Tournaments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row text-xs text-slate-400">
          <p>© {new Date().getFullYear()} EventFlow Ticketing System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Cloud Computing Lab Mini-Project
          </p>
        </div>
      </div>
    </footer>
  );
}
