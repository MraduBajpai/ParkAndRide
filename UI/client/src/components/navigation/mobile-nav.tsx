import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Car, QrCode, User, LayoutDashboard } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      href: "/search",
      icon: MapPin,
      label: "Parking",
    },
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/qr-scanner",
      icon: QrCode,
      label: "QR Scan",
    },
    {
      href: "/",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                isActive(href)
                  ? "text-blue-700"
                  : "text-gray-500 hover:text-blue-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
