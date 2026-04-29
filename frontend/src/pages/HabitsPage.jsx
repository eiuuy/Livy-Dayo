import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

const ICONS = ['💧','🏃','📚','🧘','🥗','😴','💪','🎯','✍️','🎵','🚶','🧹','💊','🌿','🎨'];
const COLORS = ['#F5A623','#E8855A','#52A882','#5B8FCC','#A07CC5','#E87070','#60B8A0','#D4A843'];

export default function HabitsPage() {
  const { theme: t } = useTheme();
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', icon:'💧', color:'#F5A623' });
  const [toggling, setToggling] = useState(null);

  const load = () => api.get('/habits').then(r => setHabits(r.data));
  useEffect(() => { load(); }, []);

  const toggle = async id => {
    setToggling(id);
    await api.post(`/habits/${id}/toggle`);
    await load();
    setTimeout(() => setToggling(null), 300);
  };

  const del = async id => { if(window.confirm('Удалить привычку?')) { await api.delete(`/habits/${id}`); load(); }};
  const add = async e => { e.preventDefault(); await api.post('/habits', form); setForm({name:'',icon:'💧',color:'#F5A623'}); setShowForm(false); load(); };

  const done = habits.filter(h => h.done_today).length;
  const pct = habits.length ? (done/habits.length)*100 : 0;
  const today = new Date().toLocaleDateString('ru-RU', {weekday:'long',day:'numeric',month:'long'});

  return (
    <div style={{ padding:20 }}>
      <div className="anim-fadeUp" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <h2 style={{ color:t.text, margin:0, fontSize:22, fontWeight:700 }}>Привычки</h2>
          <p style={{ color:t.textMuted, margin:'4px 0 0', fontSize:12 }}>{today}</p>
        </div>
        <div className="anim-pulse" style={{ background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', borderRadius:20, padding:'5px 16px', fontSize:15, fontWeight:700 }}>{done}/{habits.length}</div>
      </div>

      {habits.length > 0 && (
        <div className="anim-fadeUp delay-1" style={{ height:8, background:t.border, borderRadius:4, marginBottom:20, overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,${t.accent},${t.accentEnd})`, borderRadius:4, transition:'width .6s cubic-bezier(.4,0,.2,1)', animation:'progressSlide .8s ease' }} />
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
        {habits.map((h, i) => (
          <div key={h.id} className={`anim-slideIn delay-${Math.min(i+1,5)} hover-right`}
            style={{ display:'flex', alignItems:'center', gap:12, background:t.bgCard, borderRadius:14, padding:'14px 16px', border:`1px solid ${t.border}`, opacity:h.done_today?.75:1, transition:'all .2s' }}>
            <button
              className={toggling===h.id ? 'anim-checkPop' : ''}
              onClick={() => toggle(h.id)}
              style={{ width:28, height:28, borderRadius:9, border:`2.5px solid ${h.done_today ? h.color : t.border}`, background:h.done_today ? h.color : 'transparent', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', flexShrink:0, transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {h.done_today ? '✓' : ''}
            </button>
            <span style={{ fontSize:20 }}>{h.icon}</span>
            <span style={{ flex:1, color:h.done_today ? t.textMuted : t.text, fontSize:15, textDecoration:h.done_today?'line-through':'none', transition:'all .2s' }}>{h.name}</span>
            <span style={{ fontSize:11, color:t.streakText, background:t.streak, padding:'3px 9px', borderRadius:10 }}>🔥 streak</span>
            <button onClick={() => del(h.id)} style={{ background:'none', border:'none', color:t.textHint, fontSize:18, cursor:'pointer', padding:0, lineHeight:1 }}>×</button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={add} className="anim-fadeUp" style={{ background:t.bgCard, borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:14, border:`1px solid ${t.border}` }}>
          <input style={inp(t)} placeholder="Название привычки" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required autoFocus />
          <div>
            <p style={{ color:t.textMuted, fontSize:12, marginBottom:8 }}>Иконка</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {ICONS.map(ic => <button type="button" key={ic} onClick={() => setForm({...form,icon:ic})}
                style={{ border:`2px solid ${form.icon===ic ? t.accent : 'transparent'}`, borderRadius:10, padding:'6px 8px', fontSize:18, background:form.icon===ic ? t.bgSecondary : 'transparent', cursor:'pointer', transition:'all .15s' }}>{ic}</button>)}
            </div>
          </div>
          <div>
            <p style={{ color:t.textMuted, fontSize:12, marginBottom:8 }}>Цвет</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {COLORS.map(c => <button type="button" key={c} onClick={() => setForm({...form,color:c})}
                style={{ width:30, height:30, borderRadius:'50%', background:c, border:`3px solid ${form.color===c ? t.text : 'transparent'}`, cursor:'pointer', transition:'all .15s' }} />)}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" className="press" style={btnPrimary(t)}>Добавить</button>
            <button type="button" className="press" onClick={() => setShowForm(false)} style={btnGhost(t)}>Отмена</button>
          </div>
        </form>
      ) : (
        <button className="press hover-lift" onClick={() => setShowForm(true)}
          style={{ width:'100%', padding:14, borderRadius:14, border:`2px dashed ${t.border}`, background:'transparent', color:t.accent, fontSize:15, cursor:'pointer', fontWeight:600, transition:'all .2s' }}>
          + Новая привычка
        </button>
      )}
    </div>
  );
}

const inp = t => ({ padding:'12px 14px', borderRadius:12, border:`1px solid ${t.border}`, background:t.bgSecondary, color:t.text, fontSize:15, outline:'none', width:'100%' });
const btnPrimary = t => ({ flex:1, padding:12, borderRadius:12, border:'none', background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer' });
const btnGhost = t => ({ flex:1, padding:12, borderRadius:12, border:`1px solid ${t.border}`, background:'transparent', color:t.textMuted, fontSize:15, cursor:'pointer' });
