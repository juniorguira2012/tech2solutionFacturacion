import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { 
  TrendingUp, Users, Package, DollarSign, 
  Clock, ArrowRight, Receipt, History, ArrowDownRight, Settings, Lock, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../context/InventarioContext';
import { useClientes } from '../context/ClienteContext';
import { useVentas } from '../context/VentasContext';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Home = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth(); 
  const { productos = [] } = useInventario();
  const { clientes = [] } = useClientes();
  const { historialVentas = [] } = useVentas();

  // 1. LÓGICA DE PERMISOS
  const permisos = useMemo(() => {
    const savedRoles = localStorage.getItem('posfactura_roles_config');
    if (savedRoles && usuario) {
      const config = JSON.parse(savedRoles);
      return config[usuario.rol]?.modules || { ventas: 'full', inventario: 'none', reportes: 'none', clientes: 'none' };
    }
    return usuario?.rol === 'admin' 
      ? { ventas: 'full', inventario: 'full', reportes: 'full', clientes: 'full' }
      : { ventas: 'full', inventario: 'none', reportes: 'none', clientes: 'none' };
  }, [usuario]);

  const sonMismaFecha = (fecha1, fecha2) => {
    try {
      const d1 = new Date(fecha1);
      const d2 = new Date(fecha2);
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    } catch (e) { return false; }
  };

  // KPI: VENTAS DEL DÍA (Personalizado: Si es admin ve todo, si es cajero solo lo suyo)
  const miVentaHoy = useMemo(() => {
    const hoy = new Date();
    return historialVentas
      .filter(v => {
        const mismaFecha = sonMismaFecha(v.fecha, hoy);
        if (usuario?.rol === 'admin') return mismaFecha;
        // Filtro por ID o Nombre del vendedor (ajusta según tu modelo de datos de Venta)
        return mismaFecha && (v.vendedorId === usuario?.id || v.vendedor === usuario?.nombre);
      })
      .reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  }, [historialVentas, usuario]);

  // GRÁFICO SEMANAL (Mantenido con el estilo visual previo)
  const datosVentasSemana = useMemo(() => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const totalDia = historialVentas
        .filter(v => sonMismaFecha(v.fecha, d))
        .reduce((acc, v) => acc + (Number(v.total) || 0), 0);
      ultimos7Dias.push({ dia: diasSemana[d.getDay()], total: totalDia });
    }
    return ultimos7Dias;
  }, [historialVentas]);

  const dataCategorias = useMemo(() => {
    if (productos.length === 0) return [];
    const conteo = productos.reduce((acc, p) => {
      const cat = p.categoria || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(conteo).map(key => ({ name: key, value: conteo[key] }))
      .sort((a, b) => b.value - a.value).slice(0, 5);
  }, [productos]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const stockBajo = productos.filter(p => p.stock <= (p.stockMin || 5)).length;

  if (!usuario) return null;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">
            Panel <span className="text-brand">Principal</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
            <User size={12} className="text-brand" /> {usuario.nombre} — {usuario.rol}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usuario.rol === 'admin' && (
            <button onClick={() => navigate('/configuracion')} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-brand border border-slate-200 transition-all shadow-sm">
              <Settings size={20} />
            </button>
          )}
          {permisos.ventas !== 'none' && (
            <button onClick={() => navigate('/ventas')} className="flex items-center gap-3 bg-brand text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-xs uppercase tracking-widest">
              <Receipt size={18} /> Nueva Venta
            </button>
          )}
        </div>
      </header>

      {/* KPIs PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MI VENTA DEL DÍA: Siempre visible con la lógica de usuario */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand text-white rounded-2xl shadow-lg shadow-indigo-50 transition-transform group-hover:scale-110 duration-300">
              <DollarSign size={24} />
            </div>
            <span className="text-[9px] font-black text-brand bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-tighter">Hoy</span>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {usuario?.rol === 'admin' ? 'Venta Global' : 'Mis Ventas'}
          </p>
          <h3 className="text-2xl font-black text-slate-800 mt-1 italic">
            RD$ {miVentaHoy.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        {permisos.clientes !== 'none' && (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl w-fit mb-4"><Users size={24} /></div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Clientes</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1 italic">{clientes.length}</h3>
            </div>
        )}

        {permisos.inventario !== 'none' && (
            <>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl w-fit mb-4"><Package size={24} /></div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Productos</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1 italic">{productos.length}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="p-3 bg-red-50 text-red-500 rounded-2xl w-fit mb-4"><ArrowDownRight size={24} /></div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Stock Crítico</p>
                    <h3 className="text-2xl font-black text-red-500 mt-1 italic">{stockBajo}</h3>
                </div>
            </>
        )}
      </div>

      {/* SECCIÓN DE GRÁFICOS PROTEGIDA */}
      {permisos.reportes !== 'none' ? (
        <div className="grid grid-cols-12 gap-6 animate-in slide-in-from-bottom-5">
          <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="font-black text-slate-800 flex items-center gap-2 mb-8 tracking-tighter uppercase italic text-sm">
              <TrendingUp size={20} className="text-brand" /> Rendimiento Semanal
            </h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosVentasSemana}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                  <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                      formatter={(value) => [`RD$ ${value.toLocaleString()}`, 'Venta']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="font-black text-slate-800 mb-8 tracking-tighter uppercase italic text-sm text-center">Top Categorías</h2>
              <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                          data={dataCategorias.length > 0 ? dataCategorias : [{name: 'Sin Datos', value: 1}]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                      >
                          {dataCategorias.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                          ))}
                      </Pie>
                      <Tooltip />
                  </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-6">
                  {dataCategorias.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                              <span className="text-slate-400">{c.name}</span>
                          </div>
                          <span className="text-slate-700">{c.value}</span>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      ) : (
        /* VISTA BLOQUEADA PARA CAJEROS SIN PERMISO DE REPORTES */
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] py-16 text-center">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Lock className="text-slate-300" size={28} />
            </div>
            <h3 className="text-slate-800 font-black uppercase tracking-[0.2em] text-[11px] italic">Métricas de Negocio</h3>
            <p className="text-slate-400 text-[10px] font-bold mt-2 max-w-xs mx-auto uppercase">Panel restringido a personal administrativo.</p>
        </div>
      )}

      {/* TRANSACCIONES (Visible para todos) */}
      <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase italic text-sm">
                      <Clock size={20} className="text-brand" /> Recientes
                  </h2>
                  <button onClick={() => navigate('/historialventas')} className="bg-slate-50 text-slate-400 p-2 rounded-xl hover:text-brand transition-all"><ArrowRight size={20} /></button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                          <tr>
                              <th className="px-8 py-5">Ref</th>
                              <th className="px-8 py-5">Cliente</th>
                              <th className="px-8 py-5">Total</th>
                              <th className="px-8 py-5 text-center">Estatus</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {historialVentas.slice(0, 5).map((venta) => (
                              <tr key={venta.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-8 py-5 font-mono text-[10px] text-slate-300 group-hover:text-brand font-black">#{venta.id.toString().slice(-4)}</td>
                                  <td className="px-8 py-5 font-black text-slate-700 text-xs uppercase italic">{venta.cliente}</td>
                                  <td className="px-8 py-5 font-black text-slate-800 text-sm italic">RD$ {venta.total.toLocaleString('en-US')}</td>
                                  <td className="px-8 py-5 text-center">
                                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase">Vendido</span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* TENDENCIA (Visible si tiene inventario) */}
          {permisos.inventario !== 'none' && (
              <div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
                  <h2 className="font-black text-slate-800 mb-8 flex items-center gap-2 tracking-tighter uppercase italic text-sm">
                      ⭐ Más Vendidos
                  </h2>
                  <div className="space-y-5">
                      {productos
                          .filter(p => (p.vendidos || 0) > 0)
                          .sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0))
                          .slice(0, 5)
                          .map((p, i) => (
                              <div key={p.id} className="flex items-center justify-between group cursor-default">
                                  <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-xs text-slate-400 italic group-hover:bg-brand group-hover:text-white transition-all">
                                          {i + 1}
                                      </div>
                                      <div>
                                          <p className="text-xs font-black text-slate-700 uppercase tracking-tighter truncate w-32 italic">{p.nombre}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.vendidos || 0} Uds</p>
                                      </div>
                                  </div>
                                  <div className={`text-[9px] font-black px-3 py-1 rounded-xl uppercase ${p.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-brand'}`}>
                                      Stock: {p.stock}
                                  </div>
                              </div>
                          ))}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Home;