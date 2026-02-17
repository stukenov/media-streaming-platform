const { test } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

test('API routes test', async (t) => {
  const fastify = Fastify()
  
  // Регистрируем все плагины и маршруты
  await fastify.register(require('../db'))
  await fastify.register(require('../routes'))

  await t.test('GET /ping should return 200', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/ping'
    })
    assert.equal(response.statusCode, 200)
  })

  await t.test('GET /videos should return 200', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/videos'
    })
    assert.equal(response.statusCode, 200)
  })

  await t.test('POST /videos/upload-url should validate request body', async () => {
    // Тест с неправильными данными
    const invalidResponse = await fastify.inject({
      method: 'POST',
      url: '/videos/upload-url',
      payload: {}
    })
    assert.equal(invalidResponse.statusCode, 400)

    // Тест с правильными данными
    const validResponse = await fastify.inject({
      method: 'POST',
      url: '/videos/upload-url',
      payload: {
        filename: 'test.mp4',
        contentType: 'video/mp4',
        fileSize: 1024
      }
    })
    assert.equal(validResponse.statusCode, 200)
  })

  await t.test('PATCH /videos/:id should validate id', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: '/videos/999999', // несуществующий id
      payload: {
        duration: 120,
        description: 'Test description'
      }
    })
    assert.equal(response.statusCode, 404)
  })

  await t.test('DELETE /videos/:id should validate id', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/videos/999999' // несуществующий id
    })
    assert.equal(response.statusCode, 404)
  })

  // Тест для проверки всех маршрутов стримов
  await t.test('GET /streams should return 200', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/streams'
    })
    assert.equal(response.statusCode, 200)
  })

  await t.test('POST /streams should validate request body', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/streams',
      payload: {
        name: 'Test Stream'
      }
    })
    assert.equal(response.statusCode, 200)
  })

  // Закрываем fastify после всех тестов
  await fastify.close()
}) 