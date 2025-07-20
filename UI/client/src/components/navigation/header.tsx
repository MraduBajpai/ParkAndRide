import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronDown, Car } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Smart Park & Ride</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`pb-1 transition-colors ${
                  isActive("/") 
                    ? "text-blue-700 border-b-2 border-blue-700" 
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                Home
              </Link>
              <Link
                href="/search"
                className={`pb-1 transition-colors ${
                  isActive("/search") 
                    ? "text-blue-700 border-b-2 border-blue-700" 
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                Parking
              </Link>
              <Link
                href="/dashboard"
                className={`pb-1 transition-colors ${
                  isActive("/dashboard") 
                    ? "text-blue-700 border-b-2 border-blue-700" 
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin"
                className={`pb-1 transition-colors ${
                  isActive("/admin") 
                    ? "text-blue-700 border-b-2 border-blue-700" 
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                Admin
              </Link>
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
                3
              </Badge>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">JD</span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">John Doe</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
