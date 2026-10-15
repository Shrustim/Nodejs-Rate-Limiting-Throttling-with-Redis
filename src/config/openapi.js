import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    failOnErrors: true,
    definition:{
        openapi: '3.0.4',
        info:{
            title:'OpenAPI practice by shrushti',
            version:'1.0.0',
            description:'Practice API for OpenAPI documentation and generated JavaScript clients'
        },
        servers:[
            {
                url:"http://localhost:3000",
                description:"Local development server"
            }
        ]
    },
    apis:['./docs/openapi.yaml']
}
 const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;