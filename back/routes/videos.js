const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const s3Client = require('../config/s3')
const fs = require('node:fs')
const util = require('node:util')
const pump = util.promisify(require('node:stream').pipeline)

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
]

module.exports = async function (fastify, options) {
  // Добавляем валидацию для загрузки
  const uploadSchema = {
    body: {
      type: 'object',
      required: ['filename', 'contentType', 'fileSize'],
      properties: {
        filename: { type: 'string' },
        contentType: { type: 'string' },
        fileSize: { type: 'number' }
      }
    }
  }

  // Получение пресайн URL для загрузки
  fastify.post('/videos/upload-url', { schema: uploadSchema }, async (request, reply) => {
    const { filename, contentType, fileSize } = request.body

    console.log('Upload request:', { filename, contentType, fileSize })

    // Проверяем тип файла
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return reply.code(400).send({ 
        error: 'Unsupported file type',
        allowedTypes: ALLOWED_MIME_TYPES
      })
    }

    // Проверяем размер файла
    if (fileSize > MAX_FILE_SIZE) {
      return reply.code(400).send({ 
        error: 'File size exceeds limit',
        maxSize: MAX_FILE_SIZE
      })
    }

    const key = `videos/${Date.now()}-${filename}`

    try {
      // Проверяем доступность бакета
      const headBucketCommand = new HeadBucketCommand({
        Bucket: process.env.S3_BUCKET
      })
      await s3Client.send(headBucketCommand)
      console.log('Bucket is accessible')

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
        ContentLength: fileSize
      })

      console.log('Generating presigned URL for:', {
        bucket: process.env.S3_BUCKET,
        key,
        contentType,
        fileSize
      })

      const uploadUrl = await getSignedUrl(s3Client, command, { 
        expiresIn: 3600,
        // Добавляем все необходимые заголовки
        signableHeaders: new Set([
          'content-type',
          'content-length',
          'host',
          'origin',
          'access-control-request-headers',
          'access-control-request-method'
        ])
      })
      
      console.log('Generated upload URL:', uploadUrl)

      // Сохраняем информацию о видео в БД
      const { rows } = await fastify.pg.query(
        'INSERT INTO back_videos (filename, s3_key, size) VALUES ($1, $2, $3) RETURNING id',
        [filename, key, fileSize]
      )

      reply.send({ 
        uploadUrl,
        videoId: rows[0].id,
        key,
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT
      })
    } catch (err) {
      console.error('Error in upload process:', err)
      reply.code(500).send({ error: 'Failed to generate upload URL', details: err.message })
    }
  })

  // Загрузка видео
  fastify.post('/videos/upload', async function (request, reply) {
    try {
      console.log('Starting file upload...')

      const data = await request.file()
      
      if (!data) {
        console.log('No file in request')
        throw new Error('No file uploaded')
      }

      console.log('File info:', {
        filename: data.filename,
        mimetype: data.mimetype,
        encoding: data.encoding
      })

      // Проверяем тип файла
      if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
        throw new Error('Unsupported file type')
      }

      // Читаем файл в буфер
      const chunks = []
      for await (const chunk of data.file) {
        chunks.push(chunk)
      }
      const fileBuffer = Buffer.concat(chunks)
      const filesize = fileBuffer.length

      console.log('File size:', filesize)

      // Проверяем размер
      if (filesize > MAX_FILE_SIZE) {
        throw new Error('File too large')
      }

      const key = `videos/${Date.now()}-${data.filename}`

      // Загружаем в S3
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: data.mimetype
      })

      await s3Client.send(command)
      console.log('File uploaded to S3:', key)

      // Сохраняем в БД
      const { rows } = await fastify.pg.query(
        'INSERT INTO back_videos (filename, s3_key, size) VALUES ($1, $2, $3) RETURNING id',
        [data.filename, key, filesize]
      )

      reply.send({ 
        id: rows[0].id,
        key,
        filename: data.filename,
        size: filesize
      })

    } catch (err) {
      console.error('Upload error:', err)
      reply.code(500).send({ 
        error: err.message,
        details: err.stack
      })
    }
  })

  // Обновление информации о видео
  fastify.patch('/videos/:id', async (request, reply) => {
    const { id } = request.params
    const { duration, description } = request.body

    try {
      const { rows } = await fastify.pg.query(
        'UPDATE back_videos SET duration = $1, description = $2 WHERE id = $3 RETURNING *',
        [duration, description, id]
      )

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Video not found' })
      }

      reply.send(rows[0])
    } catch (err) {
      console.error('Error updating video:', err)
      reply.code(500).send({ error: 'Failed to update video' })
    }
  })

  // Получение списка видео
  fastify.get('/videos', async (request, reply) => {
    try {
      // Проверяем подключение к базе
      await fastify.pg.query('SELECT 1')
      
      const { rows } = await fastify.pg.query(
        'SELECT * FROM back_videos ORDER BY created_at DESC'
      )
      
      // Генерируем URL для просмотра для каждого видео
      const videos = await Promise.all(rows.map(async (video) => {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: video.s3_key
          })
          const viewUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

          return { 
            ...video, 
            url: viewUrl,
            size: video.size || 0,
            contentType: video.content_type || 'video/mp4'
          }
        } catch (err) {
          console.error(`Error processing video ${video.id}:`, err)
          return {
            ...video,
            url: '',
            size: 0,
            contentType: 'video/mp4'
          }
        }
      }))

      reply.send(videos)
    } catch (err) {
      console.error('Error fetching videos:', err)
      // Добавляем больше информации об ошибке
      reply.code(500).send({ 
        error: 'Failed to fetch videos',
        details: err.message,
        code: err.code
      })
    }
  })

  // Добавляем маршрут для удаления видео
  fastify.delete('/videos/:id', async (request, reply) => {
    const { id } = request.params

    try {
      // Получаем информацию о видео
      const { rows } = await fastify.pg.query(
        'SELECT s3_key FROM back_videos WHERE id = $1',
        [id]
      )

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Video not found' })
      }

      // Удаляем файл из S3
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: rows[0].s3_key
      })
      await s3Client.send(command)

      // Удаляем запись из БД
      await fastify.pg.query(
        'DELETE FROM back_videos WHERE id = $1',
        [id]
      )

      reply.code(204).send()
    } catch (err) {
      console.error('Error deleting video:', err)
      reply.code(500).send({ error: 'Failed to delete video' })
    }
  })
} 