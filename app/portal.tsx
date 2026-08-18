"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import brazilMap from "@svg-maps/brazil";

type View =
  | "dashboard"
  | "moderacao"
  | "usuarios"
  | "posts"
  | "enquetes"
  | "administradores"
  | "observabilidade";

type Tone = "green" | "blue" | "purple" | "orange" | "red" | "gray";

type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
};

type AdminDashboardData = {
  summary: {
    totalUsers: number;
    activeUsers: number;
    validatedUsers: number;
    publishedPosts: number;
    activePolls: number;
    registeredVotes: number;
    votesToday: number;
    pendingReports: number;
  };
  accountsLast30Days: Array<{
    date: string;
    created: number;
    deletionRequests: number;
  }>;
  votesLast30Days: Array<{ date: string; total: number }>;
  usersByState: Array<{ state: string; total: number }>;
  rankings?: {
    categories: Array<{
      id: string;
      name: string;
      selections: number;
      growthPercent: number;
    }>;
    users: Array<{
      id: string;
      name: string;
      nickname: string | null;
      actions: number;
      score: number;
    }>;
    polls: Array<{
      id: string;
      question: string;
      votes: number;
      conversionPercent: number;
    }>;
    posts: Array<{
      id: string;
      title: string;
      engagement: number;
      reach: number;
    }>;
    cities: Array<{
      city: string;
      state: string;
      users: number;
      activePercent: number;
    }>;
  };
  generatedAt: string;
  partial?: boolean;
};

type ManagedUser = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
  photoUrl: string | null;
  status: "active" | "inactive" | "pending" | "blocked";
  verificationLevel: number;
  documentVerified: boolean;
  totalVotes: number;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  createdAt: string;
  updatedAt: string;
};

type ManagedUsersResponse = {
  data: ManagedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    validated: number;
    blocked: number;
  };
};

type ModerationTicket = {
  id: string;
  contentType: "post" | "comment" | "news" | "news_comment" | "user";
  contentId: string;
  target: string;
  violationType: string;
  description: string | null;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
  priority: "low" | "medium" | "high" | "critical";
  stage: "request" | "in_progress" | "closed";
  resolution: string | null;
  reporter: { id: string; name: string } | null;
  createdByAdmin: { id: string; name: string } | null;
  assignedAdmin: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  handledAt: string | null;
  closedAt: string | null;
};

type ModerationResponse = {
  data: ModerationTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    request: number;
    inProgress: number;
    closedToday: number;
    highPriority: number;
  };
};

type ManagedPost = {
  id: string;
  title: string;
  content: string;
  type: "proposta" | "discussao" | "votacao";
  status: "ativo" | "inativo";
  scope: "internacional" | "nacional" | "regional";
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  author: { id: string; name: string; nickname: string | null } | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  engagement: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  repostsCount: number;
  createdAt: string;
  updatedAt: string;
};

type ManagedPostsResponse = {
  data: ManagedPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
    publishedToday: number;
  };
  categories: Array<{ id: string; name: string }>;
};

type ManagedPoll = {
  id: string;
  question: string;
  description: string | null;
  status: "aberta" | "fechada" | "cancelada";
  pollKind: "binary" | "multiple";
  startDate: string;
  endDate: string | null;
  minOptions: number;
  maxOptions: number;
  options: Array<{
    id: string;
    content: string;
    votesCount: number;
    semanticRole: "positive" | "negative" | "neutral";
    displayOrder: number;
  }>;
  totalVotes: number;
  scope: "internacional" | "nacional" | "regional";
  category: { id: string; name: string } | null;
  author: { id: string; name: string; nickname: string | null } | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  createdAt: string;
  updatedAt: string;
};

type ManagedPollsResponse = {
  data: ManagedPoll[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    closed: number;
    createdToday: number;
  };
  categories: Array<{ id: string; name: string }>;
};

type ManagedAdministrator = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "moderator" | "analyst";
  status: "active" | "inactive" | "blocked";
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  isLocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdministratorsResponse = {
  data: ManagedAdministrator[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    superAdmins: number;
    locked: number;
  };
};

type ObservabilityData = {
  healthScore: number;
  status: "healthy" | "warning" | "critical";
  metrics: {
    successRate: number;
    latencyP95Ms: number;
    errorRate: number;
    requestsPerMinute: number;
    requestsLast24Hours: number;
    uptimeSeconds: number;
  };
  requestVolume: Array<{ hour: string; requests: number; errors: number }>;
  services: Array<{
    name: string;
    status: "healthy" | "warning" | "down";
    metric: string;
    detail: string;
  }>;
  incidents: Array<{
    severity: "warning" | "critical";
    title: string;
    detail: string;
  }>;
  generatedAt: string;
  scope: string;
};

const adminRoleLabels: Record<string, string> = {
  super_admin: "Super administrador",
  admin: "Administrador",
  moderator: "Moderador",
  analyst: "Analista",
};

const navItems: { id: View; label: string; icon: string; badge?: number }[] = [
  { id: "dashboard", label: "Visão geral", icon: "▦" },
  { id: "moderacao", label: "Moderação", icon: "⚑", badge: 12 },
  { id: "usuarios", label: "Usuários", icon: "◎" },
  { id: "posts", label: "Posts", icon: "▤" },
  { id: "enquetes", label: "Enquetes", icon: "◉" },
  { id: "administradores", label: "Administradores", icon: "♙" },
  { id: "observabilidade", label: "Observabilidade", icon: "⌁" },
];

const viewMeta: Record<View, { title: string; eyebrow: string }> = {
  dashboard: { title: "Visão geral", eyebrow: "Dashboard de negócio" },
  moderacao: { title: "Central de moderação", eyebrow: "Gestão de denúncias" },
  usuarios: { title: "Usuários do app", eyebrow: "Gestão da comunidade" },
  posts: { title: "Posts", eyebrow: "Gestão de conteúdo" },
  enquetes: { title: "Enquetes", eyebrow: "Gestão de participação" },
  administradores: { title: "Administradores", eyebrow: "Controle de acesso" },
  observabilidade: { title: "Observabilidade", eyebrow: "Saúde da plataforma" },
};

const accesses = [235, 278, 251, 310, 296, 338, 361, 389, 374, 428, 415, 461, 488, 472, 516, 543, 525, 574, 558, 607, 589, 648, 621, 673, 701, 728, 696, 761, 742, 804];

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

