import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { getAdminStatus } from "@/lib/admin.server";
import { LayoutDashboard, Calendar, ShoppingBag, Megaphone, FileText, Users, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  loader: async () => {
    const { user, isAdmin } = await getAdminStatus();
    if (!user) throw redirect({ to: "/auth/login", search: { returnTo: "/admin" }, statusCode: 302 });
    return { user, isAdmin };
  },
  component: AdminLayout,
});

const NAV_ITEMS = [
  { to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/events" as const, label: "Events", icon: Calendar },
  { to: "/admin/products" as const, label: "Products", icon: ShoppingBag },
  { to: "/admin/campaigns" as const, label: "Campaigns", icon: Megaphone },
  { to: "/admin/landing-pages" as const, label: "Landing Pages", icon: FileText },
  { to: "/admin/users" as const, label: "Users", icon: Users },
];

const base = "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors";

function AdminLayout() {
  const { user, isAdmin } = Route.useLoaderData();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-medium">{user.email}</span> does not have admin access.
          </p>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="w-56 bg-gray-900 flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Kid Clover</p>
          <p className="text-white font-semibold text-sm">Admin</p>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={exact ? { exact: true } : undefined}
              activeProps={{ className: `${base} bg-gray-700 text-white` }}
              inactiveProps={{ className: `${base} text-gray-400 hover:bg-gray-800 hover:text-white` }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 truncate mb-2">{user.email}</p>
          <Link
            to="/auth/logout"
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={12} />
            Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
