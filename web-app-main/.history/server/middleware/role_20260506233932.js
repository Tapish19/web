module.exports = (...allowedRoles) => {
    return (req, res, next) => {

        // No user attached
        if (!req.user) {
            return res.status(401).json({
                msg: "Unauthorized"
            });
        }

        // Role not allowed
        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }

        next();
    };
};