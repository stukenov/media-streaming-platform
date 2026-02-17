const fp = require('fastify-plugin')

async function dbConnector(fastify, options) {
  fastify.register(require('@fastify/postgres'), {
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname'
  })
}

module.exports = fp(dbConnector)
