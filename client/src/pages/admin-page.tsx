import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Analytics } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Loader2,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState<number>(7);
  
  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
  } = useQuery<{ dailyAnalytics: Analytics[], bestSellingProducts: Product[] }>({
    queryKey: ["/api/analytics", { days: timeRange }],
  });

  if (isAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prepare data for charts
  const dailyAnalytics = analyticsData?.dailyAnalytics || [];
  const bestSellingProducts = analyticsData?.bestSellingProducts || [];

  // Ensure dates are sorted (oldest to newest)
  const sortedDailyAnalytics = [...dailyAnalytics].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Format date for charts
  const formattedDailyAnalytics = sortedDailyAnalytics.map(day => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Summary calculations
  const totalSales = sortedDailyAnalytics.reduce((sum, day) => sum + day.sales, 0);
  const totalOrders = sortedDailyAnalytics.reduce((sum, day) => sum + day.orders, 0);
  const totalCustomers = sortedDailyAnalytics.reduce((sum, day) => sum + day.customers, 0);
  
  // Calculate growth compared to previous period
  const midpoint = Math.floor(sortedDailyAnalytics.length / 2);
  const recentPeriod = sortedDailyAnalytics.slice(midpoint);
  const previousPeriod = sortedDailyAnalytics.slice(0, midpoint);
  
  const recentSales = recentPeriod.reduce((sum, day) => sum + day.sales, 0);
  const previousSales = previousPeriod.reduce((sum, day) => sum + day.sales, 0);
  const salesGrowth = previousSales ? ((recentSales - previousSales) / previousSales) * 100 : 0;
  
  const recentOrders = recentPeriod.reduce((sum, day) => sum + day.orders, 0);
  const previousOrders = previousPeriod.reduce((sum, day) => sum + day.orders, 0);
  const ordersGrowth = previousOrders ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0;
  
  const recentCustomers = recentPeriod.reduce((sum, day) => sum + day.customers, 0);
  const previousCustomers = previousPeriod.reduce((sum, day) => sum + day.customers, 0);
  const customersGrowth = previousCustomers ? ((recentCustomers - previousCustomers) / previousCustomers) * 100 : 0;

  // Data for pie chart (traffic sources - mock data)
  const trafficSourcesData = [
    { name: 'Direct', value: 35 },
    { name: 'Social Media', value: 28 },
    { name: 'Organic Search', value: 25 },
    { name: 'Referral', value: 12 },
  ];

  // Data for pie chart (customer demographics - mock data)
  const demographicsData = [
    { name: '18-24', value: 30 },
    { name: '25-34', value: 25 },
    { name: '35-44', value: 28 },
    { name: '45+', value: 17 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Time Range Selector */}
      <div className="mb-6">
        <Tabs defaultValue="7" onValueChange={(value) => setTimeRange(parseInt(value))}>
          <TabsList>
            <TabsTrigger value="7" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger value="30" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Last 30 Days
            </TabsTrigger>
            <TabsTrigger value="90" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Last 90 Days
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-blue-800">Total Sales</CardTitle>
                <CardDescription className="text-blue-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Last {timeRange} days
                </CardDescription>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">{formatCurrency(totalSales)}</div>
            <div className={`text-sm flex items-center ${salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {salesGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(salesGrowth).toFixed(1)}% compared to previous period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-green-800">Total Orders</CardTitle>
                <CardDescription className="text-green-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Last {timeRange} days
                </CardDescription>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-1">{totalOrders}</div>
            <div className={`text-sm flex items-center ${ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ordersGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(ordersGrowth).toFixed(1)}% compared to previous period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-purple-800">New Customers</CardTitle>
                <CardDescription className="text-purple-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Last {timeRange} days
                </CardDescription>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">{totalCustomers}</div>
            <div className={`text-sm flex items-center ${customersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {customersGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(customersGrowth).toFixed(1)}% compared to previous period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Sales Overview
          </CardTitle>
          <CardDescription>
            Daily sales and orders for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedDailyAnalytics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  name="Sales ($)"
                  stroke="#3B82F6"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#10B981"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Best Selling Products and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Best Selling Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              Best Selling Products
            </CardTitle>
            <CardDescription>
              Top performing products by sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-center">Reviews</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellingProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden mr-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.description?.substring(0, 30)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.stock > 0 ? (
                        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                          {product.stock} in stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                          Out of stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.rating?.toFixed(1) || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.reviewCount || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Orders by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Category</CardTitle>
            <CardDescription>Distribution of orders across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Electronics', value: 45 },
                    { name: 'Fashion', value: 28 },
                    { name: 'Home', value: 18 },
                    { name: 'Beauty', value: 9 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" name="Orders %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Demographics and Traffic Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Demographics</CardTitle>
            <CardDescription>Age distribution of customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your customers are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSourcesData.map((source, index) => (
                <div key={source.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{source.name}</span>
                    <span className="text-sm font-medium">{source.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${source.value}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
