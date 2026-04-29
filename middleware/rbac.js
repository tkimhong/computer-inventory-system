const rbac = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      if (req.accepts("html")) {
        return res.status(403).render("error", {
          title: "Access Denied",
          message: "You do not have permission to view this page.",
        });
      }
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};

module.exports = rbac;