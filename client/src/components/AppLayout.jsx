import { LayoutDashboard, LogOut, Plus, UserRound, Workflow } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = location.pathname.startsWith('/projects')
    ? 'Projets'
    : location.pathname === '/profile'
      ? 'Mon profil'
      : 'Vue d’ensemble';

  function handleSignOut() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard" aria-label="TaskFlow, accueil">
          <span className="brand-mark"><Workflow size={21} strokeWidth={2.3} /></span>
          <span>taskflow<span className="brand-period">.</span></span>
        </Link>
        <p className="sidebar-label">Espace de travail</p>
        <nav className="primary-nav" aria-label="Navigation principale">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><LayoutDashboard size={18} /><span>Vue d’ensemble</span></NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Workflow size={18} /><span>Mes projets</span></NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><UserRound size={18} /><span>Mon profil</span></NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-card">
            <span className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</span>
            <span className="user-copy"><strong>{user?.name}</strong><small>Mon espace</small></span>
            <button className="icon-button logout-button" type="button" onClick={handleSignOut} title="Se déconnecter" aria-label="Se déconnecter"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-title"><span className="breadcrumb">TaskFlow <span>/</span> {pageTitle}</span><h1>{pageTitle}</h1></div>
          <Link className="button button-primary topbar-action" to="/projects?new=1"><Plus size={17} /><span>Nouveau projet</span></Link>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
      <nav className="mobile-nav" aria-label="Navigation mobile">
        <NavLink to="/dashboard" aria-label="Vue d’ensemble"><LayoutDashboard size={20} /><span>Accueil</span></NavLink>
        <NavLink to="/projects" aria-label="Mes projets"><Workflow size={20} /><span>Projets</span></NavLink>
        <NavLink to="/profile" aria-label="Mon profil"><UserRound size={20} /><span>Profil</span></NavLink>
      </nav>
    </div>
  );
}

export default AppLayout;