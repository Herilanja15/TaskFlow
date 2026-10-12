import { ArrowRight, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, email: user.email, currentPassword: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (form.password && form.password !== form.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setIsSaving(true);
    try {
      const profile = { name: form.name, email: form.email };
      if (form.password) {
        profile.currentPassword = form.currentPassword;
        profile.password = form.password;
      }
      const updatedUser = await updateProfile(profile);
      setForm((current) => ({ ...current, name: updatedUser.name, email: updatedUser.email, currentPassword: '', password: '', confirmPassword: '' }));
      setSuccess('Votre profil a été mis à jour.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSignOut() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="profile-page">
      <section className="profile-intro"><p className="eyebrow">Votre compte</p><h2>Un profil à votre image.</h2><p className="muted-copy">Mettez à jour vos coordonnées et gardez votre compte sécurisé.</p></section>
      <section className="profile-panel">
        <header className="profile-panel-heading"><span className="profile-avatar"><UserRound size={22} /></span><div><h3>Informations personnelles</h3><p>Ces informations sont utilisées dans votre espace TaskFlow.</p></div></header>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-pair"><label>Nom complet<input autoComplete="name" maxLength={80} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Adresse e-mail<input autoComplete="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label></div>
          <div className="profile-security-heading"><h3>Changer le mot de passe</h3><p>Laissez ces champs vides pour conserver votre mot de passe actuel.</p></div>
          <div className="form-pair"><label>Mot de passe actuel<input autoComplete="current-password" type="password" maxLength={72} value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} /></label><span /></div>
          <div className="form-pair"><label>Nouveau mot de passe<input autoComplete="new-password" type="password" minLength={8} maxLength={72} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="8 caractères minimum" /></label><label>Confirmer le mot de passe<input autoComplete="new-password" type="password" minLength={8} maxLength={72} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></label></div>
          {error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}
          <footer className="profile-actions"><button className="button button-quiet" type="button" onClick={handleSignOut}><LogOut size={16} />Se déconnecter</button><button className="button button-primary" type="submit" disabled={isSaving}>{isSaving ? 'Enregistrement…' : 'Enregistrer le profil'}<ArrowRight size={16} /></button></footer>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;