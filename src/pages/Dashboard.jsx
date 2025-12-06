import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { analyticsAPI, tenantAPI } from "../services/api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Loading from "../components/common/Loading";
import RevenueChart from "../components/charts/RevenueChart";
import OrdersChart from "../components/charts/OrdersChart";
import TopCustomersChart from "../components/charts/TopCustomersChart";
import {
  RefreshCw,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { toast } from "react-toastify";
import { subDays, format } from "date-fns";

const Dashboard = () => {
  const { selectedTenant } = useAuth();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  // RESET dashboard when switching stores
  useEffect(() => {
    if (selectedTenant) {
      setOverview(null);
      setRevenueData([]);
      setOrdersData([]);
      setTopCustomers([]);
      fetchDashboardData();
    }
  }, [selectedTenant]);

  // Re-fetch on date-range change
  useEffect(() => {
    if (selectedTenant) {
      fetchDashboardData();
    }
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const tenantId = selectedTenant.id;

      const [overviewRes, revenueRes, ordersRes, customersRes] = await Promise.all([
        analyticsAPI.getOverview(tenantId),
        analyticsAPI.getRevenue(tenantId, dateRange.start, dateRange.end),
        analyticsAPI.getOrdersByDate(tenantId, dateRange.start, dateRange.end),
        analyticsAPI.getTopCustomers(tenantId, 5),
      ]);

      setOverview(overviewRes.data || {});
      setRevenueData(revenueRes.data || []);
      setOrdersData(ordersRes.data || []);
      setTopCustomers(customersRes.data || []);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await tenantAPI.sync(selectedTenant.id);
      toast.success("Data synced successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // If no tenant
  if (!selectedTenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Store Selected</h2>
        <p className="text-gray-600">Select or connect a store to continue</p>
      </div>
    );
  }

  if (loading && !overview) return <Loading text="Loading dashboard..." />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of {selectedTenant.store_name}
          </p>
        </div>

        <Button
          onClick={handleSync}
          loading={syncing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Sync Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                ${overview?.revenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {overview?.orders || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">
                {overview?.customers || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">
                {overview?.products || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Revenue Over Time">
          {revenueData.length > 0 ? (
            <RevenueChart data={revenueData} />
          ) : (
            <p className="text-gray-500 text-center py-8">
              No revenue data for selected date range
            </p>
          )}
        </Card>

        <Card title="Orders Over Time">
          {ordersData.length > 0 ? (
            <OrdersChart data={ordersData} />
          ) : (
            <p className="text-gray-500 text-center py-8">
              No order data for selected date range
            </p>
          )}
        </Card>
      </div>

      {/* Top Customers */}
      <Card title="Top 5 Customers by Spend">
        {topCustomers.length > 0 ? (
          <TopCustomersChart data={topCustomers} />
        ) : (
          <p className="text-gray-500 text-center py-8">
            No customers found in this period
          </p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
