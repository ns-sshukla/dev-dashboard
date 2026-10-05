import { useState, useCallback } from 'react';
import { fetchAssignedIssues } from '../api/jira';

export function useJira(role) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssignedIssues(role);
      setIssues(data);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  return { issues, loading, error, lastRefreshed, refresh };
}
