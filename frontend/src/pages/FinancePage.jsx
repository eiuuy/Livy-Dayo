import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

const CATS = ['🍕 Еда','🚗 Транспорт','🛍️ Покупки','💊 Здоровье','🎬 Досуг','🏠 Жильё','💼 Работа','📦 Другое'];
const CHART_COLORS = ['#F5A623','#E8855A','#52A882','#5B8FCC','#A07CC5','#E87070','#60B8A0','#D4A843'];

export default function FinancePage() {
  const { theme: t } = useTheme();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount:'', category:'🍕 Еда', note:'', type:'expense' });

  const load = () => { api.get('/finance').then(r => setEntries(r.data)); api.get('/finance/summary').then(r => setSummary(r.data)); };
  useEffect(() => { load(); }, []);

  const add = async e => { e.preventDefault(); await api.post('/finance', {...form, amount:parseFloat(form.amount)}); setForm({amount:'',category:'🍕 Еда',note:'',type:'expense'}); setShowForm(false); load(); };

  const income = summary.filter(s=>s.type==='income').reduce((a,b)=>a+parseFloat(b.total),0);
  const expense = summary.filter(s=>s.type==='expense').reduce((a,b)=>a+parseFloat(b.total),0);
  const chartData = summary.filter(s=>s.type==='expense').map((s,i)=>({ name:s.category, value:parseFloat(s.total), color:CHART_COLORS[i%CHART_COLORS.length] }));

  return (
    <div style={{ padding:20 }}>
      <h2 className="anim-fadeUp" style={{ color:t.text, margin:'0 0 16px', fontSize:22, fontWeight:700 }}>
        Финансы <span style={{ color:t.textMuted, fontSize:14, fontWeight:400 }}>30 дней</span>
      </h2>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Доход', val:`+${income.toFixed(0)}€`, color:t.success, delay:'anim-fadeUp' },
          { label:'Расход', val:`-${expense.toFixed(0)}€`, color:t.danger, delay:'anim-fadeUp delay-1' },
          { label:'Баланс', val:`${(income-expense).toFixed(0)}€`, color:t.accent, delay:'anim-fadeUp delay-2' },
        ].map(c => (
          <div key={c.label} className={`${c.delay} hover-lift`} style={{ background:t.bgCard, borderRadius:14, padding:'14px 10px', border:`1px solid ${t.border}`, textAlign:'center', cursor:'default' }}>
            <div style={{ fontSize:11, color:t.textMuted, marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:17, fontWeight:700, color:c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="anim-fadeUp delay-3" style={{ background:t.bgCard, borderRadius:16, padding:16, marginBottom:16, border:`1px solid ${t.border}` }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({name,percent})=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {chartData.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v=>`${v}€`} contentStyle={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:10, color:t.text }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {showForm ? (
        <form onSubmit={add} className="anim-fadeUp" style={{ background:t.bgCard, borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:12, marginBottom:16, border:`1px solid ${t.border}` }}>
          <div style={{ display:'flex', gap:8 }}>
            {['expense','income'].map(tp => (
              <button type="button" key={tp} className="press" onClick={() => setForm({...form,type:tp})}
                style={{ flex:1, padding:10, borderRadius:12, border:'none', color:'#fff', fontSize:14, cursor:'pointer', fontWeight:600, transition:'all .2s',
                  background: form.type===tp ? (tp==='expense'?t.danger:t.success) : t.bgSecondary,
                  color: form.type===tp ? '#fff' : t.textMuted }}>
                {tp==='expense' ? '− Расход' : '+ Доход'}
              </button>
            ))}
          </div>
          <input style={inp(t)} type="number" placeholder="Сумма (€)" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required />
          <select style={inp(t)} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
          <input style={inp(t)} placeholder="Заметка" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} />
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" className="press" style={btnP(t)}>Добавить</button>
            <button type="button" className="press" onClick={()=>setShowForm(false)} style={btnG(t)}>Отмена</button>
          </div>
        </form>
      ) : (
        <button className="press hover-lift" onClick={()=>setShowForm(true)}
          style={{ width:'100%', padding:14, borderRadius:14, border:`2px dashed ${t.border}`, background:'transparent', color:t.accent, fontSize:15, cursor:'pointer', fontWeight:600, marginBottom:16, transition:'all .2s' }}>
          + Добавить запись
        </button>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {entries.map((e,i) => (
          <div key={e.id} className={`anim-slideIn delay-${Math.min(i+1,5)}`} style={{ display:'flex', alignItems:'center', gap:10, background:t.bgCard, borderRadius:12, padding:'12px 14px', border:`1px solid ${t.border}` }}>
            <span style={{ fontSize:14, color:t.text, flex:1 }}>{e.category}</span>
            <span style={{ fontSize:12, color:t.textMuted }}>{e.note || e.date}</span>
            <span style={{ fontSize:15, fontWeight:600, color:e.type==='income'?t.success:t.danger }}>{e.type==='income'?'+':'-'}{Math.abs(e.amount)}€</span>
            <button onClick={()=>{ api.delete(`/finance/${e.id}`); load(); }} style={{ background:'none', border:'none', color:t.textHint, fontSize:18, cursor:'pointer' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = t => ({ padding:'12px 14px', borderRadius:12, border:`1px solid ${t.border}`, background:t.bgSecondary, color:t.text, fontSize:15, outline:'none', width:'100%' });
const btnP = t => ({ flex:1, padding:12, borderRadius:12, border:'none', background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer' });
const btnG = t => ({ flex:1, padding:12, borderRadius:12, border:`1px solid ${t.border}`, background:'transparent', color:t.textMuted, fontSize:15, cursor:'pointer' });
