
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  host: process.env.PGHOST || 'db',
  port: parseInt(process.env.PGPORT) || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'cultural_db'
});

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

app.get('/api/health', (req, res) => res.json({ok:true}));

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date, time');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error:'db error'});
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { eventId, name, email, qty } = req.body;
    if(!eventId || !name || !email || !qty) return res.status(400).json({error:'invalid'});
    // check availability
    const evRes = await pool.query('SELECT * FROM events WHERE id=$1', [eventId]);
    if(evRes.rowCount===0) return res.status(404).json({error:'event not found'});
    const ev = evRes.rows[0];
    const remaining = ev.seats - ev.booked;
    if(qty > remaining) return res.status(400).json({error:'not enough seats'});
    // insert booking
    const ref = 'BC' + Math.random().toString(36).slice(2,8).toUpperCase();
    await pool.query('INSERT INTO bookings(event_id, name, email, qty, reference) VALUES($1,$2,$3,$4,$5)', [eventId,name,email,qty,ref]);
    await pool.query('UPDATE events SET booked = booked + $1 WHERE id=$2', [qty, eventId]);
    res.json({ok:true, reference: ref});
  } catch(err) {
    console.error(err);
    res.status(500).json({error:'server error'});
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({email, role:'admin'}, JWT_SECRET, {expiresIn:'8h'});
    return res.json({token});
  }
  res.status(401).json({error:'unauthorized'});
});

// Protected route example
function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'no token'});
  const parts = auth.split(' ');
  if(parts.length!==2) return res.status(401).json({error:'bad auth'});
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch(err) {
    return res.status(401).json({error:'invalid token'});
  }
}

app.get('/api/bookings', authMiddleware, async (req,res)=>{
  try{
    const r = await pool.query('SELECT b.*, e.title FROM bookings b JOIN events e ON b.event_id = e.id ORDER BY b.created_at DESC');
    res.json(r.rows);
  }catch(err){ console.error(err); res.status(500).json({error:'db'}); }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Backend listening on', PORT));