const topTabs = {
  categorias: {
    label: "Categorias",
    columns: ["Categoria", "Seleções", "Crescimento"],
  },
  usuarios: {
    label: "Usuários",
    columns: ["Usuário", "Ações", "Índice"],
  },
  enquetes: {
    label: "Enquetes",
    columns: ["Enquete", "Votos", "Conversão"],
  },
  posts: {
    label: "Posts",
    columns: ["Post", "Interações", "Alcance"],
  },
  cidades: {
    label: "Cidades",
    columns: ["Cidade", "Usuários", "Ativos"],
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

function BarChart({ values, comparison, color = "blue", labels = false, dateLabels }: { values: number[]; comparison?: number[]; color?: "blue" | "green" | "purple"; labels?: boolean; dateLabels?: string[] }) {
  const max = Math.max(1, ...values, ...(comparison ?? []));
  const visible = values.slice(-15);
  const compareVisible = comparison?.slice(-15);
  const visibleLabels = dateLabels?.slice(-15);
  return (
    <div className={`bar-chart chart-${color}`} aria-label="Gráfico dos últimos 30 dias">
      {visible.map((value, index) => (
        <div className="bar-slot" key={`${value}-${index}`}>
          <div className="bar-pair">
            <span className="chart-bar" style={{ height: `${Math.max(9, (value / max) * 100)}%` }} title={`${value}`} />
            {compareVisible && <span className="chart-bar comparison" style={{ height: `${Math.max(6, (compareVisible[index] / max) * 100)}%` }} title={`${compareVisible[index]} exclusões`} />}
          </div>
          {labels && (index === 0 || index === 7 || index === 14) && <small>{visibleLabels?.[index] ?? (index === 0 ? "03 ago" : index === 7 ? "10 ago" : "17 ago")}</small>}
        </div>
      ))}
    </div>
  );
}

function MetricCard({ label, value, delta, meta, icon, tone }: { label: string; value: string; delta?: string; meta?: string; icon: string; tone: Tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon icon-${tone}`}>{icon}</div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong></div>
      {delta ? <span className="delta">↗ {delta}</span> : <span className="metric-meta">{meta ?? "Dado atual"}</span>}
    </article>
  );
}

type BrazilStateMetric = {
  code: string;
  name: string;
  path: string;
  total: number;
};

const brazilMapData = brazilMap as {
  viewBox: string;
  locations: Array<{ id: string; name: string; path: string }>;
};

function normalizeStateKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
}

const brazilStateCodeByAlias = new Map<string, string>();
brazilMapData.locations.forEach((location) => {
  brazilStateCodeByAlias.set(location.id.toUpperCase(), location.id.toUpperCase());
  brazilStateCodeByAlias.set(normalizeStateKey(location.name), location.id.toUpperCase());
});

function buildBrazilStateMetrics(usersByState: AdminDashboardData["usersByState"]): BrazilStateMetric[] {
  const totals = new Map<string, number>();
  usersByState.forEach((item) => {
    const rawState = item.state.trim();
    const code = brazilStateCodeByAlias.get(rawState.toUpperCase()) ?? brazilStateCodeByAlias.get(normalizeStateKey(rawState));
    if (code) totals.set(code, (totals.get(code) ?? 0) + item.total);
  });
  return brazilMapData.locations.map((location) => ({
    code: location.id.toUpperCase(),
    name: location.name,
    path: location.path,
    total: totals.get(location.id.toUpperCase()) ?? 0,
  }));
}

function BrazilUsersMap({ states, loading }: { states: BrazilStateMetric[]; loading: boolean }) {
  const ranked = useMemo(() => [...states].sort((a, b) => b.total - a.total), [states]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const maxTotal = Math.max(1, ...states.map((state) => state.total));
  const activeCode = hoveredCode ?? selectedCode ?? ranked.find((state) => state.total > 0)?.code ?? null;
  const activeState = states.find((state) => state.code === activeCode) ?? null;
  const number = (value: number) => new Intl.NumberFormat("pt-BR").format(value);

  return (
    <div className="brazil-map-shell">
      <svg className="brazil-map" viewBox={brazilMapData.viewBox} role="group" aria-labelledby="brazil-users-map-title brazil-users-map-description">
        <title id="brazil-users-map-title">Mapa do Brasil com usuários registrados por estado</title>
        <desc id="brazil-users-map-description">A intensidade de cada estado representa a quantidade de usuários ativos com localização informada.</desc>
        {states.map((state) => {
          const intensity = state.total / maxTotal;
          const fill = state.total > 0 ? `rgba(85, 230, 165, ${0.24 + intensity * 0.7})` : "#414141";
          return (
            <path
              key={state.code}
              className={`brazil-state ${activeCode === state.code ? "is-selected" : ""}`}
              d={state.path}
              fill={fill}
              role="button"
              tabIndex={0}
              aria-label={`${state.name}, ${state.code}: ${number(state.total)} usuários`}
              onMouseEnter={() => setHoveredCode(state.code)}
              onMouseLeave={() => setHoveredCode(null)}
              onFocus={() => setHoveredCode(state.code)}
              onBlur={() => setHoveredCode(null)}
              onClick={() => setSelectedCode(state.code)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedCode(state.code);
                }
              }}
            >
              <title>{state.name}: {number(state.total)} usuários</title>
            </path>
          );
        })}
      </svg>
      <div className="map-state-detail" aria-live="polite">
        {loading ? <span>Carregando localização dos usuários...</span> : activeState ? <><span>{activeState.name} · {activeState.code}</span><strong>{number(activeState.total)} <small>usuários</small></strong></> : <span>Sem localização informada.</span>}
      </div>
      <div className="map-scale" aria-hidden="true"><span>Menor concentração</span><i /><span>Maior concentração</span></div>
    </div>
  );
}

function Dashboard() {
  const [topTab, setTopTab] = useState<keyof typeof topTabs>("categorias");
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as AdminDashboardData & { message?: string };
      if (!response.ok || !payload.summary) {
        throw new Error(payload.message ?? "Não foi possível carregar os indicadores.");
      }
      setDashboard(payload);
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Não foi possível carregar os indicadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const number = (value?: number) => loading || value === undefined ? "—" : new Intl.NumberFormat("pt-BR").format(value);
  const percentage = (value: number, signed = false) => {
    const formatted = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
    return `${signed && value > 0 ? "+" : ""}${formatted}%`;
  };
  const rankings = dashboard?.rankings;
  const rankingRows: Record<keyof typeof topTabs, string[][]> = {
    categorias: (rankings?.categories ?? []).map((item) => [item.name, number(item.selections), percentage(item.growthPercent, true)]),
    usuarios: (rankings?.users ?? []).map((item) => {
      const userName = item.nickname
        ? item.nickname.startsWith("@") ? item.nickname : `@${item.nickname}`
        : item.name;
      return [userName, number(item.actions), new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(item.score)];
    }),
    enquetes: (rankings?.polls ?? []).map((item) => [item.question || "Enquete sem título", number(item.votes), percentage(item.conversionPercent)]),
    posts: (rankings?.posts ?? []).map((item) => [item.title || "Post sem título", number(item.engagement), number(item.reach)]),
    cidades: (rankings?.cities ?? []).map((item) => [`${item.city}, ${item.state}`, number(item.users), percentage(item.activePercent)]),
  };
  const currentTop = { ...topTabs[topTab], rows: rankingRows[topTab] };
  const exportRanking = () => {
    if (!currentTop.rows.length) return;
    const csvRows = [["Posição", ...currentTop.columns], ...currentTop.rows.map((row, index) => [String(index + 1), ...row])];
    const csv = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ranking-${topTab}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const accountsData = dashboard?.accountsLast30Days ?? [];
  const votesData = dashboard?.votesLast30Days ?? [];
  const createdAccounts = accountsData.map((item) => item.created);
  const deletionRequests = accountsData.map((item) => item.deletionRequests);
  const dailyVotes = votesData.map((item) => item.total);
  const dateLabels = accountsData.map((item) => new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""));
  const createdTotal = createdAccounts.reduce((sum, value) => sum + value, 0);
  const votesTotal = dailyVotes.reduce((sum, value) => sum + value, 0);
  const stateMetrics = useMemo(() => buildBrazilStateMetrics(dashboard?.usersByState ?? []), [dashboard?.usersByState]);
  const topStates = useMemo(() => [...stateMetrics].filter((state) => state.total > 0).sort((a, b) => b.total - a.total).slice(0, 5), [stateMetrics]);
  const maxStateUsers = Math.max(1, ...topStates.map((item) => item.total));
  const summary = dashboard?.summary;
  return (
    <div className="page-stack">
      {error && <div className="data-banner data-banner-error" role="alert"><span>Não foi possível atualizar o dashboard.</span><button onClick={loadDashboard}>Tentar novamente</button></div>}
      {dashboard?.partial && <div className="data-banner"><span>Exibindo os indicadores disponíveis. Os dados administrativos completos entrarão após a publicação do novo endpoint no Railway.</span></div>}
      <section className="metrics-grid">
        <MetricCard label="Usuários ativos" value={number(summary?.activeUsers)} meta="Base atual" icon="◎" tone="blue" />
        <MetricCard label="Usuários validados" value={number(summary?.validatedUsers)} meta="Documento ou nível 2+" icon="✓" tone="green" />
        <MetricCard label="Posts publicados" value={number(summary?.publishedPosts)} meta="Conteúdo ativo" icon="▤" tone="purple" />
        <MetricCard label="Enquetes ativas" value={number(summary?.activePolls)} meta="Abertas agora" icon="◉" tone="orange" />
        <MetricCard label="Votos registrados" value={number(summary?.registeredVotes)} meta="Histórico total" icon="✦" tone="green" />
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="panel panel-wide">
          <div className="panel-heading">
            <div><span className="section-kicker">Crescimento da comunidade</span><h2>Contas criadas x pedidos de exclusão</h2></div>
            <div className="legend"><span><i className="legend-blue" />Novas contas</span><span><i className="legend-red" />Pedidos de exclusão</span></div>
          </div>
          <div className="chart-total"><strong>{number(createdTotal)}</strong><span>novas contas nos últimos 30 dias</span></div>
          {accountsData.length ? <BarChart values={createdAccounts} comparison={deletionRequests} labels dateLabels={dateLabels} /> : <div className="chart-empty">A série histórica estará disponível após a atualização do backend.</div>}
        </article>
        <article className="panel map-panel">
          <div className="panel-heading"><div><span className="section-kicker">Distribuição geográfica</span><h2>Usuários por estado</h2></div><button className="icon-button" aria-label="Mais opções">•••</button></div>
          <div className="map-content">
            <BrazilUsersMap states={stateMetrics} loading={loading} />
            <div className="state-list">
              {topStates.length ? topStates.map((item, index) => <div key={item.code}><span>{index + 1}</span><b title={item.name}>{item.code}</b><div><i style={{ width: `${(item.total / maxStateUsers) * 100}%` }} /></div><strong>{number(item.total)}</strong></div>) : <p className="muted">Sem localização informada.</p>}
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="panel mini-chart-panel"><div className="panel-heading"><div><span className="section-kicker">Participação</span><h2>Votos por dia</h2></div><Status tone="green">Dados reais</Status></div><div className="mini-total"><strong>{number(votesTotal)}</strong><span>últimos 30 dias</span></div>{votesData.length ? <BarChart values={dailyVotes} color="green" /> : <div className="chart-empty compact">Série ainda indisponível.</div>}</article>
        <article className="panel mini-chart-panel"><div className="panel-heading"><div><span className="section-kicker">Observabilidade</span><h2>Acessos por dia</h2></div><Status tone="orange">Pendente</Status></div><div className="mini-total"><strong>—</strong><span>aguardando instrumentação</span></div><div className="chart-empty compact">A métrica de acessos será conectada às visões de observabilidade.</div></article>
        <article className="panel pulse-panel">
          <div className="panel-heading"><div><span className="section-kicker">Hoje</span><h2>Pulso da plataforma</h2></div><Status tone="green">Atualizado</Status></div>
          <div className="pulse-number"><span className="live-dot" /><strong>{number(summary?.votesToday)}</strong><span>votos registrados hoje</span></div>
          <div className="pulse-stats"><div><span>Total de usuários</span><strong>{number(summary?.totalUsers)}</strong></div><div><span>Enquetes abertas</span><strong>{number(summary?.activePolls)}</strong></div><div><span>Denúncias pendentes</span><strong>{number(summary?.pendingReports)}</strong></div></div>
        </article>
      </section>

      <section className="panel top-panel">
        <div className="panel-heading"><div><span className="section-kicker">Rankings · dados reais</span><h2>Top 10 da plataforma</h2></div><button className="text-button" onClick={exportRanking} disabled={!currentTop.rows.length}>Exportar relatório ↗</button></div>
        <div className="tabs" role="tablist">
          {(Object.keys(topTabs) as (keyof typeof topTabs)[]).map((key) => <button key={key} onClick={() => setTopTab(key)} className={topTab === key ? "active" : ""}>{topTabs[key].label}</button>)}
        </div>
        <div className="table-wrap"><table><thead><tr><th>#</th>{currentTop.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{currentTop.rows.length ? currentTop.rows.map((row, index) => <tr key={`${topTab}-${index}`}><td><span className={`rank rank-${index + 1}`}>{index + 1}</span></td>{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cellIndex === 0 ? <strong>{cell}</strong> : cellIndex === 2 && (String(cell).startsWith("+") || String(cell).startsWith("-")) ? <span className={`delta${String(cell).startsWith("-") ? " negative" : ""}`}>{String(cell).startsWith("+") ? "↗" : "↘"} {cell}</span> : cell}</td>)}</tr>) : <tr><td className="table-message" colSpan={4}>{loading ? "Carregando ranking..." : !rankings ? "Os rankings estarão disponíveis após a atualização do backend." : "Ainda não há dados suficientes para este ranking."}</td></tr>}</tbody></table></div>
        <div className="table-footer-button">Até 10 resultados, atualizados com os dados do dashboard</div>
      </section>
    </div>
  );
}

function ListToolbar({ placeholder, action, onAction, children, value, onSearch }: { placeholder: string; action?: string; onAction?: () => void; children?: React.ReactNode; value?: string; onSearch?: (value: string) => void }) {
  return <div className="list-toolbar"><label className="search-box"><span>⌕</span><input placeholder={placeholder} value={value} onChange={onSearch ? (event) => onSearch(event.target.value) : undefined} /></label><div className="toolbar-actions">{children}{action && onAction && <button className="primary-button" onClick={onAction}><span>＋</span>{action}</button>}</div></div>;
}

function EmptyModal({ title, onClose, onSave, fields = ["Título", "Descrição"] }: { title: string; onClose: () => void; onSave: () => void; fields?: string[] }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="section-kicker">Novo registro</span><h2>{title}</h2></div><button className="icon-button close" onClick={onClose} aria-label="Fechar">×</button></div><div className="modal-fields">{fields.map((field, index) => <label key={field}><span>{field}</span>{index === fields.length - 1 && fields.length < 4 ? <textarea placeholder={`Informe ${field.toLowerCase()}`} /> : <input placeholder={`Informe ${field.toLowerCase()}`} />}</label>)}</div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" onClick={onSave}>Salvar</button></div></section></div>;
}

function ManagementTable({ children }: { children: React.ReactNode }) {
  return <section className="panel management-panel"><div className="table-wrap">{children}</div><div className="pagination"><span>Mostrando 1–{Array.isArray(children) ? children.length : 6} de 24.451 resultados</span><div><button disabled>‹</button><button className="current">1</button><button>2</button><button>3</button><button>›</button></div></div></section>;
}

const moderationStageLabels: Record<ModerationTicket["stage"], string> = {
  request: "Solicitação",
  in_progress: "Atendimento",
  closed: "Encerramento",
};
const moderationPriorityLabels: Record<ModerationTicket["priority"], string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};
const violationLabels: Record<string, string> = {
  hate_speech: "Discurso de ódio",
  misinformation: "Desinformação",
  spam: "Spam",
  inappropriate: "Conteúdo impróprio",
  harassment: "Assédio",
  violence: "Violência",
  copyright: "Direitos autorais",
  impersonation: "Falsa identidade",
};

function CreateReportModal({ onClose, onSave }: { onClose: () => void; onSave: (values: { contentType: string; contentId: string; violationType: string; priority: string; description: string }) => Promise<void> }) {
  const [contentType, setContentType] = useState("post");
  const [contentId, setContentId] = useState("");
  const [violationType, setViolationType] = useState("misinformation");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ contentType, contentId, violationType, priority, description });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível criar a denúncia.");
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label="Nova denúncia" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Novo chamado</span><h2>Criar denúncia</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><div className="modal-fields"><label><span>Tipo de conteúdo</span><select value={contentType} onChange={(event) => setContentType(event.target.value)} disabled={saving}><option value="post">Post</option><option value="comment">Comentário</option><option value="news">Notícia</option><option value="news_comment">Comentário de notícia</option><option value="user">Usuário</option></select></label><label><span>ID do conteúdo</span><input value={contentId} onChange={(event) => setContentId(event.target.value)} placeholder="UUID" required disabled={saving} /></label><label><span>Violação</span><select value={violationType} onChange={(event) => setViolationType(event.target.value)} disabled={saving}>{Object.entries(violationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Prioridade</span><select value={priority} onChange={(event) => setPriority(event.target.value)} disabled={saving}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label><label><span>Descrição</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} disabled={saving} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Criando..." : "Criar chamado"}</button></div></form></div>;
}

function ModerationWorkflowModal({ ticket, onClose, onSave }: { ticket: ModerationTicket; onClose: () => void; onSave: (values: { priority: string; stage: string; outcome?: string; resolution?: string }) => Promise<void> }) {
  const [priority, setPriority] = useState(ticket.priority);
  const [stage, setStage] = useState(ticket.stage);
  const [outcome, setOutcome] = useState(ticket.status === "dismissed" ? "dismissed" : "actioned");
  const [resolution, setResolution] = useState(ticket.resolution ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (stage === "closed" && !resolution.trim()) {
      setError("Informe a resolução para encerrar o chamado.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ priority, stage, outcome: stage === "closed" ? outcome : undefined, resolution: stage === "closed" ? resolution : undefined });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível atualizar o chamado.");
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label={`Chamado ${ticket.id}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Chamado {ticket.id.slice(0, 8)}</span><h2>Fluxo de moderação</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><div className="ticket-context"><strong>{violationLabels[ticket.violationType] ?? ticket.violationType}</strong><span>{ticket.target}</span></div><div className="modal-fields"><label><span>Prioridade</span><select value={priority} onChange={(event) => setPriority(event.target.value as ModerationTicket["priority"])} disabled={saving}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label><label><span>Etapa</span><select value={stage} onChange={(event) => setStage(event.target.value as ModerationTicket["stage"])} disabled={saving}><option value="request">Solicitação</option><option value="in_progress">Atendimento</option><option value="closed">Encerramento</option></select></label>{stage === "closed" && <><label><span>Decisão</span><select value={outcome} onChange={(event) => setOutcome(event.target.value)} disabled={saving}><option value="actioned">Ação aplicada</option><option value="dismissed">Denúncia rejeitada</option></select></label><label><span>Resolução</span><textarea value={resolution} onChange={(event) => setResolution(event.target.value)} maxLength={2000} required disabled={saving} /></label></>}</div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : "Salvar fluxo"}</button></div></form></div>;
}

function Moderation({ notify, role }: { notify: (text: string) => void; role: string }) {
  const [response, setResponse] = useState<ModerationResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ModerationTicket | null>(null);
  const canManage = role !== "analyst";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (stage) params.set("stage", stage);
    if (priority) params.set("priority", priority);
    try {
      const request = await fetch(`/api/admin/moderation?${params}`, { cache: "no-store" });
      const payload = (await request.json().catch(() => ({}))) as ModerationResponse & { message?: string };
      if (!request.ok || !payload.data) throw new Error(payload.message ?? "Não foi possível carregar a moderação.");
      setResponse(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a moderação.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, priority, stage]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const requestAction = async (url: string, method: "PATCH" | "POST", body?: object) => {
    const request = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const payload = (await request.json().catch(() => ({}))) as { message?: string | string[] };
    if (!request.ok) throw new Error(Array.isArray(payload.message) ? payload.message[0] : payload.message ?? "Não foi possível concluir a ação.");
  };

  const createReport = async (values: { contentType: string; contentId: string; violationType: string; priority: string; description: string }) => {
    await requestAction("/api/admin/moderation", "POST", values);
    setCreating(false);
    notify("Chamado de moderação criado");
    await loadReports();
  };
  const assign = async (ticket: ModerationTicket) => {
    try {
      await requestAction(`/api/admin/moderation/${ticket.id}/assign`, "POST");
      notify("Chamado atribuído a você");
      await loadReports();
    } catch (assignError) {
      notify(assignError instanceof Error ? assignError.message : "Não foi possível assumir o chamado");
    }
  };
  const saveWorkflow = async (values: { priority: string; stage: string; outcome?: string; resolution?: string }) => {
    if (!editing) return;
    if (values.priority !== editing.priority) await requestAction(`/api/admin/moderation/${editing.id}`, "PATCH", { priority: values.priority });
    await requestAction(`/api/admin/moderation/${editing.id}/workflow`, "PATCH", { stage: values.stage, outcome: values.outcome, resolution: values.resolution });
    setEditing(null);
    notify("Fluxo de moderação atualizado");
    await loadReports();
  };

  const summary = response?.summary;
  const pagination = response?.pagination;
  const tickets = response?.data ?? [];
  const format = (value?: number) => value === undefined ? "—" : new Intl.NumberFormat("pt-BR").format(value);
  const timeAgo = (date: string) => new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(-Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60000)), "minute");

  return <div className="page-stack"><section className="summary-strip"><div><span>Em solicitação</span><strong>{format(summary?.request)}</strong><small>aguardando triagem</small></div><div><span>Em atendimento</span><strong>{format(summary?.inProgress)}</strong><small>atribuídas à equipe</small></div><div><span>Encerradas hoje</span><strong>{format(summary?.closedToday)}</strong><small>com decisão registrada</small></div><div><span>Prioridade alta</span><strong className="red-text">{format(summary?.highPriority)}</strong><small>alta ou crítica</small></div></section><div className="workflow"><div className="workflow-step active"><i>1</i><span><b>Solicitação</b><small>Triagem inicial</small></span></div><em /><div className="workflow-step"><i>2</i><span><b>Atendimento</b><small>Análise e atribuição</small></span></div><em /><div className="workflow-step"><i>3</i><span><b>Encerramento</b><small>Decisão e resolução</small></span></div></div><ListToolbar placeholder="Buscar denúncia, usuário ou conteúdo" value={search} onSearch={setSearch} action={canManage ? "Nova denúncia" : undefined} onAction={canManage ? () => setCreating(true) : undefined}><select value={stage} onChange={(event) => { setStage(event.target.value); setPage(1); }}><option value="">Todas as etapas</option><option value="request">Solicitação</option><option value="in_progress">Atendimento</option><option value="closed">Encerramento</option></select><select value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1); }}><option value="">Todas as prioridades</option><option value="critical">Crítica</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select></ListToolbar>{error && <div className="data-banner data-banner-error" role="alert"><span>{error}</span><button onClick={loadReports}>Tentar novamente</button></div>}<section className="panel management-panel"><div className="table-wrap"><table><thead><tr><th>Chamado</th><th>Motivo</th><th>Conteúdo denunciado</th><th>Abertura</th><th>Prioridade</th><th>Responsável</th><th>Etapa</th><th>Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="table-message">Carregando denúncias...</td></tr> : tickets.length === 0 ? <tr><td colSpan={8} className="table-message">Nenhuma denúncia encontrada.</td></tr> : tickets.map((ticket) => <tr key={ticket.id}><td><strong>DEN-{ticket.id.slice(0, 8).toUpperCase()}</strong></td><td>{violationLabels[ticket.violationType] ?? ticket.violationType}</td><td className="title-cell"><strong>{ticket.target}</strong><small className="table-subtitle">{ticket.contentType} · {ticket.contentId?.slice(0, 8)}</small></td><td>{timeAgo(ticket.createdAt)}</td><td><Status tone={ticket.priority === "critical" || ticket.priority === "high" ? "red" : ticket.priority === "medium" ? "orange" : "gray"}>{moderationPriorityLabels[ticket.priority]}</Status></td><td>{ticket.assignedAdmin?.name ?? <span className="muted">Não atribuído</span>}</td><td><Status>{moderationStageLabels[ticket.stage]}</Status></td><td><div className="row-actions">{canManage && ticket.stage !== "closed" && !ticket.assignedAdmin && <button onClick={() => void assign(ticket)}>Assumir</button>}<button onClick={() => setEditing(ticket)}>{canManage ? "Abrir" : "Visualizar"}</button></div></td></tr>)}</tbody></table></div><div className="pagination"><span>{pagination ? `${pagination.total} chamados · página ${pagination.page} de ${pagination.totalPages}` : "Carregando resultados"}</span><div><button disabled={!pagination || pagination.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button><button className="current" disabled>{pagination?.page ?? 1}</button><button disabled={!pagination || pagination.page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>›</button></div></div></section>{creating && <CreateReportModal onClose={() => setCreating(false)} onSave={createReport} />} {editing && canManage && <ModerationWorkflowModal ticket={editing} onClose={() => setEditing(null)} onSave={saveWorkflow} />} {editing && !canManage && <div className="modal-backdrop" role="presentation" onMouseDown={() => setEditing(null)}><section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="section-kicker">Somente leitura</span><h2>Chamado {editing.id.slice(0, 8)}</h2></div><button className="icon-button close" onClick={() => setEditing(null)}>×</button></div><div className="ticket-context"><strong>{violationLabels[editing.violationType]}</strong><span>{editing.target}</span><p>{editing.description || "Sem descrição adicional."}</p></div></section></div>}</div>;
}

const userStatusLabels: Record<ManagedUser["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Pendente",
  blocked: "Bloqueado",
};

function EditUserModal({ user, onClose, onSave }: { user: ManagedUser; onClose: () => void; onSave: (values: { name: string; nickname: string | null; locationCity: string | null; locationState: string | null }) => Promise<void> }) {
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname ?? "");
  const [city, setCity] = useState(user.locationCity ?? "");
  const [state, setState] = useState(user.locationState ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ name, nickname: nickname || null, locationCity: city || null, locationState: state || null });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o usuário.");
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label={`Editar ${user.name}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Gestão de usuário</span><h2>Editar perfil</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><div className="modal-fields"><label><span>Nome</span><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required disabled={saving} /></label><label><span>Nickname</span><input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="usuario" disabled={saving} /></label><label><span>Cidade</span><input value={city} onChange={(event) => setCity(event.target.value)} disabled={saving} /></label><label><span>Estado</span><input value={state} onChange={(event) => setState(event.target.value)} maxLength={2} placeholder="SP" disabled={saving} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</button></div></form></div>;
}

function ConfirmUserActionModal({ user, action, onClose, onConfirm }: { user: ManagedUser; action: "anonymize" | "delete"; onClose: () => void; onConfirm: () => Promise<void> }) {
  const requiredText = action === "anonymize" ? "ANONIMIZAR" : "EXCLUIR";
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (confirmation !== requiredText) return;
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível concluir a ação.");
      setSubmitting(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal danger-modal" role="alertdialog" aria-modal="true" aria-label={`${requiredText} ${user.name}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Ação permanente</span><h2>{action === "anonymize" ? "Anonimizar usuário" : "Excluir usuário"}</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><p className="modal-warning">{action === "anonymize" ? "Os dados pessoais serão substituídos e o acesso será desativado. O conteúdo será preservado sem identificação." : "A conta será removida permanentemente. Relações protegidas pelo banco podem impedir a exclusão."}</p><div className="modal-fields"><label><span>Digite {requiredText} para confirmar</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} autoComplete="off" disabled={submitting} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button><button type="submit" className="danger-button" disabled={confirmation !== requiredText || submitting}>{submitting ? "Processando..." : requiredText}</button></div></form></div>;
}

