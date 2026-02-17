const { S3Client, ListBucketsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  config: {
    cors: true,
    useAccelerateEndpoint: false
  },
  logger: console
})

const testConnection = async () => {
  try {
    const command = new HeadBucketCommand({
      Bucket: process.env.S3_BUCKET
    })
    await s3Client.send(command)
    console.log('S3 connection successful')
  } catch (error) {
    console.error('S3 connection failed:', error)
  }
}

testConnection()

module.exports = s3Client 