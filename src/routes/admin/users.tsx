import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ShoppingBag, Loader2, X } from "lucide-react";
import {
  adminGetAllUsers, adminGetOrdersForUser,
  type AdminUser, type AdminUserOrder, type AdminUsersPayload,
} from "@/lib/admin/users.server";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/users")({
  loader: async () => adminGetAllUsers(),
  component: AdminUsers,
});

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function Initials({ name, email }: { name: string | null; email: string }) {
  const src = (name ?? email)
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
      {src}
    </div>
  );
}

type OrdersDialogProps = {
  user: AdminUser;
  onClose: () => void;
};

function OrdersDialog({ user, onClose }: OrdersDialogProps) {
  const [orders, setOrders] = useState<AdminUserOrder[] | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    adminGetOrdersForUser({ data: { userId: user.id, email: user.email } })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag size={16} />
            Orders — {user.name ?? user.email}
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading orders from Square…</span>
            </div>
          ) : !orders || orders.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-16">No orders found.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{fmtTime(order.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      {order.refundedAmount >= order.totalMoney.amount && order.refundedAmount > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-orange-50 text-orange-700">
                          Refunded
                        </span>
                      ) : order.refundedAmount > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-orange-50 text-orange-700">
                          Partial refund
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          order.state === "COMPLETED" ? "bg-green-50 text-green-700" :
                          order.state === "CANCELED" ? "bg-red-50 text-red-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {order.state}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        ${(order.totalMoney.amount / 100).toFixed(2)}
                      </span>
                      {order.refundedAmount > 0 && (
                        <span className="text-xs text-orange-600 font-medium">
                          −${(order.refundedAmount / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {order.lineItems.map((item, i) => (
                      <li key={i} className="flex justify-between text-sm text-gray-700">
                        <span>{item.quantity}× {item.name}</span>
                        <span className="text-gray-400">${(item.totalMoney.amount / 100).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-300 font-mono mt-2">{order.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminUsers() {
  const { users, squareOrderCount } = Route.useLoaderData() as AdminUsersPayload;
  const [ordersUser, setOrdersUser] = useState<AdminUser | null>(null);

  const authCount  = users.filter((u: AdminUser) => u.auth0_id).length;
  const emailCount = users.filter((u: AdminUser) => !u.auth0_id).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">Everyone who has joined or logged in</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total users", value: users.length },
          { label: "Auth0 accounts", value: authCount },
          { label: "Email sign-ups only", value: emailCount },
          { label: "Orders (registered users)", value: squareOrderCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Last login</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u: AdminUser) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.picture ? (
                      <img src={u.picture} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <Initials name={u.name} email={u.email} />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 leading-tight">
                        {u.name && u.name !== u.email ? u.name : "—"}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.auth0_id ? (
                      <span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 font-medium">Auth0</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">Email only</span>
                    )}
                    {Boolean(u.is_admin) && (
                      <span className="text-xs bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 flex items-center gap-1 font-medium">
                        <ShieldCheck size={10} />
                        Admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{fmt(u.created_at)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{fmtTime(u.last_login_at)}</td>
                <td className="px-4 py-3">
                  {u.order_count > 0 ? (
                    <button
                      onClick={() => setOrdersUser(u)}
                      className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded px-2 py-1 transition-colors font-medium"
                    >
                      <ShoppingBag size={11} />
                      {u.order_count} order{u.order_count !== 1 ? "s" : ""}
                    </button>
                  ) : (
                    <button
                      onClick={() => setOrdersUser(u)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                    >
                      <ShoppingBag size={11} />
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ordersUser && (
        <OrdersDialog user={ordersUser} onClose={() => setOrdersUser(null)} />
      )}
    </div>
  );
}