function Users({ notify, role }: { notify: (text: string) => void; role: string }) {
  const [response, setResponse] = useState<ManagedUsersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [confirming, setConfirming] = useState<{ user: ManagedUser; action: "anonymize" | "delete" } | null>(null);
  const canEdit = role === "super_admin" || role === "admin";
  const canModerate = canEdit || role === "moderator";
  const isSuperAdmin = role === "super_admin";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    try {
      const request = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      const payload = (await request.json().catch(() => ({}))) as ManagedUsersResponse & { message?: string };
      if (!request.ok || !payload.data) throw new Error(payload.message ?? "Não foi possível carregar os usuários.");
      setResponse(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, status]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const requestAction = async (url: string, method: "PATCH" | "POST" | "DELETE", body?: object) => {
    const request = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const payload = (await request.json().catch(() => ({}))) as { message?: string };
    if (!request.ok) throw new Error(Array.isArray(payload.message) ? payload.message[0] : payload.message ?? "Não foi possível concluir a ação.");
  };

  const saveUser = async (values: { name: string; nickname: string | null; locationCity: string | null; locationState: string | null }) => {
    if (!editing) return;
    await requestAction(`/api/admin/users/${editing.id}`, "PATCH", values);
    setEditing(null);
    notify("Dados do usuário atualizados");
    await loadUsers();
  };

  const toggleStatus = async (user: ManagedUser) => {
    const nextStatus = user.status === "blocked" ? "active" : "blocked";
    try {
      await requestAction(`/api/admin/users/${user.id}/status`, "PATCH", { status: nextStatus });
      notify(nextStatus === "blocked" ? "Usuário bloqueado" : "Usuário desbloqueado");
      await loadUsers();
    } catch (statusError) {
      notify(statusError instanceof Error ? statusError.message : "Não foi possível alterar o status");
    }
  };

  const confirmAction = async () => {
    if (!confirming) return;
    const { user, action } = confirming;
    await requestAction(`/api/admin/users/${user.id}${action === "anonymize" ? "/anonymize" : ""}`, action === "anonymize" ? "POST" : "DELETE");
    setConfirming(null);
    notify(action === "anonymize" ? "Usuário anonimizado" : "Usuário excluído");
    await loadUsers();
  };

  const format = (value?: number) => value === undefined ? "—" : new Intl.NumberFormat("pt-BR").format(value);
  const summary = response?.summary;
  const users = response?.data ?? [];
  const pagination = response?.pagination;

  return <div className="page-stack"><section className="summary-strip"><div><span>Total de usuários</span><strong>{format(summary?.total)}</strong><small>base cadastrada</small></div><div><span>Ativos</span><strong>{format(summary?.active)}</strong><small>acesso liberado</small></div><div><span>Validados</span><strong>{format(summary?.validated)}</strong><small>documento ou nível 2+</small></div><div><span>Bloqueados</span><strong>{format(summary?.blocked)}</strong><small>sem acesso à plataforma</small></div></section><ListToolbar placeholder="Buscar por nome, e-mail, @ ou cidade" value={search} onSearch={setSearch}><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Todos os status</option><option value="active">Ativo</option><option value="pending">Pendente</option><option value="inactive">Inativo</option><option value="blocked">Bloqueado</option></select></ListToolbar>{error && <div className="data-banner data-banner-error" role="alert"><span>{error}</span><button onClick={loadUsers}>Tentar novamente</button></div>}<section className="panel management-panel"><div className="table-wrap"><table><thead><tr><th>Usuário</th><th>Localização</th><th>Validação</th><th>Votos</th><th>Cadastro</th><th>Status</th><th>Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="table-message">Carregando usuários...</td></tr> : users.length === 0 ? <tr><td colSpan={7} className="table-message">Nenhum usuário encontrado.</td></tr> : users.map((user) => <tr key={user.id}><td><div className="user-cell"><span className="avatar tiny">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.nickname ? `@${user.nickname}` : user.email}</small></span></div></td><td>{[user.locationCity, user.locationState].filter(Boolean).join(", ") || <span className="muted">Não informada</span>}</td><td>{user.documentVerified || user.verificationLevel >= 2 ? <span className="verified">✓ Validado</span> : <span className="muted">Nível {user.verificationLevel}</span>}</td><td><strong>{format(user.totalVotes)}</strong></td><td>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</td><td><Status>{userStatusLabels[user.status]}</Status></td><td><div className="row-actions">{canEdit && <button onClick={() => setEditing(user)}>Editar</button>}{canModerate && <button className={user.status === "blocked" ? "success-action" : "danger-action"} onClick={() => void toggleStatus(user)}>{user.status === "blocked" ? "Desbloquear" : "Bloquear"}</button>}{isSuperAdmin && <button onClick={() => setConfirming({ user, action: "anonymize" })}>Anonimizar</button>}{isSuperAdmin && <button className="danger-action" onClick={() => setConfirming({ user, action: "delete" })}>Excluir</button>}{!canModerate && !isSuperAdmin && <span className="muted">Somente leitura</span>}</div></td></tr>)}</tbody></table></div><div className="pagination"><span>{pagination ? `${pagination.total} usuários · página ${pagination.page} de ${pagination.totalPages}` : "Carregando resultados"}</span><div><button disabled={!pagination || pagination.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button><button className="current" disabled>{pagination?.page ?? 1}</button><button disabled={!pagination || pagination.page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>›</button></div></div></section>{editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onSave={saveUser} />} {confirming && <ConfirmUserActionModal user={confirming.user} action={confirming.action} onClose={() => setConfirming(null)} onConfirm={confirmAction} />}</div>;
}

const postTypeLabels: Record<ManagedPost["type"], string> = {
  proposta: "Proposta",
  discussao: "Discussão",
  votacao: "Votação",
};

const postScopeLabels: Record<ManagedPost["scope"], string> = {
  internacional: "Internacional",
  nacional: "Nacional",
  regional: "Regional",
};

type PostFormValues = {
  title: string;
  content: string;
  type: ManagedPost["type"];
  categoryId: string | null;
  scope: ManagedPost["scope"];
  status: ManagedPost["status"];
  imageUrl: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
};

function PostEditorModal({ post, categories, onClose, onSave }: { post: ManagedPost | null; categories: ManagedPostsResponse["categories"]; onClose: () => void; onSave: (values: PostFormValues) => Promise<void> }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [type, setType] = useState<ManagedPost["type"]>(post?.type ?? "discussao");
  const [categoryId, setCategoryId] = useState(post?.category?.id ?? "");
  const [scope, setScope] = useState<ManagedPost["scope"]>(post?.scope ?? "nacional");
  const [status, setStatus] = useState<ManagedPost["status"]>(post?.status ?? "ativo");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? "");
  const [city, setCity] = useState(post?.locationCity ?? "");
  const [state, setState] = useState(post?.locationState ?? "");
  const [country, setCountry] = useState(post?.locationCountry ?? "Brasil");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (scope === "regional" && (!city.trim() || !state.trim())) {
      setError("Informe cidade e estado para um post regional.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ title, content, type, categoryId: categoryId || null, scope, status, imageUrl: imageUrl || null, locationCity: city || null, locationState: state || null, locationCountry: country || null });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o post.");
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal post-modal" role="dialog" aria-modal="true" aria-label={post ? `Editar ${post.title}` : "Criar post"} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Gestão de conteúdo</span><h2>{post ? "Editar post" : "Criar novo post"}</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><div className="modal-fields"><label><span>Título</span><input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={255} required disabled={saving} /></label><label><span>Conteúdo</span><textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={3} maxLength={10000} required disabled={saving} /></label><div className="modal-field-row"><label><span>Tipo</span><select value={type} onChange={(event) => setType(event.target.value as ManagedPost["type"])} disabled={saving}><option value="discussao">Discussão</option><option value="proposta">Proposta</option><option value="votacao">Votação</option></select></label><label><span>Categoria</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={saving}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><div className="modal-field-row"><label><span>Escopo</span><select value={scope} onChange={(event) => setScope(event.target.value as ManagedPost["scope"])} disabled={saving}><option value="nacional">Nacional</option><option value="regional">Regional</option><option value="internacional">Internacional</option></select></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as ManagedPost["status"])} disabled={saving}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label></div>{scope === "regional" && <div className="modal-field-row regional-fields"><label><span>Cidade</span><input value={city} onChange={(event) => setCity(event.target.value)} required disabled={saving} /></label><label><span>Estado</span><input value={state} onChange={(event) => setState(event.target.value.toUpperCase())} maxLength={2} placeholder="SP" required disabled={saving} /></label><label><span>País</span><input value={country} onChange={(event) => setCountry(event.target.value)} disabled={saving} /></label></div>}<label><span>URL da imagem <small>(opcional)</small></span><input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." disabled={saving} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : post ? "Salvar alterações" : "Criar post"}</button></div></form></div>;
}

