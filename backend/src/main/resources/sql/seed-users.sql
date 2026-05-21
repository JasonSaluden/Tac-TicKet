-- ============================================================
-- Seed : 9 utilisateurs de test (3 AGENT, 6 USER)
-- Mot de passe commun : meme que Alice (puisqu'on reutilise son hash)
-- ============================================================
-- AVANT EXECUTION : remplace $2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6. ci-dessous par le hash recupere via
--   SELECT password FROM users WHERE email = 'alice.admin@tictac.test';
--
-- INSERT IGNORE : si un email existe deja, la ligne est ignoree au lieu
-- de faire planter tout le script. Idempotent — peut etre rejoue.
-- ============================================================

INSERT IGNORE INTO users (first_name, last_name, email, password, created_at, id_role) VALUES
  ('Bruno',     'Dupont',  'bruno.agent@tictac.test',    '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'AGENT')),
  ('Chloe',     'Lefevre', 'chloe.agent@tictac.test',    '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'AGENT')),
  ('David',     'Moreau',  'david.agent@tictac.test',    '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'AGENT')),
  ('Emma',      'Bernard', 'emma.user@tictac.test',      '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'USER')),
  ('Florian',   'Petit',   'florian.user@tictac.test',   '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'USER')),
  ('Gabrielle', 'Robert',  'gabrielle.user@tictac.test', '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'USER')),
  ('Hugo',      'Richard', 'hugo.user@tictac.test',      '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'USER')),
  ('Ines',      'Durand',  'ines.user@tictac.test',      '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'USER')),
  ('Julien',    'Leroy',   'julien.user@tictac.test',    '$2a$10$oCQyKu.9dvJXdK7Jnzy8Cufj8W7cjekb/WIagRcLnr2R/E4I9Uv6.', NOW(), (SELECT id_role FROM role WHERE name = 'USER'));

-- Verification
SELECT u.id_user, u.first_name, u.last_name, u.email, r.name AS role
FROM users u JOIN role r ON r.id_role = u.id_role
ORDER BY r.name, u.last_name;
