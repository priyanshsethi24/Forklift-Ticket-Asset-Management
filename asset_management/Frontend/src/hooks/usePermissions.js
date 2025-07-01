import { useSelector } from 'react-redux';

export const usePermissions = () => {
  const { userRole, permissions } = useSelector(state => state.roles);
  
  const hasPermission = (permission) => {
    if (!permission) return true;
    return permissions[userRole][permission];
  };
  
  return {
    userRole,
    permissions: permissions[userRole],
    hasPermission
  };
}; 