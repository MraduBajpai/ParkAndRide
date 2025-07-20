import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Share, 
  Wifi, 
  Clock,
  MapPin,
  Car
} from "lucide-react";
import type { ParkingBooking } from "@shared/schema";

interface QRDisplayProps {
  booking: ParkingBooking;
}

export default function QRDisplay({ booking }: QRDisplayProps) {
  const generateQRPattern = (code: string) => {
    // Generate a simple QR-like pattern based on the booking code
    const size = 20;
    const pattern = [];
    
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Create a pseudo-random pattern based on the booking code and position
        const seed = code.charCodeAt(i % code.length) + i * j;
        const isBlack = (seed % 3) !== 0;
        row.push(isBlack);
      }
      pattern.push(row);
    }
    
    return pattern;
  };

  const qrPattern = generateQRPattern(booking.qrCode || "PKG000000001");

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveToWallet = () => {
    // In a real app, this would integrate with Apple Wallet/Google Pay
    alert("QR code saved to wallet (Demo feature)");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Parking Booking - ${booking.qrCode}`,
          text: `My parking booking at Metro Central Station`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(booking.qrCode || "");
      alert("Booking code copied to clipboard");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Your Parking Pass</CardTitle>
      </CardHeader>
      <CardContent>
        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center">
            <div className="w-40 h-40 grid grid-cols-20 gap-0">
              {qrPattern.map((row, i) => 
                row.map((isBlack, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`w-full h-full ${isBlack ? 'bg-black' : 'bg-white'}`}
                    style={{ aspectRatio: '1' }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 text-center mb-6">
          <div>
            <Badge variant="outline" className="text-sm font-mono">
              {booking.qrCode}
            </Badge>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Metro Central Station - Spot B24</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Car className="w-4 h-4" />
              <span>{booking.vehiclePlate}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>
                {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={handleSaveToWallet} className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Save to Wallet
          </Button>
          <Button variant="outline" onClick={handleShare} className="w-full">
            <Share className="w-4 h-4 mr-2" />
            Share QR Code
          </Button>
        </div>

        {/* Offline Indicator */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">Works offline</span>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Entry Instructions</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Show this QR code at the parking entrance</p>
            <p>• Keep your phone brightness high for better scanning</p>
            <p>• The code works even when offline</p>
            <p>• Contact support if you have any issues</p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" className="text-blue-600">
            Need Help? Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
