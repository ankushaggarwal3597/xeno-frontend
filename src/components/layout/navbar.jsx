import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tenantAPI } from '../../services/api';
import { User, LogOut, Store } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, selectedTenant, selectTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    fetchTenants();
  }, []);

  // 🔥 Re-fetch when returning from OAuth callback
  useEffect(() => {
    if (location.search.includes("connected=true")) {
      fetchTenants();
    }
  }, [location.search]);

  const fetchTenants = async () => {
    try {
      const response = await tenantAPI.getAll();
      const list = response.data;
      setTenants(list);

      // Auto-select latest connected store
      if (list.length > 0 && !selectedTenant) {
        selectTenant(list[list.length - 1]); // last tenant = newest
      }

    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              Xeno Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Tenant Selector */}
            {tenants.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Store size={18} />
                  <span className="font-medium">
                    {selectedTenant?.store_name || "Select Store"}
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      {tenants.map((tenant) => (
                        <button
                          key={tenant.id}
                          onClick={() => {
                            selectTenant(tenant);
                            setShowDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                            selectedTenant?.id === tenant.id
                              ? "bg-primary-50 text-primary-600"
                              : ""
                          }`}
                        >
                          <div className="font-medium">{tenant.store_name}</div>
                          <div className="text-sm text-gray-500">
                            {tenant.shop_domain}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User size={18} />
                <span className="font-medium">{user?.name || user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
