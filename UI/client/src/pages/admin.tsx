import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  BarChart, 
  TrendingUp, 
  AlertTriangle,
  Car,
  Zap,
  DollarSign,
  Activity,
  X
} from "lucide-react";
import type { SystemAlert } from "@shared/schema";

interface AdminStats {
  totalSpots: number;
  occupancyRate: number;
  dailyRevenue: number;
  activeSensors: number;
  activeAlerts: number;
  stations: Array<{
    id: number;
    name: string;
    occupancyRate: string;
  }>;
}

export default function Admin() {
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: alerts } = useQuery<SystemAlert[]>({
    queryKey: ["/api/admin/alerts"],
  });

  const activeAlerts = alerts?.filter(alert => !alert.isResolved) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <main className="pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring and management</p>
          </div>
          <Button>
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spots</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalSpots?.toLocaleString() || "2,847"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.occupancyRate?.toFixed(1) || "78.5"}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-red-600">
                  <Activity className="w-4 h-4 mr-1 inline" />
                  3% from yesterday
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Daily Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.dailyRevenue || 45230)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">8% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sensors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.activeSensors?.toLocaleString() || "2,791"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">56 offline</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Station Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Station Status</CardTitle>
                <Button variant="ghost" size="sm">
                  <Activity className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.stations?.map((station) => (
                  <div key={station.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        parseFloat(station.occupancyRate) > 90 ? 'bg-red-500' :
                        parseFloat(station.occupancyRate) > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{station.name}</h4>
                        <p className="text-sm text-gray-600">Zone A-C • Multiple levels</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {station.occupancyRate}%
                      </div>
                      <div className="text-sm text-gray-600">occupied</div>
                    </div>
                  </div>
                )) || (
                  // Fallback data
                  <>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Metro Central Station</h4>
                          <p className="text-sm text-gray-600">Zone A-C • 456 spots</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">67%</div>
                        <div className="text-sm text-gray-600">occupied</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">East Plaza Hub</h4>
                          <p className="text-sm text-gray-600">Zone D-F • 342 spots</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">89%</div>
                        <div className="text-sm text-gray-600">occupied</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Stations
              </Button>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Alerts</CardTitle>
                <Badge variant="destructive" className="bg-red-100 text-red-700">
                  {activeAlerts.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      <div className="mt-0.5">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.description}</p>
                        <p className="text-xs mt-2 opacity-75">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <Button className="w-full mt-4">
                View Alert Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Occupancy trend chart</p>
                  <p className="text-sm text-gray-500">24-hour view</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Revenue analytics chart</p>
                  <p className="text-sm text-gray-500">Monthly overview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
