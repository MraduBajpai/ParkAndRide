import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Car, 
  Users, 
  Bus, 
  Bike,
  Clock, 
  MapPin,
  Navigation,
  Loader2,
  Leaf
} from "lucide-react";

interface RideOption {
  id: string;
  type: "taxi" | "shared" | "shuttle" | "e_rickshaw";
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  price: number;
  estimatedTime: number;
  features: string[];
  available: boolean;
}

const rideOptions: RideOption[] = [
  {
    id: "taxi",
    type: "taxi",
    name: "Taxi",
    icon: Car,
    description: "4 seater • 8 min arrival",
    price: 120,
    estimatedTime: 8,
    features: ["Air Conditioned", "Private ride", "Direct route"],
    available: true,
  },
  {
    id: "shared",
    type: "shared", 
    name: "Shared Ride",
    icon: Users,
    description: "Pool with others • 12 min",
    price: 65,
    estimatedTime: 12,
    features: ["Eco-friendly", "Cost effective", "Meet new people"],
    available: true,
  },
  {
    id: "shuttle",
    type: "shuttle",
    name: "Shuttle Bus",
    icon: Bus,
    description: "Schedule based • 20 min",
    price: 25,
    estimatedTime: 20,
    features: ["Fixed route", "Multiple stops", "Budget friendly"],
    available: true,
  },
  {
    id: "e_rickshaw",
    type: "e_rickshaw",
    name: "E-Rickshaw",
    icon: Bike,
    description: "Eco-friendly • 15 min",
    price: 45,
    estimatedTime: 15,
    features: ["Zero emissions", "Local experience", "3 seater"],
    available: true,
  },
];

export default function RideOptions() {
  const [selectedRide, setSelectedRide] = useState("shared");
  const [pickupLocation, setPickupLocation] = useState("Metro Central Station");
  const [destination, setDestination] = useState("");
  const [schedulingType, setSchedulingType] = useState<"now" | "later">("now");
  const { toast } = useToast();

  const bookRideMutation = useMutation({
    mutationFn: async (rideData: any) => {
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rideData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book ride");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ride Booked!",
        description: "Your ride has been confirmed. Driver will arrive shortly.",
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

  const selectedOption = rideOptions.find(option => option.id === selectedRide);

  const handleBookRide = () => {
    if (!destination.trim()) {
      toast({
        title: "Destination Required",
        description: "Please enter your destination address",
        variant: "destructive",
      });
      return;
    }

    const rideData = {
      userId: 1, // In real app, get from auth
      pickupLocation,
      destination: destination.trim(),
      rideType: selectedOption?.type,
      estimatedCost: selectedOption?.price.toString(),
      scheduledTime: schedulingType === "now" ? new Date().toISOString() : null,
      status: "pending",
    };

    bookRideMutation.mutate(rideData);
  };

  const getSavingsPercentage = (currentPrice: number) => {
    const taxiPrice = rideOptions.find(r => r.type === "taxi")?.price || 120;
    return Math.round(((taxiPrice - currentPrice) / taxiPrice) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Last-Mile Ride</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Journey Details */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-3 w-3 h-3 bg-green-500 rounded-full"></div>
            <Input
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="pl-10"
              placeholder="Pickup location"
            />
          </div>
          <div className="relative">
            <div className="absolute left-3 top-3 w-3 h-3 bg-red-500 rounded-full"></div>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10"
              placeholder="Enter destination address"
            />
          </div>
          <div className="absolute left-6 top-8 w-0.5 h-6 bg-gray-300"></div>
        </div>

        {/* Ride Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Choose Ride Type</h4>
          
          <RadioGroup value={selectedRide} onValueChange={setSelectedRide}>
            {rideOptions.map((option) => {
              const Icon = option.icon;
              const savings = getSavingsPercentage(option.price);
              
              return (
                <div key={option.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label 
                    htmlFor={option.id}
                    className={`flex items-center justify-between flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRide === option.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        selectedRide === option.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{option.name}</span>
                          {option.type === "shared" && <Leaf className="w-4 h-4 text-green-500" />}
                          {option.type === "e_rickshaw" && <Leaf className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                        {selectedRide === option.id && (
                          <div className="text-xs text-blue-600 mt-1">
                            {option.features.join(" • ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{option.price}</div>
                      <div className="text-xs text-gray-500">{option.estimatedTime} min</div>
                      {savings > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Save {savings}%
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Scheduling Options */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">When do you need the ride?</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={schedulingType === "now" ? "default" : "outline"}
              onClick={() => setSchedulingType("now")}
              className="justify-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              Now
            </Button>
            <Button
              variant={schedulingType === "later" ? "default" : "outline"}
              onClick={() => setSchedulingType("later")}
              className="justify-center"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Environmental Impact */}
        {(selectedRide === "shared" || selectedRide === "e_rickshaw") && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Environmental Impact</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">CO₂ saved:</span>
                <span className="font-medium text-green-900">2.3 kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Green points:</span>
                <span className="font-medium text-green-900">+50 points</span>
              </div>
            </div>
          </div>
        )}

        {/* Route Information */}
        {selectedOption && destination && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Route Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">5.2 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated time:</span>
                <span className="font-medium">{selectedOption.estimatedTime} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route type:</span>
                <span className="font-medium">
                  {selectedOption.type === "shuttle" ? "Fixed route" : "Optimal route"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Book Ride Button */}
        <Button 
          onClick={handleBookRide}
          disabled={!destination.trim() || bookRideMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
        >
          {bookRideMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Book {selectedOption?.name} - ₹{selectedOption?.price}
        </Button>

        {/* Alternative Transport */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Alternative Transport</h4>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bus className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Bus Route 42A</div>
                <div className="text-sm text-gray-600">Direct to your destination</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-blue-600">₹15</div>
              <div className="text-xs text-gray-500">25 min</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>Next bus: 8 min</span>
            <span>Moderate crowd</span>
          </div>
          <Button variant="outline" className="w-full mt-2" size="sm">
            View Bus Route
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
