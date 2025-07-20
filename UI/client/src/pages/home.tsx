import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchForm from "@/components/parking/search-form";
import { Link } from "wouter";
import { MapPin, Car, QrCode, History, Wifi, Clock, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="pt-16 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Smart Parking & Last-Mile Transportation
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Find parking spots near metro stations and book last-mile rides with AI-powered route optimization
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            <Link href="/qr-scanner">
              <Button variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 text-white hover:bg-opacity-20 h-16 flex flex-col">
                <QrCode className="w-6 h-6 mb-1" />
                <span className="text-sm">Scan QR</span>
              </Button>
            </Link>
            <Button variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 text-white hover:bg-opacity-20 h-16 flex flex-col">
              <Car className="w-6 h-6 mb-1" />
              <span className="text-sm">Book Ride</span>
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 text-white hover:bg-opacity-20 h-16 flex flex-col">
                <History className="w-6 h-6 mb-1" />
                <span className="text-sm">My Bookings</span>
              </Button>
            </Link>
            <Button variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 text-white hover:bg-opacity-20 h-16 flex flex-col">
              <Wifi className="w-6 h-6 mb-1" />
              <span className="text-sm">Offline Mode</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Smart Park & Ride?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of urban mobility with our AI-powered parking and transportation platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Availability</h3>
                <p className="text-gray-600">
                  Live parking spot availability with IoT sensors across all metro stations. Never drive around looking for parking again.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Dynamic Pricing</h3>
                <p className="text-gray-600">
                  Smart pricing based on demand, weather, and traffic conditions. Get the best rates with early bookings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Car className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Last-Mile Connectivity</h3>
                <p className="text-gray-600">
                  Seamless integration with taxis, shared rides, e-rickshaws, and public transport for complete journey planning.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Contactless Entry</h3>
                <p className="text-gray-600">
                  QR code and RFID-based entry system for quick, secure, and contactless parking access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure & Safe</h3>
                <p className="text-gray-600">
                  24/7 security monitoring, covered parking options, and insurance protection for your vehicle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">EV Charging</h3>
                <p className="text-gray-600">
                  Electric vehicle charging stations available at all major parking locations with competitive rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of smart commuters who have revolutionized their daily travel with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Find Parking Now
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
