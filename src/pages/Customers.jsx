import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { Search, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Customers = () => {
  const { selectedTenant } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      setCurrentPage(1); // ⭐ important
      fetchCustomers(1);
    }
  }, [selectedTenant]);

  // Fetch when page changes
  useEffect(() => {
    if (selectedTenant) {
      fetchCustomers(currentPage);
    }
  }, [currentPage]);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll(selectedTenant.id, page);

      setCustomers(response.data.customers || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCustomers(1);
      return;
    }

    try {
      setLoading(true);
      const response = await customerAPI.search(selectedTenant.id, searchQuery);
      setCustomers(response.data);
      setTotalPages(1);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Enter key search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (!selectedTenant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Please select a store</p>
      </div>
    );
  }

  if (loading && customers.length === 0) {
    return <Loading text="Loading customers..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={handleSearch}
            className="btn-primary px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800">
                      {customer.first_name} {customer.last_name}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      {customer.email || 'N/A'}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      {customer.phone || 'N/A'}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {customer.orders_count}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-green-600">
                      ${parseFloat(customer.total_spent || 0).toFixed(2)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    {customer.created_at_shopify
                      ? format(new Date(customer.created_at_shopify), 'MMM dd, yyyy')
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No customers found
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default Customers;
