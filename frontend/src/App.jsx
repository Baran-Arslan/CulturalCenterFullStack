
import React, {useEffect, useState} from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Nav({user,onLoginClick, onGotoAdmin}){
  return (
    <header style={{background:'#fff', padding:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
      <div style={{maxWidth:960, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:600}}>Cultural Center</div>
        <div>
          <button onClick={onGotoAdmin} style={{marginRight:8}}>Admin</button>
          {user ? <span>Signed in as {user.email}</span> : <button onClick={onLoginClick}>Sign in</button>}
        </div>
      </div>
    </header>
  )
}

function EventList({events, onSelect}){
  return (
    <div style={{maxWidth:960, margin:'20px auto', display:'grid', gap:12}}>
      {events.map(ev=> (
        <div key={ev.id} style={{background:'#fff', padding:12, borderRadius:8}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:600}}>{ev.title}</div>
              <div style={{color:'#6b7280'}}>{ev.date} • {ev.time}</div>
            </div>
            <div>
              <div>Available: <strong>{ev.seats - ev.booked}</strong></div>
              <button onClick={()=>onSelect(ev)} style={{marginTop:8}}>Book</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingForm({event, onCancel, onDone}){
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [qty,setQty]=useState(1);
  const remaining = event.seats - event.booked;
  const submit= async ()=>{
    const res = await fetch(API + '/api/bookings', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({eventId:event.id, name, email, qty})});
    const data = await res.json();
    if(res.ok){ onDone({name,email,qty,reference:data.reference,event}); }
    else alert('Error: '+(data.error || 'unknown'));
  };
  return (
    <div style={{maxWidth:560, margin:'20px auto'}}>
      <div style={{background:'#fff', padding:12, borderRadius:8}}>
        <h3>{event.title}</h3>
        <div style={{color:'#6b7280'}}>{event.date} • {event.time}</div>
        <div style={{marginTop:8}}>
          <input placeholder='Full name' value={name} onChange={e=>setName(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}} />
          <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}} />
          <input type='number' min={1} max={remaining} value={qty} onChange={e=>setQty(Number(e.target.value)||1)} style={{width:'100%', padding:8, marginBottom:8}} />
          <div style={{display:'flex', gap:8}}>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={submit}>Confirm Booking</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginModal({onClose, onLogin}){
  const [email,setEmail]=useState(''); const [pass,setPass]=useState('');
  const submit = async ()=>{
    const res = await fetch(API + '/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email, password:pass})});
    const data = await res.json();
    if(res.ok){ onLogin(data.token); onClose(); }
    else alert('Login failed');
  };
  return (
    <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)'}}>
      <div style={{background:'#fff', padding:12, borderRadius:8, width:320}}>
        <h3>Sign in</h3>
        <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}} />
        <input placeholder='Password' value={pass} onChange={e=>setPass(e.target.value)} type='password' style={{width:'100%', padding:8, marginBottom:8}} />
        <div style={{display:'flex', gap:8}}><button onClick={onClose}>Cancel</button><button onClick={submit}>Sign in</button></div>
      </div>
    </div>
  )
}

export default function App(){
  const [events, setEvents] = useState([]);
  const [phase, setPhase] = useState('list'); // list, details, book, confirm, admin
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token')||null);
  const [user, setUser] = useState(token?{email:'admin@example.com'}:null);

  useEffect(()=>{ fetchEvents(); }, []);

  async function fetchEvents(){
    const r = await fetch(API + '/api/events');
    const data = await r.json();
    setEvents(data);
  }

  const handleSelect = (ev) => { setSelected(ev); setPhase('details'); };
  const handleBook = (ev) => { setSelected(ev); setPhase('book'); };
  const handleDone = (bk) => { setBooking(bk); setPhase('confirm'); fetchEvents(); };
  const handleLogin = (tkn) => { localStorage.setItem('token', tkn); setToken(tkn); setUser({email:'admin@example.com'}); };
  const gotoAdmin = ()=> setPhase('admin');

  return (
    <div>
      <Nav onLoginClick={()=>setShowLogin(true)} user={user} onGotoAdmin={gotoAdmin} />
      {phase==='list' && <EventList events={events} onSelect={handleSelect} />}
      {phase==='details' && selected && (
        <div><div style={{maxWidth:960, margin:'20px auto'}}><button onClick={()=>setPhase('list')}>← Back</button></div>
        <div style={{maxWidth:960, margin:'0 auto'}}><div style={{background:'#fff', padding:12, borderRadius:8}}>
          <h2>{selected.title}</h2>
          <div style={{color:'#6b7280'}}>{selected.date} • {selected.time}</div>
          <p style={{marginTop:8}}>{selected.description}</p>
          <div style={{marginTop:8}}><button onClick={()=>handleBook(selected)}>Book this event</button></div>
        </div></div></div>
      )}
      {phase==='book' && selected && <BookingForm event={selected} onCancel={()=>setPhase('details')} onDone={handleDone} />}
      {phase==='confirm' && booking && (
        <div style={{maxWidth:560, margin:'20px auto'}}>
          <div style={{background:'#fff', padding:12, borderRadius:8}}>
            <h3>Booking Confirmed</h3>
            <div>Reference: {booking.reference}</div>
            <div style={{marginTop:8}}><button onClick={()=>{ setPhase('list'); setBooking(null); }}>Return to events</button></div>
          </div>
        </div>
      )}
      {phase==='admin' && (
        <div style={{maxWidth:960, margin:'20px auto'}}>
          <div style={{background:'#fff', padding:12, borderRadius:8}}>
            <h3>Admin - Bookings</h3>
            <AdminView token={token} />
          </div>
        </div>
      )}
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={handleLogin} />}
    </div>
  )
}

function AdminView({token}){
  const [bookings,setBookings] = useState([]);
  useEffect(()=>{ if(token) fetchBookings(); }, [token]);
  async function fetchBookings(){
    const r = await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/api/bookings', {headers:{Authorization:'Bearer '+token}});
    if(r.ok){ setBookings(await r.json()); } else { alert('Unable to fetch bookings. Ensure you are logged in as admin.'); }
  }
  return (
    <div>
      <div style={{marginBottom:12}}><button onClick={fetchBookings}>Refresh</button></div>
      <div style={{display:'grid', gap:8}}>
        {bookings.map(b=> (
          <div key={b.id} style={{padding:8, background:'#f8fafc', borderRadius:6}}>
            <div><strong>{b.name}</strong> • {b.email}</div>
            <div>Event: {b.title} • Qty: {b.qty} • Ref: {b.reference}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
