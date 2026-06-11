import React, { useState, useEffect } from 'react';
import { 
  Printer, Percent, Database, Save, 
  Download, ArrowRight, Users, 
  ShieldCheck, Terminal, AlertCircle, FileSpreadsheet, Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Configuracion = ({ mostrarToast }) => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [guardando, setGuardando] = useState(false);

  // --- ESTADOS GENERALES ---
  const [itbis, setItbis] = useState(localStorage.getItem('posfactura_itbis') || 18);
  const [papel, setPapel] = useState(localStorage.getItem('posfactura_papel') || '80mm');
  const [datosNegocio, setDatosNegocio] = useState(() => {
    const savedConfig = localStorage.getItem('posfactura_config');
    return savedConfig ? JSON.parse(savedConfig) : { 
      nombre: 'Mi Negocio S.A.', 
      rnc: '',
      telefono: '',
      direccion: '',
      mensaje: '¡Gracias por su compra!' 
    };
  });

  // --- 🚨 NUEVO: CONTROL DE COMPROBANTES FISCALES (NCF) ---
  const [ncfConfig, setNcfConfig] = useState(() => {
    const savedNcf = localStorage.getItem('posfactura_ncf');
    return savedNcf ? JSON.parse(savedNcf) : {
      secuenciaB01: '00000001', // Crédito Fiscal
      secuenciaB02: '00000001', // Consumo
      alertaMinima: 50           // Alerta cuando queden pocos NCF
    };
  });

  // Sincronizar datos con backend al cargar el componente (Opcional si tienes la API lista)
  useEffect(() => {
    const cargarConfiguracionServidor = async () => {
      try {
        // const res = await fetch('/api/configuracion');
        // const data = await res.json();
        // Seteas tus estados aquí...
      } catch (err) {
        console.error("Error cargando configuración remota:", err);
      }
    };
    cargarConfiguracionServidor();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosNegocio(prev => ({ ...prev, [name]: value }));
  };

  const handleNcfChange = (e) => {
    const { name, value } = e.target;
    setNcfConfig(prev => ({ ...prev, [name]: value }));
  };

  // --- GUARDADO GENERAL PROFESIONAL ---
  const guardarParametros = async () => {
    setGuardando(true);
    try {
      // 1. Guardamos de inmediato en LocalStorage como respaldo local rápido
      localStorage.setItem('posfactura_itbis', itbis);
      localStorage.setItem('posfactura_papel', papel);
      localStorage.setItem('posfactura_config', JSON.stringify(datosNegocio));
      localStorage.setItem('posfactura_ncf', JSON.stringify(ncfConfig));

      // 2. 🚨 SIMULACIÓN DE CONEXIÓN CON API BACKEND 
      // await fetch('/api/configuracion/guardar', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ itbis, papel, datosNegocio, ncfConfig })
      // });

      // Simular un retraso de red de medio segundo para que la UI se sienta interactiva
      await new Promise(resolve => setTimeout(resolve, 600));

      mostrarToast?.("Configuración del sistema actualizada correctamente", "success");
    } catch (error) {
      console.error(error);
      mostrarToast?.("Hubo un error al guardar en el servidor", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-2 animate-in fade-in duration-500">
      
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">Panel de Configuración</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 italic">Ajustes Globales de Terminal y Facturación</p>
        </div>
        <button 
          onClick={guardarParametros} 
          disabled={guardando}
          className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={14} className={guardando ? "animate-spin" : ""} /> 
          {guardando ? "Procesando..." : "Aplicar Cambios"}
        </button>
      </header>

      {/* SECCIÓN DE SEGURIDAD (Solo Admin / Supervisor) */}
      {(usuario?.rol === 'admin' || usuario?.rol === 'supervisor') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/usuarios')}
            className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-slate-900 transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-black text-slate-800 uppercase italic text-xs">Gestión de Personal</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Control de Usuarios y Accesos</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-all" />
          </button>

          {usuario?.rol === 'admin' && (
            <button 
              onClick={() => navigate('/roles')}
              className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-slate-900 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-slate-800 uppercase italic text-xs">Roles & Permisos</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Reglas de Restricción Avanzada</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-all" />
            </button>
          )}
        </div>
      )}

      {/* REJILLA DE CONFIGURACIONES GENERALES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BLOQUE IZQUIERDO: IDENTIDAD Y FACTURACIÓN */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Identidad de Empresa */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <Building2 size={18} className="text-slate-900" />
              <h2 className="font-black text-slate-700 uppercase text-[11px] tracking-widest leading-none">Datos de la Empresa (Encabezado)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
                <input name="nombre" value={datosNegocio.nombre} onChange={handleInputChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">RNC / Cédula Comercial</label>
                <input name="rnc" value={datosNegocio.rnc || ''} onChange={handleInputChange} placeholder="Ej: 131-XXXXX-X"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Fijo</label>
                <input name="telefono" value={datosNegocio.telefono || ''} onChange={handleInputChange} placeholder="809-XXX-XXXX"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Física</label>
                <input name="direccion" value={datosNegocio.direccion || ''} onChange={handleInputChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs uppercase" />
              </div>
            </div>
            
            <div className="space-y-1 pt-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje de Cierre (Pie del Ticket)</label>
              <input name="mensaje" value={datosNegocio.mensaje} onChange={handleInputChange} 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs" />
            </div>
          </div>

          {/* CONTROL DE COMPROBANTES FISCALES (DGII) */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <FileSpreadsheet size={18} className="text-slate-900" />
              <h2 className="font-black text-slate-700 uppercase text-[11px] tracking-widest leading-none">Secuencias NCF (DGII)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Próximo B01 (Créd. Fiscal)</label>
                <input name="secuenciaB01" value={ncfConfig.secuenciaB01} onChange={handleNcfChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-mono font-bold text-slate-700 text-xs text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Próximo B02 (Consumo)</label>
                <input name="secuenciaB02" value={ncfConfig.secuenciaB02} onChange={handleNcfChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-mono font-bold text-slate-700 text-xs text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Alerta Stock Crítico</label>
                <input type="number" name="alertaMinima" value={ncfConfig.alertaMinima} onChange={handleNcfChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-bold text-slate-700 text-xs text-center" />
              </div>
            </div>
          </div>
        </section>

        {/* BLOQUE DERECHO: IMPRESIÓN, IMPUESTO Y BACKUP */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Configuración de Impuesto */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Percent size={16} /></div>
              <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">ITBIS General</h2>
            </div>
            <div className="relative flex items-center">
              <input type="number" value={itbis} onChange={(e) => setItbis(e.target.value)}
                className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-3xl text-emerald-600 text-center focus:bg-white outline-none focus:border-emerald-500" />
              <span className="absolute right-6 font-black text-slate-300 text-xl">%</span>
            </div>
          </div>

          {/* Formato de Ticket */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Printer size={18} className="text-slate-400" />
              <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Salida de Impresión</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['58mm', '80mm', 'A4'].map((size) => (
                <button key={size} onClick={() => setPapel(size)}
                  className={`py-3.5 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${papel === size ? 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-100' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-transparent'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Backup Corporativo */}
          <div className="bg-slate-900 rounded-[2.5rem] p-7 shadow-xl text-white space-y-5">
            <div className="flex items-center gap-3">
              <Database size={16} className="text-emerald-400" />
              <h2 className="font-black uppercase text-[10px] tracking-widest text-slate-400">Copias de Seguridad</h2>
            </div>
            
            <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
              Es una buena práctica descargar una copia local de tus datos comerciales de forma periódica.
            </p>

            <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-3">
                <Download size={14} className="text-emerald-400" />
                <span className="font-black text-[9px] uppercase tracking-widest">Exportar Base de Datos</span>
              </div>
              <ArrowRight size={12} className="text-white/20" />
            </button>
            
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[8px] font-bold uppercase leading-tight text-amber-200/60">
                La restauración de backups impacta de forma global en las cajas. Solo está autorizada para Administradores.
              </p>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default Configuracion;