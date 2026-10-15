"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  ShoppingBag,
  Store,
  ArrowRight,
  TrendingUp,
  CreditCard,
  History,
} from "lucide-react";
import { StoreSettings } from "@/types/settings";
import { Order } from "@/types/order";
import { formatLKR } from "@/config/brand.config";

export default function AdminDashboardPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, ordersRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/admin/orders"),
        ]);

        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setSettings(s);
        }

        if (ordersRes.ok) {
          const o = await ordersRes.json();
          setOrders(Array.isArray(o) ? o : []);
        }
      } catch (e) {
        console.error("Dashboard failed to load data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-600 font-medium">Loading store dashboard...</p>
      </div>
    );
  }

  const totalOrders = orders.length;
  const pendingCOD = orders.filter(
    (o) => o.payment.method === "cod" && o.payment.status === "unpaid"
  ).length;
  const totalRevenue = orders
    .filter((o) => o.payment.status === "paid")
    .reduce((sum, o) => sum + (o.pricingSnapshot?.totalLKR || 0), 0);

  const activeDeliveryFee = settings?.delivery.defaultCourierFeeLKR ?? 500;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            VIA Scent • Store Administration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mt-1">
            Franchise Operations Console
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Primary Market: Sri Lanka • Currency: Sri Lankan Rupees (LKR) • Brand: VIA Scent
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings/delivery"
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow-xs"
          >
            <Truck className="w-4 h-4 text-amber-300" />
            <span>Configure Delivery (LKR {activeDeliveryFee})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivery Fee Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Default Courier Fee</span>
            <Truck className="w-5 h-5 text-amber-800" />
          </div>
          <p className="font-serif text-3xl font-bold text-stone-900">
            {formatLKR(activeDeliveryFee)}
          </p>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-emerald-700 font-medium">Islandwide Delivery Active</span>
            <Link
              href="/admin/settings/delivery"
              className="text-amber-800 hover:underline font-semibold"
            >
              Edit Fee →
            </Link>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-5 h-5 text-stone-700" />
          </div>
          <p className="font-serif text-3xl font-bold text-stone-900">{totalOrders}</p>
          <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500">
            <span>Recorded in database</span>
            <Link href="/admin/orders" className="text-stone-900 hover:underline font-semibold">
              Manage Orders →
            </Link>
          </div>
        </div>

        {/* Pending COD Collection */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Pending COD Collection</span>
            <CreditCard className="w-5 h-5 text-amber-700" />
          </div>
          <p className="font-serif text-3xl font-bold text-amber-900">{pendingCOD}</p>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-amber-700 font-medium">Unpaid / Awaiting Courier</span>
            <Link href="/admin/orders" className="text-amber-800 hover:underline font-semibold">
              Collect →
            </Link>
          </div>
        </div>

        {/* Settled Revenue */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Settled Revenue</span>
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {formatLKR(totalRevenue, true)}
          </p>
          <p className="text-[11px] text-stone-500 pt-1">Paid via Card IPG or Confirmed COD</p>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-serif text-lg font-medium text-stone-900">Recent Customer Orders</h2>
              <p className="text-xs text-stone-500">
                Displays customer snapshot, delivery fee used at purchase, and payment status.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-amber-800 hover:underline font-semibold"
            >
              View All ({orders.length}) →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <span>No customer orders recorded yet. Place an order on the storefront to test.</span>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead>
                  <tr className="text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    <th className="py-2.5 font-medium">Order Number</th>
                    <th className="py-2.5 font-medium">Customer</th>
                    <th className="py-2.5 font-medium">District</th>
                    <th className="py-2.5 font-medium">Delivery Fee</th>
                    <th className="py-2.5 font-medium">Total (LKR)</th>
                    <th className="py-2.5 font-medium">Payment</th>
                    <th className="py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50">
                      <td className="py-3 font-mono font-medium text-stone-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3">{order.customer.fullName}</td>
                      <td className="py-3">{order.customer.district}</td>
                      <td className="py-3 font-semibold text-stone-900">
                        {formatLKR(order.pricingSnapshot.deliveryFeeLKR)}
                      </td>
                      <td className="py-3 font-bold text-stone-900">
                        {formatLKR(order.pricingSnapshot.totalLKR)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.payment.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {order.payment.method.toUpperCase()} • {order.payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[10px] text-stone-600 uppercase">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Fast Administrative Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-semibold text-stone-900 border-b border-stone-100 pb-2">
              Operational Navigation
            </h2>
            <div className="space-y-2">
              <Link
                href="/admin/settings/delivery"
                className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-xs text-stone-800"
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-amber-800" />
                  <div>
                    <strong className="block text-stone-900">Delivery Fee (LKR 500)</strong>
                    <span className="text-[11px] text-stone-500">Edit without code changes</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-xs text-stone-800"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-amber-800" />
                  <div>
                    <strong className="block text-stone-900">Products Catalogue</strong>
                    <span className="text-[11px] text-stone-500">Publish, edit, and archive</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-xs text-stone-800"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-800" />
                  <div>
                    <strong className="block text-stone-900">Payments & Policies</strong>
                    <span className="text-[11px] text-stone-500">COD, 7-day return, 6-mo warranty</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/admin/audit"
                className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-xs text-stone-800"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-amber-800" />
                  <div>
                    <strong className="block text-stone-900">Security Audit Logs</strong>
                    <span className="text-[11px] text-stone-500">Track all protected settings edits</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            </div>
          </div>

          {/* Business identity badge */}
          <div className="bg-stone-900 text-amber-100 p-5 rounded-xl border border-stone-800 text-xs space-y-2">
            <span className="text-[10px] uppercase font-mono text-amber-300">Brand Identity Confirmed</span>
            <p className="font-serif text-lg font-semibold text-white">VIA Scent</p>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              Authorized Franchisee Partner for Dr. Scent in Sri Lanka. Centralized configuration module active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
