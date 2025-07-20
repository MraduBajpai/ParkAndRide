import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ParkingSearch from "@/pages/parking-search";
import BookingFlow from "@/pages/booking-flow";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import QRScanner from "@/pages/qr-scanner";
import Header from "@/components/navigation/header";
import MobileNav from "@/components/navigation/mobile-nav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={ParkingSearch} />
      <Route path="/booking/:stationId" component={BookingFlow} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/qr-scanner" component={QRScanner} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Router />
          <MobileNav />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
