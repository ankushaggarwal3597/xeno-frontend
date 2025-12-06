import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { tenantAPI } from "../services/api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { Store, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const Settings = () => {
  const { user, selectedTenant, selectTenant } = useAuth();
  const [tenants, setTenants] = useState([]);

  const location = useLocation();

  // -------------------------------
  // FETCH TENANTS
  // -------------------------------
  const fetchTenants = useCallback(async () => {
    try {
      const response = await tenantAPI.getAll();
      const list = response.data || [];
      setTenants(list);

      // Auto-select newest
      if (list.length > 0 && !selectedTenant) {
        selectTenant(list[list.length - 1]);
      }
    } catch (error) {
      toast.error("Failed to load stores");
    }
  }, [selectedTenant, selectTenant]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // Refresh after OAuth success
  useEffect(() => {
    if (location.search.includes("connected=true")) {
      toast.success("Shopify store connected successfully!");
      fetchTenants();
    }
  }, [location.search, fetchTenants]);

  // -------------------------------
  // START SHOPIFY OAUTH
  // -------------------------------
  const connectStore = () => {
    const shop = prompt(
      "Enter Shopify shop domain:\nexample: mystore.myshopify.com"
    );

    if (!shop || !shop.endsWith(".myshopify.com")) {
      toast.error("Invalid shop domain");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in");
      return;
    }

    const API_URL = process.env.REACT_APP_API_URL;

    // ⭐ Attach user_id so backend can link the store to correct user
    window.location.href =
      `${API_URL}/shopify/auth?shop=${shop}&user_id=${user.id}`;
  };

  // -------------------------------
  // DELETE TENANT
  // -------------------------------
  const handleDeleteTenant = async (id) => {
    if (!window.confirm("Are you sure you want to remove this store?")) return;

    try {
      await tenantAPI.delete(id);
      toast.success("Store removed successfully");
      setTenants((prev) => prev.filter((t) => t.id !== id));

      if (selectedTenant?.id === id) {
        selectTenant(null);
      }
    } catch (error) {
      toast.error("Failed to remove store");
    }
  };

  // -------------------------------
  // SYNC TENANT DATA
  // -------------------------------
  const handleSyncTenant = async (id) => {
    try {
      toast.info("Syncing data...");
      await tenantAPI.sync(id);
      toast.success("Data synced successfully!");
      fetchTenants();
    } catch (error) {
      toast.error("Sync failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your Shopify store connections
          </p>
        </div>

        <Button onClick={connectStore} className="flex items-center gap-2">
          <Plus size={18} />
          Connect Shopify Store
        </Button>
      </div>

      {/* Store List */}
      <div className="space-y-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Store className="text-primary-600" size={24} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {tenant.store_name}
                  </h3>
                  <p className="text-sm text-gray-600">{tenant.shop_domain}</p>

                  {tenant.last_sync_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last synced:{" "}
                      {new Date(tenant.last_sync_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSyncTenant(tenant.id)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <RefreshCw size={20} />
                </button>

                <button
                  onClick={() => handleDeleteTenant(tenant.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tenant.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {tenant.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </Card>
        ))}

        {/* Empty State */}
        {tenants.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Store size={48} className="mx-auto text-gray-400 mb-4" />

              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No stores connected
              </h3>

              <p className="text-gray-600 mb-4">
                Connect your first Shopify store to get started
              </p>

              <Button onClick={connectStore}>
                <Plus size={18} className="inline mr-2" />
                Connect Shopify Store
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
