import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from "@/lib/queryClient";
import { format } from 'date-fns';
import { Globe, Clock, BarChart2, Activity, Users, Link2, Server, Smartphone, Laptop } from 'lucide-react';
import { extractDomain } from '@/lib/utils';

// Analytics dashboard type definitions
interface AnalyticsData {
  summary: {
    totalRequests: number;
    uniqueUrls: number;
    uniqueVisitors: number;
    averageResponseTime: number;
    successRate: number;
  };
  dailyStats: Array<{
    date: string;
    totalRequests: number;
    uniqueUrls: number;
    uniqueVisitors: number;
    averageResponseTime: number;
    successRate: number;
    mobileRequests: number;
    desktopRequests: number;
  }>;
  topWebsites: Array<{
    url: string;
    count: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
  };
}

const CHART_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#3F51B5', '#00BCD4'];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<string>('30');
  
  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['/api/analytics', timeRange],
    queryFn: getQueryFn<AnalyticsData>({ on401: 'returnNull' }),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Server className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Could not load analytics data</h3>
            <p className="text-gray-600 mb-4">There was an error loading the analytics dashboard.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <BarChart2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No analytics data available</h3>
            <p className="text-gray-600 mb-4">Start using the proxy to collect analytics data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format data for charts
  const dailyChartData = analyticsData.dailyStats.map(stat => ({
    date: format(new Date(stat.date), 'MMM dd'),
    Requests: stat.totalRequests,
    'Unique URLs': stat.uniqueUrls,
    'Unique Visitors': stat.uniqueVisitors
  }));
  
  const performanceData = analyticsData.dailyStats.map(stat => ({
    date: format(new Date(stat.date), 'MMM dd'),
    'Response Time (ms)': stat.averageResponseTime,
    'Success Rate (%)': stat.successRate,
  }));
  
  const deviceData = [
    { name: 'Mobile', value: analyticsData.deviceBreakdown.mobile },
    { name: 'Desktop', value: analyticsData.deviceBreakdown.desktop }
  ];
  
  const topWebsitesData = analyticsData.topWebsites.map(site => ({
    name: extractDomain(site.url),
    value: site.count
  }));
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Monitor your proxy usage and performance metrics</p>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="30" onValueChange={setTimeRange} value={timeRange}>
          <TabsList>
            <TabsTrigger value="7">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90">Last 90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <h3 className="text-2xl font-bold">{analyticsData.summary.totalRequests.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Unique URLs</p>
                <h3 className="text-2xl font-bold">{analyticsData.summary.uniqueUrls.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Link2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Unique Visitors</p>
                <h3 className="text-2xl font-bold">{analyticsData.summary.uniqueVisitors.toLocaleString()}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <h3 className="text-2xl font-bold">{analyticsData.summary.averageResponseTime} ms</h3>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <h3 className="text-2xl font-bold">{analyticsData.summary.successRate}%</h3>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>Proxy requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Requests" fill="#2196F3" />
                  <Bar dataKey="Unique URLs" fill="#4CAF50" />
                  <Bar dataKey="Unique Visitors" fill="#FF9800" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Response times and success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#2196F3" />
                  <YAxis yAxisId="right" orientation="right" stroke="#4CAF50" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Response Time (ms)" fill="#2196F3" />
                  <Bar yAxisId="right" dataKey="Success Rate (%)" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Mobile vs. desktop usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {deviceData[0].value === 0 && deviceData[1].value === 0 ? (
                <div className="text-center">
                  <p className="text-gray-500">No device data available yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} requests`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center">
                <div className="mr-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Mobile</p>
                  <p className="text-lg font-bold">{analyticsData.deviceBreakdown.mobile.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-2">
                  <Laptop className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Desktop</p>
                  <p className="text-lg font-bold">{analyticsData.deviceBreakdown.desktop.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Websites</CardTitle>
            <CardDescription>Most frequently accessed via proxy</CardDescription>
          </CardHeader>
          <CardContent>
            {topWebsitesData.length > 0 ? (
              <div className="space-y-4">
                {topWebsitesData.map((site, index) => (
                  <div key={index} className="flex items-center">
                    <div className="mr-2 font-bold text-gray-500">{index + 1}.</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{site.name}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, (site.value / topWebsitesData[0].value) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-medium">{site.value} requests</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-500">No website data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}