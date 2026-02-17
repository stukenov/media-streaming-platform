'use strict'

const fp = require('fastify-plugin')
const postgres = require('@fastify/postgres')

module.exports = fp(async function (fastify, opts) {
  fastify.register(postgres, {
    connectionString: process.env.DATABASE_URI,
    // Добавляем дополнительные опции для отладки
    pool: {
      min: 1,
      max: 10,
      log: (msg, level) => {
        console.log('DB:', level, msg)
      }
    }
  })
}) 