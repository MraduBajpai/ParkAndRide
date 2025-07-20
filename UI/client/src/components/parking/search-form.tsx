import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Clock, Search, Navigation } from "lucide-react";

export default function SearchForm() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    now.setHours(9, 0, 0, 0); // Default to 9 AM
    return now.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState("2");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct search URL with parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedDate) params.set("date", selectedDate);
    if (duration) params.set("duration", duration);
    
    setLocation(`/search?${params.toString()}`);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSearchQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setSearchQuery("Current Location (GPS unavailable)");
        }
      );
    } else {
      setSearchQuery("Current Location (GPS not supported)");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Location Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter metro station or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 h-auto"
                onClick={handleUseCurrentLocation}
              >
                <Navigation className="w-4 h-4 text-gray-400 hover:text-blue-600" />
              </Button>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date & Time
            </label>
            <Input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Duration
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours (Full day)</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="168">Weekly</SelectItem>
                <SelectItem value="720">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg">
          <Search className="w-5 h-5 mr-2" />
          Find Parking Spots
        </Button>
      </form>

      {/* Quick Location Suggestions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Popular locations:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Metro Central Station",
            "East Plaza Hub", 
            "West Junction Terminal",
            "Airport Metro",
            "City Center"
          ].map((location) => (
            <Button
              key={location}
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setSearchQuery(location)}
              className="text-xs"
            >
              {location}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
