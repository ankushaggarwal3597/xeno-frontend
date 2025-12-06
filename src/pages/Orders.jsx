import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import Card from "../components/common/Card";
import Loading from "../components/common/Loading";
import { Calendar, DollarSign, Package } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "react-toastify";

const Orders = () => {
  const { selectedTenant } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    status: "all",
  });

  const [applyFiltersTrigger, setApplyFiltersTrigger] = useState(0);

  // Reset on tenant change
  useEffect(() => {
    if (selectedTenant) {
      setCurrentPage(1);
      fetchOrders(1);
    }
  }, [selectedTenant]);

  // Fetch when page changes OR filter applied
  useEffect(() => {
    if (selectedTenant) {
      fetchOrders(currentPage);
    }
  }, [currentPage, applyFiltersTrigger]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);

      const response = await orderAPI.getAll(
        selectedTenant.id,
        page,
        20,
        filters
      );

      setOrders(response.data.orders || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (filters.endDate < filters.startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    setCurrentPage(1);
    setApplyFiltersTrigger((n) => n + 1);
  };

  const getStatusBadge = (status) => {
    const colors = {
      paid: "bg-green-100 text-green-800",
      authorized: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-red-100 text-red-800",
      voided: "bg-gray-100 text-gray-800",
      partially_paid: "bg-purple-100 text-purple-800",
    };

    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (!selectedTenant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Please select a store</p>
      </div>
    );
  }

  if (loading && orders.length === 0)
    return <Loading text="Loading orders..." />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders</h1>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input-field"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="authorized">Authorized</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="refunded">Refunded</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="btn-primary w-full py-2 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-primary-600">
                    #{order.order_number}
                  </td>

                  <td className="py-3 px-4">{order.email || "Guest"}</td>

                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {order.created_at_shopify
                        ? format(
                            new Date(order.created_at_shopify),
                            "MMM dd, yyyy"
                          )
                        : "N/A"}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        order.financial_status
                      )}`}
                    >
                      {order.financial_status || "Pending"}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Package size={16} />
                      {order.line_items?.length || 0} items
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold">
                    <div className="flex items-center gap-1 text-gray-800">
                      <DollarSign size={16} />
                      {parseFloat(order.total_price || 0).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No orders found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Orders;
