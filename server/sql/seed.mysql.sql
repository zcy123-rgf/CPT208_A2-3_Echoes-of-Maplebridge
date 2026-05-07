USE `echoes_of_maplebridge`;

INSERT IGNORE INTO story_points (id, short_title, title) VALUES
  ('1', 'Turning Point', 'The Turning Point of the Grand Canal'),
  ('2', 'Sealed Bridge', 'The Sealed Bridge at Night'),
  ('3', 'Trade and Memory', 'Trade, Streets, and Everyday Memory'),
  ('4', 'Night Mooring', 'Night Mooring at Maple Bridge');

INSERT IGNORE INTO users (id, username, display_name, password_hash, password_salt, created_at, last_login_at) VALUES
  ('canal-story-hunter', 'seed_canal_story_hunter', 'Canal Story Hunter', REPEAT('0', 128), REPEAT('0', 32), '2026-05-01 09:00:00.000', '2026-05-05 10:30:00.000'),
  ('suzhou-echo-walker', 'seed_suzhou_echo_walker', 'Suzhou Echo Walker', REPEAT('0', 128), REPEAT('0', 32), '2026-05-01 09:10:00.000', '2026-05-05 07:15:00.000'),
  ('moon-bell-collector', 'seed_moon_bell_collector', 'Moon Bell Collector', REPEAT('0', 128), REPEAT('0', 32), '2026-05-01 09:20:00.000', '2026-05-04 09:00:00.000'),
  ('bridge-sketchbook', 'seed_bridge_sketchbook', 'Bridge Sketchbook', REPEAT('0', 128), REPEAT('0', 32), '2026-05-01 09:30:00.000', '2026-05-03 13:20:00.000');

INSERT IGNORE INTO progress (user_id, current_story_point_index, collected_fragments_json, updated_at) VALUES
  (
    'canal-story-hunter',
    2,
    JSON_ARRAY(
      JSON_OBJECT('id', '1', 'title', 'The Turning Point', 'content', 'Maple Bridge marked the turning point where the Grand Canal entered Suzhou.', 'poet', 'Canal Memory', 'location', 'Maple Bridge'),
      JSON_OBJECT('id', '2', 'title', 'The Sealed Bridge at Night', 'content', 'Long before it was known as Maple Bridge, this ancient crossing bore a different name: Sealed Bridge.', 'poet', 'Historical Record', 'location', 'Maple Bridge')
    ),
    '2026-05-05 10:30:00.000'
  ),
  (
    'suzhou-echo-walker',
    1,
    JSON_ARRAY(
      JSON_OBJECT('id', '1', 'title', 'The Turning Point', 'content', 'Maple Bridge marked the turning point where the Grand Canal entered Suzhou.', 'poet', 'Canal Memory', 'location', 'Maple Bridge')
    ),
    '2026-05-05 07:15:00.000'
  ),
  (
    'moon-bell-collector',
    3,
    JSON_ARRAY(
      JSON_OBJECT('id', '1', 'title', 'The Turning Point', 'content', 'Maple Bridge marked the turning point where the Grand Canal entered Suzhou.', 'poet', 'Canal Memory', 'location', 'Maple Bridge'),
      JSON_OBJECT('id', '2', 'title', 'The Sealed Bridge at Night', 'content', 'Long before it was known as Maple Bridge, this ancient crossing bore a different name: Sealed Bridge.', 'poet', 'Historical Record', 'location', 'Maple Bridge'),
      JSON_OBJECT('id', '3', 'title', 'Trade and Memory', 'content', 'Beyond poetry, Maple Bridge was part of a commercial and everyday canal landscape.', 'poet', 'Urban Memory', 'location', 'Maple Bridge')
    ),
    '2026-05-04 09:00:00.000'
  ),
  (
    'bridge-sketchbook',
    4,
    JSON_ARRAY(
      JSON_OBJECT('id', '1', 'title', 'The Turning Point', 'content', 'Maple Bridge marked the turning point where the Grand Canal entered Suzhou.', 'poet', 'Canal Memory', 'location', 'Maple Bridge'),
      JSON_OBJECT('id', '2', 'title', 'The Sealed Bridge at Night', 'content', 'Long before it was known as Maple Bridge, this ancient crossing bore a different name: Sealed Bridge.', 'poet', 'Historical Record', 'location', 'Maple Bridge'),
      JSON_OBJECT('id', '3', 'title', 'Trade and Memory', 'content', 'Beyond poetry, Maple Bridge was part of a commercial and everyday canal landscape.', 'poet', 'Urban Memory', 'location', 'Maple Bridge'),
      JSON_OBJECT('id', '4', 'title', 'Night Mooring at Maple Bridge', 'content', 'Outside the city of Gusu, the temple of Cold Mountain; Rings at midnight its bell and reaches my boat.', 'poet', 'Zhang Ji, Tang Dynasty', 'location', 'Maple Bridge')
    ),
    '2026-05-03 13:20:00.000'
  );

INSERT IGNORE INTO photos (
  id, user_id, user_name, caption, image_url, thumbnail_url,
  story_point_id, story_point_title, likes, created_at,
  width, height, original_size_bytes, optimized_size_bytes, upload_kind, moderation_status
) VALUES
  (
    'photo-1',
    'canal-story-hunter',
    'Canal Story Hunter',
    'The bridge at golden hour, still holding the quiet of the old canal route.',
    'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1763336323425-8c9ba61fc3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGluZXNlJTIwYnJpZGdlJTIwd2F0ZXIlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=480&utm_source=figma&utm_medium=referral',
    '1',
    'The Turning Point of the Grand Canal',
    124,
    '2026-05-05 10:30:00.000',
    NULL,
    NULL,
    NULL,
    NULL,
    'legacy',
    'approved'
  ),
  (
    'photo-2',
    'suzhou-echo-walker',
    'Suzhou Echo Walker',
    'A softer evening on the sealed bridge, where regulation once shaped the night.',
    'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1761813378459-7ab89bc3345c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGJyaWRnZSUyMHN1bnNldCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=480&utm_source=figma&utm_medium=referral',
    '2',
    'The Sealed Bridge at Night',
    116,
    '2026-05-05 07:15:00.000',
    NULL,
    NULL,
    NULL,
    NULL,
    'legacy',
    'approved'
  ),
  (
    'photo-3',
    'moon-bell-collector',
    'Moon Bell Collector',
    'Trade, water, and routine life. This place feels bigger when you look past the poem.',
    'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1749888197235-259de414f349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGJvYXQlMjB3YXRlciUyMENoaW5hfGVufDF8fHx8MTc3NDgwODM2M3ww&ixlib=rb-4.1.0&q=80&w=480&utm_source=figma&utm_medium=referral',
    '3',
    'Trade, Streets, and Everyday Memory',
    103,
    '2026-05-04 09:00:00.000',
    NULL,
    NULL,
    NULL,
    NULL,
    'legacy',
    'approved'
  ),
  (
    'photo-4',
    'bridge-sketchbook',
    'Bridge Sketchbook',
    'Night falls on Maple Bridge, and the poem suddenly makes emotional sense.',
    'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1766953597804-893f1993b8af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHJpdmVyJTIwdHJhZGl0aW9uYWwlMjBicmlkZ2UlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3NDgwODM2Mnww&ixlib=rb-4.1.0&q=80&w=480&utm_source=figma&utm_medium=referral',
    '4',
    'Night Mooring at Maple Bridge',
    88,
    '2026-05-03 13:20:00.000',
    NULL,
    NULL,
    NULL,
    NULL,
    'legacy',
    'approved'
  );
