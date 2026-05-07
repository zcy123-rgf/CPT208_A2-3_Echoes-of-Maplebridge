CREATE DATABASE IF NOT EXISTS `echoes_of_maplebridge`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `echoes_of_maplebridge`;

CREATE TABLE IF NOT EXISTS story_points (
  id VARCHAR(20) PRIMARY KEY,
  short_title VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(80) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  password_hash CHAR(128) NOT NULL,
  password_salt CHAR(32) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  last_login_at DATETIME(3) NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(48) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_expires_at (expires_at),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress (
  user_id VARCHAR(80) PRIMARY KEY,
  current_story_point_index INT NOT NULL DEFAULT 0,
  collected_fragments_json JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photos (
  id VARCHAR(80) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  caption VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  story_point_id VARCHAR(20) NOT NULL,
  story_point_title VARCHAR(255) NOT NULL,
  likes INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL,
  width INT NULL,
  height INT NULL,
  original_size_bytes INT NULL,
  optimized_size_bytes INT NULL,
  upload_kind VARCHAR(64) NOT NULL DEFAULT 'optimized',
  moderation_status VARCHAR(64) NOT NULL DEFAULT 'approved',
  INDEX idx_photos_story_point_id (story_point_id),
  INDEX idx_photos_created_at (created_at DESC),
  INDEX idx_photos_user_id (user_id),
  CONSTRAINT fk_photos_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS photo_bookmarks (
  user_id VARCHAR(80) NOT NULL,
  photo_id VARCHAR(80) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (user_id, photo_id),
  INDEX idx_photo_bookmarks_photo_id (photo_id),
  CONSTRAINT fk_photo_bookmarks_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_photo_bookmarks_photo
    FOREIGN KEY (photo_id) REFERENCES photos(id)
    ON DELETE CASCADE
);