function ConfirmPostDeleteModal({ post, onClose, onConfirm }: { post: ManagedPost; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (confirmation !== "EXCLUIR") return;
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o post.");
      setSubmitting(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label={`Excluir ${post.title}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Ação permanente</span><h2>Excluir post</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><p className="modal-warning">O post “{post.title}” e seus vínculos serão removidos permanentemente. Para confirmar, digite <strong>EXCLUIR</strong>.</p><div className="modal-fields"><label><span>Confirmação</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} autoFocus disabled={submitting} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button><button type="submit" className="danger-button" disabled={confirmation !== "EXCLUIR" || submitting}>{submitting ? "Excluindo..." : "Excluir permanentemente"}</button></div></form></div>;
}

function Posts({ notify, role }: { notify: (text: string) => void; role: string }) {
  const [response, setResponse] = useState<ManagedPostsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<{ post: ManagedPost | null } | null>(null);
  const [deleting, setDeleting] = useState<ManagedPost | null>(null);
  const canEdit = role === "super_admin" || role === "admin";
  const canModerate = canEdit || role === "moderator";
  const isSuperAdmin = role === "super_admin";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    try {
      const request = await fetch(`/api/admin/posts?${params}`, { cache: "no-store" });
      const payload = (await request.json().catch(() => ({}))) as ManagedPostsResponse & { message?: string | string[] };
      if (!request.ok || !payload.data) {
        const message = Array.isArray(payload.message) ? payload.message[0] : payload.message;
        throw new Error(message ?? "Não foi possível carregar os posts.");
      }
      setResponse(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os posts.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, status, type]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const requestAction = async (url: string, method: "POST" | "PATCH" | "DELETE", body?: object) => {
    const request = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const payload = (await request.json().catch(() => ({}))) as { message?: string | string[] };
    if (!request.ok) throw new Error(Array.isArray(payload.message) ? payload.message[0] : payload.message ?? "Não foi possível concluir a ação.");
  };

  const savePost = async (values: PostFormValues) => {
    const current = editor?.post;
    await requestAction(current ? `/api/admin/posts/${current.id}` : "/api/admin/posts", current ? "PATCH" : "POST", values);
    setEditor(null);
    notify(current ? "Post atualizado" : "Post criado");
    await loadPosts();
  };

  const toggleStatus = async (post: ManagedPost) => {
    const nextStatus = post.status === "ativo" ? "inativo" : "ativo";
    try {
      await requestAction(`/api/admin/posts/${post.id}/status`, "PATCH", { status: nextStatus });
      notify(nextStatus === "ativo" ? "Post ativado" : "Post inativado");
      await loadPosts();
    } catch (statusError) {
      notify(statusError instanceof Error ? statusError.message : "Não foi possível alterar o status");
    }
  };

  const deletePost = async () => {
    if (!deleting) return;
    await requestAction(`/api/admin/posts/${deleting.id}`, "DELETE");
    setDeleting(null);
    notify("Post excluído permanentemente");
    await loadPosts();
  };

  const summary = response?.summary;
  const posts = response?.data ?? [];
  const pagination = response?.pagination;
  const format = (value?: number) => value === undefined ? "—" : new Intl.NumberFormat("pt-BR").format(value);

  return <div className="page-stack"><section className="summary-strip"><div><span>Total de posts</span><strong>{format(summary?.total)}</strong><small>sem incluir enquetes</small></div><div><span>Ativos</span><strong>{format(summary?.active)}</strong><small>visíveis na plataforma</small></div><div><span>Inativos</span><strong>{format(summary?.inactive)}</strong><small>conteúdo preservado</small></div><div><span>Publicados hoje</span><strong>{format(summary?.publishedToday)}</strong><small>desde 00:00</small></div></section><ListToolbar placeholder="Buscar post, autor ou ID" value={search} onSearch={setSearch} action={canEdit ? "Criar post" : undefined} onAction={canEdit ? () => setEditor({ post: null }) : undefined}><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Todos os status</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select><select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}><option value="">Todos os tipos</option><option value="discussao">Discussão</option><option value="proposta">Proposta</option><option value="votacao">Votação</option></select></ListToolbar>{error && <div className="data-banner data-banner-error" role="alert"><span>{error}</span><button onClick={loadPosts}>Tentar novamente</button></div>}<section className="panel management-panel"><div className="table-wrap"><table><thead><tr><th>Post</th><th>Autor</th><th>Categoria</th><th>Tipo / escopo</th><th>Engajamento</th><th>Cadastro</th><th>Status</th><th>Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="table-message">Carregando posts...</td></tr> : posts.length === 0 ? <tr><td colSpan={8} className="table-message">Nenhum post encontrado.</td></tr> : posts.map((post) => <tr key={post.id}><td className="title-cell"><strong>{post.title}</strong><small className="table-subtitle">P-{post.id.slice(0, 8).toUpperCase()}</small></td><td>{post.author ? <div className="user-cell"><span className="avatar tiny">{initials(post.author.name)}</span><span><strong>{post.author.name}</strong><small>{post.author.nickname ? `@${post.author.nickname}` : "Usuário do app"}</small></span></div> : <span className="verified">Equipe Kratikos</span>}</td><td>{post.category?.name ?? <span className="muted">Sem categoria</span>}</td><td><strong>{postTypeLabels[post.type]}</strong><small className="table-subtitle">{postScopeLabels[post.scope]}{post.scope === "regional" && post.locationState ? ` · ${post.locationState}` : ""}</small></td><td><strong>{format(post.engagement)}</strong><small className="table-subtitle">{format(post.likesCount)} curtidas · {format(post.commentsCount)} comentários</small></td><td>{new Date(post.createdAt).toLocaleDateString("pt-BR")}</td><td><Status tone={post.status === "ativo" ? "green" : "gray"}>{post.status === "ativo" ? "Ativo" : "Inativo"}</Status></td><td><div className="row-actions">{canEdit && <button onClick={() => setEditor({ post })}>Editar</button>}{canModerate && <button className={post.status === "ativo" ? "danger-action" : "success-action"} onClick={() => void toggleStatus(post)}>{post.status === "ativo" ? "Inativar" : "Ativar"}</button>}{isSuperAdmin && <button className="danger-action" onClick={() => setDeleting(post)}>Excluir</button>}{!canModerate && <span className="muted">Somente leitura</span>}</div></td></tr>)}</tbody></table></div><div className="pagination"><span>{pagination ? `${pagination.total} posts · página ${pagination.page} de ${pagination.totalPages}` : "Carregando resultados"}</span><div><button disabled={!pagination || pagination.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button><button className="current" disabled>{pagination?.page ?? 1}</button><button disabled={!pagination || pagination.page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>›</button></div></div></section>{editor && <PostEditorModal post={editor.post} categories={response?.categories ?? []} onClose={() => setEditor(null)} onSave={savePost} />} {deleting && <ConfirmPostDeleteModal post={deleting} onClose={() => setDeleting(null)} onConfirm={deletePost} />}</div>;
}

const pollStatusLabels: Record<ManagedPoll["status"], string> = {
  aberta: "Ativa",
  fechada: "Encerrada",
  cancelada: "Cancelada",
};

type PollFormValues = {
  question: string;
  description: string | null;
  categoryId: string;
  options?: string[];
  pollKind?: ManagedPoll["pollKind"];
  positiveOptionIndex?: number;
  minOptions: number;
  maxOptions: number;
  endDate: string | null;
  status: ManagedPoll["status"];
  scope: ManagedPoll["scope"];
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
};

function PollEditorModal({ poll, categories, onClose, onSave }: { poll: ManagedPoll | null; categories: ManagedPollsResponse["categories"]; onClose: () => void; onSave: (values: PollFormValues) => Promise<void> }) {
  const canEditOptions = !poll || poll.totalVotes === 0;
  const initialPositive = poll?.options.findIndex((option) => option.semanticRole === "positive") ?? 0;
  const localDate = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [question, setQuestion] = useState(poll?.question ?? "");
  const [description, setDescription] = useState(poll?.description ?? "");
  const [categoryId, setCategoryId] = useState(poll?.category?.id ?? "");
  const [options, setOptions] = useState(poll?.options.map((option) => option.content) ?? ["", ""]);
  const [pollKind, setPollKind] = useState<ManagedPoll["pollKind"]>(poll?.pollKind ?? "multiple");
  const [positiveOptionIndex, setPositiveOptionIndex] = useState(Math.max(0, initialPositive));
  const [minOptions, setMinOptions] = useState(poll?.minOptions ?? 1);
  const [maxOptions, setMaxOptions] = useState(poll?.maxOptions ?? 1);
  const [endDate, setEndDate] = useState(localDate(poll?.endDate ?? null));
  const [status, setStatus] = useState<ManagedPoll["status"]>(poll?.status ?? "aberta");
  const [scope, setScope] = useState<ManagedPoll["scope"]>(poll?.scope ?? "nacional");
  const [city, setCity] = useState(poll?.locationCity ?? "");
  const [state, setState] = useState(poll?.locationState ?? "");
  const [country, setCountry] = useState(poll?.locationCountry ?? "Brasil");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const changeKind = (nextKind: ManagedPoll["pollKind"]) => {
    setPollKind(nextKind);
    if (nextKind === "binary") {
      setOptions((current) => [current[0] ?? "Sim", current[1] ?? "Não"]);
      setPositiveOptionIndex(0);
      setMinOptions(1);
      setMaxOptions(1);
    }
  };
  const updateOption = (index: number, value: string) => setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? value : option));
  const removeOption = (index: number) => setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedOptions = options.map((option) => option.trim());
    if (canEditOptions && (normalizedOptions.some((option) => !option) || new Set(normalizedOptions.map((option) => option.toLowerCase())).size !== normalizedOptions.length)) {
      setError("Preencha opções diferentes entre si.");
      return;
    }
    if (scope === "regional" && (!city.trim() || !state.trim())) {
      setError("Informe cidade e estado para uma enquete regional.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ question, description: description || null, categoryId, ...(canEditOptions ? { options: normalizedOptions, pollKind, positiveOptionIndex: pollKind === "binary" ? positiveOptionIndex : undefined } : {}), minOptions, maxOptions, endDate: endDate ? new Date(endDate).toISOString() : null, status, scope, locationCity: city || null, locationState: state || null, locationCountry: country || null });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a enquete.");
      setSaving(false);
    }
  };

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal post-modal" role="dialog" aria-modal="true" aria-label={poll ? `Editar ${poll.question}` : "Criar enquete"} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Gestão de participação</span><h2>{poll ? "Editar enquete" : "Criar nova enquete"}</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><div className="modal-fields"><label><span>Pergunta</span><input value={question} onChange={(event) => setQuestion(event.target.value)} minLength={5} maxLength={500} required disabled={saving} /></label><label><span>Descrição <small>(opcional)</small></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} disabled={saving} /></label><div className="modal-field-row"><label><span>Categoria</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required disabled={saving}><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label><span>Formato</span><select value={pollKind} onChange={(event) => changeKind(event.target.value as ManagedPoll["pollKind"])} disabled={saving || !canEditOptions}><option value="multiple">Múltiplas opções</option><option value="binary">Binária</option></select></label></div><fieldset className="poll-options" disabled={saving || !canEditOptions}><legend>Opções de resposta</legend>{!canEditOptions && <p>As opções ficam bloqueadas após o primeiro voto.</p>}{options.map((option, index) => <div className="poll-option-row" key={index}><span>{index + 1}</span><input value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Opção ${index + 1}`} required={canEditOptions} />{pollKind === "binary" && <label className="positive-option"><input type="radio" name="positive-option" checked={positiveOptionIndex === index} onChange={() => setPositiveOptionIndex(index)} /><span>Positiva</span></label>}{pollKind === "multiple" && options.length > 2 && <button type="button" onClick={() => removeOption(index)} aria-label={`Remover opção ${index + 1}`}>×</button>}</div>)}{pollKind === "multiple" && options.length < 6 && canEditOptions && <button type="button" className="add-option-button" onClick={() => setOptions((current) => [...current, ""])}>＋ Adicionar opção</button>}</fieldset><div className="modal-field-row"><label><span>Mínimo por voto</span><input type="number" min={1} max={options.length} value={minOptions} onChange={(event) => setMinOptions(Number(event.target.value))} disabled={saving || pollKind === "binary"} /></label><label><span>Máximo por voto</span><input type="number" min={minOptions} max={options.length} value={maxOptions} onChange={(event) => setMaxOptions(Number(event.target.value))} disabled={saving || pollKind === "binary"} /></label></div><div className="modal-field-row"><label><span>Encerramento <small>(opcional)</small></span><input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} disabled={saving} /></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as ManagedPoll["status"])} disabled={saving}><option value="aberta">Ativa</option><option value="fechada">Encerrada</option><option value="cancelada">Cancelada</option></select></label></div><div className="modal-field-row"><label><span>Escopo</span><select value={scope} onChange={(event) => setScope(event.target.value as ManagedPoll["scope"])} disabled={saving}><option value="nacional">Nacional</option><option value="regional">Regional</option><option value="internacional">Internacional</option></select></label><label><span>País</span><input value={country} onChange={(event) => setCountry(event.target.value)} disabled={saving} /></label></div>{scope === "regional" && <div className="modal-field-row"><label><span>Cidade</span><input value={city} onChange={(event) => setCity(event.target.value)} required disabled={saving} /></label><label><span>Estado</span><input value={state} onChange={(event) => setState(event.target.value.toUpperCase())} maxLength={2} placeholder="SP" required disabled={saving} /></label></div>}</div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : poll ? "Salvar alterações" : "Criar enquete"}</button></div></form></div>;
}

