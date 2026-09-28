'use client';
import { useCallback, useEffect, useState } from 'react';
type Guest = {name:string;adults:number;children_count:number};
export default function GuestList() {
 const [guests,setGuests]=useState<Guest[]>([]);
 const [status,setStatus]=useState<'loading'|'ready'|'unconfigured'|'error'>('loading');
 const load=useCallback(async()=>{try {const r=await fetch('/api/rsvp',{cache:'no-store'});if(!r.ok)throw new Error();const data=await r.json();setGuests(data.guests);setStatus(data.configured?'ready':'unconfigured');}catch{setStatus('error');}},[]);
 useEffect(()=>{load();const timer=setInterval(load,30000);window.addEventListener('rsvp-saved',load);return()=>{clearInterval(timer);window.removeEventListener('rsvp-saved',load);};},[load]);
 const adults=guests.reduce((sum,g)=>sum+g.adults,0), children=guests.reduce((sum,g)=>sum+g.children_count,0);
 return <section className="section guest-section" id="guests"><div className="section-heading"><p className="eyebrow">НАШЕ ТЕПЛЕ КОЛО</p><h2>Будуть <em>із нами</em></h2><p>Гості, які вже підтвердили присутність.</p></div>
 {status==='loading'&&<p role="status">Завантажуємо підтвердження…</p>}
 {status==='error'&&<div role="status"><p>Не вдалося оновити список гостей.</p><button className="calendar" onClick={load}>Спробувати ще раз</button></div>}
 {status==='unconfigured'&&<p className="guest-empty">Список з’явиться після підключення підтверджень присутності.</p>}
 {status==='ready'&&<><div className="guest-totals"><span><strong>{adults+children}</strong> гостей загалом</span><span><strong>{adults}</strong> дорослих</span><span><strong>{children}</strong> дітей</span></div>{guests.length ? <ul className="guest-list">{guests.map((g,i)=><li key={i}><span className="guest-initial" aria-hidden="true">{Array.from(g.name)[0]}</span><div><h3>{g.name}</h3><p>Дорослих: {g.adults}{g.children_count>0&&` · Дітей: ${g.children_count}`}</p></div></li>)}</ul>:<p className="guest-empty">Чекаємо на перші підтвердження. Будьте першими ♡</p>}</>}
 </section>;
}
