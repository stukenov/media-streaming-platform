-- Создаем таблицы с префиксом back_
CREATE TABLE IF NOT EXISTS back_streams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавьте другие необходимые таблицы здесь 

-- Добавляем в существующий файл
CREATE TABLE IF NOT EXISTS back_videos (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(255) NOT NULL,
    size BIGINT,
    duration INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Даем права на таблицу пользователю
GRANT ALL PRIVILEGES ON TABLE back_videos TO sprs;
GRANT USAGE, SELECT ON SEQUENCE back_videos_id_seq TO sprs; 