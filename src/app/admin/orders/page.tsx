"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  Search,
  Eye,
  X,
} from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { formatLKR } from "@/config/brand.config";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  // Collection modal
  const [collectingPayment, setCollectingPayment] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [collectionNotes, setCollectionNotes] = useState("");

  useEffect(() => {
    let ignore = false;
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setOrders(Array.isArray(data) ? data : []);
          }
        }
      } catch (e) {
        console.error("Failed to load orders", e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchOrders();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          note: `Status updated to ${newStatus} by admin`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleRecordCODCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          action: "record_payment",
          receiptNumber,
          note: collectionNotes || "Cash collected upon doorstep delivery by courier agent.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? data.order : o)));
        setSelectedOrder(data.order);
        setCollectingPayment(false);
        setReceiptNumber("");
        setCollectionNotes("");
      }
    } catch (e) {
      console.error("Failed to record COD payment", e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || o.payment.status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">Orders & Fulfillment</h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage customer orders, inspect immutable delivery snapshots, and record Cash on Delivery collections.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by order #, customer, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-stone-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="placed_cod">Placed (COD)</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-stone-800"
            >
              <option value="ALL">All Payment States</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-500">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-2" />
            <span>Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
            <p>No orders match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Order Number</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">District</th>
                  <th className="py-3 px-4 font-medium">Delivery Fee (Snapshot)</th>
                  <th className="py-3 px-4 font-medium">Total (LKR)</th>
                  <th className="py-3 px-4 font-medium">Payment State</th>
                  <th className="py-3 px-4 font-medium">Order Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-stone-900">{order.customer.fullName}</p>
                      <p className="text-[11px] text-stone-500">{order.customer.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">{order.customer.district}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      {formatLKR(order.pricingSnapshot.deliveryFeeLKR)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {formatLKR(order.pricingSnapshot.totalLKR)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.payment.status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {order.payment.method === "cod" ? (
                          <Banknote className="w-3 h-3" />
                        ) : (
                          <CreditCard className="w-3 h-3" />
                        )}
                        <span>
                          {order.payment.method.toUpperCase()} • {order.payment.status.toUpperCase()}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="text-[11px] font-medium bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-800"
                      >
                        <option value="placed_cod">Placed (COD)</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800">
                  Immutable Order Details
                </span>
                <h2 className="font-serif text-xl font-semibold text-stone-900 mt-0.5">
                  Order {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pricing Snapshot Highlight Box */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-amber-950">
                <span>Locked Pricing Snapshot at Time of Checkout:</span>
                <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded">
                  Immutable Record
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-amber-900">
                <div>
                  <span className="text-[10px] text-amber-700 block">Subtotal</span>
                  <span className="font-semibold">
                    {formatLKR(selectedOrder.pricingSnapshot.merchandiseSubtotalLKR)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block">Delivery Fee</span>
                  <span className="font-semibold">
                    {formatLKR(selectedOrder.pricingSnapshot.deliveryFeeLKR)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block">Discount</span>
                  <span className="font-semibold">
                    {formatLKR(selectedOrder.pricingSnapshot.discountLKR)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block">Final Total</span>
                  <span className="font-bold text-stone-900">
                    {formatLKR(selectedOrder.pricingSnapshot.totalLKR, true)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="text-xs space-y-1 bg-stone-50 p-4 rounded border border-stone-200">
              <p>
                <strong>Customer:</strong> {selectedOrder.customer.fullName} ({selectedOrder.customer.email})
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.customer.phone}
              </p>
              <p>
                <strong>Delivery Address:</strong> {selectedOrder.customer.addressLine1},{" "}
                {selectedOrder.customer.city}, {selectedOrder.customer.district} (
                {selectedOrder.customer.postalCode})
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h3 className="font-serif font-semibold text-stone-900 text-sm">Line Items:</h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded p-2 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-stone-900">{item.productName}</p>
                      <p className="text-[11px] text-stone-500">
                        SKU: {item.sku} • {item.variantName} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-stone-900">
                      {formatLKR(item.lineTotalLKR)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* COD Payment Collection Action */}
            {selectedOrder.payment.method === "cod" && selectedOrder.payment.status === "unpaid" && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-emerald-950 text-xs">
                      Record Cash on Delivery Collection
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Rider has collected LKR {selectedOrder.pricingSnapshot.totalLKR.toLocaleString()} in cash.
                    </p>
                  </div>
                  <button
                    onClick={() => setCollectingPayment(!collectingPayment)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold uppercase tracking-wider"
                  >
                    {collectingPayment ? "Cancel" : "Record Collection"}
                  </button>
                </div>

                {collectingPayment && (
                  <form onSubmit={handleRecordCODCollection} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                        Courier Slip / Official Receipt Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        placeholder="e.g. CR-90214-LK"
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                        Notes / Cashier Reference
                      </label>
                      <input
                        type="text"
                        value={collectionNotes}
                        onChange={(e) => setCollectionNotes(e.target.value)}
                        placeholder="Cash verified by Colombo warehouse coordinator"
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded"
                    >
                      Confirm Payment Collected (Mark Order As Paid)
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Audit History */}
            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
              <h3 className="font-serif font-semibold text-stone-900 text-sm">Status Audit Trail:</h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedOrder.history.map((h, idx) => (
                  <div key={idx} className="p-2 bg-stone-50 rounded text-[11px] text-stone-600">
                    <div className="flex justify-between font-mono text-[10px] text-stone-500">
                      <span>{new Date(h.timestamp).toLocaleString("en-GB")}</span>
                      <span>By: {h.updatedBy}</span>
                    </div>
                    <p className="font-semibold text-stone-800 mt-0.5">{h.status.toUpperCase()}</p>
                    <p>{h.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