function ConfirmPollDeleteModal({ poll, onClose, onConfirm }: { poll: ManagedPoll; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (confirmation !== "EXCLUIR") return;
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir a enquete.");
      setSubmitting(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label={`Excluir ${poll.question}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Ação permanente</span><h2>Excluir enquete</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><p className="modal-warning">A enquete “{poll.question}”, seus votos e o post associado serão removidos permanentemente. Digite <strong>EXCLUIR</strong> para confirmar.</p><div className="modal-fields"><label><span>Confirmação</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} autoFocus disabled={submitting} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button><button type="submit" className="danger-button" disabled={confirmation !== "EXCLUIR" || submitting}>{submitting ? "Excluindo..." : "Excluir permanentemente"}</button></div></form></div>;
}

function Polls({ notify, role }: { notify: (text: string) => void; role: string }) {
  const [response, setResponse] = useState<ManagedPollsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pollKind, setPollKind] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<{ poll: ManagedPoll | null } | null>(null);
  const [deleting, setDeleting] = useState<ManagedPoll | null>(null);
  const canEdit = role === "super_admin" || role === "admin";
  const canModerate = canEdit || role === "moderator";
  const isSuperAdmin = role === "super_admin";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPolls = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    if (pollKind) params.set("pollKind", pollKind);
    try {
      const request = await fetch(`/api/admin/polls?${params}`, { cache: "no-store" });
      const payload = (await request.json().catch(() => ({}))) as ManagedPollsResponse & { message?: string | string[] };
      if (!request.ok || !payload.data) throw new Error(Array.isArray(payload.message) ? payload.message[0] : payload.message ?? "Não foi possível carregar as enquetes.");
      setResponse(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as enquetes.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pollKind, status]);

  useEffect(() => {
    void loadPolls();
  }, [loadPolls]);

  const requestAction = async (url: string, method: "POST" | "PATCH" | "DELETE", body?: object) => {
    const request = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const payload = (await request.json().catch(() => ({}))) as { message?: string | string[] };
    if (!request.ok) throw new Error(Array.isArray(payload.message) ? payload.message[0] : payload.message ?? "Não foi possível concluir a ação.");
  };

  const savePoll = async (values: PollFormValues) => {
    const current = editor?.poll;
    await requestAction(current ? `/api/admin/polls/${current.id}` : "/api/admin/polls", current ? "PATCH" : "POST", values);
    setEditor(null);
    notify(current ? "Enquete atualizada" : "Enquete criada");
    await loadPolls();
  };
  const toggleStatus = async (poll: ManagedPoll) => {
    const nextStatus = poll.status === "aberta" ? "fechada" : "aberta";
    try {
      await requestAction(`/api/admin/polls/${poll.id}/status`, "PATCH", { status: nextStatus });
      notify(nextStatus === "aberta" ? "Enquete ativada" : "Enquete encerrada");
      await loadPolls();
    } catch (statusError) {
      notify(statusError instanceof Error ? statusError.message : "Não foi possível alterar a enquete");
    }
  };
  const deletePoll = async () => {
    if (!deleting) return;
    await requestAction(`/api/admin/polls/${deleting.id}`, "DELETE");
    setDeleting(null);
    notify("Enquete excluída permanentemente");
    await loadPolls();
  };

  const summary = response?.summary;
  const polls = response?.data ?? [];
  const pagination = response?.pagination;
  const format = (value?: number) => value === undefined ? "—" : new Intl.NumberFormat("pt-BR").format(value);

  return <div className="page-stack"><section className="summary-strip"><div><span>Total de enquetes</span><strong>{format(summary?.total)}</strong><small>histórico completo</small></div><div><span>Ativas agora</span><strong>{format(summary?.active)}</strong><small>abertas para votação</small></div><div><span>Encerradas</span><strong>{format(summary?.closed)}</strong><small>fechadas ou expiradas</small></div><div><span>Criadas hoje</span><strong>{format(summary?.createdToday)}</strong><small>desde 00:00</small></div></section><ListToolbar placeholder="Buscar enquete, autor ou ID" value={search} onSearch={setSearch} action={canEdit ? "Criar enquete" : undefined} onAction={canEdit ? () => setEditor({ poll: null }) : undefined}><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Todos os status</option><option value="aberta">Ativa</option><option value="fechada">Encerrada</option><option value="cancelada">Cancelada</option></select><select value={pollKind} onChange={(event) => { setPollKind(event.target.value); setPage(1); }}><option value="">Todos os formatos</option><option value="multiple">Múltipla</option><option value="binary">Binária</option></select></ListToolbar>{error && <div className="data-banner data-banner-error" role="alert"><span>{error}</span><button onClick={loadPolls}>Tentar novamente</button></div>}<section className="panel management-panel"><div className="table-wrap"><table><thead><tr><th>Enquete</th><th>Autor</th><th>Categoria</th><th>Formato / escopo</th><th>Votos</th><th>Encerramento</th><th>Status</th><th>Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="table-message">Carregando enquetes...</td></tr> : polls.length === 0 ? <tr><td colSpan={8} className="table-message">Nenhuma enquete encontrada.</td></tr> : polls.map((poll) => <tr key={poll.id}><td className="title-cell"><strong>{poll.question}</strong><small className="table-subtitle">E-{poll.id.slice(0, 8).toUpperCase()} · {poll.options.length} opções</small></td><td>{poll.author ? <div className="user-cell"><span className="avatar tiny">{initials(poll.author.name)}</span><span><strong>{poll.author.name}</strong><small>{poll.author.nickname ? `@${poll.author.nickname}` : "Usuário do app"}</small></span></div> : <span className="verified">Equipe Kratikos</span>}</td><td>{poll.category?.name ?? <span className="muted">Sem categoria</span>}</td><td><strong>{poll.pollKind === "binary" ? "Binária" : "Múltipla"}</strong><small className="table-subtitle">{postScopeLabels[poll.scope]}{poll.scope === "regional" && poll.locationState ? ` · ${poll.locationState}` : ""}</small></td><td><strong>{format(poll.totalVotes)}</strong></td><td>{poll.endDate ? new Date(poll.endDate).toLocaleDateString("pt-BR") : <span className="muted">Sem prazo</span>}</td><td><Status tone={poll.status === "aberta" ? "green" : poll.status === "cancelada" ? "red" : "gray"}>{pollStatusLabels[poll.status]}</Status></td><td><div className="row-actions">{canEdit && <button onClick={() => setEditor({ poll })}>Editar</button>}{canModerate && <button className={poll.status === "aberta" ? "danger-action" : "success-action"} onClick={() => void toggleStatus(poll)}>{poll.status === "aberta" ? "Encerrar" : "Ativar"}</button>}{isSuperAdmin && <button className="danger-action" onClick={() => setDeleting(poll)}>Excluir</button>}{!canModerate && <span className="muted">Somente leitura</span>}</div></td></tr>)}</tbody></table></div><div className="pagination"><span>{pagination ? `${pagination.total} enquetes · página ${pagination.page} de ${pagination.totalPages}` : "Carregando resultados"}</span><div><button disabled={!pagination || pagination.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button><button className="current" disabled>{pagination?.page ?? 1}</button><button disabled={!pagination || pagination.page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>›</button></div></div></section>{editor && <PollEditorModal poll={editor.poll} categories={response?.categories ?? []} onClose={() => setEditor(null)} onSave={savePoll} />} {deleting && <ConfirmPollDeleteModal poll={deleting} onClose={() => setDeleting(null)} onConfirm={deletePoll} />}</div>;
}

function ContentManager({ kind, notify }: { kind: "posts" | "enquetes"; notify: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [postsData, setPostsData] = useState(initialPosts);
  const [pollData, setPollData] = useState(initialPolls);
  const isPosts = kind === "posts";
  const toggle = (id: string) => { if (isPosts) setPostsData((rows) => rows.map((row) => row.id === id ? { ...row, status: row.status === "Ativo" ? "Inativo" : "Ativo" } : row)); else setPollData((rows) => rows.map((row) => row.id === id ? { ...row, status: row.status === "Ativa" ? "Inativa" : "Ativa" } : row)); notify(`${isPosts ? "Post" : "Enquete"} atualizado com sucesso`); };
  return <div className="page-stack"><section className="summary-strip"><div><span>{isPosts ? "Total de posts" : "Total de enquetes"}</span><strong>{isPosts ? "28.451" : "3.842"}</strong><small>desde o lançamento</small></div><div><span>{isPosts ? "Publicados hoje" : "Ativas agora"}</span><strong>{isPosts ? "126" : "1.284"}</strong><small>+12% na semana</small></div><div><span>{isPosts ? "Inativos" : "Encerradas"}</span><strong>{isPosts ? "346" : "2.408"}</strong><small>conteúdo preservado</small></div><div><span>Em análise</span><strong>18</strong><small>fila de moderação</small></div></section><ListToolbar placeholder={`Buscar ${isPosts ? "post, autor ou ID" : "enquete, autor ou ID"}`} action={`Criar ${isPosts ? "post" : "enquete"}`} onAction={() => setOpen(true)}><select><option>Todos os status</option><option>Ativo</option><option>Inativo</option><option>Em análise</option></select></ListToolbar><ManagementTable><table><thead><tr><th>ID</th><th>{isPosts ? "Conteúdo" : "Pergunta"}</th><th>Autor</th>{isPosts && <th>Tipo</th>}<th>{isPosts ? "Engajamento" : "Votos"}</th>{!isPosts && <th>Encerramento</th>}<th>Status</th><th>Ações</th></tr></thead><tbody>{isPosts ? postsData.map((post) => <tr key={post.id}><td><strong>{post.id}</strong></td><td className="title-cell"><strong>{post.title}</strong></td><td>{post.author}</td><td>{post.kind}</td><td>{post.engagement}</td><td><Status>{post.status}</Status></td><td><div className="row-actions"><button onClick={() => notify(`Editor do ${post.id} aberto`)}>Editar</button><button onClick={() => toggle(post.id)}>{post.status === "Ativo" ? "Inativar" : "Ativar"}</button><button className="danger-action" onClick={() => notify("Confirmação de exclusão solicitada")}>Excluir</button></div></td></tr>) : pollData.map((poll) => <tr key={poll.id}><td><strong>{poll.id}</strong></td><td className="title-cell"><strong>{poll.title}</strong></td><td>{poll.author}</td><td>{poll.votes}</td><td>{poll.ends}</td><td><Status>{poll.status}</Status></td><td><div className="row-actions"><button onClick={() => notify(`Editor da ${poll.id} aberto`)}>Editar</button><button onClick={() => toggle(poll.id)}>{poll.status === "Ativa" ? "Inativar" : "Ativar"}</button><button className="danger-action" onClick={() => notify("Confirmação de exclusão solicitada")}>Excluir</button></div></td></tr>)}</tbody></table></ManagementTable>{open && <EmptyModal title={isPosts ? "Criar novo post" : "Criar nova enquete"} fields={isPosts ? ["Título", "Categoria", "Conteúdo"] : ["Pergunta", "Categoria", "Opções de resposta"]} onClose={() => setOpen(false)} onSave={() => { setOpen(false); notify(`${isPosts ? "Post" : "Enquete"} criado como rascunho`); }} />}</div>;
}

const administratorStatusLabels: Record<ManagedAdministrator["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

type AdministratorFormValues = {
  name: string;
  email: string;
  role: ManagedAdministrator["role"];
  status: ManagedAdministrator["status"];
  password?: string;
};

function AdministratorEditorModal({ administrator, onClose, onSave }: { administrator: ManagedAdministrator | null; onClose: () => void; onSave: (values: AdministratorFormValues) => Promise<void> }) {
  const [name, setName] = useState(administrator?.name ?? "");
  const [email, setEmail] = useState(administrator?.email ?? "");
  const [role, setRole] = useState<ManagedAdministrator["role"]>(administrator?.role ?? "admin");
  const [status, setStatus] = useState<ManagedAdministrator["status"]>(administrator?.status ?? "active");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ name, email, role, status, ...(!administrator ? { password } : {}) });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o administrador.");
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label={administrator ? `Editar ${administrator.name}` : "Novo administrador"} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Controle de acesso</span><h2>{administrator ? "Editar administrador" : "Novo administrador"}</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><div className="modal-fields"><label><span>Nome</span><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={120} required disabled={saving} /></label><label><span>E-mail</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={saving} /></label><div className="modal-field-row"><label><span>Função</span><select value={role} onChange={(event) => setRole(event.target.value as ManagedAdministrator["role"])} disabled={saving}><option value="super_admin">Super administrador</option><option value="admin">Administrador</option><option value="moderator">Moderador</option><option value="analyst">Analista</option></select></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as ManagedAdministrator["status"])} disabled={saving}><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="blocked">Bloqueado</option></select></label></div>{!administrator && <label><span>Senha temporária</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={128} autoComplete="new-password" required disabled={saving} /><small className="field-hint">Mínimo de 12 caracteres. A troca será solicitada no primeiro acesso.</small></label>}</div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : administrator ? "Salvar alterações" : "Criar acesso"}</button></div></form></div>;
}

function ResetAdministratorPasswordModal({ administrator, onClose, onConfirm }: { administrator: ManagedAdministrator; onClose: () => void; onConfirm: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onConfirm(password);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Não foi possível redefinir a senha.");
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label={`Redefinir senha de ${administrator.name}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Credencial temporária</span><h2>Redefinir senha</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><p className="modal-warning neutral-warning">{administrator.name} precisará trocar a senha temporária após o próximo acesso.</p><div className="modal-fields"><label><span>Nova senha temporária</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={128} autoComplete="new-password" required disabled={saving} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Redefinindo..." : "Redefinir senha"}</button></div></form></div>;
}

function ConfirmAdministratorDeleteModal({ administrator, onClose, onConfirm }: { administrator: ManagedAdministrator; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (confirmation !== "EXCLUIR") return;
    setSaving(true);
    setError("");
    try {
      await onConfirm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o acesso.");
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal" role="dialog" aria-modal="true" aria-label={`Excluir ${administrator.name}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-heading"><div><span className="section-kicker">Ação permanente</span><h2>Excluir administrador</h2></div><button className="icon-button close" type="button" onClick={onClose} aria-label="Fechar">×</button></div><p className="modal-warning">O acesso de {administrator.name} será removido permanentemente. Digite <strong>EXCLUIR</strong> para confirmar.</p><div className="modal-fields"><label><span>Confirmação</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} autoFocus disabled={saving} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="danger-button" disabled={confirmation !== "EXCLUIR" || saving}>{saving ? "Excluindo..." : "Excluir acesso"}</button></div></form></div>;
}

function Administrators({ notify, role, currentAdminId }: { notify: (text: string) => void; role: string; currentAdminId: string }) {
  const [response, setResponse] = useState<AdministratorsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<{ administrator: ManagedAdministrator | null } | null>(null);
  const [resetting, setResetting] = useState<ManagedAdministrator | null>(null);
  const [deleting, setDeleting] = useState<ManagedAdministrator | null>(null);
  const canManage = role === "super_admin";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadAdministrators = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (roleFilter) params.set("role", roleFilter);
    if (status) params.set("status", status);
    try {
      const request = await fetch(`/api/admin/administrators?${params}`, { cache: "no-store" });
      const payload = (await request.json().catch(() => ({}))) as AdministratorsResponse & { message?: string | string[] };
      if (!request.ok || !payload.data) throw new Error(Array.isArray(payload.message) ? payload.message[0] : payload.message ?? "Não foi possível carregar os administradores.");
      setResponse(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os administradores.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, roleFilter, status]);

  useEffect(() => {
    void loadAdministrators();
  }, [loadAdministrators]);

  const requestAction = async (url: string, method: "POST" | "PATCH" | "DELETE", body?: object) => {
    const request = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const payload = (await request.json().catch(() => ({}))) as { message?: string | string[] };
    if (!request.ok) throw new Error(Array.isArray(payload.message) ? payload.message[0] : payload.message ?? "Não foi possível concluir a ação.");
  };
  const saveAdministrator = async (values: AdministratorFormValues) => {
    const current = editor?.administrator;
    await requestAction(current ? `/api/admin/administrators/${current.id}` : "/api/admin/administrators", current ? "PATCH" : "POST", values);
    setEditor(null);
    notify(current ? "Administrador atualizado" : "Acesso administrativo criado");
    await loadAdministrators();
  };
  const toggleAdministrator = async (administrator: ManagedAdministrator) => {
    const nextStatus = administrator.status === "active" ? "inactive" : "active";
    try {
      await requestAction(`/api/admin/administrators/${administrator.id}`, "PATCH", { status: nextStatus });
      notify(nextStatus === "active" ? "Administrador ativado" : "Administrador inativado");
      await loadAdministrators();
    } catch (statusError) {
      notify(statusError instanceof Error ? statusError.message : "Não foi possível alterar o acesso");
    }
  };
  const resetPassword = async (password: string) => {
    if (!resetting) return;
    await requestAction(`/api/admin/administrators/${resetting.id}/reset-password`, "POST", { password });
    setResetting(null);
    notify("Senha temporária redefinida");
    await loadAdministrators();
  };
  const deleteAdministrator = async () => {
    if (!deleting) return;
    await requestAction(`/api/admin/administrators/${deleting.id}`, "DELETE");
    setDeleting(null);
    notify("Acesso administrativo excluído");
    await loadAdministrators();
  };

  const summary = response?.summary;
  const administrators = response?.data ?? [];
  const pagination = response?.pagination;
  const format = (value?: number) => value === undefined ? "—" : new Intl.NumberFormat("pt-BR").format(value);

  return <div className="page-stack"><section className="access-banner"><div className="access-icon">♙</div><div><span className="section-kicker">Acesso protegido</span><h2>Permissões por função</h2><p>Super administradores controlam acessos; administradores podem consultar a equipe. O último super administrador ativo é protegido automaticamente.</p></div></section><section className="summary-strip"><div><span>Total de administradores</span><strong>{format(summary?.total)}</strong><small>acessos cadastrados</small></div><div><span>Ativos</span><strong>{format(summary?.active)}</strong><small>sessão autorizada</small></div><div><span>Super administradores</span><strong>{format(summary?.superAdmins)}</strong><small>controle completo</small></div><div><span>Bloqueios temporários</span><strong>{format(summary?.locked)}</strong><small>tentativas inválidas</small></div></section><ListToolbar placeholder="Buscar administrador por nome ou e-mail" value={search} onSearch={setSearch} action={canManage ? "Novo administrador" : undefined} onAction={canManage ? () => setEditor({ administrator: null }) : undefined}><select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }}><option value="">Todas as funções</option><option value="super_admin">Super administrador</option><option value="admin">Administrador</option><option value="moderator">Moderador</option><option value="analyst">Analista</option></select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Todos os status</option><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="blocked">Bloqueado</option></select></ListToolbar>{error && <div className="data-banner data-banner-error" role="alert"><span>{error}</span><button onClick={loadAdministrators}>Tentar novamente</button></div>}<section className="panel management-panel"><div className="table-wrap"><table><thead><tr><th>Administrador</th><th>Função</th><th>Status</th><th>Segurança</th><th>Último acesso</th><th>Cadastro</th><th>Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="table-message">Carregando administradores...</td></tr> : administrators.length === 0 ? <tr><td colSpan={7} className="table-message">Nenhum administrador encontrado.</td></tr> : administrators.map((administrator) => <tr key={administrator.id}><td><div className="user-cell"><span className="avatar tiny">{initials(administrator.name)}</span><span><strong>{administrator.name}{administrator.id === currentAdminId ? " (você)" : ""}</strong><small>{administrator.email}</small></span></div></td><td><span className="role-pill">{adminRoleLabels[administrator.role]}</span></td><td><Status tone={administrator.status === "active" ? "green" : administrator.status === "blocked" ? "red" : "gray"}>{administratorStatusLabels[administrator.status]}</Status></td><td>{administrator.isLocked ? <Status tone="red">Bloqueado 15 min</Status> : administrator.mustChangePassword ? <Status tone="orange">Troca pendente</Status> : <span className="verified">✓ Regular</span>}</td><td>{administrator.lastLoginAt ? new Date(administrator.lastLoginAt).toLocaleString("pt-BR") : <span className="muted">Nunca acessou</span>}</td><td>{new Date(administrator.createdAt).toLocaleDateString("pt-BR")}</td><td><div className="row-actions">{canManage && <button onClick={() => setEditor({ administrator })}>Editar</button>}{canManage && <button onClick={() => setResetting(administrator)}>Redefinir senha</button>}{canManage && administrator.id !== currentAdminId && <button className={administrator.status === "active" ? "danger-action" : "success-action"} onClick={() => void toggleAdministrator(administrator)}>{administrator.status === "active" ? "Inativar" : "Ativar"}</button>}{canManage && administrator.id !== currentAdminId && <button className="danger-action" onClick={() => setDeleting(administrator)}>Excluir</button>}{!canManage && <span className="muted">Somente leitura</span>}</div></td></tr>)}</tbody></table></div><div className="pagination"><span>{pagination ? `${pagination.total} administradores · página ${pagination.page} de ${pagination.totalPages}` : "Carregando resultados"}</span><div><button disabled={!pagination || pagination.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button><button className="current" disabled>{pagination?.page ?? 1}</button><button disabled={!pagination || pagination.page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>›</button></div></div></section>{editor && <AdministratorEditorModal administrator={editor.administrator} onClose={() => setEditor(null)} onSave={saveAdministrator} />} {resetting && <ResetAdministratorPasswordModal administrator={resetting} onClose={() => setResetting(null)} onConfirm={resetPassword} />} {deleting && <ConfirmAdministratorDeleteModal administrator={deleting} onClose={() => setDeleting(null)} onConfirm={deleteAdministrator} />}</div>;
}

function LiveObservability() {
  const [data, setData] = useState<ObservabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      const request = await fetch("/api/admin/observability", { cache: "no-store" });
      const payload = (await request.json().catch(() => ({}))) as ObservabilityData & { message?: string };
      if (!request.ok || !payload.metrics) throw new Error(payload.message ?? "Não foi possível carregar a observabilidade.");
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a observabilidade.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const duration = (seconds?: number) => {
    if (seconds === undefined) return "—";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return days ? `${days}d ${hours}h` : `${hours}h ${Math.floor((seconds % 3600) / 60)}min`;
  };
  const metrics = data?.metrics;
  const volumes = data?.requestVolume.map((item) => item.requests) ?? [];
  const errors = data?.requestVolume.map((item) => item.errors) ?? [];
  const labels = data?.requestVolume.map((item) => new Date(item.hour).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })) ?? [];
  const healthTone: Tone = data?.status === "healthy" ? "green" : data?.status === "warning" ? "orange" : "red";

  return <div className="page-stack">{error && <div className="data-banner data-banner-error" role="alert"><span>{error}</span><button onClick={load}>Tentar novamente</button></div>}<section className={`health-hero health-${data?.status ?? "loading"}`}><div><span className="section-kicker">Status operacional</span><h2>{loading && !data ? "Coletando sinais da plataforma..." : data?.status === "healthy" ? "Todos os sistemas monitorados estão operando" : data?.status === "warning" ? "Há sinais que precisam de atenção" : "Há uma falha crítica em andamento"}</h2><p>{data ? `Atualizado em ${new Date(data.generatedAt).toLocaleTimeString("pt-BR")} · atualização automática a cada 30 segundos` : "Aguardando primeira leitura"}</p></div><div className="health-score"><span>Saúde geral</span><strong>{data?.healthScore ?? "—"}</strong><small>/ 100</small></div></section><section className="metrics-grid obs-metrics"><MetricCard label="Taxa de sucesso" value={metrics ? `${number.format(metrics.successRate)}%` : "—"} meta="respostas sem erro 5xx · 15 min" icon="✓" tone="green" /><MetricCard label="Latência p95" value={metrics ? `${number.format(metrics.latencyP95Ms)} ms` : "—"} meta="últimos 15 minutos" icon="↯" tone="blue" /><MetricCard label="Taxa de erros" value={metrics ? `${number.format(metrics.errorRate)}%` : "—"} meta="respostas 5xx · 15 min" icon="!" tone={metrics && metrics.errorRate >= 5 ? "red" : "orange"} /><MetricCard label="Requisições/min" value={metrics ? number.format(metrics.requestsPerMinute) : "—"} meta={`uptime ${duration(metrics?.uptimeSeconds)}`} icon="↕" tone="purple" /></section><section className="dashboard-grid dashboard-grid-secondary"><article className="panel panel-two"><div className="panel-heading"><div><span className="section-kicker">Instância atual · últimas 24 horas</span><h2>Volume de requisições</h2></div><Status tone={healthTone}>Tempo real</Status></div><div className="mini-total"><strong>{metrics ? number.format(metrics.requestsLast24Hours) : "—"}</strong><span>requisições observadas nesta instância</span></div>{volumes.length ? <BarChart values={volumes} comparison={errors} color="blue" labels dateLabels={labels} /> : <div className="chart-empty compact">Aguardando requisições após o deploy.</div>}</article><article className="panel services-panel"><div className="panel-heading"><div><span className="section-kicker">Infraestrutura</span><h2>Serviços monitorados</h2></div><button className="icon-button" onClick={load} aria-label="Atualizar observabilidade">↻</button></div>{data?.services.map((service) => <div className="service-row" key={service.name}><span className={`service-dot service-${service.status}`} /><div><strong>{service.name}</strong><small>{service.detail}</small></div><span>{service.metric}</span><Status tone={service.status === "healthy" ? "green" : service.status === "warning" ? "orange" : "red"}>{service.status === "healthy" ? "Normal" : service.status === "warning" ? "Atenção" : "Falha"}</Status></div>) ?? <div className="table-message">Carregando serviços...</div>}</article></section><section className="panel incident-panel"><div className="panel-heading"><div><span className="section-kicker">Sinais ativos</span><h2>Incidentes detectados</h2></div><Status tone={data?.incidents.length ? "orange" : "green"}>{data?.incidents.length ? `${data.incidents.length} ativo(s)` : "Nenhum incidente"}</Status></div><div className="timeline">{data?.incidents.length ? data.incidents.map((incident) => <div key={incident.title}><i className={incident.severity === "critical" ? "critical" : "monitoring"} /><span><strong>{incident.title}</strong><small>{incident.detail}</small></span><Status tone={incident.severity === "critical" ? "red" : "orange"}>{incident.severity === "critical" ? "Crítico" : "Atenção"}</Status></div>) : <div><i className="resolved" /><span><strong>Nenhum incidente ativo</strong><small>Banco, API e runtime estão dentro dos limites definidos.</small></span><Status tone="green">Normal</Status></div>}</div>{data?.scope && <p className="observability-scope">{data.scope}</p>}</section></div>;
}

function Login({
  onLogin,
}: {
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Informe seu e-mail e sua senha.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onLogin(email, password, remember);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível entrar no portal.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return <main className="login-page"><section className="login-brand"><img src="/brand/kratikos-horizontal.svg" alt="Kratikos" /><div className="login-brand-copy"><span className="brand-kicker">Portal administrativo</span><h1>Sua voz digital.</h1><p>Gerencie a comunidade, acompanhe o impacto da plataforma e tome decisões com contexto.</p></div></section><section className="login-card"><div className="mobile-logo"><img src="/brand/kratikos-horizontal.svg" alt="Kratikos" /></div><span className="section-kicker">Área restrita</span><h2>Acesse o portal</h2><p>Entre com suas credenciais de administrador.</p><form onSubmit={submit}><label><span>E-mail corporativo</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@kratikos.com.br" autoComplete="email" disabled={submitting} /></label><label><span>Senha</span><div className="password-input"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" autoComplete="current-password" disabled={submitting} /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>◉</button></div></label><div className="form-between"><label className="checkbox"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} disabled={submitting} /><span>Lembrar acesso</span></label><button type="button" className="link-button" onClick={() => setError("A recuperação de acesso será gerenciada pelo super administrador.")}>Esqueci minha senha</button></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="login-button" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? <><span className="button-spinner" />Validando acesso...</> : <>Entrar no portal <span>→</span></>}</button></form><div className="login-note"><span>✓</span><p><strong>Ambiente protegido</strong><br />Sua sessão fica armazenada em cookie seguro.</p></div></section></main>;
}

