import React, { useState, useEffect } from 'react';
import { 
  Printer, Percent, Database, Save, Wallet,
  Download, ArrowRight, Users, 
  ShieldCheck, Terminal, AlertCircle, FileSpreadsheet, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import DatosEmpresa from '../components/configuracion/DatosEmpresa';
import ImpuestoGeneral from '../components/configuracion/ImpuestoGeneral';
import FormatoTicket from '../components/configuracion/FormatoTicket';
import MetodosPagoConfig from '../components/configuracion/MetodosPagoConfig';
import NcfConfig from '../components/configuracion/NcfConfig';

const Configuracion = ({ mostrarToast }) => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin'; // 🛡️ Verificación de rol de administrador
  const permisos = usePermissions('configuracion'); // 🛡️ Obtenemos permisos para el módulo
  
  // 🛡️ Determinamos qué sub-módulos puede ver y editar el usuario
  const puedeVerUsuarios = esAdmin || permisos.subModulos?.usuarios?.view;
  // 🛡️ Permisos para Datos de la Empresa
  const puedeVerDatosEmpresa = esAdmin || permisos.subModulos?.datos_empresa?.view;
  const puedeEditarDatosEmpresa = esAdmin || permisos.subModulos?.datos_empresa?.edit;

  const [guardando, setGuardando] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  // --- ESTADOS GENERALES ---
  const [impuestoActivo, setImpuestoActivo] = useState(() => localStorage.getItem('posfactura_impuesto_activo') !== 'false'); // Default a true
  const [papel, setPapel] = useState(localStorage.getItem('posfactura_papel') || '80mm');
  const [impuestosActivos, setImpuestosActivos] = useState(() => {
    const saved = localStorage.getItem('posfactura_impuestos_activos');
    return saved ? JSON.parse(saved) : { ITBIS: true }; // Default ITBIS a activo
  });
  const [impuestos, setImpuestos] = useState(() => {
    const saved = localStorage.getItem('posfactura_impuestos_config');
    return saved ? JSON.parse(saved) : {
      ITBIS: 18, ISC: 10, CDT: 2, ISR: 10, IPI: 1
    };
  });
  const [metodosPago, setMetodosPago] = useState(() => {
    const saved = localStorage.getItem('posfactura_metodos_pago');
    return saved ? JSON.parse(saved) : [
      { id: 'efectivo', nombre: 'Efectivo', activo: true },
      { id: 'tarjeta', nombre: 'Tarjeta', activo: true },
      { id: 'transferencia', nombre: 'Transferencia', activo: true },
      { id: 'credito', nombre: 'Crédito', activo: false },
    ];
  });
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

  // Sincronizamos la URL con la lógica global del sistema
  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com') 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || '/api');

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
      localStorage.setItem('posfactura_impuesto_activo', impuestoActivo);
      localStorage.setItem('posfactura_impuestos_activos', JSON.stringify(impuestosActivos));
      localStorage.setItem('posfactura_impuestos_config', JSON.stringify(impuestos));
      localStorage.setItem('posfactura_metodos_pago', JSON.stringify(metodosPago));
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

  // --- FUNCIÓN PARA MANEJAR EL BACKUP ---
  const handleBackup = async () => {
    if (usuario?.rol !== 'admin') {
      mostrarToast?.("Solo los administradores pueden realizar esta acción.", "error");
      return;
    }

    setBackupLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/database/backup`);

      if (!res.ok) {
        throw new Error("El servidor no pudo generar el archivo de respaldo.");
      }

      // Convertimos la respuesta en un objeto descargable (Blob)
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Creamos un enlace temporal para iniciar la descarga
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `backup-tech2solution-${timestamp}.sql`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiamos el enlace y la URL del objeto
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      mostrarToast?.("Copia de seguridad generada con éxito.", "success");
    } catch (error) {
      mostrarToast?.(error.message || "Error de conexión al solicitar el backup.", "error");
    } finally {
      setBackupLoading(false);
    }
  };

  // 🛡️ Muro de seguridad si no tiene acceso a ninguna sección de configuración
  if (!esAdmin && !permisos.view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in duration-300">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 max-w-md">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Acceso Restringido</h2>
          <p className="text-slate-500 font-medium mt-2">Tu perfil de usuario no tiene autorización para acceder a la configuración.</p>
        </div>
      </div>
    );
  }

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
          disabled={guardando || !puedeEditarDatosEmpresa}
          className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={14} className={guardando ? "animate-spin" : ""} /> 
          {guardando ? "Procesando..." : "Aplicar Cambios"}
        </button>
      </header>

      {/* SECCIÓN DE SEGURIDAD */}
      {puedeVerUsuarios && (
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
      {puedeVerDatosEmpresa && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BLOQUE IZQUIERDO: IDENTIDAD Y FACTURACIÓN */}
        <section className="lg:col-span-8 space-y-6 animate-in fade-in duration-300">
          
          {/* Identidad de Empresa */}
          <DatosEmpresa datosNegocio={datosNegocio} handleInputChange={handleInputChange} />

          {/* CONTROL DE COMPROBANTES FISCALES (DGII) */}
          <NcfConfig ncfConfig={ncfConfig} handleNcfChange={handleNcfChange} />
        </section>

        {/* BLOQUE DERECHO: IMPRESIÓN, IMPUESTO Y BACKUP */}
        <section className="lg:col-span-4 space-y-6 animate-in fade-in duration-300">
          
          {/* Configuración de Impuesto */}
          <ImpuestoGeneral
            impuestoActivo={impuestoActivo}
            setImpuestoActivo={setImpuestoActivo}
            impuestosActivos={impuestosActivos}
            setImpuestosActivos={setImpuestosActivos}
            impuestos={impuestos}
            setImpuestos={setImpuestos}
          />

          {/* Formato de Ticket */}
          <FormatoTicket papel={papel} setPapel={setPapel} />

          {/* Métodos de Pago */}
          <MetodosPagoConfig
            metodosPago={metodosPago}
            setMetodosPago={setMetodosPago}
          />

          {/* Backup Corporativo */}
          <div className="bg-slate-900 rounded-[2.5rem] p-7 shadow-xl text-white space-y-5">
            <div className="flex items-center gap-3">
              <Database size={16} className="text-emerald-400" />
              <h2 className="font-black uppercase text-[10px] tracking-widest text-slate-400">Copias de Seguridad</h2>
            </div>
            
            <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
              Es una buena práctica descargar una copia local de tus datos comerciales de forma periódica.
            </p>

            <button 
              onClick={handleBackup}
              disabled={backupLoading}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                {backupLoading 
                  ? <Save size={14} className="text-amber-400 animate-spin" />
                  : <Download size={14} className="text-emerald-400" />
                }
                <span className="font-black text-[9px] uppercase tracking-widest">{backupLoading ? 'Generando...' : 'Exportar Base de Datos'}</span>
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
      </div>}
    </div>
  );
};

export default Configuracion;