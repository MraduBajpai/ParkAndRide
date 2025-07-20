import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingForm from "@/components/booking/booking-form";
import QRDisplay from "@/components/qr/qr-display";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, Car, Clock, CreditCard, Loader2, Users, Bus, Zap } from "lucide-react";
import type { ParkingStation, ParkingBooking } from "@shared/schema";
import { EnhancedRideBooking } from "@/components/rides/enhanced-ride-booking";

export default function BookingFlow() {
  const [, params] = useRoute("/booking/:stationId");
  const [bookingStep, setBookingStep] = useState<"form" | "payment" | "confirmation" | "ride-booking">("form");
  const [completedBooking, setCompletedBooking] = useState<ParkingBooking | null>(null);
  const { toast } = useToast();

  const stationId = parseInt(params?.stationId || "0");

  const { data: station, isLoading: stationLoading } = useQuery<ParkingStation>({
    queryKey: ["/api/parking-stations", stationId],
    enabled: !!stationId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create booking");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCompletedBooking(data);
      setBookingStep("confirmation");
      queryClient.invalidateQueries({ queryKey: ["/api/parking-stations"] });
      toast({
        title: "Booking Confirmed!",
        description: "Your parking spot has been reserved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (stationLoading) {
    return (
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading station details...</span>
          </div>
        </div>
      </main>
    );
  }

  if (!station) {
    return (
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Station Not Found</h2>
              <p className="text-gray-600">The requested parking station could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const handleBookingSubmit = (formData: any) => {
    const bookingData = {
      ...formData,
      userId: 1, // In real app, get from auth
      stationId: station.id,
      status: "confirmed",
      paymentStatus: "paid",
    };
    bookingMutation.mutate(bookingData);
  };

  return (
    <main className="pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                bookingStep === "form" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
              }`}>
                {bookingStep === "form" ? "1" : <CheckCircle className="w-5 h-5" />}
              </div>
              <span className={`font-medium ${bookingStep === "form" ? "text-blue-600" : "text-green-600"}`}>
                Booking Details
              </span>
            </div>
            <div className={`w-16 h-0.5 ${bookingStep === "confirmation" ? "bg-green-600" : "bg-gray-300"}`} />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                bookingStep === "confirmation" ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
              }`}>
                {bookingStep === "confirmation" ? <CheckCircle className="w-5 h-5" /> : "2"}
              </div>
              <span className={`font-medium ${bookingStep === "confirmation" ? "text-green-600" : "text-gray-600"}`}>
                Confirmation
              </span>
            </div>
          </div>
        </div>

        {/* Station Info Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{station.name}</h1>
                  <p className="text-gray-600">{station.address}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">₹{station.hourlyRate}/hr</div>
                <div className="text-sm text-gray-500">
                  {station.availableSpots} spots available
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              {station.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity.replace("_", " ").toUpperCase()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {bookingStep === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm 
                  station={station} 
                  onSubmit={handleBookingSubmit}
                  isLoading={bookingMutation.isPending}
                />
              </CardContent>
            </Card>

            {/* Parking Lot Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Suggested Parking Spot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {/* Parking spot grid visualization */}
                    {Array.from({ length: 50 }, (_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded text-xs flex items-center justify-center text-white font-bold ${
                          i === 25 ? "bg-blue-500" :
                          Math.random() > 0.3 ? "bg-gray-300 text-gray-600" : "bg-red-400"
                        }`}
                      >
                        {i === 25 ? "★" : Math.random() > 0.3 ? "E" : "O"}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Your spot (B-24)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded"></div>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-green-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>15m walk to metro entrance</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Car className="w-4 h-4 mr-2" />
                    <span>EV charging point nearby</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Covered parking with security</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {bookingStep === "confirmation" && completedBooking && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Confirmation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span>Booking Confirmed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Booking ID: #{completedBooking.qrCode}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Vehicle:</span>
                      <span className="font-medium text-green-900">{completedBooking.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Spot:</span>
                      <span className="font-medium text-green-900">Level 2, B-24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Duration:</span>
                      <span className="font-medium text-green-900">
                        {new Date(completedBooking.startTime).toLocaleString()} - 
                        {new Date(completedBooking.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Paid:</span>
                      <span className="font-medium text-green-900">₹{completedBooking.totalCost}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <MapPin className="w-4 h-4 mr-2" />
                    Navigate to Parking Spot
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setBookingStep("ride-booking" as any)}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Book Last-Mile Ride
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Clock className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Arrive within 15 minutes of your booking time</p>
                  <p>• Use the QR code for contactless entry</p>
                  <p>• Park only in your assigned spot</p>
                  <p>• Contact support for any issues</p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <QRDisplay booking={completedBooking} />
          </div>
        )}

        {bookingStep === "ride-booking" && completedBooking && (
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setBookingStep("confirmation")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Booking Details
              </Button>
            </div>

            {/* Enhanced Ride Booking */}
            <EnhancedRideBooking 
              parkingBookingId={completedBooking.id}
              defaultPickup={station?.name}
            />

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/'}
                    className="flex-1"
                  >
                    Back to Home
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex-1"
                  >
                    View All Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
