-- Seed data for testing HobbyHop
-- Run this after the schema is created

-- Insert test users
INSERT INTO users (id, email, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'alice@university.edu', 'Alice Johnson'),
  ('550e8400-e29b-41d4-a716-446655440002', 'bob@university.edu', 'Bob Smith'),
  ('550e8400-e29b-41d4-a716-446655440003', 'carol@university.edu', 'Carol Williams')
ON CONFLICT (email) DO NOTHING;

-- Insert test study sessions
INSERT INTO study_sessions (
  id, host_id, subject, tags, date, start_time, end_time, 
  capacity, address, latitude, longitude, description
) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Calculus II',
    ARRAY['math', 'calculus', 'integration'],
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    '16:00:00',
    6,
    'Main Library, Study Room 301',
    40.7128,
    -74.0060,
    'Working on integration techniques and applications'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Organic Chemistry',
    ARRAY['chemistry', 'organic', 'reactions'],
    CURRENT_DATE + INTERVAL '3 days',
    '10:00:00',
    '12:00:00',
    4,
    'Science Building, Room 205',
    40.7138,
    -74.0070,
    'Review session for midterm exam'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'Data Structures',
    ARRAY['computer-science', 'algorithms', 'coding'],
    CURRENT_DATE + INTERVAL '1 day',
    '16:00:00',
    '18:00:00',
    8,
    'Computer Lab, Building C',
    40.7118,
    -74.0050,
    'Practice problems on trees and graphs'
  )
ON CONFLICT (id) DO NOTHING;
