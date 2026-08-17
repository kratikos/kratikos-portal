"use client";

import { FormEvent, useMemo, useState } from "react";

type View =
  | "dashboard"
  | "moderacao"
  | "usuarios"
  | "posts"
  | "enquetes"
  | "faq"
  | "administradores"
  | "observabilidade";

type Tone = "green" | "blue" | "purple" | "orange" | "red" | "gray";

const navItems: { id: View; label: string; icon: string; badge?: number }[] = [
  { id: "dashboard", label: "Visão geral", icon: "▦" },
  { id: "moderacao", label: "Moderação", icon: "⚑", badge: 12 },
  { id: "usuarios", label: "Usuários", icon: "◎" },
  { id: "posts", label: "Posts", icon: "▤" },
  { id: "enquetes", label: "Enquetes", icon: "◉" },
  { id: "faq", label: "FAQ", icon: "?" },
  { id: "administradores", label: "Administradores", icon: "♙" },
  { id: "observabilidade", label: "Observabilidade", icon: "⌁" },
];

const viewMeta: Record<View, { title: string; eyebrow: string }> = {
  dashboard: { title: "Visão geral", eyebrow: "Dashboard de negócio" },
  moderacao: { title: "Central de moderação", eyebrow: "Gestão de denúncias" },
  usuarios: { title: "Usuários do app", eyebrow: "Gestão da comunidade" },
  posts: { title: "Posts", eyebrow: "Gestão de conteúdo" },
  enquetes: { title: "Enquetes", eyebrow: "Gestão de participação" },
  faq: { title: "Perguntas frequentes", eyebrow: "Central de ajuda" },
  administradores: { title: "Administradores", eyebrow: "Controle de acesso" },
  observabilidade: { title: "Observabilidade", eyebrow: "Saúde da plataforma" },
};

const accounts = [18, 24, 20, 31, 29, 36, 34, 42, 38, 51, 47, 55, 62, 58, 66, 71, 68, 79, 74, 82, 77, 91, 87, 94, 98, 103, 96, 112, 107, 119];
const deletions = [2, 1, 3, 2, 4, 2, 3, 2, 5, 3, 4, 3, 2, 4, 3, 5, 4, 3, 6, 4, 5, 4, 3, 5, 4, 6, 5, 4, 7, 5];
const votes = [82, 104, 94, 132, 121, 148, 156, 171, 163, 198, 185, 212, 226, 208, 244, 252, 239, 281, 267, 302, 286, 327, 309, 342, 358, 371, 349, 395, 382, 421];
const accesses = [235, 278, 251, 310, 296, 338, 361, 389, 374, 428, 415, 461, 488, 472, 516, 543, 525, 574, 558, 607, 589, 648, 621, 673, 701, 728, 696, 761, 742, 804];

const initialUsers = [
  { id: "#10482", name: "Marina Alves", handle: "@marinaalves", city: "São Paulo, SP", status: "Ativo", validated: true, engagement: 842 },
  { id: "#10481", name: "Caio Moreira", handle: "@caiomoreira", city: "Recife, PE", status: "Ativo", validated: true, engagement: 728 },
  { id: "#10480", name: "Lívia Santos", handle: "@livias", city: "Salvador, BA", status: "Em análise", validated: false, engagement: 615 },
  { id: "#10479", name: "Rafael Martins", handle: "@rafa.m", city: "Belo Horizonte, MG", status: "Bloqueado", validated: true, engagement: 304 },
  { id: "#10478", name: "Ana Clara", handle: "@anaclara", city: "Curitiba, PR", status: "Ativo", validated: false, engagement: 552 },
  { id: "#10477", name: "João Ribeiro", handle: "@joaor", city: "Fortaleza, CE", status: "Ativo", validated: true, engagement: 497 },
];

const initialPosts = [
  { id: "P-8294", title: "O transporte público deve ser gratuito nas capitais?", author: "@marinaalves", kind: "Post", status: "Ativo", engagement: "1.284" },
  { id: "P-8293", title: "Novos investimentos em energia limpa no Nordeste", author: "@caiomoreira", kind: "Notícia", status: "Ativo", engagement: "987" },
  { id: "P-8292", title: "Educação financeira deveria estar no currículo?", author: "@livias", kind: "Post", status: "Inativo", engagement: "736" },
  { id: "P-8291", title: "Minha experiência com o novo sistema de saúde", author: "@anaclara", kind: "Post", status: "Ativo", engagement: "609" },
  { id: "P-8290", title: "Debate: semana de trabalho de quatro dias", author: "@joaor", kind: "Post", status: "Em análise", engagement: "442" },
];

