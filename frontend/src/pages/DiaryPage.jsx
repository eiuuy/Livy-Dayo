import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

const MOODS = [
  { key:'great', emoji:'😄', label:'Отлично' },
  { key:'good',  emoji:'🙂', label:'Хорошо' },
  { key:'neutral', emoji:'😐', label:'Норм' },
  { key:'bad',   emoji:'😔', label:'Плохо' },
  { key:'awful', emoji:'😢', label:'Ужасно' },
];

export default function DiaryPage() {
  const { theme: t } = useTheme();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title:'', content:'', mood:'neutral', tags:'' });

  const load = () => api.get('/diary').then(r => setEntries(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({title:'',content:'',mood:'neutral',tags:''}); setShowForm(true); setSelected(null); };
  const openEdit = e => { setEditing(e.id); setForm({title:e.title,content:e.content,mood:e.mood,tags:e.tags}); setShowForm(true); setSelected(null); };
  const save = async ev => { ev.preventDefault(); if(editing) await api.patch(`/diary/${editing}`,form); else await api.post('/diary',form); setShowForm(false); setEditing(null); load(); };
  const del = async id => { if(window.confirm('Удалить запись?')) { await api.delete(`/diary/${id}`); load(); setSelected(null); }};
  const moodOf = key => MOODS.find(m=>m.key===key) || MOODS[2];

  if (showForm) return (
    <div style={{ padding:20 }}>
      <div className="anim-fadeIn" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', color:t.accent, fontSize:15, cursor:'pointer', fontWeight:600 }}>← Назад</button>
        <h2 style={{ color:t.text, margin:0, fontSize:18, fontWeight:700 }}>{editing?'Редактировать':'Новая запись'}</h2>
        <div style={{ width:60 }} />
      </div>
      <form onSubmit={save} className="anim-fadeUp" style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <input style={inp(t)} placeholder="Заголовок (необязательно)" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <textarea style={{...inp(t), resize:'vertical', lineHeight:1.6}} rows={8} placeholder="Что произошло? О чём думаешь?..." value={form.content} onChange={e=>setForm({...form,content:e.target.value})} required />
        <div>
          <p style={{ color:t.textMuted, fontSize:12, marginBottom:10 }}>Настроение</p>
          <div style={{ display:'flex', gap:6, justifyContent:'space-between' }}>
            {MOODS.map(m => (
              <button type="button" key={m.key} onClick={()=>setForm({...form,mood:m.key})}
                style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', transition:'all .2s',
                  background:form.mood===m.key ? t.bgSecondary : 'transparent',
                  border:`2px solid ${form.mood===m.key ? t.accent : 'transparent'}`,
                  transform:form.mood===m.key ? 'scale(1.1)' : 'scale(1)' }}>
                <span style={{ fontSize:26 }}>{m.emoji}</span>
                <span style={{ fontSize:10, color:form.mood===m.key?t.accent:t.textMuted }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
        <input style={inp(t)} placeholder="Теги: работа, здоровье, семья" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
        <button type="submit" className="press" style={{ padding:14, borderRadius:12, border:'none', background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer' }}>Сохранить</button>
      </form>
    </div>
  );

  if (selected) {
    const e = entries.find(x=>x.id===selected);
    if (!e) return null;
    const m = moodOf(e.mood);
    const date = new Date(e.date).toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    return (
      <div style={{ padding:20 }}>
        <div className="anim-fadeIn" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:t.accent, fontSize:15, cursor:'pointer', fontWeight:600 }}>← Назад</button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>openEdit(e)} style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:10, padding:'6px 12px', cursor:'pointer', color:t.textMuted, fontSize:13 }}>✏️ Изменить</button>
            <button onClick={()=>del(e.id)} style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:10, padding:'6px 12px', cursor:'pointer', color:t.danger, fontSize:13 }}>🗑️</button>
          </div>
        </div>
        <div className="anim-fadeUp" style={{ background:t.bgCard, borderRadius:16, padding:20, border:`1px solid ${t.border}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <span style={{ color:t.textMuted, fontSize:13 }}>{date}</span>
            <span style={{ fontSize:22 }}>{m.emoji}</span>
          </div>
          {e.title && <h2 style={{ color:t.text, fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{e.title}</h2>}
          <p style={{ color:t.text, fontSize:15, lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>{e.content}</p>
          {e.tags && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:14 }}>{e.tags.split(',').map(t2=>t2.trim()).filter(Boolean).map(tag=><span key={tag} style={{ background:t.bgSecondary, color:t.accentText, padding:'3px 10px', borderRadius:10, fontSize:12 }}>{tag}</span>)}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:20 }}>
      <div className="anim-fadeUp" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ color:t.text, margin:0, fontSize:22, fontWeight:700 }}>Дневник</h2>
        <span style={{ color:t.textMuted, fontSize:13 }}>{entries.length} записей</span>
      </div>
      <button className="press hover-lift anim-fadeUp delay-1" onClick={openNew}
        style={{ width:'100%', padding:14, borderRadius:14, border:'none', background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', fontSize:15, cursor:'pointer', fontWeight:600, marginBottom:20, transition:'all .2s' }}>
        ✍️ Новая запись
      </button>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {entries.length===0 && <p style={{ color:t.textMuted, textAlign:'center', padding:'40px 0' }}>Пока нет записей. Начните вести дневник!</p>}
        {entries.map((e,i) => {
          const m = moodOf(e.mood);
          const date = new Date(e.date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
          return (
            <div key={e.id} className={`anim-slideIn delay-${Math.min(i+1,5)} hover-lift`} onClick={()=>setSelected(e.id)}
              style={{ background:t.bgCard, borderRadius:14, padding:16, border:`1px solid ${t.border}`, cursor:'pointer', transition:'all .2s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ color:t.textMuted, fontSize:13 }}>{date}</span>
                <span style={{ fontSize:20 }}>{m.emoji}</span>
              </div>
              {e.title && <div style={{ color:t.text, fontSize:15, fontWeight:600, marginBottom:4 }}>{e.title}</div>}
              <div style={{ color:t.textMuted, fontSize:13, lineHeight:1.5 }}>{e.content.slice(0,100)}{e.content.length>100?'...':''}</div>
              {e.tags && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>{e.tags.split(',').map(tg=>tg.trim()).filter(Boolean).slice(0,3).map(tag=><span key={tag} style={{ background:t.bgSecondary, color:t.accentText, padding:'3px 10px', borderRadius:10, fontSize:11 }}>{tag}</span>)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inp = t => ({ padding:'12px 14px', borderRadius:12, border:`1px solid ${t.border}`, background:t.bgSecondary, color:t.text, fontSize:15, outline:'none', width:'100%' });
