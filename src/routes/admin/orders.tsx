import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { adminGetAllOrders, type AdminOrderRecord } from "@/lib/admin/orders.server";

export const Route = createFileRoute("/admin/orders")({
  loader: async () => adminGetAllOrders(),
  component: AdminOrders,
});

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtMoney(amount: number) {
  return `$${(amount / 100).toFixed(2)}`;
}

function StatusBadge({ order }: { order: AdminOrderRecord }) {
  if (order.isRefunded) {
    return (
      <span className="text-xs px-2 py-0.5 rounded font-medium bg-orange-50 text-orange-700">
        Refunded
      </span>
    );
  }
  if (order.state === "CANCELED") {
    return (
      <span className="text-xs px-2 py-0.5 rounded font-medium bg-red-50 text-red-600">
        Canceled
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded font-medium bg-green-50 text-green-700">
      Completed
    </span>
  );
}

function OrderRow({ order }: { order: AdminOrderRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(order.createdAt)}</td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-900">{order.userEmail}</p>
          {order.userName && order.userName !== order.userEmail && (
            <p className="text-xs text-gray-400">{order.userName}</p>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {order.lineItems.length === 1
            ? order.lineItems[0].name
            : `${order.lineItems.length} items`}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
          {fmtMoney(order.totalMoney.amount)}
        </td>
        <td className="px-4 py-3">
          <StatusBadge order={order} />
        </td>
        <td className="px-4 py-3 text-gray-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan={6} className="px-6 py-3">
            <ul className="space-y-1 mb-2">
              {order.lineItems.map((item, i) => (
                <li key={i} className="flex justify-between text-xs text-gray-600">
                  <span>{item.quantity}× {item.name}</span>
                  <span className="text-gray-400">{fmtMoney(item.totalMoney.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-300 font-mono">{order.id}</p>
          </td>
        </tr>
      )}
    </>
  );
}

function AdminOrders() {
  const orders = Route.useLoaderData() as AdminOrderRecord[];

  const completedCount = orders.filter((o) => !o.isRefunded && o.state !== "CANCELED").length;
  const refundedCount = orders.filter((o) => o.isRefunded).length;
  const totalRevenue = orders
    .filter((o) => !o.isRefunded && o.state !== "CANCELED")
    .reduce((sum, o) => sum + o.totalMoney.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All orders from registered users ·{" "}
            <Link to="/admin/users" className="text-blue-500 hover:underline">
              back to users
            </Link>
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Completed</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-2xl font-bold text-gray-900">{refundedCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Refunded</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Net revenue</p>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => <OrderRow key={order.id} order={order} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
