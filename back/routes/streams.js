module.exports = async function (fastify, options) {
  
  fastify.post('/streams', async (request, reply) => {
    const { name } = request.body
    
    const streamKey = generateStreamKey()
    
    try {
      const { rows } = await fastify.pg.query(
        'INSERT INTO back_streams (name, key) VALUES ($1, $2) RETURNING *',
        [name, streamKey]
      )
      reply.code(201).send(rows[0])
    } catch (err) {
      reply.code(500).send({ error: 'Error creating stream' })
    }
  })
  
  fastify.get('/streams', async (request, reply) => {
    try {
      const { rows } = await fastify.pg.query(
        'SELECT * FROM back_streams'
      )
      reply.send(rows)
    } catch (err) {
      reply.code(500).send({ error: 'Error fetching streams' })
    }
  })
}