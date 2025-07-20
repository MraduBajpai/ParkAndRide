import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Camera, 
  Image, 
  Keyboard, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Flashlight,
  Navigation,
  Clock,
  Loader2
} from "lucide-react";

interface QRVerificationResult {
  message: string;
  booking: {
    id: number;
    vehiclePlate: string;
    startTime: string;
    endTime: string;
    status: string;
    qrCode: string;
  };
}

export default function QRScanner() {
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<QRVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const verifyQRMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await fetch("/api/qr/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify QR code");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      setError(null);
      toast({
        title: "Entry Approved",
        description: "Welcome! Your parking entry has been verified.",
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      setVerificationResult(null);
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      verifyQRMutation.mutate(manualCode.trim());
    }
  };

  const handleSampleQRScan = () => {
    // Simulate scanning the sample QR code from our mock data
    verifyQRMutation.mutate("PKG000000001");
  };

  return (
    <main className="pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
          <p className="text-gray-600">Scan your parking QR code for contactless entry</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Scanner */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {scanMode === "camera" ? "Camera Scanner" : "Manual Entry"}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={scanMode === "camera" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScanMode("camera")}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Camera
                  </Button>
                  <Button
                    variant={scanMode === "manual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScanMode("manual")}
                  >
                    <Keyboard className="w-4 h-4 mr-1" />
                    Manual
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {scanMode === "camera" ? (
                <div className="space-y-6">
                  {/* Camera Viewfinder */}
                  <div className="relative">
                    <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center relative">
                      <div className="w-32 h-32 border-2 border-white rounded-lg flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-white" />
                      </div>
                      
                      {/* Camera Controls */}
                      <div className="absolute top-4 right-4 space-y-2">
                        <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
                          <Flashlight className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 text-white text-sm flex items-center">
                        <Camera className="w-4 h-4 mr-1" />
                        Auto-detect enabled
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Position QR code within the frame for automatic scanning
                    </p>
                    
                    {/* Demo Button for Testing */}
                    <Button 
                      onClick={handleSampleQRScan}
                      disabled={verifyQRMutation.isPending}
                      className="mb-4"
                    >
                      {verifyQRMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Simulate QR Scan (Demo)
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        From Gallery
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setScanMode("manual")}>
                        <Keyboard className="w-4 h-4 mr-2" />
                        Enter Code
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter QR Code
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your booking QR code"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="text-center text-lg font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: PKG followed by 9 digits (e.g., PKG000000001)
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!manualCode.trim() || verifyQRMutation.isPending}
                    >
                      {verifyQRMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Verify Code
                    </Button>
                  </form>
                  
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => setScanMode("camera")}>
                      <Camera className="w-4 h-4 mr-2" />
                      Switch to Camera
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                {verifyQRMutation.isPending ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Verifying QR code...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Verification Failed</h3>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                ) : verificationResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-700 mb-2">Entry Approved</h3>
                      <p className="text-sm text-green-600">Welcome to the parking facility!</p>
                    </div>

                    {/* Vehicle Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Vehicle Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">License Plate:</span>
                          <span className="font-medium">{verificationResult.booking.vehiclePlate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking ID:</span>
                          <span className="font-medium font-mono">{verificationResult.booking.qrCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {verificationResult.booking.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Time Information */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Parking Session</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Valid From:</span>
                          <span className="font-medium text-blue-900">
                            {new Date(verificationResult.booking.startTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Valid Until:</span>
                          <span className="font-medium text-blue-900">
                            {new Date(verificationResult.booking.endTime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button className="w-full">
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate to Spot
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Clock className="w-4 h-4 mr-2" />
                        Extend Parking
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm text-gray-600">Ready to scan QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                    <span className="text-gray-600">Metro Central B24</span>
                    <span className="text-xs text-gray-500">2 hrs ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                    <span className="text-gray-600">East Plaza A12</span>
                    <span className="text-xs text-gray-500">Yesterday</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                    <span className="text-gray-600">West Junction C05</span>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
