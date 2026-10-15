export function authorize(...allowedRoles){
     return (req, res, next) => {
        if(!req.auth){
            return res.status(401).json({
                message:"Authentication required"
            })
        }
        const hasRequiredRole = req.auth.roles.some((role) => allowedRoles.includes(role));
        if(!hasRequiredRole){
            return res.status(403).json({
                message:"Forbidden", roles:req.auth.roles
            })
        }
        next();

     }
}