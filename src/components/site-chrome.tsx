import { Link } from "@tanstack/react-router";
import logoStacked from "@/assets/logo-stacked.png";
import logoHorizontal from "@/assets/logo-horizontal.png";
import { useState } from "react";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import type { SessionUser } from "@/lib/session.server";
import { useCart } from "@/context/cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/shop", label: "Shop" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
] as const;

function Avatar({ user }: { user: SessionUser }) {
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return user.picture ? (
    <img
      src={user.picture}
      alt={user.name ?? user.email}
      className="h-9 w-9 rounded-full border-2 border-brown object-cover"
    />
  ) : (
    <div className="h-9 w-9 rounded-full border-2 border-brown bg-clover/20 flex items-center justify-center font-marker text-sm text-brown">
      {initials}
    </div>
  );
}

function DesktopUserWidget({ user }: { user: SessionUser | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer focus:outline-none text-foreground hover:text-primary transition-colors">
        {user ? <Avatar user={user} /> : <User size={24} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="!text-2xl font-marker">
          {user ? (
            <Link to="/auth/logout" className="cursor-pointer w-full">
              Sign out
            </Link>
          ) : (
            <Link to="/auth/login" className="cursor-pointer w-full">
              Login / Sign up
            </Link>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CartIcon({ onClick }: { onClick?: () => void }) {
  const { itemCount } = useCart();
  return (
    <Link
      to="/cart"
      onClick={onClick}
      className="relative flex items-center text-foreground hover:text-primary transition-colors"
      aria-label={`Cart (${itemCount} items)`}
    >
      <ShoppingCart size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-clover text-cream text-xs font-marker flex items-center justify-center leading-none">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

function MobileUserWidget({ user, onClose }: { user: SessionUser | null; onClose: () => void }) {
  if (!user) {
    return (
      <Link
        to="/auth/login"
        onClick={onClose}
        className="font-marker text-2xl text-foreground hover:text-primary flex items-center gap-3"
      >
        <User size={22} />
        Login / Sign up
      </Link>
    );
  }

  return (
    <Link
      to="/auth/logout"
      onClick={onClose}
      className="font-marker text-2xl text-foreground hover:text-primary flex items-center gap-3"
    >
      <Avatar user={user} />
      Sign out
    </Link>
  );
}

export function Header({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover-wiggle" aria-label="Kid Clover home">
          <img src={logoHorizontal} alt="Kid Clover" className="h-10 md:h-12 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-marker text-2xl text-foreground hover:text-primary transition-colors [&.active]:text-primary"
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "active" }}
            >
              {item.label}
            </Link>
          ))}
          <CartIcon />
          <DesktopUserWidget user={user} />
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <CartIcon />
          <button
            className="p-2 text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border/60 bg-cream px-5 py-4 flex flex-col gap-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="font-marker text-2xl text-foreground hover:text-primary [&.active]:text-primary"
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "active" }}
            >
              {item.label}
            </Link>
          ))}
          <MobileUserWidget user={user} onClose={() => setOpen(false)} />
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-cream">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-12 grid gap-8 md:grid-cols-3 items-start">
        <div>
          <img src={logoStacked} alt="Kid Clover" className="h-20 w-auto mb-4" />
          <p className="text-sm text-muted-foreground max-w-xs">
            Connecting kids to the magic of plants, one tiny cup at a time.
          </p>
        </div>
        <div>
          <h4 className="font-marker text-2xl text-primary mb-3">Wander</h4>
          <ul className="space-y-2 text-sm">
            {navItems.map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:text-primary">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-marker text-2xl text-primary mb-3">Say hi</h4>
          <p className="text-sm text-muted-foreground">
            <a href="mailto:lesley@drinkkidclover.com" className="hover:text-primary">
              lesley@drinkkidclover.com
            </a>
            <br />
            Find us at the farmers market every Saturday.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kid Clover · Made with herbs & love
      </div>
    </footer>
  );
}
