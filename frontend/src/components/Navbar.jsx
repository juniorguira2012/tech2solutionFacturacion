import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, Package, ArrowLeftRight, ClipboardList, Users, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', icon: <LayoutDashboard size={18} />, href: '/' },
    { name: 'Inventario', icon: <Package size={18} />, href: '/inventario' },
    { name: 'Movimientos', icon: <ArrowLeftRight size={18} />, href: '/movimientos' },
    { name: 'Auditoría', icon: <ClipboardList size={18} />, href: '/auditoria' },
    { name: 'Clientes', icon: <Users size={18} />, href: '/clientes' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[90] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y Nombre */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-brand p-1.5 rounded-lg text-white">
                  <Package size={20} />
                </div>
                <span className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">
                  Tech2Solution
                </span>
              </div>
            </div>

            {/* Menú Desktop (CAMBIADO de md:flex a lg:flex) */}
            <div className="hidden lg:flex items-center space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand hover:bg-slate-50 transition-all"
                >
                  {link.icon}
                  {link.name}
                </a>
              ))}
            </div>

            {/* Botón Hamburguesa (CAMBIADO de md:hidden a lg:hidden) */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleMenu}
                aria-label="Toggle Menu"
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100 focus:outline-none transition-all"
              >
                {isMenuOpen ? (
                  <X size={24} />
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-menu" 
                    aria-hidden="true"
                  >
                    <path d="M4 5h16"></path>
                    <path d="M4 12h16"></path>
                    <path d="M4 19h16"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú Desplegable Móvil (CAMBIADO de md:hidden a lg:hidden) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] hidden lg:hidden flex flex-col bg-white animate-in fade-in duration-200">
          {/* Cabecera del menú móvil */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="bg-brand p-1.5 rounded-lg text-white">
                <Package size={20} />
              </div>
              <span className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">
                Tech2Solution
              </span>
            </div>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Enlaces de navegación */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-600 hover:text-brand hover:bg-slate-50 active:bg-slate-100 transition-all"
              >
                <span className="text-slate-400">{link.icon}</span>
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Tarjeta de Perfil */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-black">
                U
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Usuario Demo</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Administrador</p>
              </div>
            </div>
            <button 
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;