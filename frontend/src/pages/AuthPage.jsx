import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const navigate = useNavigate();
  const t = theme;

  const handle = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.password, form.name);
      navigate('/');
    } catch (err) { setError(err.response?.data?.error || 'Ошибка'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:t.bg, padding:20, transition:'background .3s' }}>
      <div className="anim-fadeUp" style={{ background:t.bgCard, borderRadius:24, padding:'40px 36px', width:'100%', maxWidth:400, border:`1px solid ${t.border}`, boxShadow:`0 20px 60px ${t.shadow}`, position:'relative' }}>
        <button onClick={cycleTheme} style={{ position:'absolute', top:16, right:16, background:'none', border:`1px solid ${t.border}`, borderRadius:10, padding:'4px 10px', fontSize:18, cursor:'pointer' }}>{t.emoji}</button>
        <div style={{ fontSize:52, textAlign:'center', marginBottom:8 }}>🌿</div>
        <h1 style={{ color:t.text, fontSize:28, fontWeight:700, textAlign:'center', margin:0 }}>Livy-Dayo</h1>
        <p style={{ color:t.textMuted, textAlign:'center', marginBottom:28, marginTop:4, fontSize:13 }}>Привычки · Финансы · Книги · Дневник · ИИ</p>
        <div style={{ display:'flex', background:t.bgSecondary, borderRadius:12, padding:4, marginBottom:24 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'9px 0', border:'none', borderRadius:9, cursor:'pointer', fontSize:14, fontWeight:500, transition:'all .25s', background:mode===m ? t.accent : 'transparent', color:mode===m ? '#fff' : t.textMuted }}>{m==='login' ? 'Войти' : 'Регистрация'}</button>
          ))}
        </div>
        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {mode==='register' && <input className="anim-fadeIn" style={inp(t)} placeholder="Ваше имя" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />}
          <input style={inp(t)} type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required />
          <input style={inp(t)} type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required />
          {error && <p style={{ color:t.danger, fontSize:13 }}>{error}</p>}
          <button className="press" disabled={loading} style={{ marginTop:8, padding:14, borderRadius:12, border:'none', background:`linear-gradient(135deg,${t.accent},${t.accentEnd})`, color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer', opacity:loading?.7:1 }}>{loading ? '...' : mode==='login' ? 'Войти' : 'Создать аккаунт'}</button>
        </form>
      </div>
    </div>
  );
}

const inp = t => ({ padding:'13px 16px', borderRadius:12, border:`1px solid ${t.border}`, background:t.bgSecondary, color:t.text, fontSize:15, outline:'none', transition:'border-color .2s', width:'100%' });
