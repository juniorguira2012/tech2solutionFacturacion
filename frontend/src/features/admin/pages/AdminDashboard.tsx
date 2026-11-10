import React, { useEffect, useState } from 'react';
import { Tenant } from '../types/tenant.types';
import { adminApi } from '../services/adminApi';

import { CreateTenantModal } from '../components/CreateTenantModal';
import { AdminStatsCards } from '../components/AdminStatsCards';
import { TenantTable } from '../components/TenantTable';
import { ProfileDropdown } from '../components/ProfileDropdown';
import { AdminSettingsModal } from '../components/AdminSettingsModal';

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

  // Estado para confirmar acción de cambiar estado (activo/suspendido)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [tenantToToggle, setTenantToToggle] = useState<Tenant | null>(null);

  // Estados para Configuración del Master Admin
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>('Master Admin');
  const [adminEmail, setAdminEmail] = useState<string>('techtwosolution2@gmail.com');
  const [adminNewPassword, setAdminNewPassword] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleUpdateAdminSettings = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // 1. Obtener el usuario admin actual desde el localStorage (donde guardaste el login)
    const adminUser = JSON.parse(localStorage.getItem('master_user') || '{}');
    
    if (!adminUser.id) {
      throw new Error('No se encontró la sesión del administrador.');
    }

    // 2. Llamada real al backend que creamos
    await adminApi.updateAdminProfile({
      id: adminUser.id,
      name: adminName,         // El estado o valor actual del input de nombre
      email: adminEmail,       // El estado o valor actual del input de correo
      newPassword: adminNewPassword, // La nueva contraseña (si se escribió)
    });

    // 3. Feedback visual exitoso
    setNotification({ type: 'success', message: '¡Perfil de administrador actualizado con éxito!' });
    
    // Limpiar campo de contraseña y cerrar modal
    setAdminNewPassword('');
    setIsSettingsModalOpen(false);

    // Opcional: Ocultar la notificación flotante después de 4 segundos
    setTimeout(() => setNotification(null), 4000);

  } catch (error: any) {
    console.error('Error al actualizar la configuración:', error);
    const errorMsg = error.response?.data?.message || 'Error al actualizar el perfil de administrador.';
    setNotification({ type: 'error', message: errorMsg });
  }
};

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

  // 1. Abre el modal de confirmación en lugar de ejecutar la acción de golpe
const confirmToggleStatus = (tenant: Tenant) => {
  setTenantToToggle(tenant);
  setIsConfirmModalOpen(true);
};

// 2. Esta función se ejecuta SÓLO cuando el usuario confirma en el modal
const handleToggleStatus = async () => {
  if (!tenantToToggle) return;

  try {
    const newStatus = !tenantToToggle.isActive;
    await adminApi.updateTenantStatus(tenantToToggle.id, newStatus);
    
    // Cerramos el modal y refrescamos la lista
    setIsConfirmModalOpen(false);
    setTenantToToggle(null);
    fetchTenants();
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert('Error al actualizar el estado del tenant');
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
              {/* Banner de notificación flotante */}
      {notification && (
          <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-emerald-900/90 border-emerald-500 text-emerald-100' 
              : 'bg-rose-900/90 border-rose-500 text-rose-100'
          }`}>
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}
      <div className="max-w-7xl mx-auto space-y-6">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tech2Solution - Master Admin</h1>
            <p className="text-gray-500 mt-1">Panel de supervisión y control de tenants ERP</p>
          </div>
          

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow transition"
            >
              + Nuevo Tenant
            </button>
          

            {/*Menú Desplegable de Perfil */}
            <ProfileDropdown 
              userName="Master Admin"
              userEmail="techtwosolution2@gmail.com"
              onLogout={() => {
                // 1. Limpiamos las credenciales de Master Admin
                localStorage.removeItem('access_token');
                localStorage.removeItem('master_user');
                
                // 2. Redirigimos al login exclusivo de Super Admin (ajusta la ruta según tu React Router)
                window.location.href = '/admin/login'; 
              }}
              onOpenSettings={() => {
                setIsSettingsModalOpen(true);
              }}
            />
          </div>
        </div>
          <AdminSettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => {
              setIsSettingsModalOpen(false);
              setAdminNewPassword('');
            }}
            adminName={adminName}
            setAdminName={setAdminName}
            adminEmail={adminEmail}
            setAdminEmail={setAdminEmail}
            adminNewPassword={adminNewPassword}
            setAdminNewPassword={setAdminNewPassword}
            onSubmit={handleUpdateAdminSettings}
          />

        {/* Tarjetas de Estadísticas */}
        <AdminStatsCards tenants={tenants} />

        {/* Tabla de Tenants */}
        <TenantTable 
          tenants={tenants} 
          loading={loading} 
          onToggleStatus={(id, currentStatus) => {
            const tenant = tenants.find(t => t.id === id);
            if (tenant) confirmToggleStatus(tenant);
          }}
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
        
        {/* --- MODAL DE CONFIRMACIÓN PARA CAMBIO DE ESTADO --- */}
        {isConfirmModalOpen && tenantToToggle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl text-center space-y-4">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${tenantToToggle.isActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {tenantToToggle.isActive ? '⚠️' : '✅'}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900">
                {tenantToToggle.isActive ? '¿Suspender Tenant?' : '¿Activar Tenant?'}
              </h3>
              
              <p className="text-sm text-gray-500">
                Estás a punto de {tenantToToggle.isActive ? 'suspender el acceso para' : 'activar nuevamente a'} <strong>{tenantToToggle.name}</strong> ({tenantToToggle.subdomain}).
              </p>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setTenantToToggle(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 text-white rounded-lg shadow transition text-sm font-medium ${
                    tenantToToggle.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Sí, {tenantToToggle.isActive ? 'Suspender' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};