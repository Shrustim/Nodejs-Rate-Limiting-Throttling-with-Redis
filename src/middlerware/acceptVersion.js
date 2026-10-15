import semver from "semver"
const supportedVersion = ['1.0.0'];
export function acceptVersion(req, res, next){
    const requestedVersion = req.get('Accept-Version')
    if(!requestedVersion){
        req.apiVersion = '1.0.0'
        return next();
    }
    const matchingVersion = semver.maxSatisfying(supportedVersion,requestedVersion);
    if(!matchingVersion){
        return res.status(406).json({
            error: 'Unsupported API version',
            requestedVersion,
            supportedVersion
        });
    }
    req.apiVersion = matchingVersion;
    next();
}