export function KratikosPortal() {
  const [authState, setAuthState] = useState<
    "checking" | "unauthenticated" | "authenticated"
  >("checking");
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const meta = viewMeta[view];
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2800); };
  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          admin?: AdminSession;
        };
        if (!active) return;
        if (response.ok && payload.admin) {
          setAdmin(payload.admin);
          setAuthState("authenticated");
        } else {
          setAdmin(null);
          setAuthState("unauthenticated");
        }
      })
      .catch(() => {
        if (active) setAuthState("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);
  const login = async (email: string, password: string, remember: boolean) => {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      admin?: AdminSession;
      message?: string;
    };
    if (!response.ok || !payload.admin) {
      throw new Error(payload.message ?? "E-mail ou senha inválidos.");
    }
    setAdmin(payload.admin);
    setAuthState("authenticated");
    notify(
      payload.admin.mustChangePassword
        ? "Acesso confirmado. Altere a senha inicial em Configurações."
        : "Acesso confirmado com segurança.",
    );
  };
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAdmin(null);
    setAuthState("unauthenticated");
    setView("dashboard");
  };
  const content = useMemo(() => {
    if (view === "dashboard") return <Dashboard />;
    if (view === "moderacao") return <Moderation notify={notify} role={admin?.role ?? "analyst"} />;
    if (view === "usuarios") return <Users notify={notify} role={admin?.role ?? "analyst"} />;
    if (view === "posts") return <Posts notify={notify} role={admin?.role ?? "analyst"} />;
    if (view === "enquetes") return <Polls notify={notify} role={admin?.role ?? "analyst"} />;
    if (view === "administradores") return <Administrators notify={notify} role={admin?.role ?? "analyst"} currentAdminId={admin?.id ?? ""} />;
    return <LiveObservability />;
  }, [view, admin?.id, admin?.role]);
  if (authState === "checking") return <main className="auth-loading-screen"><img src="/brand/kratikos-symbol.svg" alt="" /><span className="auth-loader" /><p>Validando acesso administrativo...</p></main>;
  if (authState === "unauthenticated" || !admin) return <Login onLogin={login} />;
  const roleLabel = adminRoleLabels[admin.role] ?? admin.role;
  const visibleNavItems = navItems.filter((item) => item.id !== "administradores" || admin.role === "super_admin" || admin.role === "admin");
  return <div className="portal-shell"><aside className={`sidebar ${sidebarOpen ? "open" : ""}`}><div className="sidebar-brand"><img src="/brand/kratikos-horizontal.svg" alt="Kratikos" /><span>admin</span></div><nav>{visibleNavItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setSidebarOpen(false); }}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.badge && <b>{item.badge}</b>}</button>)}</nav><div className="sidebar-bottom"><button onClick={() => notify("Configurações abertas em breve")}><span className="nav-icon">⚙</span><span>Configurações</span></button><div className="admin-card"><span className="avatar">{initials(admin.name)}</span><span><strong>{admin.name}</strong><small>{roleLabel}</small></span><button aria-label="Opções da conta">•••</button></div></div></aside>{sidebarOpen && <button className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}<main className="portal-main"><header className="topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">☰</button><div><span>{meta.eyebrow}</span><h1>{meta.title}</h1></div><div className="topbar-actions"><label className="global-search"><span>⌕</span><input placeholder="Buscar no portal" aria-label="Buscar no portal" /><kbd>⌘ K</kbd></label><button className="notification-button" aria-label="Notificações">♢<i>3</i></button><button className="date-button">17 ago 2026 <span>⌄</span></button><button className="logout-button" onClick={logout} aria-label="Sair">↗</button></div></header><div className="content">{content}</div></main>{toast && <div className="toast"><span>✓</span>{toast}</div>}</div>;
}
