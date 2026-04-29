import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import HabitsPage from './pages/HabitsPage';
import FinancePage from './pages/FinancePage';
import BooksPage from './pages/BooksPage';
import DiaryPage from './pages/DiaryPage';
import ChatPage from './pages/ChatPage';

const NAV = [
  { to:'/habits',  icon:'✅', label:'Привычки' },
  { to:'/finance', icon:'💰', label:'Финансы' },
  { to:'/books',   icon:'📚', label:'Книги' },
  { to:'/diary',   icon:'📔', label:'Дневник' },
  { to:'/chat',    icon:'🤖', label:'ИИ' },
];

function Layout() {
  const { user, logout } = useAuth();
  const { theme: t, cycleTheme } = useTheme();

  return (
    <div style={{ maxWidth:480, margin:'0 auto', minHeight:'100vh', background:t.bg, display:'flex', flexDirection:'column', position:'relative', transition:'background .3s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', background:t.bgNav, borderBottom:`1px solid ${t.border}`, flexShrink:0 }}>
        <span style={{ color:t.text, fontWeight:700, fontSize:16 }}>🌸 Livy-Dayo</span>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={cycleTheme} style={{ background:'none', border:`1px solid ${t.border}`, borderRadius:10, padding:'3px 9px', fontSize:16, cursor:'pointer' }}>{t.emoji}</button>
          <span style={{ color:t.textMuted, fontSize:13 }}>{user?.name || user?.email?.split('@')[0]}</span>
          <button onClick={logout} style={{ background:'none', border:'none', color:t.textHint, fontSize:13, cursor:'pointer' }}>Выйти</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:70 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/habits" />} />
          <Route path="/habits"  element={<HabitsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/books"   element={<BooksPage />} />
          <Route path="/diary"   element={<DiaryPage />} />
          <Route path="/chat"    element={<ChatPage />} />
        </Routes>
      </div>

      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, display:'flex', background:t.bgNav, borderTop:`1px solid ${t.border}`, padding:'8px 0 14px', zIndex:100 }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, textDecoration:'none',
            color: isActive ? t.navActive : t.textHint,
            transition:'color .2s, transform .2s',
            transform: 'scale(1)',
          })}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontSize:10, fontWeight:500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  const { theme: t } = useTheme();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:t.bg, fontSize:48 }}>🌿</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/*" element={<Protected><Layout /></Protected>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
