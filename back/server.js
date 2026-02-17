// Load environment variables
require('dotenv').config()

// Import the framework and instantiate it
const Fastify = require('fastify')
const fastify = Fastify({
  logger: true,
  bodyLimit: 1024 * 1024 * 1024 * 2, // 2GB
})

// Multipart configuration
fastify.register(require('@fastify/multipart'), {
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 10,
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
    files: 1,
    headerPairs: 2000
  },
  attachFieldsToBody: false,
  addToBody: false
})

// Check required environment variables
const requiredEnvVars = [
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET',
  'DATABASE_URI'
]

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars)
  process.exit(1)
}

console.log('Environment variables:', {
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
  DATABASE_URI: process.env.DATABASE_URI?.replace(/:[^:]*@/, ':***@') // Hide password
})

// Register database connection first
fastify.register(require('./plugins/db'))

// Затем регистрируем маршруты
fastify.register(require('./routes'))

// Run the server!
fastify.listen({ port: process.env.PORT || 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})