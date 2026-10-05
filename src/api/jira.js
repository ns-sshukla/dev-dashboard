const BASE = '/api/jira';

// Display names of the extra Jira user-picker fields consulted per role
const ROLE_FIELD_NAMES = {
  qa: 'QA',
  l3: 'L3 Engineer',
};

let fieldIdMapPromise = null;
let currentUserPromise = null;

// Jira custom fields are addressed by id (customfield_XXXXX) — resolve the id
// for a human-readable field name once and cache it for the session.
function loadFieldIdMap() {
  if (!fieldIdMapPromise) {
    fieldIdMapPromise = fetch(`${BASE}/rest/api/3/field`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Jira field API ${res.status}: ${await res.text()}`);
        const fields = await res.json();
        return new Map(fields.map((f) => [f.name.toLowerCase(), f.id]));
      })
      .catch((e) => { fieldIdMapPromise = null; throw e; });
  }
  return fieldIdMapPromise;
}

function loadCurrentUser() {
  if (!currentUserPromise) {
    currentUserPromise = fetch(`${BASE}/rest/api/3/myself`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.accountId || null)
      .catch(() => null);
  }
  return currentUserPromise;
}

async function resolveRoleField(role) {
  const name = ROLE_FIELD_NAMES[role];
  if (!name) return null;
  const map = await loadFieldIdMap();
  const id = map.get(name.toLowerCase());
  if (!id) throw new Error(`Jira field "${name}" not found — check the field name in Jira`);
  return { name, id };
}

export async function fetchAssignedIssues(role = 'developer') {
  const roleField = await resolveRoleField(role);

  const jql = roleField
    ? `(assignee = currentUser() OR "${roleField.name}" = currentUser()) ORDER BY updated DESC`
    : 'assignee = currentUser() ORDER BY updated DESC';

  const baseFields = [
    'key', 'summary', 'status', 'priority', 'issuetype',
    'updated', 'assignee', 'fixVersions',
    'customfield_10016', // story points (classic projects)
    'customfield_10028', // story points (next-gen projects)
    'customfield_10020', // sprint
  ];
  if (roleField) baseFields.push(roleField.id);
  const fields = baseFields.join(',');

  const PAGE = 100; // Jira API max per request
  let nextPageToken = null;
  let all = [];

  while (true) {
    let url = `${BASE}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=${fields}&maxResults=${PAGE}`;
    if (nextPageToken) url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Jira API ${res.status}: ${text}`);
    }
    const data = await res.json();
    const issues = data.issues || [];
    all = all.concat(issues);

    if (data.isLast || !data.nextPageToken || issues.length < PAGE) break;
    nextPageToken = data.nextPageToken;
  }

  // Tag each issue with which field matched the current role filter
  if (roleField) {
    const myAccountId = await loadCurrentUser();
    all = all.map((issue) => {
      const roleFieldValue = issue.fields?.[roleField.id];
      const matchedViaRoleField = !!myAccountId && roleFieldValue?.accountId === myAccountId;
      return { ...issue, _matchedVia: matchedViaRoleField ? roleField.name : 'Assignee' };
    });
  }

  return all;
}

// Resolve Jira base URL from the meta endpoint so we can build deep links
export async function fetchJiraBaseUrl() {
  try {
    const res = await fetch(`${BASE}/rest/api/3/serverInfo`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.baseUrl || null;
  } catch {
    return null;
  }
}