const initialPolls = [
  { id: "E-2108", title: "Você apoia o voto facultativo no Brasil?", author: "@debatebr", status: "Ativa", votes: "8.452", ends: "22 ago" },
  { id: "E-2107", title: "Qual deve ser a prioridade do orçamento municipal?", author: "@cidadaniajá", status: "Ativa", votes: "6.109", ends: "19 ago" },
  { id: "E-2106", title: "A IA deve ser regulada por uma agência própria?", author: "@futuroaberto", status: "Ativa", votes: "5.887", ends: "25 ago" },
  { id: "E-2105", title: "Praças públicas devem aceitar eventos privados?", author: "@anaurbanista", status: "Inativa", votes: "3.142", ends: "Encerrada" },
];

const reports = [
  { id: "DEN-2841", reason: "Discurso de ódio", target: "Comentário de @vozativa", opened: "há 8 min", priority: "Alta", status: "Solicitação" },
  { id: "DEN-2840", reason: "Desinformação", target: "Post P-8279", opened: "há 21 min", priority: "Alta", status: "Atendimento" },
  { id: "DEN-2839", reason: "Assédio", target: "Mensagem de @debateiro", opened: "há 46 min", priority: "Média", status: "Atendimento" },
  { id: "DEN-2838", reason: "Spam", target: "Post P-8271", opened: "há 1 h", priority: "Baixa", status: "Solicitação" },
  { id: "DEN-2837", reason: "Conteúdo violento", target: "Post P-8268", opened: "há 2 h", priority: "Alta", status: "Encerramento" },
];

const faqs = [
  { question: "Como validar minha conta?", category: "Conta e perfil", status: "Publicado", updated: "14 ago 2026" },
  { question: "Como funciona uma enquete no Kratikos?", category: "Enquetes", status: "Publicado", updated: "12 ago 2026" },
  { question: "O que acontece quando denuncio um conteúdo?", category: "Segurança", status: "Publicado", updated: "08 ago 2026" },
  { question: "Como excluir permanentemente minha conta?", category: "Privacidade", status: "Rascunho", updated: "05 ago 2026" },
];

const admins = [
  { name: "João Pedro", email: "joao@kratikos.com.br", role: "Super administrador", status: "Ativo", last: "Agora" },
  { name: "Camila Rocha", email: "camila@kratikos.com.br", role: "Moderadora", status: "Ativo", last: "há 18 min" },
  { name: "Paulo Mendes", email: "paulo@kratikos.com.br", role: "Analista", status: "Ativo", last: "há 3 h" },
];

const stateData: Array<[string, number]> = [
  ["SP", 32], ["RJ", 19], ["MG", 15], ["BA", 9], ["PR", 8], ["RS", 7], ["PE", 5], ["CE", 5],
];

const topTabs = {
  categorias: {
    label: "Categorias",
    columns: ["Categoria", "Seleções", "Crescimento"],
    rows: [["Política", "18.240", "+12,4%"], ["Cidadania", "14.890", "+8,7%"], ["Economia", "12.461", "+6,2%"], ["Tecnologia", "10.225", "+18,9%"], ["Meio ambiente", "9.842", "+10,1%"]],
  },
  usuarios: {
    label: "Usuários",
    columns: ["Usuário", "Ações", "Índice"],
    rows: [["@marinaalves", "1.482", "94"], ["@caiomoreira", "1.209", "91"], ["@livias", "1.087", "88"], ["@anaurbanista", "984", "84"], ["@joaor", "901", "81"]],
  },
  enquetes: {
    label: "Enquetes",
    columns: ["Enquete", "Votos", "Conversão"],
    rows: [["Voto facultativo", "8.452", "72%"], ["Orçamento municipal", "6.109", "68%"], ["Regulação da IA", "5.887", "64%"], ["Semana de 4 dias", "4.921", "61%"], ["Ensino financeiro", "4.318", "58%"]],
  },
  posts: {
    label: "Posts",
    columns: ["Post", "Interações", "Alcance"],
    rows: [["Transporte gratuito", "1.284", "42,8 mil"], ["Energia limpa", "987", "36,1 mil"], ["Educação financeira", "736", "29,4 mil"], ["Sistema de saúde", "609", "24,7 mil"], ["Semana de 4 dias", "442", "21,2 mil"]],
  },
  cidades: {
    label: "Cidades",
    columns: ["Cidade", "Usuários", "Ativos"],
    rows: [["São Paulo, SP", "3.842", "78%"], ["Rio de Janeiro, RJ", "2.219", "74%"], ["Belo Horizonte, MG", "1.486", "81%"], ["Salvador, BA", "1.104", "76%"], ["Curitiba, PR", "978", "83%"]],
  },
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("");
}

