import { ArrowRight, Check, Workflow } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const isRegister = location.pathname === '/register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegister) await register({ name: form.name, email: form.email, password: form.password });
      else await login({ email: form.email, password: form.password });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <Link className="brand brand-light" to="/login"><span className="brand-mark"><Workflow size={21} strokeWidth={2.3} /></span><span>taskflow<span className="brand-period">.</span></span></Link>
        <div className="story-content">
          <p className="story-kicker">Le travail, en mouvement</p>
          <h1>Les bonnes idées avancent mieux ensemble.</h1>
          <p>Projets, échéances et prochaines étapes réunis dans un espace clair.</p>
          <div className="story-checks"><span><Check size={15} />Une vue nette sur vos priorités</span><span><Check size={15} />Chaque tâche à sa juste place</span></div>
        </div>
        <span className="story-index">01 <span>/</span> ORGANISER, SANS FRICTION</span>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">{isRegister ? 'Commencer gratuitement' : 'Ravi de vous revoir'}</p>
          <h2>{isRegister ? 'Créer votre compte' : 'Connexion'}</h2>
          <p className="auth-subtitle">{isRegister ? 'Votre prochain projet commence ici.' : 'Retrouvez votre espace de travail.'}</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && <label>Nom complet<input autoComplete="name" name="name" value={form.name} onChange={updateField} placeholder="Camille Martin" required maxLength={80} /></label>}
            <label>Adresse e-mail<input autoComplete="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="vous@exemple.com" required /></label>
            <label>Mot de passe<input autoComplete={isRegister ? 'new-password' : 'current-password'} name="password" type="password" value={form.password} onChange={updateField} placeholder={isRegister ? '8 caractères minimum' : 'Votre mot de passe'} required minLength={isRegister ? 8 : undefined} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Un instant…' : isRegister ? 'Créer mon compte' : 'Se connecter'}{!isSubmitting && <ArrowRight size={17} />}</button>
          </form>
          <p className="auth-switch">{isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}<Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Se connecter' : 'Créer un compte'}</Link></p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;