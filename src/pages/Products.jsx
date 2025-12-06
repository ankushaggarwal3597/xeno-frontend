import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productAPI } from "../services/api";
import Card from "../components/common/Card";
import Loading from "../components/common/Loading";
import { Package, DollarSign, Tag, Search } from "lucide-react";
import { toast } from "react-toastify";

const Products = () => {
  const { selectedTenant } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [applySearchTrigger, setApplySearchTrigger] = useState(0);

  // Reset page when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      setCurrentPage(1);
      fetchProducts(1);
    }
  }, [selectedTenant]);

  // Fetch on page change or search trigger
  useEffect(() => {
    if (selectedTenant) {
      fetchProducts(currentPage);
    }
  }, [currentPage, applySearchTrigger]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);

      const response = await productAPI.getAll(
        selectedTenant.id,
        page,
        20,
        searchQuery ? { search: searchQuery } : {}
      );

      setProducts(response.data.products || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    setCurrentPage(1);
    setApplySearchTrigger((n) => n + 1);
  };

  const getStatusBadge = (status) => {
    const map = {
      active: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-200 text-gray-800",
    };

    return map[status] || "bg-gray-100 text-gray-700";
  };

  if (!selectedTenant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Please select a store</p>
      </div>
    );
  }

  if (loading && products.length === 0)
    return <Loading text="Loading products..." />;

  return (
    <div>
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
      </div>

      {/* Search Bar */}
      <Card className="mb-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search product title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button onClick={applySearch} className="btn-primary px-6">
            Search
          </button>
        </div>
      </Card>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0].src}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              {product.title}
            </h3>

            {/* Vendor */}
            {product.vendor && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Tag size={16} />
                {product.vendor}
              </div>
            )}

            {/* Price */}
            {product.variants?.[0] && (
              <div className="flex items-center gap-2 font-semibold text-primary-600">
                <DollarSign size={16} />
                {parseFloat(product.variants[0].price).toFixed(2)}
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                  product.status
                )}`}
              >
                {product.status || "draft"}
              </span>

              <span className="text-sm text-gray-600">
                {product.variants?.length || 0} variant
                {product.variants?.length !== 1 ? "s" : ""}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <Card>
          <div className="py-12 text-center text-gray-500">
            No products found
          </div>
        </Card>
      )}

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex justify-center gap-2 mt-8">
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
    </div>
  );
};

export default Products;
