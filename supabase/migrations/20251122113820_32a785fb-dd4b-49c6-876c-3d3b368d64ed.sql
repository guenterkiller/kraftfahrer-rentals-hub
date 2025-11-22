-- Insert 5 seed messages for the community chat
INSERT INTO trucker_chat_messages (user_name, message, created_at) VALUES 
('Tom K.', 'Servus zusammen, steh gerade am Autohof Geiselwind, alles voll wie immer. Jemand noch hier unterwegs? Kaffee ist wenigstens heiß 😅', NOW() - INTERVAL '4 hours'),
('Micha S.', 'Kurze Frage: Weiß jemand, ob die A3 Baustelle hinter Würzburg heute offen ist? War letzte Woche Horror…', NOW() - INTERVAL '3 hours'),
('Alex M.', 'Hi zusammen, mach gerade 45er Pause an der A6 Richtung Mannheim. Jemand in der Ecke? Wetter ist voll am Umkippen.', NOW() - INTERVAL '2 hours'),
('Ralf B.', 'Kleiner Tipp: Autohof Sittensen hat neue Duschen, echt sauber geworden. Kann man empfehlen 👍', NOW() - INTERVAL '1 hour'),
('Benno H.', 'Moin, wie läuft bei euch der Tag? Hab heute 3x ewig aufs Tor warten müssen. Montag halt… 🤦‍♂️', NOW() - INTERVAL '30 minutes');