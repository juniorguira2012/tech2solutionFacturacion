import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Users, Box, AlertTriangle, ArrowRight, TrendingUp, Clock, Star, PieChart } from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { useClientes } from '../context/ClienteContext';
import { useVentas } from '../context/VentasContext';

const Home = () => {
  const navigate = useNavigate();
  const { productos, categorias } = useInventario();
  const { usuario } = useAuth();
  const { clientes } = useClientes();
  const { historialVentas } = useVentas();

  // Lógica de permisos para mostrar solo lo que el usuario puede acceder
  const puedeVer = (moduloId) => {
    if (!usuario) return false;
    if (usuario.rol === 'admin') return true;
    try {
      const savedRoles = localStorage.getItem('posfactura_roles_config');
      if (!savedRoles) return true;
      const rolesConfig = JSON.parse(savedRoles);
      const configDelRol = rolesConfig[usuario.rol];
      return configDelRol?.modules?.[moduloId] !== 'none';
    } catch { return true; }
  };

  // --- CÁLCULOS ANALÍTICOS ---

  // Filtramos las ventas según el rol: si no es admin, solo ve las suyas
  const ventasVisibles = useMemo(() => {
    if (!usuario) return [];
    if (usuario.rol === 'admin') return historialVentas;
    return historialVentas.filter(v => String(v.vendedorId) === String(usuario.id));
  }, [historialVentas, usuario]);

  // 🌟 CORRECCIÓN 1: Forzar Number() en el total global
  const totalVentas = useMemo(() => 
    ventasVisibles.reduce((acc, v) => acc + Number(v.total || 0), 0), 
    [ventasVisibles]
  );

  const totalClientes = clientes.length;
  // 🌟 CORRECCIÓN: El stock crítico ahora se basa en el `stockMinimo` de cada producto.
  const stockCriticoCount = productos.filter(p => Number(p.stock) <= Number(p.stockMinimo ?? 5)).length;
  const totalProductos = productos.length;

  // Ventas de los últimos 7 días
  const rendimientoSemanal = useMemo(() => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const hoy = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(hoy.getDate() - (6 - i));
      const fechaStr = d.toISOString().split('T')[0];
      
      // 🌟 CORRECCIÓN 2: Forzar Number() en la suma del rendimiento semanal
      const totalDia = ventasVisibles
        .filter(v => v.fecha?.split('T')[0] === fechaStr)
        .reduce((acc, v) => acc + Number(v.total || 0), 0);
        
      return { dia: dias[d.getDay()], total: totalDia };
    });
  }, [ventasVisibles]);

  // Top Categorías (por cantidad de productos)
  const distribucionCategorias = useMemo(() => {
    return categorias.map(cat => ({
      nombre: cat.nombre,
      amount: productos.filter(p => p.categoria === cat.nombre).length,
      color: cat.color
    })).sort((a, b) => b.amount - a.amount).slice(0, 4);
  }, [categorias, productos]);

  // Productos Más Vendidos
  const masVendidos = useMemo(() => {
    const conteo = {};
    ventasVisibles.forEach(v => {
      const items = v.items || v.productos || [];
      items.forEach(item => {
        const nombre = item.nombre || productos.find(p => p.id === item.productoId)?.nombre || "Producto";
        conteo[nombre] = (conteo[nombre] || 0) + (Number(item.cantidad) || 0);
      });
    });
    return Object.entries(conteo)
      .map(([nombre, cant]) => ({ nombre, cant }))
      .sort((a, b) => b.cant - a.cant)
      .slice(0, 5);
  }, [ventasVisibles, productos]);

  const ventasRecientes = ventasVisibles.slice(0, 5);

  const stats = [
    {
      id: 'reportes',
      title: 'Venta Global',
      value: `RD$ ${totalVentas.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <ShoppingCart className="text-emerald-600" size={24} />,
      path: '/reportes',
      color: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      id: 'clientes',
      title: 'Clientes',
      value: totalClientes,
      icon: <Users className="text-blue-600" size={24} />,
      path: '/clientes',
      color: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      id: 'inventario',
      title: 'Productos',
      value: totalProductos,
      icon: <Box className="text-indigo-600" size={24} />,
      path: '/inventario',
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      id: 'inventario',
      title: 'Stock Crítico',
      value: stockCriticoCount,
      icon: <AlertTriangle className="text-rose-600" size={24} />,
      path: '/inventario',
      state: { filter: 'low_stock' },
      color: 'bg-rose-50',
      borderColor: 'border-rose-100',
      isAlert: stockCriticoCount > 0
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
          Panel Principal
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Dashboard Operativo</p>
      </div>

      {/* Grid de Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.filter(s => puedeVer(s.id)).map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.path, { state: stat.state })}
            className={`cursor-pointer group p-6 rounded-[2.5rem] border-2 ${stat.borderColor} ${stat.color} 
              hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-52`}
          >
            <div className="flex justify-between items-start">
              <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:rotate-12 transition-transform duration-500">
                {stat.icon}
              </div>
              <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ArrowRight className="text-slate-600" size={16} />
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                {stat.title}
              </p>
              <h3 className={`text-4xl font-black tracking-tighter ${stat.isAlert ? 'text-rose-600' : 'text-slate-800'}`}>
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Segunda Fila: Rendimiento y Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rendimiento Semanal */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <TrendingUp size={20} />
              </div>
              <h2 className="font-black text-slate-800 uppercase italic text-sm tracking-tight">Rendimiento Semanal</h2>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {rendimientoSemanal.map((d, i) => {
              const max = Math.max(...rendimientoSemanal.map(r => r.total)) || 1;
              const height = (d.total / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-slate-50 rounded-t-xl relative h-full flex items-end overflow-hidden">
                    <div 
                      style={{ height: `${height}%` }}
                      className="w-full bg-indigo-500 group-hover:bg-indigo-600 transition-all duration-500 rounded-t-xl"
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{d.dia}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ventas Recientes */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Clock size={20} />
            </div>
            <h2 className="font-black text-slate-800 uppercase italic text-sm tracking-tight">Recientes</h2>
          </div>
          <div className="space-y-4">
            {ventasRecientes.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase">{v.cliente || "Consumidor Final"}</p>
                  <p className="text-[8px] text-slate-400 font-bold">{new Date(v.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                {/* 🌟 CORRECCIÓN 3: Convertir a Number antes de aplicar toLocaleString() en la lista de recientes */}
                <span className="text-xs font-black text-emerald-600">
                  RD$ {Number(v.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            {ventasRecientes.length === 0 && <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase italic">Sin ventas hoy</p>}
          </div>
        </div>
      </div>

      {/* Tercera Fila: Categorías y Más Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Categorías */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <PieChart size={20} />
            </div>
            <h2 className="font-black text-slate-800 uppercase italic text-sm tracking-tight">Top de Categorías</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {distribucionCategorias.map((cat, i) => (
              <div key={i} className="p-4 rounded-3xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.amount} Prods</span>
                </div>
                <p className="text-xs font-black text-slate-700 uppercase italic">{cat.nombre}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Más Vendidos */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Star size={20} />
            </div>
            <h2 className="font-black text-slate-800 uppercase italic text-sm tracking-tight">Más Vendidos</h2>
          </div>
          <div className="space-y-4">
            {masVendidos.map((p, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">{i+1}</div>
                  <p className="text-[10px] font-black text-slate-700 uppercase group-hover:translate-x-1 transition-transform">{p.nombre}</p>
                </div>
                <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter">{p.cant} vendidos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;