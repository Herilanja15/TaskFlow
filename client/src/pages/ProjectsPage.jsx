import { Archive, ArrowUpRight, CalendarDays, FolderKanban, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../services/api.js';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState('active');
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  async function loadProjects() {
    try {
      const result = await apiRequest('/projects');
      setProjects(result.projects);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function createProject(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const result = await apiRequest('/projects', { method: 'POST', body: { ...form, deadline: form.deadline || null } });
      setProjects((current) => [result.project, ...current]);
      setForm({ title: '', description: '', deadline: '' });
      setIsDialogOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleArchive(project) {
    try {
      const { project: updated } = await apiRequest(`/projects/${project._id}`, { method: 'PATCH', body: { archived: !project.archived } });
      setProjects((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Supprimer « ${project.title} » et toutes ses tâches ?`)) return;
    try {
      await apiRequest(`/projects/${project._id}`, { method: 'DELETE' });
      setProjects((current) => current.filter((item) => item._id !== project._id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const visibleProjects = projects.filter((project) => filter === 'archived' ? project.archived : !project.archived);

  return (
    <div className="projects-page">
      <section className="projects-intro"><div><p className="eyebrow">Votre portefeuille</p><h2>Des projets bien rangés.</h2><p className="muted-copy">Un espace dédié pour chaque objectif et chaque équipe.</p></div><button className="button button-primary" type="button" onClick={() => setIsDialogOpen(true)}><Plus size={17} />Nouveau projet</button></section>
      {error && <div className="notice notice-error" role="alert">{error}<button className="icon-button" type="button" onClick={() => setError('')} aria-label="Fermer"><X size={16} /></button></div>}
      <div className="filter-tabs" role="tablist" aria-label="Filtrer les projets"><button type="button" role="tab" aria-selected={filter === 'active'} className={filter === 'active' ? 'selected' : ''} onClick={() => setFilter('active')}>Actifs <span>{projects.filter((project) => !project.archived).length}</span></button><button type="button" role="tab" aria-selected={filter === 'archived'} className={filter === 'archived' ? 'selected' : ''} onClick={() => setFilter('archived')}>Archivés <span>{projects.filter((project) => project.archived).length}</span></button></div>
      {visibleProjects.length ? <div className="projects-grid">{visibleProjects.map((project, index) => <article className="project-card" key={project._id}>
        <div className="project-card-top"><span className={`project-symbol symbol-${index % 4}`}><FolderKanban size={20} /></span><span className={`project-state${project.archived ? ' archived' : ''}`}>{project.archived ? 'Archivé' : 'En cours'}</span><div className="project-actions"><button className="icon-button" type="button" onClick={() => toggleArchive(project)} title={project.archived ? 'Désarchiver' : 'Archiver'} aria-label={project.archived ? 'Désarchiver le projet' : 'Archiver le projet'}><Archive size={16} /></button><button className="icon-button danger-icon" type="button" onClick={() => deleteProject(project)} title="Supprimer" aria-label="Supprimer le projet"><Trash2 size={16} /></button></div></div>
        <Link className="project-card-title" to={`/projects/${project._id}`}>{project.title}<ArrowUpRight size={17} /></Link><p className="project-card-description">{project.description || 'Aucune description pour le moment.'}</p><div className="project-card-meta"><span><FolderKanban size={15} />Projet personnel</span>{project.deadline && <span><CalendarDays size={15} />{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(project.deadline))}</span>}</div>
      </article>)}</div> : <div className="empty-state projects-empty"><span className="empty-icon"><FolderKanban size={25} /></span><h3>{filter === 'archived' ? 'Aucun projet archivé' : 'Un premier projet à lancer ?'}</h3><p>{filter === 'archived' ? 'Les projets archivés apparaîtront ici.' : 'Crée un espace de travail et donne forme à ta prochaine idée.'}</p>{filter === 'active' && <button className="button button-primary" type="button" onClick={() => setIsDialogOpen(true)}><Plus size={17} />Créer un projet</button>}</div>}
      {isDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsDialogOpen(false); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
        <div className="dialog-heading"><div><p className="eyebrow">Nouvel espace</p><h2 id="project-dialog-title">Créer un projet</h2></div><button className="icon-button" type="button" onClick={() => setIsDialogOpen(false)} aria-label="Fermer"><X size={19} /></button></div>
        <form className="dialog-form" onSubmit={createProject}><label>Nom du projet<input autoFocus maxLength={120} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Refonte du site web" /></label><label>Description<textarea maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Quel est l’objectif de ce projet ?" /></label><label>Date limite <span className="optional-label">Facultative</span><input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button className="button button-quiet" type="button" onClick={() => setIsDialogOpen(false)}>Annuler</button><button className="button button-primary" type="submit" disabled={isSaving}>{isSaving ? 'Création…' : 'Créer le projet'}<ArrowUpRight size={16} /></button></div></form>
      </section></div>}
    </div>
  );
}

export default ProjectsPage;