function Status({ children, tone }: { children: React.ReactNode; tone?: Tone }) {
  const normalized = String(children).toLowerCase();
  const resolved = tone ?? (normalized.includes("ativ") || normalized.includes("publicado") || normalized.includes("normal") ? "green" : normalized.includes("bloq") || normalized.includes("crítico") ? "red" : normalized.includes("análise") || normalized.includes("atendimento") ? "orange" : normalized.includes("solicitação") ? "blue" : "gray");
  return <span className={`status status-${resolved}`}><i />{children}</span>;
}

function BarChart({ values, comparison, color = "blue", labels = false }: { values: number[]; comparison?: number[]; color?: "blue" | "green" | "purple"; labels?: boolean }) {
  const max = Math.max(...values);
  const visible = values.slice(-15);
  const compareVisible = comparison?.slice(-15);
  return (
    <div className={`bar-chart chart-${color}`} aria-label="Gráfico dos últimos 30 dias">
      {visible.map((value, index) => (
        <div className="bar-slot" key={`${value}-${index}`}>
          <div className="bar-pair">
            <span className="chart-bar" style={{ height: `${Math.max(9, (value / max) * 100)}%` }} title={`${value}`} />
            {compareVisible && <span className="chart-bar comparison" style={{ height: `${Math.max(6, (compareVisible[index] / max) * 100)}%` }} title={`${compareVisible[index]} exclusões`} />}
          </div>
          {labels && (index === 0 || index === 7 || index === 14) && <small>{index === 0 ? "03 ago" : index === 7 ? "10 ago" : "17 ago"}</small>}
        </div>
      ))}
    </div>
  );
}

