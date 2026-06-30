import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsuarios } from '../context/UsuariosContext'; // <-- Importamos tu contexto de usuarios

const DEFAULT_PERMISSIONS = { view: false, create: false, edit: false, delete: false };

export const usePermissions = (moduleId) => {
  const { usuario } = useAuth();
  const { roles } = useUsuarios(); // <-- Traemos los roles del estado global reactivo

  return useMemo(() => {
    if (!usuario || !moduleId) return DEFAULT_PERMISSIONS;
    if (usuario.rol === 'admin') return { view: true, create: true, edit: true, delete: true };

    try {
      // En vez de localStorage, buscamos en el estado del contexto
      // Si manejas un objeto mapeado en el contexto, es directo. Si viene como array:
      const rolesConfig = Array.isArray(roles) 
        ? Object.fromEntries(roles.map(r => [r.name, r.config]))
        : roles;

      const userRoleConfig = rolesConfig[usuario.rol];

      if (userRoleConfig?.modules?.[moduleId]) {
        const modulePermission = userRoleConfig.modules[moduleId];
        
        if (modulePermission === 'full') return { view: true, create: true, edit: true, delete: true };
        if (modulePermission === 'view') return { view: true, create: false, edit: false, delete: false };
        if (modulePermission === 'none') return DEFAULT_PERMISSIONS;

        return { ...DEFAULT_PERMISSIONS, ...modulePermission };
      }
    } catch (error) {
      console.error("Error al leer los permisos reactivos:", error);
    }

    return DEFAULT_PERMISSIONS;
  }, [usuario, moduleId, roles]); // <-- Agregamos 'roles' como dependencia
};