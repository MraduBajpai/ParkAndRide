import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  MapPin, 
  Car, 
  CreditCard, 
  Award, 
  TrendingUp,
  Calendar,
  Navigation,
  Download,
  Wifi
} from "lucide-react";
import { Link } from "wouter";
import type { ParkingBooking, User } from "@shared/schema";

export default function Dashboard() {
  const { data: user } = useQuery<Omit<User, 'password'>>({
    queryKey: ["/api/users", 1], // In real app, get from auth
  });

  const { data: bookings } = useQuery<ParkingBooking[]>({
    queryKey: ["/api/users", 1, "bookings"],
  });

  const activeBooking = bookings?.find(b => b.status === "active");
  const upcomingBookings = bookings?.filter(b => 
    b.status === "confirmed" && new Date(b.startTime) > new Date()
  ) || [];
  const recentBookings = bookings?.filter(b => 
    b.status === "completed" || b.status === "cancelled"
  )?.slice(0, 5) || [];

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName || 'User'}!</p>
          </div>
          <Link href="/search">
            <Button>
              <MapPin className="w-4 h-4 mr-2" />
              Book Parking
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Parking */}
            {activeBooking && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Car className="w-5 h-5 text-green-600" />
                      <span>Active Parking</span>
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-700">In Progress</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Metro Central Station</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{activeBooking.vehiclePlate} • Spot B-24</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">
                          {formatDateTime(activeBooking.startTime)} - {formatDateTime(activeBooking.endTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Time Remaining</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">7:45</div>
                        <div className="text-sm text-gray-600">hours remaining</div>
                      </div>
                      <Progress value={78} className="mt-3" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button className="flex-1">
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Extend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming bookings</p>
                    <Link href="/search">
                      <Button className="mt-4">Book Now</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Metro Central Station</h4>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">₹{booking.totalCost}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span><Car className="w-4 h-4 mr-1 inline" />{booking.vehiclePlate}</span>
                          <span><Clock className="w-4 h-4 mr-1 inline" />
                            {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Modify
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  ) : (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            booking.status === "completed" ? "bg-green-100" : "bg-red-100"
                          }`}>
                            <Car className={`w-5 h-5 ${
                              booking.status === "completed" ? "text-green-600" : "text-red-600"
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Metro Central Station</div>
                            <div className="text-sm text-gray-600">
                              {formatDateTime(booking.startTime)} • {booking.status}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">₹{booking.totalCost}</div>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Receipt
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rewards & Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>Rewards & Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {user?.rewardPoints || 1250}
                  </div>
                  <div className="text-sm text-gray-600">Smart Points</div>
                </div>

                <Progress value={75} className="mb-4" />
                <div className="text-center text-xs text-gray-600 mb-4">
                  750 points to Gold status
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Level</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <Award className="w-3 h-3 mr-1" />
                      {user?.membershipLevel || 'Silver'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-medium text-green-600">+180 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">CO₂ Saved</span>
                    <span className="font-medium text-green-600">12.5 kg</span>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  Redeem Points
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">47</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">156h</div>
                      <div className="text-xs text-gray-600">Parked</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">₹3,420</div>
                      <div className="text-xs text-gray-600">Saved</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">23</div>
                      <div className="text-xs text-gray-600">Stations</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">89%</div>
                      <div className="text-xs text-gray-600">On-time</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Offer */}
            <Card className="bg-gradient-to-br from-blue-600 to-green-600 text-white">
              <CardHeader>
                <CardTitle>Smart Pass Monthly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 text-sm mb-4">
                  Unlimited parking at all metro stations
                </p>
                
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">₹1,999</div>
                  <div className="text-sm text-blue-100">per month</div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-300" />
                    <span>Unlimited parking hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-300" />
                    <span>Priority booking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-green-300" />
                    <span>Free ride credits</span>
                  </div>
                </div>

                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>

            {/* Offline Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5" />
                  <span>Offline Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cached data</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Updated
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Offline maps</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Download className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">QR codes</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Stored
                    </Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Sync Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
