export function versionHeaders(version){
    return (req, res, next) => {
        res.setHeader("X-API-Version", version);
        next();
    }
}