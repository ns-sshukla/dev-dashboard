import { createContext, useContext, useEffect } from 'react';
import { useJira } from '../hooks/useJira';
import { useGitHub } from '../hooks/useGitHub';
import { useConfluence } from '../hooks/useConfluence';
import { useRole } from './RoleContext';

const DataContext = createContext(null);

export function DataProvider({ githubUsername, githubOrg, children }) {
  const { role }   = useRole();
  const jira       = useJira(role);
  const github     = useGitHub(githubUsername, githubOrg);
  const confluence = useConfluence();

  // Fetch GitHub/Confluence once on app startup — sections don't need their own useEffect
  useEffect(() => {
    github.refresh();
    confluence.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Jira on startup, and again whenever the active role changes
  useEffect(() => {
    jira.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <DataContext.Provider value={{ jira, github, confluence }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
