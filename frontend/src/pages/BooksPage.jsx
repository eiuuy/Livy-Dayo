import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

const SL = { want:'Хочу', reading:'Читаю', done:'Прочитано' };
const SC = t => ({ want:t.accent, reading:'#5B8FCC', done:t.success });

export default function BooksPage() {
  const { theme: t } = useTheme();
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', author:'', total_pages:'', status:'want' });
  const sc = SC(t);

  const load = () => api.get('/books').then(r => setBooks(r.data));
  useEffect(() => { load(); }, []);

  const add = async e => { e.preventDefault(); await api.post('/books', {...form, total_pages:parseInt(form.total_pages)||0}); setForm({title:'',author:'',total_pages:'',status:'want'}); setShowForm(false); load(); };
  const update = async (id, data) => { await api.patch(`/books/${id}`, data); load(); };
  const del = async id => { if(window.confirm('Удалить?')) { await api.delete(`/books/${id}`); load(); }};

  const filtered = filter==='all' ? books : books.filter(b=>b.status===filter);

  return (
    <div style={{ padding:20 }}>
      <h2 className="anim-fadeUp" style={{ color:t.text, margin:'0 0 16px', fontSize:22, fontWeight:700 }}>Книги</h2>

      <div className="anim-fadeUp delay-1" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {Object.entries(SL).map(([k,v]) => (
          <div key={k} className="hover-lift" style={{ background:t.bgCard, borderRadius:14, padding:14, border:`1px solid ${t.border}`, textAlign:'center', cursor:'default' }}>
            <div style={{ fontSize:26, fontWeight:700, color:sc[k] }}>{books.filter(b=>b.status===k).length}</div>
            <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="anim-fadeUp delay-2" style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','Все'],...Object.entries(SL)].map(([k,v]) => (
          <button key={k} className="press" onClick={() => setFilter(k)}
            style={{ padding:'7px 14px', borderRadius:20, border:'none', fontSize:13, cursor:'pointer', fontWeight:500, transition:'all .2s',
              background:filter===k ? t.accent : t.bgCard,
              color:filter===k ? '#fff' : t.textMuted,
              border:`1px solid ${filter===k ? 'transparent' : t.border}` }}>
            {v}
          </button>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={add} className="anim-fadeUp" style={{ background:t.bgCard, borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:12, marginBottom:16, border:`1px solid ${t.border}` }}>
          <input style={inp(t)} placeholder="Название *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required autoFocus />
          <input style={inp(t)} placeholder="Автор" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} />
          <input style={inp(t)} type="number" placeholder="Кол-во страниц" value={form.total_pages} onChange={e=>setForm({...form,total_pages:e.target.value})} />
          <select style={inp(t)} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{Object.entries(SL).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" className="press" style={btnP(t)}>Добавить</button>
            <button type="button" className="press" onClick={()=>setShowForm(false)} style={btnG(t)}>Отмена</button>
          </div>
        </form>
      ) : (
        <button className="press hover-lift" onClick={()=>setShowForm(true)}
          style={{ width:'100%', padding:14, borderRadius:14, border:`2px dashed ${t.border}`, background:'transparent', color:t.accent, fontSize:15, cursor:'pointer', fontWeight:600, marginBottom:16, transition:'all .2s' }}>
          + Добавить книгу
        </button>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map((b,i) => {
          const pct = b.total_pages>0 ? Math.round((b.current_page/b.total_pages)*100) : 0;
          return (
            <div key={b.id} className={`anim-slideIn delay-${Math.min(i+1,5)}`} style={{ background:t.bgCard, borderRadius:14, padding:16, border:`1px solid ${t.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:t.text, fontSize:15, fontWeight:600, marginBottom:2 }}>{b.title}</div>
                  {b.author && <div style={{ color:t.textMuted, fontSize:13 }}>{b.author}</div>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <select style={{ padding:'5px 8px', borderRadius:8, border:`1px solid ${t.border}`, background:t.bgSecondary, color:t.textMuted, fontSize:12, cursor:'pointer' }}
                    value={b.status} onChange={e=>update(b.id,{status:e.target.value})}>
                    {Object.entries(SL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                  <button onClick={()=>del(b.id)} style={{ background:'none', border:'none', color:t.textHint, fontSize:18, cursor:'pointer' }}>×</button>
                </div>
              </div>
              {b.status==='reading' && b.total_pages>0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ height:6, background:t.border, borderRadius:3, overflow:'hidden', marginBottom:8 }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,${t.accent},${t.accentEnd})`, borderRadius:3, transition:'width .4s ease' }} />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <input style={{ width:60, padding:'4px 8px', borderRadius:8, border:`1px solid ${t.border}`, background:t.bgSecondary, color:t.text, fontSize:13 }}
                      type="number" value={b.current_page} onChange={e=>update(b.id,{current_page:parseInt(e.target.value)})} min={0} max={b.total_pages} />
                    <span style={{ color:t.textMuted, fontSize:13 }}>/ {b.total_pages} стр. ({pct}%)</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inp = t => ({ padding:'12px 14px', borderRadius:12, border:`1px solid ${t.border}`, background:t.bgSecondary, color:t.text, fontSize:15, outline:'none', width:'100%' });
const btnP = t => ({ flex:1, padding:12, borderRadius:12, border:'none', background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer' });
const btnG = t => ({ flex:1, padding:12, borderRadius:12, border:`1px solid ${t.border}`, background:'transparent', color:t.textMuted, fontSize:15, cursor:'pointer' });
