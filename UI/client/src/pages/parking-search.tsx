import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ParkingCard from "@/components/parking/parking-card";
import { MapPin, Filter, Navigation, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { ParkingStation } from "@shared/schema";

export default function ParkingSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [filterBy, setFilterBy] = useState("all");

  const { data: stations, isLoading } = useQuery<ParkingStation[]>({
    queryKey: ["/api/parking-stations", searchQuery],
    retry: false,
  });

  const filteredStations = stations?.filter(station => {
    if (filterBy === "available" && station.availableSpots < 20) return false;
    if (filterBy === "charging" && !station.amenities.includes("ev_charging")) return false;
    if (filterBy === "covered" && !station.amenities.includes("covered")) return false;
    return true;
  }) || [];

  const sortedStations = [...filteredStations].sort((a, b) => {
    if (sortBy === "price") return parseFloat(a.hourlyRate) - parseFloat(b.hourlyRate);
    if (sortBy === "availability") return b.availableSpots - a.availableSpots;
    return 0; // Default to distance (would need geolocation in real app)
  });

  return (
    <main className="pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Find Parking</h1>
            <Button variant="outline" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              Map View
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by station name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                <SelectItem value="available">Available (20+ spots)</SelectItem>
                <SelectItem value="charging">EV Charging</SelectItem>
                <SelectItem value="covered">Covered Parking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Station List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading parking stations...</span>
              </div>
            ) : sortedStations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No parking stations found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedStations.map((station) => (
                  <ParkingCard key={station.id} station={station} />
                ))}
              </div>
            )}
          </div>

          {/* Map Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-t-lg flex items-center justify-center relative">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                    <p className="text-gray-600">Interactive map</p>
                    <p className="text-sm text-gray-500">Shows parking locations</p>
                  </div>
                  
                  {/* Sample parking markers */}
                  {sortedStations.slice(0, 3).map((station, index) => (
                    <div
                      key={station.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                        index === 0 ? 'top-1/4 left-1/3' :
                        index === 1 ? 'top-2/3 right-1/4' :
                        'top-1/2 left-1/4'
                      }`}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg cursor-pointer hover:scale-110 transition-transform
                        ${station.availableSpots > 50 ? 'bg-green-500' :
                          station.availableSpots > 20 ? 'bg-blue-500' :
                          station.availableSpots > 0 ? 'bg-orange-500' : 'bg-red-500'}
                      `}>
                        {station.availableSpots}
                      </div>
                      <div className="text-xs text-center mt-1 font-medium truncate max-w-20">
                        {station.name.split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Available (20+)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Limited (1-19)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Full</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stations</span>
                    <span className="font-medium">{sortedStations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Spots</span>
                    <span className="font-medium text-green-600">
                      {sortedStations.reduce((sum, station) => sum + station.availableSpots, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Range</span>
                    <span className="font-medium">
                      ₹{Math.min(...sortedStations.map(s => parseFloat(s.hourlyRate)))} - 
                      ₹{Math.max(...sortedStations.map(s => parseFloat(s.hourlyRate)))}/hr
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Amenities */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Popular Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">EV Charging</Badge>
                  <Badge variant="secondary">Covered Parking</Badge>
                  <Badge variant="secondary">24/7 Security</Badge>
                  <Badge variant="secondary">CCTV Monitoring</Badge>
                  <Badge variant="secondary">Bike Parking</Badge>
                  <Badge variant="secondary">Disability Access</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
