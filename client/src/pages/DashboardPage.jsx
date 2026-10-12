import { ArrowUpRight, CalendarDays, Check, CircleDashed, Clock3, FolderKanban, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/dashboard').then(setData).catch((requestError) => setError(requestError.message));
  }, []);

  if (error) return <div className="notice notice-error" role="alert">{error}</div>;
  if (!data) return <div className="loading-line">Préparation de votre espace…</div>;

  const { stats, projects, dueSoon } = data;
  const activeProjects = projects.filter((project) => !project.archived).slice(0, 4);
  const cards = [
    { label: 'Projets actifs', value: stats.projectCount, icon: FolderKanban, tone: 'green' },
    { label: 'Tâches au total', value: stats.taskCount, icon: ListTodo, tone: 'blue' },
    { label: 'En cours', value: stats.inProgressCount, icon: CircleDashed, tone: 'amber' },
    { label: 'Terminées', value: stats.completedCount, icon: Check, tone: 'coral' },
  ];

  return (
    <div className="dashboard-page">
      <section className="welcome-row"><div><p className="eyebrow">L’essentiel, tout de suite</p><h2>Le travail avance.</h2><p className="muted-copy">Voici où en sont vos projets aujourd’hui.</p></div><span className="today-chip"><CalendarDays size={16} />{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></section>
      <section className="stats-grid" aria-label="Statistiques des projets">
        {cards.map(({ label, value, icon: Icon, tone }) => <article className={`stat-card tone-${tone}`} key={label}><span className="stat-icon"><Icon size={19} /></span><span className="stat-value">{value}</span><span className="stat-label">{label}</span></article>)}
      </section>
      <div className="dashboard-columns">
        <section className="section-block">
          <div className="section-heading"><div><p className="eyebrow">En mouvement</p><h2>Projets récents</h2></div><Link className="text-link" to="/projects">Tous les projets <ArrowUpRight size={16} /></Link></div>
          {activeProjects.length ? <div className="project-list">{activeProjects.map((project, index) => {
            const progress = project.taskCount ? Math.round((project.completedCount / project.taskCount) * 100) : 0;
            return <Link className="project-row" key={project._id} to={`/projects/${project._id}`}><span className={`project-symbol symbol-${index % 4}`}><FolderKanban size={19} /></span><span className="project-row-main"><strong>{project.title}</strong><small>{project.taskCount} tâche{project.taskCount === 1 ? '' : 's'}</small></span><span className="project-progress"><span>{progress}%</span><span className="progress-track"><span style={{ width: `${progress}%` }} /></span></span><ArrowUpRight className="row-arrow" size={17} /></Link>;
          })}</div> : <div className="empty-state compact-empty"><FolderKanban size={23} /><strong>Votre premier projet vous attend</strong><span>Créez un espace pour organiser vos tâches.</span><Link className="text-link" to="/projects?new=1">Créer un projet <ArrowUpRight size={16} /></Link></div>}
        </section>
        <section className="section-block due-section">
          <div className="section-heading"><div><p className="eyebrow">À garder en vue</p><h2>Échéances proches</h2></div><span className="count-badge">{dueSoon.length}</span></div>
          {dueSoon.length ? <div className="due-list">{dueSoon.map((task) => <Link className="due-row" key={task._id} to={`/projects/${task.project._id}`}><span className={`priority-dot priority-${task.priority}`} /><span className="due-main"><strong>{task.title}</strong><small>{task.project.title}</small></span><span className="due-date"><Clock3 size={14} />{dateFormatter.format(new Date(task.deadline))}</span></Link>)}</div> : <div className="empty-state compact-empty"><Check size={23} /><strong>Rien d’urgent cette semaine</strong><span>Vos échéances restent sous contrôle.</span></div>}
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;