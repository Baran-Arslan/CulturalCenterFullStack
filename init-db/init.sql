
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TEXT,
  seats INTEGER DEFAULT 0,
  booked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  name TEXT,
  email TEXT,
  qty INTEGER,
  reference TEXT,
  created_at TIMESTAMP DEFAULT now()
);

INSERT INTO events (title, description, date, time, seats, booked) VALUES
('Contemporary Art Exhibition','A curated exhibition showcasing contemporary painters from the region.','2025-12-10','18:00',30,5),
('Community Jazz Night','Local jazz bands and open jam session. Drinks available.','2025-12-12','20:00',50,42),
('Kids: Creative Workshop','Hands-on creative workshop for children aged 6-12.','2025-12-14','11:00',20,2);
