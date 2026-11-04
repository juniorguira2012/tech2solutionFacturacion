import React from 'react';
import { Tenant } from '../types/tenant.types';

interface AdminStatsCardsProps {
  tenants: Tenant[];
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ tenants }) => {
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.isActive).length;
  const suspendedTenants = totalTenants - activeTenants;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total de Empresas</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{totalTenants}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
        <p className="text-3xl font-bold text-green-600 mt-2">{activeTenants}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Clientes Suspendidos</p>
        <p className="text-3xl font-bold text-red-600 mt-2">{suspendedTenants}</p>
      </div>
    </div>
  );
};