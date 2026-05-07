import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Settings, BarChart3, ShoppingCart, Box, Users, LayoutDashboard, LogOut, UserCircle, X, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout = ({ children }) => {
  const [confirmarSalir, setConfirmarSalir] = useState(false);  
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- LÓGICA DE PERMISOS CORREGIDA ---
  const puedeVer = (moduloId) => {
    if (!usuario) return false;
    if (usuario.rol === 'admin') return true;

    try {
      const savedRoles = localStorage.getItem('posfactura_roles_config');
      if (!savedRoles) return true; 

      const rolesConfig = JSON.parse(savedRoles);
      const configDelRol = rolesConfig[usuario.rol];

      // Verificamos si existe el rol y si el módulo NO es 'none'
      // Si es 'view' o 'full', debe devolver TRUE para mostrar el botón
      if (configDelRol && configDelRol.modules) {
        return configDelRol.modules[moduloId] !== 'none';
      }
    } catch (error) {
      console.error("Error leyendo permisos:", error);
    }
    
    return true; // Por defecto mostramos si hay dudas
  };

  // --- LÓGICA PARA SABER SI ES SOLO LECTURA (Opcional, para el icono) ---
  const esSoloLectura = (moduloId) => {
    if (usuario?.rol === 'admin') return false;
    const savedRoles = localStorage.getItem('posfactura_roles_config');
    if (!savedRoles) return false;
    const rolesConfig = JSON.parse(savedRoles);
    return rolesConfig[usuario?.rol]?.modules[moduloId] === 'view';
  };

  const menuItems = [
    { name: 'Inicio', path: '/', icon: <LayoutDashboard size={20} />, id: 'inicio' },
    { name: 'Ventas', path: '/ventas', icon: <ShoppingCart size={20} />, id: 'ventas' },
    { name: 'Inventario', path: '/inventario', icon: <Box size={20} />, id: 'inventario' },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} />, id: 'clientes' },
    { name: 'Usuarios', path: '/usuarios', icon: <UserCircle size={20} />, id: 'configuracion' }, 
    { name: 'Reportes', path: '/reportes', icon: <BarChart3 size={20} />, id: 'reportes' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-brand text-white flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-brand rounded-sm"></div>
            </div>
            <span className="text-2xl font-black tracking-tighter italic ">Tech2Solution</span>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
               <UserCircle size={20} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black truncate uppercase tracking-tight">{usuario?.nombre || 'Usuario'}</p>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">{usuario?.rol}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            (item.id === 'inicio' || puedeVer(item.id)) && (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                    isActive ? 'bg-white text-brand shadow-lg scale-[1.02]' : 'hover:bg-white/10 text-white/70'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </div>
                {/* Pequeño candado si es solo lectura para avisar al cajero */}
                {esSoloLectura(item.id) && <Lock size={12} className="opacity-40" />}
              </NavLink>
            )
          ))}

          <div className="pt-4 mt-4 border-t border-white/5">
            {!confirmarSalir ? (
              <button 
                onClick={() => setConfirmarSalir(true)}
                className="w-full flex items-center justify-start gap-3 py-3 px-4 rounded-xl hover:bg-red-500/10 text-white/50 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 p-2 bg-black/10 rounded-xl">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white text-[9px] font-black uppercase transition-all"
                >
                  <Check size={12} /> Salir
                </button>
                <button
                  onClick={() => setConfirmarSalir(false)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 text-white/60 text-[9px] font-black uppercase transition-all"
                >
                  <X size={12} /> No
                </button>
              </div>
            )}
          </div>
        </nav>
        
        <div className="p-4 mt-auto mb-4 border-t border-white/5 pt-6">
          {puedeVer('configuracion') && (
            <NavLink
              to="/configuracion"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 font-black text-xs uppercase tracking-widest ${
                  isActive ? 'bg-white text-brand shadow-xl' : 'hover:bg-white/10 text-white/50'
                }`
              }
            >
              <Settings size={20} /> Configuración
            </NavLink>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};