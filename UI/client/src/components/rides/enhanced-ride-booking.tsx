import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Users, MapPin, Car, Zap, Bus, Train, Wallet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const rideBookingSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required"),
  destination: z.string().min(1, "Destination is required"),
  rideType: z.enum(["taxi", "shared", "shuttle", "e_rickshaw"]),
  bookingType: z.enum(["instant", "scheduled"]),
  scheduledTime: z.string().optional(),
  poolingEnabled: z.boolean().default(false),
  maxWaitTime: z.number().min(5).max(30).default(10),
  paymentMethod: z.enum(["wallet", "card", "upi", "metro_card"]),
  estimatedCost: z.string(),
});

type RideBookingForm = z.infer<typeof rideBookingSchema>;

interface EnhancedRideBookingProps {
  parkingBookingId?: number;
  defaultPickup?: string;
}

export function EnhancedRideBooking({ parkingBookingId, defaultPickup }: EnhancedRideBookingProps) {
  const [selectedRideType, setSelectedRideType] = useState<string>("shared");
  const [bookingType, setBookingType] = useState<"instant" | "scheduled">("instant");
  const [showPoolingOptions, setShowPoolingOptions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RideBookingForm>({
    resolver: zodResolver(rideBookingSchema),
    defaultValues: {
      pickupLocation: defaultPickup || "",
      destination: "",
      rideType: "shared",
      bookingType: "instant",
      poolingEnabled: false,
      maxWaitTime: 10,
      paymentMethod: "wallet",
      estimatedCost: "0",
    },
  });

  // Fetch user ride preferences
  const { data: preferences } = useQuery({
    queryKey: ["/api/users/1/ride-preferences"],
  });

  // Fetch public transport schedules
  const { data: transportSchedules } = useQuery({
    queryKey: ["/api/transport/schedules"],
  });

  // Search for pooling opportunities
  const { data: poolingRides, refetch: searchPooling } = useQuery({
    queryKey: ["/api/rides/pooling/search"],
    enabled: false,
  });

  const createRideMutation = useMutation({
    mutationFn: (data: RideBookingForm) => apiRequest("/api/rides", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        parkingBookingId,
        userId: 1,
      }),
    }),
    onSuccess: () => {
      toast({
        title: "Ride Booked Successfully",
        description: "Your ride has been confirmed. Driver details will be shared shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to book ride. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Apply user preferences when loaded
  useEffect(() => {
    if (preferences) {
      form.setValue("rideType", preferences.preferredRideType || "shared");
      form.setValue("maxWaitTime", preferences.maxWaitTime || 10);
      form.setValue("poolingEnabled", preferences.poolingPreference || false);
      form.setValue("paymentMethod", preferences.preferredPaymentMethod || "wallet");
    }
  }, [preferences, form]);

  // Calculate estimated cost based on ride type and distance
  const calculateCost = (rideType: string, distance: number = 5) => {
    const rates = {
      taxi: 15,
      shared: 8,
      shuttle: 5,
      e_rickshaw: 12,
    };
    const baseFare = rates[rideType as keyof typeof rates] || 10;
    const cost = baseFare * distance;
    return cost.toFixed(0);
  };

  const handleRideTypeChange = (type: string) => {
    setSelectedRideType(type);
    form.setValue("rideType", type as any);
    const estimatedCost = calculateCost(type);
    form.setValue("estimatedCost", estimatedCost);
    
    // Show pooling options for shared rides
    setShowPoolingOptions(type === "shared" || type === "shuttle");
  };

  const onSubmit = (data: RideBookingForm) => {
    createRideMutation.mutate(data);
  };

  const searchForPooling = () => {
    const pickup = form.getValues("pickupLocation");
    const destination = form.getValues("destination");
    const scheduledTime = form.getValues("scheduledTime");

    if (pickup && destination) {
      searchPooling();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Book Last-Mile Ride
          </CardTitle>
          <CardDescription>
            Choose from multiple transport options for your journey
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="booking">Book Ride</TabsTrigger>
          <TabsTrigger value="transport">Public Transport</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="booking" className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Journey Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickup"
                      placeholder="Enter pickup location"
                      className="pl-10"
                      {...form.register("pickupLocation")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Where to?"
                      className="pl-10"
                      {...form.register("destination")}
                    />
                  </div>
                </div>

                {/* Booking Type */}
                <div className="space-y-2">
                  <Label>When do you need the ride?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={bookingType === "instant" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        setBookingType("instant");
                        form.setValue("bookingType", "instant");
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Now
                    </Button>
                    <Button
                      type="button"
                      variant={bookingType === "scheduled" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        setBookingType("scheduled");
                        form.setValue("bookingType", "scheduled");
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>

                {bookingType === "scheduled" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="scheduledTime"
                        type="datetime-local"
                        className="pl-10"
                        {...form.register("scheduledTime")}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ride Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Your Ride</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "taxi", label: "Taxi", icon: Car, price: "₹75", time: "5 min" },
                    { id: "shared", label: "Shared", icon: Users, price: "₹40", time: "8 min" },
                    { id: "shuttle", label: "Shuttle", icon: Bus, price: "₹25", time: "12 min" },
                    { id: "e_rickshaw", label: "E-Rickshaw", icon: Zap, price: "₹60", time: "7 min" },
                  ].map((ride) => (
                    <Card
                      key={ride.id}
                      className={`cursor-pointer border-2 transition-colors ${
                        selectedRideType === ride.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => handleRideTypeChange(ride.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <ride.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">{ride.label}</p>
                        <p className="text-sm text-muted-foreground">{ride.price}</p>
                        <p className="text-xs text-muted-foreground">{ride.time}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pooling Options */}
            {showPoolingOptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Pooling Options
                  </CardTitle>
                  <CardDescription>
                    Share your ride to save money and reduce traffic
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Enable Ride Pooling</Label>
                      <p className="text-sm text-muted-foreground">
                        Save up to 40% by sharing with others
                      </p>
                    </div>
                    <Switch
                      checked={form.watch("poolingEnabled")}
                      onCheckedChange={(checked) => form.setValue("poolingEnabled", checked)}
                    />
                  </div>

                  {form.watch("poolingEnabled") && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Maximum Wait Time</Label>
                        <Select
                          value={form.watch("maxWaitTime")?.toString()}
                          onValueChange={(value) => form.setValue("maxWaitTime", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="button" variant="outline" onClick={searchForPooling}>
                        <Users className="w-4 h-4 mr-2" />
                        Find Pool Partners
                      </Button>

                      {poolingRides && poolingRides.length > 0 && (
                        <div className="space-y-2">
                          <Label>Available Pool Rides</Label>
                          <div className="space-y-2">
                            {poolingRides.map((ride: any) => (
                              <Card key={ride.id} className="p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{ride.pickupLocation} → {ride.destination}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(ride.scheduledTime).toLocaleTimeString()}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">₹{ride.estimatedCost}</Badge>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.watch("paymentMethod")}
                  onValueChange={(value) => form.setValue("paymentMethod", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wallet">Digital Wallet</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="metro_card">Metro Card</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Estimated Cost</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{form.watch("estimatedCost")}
                  </span>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRideMutation.isPending}
                >
                  {createRideMutation.isPending ? "Booking..." : "Book Ride"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Train className="w-5 h-5" />
                Public Transport Schedules
              </CardTitle>
              <CardDescription>
                Real-time metro and bus schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transportSchedules && transportSchedules.length > 0 ? (
                <div className="space-y-4">
                  {transportSchedules.map((schedule: any) => (
                    <Card key={schedule.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {schedule.transportType === "metro" ? (
                              <Train className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Bus className="w-4 h-4 text-green-500" />
                            )}
                            <span className="font-medium">{schedule.routeName}</span>
                            {schedule.routeNumber && (
                              <Badge variant="outline">{schedule.routeNumber}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {schedule.fromStation} → {schedule.toStation}
                          </p>
                          <p className="text-sm">
                            Departure: <span className="font-medium">{schedule.departureTime}</span>
                            {" • "}
                            Every {schedule.frequency} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{schedule.fare}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.arrivalTime}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No transport schedules available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Ride Preferences
              </CardTitle>
              <CardDescription>
                Set your default preferences for faster booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preferences ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Ride Type</Label>
                      <p className="text-sm capitalize">{preferences.preferredRideType}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Wait Time</Label>
                      <p className="text-sm">{preferences.maxWaitTime} minutes</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Pooling Preference</Label>
                      <p className="text-sm">{preferences.poolingPreference ? "Enabled" : "Disabled"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <p className="text-sm capitalize">{preferences.preferredPaymentMethod.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Frequent Destinations</Label>
                    <div className="flex flex-wrap gap-2">
                      {preferences.frequentDestinations?.map((dest: string, index: number) => (
                        <Badge key={index} variant="secondary">{dest}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No preferences set
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}