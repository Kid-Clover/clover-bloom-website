import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, ShoppingBag, Megaphone, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const SECTIONS = [
  { to: "/admin/events" as const, label: "Events", icon: Calendar, description: "Manage upcoming markets and pop-ups" },
  { to: "/admin/products" as const, label: "Products", icon: ShoppingBag, description: "Edit tea listings, pricing, and availability" },
  { to: "/admin/campaigns" as const, label: "Campaigns", icon: Megaphone, description: "Create and track marketing campaigns" },
  { to: "/admin/landing-pages" as const, label: "Landing Pages", icon: FileText, description: "Build custom thank-you and campaign pages" },
];

function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Welcome back. What would you like to manage?</p>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {SECTIONS.map(({ to, label, icon: Icon, description }) => (
          <Link
            key={to}
            to={to}
            className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <Icon size={20} className="text-gray-500 mb-3" />
            <p className="font-medium text-gray-900 mb-1">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
