import React from 'react';
import { Plug } from 'lucide-react';

const IntegracionesSection = ({ mostrarToast, permisos }) => {
  // 🛡️ Extraemos los permisos específicos para esta sección
  const permisosIntegraciones = permisos?.subModulos?.integraciones ?? permisos;

  return ( // La vista general ya está protegida por el padre, aquí solo protegemos las acciones
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
      <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-4">
        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
          <Plug size={18} />
        </div>
        <div className="flex-1">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Integraciones</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Conecta tus canales de venta externos: Facebook Marketplace, Instagram Shopping, Corotos, entre otros.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[
          { nombre: 'Facebook Marketplace', icon: '📘', conectado: false },
          { nombre: 'Instagram Shopping', icon: '📸', conectado: false },
          { nombre: 'Corotos', icon: '🏪', conectado: false },
          { nombre: 'MercadoLibre', icon: '💼', conectado: false },
          { nombre: 'Shopify', icon: '🛍️', conectado: false },
          { nombre: 'Otros Canales', icon: '🔗', conectado: false },
        ].map((canal, idx) => (
          <div key={idx} className="p-4 bg-slate-50 border rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{canal.icon}</span>
              <h3 className="text-sm font-black text-slate-800">{canal.nombre}</h3>
            </div>
            <p className="text-[9px] text-slate-500">Conecta tu cuenta para sincronizar productos</p>
            {/* 🛡️ 2. Protegemos el botón de conexión */}
            <button 
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                canal.conectado 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
              }`}
              disabled={!permisosIntegraciones?.edit}
              title={!permisosIntegraciones?.edit ? 'No tienes permiso para modificar integraciones' : ''}
            >
              {canal.conectado ? '✓ Conectado' : 'Conectar'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-[10px] font-black text-amber-800 uppercase">💡 Próximamente</p>
        <p className="text-[9px] text-amber-700 mt-2">Las integraciones con canales externos estarán disponibles en la próxima versión. Podrás sincronizar automáticamente tu inventario y gestionar multi-canal desde aquí.</p>
      </div>
    </div>
  );
};

export default IntegracionesSection;
