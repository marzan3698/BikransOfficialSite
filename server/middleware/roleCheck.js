export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export function requireAdminOrManager(req, res, next) {
  if (req.userRole !== 'admin' && req.userRole !== 'manager') {
    return res.status(403).json({ error: 'Admin or Manager access required' })
  }
  next()
}
