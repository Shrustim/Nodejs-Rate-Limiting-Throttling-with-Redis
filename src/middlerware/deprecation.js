function toDeprecationHeader(date){
    const timeStamp = Math.floor(new Date(date).getTime() / 1000)
   return `@${timeStamp}`
}
export function deprecation(options){
    return (req,res,next) => {
        const {deprecationDate, sunsetDate, documentationUrl} = options;
        res.setHeader('Deprecation',toDeprecationHeader(deprecationDate));
        res.setHeader('Sunset', new Date(sunsetDate).toUTCString());
        if(documentationUrl){
            res.setHeader('Link',`<${documentationUrl}>; rel="deprecation"; type="text/html"`);
        }
        next();
    }
}
