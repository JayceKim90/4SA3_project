-- Seed data for testing (PostgreSQL reference only)

INSERT INTO users (id, email, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'alice@university.edu', 'Alice Johnson'),
  ('550e8400-e29b-41d4-a716-446655440002', 'bob@university.edu', 'Bob Smith'),
  ('550e8400-e29b-41d4-a716-446655440003', 'carol@university.edu', 'Carol Williams')
ON CONFLICT (email) DO NOTHING;

INSERT INTO hobby_sessions (
  id, host_id, subject, tags, date, start_time, end_time,
  capacity, address, latitude, longitude, description
) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Weekend watercolor sketching',
    ARRAY['art', 'watercolor', 'outdoor'],
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    '16:00:00',
    6,
    'Community center, Studio room 301',
    40.7128,
    -74.0060,
    'Casual hobby meetup — bring your own supplies'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Board game night',
    ARRAY['games', 'social', 'strategy'],
    CURRENT_DATE + INTERVAL '3 days',
    '10:00:00',
    '12:00:00',
    4,
    'Local café, downtown',
    40.7138,
    -74.0070,
    'Light strategy and party games welcome'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'Python hobby coding circle',
    ARRAY['coding', 'python', 'beginners-welcome'],
    CURRENT_DATE + INTERVAL '1 day',
    '16:00:00',
    '18:00:00',
    8,
    'Public library tech room',
    40.7118,
    -74.0050,
    'Small projects and pair programming for hobbyists'
  )
ON CONFLICT (id) DO NOTHING;
