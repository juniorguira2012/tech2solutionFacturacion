import React from 'react';
import { Tenant } from '../types/tenant.types';

interface TenantTableProps {
  tenants: Tenant[];
  loading: boolean;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onEdit: (tenant: Tenant) => void;
  onResetPassword: (tenant: Tenant) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  loading,
  onToggleStatus,
  onEdit,
  onResetPassword,
}) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-700">
        Empresas Inquilinas Registradas ({tenants.length})
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Cargando tenants...</div>
      ) : tenants.length === 0 ? (
        <div className="p-8 text-center text-gray-400">No hay tenants registrados aún.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                <th className="p-4">Empresa</th>
                <th className="p-4">Correo Admin</th>
                <th className="p-4">Subdominio</th>
                <th className="p-4">Base de Datos</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Fecha Creación</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-gray-900">{tenant.name}</td>
                  <td className="p-4 text-gray-600">{tenant.email || 'No registrado'}</td>
                  <td className="p-4 text-indigo-600 font-mono">{tenant.subdomain}</td>
                  <td className="p-4 text-gray-500 font-mono">{tenant.dbName}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tenant.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tenant.isActive ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => onEdit(tenant)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-medium transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onResetPassword(tenant)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium transition"
                    >
                      Resetear Clave
                    </button>
                    <button
                      onClick={() => onToggleStatus(tenant.id, tenant.isActive)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        tenant.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {tenant.isActive ? 'Suspender' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};