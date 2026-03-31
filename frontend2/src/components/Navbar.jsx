import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Scissors, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/galeria', label: 'Galería' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-rose-100" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-stone-800">
              Ana Varela
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "text-rose-500 bg-rose-50"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild size="sm" variant="outline" className="rounded-full border-stone-200 text-stone-500 hover:bg-stone-50">
              <Link to="/admin"><LayoutDashboard className="w-3.5 h-3.5" /> Administración</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-sm hover:shadow-md hover:from-rose-500 hover:to-pink-600 transition-all">
              <Link to="/reservar">Reservar cita</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-rose-100 px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "text-rose-500 bg-rose-50"
                  : "text-stone-600 hover:bg-stone-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2">
            <Button asChild variant="outline" className="w-full rounded-full border-stone-200 text-stone-500 hover:bg-stone-50">
              <Link to="/admin"><LayoutDashboard className="w-4 h-4" /> Administración</Link>
            </Button>
            <Button asChild className="w-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 border-0">
              <Link to="/reservar">Reservar cita</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
