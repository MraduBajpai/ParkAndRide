import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  MapPin, 
  Navigation, 
  Car, 
  Zap, 
  Shield, 
  Clock,
  Users
} from "lucide-react";
import type { ParkingStation } from "@shared/schema";

interface ParkingCardProps {
  station: ParkingStation;
}

export default function ParkingCard({ station }: ParkingCardProps) {
  const getAvailabilityColor = (spots: number) => {
    if (spots > 50) return "text-green-600 bg-green-100";
    if (spots > 20) return "text-blue-600 bg-blue-100";
    if (spots > 0) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getAvailabilityStatus = (spots: number) => {
    if (spots > 20) return "Available";
    if (spots > 0) return "Limited";
    return "Full";
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "ev_charging":
        return <Zap className="w-4 h-4" />;
      case "covered":
        return <Shield className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "24_hour":
        return <Clock className="w-4 h-4" />;
      case "bike_parking":
        return <Car className="w-4 h-4" />;
      case "multi_level":
        return <Users className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const formatAmenityName = (amenity: string) => {
    return amenity
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">{station.address}</p>
            
            {/* Availability Status */}
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  station.availableSpots > 50 ? 'bg-green-500' :
                  station.availableSpots > 20 ? 'bg-blue-500' :
                  station.availableSpots > 0 ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {station.availableSpots} spots available
                </span>
              </div>
              <Badge className={getAvailabilityColor(station.availableSpots)}>
                {getAvailabilityStatus(station.availableSpots)}
              </Badge>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {station.amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs flex items-center space-x-1">
                  {getAmenityIcon(amenity)}
                  <span>{formatAmenityName(amenity)}</span>
                </Badge>
              ))}
              {station.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{station.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-blue-600">
              ₹{parseFloat(station.hourlyRate).toFixed(0)}/hr
            </div>
            <div className="text-sm text-gray-500">Base rate</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link href={`/booking/${station.id}`} className="flex-1">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={station.availableSpots === 0}
            >
              {station.availableSpots > 0 ? "Reserve Now" : "No Spots Available"}
            </Button>
          </Link>
          <Button variant="outline" size="default" className="px-3">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>0.{Math.floor(Math.random() * 9 + 1)} km away</span>
            <span>Updated {Math.floor(Math.random() * 5 + 1)} min ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
