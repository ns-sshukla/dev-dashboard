import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dp-user-role';

export const ROLES = [
  { id: 'developer', label: 'Developer' },
  { id: 'qa',        label: 'QA' },
  { id: 'l3',        label: 'L3' },
];

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return ROLES.some((r) => r.id === saved) ? saved : 'developer';
  });

  const setRole = useCallback((next) => {
    setRoleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
