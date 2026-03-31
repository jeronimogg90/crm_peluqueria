import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Scissors, CreditCard, Users, LayoutDashboard, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { href: '/admin',              icon: CalendarDays, label: 'Citas' },
  { href: '/admin/servicios',    icon: Scissors,     label: 'Servicios' },
  { href: '/admin/facturacion',  icon: CreditCard,   label: 'Facturación' },
  { href: '/admin/clientes',     icon: Users,        label: 'Clientes' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-stone-50 flex">

      {/* ── Sidebar — solo desktop ───────────────────────────────────── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-stone-100 flex-col fixed inset-y-0 left-0 z-40 shadow-sm">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-stone-800 text-sm leading-tight">Ana Varela</p>
              <p className="text-xs text-stone-400">Panel de gestión</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 border border-rose-100"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                )}
              >
                <item.icon className={cn("w-4 h-4", active ? "text-rose-500" : "text-stone-400")} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver web pública
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-60 min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      {/* ── Bottom tab bar — solo móvil ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-100 flex">
        {navItems.map(item => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors",
                active ? "text-rose-500" : "text-stone-400"
              )}
            >
              <item.icon className={cn("w-5 h-5", active ? "text-rose-500" : "text-stone-400")} />
              {item.label}
              {active && <div className="w-1 h-1 rounded-full bg-rose-400" />}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
