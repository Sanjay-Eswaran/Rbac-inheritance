// rbac.js
const roleHierarchy = {
  'Viewer': [],
  'Editor': ['Viewer'],
  'Manager': ['Editor','Viewer'],
  'Admin': ['Manager','Editor','Viewer']
};

function expandRoles(roles = []) {
  const set = new Set();
  function add(role) {
    if (!role || set.has(role)) return;
    set.add(role);
    (roleHierarchy[role] || []).forEach(add);
  }
  roles.forEach(add);
  return Array.from(set);
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    const userExpanded = expandRoles(req.user.roles);
    if (userExpanded.includes(requiredRole)) return next();
    return res.status(403).json({ message: 'Forbidden — insufficient role' });
  };
}

module.exports = { roleHierarchy, expandRoles, requireRole };
