-- PostgreSQL Schema for HobbyHop
-- Run this script when database integration is added

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  place_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Session participants table
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(session_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_host ON study_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON study_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_sessions_latitude ON study_sessions(latitude);
CREATE INDEX IF NOT EXISTS idx_sessions_longitude ON study_sessions(longitude);
CREATE INDEX IF NOT EXISTS idx_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON session_participants(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_study_sessions_updated_at
  BEFORE UPDATE ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
