const helmet= require('helmet')

const securityMiddleware=helmet({
    contentSecurityPolicy:{
     directives:{
        defaultSrc:["'self'"],
        styleSrc:["'self'","'unsafe-pin'"],
        scriptSrc:["self'"]
     }
    },
    
    //allowing pdf embedding
    crossOriginEmbedderPolicy: false
})