function MetricCard({ label, value, delta, icon, tone }: { label: string; value: string; delta: string; icon: string; tone: Tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon icon-${tone}`}>{icon}</div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong></div>
      <span className="delta">↗ {delta}</span>
    </article>
  );
}

function Dashboard() {
  const [topTab, setTopTab] = useState<keyof typeof topTabs>("categorias");
  const currentTop = topTabs[topTab];
  return (
    <div className="page-stack">
      <section className="metrics-grid">
        <MetricCard label="Usuários ativos" value="12.842" delta="8,4%" icon="◎" tone="blue" />
        <MetricCard label="Usuários validados" value="9.617" delta="11,2%" icon="✓" tone="green" />
        <MetricCard label="Posts publicados" value="28.451" delta="6,7%" icon="▤" tone="purple" />
        <MetricCard label="Enquetes ativas" value="1.284" delta="14,9%" icon="◉" tone="orange" />
        <MetricCard label="Votos registrados" value="184.892" delta="21,6%" icon="✦" tone="green" />
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="panel panel-wide">
          <div className="panel-heading">
            <div><span className="section-kicker">Crescimento da comunidade</span><h2>Contas criadas x excluídas</h2></div>
            <div className="legend"><span><i className="legend-blue" />Novas contas</span><span><i className="legend-red" />Exclusões</span></div>
          </div>
          <div className="chart-total"><strong>2.418</strong><span>novas contas nos últimos 30 dias</span></div>
          <BarChart values={accounts} comparison={deletions} labels />
        </article>
        <article className="panel map-panel">
          <div className="panel-heading"><div><span className="section-kicker">Distribuição geográfica</span><h2>Usuários por estado</h2></div><button className="icon-button" aria-label="Mais opções">•••</button></div>
          <div className="map-content">
            <div className="brazil-map" aria-label="Mapa ilustrativo do Brasil">
              <span className="map-glow glow-one" /><span className="map-glow glow-two" /><span className="map-glow glow-three" />
              <div className="map-callout callout-sp"><b>SP</b><span>4.108</span></div>
              <div className="map-callout callout-ba"><b>BA</b><span>1.156</span></div>
              <div className="map-callout callout-rj"><b>RJ</b><span>2.440</span></div>
            </div>
            <div className="state-list">
              {stateData.slice(0, 5).map(([state, percent], index) => <div key={state}><span>{index + 1}</span><b>{state}</b><div><i style={{ width: `${percent * 2.2}%` }} /></div><strong>{percent}%</strong></div>)}
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="panel mini-chart-panel"><div className="panel-heading"><div><span className="section-kicker">Participação</span><h2>Votos por dia</h2></div><span className="delta big">↗ 21,6%</span></div><div className="mini-total"><strong>12.784</strong><span>últimos 30 dias</span></div><BarChart values={votes} color="green" /></article>
        <article className="panel mini-chart-panel"><div className="panel-heading"><div><span className="section-kicker">Tráfego</span><h2>Acessos por dia</h2></div><span className="delta big">↗ 15,3%</span></div><div className="mini-total"><strong>22.496</strong><span>últimos 30 dias</span></div><BarChart values={accesses} color="purple" /></article>
        <article className="panel pulse-panel">
          <div className="panel-heading"><div><span className="section-kicker">Agora</span><h2>Pulso da plataforma</h2></div><Status tone="green">Saudável</Status></div>
          <div className="pulse-number"><span className="live-dot" /><strong>638</strong><span>usuários online</span></div>
          <div className="pulse-stats"><div><span>Votos/min</span><strong>28</strong></div><div><span>Posts/h</span><strong>46</strong></div><div><span>Denúncias</span><strong>12</strong></div></div>
        </article>
      </section>

      <section className="panel top-panel">
        <div className="panel-heading"><div><span className="section-kicker">Rankings</span><h2>Top 10 da plataforma</h2></div><button className="text-button">Exportar relatório ↗</button></div>
        <div className="tabs" role="tablist">
          {(Object.keys(topTabs) as (keyof typeof topTabs)[]).map((key) => <button key={key} onClick={() => setTopTab(key)} className={topTab === key ? "active" : ""}>{topTabs[key].label}</button>)}
        </div>
        <div className="table-wrap"><table><thead><tr><th>#</th>{currentTop.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{currentTop.rows.map((row, index) => <tr key={row[0]}><td><span className={`rank rank-${index + 1}`}>{index + 1}</span></td>{row.map((cell, cellIndex) => <td key={cell}>{cellIndex === 0 ? <strong>{cell}</strong> : cellIndex === 2 && String(cell).startsWith("+") ? <span className="delta">↗ {cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>
        <button className="table-footer-button">Ver ranking completo</button>
      </section>
    </div>
  );
}

function ListToolbar({ placeholder, action, onAction, children }: { placeholder: string; action: string; onAction: () => void; children?: React.ReactNode }) {
  return <div className="list-toolbar"><label className="search-box"><span>⌕</span><input placeholder={placeholder} /></label><div className="toolbar-actions">{children}<button className="primary-button" onClick={onAction}><span>＋</span>{action}</button></div></div>;
}

function EmptyModal({ title, onClose, onSave, fields = ["Título", "Descrição"] }: { title: string; onClose: () => void; onSave: () => void; fields?: string[] }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="section-kicker">Novo registro</span><h2>{title}</h2></div><button className="icon-button close" onClick={onClose} aria-label="Fechar">×</button></div><div className="modal-fields">{fields.map((field, index) => <label key={field}><span>{field}</span>{index === fields.length - 1 && fields.length < 4 ? <textarea placeholder={`Informe ${field.toLowerCase()}`} /> : <input placeholder={`Informe ${field.toLowerCase()}`} />}</label>)}</div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" onClick={onSave}>Salvar</button></div></section></div>;
}

function ManagementTable({ children }: { children: React.ReactNode }) {
  return <section className="panel management-panel"><div className="table-wrap">{children}</div><div className="pagination"><span>Mostrando 1–{Array.isArray(children) ? children.length : 6} de 24.451 resultados</span><div><button disabled>‹</button><button className="current">1</button><button>2</button><button>3</button><button>›</button></div></div></section>;
}

function Moderation({ notify }: { notify: (text: string) => void }) {
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? reports : reports.filter((report) => report.status === filter);
  return <div className="page-stack"><section className="summary-strip"><div><span>Em solicitação</span><strong>12</strong><small>+4 hoje</small></div><div><span>Em atendimento</span><strong>7</strong><small>tempo médio: 42 min</small></div><div><span>Encerradas hoje</span><strong>31</strong><small>94% dentro do SLA</small></div><div><span>Prioridade alta</span><strong className="red-text">5</strong><small>requer atenção</small></div></section><div className="workflow"><div className="workflow-step active"><i>1</i><span><b>Solicitação</b><small>Triagem inicial</small></span></div><em /><div className="workflow-step"><i>2</i><span><b>Atendimento</b><small>Análise do conteúdo</small></span></div><em /><div className="workflow-step"><i>3</i><span><b>Encerramento</b><small>Decisão e registro</small></span></div></div><ListToolbar placeholder="Buscar denúncia, usuário ou conteúdo" action="Nova denúncia" onAction={() => notify("Formulário de nova denúncia aberto")}><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todos</option><option>Solicitação</option><option>Atendimento</option><option>Encerramento</option></select></ListToolbar><ManagementTable><table><thead><tr><th>Chamado</th><th>Motivo</th><th>Conteúdo denunciado</th><th>Abertura</th><th>Prioridade</th><th>Etapa</th><th /></tr></thead><tbody>{filtered.map((report) => <tr key={report.id}><td><strong>{report.id}</strong></td><td>{report.reason}</td><td>{report.target}</td><td>{report.opened}</td><td><Status tone={report.priority === "Alta" ? "red" : report.priority === "Média" ? "orange" : "gray"}>{report.priority}</Status></td><td><Status>{report.status}</Status></td><td><button className="row-action" onClick={() => notify(`${report.id} atribuído a você`)}>Assumir →</button></td></tr>)}</tbody></table></ManagementTable></div>;
}

function Users({ notify }: { notify: (text: string) => void }) {
  const [users, setUsers] = useState(initialUsers);
  const toggle = (id: string) => { setUsers((items) => items.map((user) => user.id === id ? { ...user, status: user.status === "Bloqueado" ? "Ativo" : "Bloqueado" } : user)); notify("Status do usuário atualizado"); };
  return <div className="page-stack"><section className="summary-strip"><div><span>Total de usuários</span><strong>14.284</strong><small>+8,4% no mês</small></div><div><span>Ativos</span><strong>12.842</strong><small>89,9% da base</small></div><div><span>Validados</span><strong>9.617</strong><small>67,3% da base</small></div><div><span>Bloqueados</span><strong>184</strong><small>1,3% da base</small></div></section><ListToolbar placeholder="Buscar por nome, @ ou cidade" action="Adicionar usuário" onAction={() => notify("Convite de usuário iniciado")}><select><option>Todos os status</option><option>Ativo</option><option>Bloqueado</option><option>Em análise</option></select></ListToolbar><ManagementTable><table><thead><tr><th>Usuário</th><th>Localização</th><th>Validação</th><th>Engajamento</th><th>Status</th><th>Ações</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="user-cell"><span className="avatar tiny">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.handle} · {user.id}</small></span></div></td><td>{user.city}</td><td>{user.validated ? <span className="verified">✓ Validado</span> : <span className="muted">Pendente</span>}</td><td><strong>{user.engagement}</strong> pts</td><td><Status>{user.status}</Status></td><td><div className="row-actions"><button onClick={() => notify(`Edição de ${user.name} aberta`)}>Editar</button><button className={user.status === "Bloqueado" ? "success-action" : "danger-action"} onClick={() => toggle(user.id)}>{user.status === "Bloqueado" ? "Desbloquear" : "Bloquear"}</button><button onClick={() => notify(`Fluxo de anonimização de ${user.name} iniciado`)}>•••</button></div></td></tr>)}</tbody></table></ManagementTable></div>;
}

function ContentManager({ kind, notify }: { kind: "posts" | "enquetes"; notify: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [postsData, setPostsData] = useState(initialPosts);
  const [pollData, setPollData] = useState(initialPolls);
  const isPosts = kind === "posts";
  const toggle = (id: string) => { if (isPosts) setPostsData((rows) => rows.map((row) => row.id === id ? { ...row, status: row.status === "Ativo" ? "Inativo" : "Ativo" } : row)); else setPollData((rows) => rows.map((row) => row.id === id ? { ...row, status: row.status === "Ativa" ? "Inativa" : "Ativa" } : row)); notify(`${isPosts ? "Post" : "Enquete"} atualizado com sucesso`); };
  return <div className="page-stack"><section className="summary-strip"><div><span>{isPosts ? "Total de posts" : "Total de enquetes"}</span><strong>{isPosts ? "28.451" : "3.842"}</strong><small>desde o lançamento</small></div><div><span>{isPosts ? "Publicados hoje" : "Ativas agora"}</span><strong>{isPosts ? "126" : "1.284"}</strong><small>+12% na semana</small></div><div><span>{isPosts ? "Inativos" : "Encerradas"}</span><strong>{isPosts ? "346" : "2.408"}</strong><small>conteúdo preservado</small></div><div><span>Em análise</span><strong>18</strong><small>fila de moderação</small></div></section><ListToolbar placeholder={`Buscar ${isPosts ? "post, autor ou ID" : "enquete, autor ou ID"}`} action={`Criar ${isPosts ? "post" : "enquete"}`} onAction={() => setOpen(true)}><select><option>Todos os status</option><option>Ativo</option><option>Inativo</option><option>Em análise</option></select></ListToolbar><ManagementTable><table><thead><tr><th>ID</th><th>{isPosts ? "Conteúdo" : "Pergunta"}</th><th>Autor</th>{isPosts && <th>Tipo</th>}<th>{isPosts ? "Engajamento" : "Votos"}</th>{!isPosts && <th>Encerramento</th>}<th>Status</th><th>Ações</th></tr></thead><tbody>{isPosts ? postsData.map((post) => <tr key={post.id}><td><strong>{post.id}</strong></td><td className="title-cell"><strong>{post.title}</strong></td><td>{post.author}</td><td>{post.kind}</td><td>{post.engagement}</td><td><Status>{post.status}</Status></td><td><div className="row-actions"><button onClick={() => notify(`Editor do ${post.id} aberto`)}>Editar</button><button onClick={() => toggle(post.id)}>{post.status === "Ativo" ? "Inativar" : "Ativar"}</button><button className="danger-action" onClick={() => notify("Confirmação de exclusão solicitada")}>Excluir</button></div></td></tr>) : pollData.map((poll) => <tr key={poll.id}><td><strong>{poll.id}</strong></td><td className="title-cell"><strong>{poll.title}</strong></td><td>{poll.author}</td><td>{poll.votes}</td><td>{poll.ends}</td><td><Status>{poll.status}</Status></td><td><div className="row-actions"><button onClick={() => notify(`Editor da ${poll.id} aberto`)}>Editar</button><button onClick={() => toggle(poll.id)}>{poll.status === "Ativa" ? "Inativar" : "Ativar"}</button><button className="danger-action" onClick={() => notify("Confirmação de exclusão solicitada")}>Excluir</button></div></td></tr>)}</tbody></table></ManagementTable>{open && <EmptyModal title={isPosts ? "Criar novo post" : "Criar nova enquete"} fields={isPosts ? ["Título", "Categoria", "Conteúdo"] : ["Pergunta", "Categoria", "Opções de resposta"]} onClose={() => setOpen(false)} onSave={() => { setOpen(false); notify(`${isPosts ? "Post" : "Enquete"} criado como rascunho`); }} />}</div>;
}

function Faq({ notify }: { notify: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="page-stack"><section className="summary-strip"><div><span>Artigos publicados</span><strong>42</strong><small>6 categorias</small></div><div><span>Visualizações no mês</span><strong>18.429</strong><small>+9,8%</small></div><div><span>Taxa de resolução</span><strong>86%</strong><small>sem abrir suporte</small></div><div><span>Rascunhos</span><strong>4</strong><small>aguardando revisão</small></div></section><ListToolbar placeholder="Buscar pergunta ou categoria" action="Nova pergunta" onAction={() => setOpen(true)}><select><option>Todas as categorias</option><option>Conta e perfil</option><option>Enquetes</option><option>Segurança</option></select></ListToolbar><section className="faq-grid">{faqs.map((faq, index) => <article className="faq-card" key={faq.question}><div><span className="faq-number">{String(index + 1).padStart(2, "0")}</span><Status>{faq.status}</Status></div><h3>{faq.question}</h3><p>{faq.category} · Atualizado em {faq.updated}</p><button onClick={() => notify(`Editor de “${faq.question}” aberto`)}>Editar artigo →</button></article>)}</section>{open && <EmptyModal title="Criar pergunta frequente" fields={["Pergunta", "Categoria", "Resposta"]} onClose={() => setOpen(false)} onSave={() => { setOpen(false); notify("Pergunta salva como rascunho"); }} />}</div>;
}

function Admins({ notify }: { notify: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="page-stack"><section className="access-banner"><div className="access-icon">♙</div><div><span className="section-kicker">Acesso protegido</span><h2>Permissões por função</h2><p>Administradores recebem apenas os acessos necessários para suas responsabilidades. Todas as ações sensíveis ficam registradas.</p></div><button className="secondary-button" onClick={() => notify("Histórico de auditoria aberto")}>Ver auditoria</button></section><ListToolbar placeholder="Buscar administrador" action="Convidar administrador" onAction={() => setOpen(true)}><select><option>Todas as funções</option><option>Super administrador</option><option>Moderador</option><option>Analista</option></select></ListToolbar><ManagementTable><table><thead><tr><th>Administrador</th><th>Função</th><th>Status</th><th>Último acesso</th><th>Ações</th></tr></thead><tbody>{admins.map((admin) => <tr key={admin.email}><td><div className="user-cell"><span className="avatar tiny">{initials(admin.name)}</span><span><strong>{admin.name}</strong><small>{admin.email}</small></span></div></td><td><span className="role-pill">{admin.role}</span></td><td><Status>{admin.status}</Status></td><td>{admin.last}</td><td><div className="row-actions"><button onClick={() => notify(`Permissões de ${admin.name} abertas`)}>Permissões</button><button>•••</button></div></td></tr>)}</tbody></table></ManagementTable>{open && <EmptyModal title="Convidar administrador" fields={["Nome", "E-mail", "Função"]} onClose={() => setOpen(false)} onSave={() => { setOpen(false); notify("Convite de administrador enviado"); }} />}</div>;
}

function Observability() {
  const services = [["API principal", "99,99%", "128 ms", "Normal"], ["Banco de dados", "99,97%", "34 ms", "Normal"], ["Fila de notificações", "99,92%", "218 ms", "Atenção"], ["Serviço de mídia", "99,98%", "164 ms", "Normal"]];
  return <div className="page-stack"><section className="health-hero"><div><span className="section-kicker">Status operacional</span><h2>Todos os sistemas essenciais estão operando</h2><p>Última verificação há 32 segundos</p></div><div className="health-score"><span>Saúde geral</span><strong>98,7</strong><small>/ 100</small></div></section><section className="metrics-grid obs-metrics"><MetricCard label="Disponibilidade" value="99,98%" delta="0,02%" icon="⌁" tone="green"/><MetricCard label="Latência p95" value="182 ms" delta="12 ms" icon="↯" tone="blue"/><MetricCard label="Taxa de erros" value="0,12%" delta="0,04%" icon="!" tone="orange"/><MetricCard label="Requisições/min" value="2.846" delta="17,2%" icon="↕" tone="purple"/></section><section className="dashboard-grid dashboard-grid-secondary"><article className="panel panel-two"><div className="panel-heading"><div><span className="section-kicker">Últimas 24 horas</span><h2>Volume de requisições</h2></div><Status tone="green">Tempo real</Status></div><div className="mini-total"><strong>4,08 milhões</strong><span>requisições processadas</span></div><BarChart values={accesses} color="blue" labels /></article><article className="panel services-panel"><div className="panel-heading"><div><span className="section-kicker">Infraestrutura</span><h2>Serviços monitorados</h2></div></div>{services.map(([name, uptime, latency, status]) => <div className="service-row" key={name}><span className="service-dot"/><div><strong>{name}</strong><small>{uptime} disponibilidade</small></div><span>{latency}</span><Status tone={status === "Normal" ? "green" : "orange"}>{status}</Status></div>)}</article></section><section className="panel incident-panel"><div className="panel-heading"><div><span className="section-kicker">Incidentes recentes</span><h2>Histórico operacional</h2></div><button className="text-button">Configurar alertas</button></div><div className="timeline"><div><i className="resolved"/><span><strong>Atraso na fila de notificações push</strong><small>Resolvido · 16 ago, 18:42 · duração de 14 min</small></span><Status tone="green">Resolvido</Status></div><div><i className="monitoring"/><span><strong>Aumento de latência no serviço de mídia</strong><small>Monitorando · hoje, 09:18</small></span><Status tone="orange">Monitorando</Status></div></div></section></div>;
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (!email || !password) { setError("Informe seu e-mail e sua senha."); return; } onLogin(); };
  return <main className="login-page"><div className="login-orb orb-a"/><div className="login-orb orb-b"/><section className="login-brand"><img src="/brand/kratikos-horizontal.svg" alt="Kratikos"/><div><span className="brand-kicker">Portal administrativo</span><h1>Inteligência para fortalecer cada voz.</h1><p>Gerencie a comunidade, acompanhe o impacto da plataforma e tome decisões com contexto.</p></div><div className="login-proof"><div><strong>184 mil</strong><span>votos registrados</span></div><div><strong>12,8 mil</strong><span>usuários ativos</span></div><div><strong>99,98%</strong><span>disponibilidade</span></div></div></section><section className="login-card"><div className="mobile-logo"><img src="/brand/kratikos-horizontal.svg" alt="Kratikos"/></div><div className="lock-badge">⌾</div><span className="section-kicker">Área restrita</span><h2>Acesse o portal</h2><p>Entre com suas credenciais de administrador.</p><form onSubmit={submit}><label><span>E-mail corporativo</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@kratikos.com.br" autoComplete="email"/></label><label><span>Senha</span><div className="password-input"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" autoComplete="current-password"/><button type="button" aria-label="Mostrar senha">◉</button></div></label><div className="form-between"><label className="checkbox"><input type="checkbox"/><span>Lembrar acesso</span></label><button type="button" className="link-button">Esqueci minha senha</button></div>{error && <div className="form-error">{error}</div>}<button className="login-button" type="submit">Entrar no portal <span>→</span></button></form><div className="login-note"><span>✓</span><p><strong>Ambiente protegido</strong><br/>Acesso monitorado e ações registradas.</p></div></section></main>;
}

export function KratikosPortal() {
  const [logged, setLogged] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const meta = viewMeta[view];
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2800); };
  const content = useMemo(() => {
    if (view === "dashboard") return <Dashboard />;
    if (view === "moderacao") return <Moderation notify={notify} />;
    if (view === "usuarios") return <Users notify={notify} />;
    if (view === "posts") return <ContentManager kind="posts" notify={notify} />;
    if (view === "enquetes") return <ContentManager kind="enquetes" notify={notify} />;
    if (view === "faq") return <Faq notify={notify} />;
    if (view === "administradores") return <Admins notify={notify} />;
    return <Observability />;
  }, [view]);
  if (!logged) return <Login onLogin={() => setLogged(true)} />;
  return <div className="portal-shell"><aside className={`sidebar ${sidebarOpen ? "open" : ""}`}><div className="sidebar-brand"><img src="/brand/kratikos-horizontal.svg" alt="Kratikos"/><span>admin</span></div><nav>{navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setSidebarOpen(false); }}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.badge && <b>{item.badge}</b>}</button>)}</nav><div className="sidebar-bottom"><button onClick={() => notify("Configurações abertas em breve")}><span className="nav-icon">⚙</span><span>Configurações</span></button><div className="admin-card"><span className="avatar">JP</span><span><strong>João Pedro</strong><small>Super administrador</small></span><button aria-label="Opções da conta">•••</button></div></div></aside>{sidebarOpen && <button className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}<main className="portal-main"><header className="topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">☰</button><div><span>{meta.eyebrow}</span><h1>{meta.title}</h1></div><div className="topbar-actions"><label className="global-search"><span>⌕</span><input placeholder="Buscar no portal" aria-label="Buscar no portal"/><kbd>⌘ K</kbd></label><button className="notification-button" aria-label="Notificações">♢<i>3</i></button><button className="date-button">17 ago 2026 <span>⌄</span></button><button className="logout-button" onClick={() => setLogged(false)} aria-label="Sair">↗</button></div></header><div className="content">{content}</div></main>{toast && <div className="toast"><span>✓</span>{toast}</div>}</div>;
}
