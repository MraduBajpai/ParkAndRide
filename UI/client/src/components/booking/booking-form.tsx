import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { CreditCard, Wallet, University, Loader2 } from "lucide-react";
import type { ParkingStation } from "@shared/schema";

const bookingSchema = z.object({
  vehiclePlate: z.string().min(1, "Vehicle plate is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  totalCost: z.string(),
  evCharging: z.boolean().default(false),
  smsNotifications: z.boolean().default(true),
  autoExtend: z.boolean().default(false),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  station: ParkingStation;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function BookingForm({ station, onSubmit, isLoading }: BookingFormProps) {
  const [selectedDuration, setSelectedDuration] = useState(8);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehiclePlate: "KA 01 AB 1234",
      vehicleType: "sedan",
      startTime: (() => {
        const now = new Date();
        now.setHours(9, 0, 0, 0);
        return now.toISOString().slice(0, 16);
      })(),
      endTime: (() => {
        const end = new Date();
        end.setHours(17, 0, 0, 0);
        return end.toISOString().slice(0, 16);
      })(),
      evCharging: false,
      smsNotifications: true,
      autoExtend: false,
      paymentMethod: "card",
    },
  });

  const watchedValues = form.watch();
  
  const calculateCost = () => {
    const startTime = new Date(watchedValues.startTime);
    const endTime = new Date(watchedValues.endTime);
    const hours = Math.max(1, Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)));
    
    let baseCost = hours * parseFloat(station.hourlyRate);
    if (watchedValues.evCharging) baseCost += hours * 15; // EV charging surcharge
    
    const platformFee = 10;
    const gst = Math.round((baseCost + platformFee) * 0.18);
    const discount = baseCost > 200 ? 20 : 0; // Early bird discount
    
    return {
      baseCost,
      platformFee,
      gst,
      discount,
      total: baseCost + platformFee + gst - discount,
      hours
    };
  };

  const cost = calculateCost();

  const handleSubmit = (data: BookingFormData) => {
    const bookingData = {
      ...data,
      totalCost: cost.total.toString(),
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    };
    onSubmit(bookingData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Vehicle Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="vehiclePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input placeholder="KA 01 AB 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Parking Duration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Parking Duration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            Duration: {cost.hours} hours • Total: ₹{cost.total}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Options</h3>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="evCharging"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      EV Charging (+₹15/hr)
                    </FormLabel>
                    <FormDescription>
                      Access to electric vehicle charging stations
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smsNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      SMS Notifications
                    </FormLabel>
                    <FormDescription>
                      Get updates about your booking
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoExtend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Auto-extend if metro delayed
                    </FormLabel>
                    <FormDescription>
                      Automatically extend parking during metro delays
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      id="card"
                      value="card"
                      checked={field.value === "card"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="card" className="flex items-center space-x-3 flex-1 cursor-pointer">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span>Credit/Debit Card</span>
                      <span className="ml-auto text-sm text-gray-500">**** 1234</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      id="wallet"
                      value="wallet"
                      checked={field.value === "wallet"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="wallet" className="flex items-center space-x-3 flex-1 cursor-pointer">
                      <Wallet className="w-5 h-5 text-green-600" />
                      <span>Digital Wallet</span>
                      <span className="ml-auto text-sm text-gray-500">₹450 available</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      id="upi"
                      value="upi"
                      checked={field.value === "upi"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="upi" className="flex items-center space-x-3 flex-1 cursor-pointer">
                      <University className="w-5 h-5 text-gray-600" />
                      <span>UPI Payment</span>
                    </label>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Booking Summary */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Parking ({cost.hours} hours)</span>
                <span>₹{cost.baseCost - (watchedValues.evCharging ? cost.hours * 15 : 0)}</span>
              </div>
              {watchedValues.evCharging && (
                <div className="flex justify-between">
                  <span>EV Charging ({cost.hours} hours)</span>
                  <span>₹{cost.hours * 15}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Platform fee</span>
                <span>₹{cost.platformFee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{cost.gst}</span>
              </div>
              {cost.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Early bird discount</span>
                  <span>-₹{cost.discount}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{cost.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Secure Booking - ₹{cost.total}
        </Button>
      </form>
    </Form>
  );
}
