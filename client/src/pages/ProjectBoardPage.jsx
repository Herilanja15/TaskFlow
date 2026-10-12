import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CircleDashed, ClipboardList, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';

const columns = [
  { id: 'todo', label: 'À faire', icon: ClipboardList, tone: 'slate' },
  { id: 'in_progress', label: 'En cours', icon: CircleDashed, tone: 'blue' },
  { id: 'done', label: 'Terminées', icon: Check, tone: 'green' },
];
const emptyForm = { title: '', description: '', priority: 'medium', deadline: '', assignedTo: '' };
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

function ProjectBoardPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', deadline: '' });
  const [isSaving, setIsSaving] = useState(false);

  async function loadBoard() {
    try {
      const [projectResult, taskResult] = await Promise.all([apiRequest(`/projects/${projectId}`), apiRequest(`/projects/${projectId}/tasks`)]);
      setProject(projectResult.project);
      setTasks(taskResult.tasks);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    setProject(null);
    setTasks([]);
    loadBoard();
  }, [projectId]);

  function startCreate() {
    setEditingTask(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  }

  function startEdit(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
    });
    setIsDialogOpen(true);
  }

  function startProjectEdit() {
    setProjectForm({
      title: project.title,
      description: project.description || '',
      deadline: project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : '',
    });
    setIsProjectDialogOpen(true);
  }

  async function saveProject(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const { project: updated } = await apiRequest(`/projects/${projectId}`, {
        method: 'PATCH',
        body: { ...projectForm, deadline: projectForm.deadline || null },
      });
      setProject((current) => ({
        ...current,
        ...updated,
        owner: current.owner,
        members: current.members,
      }));
      setIsProjectDialogOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveTask(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const body = { ...form, deadline: form.deadline || null, assignedTo: form.assignedTo || null };
      if (editingTask) {
        const { task } = await apiRequest(`/tasks/${editingTask._id}`, { method: 'PATCH', body });
        setTasks((current) => current.map((item) => item._id === task._id ? task : item));
      } else {
        const { task } = await apiRequest(`/projects/${projectId}/tasks`, { method: 'POST', body });
        setTasks((current) => [task, ...current]);
      }
      setIsDialogOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function changeStatus(task, status) {
    try {
      const { task: updated } = await apiRequest(`/tasks/${task._id}`, { method: 'PATCH', body: { status } });
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Supprimer la tâche « ${task.title} » ?`)) return;
    try {
      await apiRequest(`/tasks/${task._id}`, { method: 'DELETE' });
      setTasks((current) => current.filter((item) => item._id !== task._id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (error && !project) return <div className="notice notice-error" role="alert"><Link className="text-link" to="/projects"><ArrowLeft size={16} />Retour aux projets</Link>{error}</div>;
  if (!project) return <div className="loading-line">Chargement du projet…</div>;

  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const ownerId = typeof project.owner === 'string' ? project.owner : project.owner?._id;
  const canManageProject = String(ownerId) === String(user?.id);

  return (
    <div className="board-page">
      <Link className="back-link" to="/projects"><ArrowLeft size={16} />Tous les projets</Link>
      <section className="board-project-heading"><div className="board-project-copy"><div className="board-title-row"><span className="project-symbol symbol-0"><ClipboardList size={20} /></span><h2>{project.title}</h2>{project.archived && <span className="project-state archived">Archivé</span>}</div><p>{project.description || 'Aucune description pour ce projet.'}</p><div className="board-meta"><span><ClipboardList size={15} />{tasks.length} tâche{tasks.length === 1 ? '' : 's'}</span>{project.deadline && <span><CalendarDays size={15} />Échéance {dateFormatter.format(new Date(project.deadline))}</span>}<span>{progress}% terminé</span></div></div><div className="board-heading-actions">{canManageProject && <button className="button button-quiet" type="button" onClick={startProjectEdit}><Pencil size={16} />Modifier le projet</button>}<button className="button button-primary" type="button" onClick={startCreate}><Plus size={17} />Nouvelle tâche</button></div></section>
      {error && <div className="notice notice-error" role="alert">{error}<button className="icon-button" type="button" onClick={() => setError('')} aria-label="Fermer"><X size={16} /></button></div>}
      <section className="kanban-board" aria-label="Tableau Kanban">{columns.map(({ id, label, icon: Icon, tone }) => {
        const columnTasks = tasks.filter((task) => task.status === id);
        return <div className="kanban-column" key={id}><header className="column-heading"><span className={`column-icon column-${tone}`}><Icon size={16} /></span><h3>{label}</h3><span className="column-count">{columnTasks.length}</span>{id === 'todo' && <button className="icon-button column-add" type="button" onClick={startCreate} title="Ajouter une tâche" aria-label="Ajouter une tâche"><Plus size={16} /></button>}</header><div className="task-stack">
          {columnTasks.map((task) => <article className="task-card" key={task._id}><div className="task-card-top"><span className={`priority-label priority-${task.priority}`}><span />{task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Haute' : task.priority === 'low' ? 'Basse' : 'Normale'}</span><div className="task-actions"><button className="icon-button" type="button" onClick={() => startEdit(task)} title="Modifier la tâche" aria-label={`Modifier ${task.title}`}><MoreHorizontal size={17} /></button><button className="icon-button danger-icon" type="button" onClick={() => deleteTask(task)} title="Supprimer la tâche" aria-label={`Supprimer ${task.title}`}><Trash2 size={15} /></button></div></div><h4>{task.title}</h4>{task.description && <p className="task-description">{task.description}</p>}{task.assignedTo?.name && <span className="assigned-chip">{task.assignedTo.name}</span>}<footer className="task-card-footer">{task.deadline ? <span className="task-date"><CalendarDays size={14} />{dateFormatter.format(new Date(task.deadline))}</span> : <span />}<label className="status-select-label"><span className="sr-only">Modifier le statut de {task.title}</span><select value={task.status} onChange={(event) => changeStatus(task, event.target.value)} aria-label={`Statut de ${task.title}`}><option value="todo">À faire</option><option value="in_progress">En cours</option><option value="done">Terminée</option></select></label></footer></article>)}
          {!columnTasks.length && <div className="column-empty">{id === 'todo' ? <button type="button" onClick={startCreate}><Plus size={16} />Ajouter une tâche</button> : 'Aucune tâche ici'}</div>}
        </div></div>;
      })}</section>
      {isDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsDialogOpen(false); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title">
        <div className="dialog-heading"><div><p className="eyebrow">{editingTask ? 'Mettre à jour' : project.title}</p><h2 id="task-dialog-title">{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2></div><button className="icon-button" type="button" onClick={() => setIsDialogOpen(false)} aria-label="Fermer"><X size={19} /></button></div>
        <form className="dialog-form" onSubmit={saveTask}><label>Titre<input autoFocus maxLength={160} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex. Préparer le brief" /></label><label>Description<textarea rows={3} maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ajouter quelques détails" /></label><div className="form-pair"><label>Priorité<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Basse</option><option value="medium">Normale</option><option value="high">Haute</option><option value="urgent">Urgente</option></select></label><label>Échéance<input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label></div><label>Responsable<select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}><option value="">Personne</option>{(project.members || []).map((member) => member.user && <option key={member.user._id} value={member.user._id}>{member.user.name}</option>)}</select></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button className="button button-quiet" type="button" onClick={() => setIsDialogOpen(false)}>Annuler</button><button className="button button-primary" type="submit" disabled={isSaving}>{isSaving ? 'Enregistrement…' : editingTask ? 'Enregistrer' : 'Créer la tâche'}<ArrowUpRight size={16} /></button></div></form>
      </section></div>}
      {isProjectDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsProjectDialogOpen(false); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="edit-project-title"><div className="dialog-heading"><div><p className="eyebrow">Paramètres du projet</p><h2 id="edit-project-title">Modifier le projet</h2></div><button className="icon-button" type="button" onClick={() => setIsProjectDialogOpen(false)} aria-label="Fermer"><X size={19} /></button></div><form className="dialog-form" onSubmit={saveProject}><label>Nom du projet<input autoFocus maxLength={120} required value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} /></label><label>Description<textarea rows={3} maxLength={2000} value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></label><label>Date limite<input type="date" value={projectForm.deadline} onChange={(event) => setProjectForm({ ...projectForm, deadline: event.target.value })} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button className="button button-quiet" type="button" onClick={() => setIsProjectDialogOpen(false)}>Annuler</button><button className="button button-primary" type="submit" disabled={isSaving}>{isSaving ? 'Enregistrement…' : 'Enregistrer'}<ArrowUpRight size={16} /></button></div></form></section></div>}
    </div>
  );
}

export default ProjectBoardPage;