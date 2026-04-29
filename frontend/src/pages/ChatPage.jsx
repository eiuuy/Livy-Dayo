import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

const SUGGESTIONS = [
  'Как я справляюсь с привычками?',
  'Проанализируй мои расходы',
  'Что посоветуешь почитать?',
  'Дай мотивацию на сегодня',
];

export default function ChatPage() {
  const { theme: t } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => { api.get('/chat/history').then(r=>setMessages(r.data)).finally(()=>setLoadingHistory(false)); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const send = async text => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, {role:'user', content:msg, id:Date.now()}]);
    setLoading(true);
    try {
      const r = await api.post('/chat/send', {message:msg});
      setMessages(prev => [...prev, {role:'assistant', content:r.data.reply, id:Date.now()+1}]);
    } catch {
      setMessages(prev => [...prev, {role:'assistant', content:'⚠️ Ошибка соединения с ИИ.', id:Date.now()+1}]);
    } finally { setLoading(false); }
  };

  const handleKey = e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); }};

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 120px)', padding:'16px 16px 0' }}>
      <div className="anim-fadeUp" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <h2 style={{ color:t.text, margin:0, fontSize:22, fontWeight:700 }}>ИИ Помощник</h2>
          <p style={{ color:t.textMuted, fontSize:12, margin:'3px 0 0' }}>Знает ваши привычки, финансы и книги</p>
        </div>
        {messages.length>0 && (
          <button className="press" onClick={async()=>{ if(window.confirm('Очистить историю?')) { await api.delete('/chat/history'); setMessages([]); }}}
            style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:10, padding:'6px 10px', cursor:'pointer', fontSize:16 }}>🗑️</button>
        )}
      </div>

      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:14, paddingBottom:16 }}>
        {loadingHistory && <div style={{ color:t.textMuted, textAlign:'center', padding:20 }}>Загрузка...</div>}

        {!loadingHistory && messages.length===0 && (
          <div className="anim-fadeUp" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'30px 10px', gap:14 }}>
            <div style={{ fontSize:52 }}>🤖</div>
            <p style={{ color:t.textMuted, textAlign:'center', fontSize:14, lineHeight:1.6, margin:0 }}>Привет! Я знаю твои данные и могу помочь с анализом, советами и вопросами.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%' }}>
              {SUGGESTIONS.map((s,i) => (
                <button key={s} className={`press anim-fadeUp delay-${i+1}`} onClick={()=>send(s)}
                  style={{ width:'100%', padding:'10px 14px', background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:12, color:t.textMuted, fontSize:13, cursor:'pointer', textAlign:'left', transition:'all .2s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m,i) => (
          <div key={m.id||i} className="anim-bubble" style={{ display:'flex', gap:8, alignItems:'flex-end', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
            {m.role==='assistant' && <div style={{ fontSize:22, flexShrink:0 }}>🤖</div>}
            <div style={{
              maxWidth:'80%', padding:'11px 14px', borderRadius:16, fontSize:14, lineHeight:1.6, whiteSpace:'pre-wrap',
              background: m.role==='user' ? `linear-gradient(135deg,${t.accent},${t.accentEnd})` : t.bgCard,
              color: m.role==='user' ? '#fff' : t.text,
              border: m.role==='user' ? 'none' : `1px solid ${t.border}`,
              borderBottomRightRadius: m.role==='user' ? 4 : 16,
              borderBottomLeftRadius: m.role==='assistant' ? 4 : 16,
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="anim-bubble" style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
            <div style={{ fontSize:22 }}>🤖</div>
            <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:16, borderBottomLeftRadius:4, padding:'14px 18px' }}>
              <div style={{ display:'flex', gap:5 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:t.accent, animation:`pulse 1s ease-in-out ${i*0.15}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display:'flex', gap:8, padding:'12px 0 16px', borderTop:`1px solid ${t.border}` }}>
        <textarea style={{ flex:1, padding:'12px 14px', borderRadius:12, border:`1px solid ${t.border}`, background:t.bgCard, color:t.text, fontSize:15, outline:'none', resize:'none', lineHeight:1.5 }}
          placeholder="Спросите что-нибудь..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} rows={1} />
        <button className="press" onClick={()=>send()} disabled={!input.trim()||loading}
          style={{ width:46, height:46, borderRadius:12, border:'none', background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', fontSize:18, cursor:'pointer', flexShrink:0, opacity:(!input.trim()||loading)?.5:1, transition:'opacity .2s' }}>
          ➤
        </button>
      </div>
    </div>
  );
}
