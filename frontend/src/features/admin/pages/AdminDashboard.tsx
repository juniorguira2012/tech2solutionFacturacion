import React, { useEffect, useState } from 'react';
import { Tenant } from '../types/tenant.types';
import { adminApi } from '../services/adminApi';

import { CreateTenantModal } from '../components/CreateTenantModal';
import { AdminStatsCards } from '../components/AdminStatsCards';
import { TenantTable } from '../components/TenantTable';

export const AdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estados de los Modales
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  
  // Tenant Seleccionado para edición o reseteo de clave
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form state para editar tenant
  const [editName, setEditName] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Form state para resetear contraseña
  const [newPassword, setNewPassword] = useState('');

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error al cargar los tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // 1. Crear Tenant (Recibe los datos directamente desde el componente CreateTenantModal)
  const handleCreateTenant = async (formData: { name: string; subdomain: string; adminEmail: string; adminPassword: string }) => {
    try {
      await adminApi.createTenant(formData);
      setIsModalOpen(false);
      fetchTenants(); 
    } catch (error) {
      console.error('Error al crear tenant:', error);
      alert('Error al registrar el tenant y su usuario administrador');
      throw error; // Permite que el modal maneje su estado de loading si es necesario
    }
  };

  // 2. Guardar Cambios de Edición
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      await adminApi.updateTenant(selectedTenant.id, {
        name: editName,
        subdomain: editSubdomain,
        email: editEmail,
      });

      setIsEditModalOpen(false);
      setSelectedTenant(null);
      fetchTenants();
      alert('Información del tenant actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar tenant:', error);
      alert('Error al actualizar la información del tenant');
    }
  };

  // 3. Resetear Contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      await adminApi.resetTenantPassword(selectedTenant.id, newPassword);
      
      setNewPassword('');
      setSelectedTenant(null);
      setIsPasswordModalOpen(false);
      alert('¡Contraseña del administrador actualizada con éxito!');
    } catch (error) {
      console.error('Error al resetear la contraseña:', error);
      alert('Error al actualizar la contraseña');
    }
  };

  // 4. Cambiar Estado (Activo / Suspendido)
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminApi.updateTenantStatus(id, !currentStatus);
      fetchTenants();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Principal */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tech2Solution - Master Admin</h1>
            <p className="text-gray-500 mt-1">Panel de supervisión y control de tenants ERP</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow transition"
          >
            + Nuevo Tenant
          </button>
        </div>

        {/* Tarjetas de Estadísticas */}
        <AdminStatsCards tenants={tenants} />

        {/* Tabla de Tenants */}
        <TenantTable 
          tenants={tenants} 
          loading={loading} 
          onToggleStatus={handleToggleStatus}
          onEdit={(tenant) => {
            setSelectedTenant(tenant);
            setEditName(tenant.name);
            setEditSubdomain(tenant.subdomain);
            setEditEmail(tenant.email || '');
            setIsEditModalOpen(true);
          }}
          onResetPassword={(tenant) => {
            setSelectedTenant(tenant);
            setIsPasswordModalOpen(true);
          }}
        />

        {/* --- MODAL CREAR TENANT (MODULARIZADO) --- */}
        <CreateTenantModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateTenant={handleCreateTenant}
        />

{/* --- MODAL EDITAR TENANT --- */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Información del Cliente</h3>
              <form onSubmit={handleUpdateTenant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subdominio</label>
                  <input
                    type="text"
                    required
                    value={editSubdomain}
                    onChange={(e) => setEditSubdomain(e.target.value.toLowerCase())}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                {/* 👈 Nuevo campo de Correo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico Admin</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedTenant(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow transition"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL RESETEAR CONTRASEÑA --- */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Resetear Contraseña</h3>
              <p className="text-sm text-gray-500 mb-4">
                Establece una nueva clave de acceso para el administrador de <strong>{selectedTenant?.name}</strong>.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setNewPassword('');
                      setSelectedTenant(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow transition"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};