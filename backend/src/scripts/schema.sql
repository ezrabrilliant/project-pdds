-- Netflix Recommendation System Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS movie_genres CASCADE;
DROP TABLE IF EXISTS tvshow_genres CASCADE;
DROP TABLE IF EXISTS genres CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS tv_shows CASCADE;

-- Create genres table (normalized)
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create movies table
CREATE TABLE movies (
    show_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    director TEXT,
    cast_members TEXT,
    country VARCHAR(200),
    date_added DATE,
    release_year INTEGER,
    rating VARCHAR(20),
    duration_minutes INTEGER,
    language VARCHAR(10),
    description TEXT,
    popularity DECIMAL(10,3),
    vote_count INTEGER,
    vote_average DECIMAL(4,2),
    budget BIGINT,
    revenue BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create TV shows table
CREATE TABLE tv_shows (
    show_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    director TEXT,
    cast_members TEXT,
    country VARCHAR(200),
    date_added DATE,
    release_year INTEGER,
    rating VARCHAR(20),
    duration VARCHAR(50), -- e.g., "3 Seasons"
    language VARCHAR(10),
    description TEXT,
    popularity DECIMAL(10,3),
    vote_count INTEGER,
    vote_average DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for movie genres (many-to-many)
CREATE TABLE movie_genres (
    movie_id VARCHAR(20) REFERENCES movies(show_id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- Junction table for TV show genres (many-to-many)
CREATE TABLE tvshow_genres (
    tvshow_id VARCHAR(20) REFERENCES tv_shows(show_id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (tvshow_id, genre_id)
);

-- Create indexes for better performance
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_release_year ON movies(release_year);
CREATE INDEX idx_movies_popularity ON movies(popularity);
CREATE INDEX idx_movies_vote_average ON movies(vote_average);
CREATE INDEX idx_movies_country ON movies(country);

CREATE INDEX idx_tvshows_title ON tv_shows(title);
CREATE INDEX idx_tvshows_release_year ON tv_shows(release_year);
CREATE INDEX idx_tvshows_popularity ON tv_shows(popularity);
CREATE INDEX idx_tvshows_vote_average ON tv_shows(vote_average);
CREATE INDEX idx_tvshows_country ON tv_shows(country);

CREATE INDEX idx_genres_name ON genres(name);

-- Insert common genres (we'll populate more from CSV data)
INSERT INTO genres (name) VALUES 
    ('Action'), ('Adventure'), ('Animation'), ('Comedy'), ('Crime'),
    ('Documentary'), ('Drama'), ('Family'), ('Fantasy'), ('Horror'),
    ('Music'), ('Mystery'), ('Romance'), ('Science Fiction'), ('Thriller'),
    ('War'), ('Western'), ('Biography'), ('History'), ('Sport');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tvshows_updated_at BEFORE UPDATE ON tv_shows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
