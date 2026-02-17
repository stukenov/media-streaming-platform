# Media Streaming Platform

A full-stack media streaming platform with video upload, processing, and playback capabilities. Features a modern Next.js dashboard, Fastify backend API, and media server integration.

## Features

- **Video Upload & Management**: S3-compatible object storage for video files
- **Streaming Support**: Integration with MediaMTX for live and on-demand streaming
- **Modern Dashboard**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **REST API**: Fastify-based backend with PostgreSQL database
- **Real-time Updates**: Support for live streaming and on-demand playback
- **Presigned URLs**: Secure video upload via S3 presigned URLs
- **Video Processing**: Python-based video processing capabilities

## Tech Stack

### Frontend (`/front`)
- **Framework**: Next.js 15
- **UI**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Video Player**: HLS.js

### Backend (`/back`)
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: @fastify/postgres
- **Storage**: S3-compatible object storage
- **File Upload**: @fastify/multipart
- **Environment**: dotenv

### Media Server (`/mediamtx`)
- MediaMTX for HLS/RTMP streaming

### Additional Components
- Python scripts for video processing
- PHP scripts for legacy integrations

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- S3-compatible object storage (AWS S3, MinIO, etc.)
- Redis (optional)
- Python 3.8+ (for video processing)
- MediaMTX (included in `/mediamtx`)

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/stukenov/media-streaming-platform.git
cd media-streaming-platform
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example back/.env
```

Edit `back/.env` with your credentials:
```env
DATABASE_URI=postgresql://username:password@localhost:5432/database_name
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your-bucket-name
REDIS_URI=redis://localhost:6379
SUPER_SECRET=your_secret_key
```

### 3. Database Setup

Create PostgreSQL database and run migrations:
```bash
cd back
psql -U postgres -c "CREATE DATABASE your_database_name;"
# Run your SQL migrations from back/init.sql or similar
```

### 4. Backend Installation

```bash
cd back
npm install
npm start
```

The backend will run on `http://localhost:3000`

### 5. Frontend Installation

```bash
cd front
npm install
npm run dev
```

The frontend will run on `http://localhost:3001`

### 6. Media Server Setup

Configure and start MediaMTX:
```bash
cd mediamtx
# Edit mediamtx.yml for your configuration
./mediamtx
```

## Project Structure

```
.
├── back/                    # Backend API
│   ├── config/             # Configuration files
│   ├── plugins/            # Fastify plugins
│   ├── routes/             # API routes
│   │   ├── videos.js       # Video upload/management
│   │   ├── streams.js      # Streaming endpoints
│   │   └── users.js        # User management
│   ├── server.js           # Main server file
│   └── package.json
│
├── front/                   # Frontend dashboard
│   ├── src/                # Source files
│   │   ├── app/            # Next.js app directory
│   │   └── components/     # React components
│   ├── public/             # Static assets
│   └── package.json
│
├── mediamtx/               # Media server
│   ├── mediamtx.yml        # Configuration
│   └── hls/                # HLS output directory
│
├── main.py                 # Video processing script
├── index.php               # PHP integration
├── .env.example            # Environment template
└── README.md               # This file
```

## API Endpoints

### Videos

- `POST /videos/upload-url` - Get presigned URL for video upload
  - Body: `{ filename, contentType, fileSize }`
  - Returns: `{ uploadUrl, key }`

- `GET /videos` - List all videos
- `GET /videos/:id` - Get video details
- `DELETE /videos/:id` - Delete video

### Streams

- `GET /streams` - List active streams
- `POST /streams` - Create new stream
- `GET /streams/:id` - Get stream details

### Health

- `GET /ping` - Check API and database health

## Features in Detail

### Video Upload Flow

1. Frontend requests presigned URL from backend
2. Backend generates S3 presigned URL with 1-hour expiration
3. Frontend uploads directly to S3 using presigned URL
4. Backend stores video metadata in PostgreSQL
5. Video is available for streaming via MediaMTX

### Supported Video Formats

- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- QuickTime (video/quicktime)

Maximum file size: 2GB

### Security Features

- Presigned URLs with expiration
- Environment-based configuration
- Database password masking in logs
- File type validation
- File size limits

## Development

### Running in Development Mode

Backend:
```bash
cd back
npm run dev
```

Frontend:
```bash
cd front
npm run dev
```

### Building for Production

Frontend:
```bash
cd front
npm run build
npm start
```

Backend:
```bash
cd back
npm start
```

## Third-Party Dependencies

This project integrates with [Superstreamer](https://github.com/matvp91/superstreamer) for advanced video processing and streaming capabilities. Due to its size and separate licensing, it's excluded from this repository. Please follow Superstreamer's documentation for integration.

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URI` | PostgreSQL connection string | Yes | - |
| `S3_ENDPOINT` | S3-compatible storage endpoint | Yes | - |
| `S3_REGION` | S3 region | Yes | us-east-1 |
| `S3_ACCESS_KEY` | S3 access key | Yes | - |
| `S3_SECRET_KEY` | S3 secret key | Yes | - |
| `S3_BUCKET` | S3 bucket name | Yes | - |
| `REDIS_URI` | Redis connection string | No | - |
| `SUPER_SECRET` | Application secret key | Yes | - |
| `PORT` | Backend server port | No | 3000 |

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URI format: `postgresql://user:pass@host:port/dbname`
- Ensure database exists and user has permissions

### S3 Upload Failures
- Verify S3 credentials and bucket permissions
- Check S3_ENDPOINT is correct and accessible
- Ensure CORS is configured on S3 bucket

### Video Playback Issues
- Verify MediaMTX is running
- Check video format is supported
- Ensure HLS segments are being generated

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Saken Tukenov

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Superstreamer](https://github.com/matvp91/superstreamer) - Video processing framework
- [MediaMTX](https://github.com/bluenviron/mediamtx) - Media server
- [Fastify](https://www.fastify.io/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
