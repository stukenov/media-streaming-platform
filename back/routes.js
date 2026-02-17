async function routes(fastify, options) {
  // Use fastify.pg for PostgreSQL connection
  const client = fastify.pg

  // Register routes
  fastify.register(require('./routes/streams'))
  fastify.register(require('./routes/videos'))

  // Simple route to check database connection
  fastify.get('/ping', async (request, reply) => {
    try {
      const { rows } = await client.query('SELECT NOW()')
      reply.send({ time: rows[0].now })
    } catch (err) {
      reply.code(500).send({ error: 'Database connection error' })
    }
  })
}

module.exports = routes