export function logEvent(level,event,details = {}){
 console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details
 }))
}