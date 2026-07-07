import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Settings, BarChart3, ShoppingCart, Box, Users, LayoutDashboard, LogOut, UserCircle, X, Check, Lock, Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventario } from '../context/InventarioContext';

export const Layout = ({ children }) => {
  const [confirmarSalir, setConfirmarSalir] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { usuario, logout } = useAuth();
  const { prestamos, cargarPrestamos } = useInventario();
  const hasAlertedRef = useRef(false);

  const comodatosVencidos = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return prestamos.filter(item => {
      if (item.estado !== 'activo' || !item.fechaLimite) return false;
      const limite = new Date(item.fechaLimite);
      const limiteAjustado = new Date(limite.getFullYear(), limite.getMonth(), limite.getDate());
      limiteAjustado.setHours(0, 0, 0, 0);
      return hoy >= limiteAjustado;
    });
  }, [prestamos]);

  const comodatosVencidosCount = comodatosVencidos.length;

  // Lógica para la alerta sonora
  useEffect(() => {
    if (comodatosVencidosCount > 0 && !hasAlertedRef.current) {
      const playNotification = () => {
        const audio = new Audio('../../public/notificacion.mp3'); // Asegúrate de poner este archivo en la carpeta /public
        audio.play().catch(error => {
          console.warn("El navegador bloqueó el auto-play. Se requiere interacción previa del usuario.", error);
        });
        hasAlertedRef.current = true;
      };
      playNotification();
    }
    if (comodatosVencidosCount === 0) {
      hasAlertedRef.current = false;
    }
  }, [comodatosVencidosCount]);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setConfirmarSalir(false);
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
      <aside className="hidden md:flex w-64 bg-brand text-white flex-col shadow-2xl z-20 shrink-0">
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
        {/* Bloque Inferior: Configuración + Créditos */}
          <div className="p-4 mt-auto border-t border-white/5 pt-6 space-y-3">
          {puedeVer('configuracion') && (
            <NavLink
              to="/configuracion"
              className={({ isActive }) =>
                `flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em] ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-xl shadow-slate-950/20 scale-[1.02]' 
                    : 'hover:bg-white/5 text-white/40 hover:text-white'
                }`
              }
            >
              {/* Contenedor Izquierdo: Icono + Texto */}
              <div className="flex items-center gap-3.5">
                <Settings size={16} className="opacity-80" /> 
                <span>Configuración</span>
              </div>
            </NavLink>
          )}

          {/* Bloque de Créditos y Versión del Sistema */}
          <div className="flex items-center justify-between px-5 pt-2 text-slate-400 font-bold tracking-wider text-[9px] uppercase">
            <span className="opacity-80">Tec2Solution © 2026</span>
            <span className="bg-white/10 border border-white/5 px-2.5 py-0.5 rounded-full text-slate-200 font-mono text-[10px]">
              {`v${import.meta.env.VITE_APP_VERSION || '1.5.2'}`}
            </span>
          </div>
        </div>
      </aside>
      {/* Contenedor de Contenido (Header + Main) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* --- HEADER GLOBAL --- */}
        <header className="w-full bg-brand md:bg-transparent text-white md:text-slate-800 sticky top-0 z-30 px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            
            {/* AGREGADO: 'md:hidden' para que se oculte por completo en tu laptop */}
            <button
              onClick={toggleMobileMenu}
              className="h-9 w-9 bg-white rounded-lg flex items-center justify-center text-brand transition-colors hover:bg-white/20 md:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>

            <div className="md:hidden">
              <p className="text-sm font-black uppercase tracking-tight">Tech2Solution</p>
              <p className="text-[10px] text-white/80 uppercase">{usuario?.nombre || 'Usuario'}</p>
            </div>
          </div>

          {/* Campana de Notificaciones */}
          <div className="relative">
            <div 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative cursor-pointer p-2 hover:bg-white/10 md:hover:bg-slate-100 rounded-xl transition-all group"
            >
              <Bell size={22} className={comodatosVencidosCount > 0 ? "text-amber-400 md:text-amber-500 animate-bounce" : "text-white md:text-slate-400"} />
              {comodatosVencidosCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-brand md:border-white">
                  {comodatosVencidosCount}
                </span>
              )}
            </div>

            {/* Menú Desplegable de Notificaciones */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Préstamos Vencidos</h3>
                    <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{comodatosVencidosCount}</span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {comodatosVencidos.length > 0 ? (
                      comodatosVencidos.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            navigate('/inventario', { state: { tab: 'comodato' } });
                            setShowNotifications(false);
                          }}
                          className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                              <UserCircle size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-slate-800 uppercase truncate">{item.responsable}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                                {item.producto?.nombre || item.herramienta || 'Herramienta'}
                              </p>
                              <p className="text-[8px] font-black text-rose-500 uppercase mt-1">
                                Venció: {new Date(item.fechaLimite).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Check size={24} className="mx-auto text-emerald-500 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Todo al día</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => {
                      navigate('/inventario', { state: { tab: 'comodato' } });
                      setShowNotifications(false);
                    }}
                    className="w-full p-3 bg-slate-50 text-brand text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors border-t border-slate-100"
                  >
                    Ver todo en Comodatos
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 z-30"
              onClick={closeMobileMenu}
            />
            <div className="md:hidden fixed inset-x-0 top-0 mt-16 bg-white shadow-xl z-40 border-b border-slate-200">
              <div className="px-4 py-4 space-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-black uppercase">Navegación</p>
                    <p className="text-[10px] text-slate-500">Elige una sección</p>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X size={18} />
                  </button>
                </div>

                {menuItems.map((item) => (
                (item.id === 'inicio' || puedeVer(item.id)) && (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                          isActive ? 'bg-slate-100 text-brand shadow-sm' : 'hover:bg-slate-100 text-slate-700'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {item.name}
                      </div>
                      {esSoloLectura(item.id) && <Lock size={12} className="opacity-40" />}
                    </NavLink>
                  )
                ))}

                <div className="pt-4 mt-4 border-t border-slate-100">
                  {!confirmarSalir ? (
                    <button
                      onClick={() => setConfirmarSalir(true)}
                      className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-xl animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase transition-all"
                      >
                        <Check size={14} /> Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmarSalir(false)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-3 rounded-xl bg-slate-200 text-slate-600 text-[10px] font-black uppercase transition-all"
                      >
                        <X size={14} /> No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 min-h-screen pt-4 md:pt-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};