-- PostgreSQL reference schema for HobbyHop (optional; app uses MongoDB by default)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hobby meetups (replaces legacy study_sessions)
CREATE TABLE IF NOT EXISTS hobby_sessions (
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

CREATE TABLE IF NOT EXISTS hobby_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hobby_id UUID NOT NULL REFERENCES hobby_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(hobby_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hobby_sessions_host ON hobby_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_hobby_sessions_date ON hobby_sessions(date);
CREATE INDEX IF NOT EXISTS idx_hobby_sessions_subject ON hobby_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_hobby_sessions_latitude ON hobby_sessions(latitude);
CREATE INDEX IF NOT EXISTS idx_hobby_sessions_longitude ON hobby_sessions(longitude);
CREATE INDEX IF NOT EXISTS idx_hobby_participants_hobby ON hobby_participants(hobby_id);
CREATE INDEX IF NOT EXISTS idx_hobby_participants_user ON hobby_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_hobby_participants_status ON hobby_participants(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hobby_sessions_updated_at
  BEFORE UPDATE ON hobby_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
