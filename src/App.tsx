import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clipboard,
  Code2,
  Database,
  FileText,
  LayoutDashboard,
  ListChecks,
  Search,
  Server,
  Trash2,
  Undo2,
  Users,
} from 'lucide-react';
import { apiContracts, recipeStories } from './data/recipeStories.js';
import { deliveryMilestones, teamTracks } from './data/teamWorkflow.js';

type ApiContract = {
  id: string;
  title: string;
  method: string;
  path: string;
  success: string;
};

type StorySection = {
  role?: string;
  task?: string;
};

type Story = {
  id: string;
  title: string;
  focus: string;
  status: string;
  ownerHint: string;
  theme: string;
  originalUserStory: string;
  prompt: string;
  acceptanceCriteria: string[];
  dataModel: string[];
  api: {
    method: string;
    path: string;
    request: unknown;
    queryParams?: Record<string, string | number>;
    validations: string[];
    success: string;
  };
  frontend: string[];
  undoStrategy: string[];
  teamTasks: StorySection[];
};

type TeamTrack = {
  role: string;
  accent: string;
  mission: string;
  responsibilities: string[];
  stories: string[];
};

const stories = recipeStories as Story[];
const contracts = apiContracts as ApiContract[];
const tracks = teamTracks as TeamTrack[];

const themeIcon = {
  create: FileText,
  search: Search,
  edit: Code2,
  delete: Trash2,
};

function App() {
  const [selectedId, setSelectedId] = useState(stories[0].id);
  const [filter, setFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleStories = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return stories;

    return stories.filter((story) => {
      return [story.id, story.title, story.focus, story.originalUserStory]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [filter]);

  const selectedStory =
    visibleStories.find((story) => story.id === selectedId) ?? visibleStories[0] ?? stories[0];

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(selectedStory.prompt);
    setCopiedId(selectedStory.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <main className="app-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Chronos Recipes</p>
          <h1>Delivery board de historias de usuario</h1>
        </div>
        <div className="header-stats" aria-label="Resumen del tablero">
          <span>
            <strong>{stories.length}</strong>
            historias
          </span>
          <span>
            <strong>{contracts.length}</strong>
            endpoints
          </span>
          <span>
            <strong>{tracks.length}</strong>
            perfiles
          </span>
        </div>
      </header>

      <section className="toolbar" aria-label="Busqueda de historias">
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrar por historia, foco o requisito"
          />
        </label>
        <button className="secondary-action" type="button" onClick={() => setFilter('')}>
          <Undo2 size={17} aria-hidden="true" />
          Limpiar
        </button>
      </section>

      <div className="workspace-grid">
        <aside className="story-list" aria-label="Historias">
          {visibleStories.map((story) => {
            const Icon = themeIcon[story.theme as keyof typeof themeIcon] ?? FileText;
            const active = story.id === selectedStory.id;

            return (
              <button
                className={`story-card ${active ? 'is-active' : ''}`}
                key={story.id}
                onClick={() => setSelectedId(story.id)}
                type="button"
              >
                <span className={`story-icon ${story.theme}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <strong>{story.id}</strong>
                  {story.title}
                </span>
              </button>
            );
          })}
        </aside>

        <section className="story-detail" aria-live="polite">
          <div className="detail-heading">
            <div>
              <span className={`status-pill ${selectedStory.theme}`}>{selectedStory.status}</span>
              <h2>
                {selectedStory.id}: {selectedStory.title}
              </h2>
              <p>{selectedStory.focus}</p>
            </div>
            <button className="primary-action" type="button" onClick={copyPrompt}>
              <Clipboard size={18} aria-hidden="true" />
              {copiedId === selectedStory.id ? 'Copiado' : 'Copiar prompt'}
            </button>
          </div>

          <div className="story-summary">
            <div>
              <span>Historia original</span>
              <p>{selectedStory.originalUserStory}</p>
            </div>
            <div>
              <span>Responsable sugerido</span>
              <p>{selectedStory.ownerHint}</p>
            </div>
          </div>

          <div className="content-grid">
            <RequirementPanel
              icon={<ListChecks size={18} />}
              title="Criterios tecnicos"
              items={selectedStory.acceptanceCriteria}
            />
            <RequirementPanel
              icon={<Database size={18} />}
              title="Modelo de datos"
              items={selectedStory.dataModel}
              codeLike
            />
            <RequirementPanel
              icon={<Server size={18} />}
              title={`${selectedStory.api.method} ${selectedStory.api.path}`}
              items={[...selectedStory.api.validations, selectedStory.api.success]}
            />
            <RequirementPanel
              icon={<LayoutDashboard size={18} />}
              title="Interfaz"
              items={selectedStory.frontend}
            />
            <RequirementPanel icon={<Undo2 size={18} />} title="Deshacer" items={selectedStory.undoStrategy} />
            <TaskPanel tasks={selectedStory.teamTasks} />
          </div>

          <section className="prompt-panel">
            <div className="section-title">
              <FileText size={18} aria-hidden="true" />
              <h3>Prompt base</h3>
            </div>
            <pre>{selectedStory.prompt}</pre>
          </section>
        </section>
      </div>

      <section className="bottom-grid" aria-label="Contratos y equipo">
        <div className="api-board">
          <div className="section-title">
            <Server size={18} aria-hidden="true" />
            <h3>Contratos API</h3>
          </div>
          <div className="endpoint-list">
            {contracts.map((contract) => (
              <div className="endpoint-row" key={contract.id}>
                <span className="method">{contract.method}</span>
                <span>{contract.path}</span>
                <small>{contract.id}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="team-board">
          <div className="section-title">
            <Users size={18} aria-hidden="true" />
            <h3>Trabajo por perfiles</h3>
          </div>
          <div className="team-grid">
            {tracks.map((track) => (
              <article className={`team-card ${track.accent}`} key={track.role}>
                <h4>{track.role}</h4>
                <p>{track.mission}</p>
                <ul>
                  {track.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="milestone-strip" aria-label="Fases de entrega">
        {deliveryMilestones.map((milestone, index) => (
          <div className="milestone" key={milestone.name}>
            <span>{index + 1}</span>
            <strong>{milestone.name}</strong>
            <p>{milestone.output}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function RequirementPanel({
  codeLike = false,
  icon,
  items,
  title,
}: {
  codeLike?: boolean;
  icon: React.ReactNode;
  items: string[];
  title: string;
}) {
  return (
    <article className="info-panel">
      <div className="section-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <ul className={codeLike ? 'code-list' : undefined}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function TaskPanel({ tasks }: { tasks: StorySection[] }) {
  return (
    <article className="info-panel">
      <div className="section-title">
        <CheckCircle2 size={18} aria-hidden="true" />
        <h3>Tareas de equipo</h3>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-row" key={`${task.role}-${task.task}`}>
            <span>{task.role}</span>
            <p>{task.task}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default App;
