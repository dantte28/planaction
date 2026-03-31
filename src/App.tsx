import { useState, useEffect, useMemo } from "react";
import { Job, Interview, UserProfile } from "./types";
import { fetchDailyJobs } from "./services/jobService";
import { analyzeJobMatch, generateMessage, getInsights } from "./services/geminiService";

const INITIAL_PROFILE: UserProfile = {
  name: "Thaís Pollarini",
  role: "Analista de Dados",
  skills: ["Power BI", "SQL", "Python", "Excel", "Power Automate"],
  experience: "EY, Stellantis, ACT Digital"
};

const TRANSLATIONS = {
  pt: {
    header_subtitle: "Plano de Ação — Thaís Pollarini",
    header_title: "🎯 Analista de Dados / Automação — BH · Contagem · Betim · Remoto",
    header_desc: "7 dias de ação imediata · Vagas reais mapeadas · Probabilidade por vaga",
    tab_jobs: "📋 Vagas",
    tab_plan: "📅 Plano",
    tab_companies: "🏢 Empresas",
    tab_dashboard: "📊 Dashboard",
    tab_interviews: "📅 Entrevistas",
    filter_search_placeholder: "Cargo, palavra-chave ou empresa",
    filter_location_placeholder: "Cidade ou remoto",
    filter_all: "Todos",
    filter_tech: "Tecnologia",
    filter_job_type: "Tipo de Vaga",
    filter_job_type_onsite: "Presencial",
    filter_job_type_remote: "Remoto",
    filter_job_type_hybrid: "Híbrido",
    filter_date: "Data de Postagem",
    filter_date_24h: "Últimas 24h",
    filter_date_3d: "Últimos 3 dias",
    filter_date_7d: "Última semana",
    filter_prob: "Prob. Mín",
    filter_area: "Área/Cargo",
    filter_area_data: "Análise de Dados",
    filter_area_bi: "Business Intelligence",
    filter_area_automation: "Automação",
    filter_area_consulting: "Consultoria",
    filter_area_industry: "Indústria/Engenharia",
    job_applied: "Aplicado",
    job_generate_msg: "🤖 Gerar Mensagem",
    job_analyze: "🧠 Analisar Match",
    job_view: "Ver vaga →",
    job_prob: "Probabilidade:",
    job_obs: "💡 Observação:",
    job_stack: "🛠 Stack:",
    job_source: "📌 Fonte:",
    job_warning: "⚠️ Atenção: As vagas foram mapeadas com base em buscas reais em LinkedIn, Indeed, Glassdoor e Jooble em 30/03/2026. Clique em \"Ver vaga\" para verificar disponibilidade atual — algumas podem ter sido preenchidas.",
    dashboard_applied: "Candidaturas",
    dashboard_interviews: "Entrevistas",
    dashboard_rate: "Taxa de Resposta",
    interview_add: "+ Agendar Entrevista",
    interview_feedback: "Registrar Feedback",
    interview_calendar: "📅 Add to Calendar",
    plan_day: "Dia",
    plan_strategy: "📌 Estratégia recomendada por tipo de empresa",
    plan_prio1: "1ª prioridade: Indústria / Automotivo em Contagem-Betim — experiência Stellantis é referência direta",
    plan_prio2: "2ª prioridade: Consultorias (Big 4 e mid-tier) em BH — EY no currículo abre portas",
    plan_prio3: "3ª prioridade: Médias empresas BH/Contagem com Power BI — menor concorrência, mais autonomia",
    plan_prio4: "4ª prioridade: Vagas remotas nacionais — maior salário, inglês é diferencial real",
    companies_desc: "Baseado no perfil — Engenharia Mecatrônica + EY + Stellantis + Power BI — esses são os tipos de empresa com melhor fit:",
    companies_data: [
      { tipo: "Indústria / Automotivo", exemplos: "Stellantis, Fiat, Usiminas, ArcelorMittal", fit: 90, razao: "Experiência técnica + dados industriais = combinação rara" },
      { tipo: "Consultoria (Big 4 / Mid)", exemplos: "EY, Deloitte, KPMG, Accenture, Capgemini", fit: 88, razao: "Histórico EY é credencial direta — referência forte nessas empresas" },
      { tipo: "Médias Empresas (100–1000 func.)", exemplos: "Logísticas, varejo, saúde, energia em BH", fit: 85, razao: "Mais autonomia, stack acessível, menos concorrentes com currículo EY" },
      { tipo: "Fintechs / Tecnologia", exemplos: "Banco Inter, PagMinas, startups BH", fit: 72, razao: "Gap em engenharia de dados — mas Python e SQL cobrem boa parte" },
      { tipo: "Remoto Nacional", exemplos: "Empresas SP/RJ com equipe remota", fit: 78, razao: "Salários maiores, mais vagas — inglês avançado é diferencial real" },
    ]
  },
  en: {
    header_subtitle: "Action Plan — Thaís Pollarini",
    header_title: "🎯 Data Analyst / Automation — BH · Contagem · Betim · Remote",
    header_desc: "7 days of immediate action · Real mapped jobs · Probability per job",
    tab_jobs: "📋 Jobs",
    tab_plan: "📅 Plan",
    tab_companies: "🏢 Companies",
    tab_dashboard: "📊 Dashboard",
    tab_interviews: "📅 Interviews",
    filter_search_placeholder: "Title, keyword, or company",
    filter_location_placeholder: "City or remote",
    filter_all: "All",
    filter_tech: "Technology",
    filter_job_type: "Job Type",
    filter_job_type_onsite: "On-site",
    filter_job_type_remote: "Remote",
    filter_job_type_hybrid: "Hybrid",
    filter_date: "Date Posted",
    filter_date_24h: "Last 24h",
    filter_date_3d: "Last 3 days",
    filter_date_7d: "Last week",
    filter_prob: "Min Prob.",
    filter_area: "Area/Role",
    filter_area_data: "Data Analysis",
    filter_area_bi: "Business Intelligence",
    filter_area_automation: "Automation",
    filter_area_consulting: "Consulting",
    filter_area_industry: "Industry/Engineering",
    job_applied: "Applied",
    job_generate_msg: "🤖 Generate Message",
    job_analyze: "🧠 Analyze Match",
    job_view: "View job →",
    job_prob: "Probability:",
    job_obs: "💡 Note:",
    job_stack: "🛠 Stack:",
    job_source: "📌 Source:",
    job_warning: "⚠️ Note: Jobs were mapped based on real searches on LinkedIn, Indeed, Glassdoor, and Jooble on 03/30/2026. Click \"View job\" to check current availability — some may have been filled.",
    dashboard_applied: "Applications",
    dashboard_interviews: "Interviews",
    dashboard_rate: "Response Rate",
    interview_add: "+ Schedule Interview",
    interview_feedback: "Record Feedback",
    interview_calendar: "📅 Add to Calendar",
    plan_day: "Day",
    plan_strategy: "📌 Recommended strategy by company type",
    plan_prio1: "1st priority: Industry / Automotive in Contagem-Betim — Stellantis experience is a direct reference",
    plan_prio2: "2nd priority: Consultancies (Big 4 and mid-tier) in BH — EY on CV opens doors",
    plan_prio3: "3rd priority: Medium companies BH/Contagem with Power BI — less competition, more autonomy",
    plan_prio4: "4th priority: National remote jobs — higher salary, English is a real differentiator",
    companies_desc: "Based on the profile — Mechatronics Engineering + EY + Stellantis + Power BI — these are the types of companies with the best fit:",
    companies_data: [
      { tipo: "Industry / Automotive", exemplos: "Stellantis, Fiat, Usiminas, ArcelorMittal", fit: 90, razao: "Technical experience + industrial data = rare combination" },
      { tipo: "Consultancy (Big 4 / Mid)", exemplos: "EY, Deloitte, KPMG, Accenture, Capgemini", fit: 88, razao: "EY history is a direct credential — strong reference in these companies" },
      { tipo: "Medium Companies (100–1000 employees)", exemplos: "Logistics, retail, health, energy in BH", fit: 85, razao: "More autonomy, accessible stack, fewer competitors with EY CV" },
      { tipo: "Fintechs / Technology", exemplos: "Banco Inter, PagMinas, startups BH", fit: 72, razao: "Gap in data engineering — but Python and SQL cover a good part" },
      { tipo: "National Remote", exemplos: "SP/RJ companies with remote team", fit: 78, razao: "Higher salaries, more jobs — advanced English is a real differentiator" },
    ]
  }
};

const VAGAS = [
  {
    empresa: "Localiza&Co",
    regiao: "Contagem, MG",
    vaga: "Analista SR de Dados | FP&A",
    nivel: "Sênior",
    salario: "R$ 9.000 – R$ 12.000",
    modelo: "Presencial/Híbrido",
    ferramentas: "SQL, BigQuery, Python",
    fonte: "Jooble / LinkedIn",
    link: "https://br.linkedin.com/jobs/analista-de-banco-de-dados-vagas-belo-horizonte-e-regi%C3%A3o",
    prob: 62,
    obs: "Exige BigQuery — gap técnico. Experiência em EY e Stellantis é diferencial forte.",
  },
  {
    empresa: "Grupo Zelo",
    regiao: "Belo Horizonte, MG",
    vaga: "Analista de Dados Jr",
    nivel: "Júnior",
    salario: "R$ 3.000 – R$ 5.000",
    modelo: "Presencial",
    ferramentas: "Power BI, Excel",
    fonte: "Indeed / Glassdoor",
    link: "https://br.indeed.com/q-analista-de-dados-l-belo-horizonte,-mg-vagas.html",
    prob: 82,
    obs: "Perfil exato de Power BI e KPIs. Experiência EY e Stellantis supera requisitos Jr.",
  },
  {
    empresa: "Suggar Eletrodomésticos",
    regiao: "Contagem, MG",
    vaga: "Analista de BI",
    nivel: "Pleno",
    salario: "R$ 5.500 – R$ 7.500",
    modelo: "Presencial",
    ferramentas: "Power BI, SQL, Python",
    fonte: "Indeed",
    link: "https://br.indeed.com/q-power-bi-l-belo-horizonte,-mg-vagas.html",
    prob: 75,
    obs: "Contagem — localização ideal. Stack alinhada. Empresa de médio porte = mais autonomia.",
  },
  {
    empresa: "Arcadis",
    regiao: "Belo Horizonte, MG",
    vaga: "Analista de Inovação Digital SR (Power BI)",
    nivel: "Sênior",
    salario: "R$ 8.000 – R$ 11.000",
    modelo: "Presencial/Híbrido",
    ferramentas: "Power BI, Power Apps, Power Automate",
    fonte: "Site Arcadis",
    link: "https://jobs.arcadis.com/careers/job/563671530760047",
    prob: 78,
    obs: "Stack Microsoft 365 é ponto forte. Engenharia mecatrônica é diferencial em empresa de engenharia.",
  },
  {
    empresa: "UNALOG",
    regiao: "Contagem, MG",
    vaga: "Analista de BI",
    nivel: "Júnior/Pleno",
    salario: "R$ 4.000 – R$ 6.500",
    modelo: "Presencial",
    ferramentas: "Power BI, SQL",
    fonte: "Indeed",
    link: "https://br.indeed.com/q-analista-de-bi-l-belo-horizonte,-mg-vagas.html",
    prob: 80,
    obs: "Logística — área onde gestão de dados tem alto impacto. Contagem facilita acesso.",
  },
  {
    empresa: "Sicoob Crediminas",
    regiao: "Belo Horizonte, MG",
    vaga: "Analista de BI / Reports",
    nivel: "Pleno",
    salario: "R$ 5.000 – R$ 8.000",
    modelo: "Presencial/Híbrido",
    ferramentas: "Power BI, SQL",
    fonte: "Indeed",
    link: "https://br.indeed.com/q-analista-de-bi-l-belo-horizonte,-mg-vagas.html",
    prob: 70,
    obs: "Cooperativa financeira — experiência EY em modelagem financeira é muito relevante aqui.",
  },
  {
    empresa: "Friopeças",
    regiao: "Belo Horizonte, MG",
    vaga: "Analista de Dados",
    nivel: "Júnior/Pleno",
    salario: "R$ 4.000 – R$ 6.000",
    modelo: "Presencial",
    ferramentas: "Power BI, Excel, SQL",
    fonte: "Indeed",
    link: "https://br.indeed.com/q-power-bi-l-belo-horizonte,-mg-vagas.html",
    prob: 77,
    obs: "Empresa de médio porte, stack acessível. Formação em Eng. Produção/correlatas — Mecatrônica conta.",
  },
  {
    empresa: "Estilo Telemarketing",
    regiao: "Belo Horizonte, MG",
    vaga: "Analista de BI",
    nivel: "Júnior",
    salario: "R$ 3.000 – R$ 4.000",
    modelo: "Presencial",
    ferramentas: "Power BI, Excel",
    fonte: "Glassdoor / Indeed",
    link: "https://www.glassdoor.com.br/Vaga/belo-horizonte-analista-de-dados-vagas-SRCH_IL.0,14_IC2514646_KO15,32.htm",
    prob: 85,
    obs: "Alta probabilidade: requisitos básicos, perfil bem acima do esperado para Jr. Boa porta de entrada.",
  },
  {
    empresa: "Maxtrack",
    regiao: "Belo Horizonte, MG",
    vaga: "Analista de Dados",
    nivel: "Pleno",
    salario: "R$ 5.500 – R$ 8.000",
    modelo: "Híbrido",
    ferramentas: "Python, SQL, Power BI",
    fonte: "Glassdoor",
    link: "https://www.glassdoor.com.br/Vaga/belo-horizonte-analista-de-dados-vagas-SRCH_IL.0,14_IC2514646_KO15,32.htm",
    prob: 71,
    obs: "Empresa de tecnologia/rastreamento. Python é desejável — ponto de atenção para fortalecer.",
  },
  {
    empresa: "ACT Digital (outras células)",
    regiao: "Contagem / BH / Remoto",
    vaga: "Analista de Dados / BI",
    nivel: "Pleno",
    salario: "R$ 5.000 – R$ 8.000",
    modelo: "Híbrido/Remoto",
    ferramentas: "Power BI, SQL, Excel",
    fonte: "LinkedIn / Site ACT",
    link: "https://br.linkedin.com/jobs/analista-de-dados-vagas-belo-horizonte",
    prob: 88,
    obs: "Já trabalha na empresa — indicação interna e histórico comprovado são os maiores diferenciais.",
  },
];

const DIAS = [
  {
    dia: "Dia 1",
    tema: "Fundação",
    cor: "#2563EB",
    acoes: [
      "Atualize o LinkedIn: título 'Analista de Dados | Power BI | SQL | Python', foto profissional, resumo com palavras-chave",
      "Ative o modo 'Open to Work' no LinkedIn (visível só para recrutadores)",
      "Cadastre o currículo atualizado no LinkedIn, Indeed, Vagas.com, Catho e Glassdoor",
      "Defina alerta de vaga no LinkedIn: 'Analista de Dados' + 'Belo Horizonte' + 'Contagem' + 'Remoto'",
      "Defina alerta no Indeed com os mesmos termos",
    ],
    termos: [
      "analista de dados",
      "analista de BI",
      "analista Power BI",
      "data analyst",
      "business intelligence analyst",
    ],
    sites: [
      { nome: "LinkedIn Jobs", url: "https://br.linkedin.com/jobs/" },
      { nome: "Indeed Brasil", url: "https://br.indeed.com" },
      { nome: "Vagas.com", url: "https://www.vagas.com.br" },
    ],
  },
  {
    dia: "Dia 2",
    tema: "Pesquisa de Empresas-Alvo",
    cor: "#7C3AED",
    acoes: [
      "Mapeie 20 empresas de médio/grande porte em BH/Contagem/Betim com áreas de dados ativas",
      "Priorize: indústrias (Stellantis, Fiat, Usiminas, ArcelorMittal), fintechs, consultorias e empresas de tecnologia",
      "Acesse o site de cada empresa e procure a aba 'Trabalhe Conosco' — candidate-se mesmo sem vaga anunciada",
      "Pesquise no LinkedIn quem é o gestor de dados ou RH de cada empresa e conecte-se com mensagem curta",
      "Monte uma planilha própria com: empresa | contato | data de aplicação | status",
    ],
    termos: [
      "analista de automação",
      "analista Power Automate",
      "analista de processos dados",
      "RPA analyst",
      "analista de inteligência de negócios",
    ],
    sites: [
      { nome: "Glassdoor BH", url: "https://www.glassdoor.com.br/Vaga/belo-horizonte-analista-de-dados-vagas-SRCH_IL.0,14_IC2514646_KO15,32.htm" },
      { nome: "Catho Power BI", url: "https://www.catho.com.br/vagas/analista-de-powerbi/belo-horizonte-mg/" },
      { nome: "InfoJobs BI BH", url: "https://www.infojobs.com.br/vagas-de-analista-bi-em-belo-horizonte,-mg.aspx" },
    ],
  },
  {
    dia: "Dia 3",
    tema: "Candidaturas Estratégicas",
    cor: "#059669",
    acoes: [
      "Candidate-se às 10 vagas da tabela abaixo com maior probabilidade (acima de 75%)",
      "Personalize a mensagem de candidatura para cada vaga — mencione a ferramenta específica que a vaga pede",
      "Envie mensagem direta no LinkedIn para o recrutador ou gestor após se candidatar",
      "Priorize vagas em Contagem e BH antes de remotas — proximidade é diferencial",
      "Para vagas de Analista de Inovação (Power Automate), destaque experiência com automação na Stellantis",
    ],
    termos: [
      "analista dados Contagem MG",
      "analista BI Betim",
      "Power BI Belo Horizonte CLT",
      "vaga analista dados híbrido BH",
      "analista dados engenharia BH",
    ],
    sites: [
      { nome: "Robert Half BH", url: "https://www.roberthalf.com/br/pt/vagas/belo-horizonte/analista-de-dados-pleno" },
      { nome: "Jooble BH Dados", url: "https://br.jooble.org/vagas-de-emprego-analista-de-dados/Belo-Horizonte%2C-MG" },
      { nome: "LinkedIn 877 vagas", url: "https://br.linkedin.com/jobs/analista-de-dados-vagas-belo-horizonte" },
    ],
  },
  {
    dia: "Dia 4",
    tema: "Rede de Contatos",
    cor: "#D97706",
    acoes: [
      "Liste 15 pessoas do seu network: colegas CEFET-MG, ex-EY, ex-ACT Digital, conhecidos da área",
      "Mande mensagem pessoal (não em grupo) para cada um — não peça emprego diretamente, peça indicação ou conversa",
      "Poste no LinkedIn um conteúdo curto sobre sua área: ex. 'Dashboard que criei para controle de testes na Stellantis'",
      "Entre em grupos do LinkedIn de Analistas de Dados em MG e participe de discussões",
      "Pesquise ex-colegas de EY que foram para empresas com dados em BH e peça referência",
    ],
    termos: [
      "analista dados junior BH",
      "analista dados pleno Belo Horizonte remoto",
      "vaga Power BI CLT Minas Gerais",
      "trainee dados BH 2026",
      "analista dados indústria Contagem",
    ],
    sites: [
      { nome: "LinkedIn Network", url: "https://www.linkedin.com/mynetwork/" },
      { nome: "Grupo Dados MG LinkedIn", url: "https://www.linkedin.com/search/results/groups/?keywords=dados%20minas%20gerais" },
    ],
  },
  {
    dia: "Dia 5",
    tema: "Grandes Empresas & Consultorias",
    cor: "#DC2626",
    acoes: [
      "Acesse os portais de carreira: Accenture, Deloitte, KPMG, PwC, Capgemini, Stefanini — todas têm escritório em BH",
      "Cadastre currículo nos portais: Fiat/Stellantis, Usiminas, ArcelorMittal, Unimed MG, Banco Inter, PagSeguro",
      "Pesquise: 'analista dados remoto Brasil' — vagas remotas de SP/RJ frequentemente aceitam BH",
      "Candidate-se a pelo menos 5 vagas remotas de empresas fora de MG que pagam acima de R$ 7.000",
      "Faça follow-up nas candidaturas do Dia 3 — envie mensagem curta no LinkedIn ao recrutador",
    ],
    termos: [
      "analista dados remoto CLT",
      "data analyst remoto Brasil",
      "analista BI home office",
      "analista dados fintech remoto",
      "analista dados consultoria BH",
    ],
    sites: [
      { nome: "Accenture Carreiras", url: "https://www.accenture.com/br-pt/careers" },
      { nome: "Stefanini Jobs", url: "https://jobs.stefanini.com" },
      { nome: "Capgemini Vagas", url: "https://www.capgemini.com/br-pt/carreiras/" },
    ],
  },
  {
    dia: "Dia 6",
    tema: "Diferenciação & Portfólio",
    cor: "#0891B2",
    acoes: [
      "Publique no LinkedIn: print de um dashboard ou análise sua (sem dados confidenciais) — isso prova habilidade",
      "Crie ou atualize seu GitHub com pelo menos 1 projeto Python ou SQL documentado",
      "Grave um vídeo curto (2 min) mostrando um dashboard que você criou — pode compartilhar como portfólio",
      "Solicite 2-3 recomendações no LinkedIn: ex-gestor EY, colega Stellantis, professor CEFET",
      "Pesquise na seção 'Easy Apply' do LinkedIn vagas com candidatura em 1 clique — aplique em todas pertinentes",
    ],
    termos: [
      "analista dados Power BI vagas",
      "analista automação Power Automate BH",
      "engenheira mecatrônica dados",
      "analista dados indústria automotiva",
      "analista dados consultoria estratégica",
    ],
    sites: [
      { nome: "LinkedIn Easy Apply", url: "https://www.linkedin.com/jobs/search/?f_AL=true&keywords=analista%20de%20dados&location=Belo%20Horizonte" },
      { nome: "GitHub", url: "https://github.com" },
    ],
  },
  {
    dia: "Dia 7",
    tema: "Revisão & Ritmo Semanal",
    cor: "#7C3AED",
    acoes: [
      "Revise o status de todas as candidaturas — responda mensagens pendentes no LinkedIn e e-mail",
      "Defina meta semanal para as próximas semanas: mínimo 10 candidaturas + 3 contatos de network por semana",
      "Configure Google Alerts: 'analista de dados Belo Horizonte', 'vaga BI Contagem', 'analista Power BI MG'",
      "Agende um tempo fixo de 1h por dia para busca ativa — não dependa de inspiração",
      "Avalie: qual tipo de empresa respondeu mais? Ajuste o foco para a semana seguinte",
    ],
    termos: [
      "\"analista de dados\" \"Belo Horizonte\" site:linkedin.com",
      "\"analista BI\" \"Contagem\" OR \"Betim\" CLT",
      "analista dados engenharia automotiva MG",
      "analista automação processos BH",
      "Power BI analyst Minas Gerais 2026",
    ],
    sites: [
      { nome: "Google Alerts", url: "https://www.google.com/alerts" },
      { nome: "Google Vagas (busca direta)", url: "https://www.google.com/search?q=analista+de+dados+belo+horizonte+vagas&ibp=htl;jobs" },
    ],
  },
];

const TIPOS_EMPRESA = [
  { tipo: "Indústria / Automotivo", exemplos: "Stellantis, Fiat, Usiminas, ArcelorMittal", fit: 90, razao: "Experiência técnica + dados industriais = combinação rara" },
  { tipo: "Consultoria (Big 4 / Mid)", exemplos: "EY, Deloitte, KPMG, Accenture, Capgemini", fit: 88, razao: "Histórico EY é credencial direta — referência forte nessas empresas" },
  { tipo: "Médias Empresas (100–1000 func.)", exemplos: "Logísticas, varejo, saúde, energia em BH", fit: 85, razao: "Mais autonomia, stack acessível, menos concorrentes com currículo EY" },
  { tipo: "Fintechs / Tecnologia", exemplos: "Banco Inter, PagMinas, startups BH", fit: 72, razao: "Gap em engenharia de dados — mas Python e SQL cobrem boa parte" },
  { tipo: "Remoto Nacional", exemplos: "Empresas SP/RJ com equipe remota", fit: 78, razao: "Salários maiores, mais vagas — inglês avançado é diferencial real" },
];

function ProbBar({ value, darkMode }: { value: number, darkMode?: boolean }) {
  const cor = value >= 80 ? "#16a34a" : value >= 65 ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: darkMode ? "#334155" : "#e5e7eb", borderRadius: 99, height: 8 }}>
        <div style={{ width: `${value}%`, background: cor, borderRadius: 99, height: 8, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontWeight: 700, color: cor, minWidth: 38, fontSize: 13 }}>{value}%</span>
    </div>
  );
}

function App() {
  const [jobs, setJobs] = useState<Job[]>(VAGAS as Job[]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [aba, setAba] = useState("vagas");
  const [diaAtivo, setDiaAtivo] = useState(0);
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  
  const t = TRANSLATIONS[language];

  // Advanced Filters State
  const [filters, setFilters] = useState({
    search: "",
    location: "all",
    tech: "all",
    area: "all",
    jobType: "all",
    datePosted: "all",
    probMin: 0
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0f172a";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f8fafc";
    }
  }, [darkMode]);

  // Daily Update Effect
  useEffect(() => {
    const updateJobs = async () => {
      const updated = await fetchDailyJobs(jobs);
      setJobs(updated);
    };
    updateJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !filters.search || 
        job.vaga.toLowerCase().includes(filters.search.toLowerCase()) || 
        job.empresa.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.ferramentas.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesLocation = filters.location === "all" || 
        job.modelo.toLowerCase().includes(filters.location.toLowerCase()) ||
        job.regiao.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesTech = filters.tech === "all" || job.ferramentas.toLowerCase().includes(filters.tech.toLowerCase());
      
      const matchesArea = filters.area === "all" || (
        filters.area === "data" ? (job.vaga.toLowerCase().includes("dados") || job.vaga.toLowerCase().includes("data") || job.vaga.toLowerCase().includes("analista")) :
        filters.area === "bi" ? (job.vaga.toLowerCase().includes("bi") || job.vaga.toLowerCase().includes("intelligence") || job.ferramentas.toLowerCase().includes("power bi")) :
        filters.area === "automation" ? (job.vaga.toLowerCase().includes("automação") || job.vaga.toLowerCase().includes("automation") || job.vaga.toLowerCase().includes("automate")) :
        filters.area === "consulting" ? (job.vaga.toLowerCase().includes("consultor") || job.vaga.toLowerCase().includes("consultoria") || job.empresa.toLowerCase().includes("ey") || job.empresa.toLowerCase().includes("deloitte")) :
        filters.area === "industry" ? (job.vaga.toLowerCase().includes("engenharia") || job.vaga.toLowerCase().includes("mecatrônica") || job.vaga.toLowerCase().includes("industrial") || job.empresa.toLowerCase().includes("stellantis")) :
        false
      );

      const matchesProb = job.prob >= filters.probMin;
      
      // Simulating job type filter
      const matchesJobType = filters.jobType === "all" || job.modelo.toLowerCase().includes(filters.jobType.toLowerCase());
      
      return matchesSearch && matchesLocation && matchesTech && matchesArea && matchesProb && matchesJobType;
    });
  }, [jobs, filters]);

  const stats = useMemo(() => {
    const applied = jobs.filter(j => j.tasks?.applied).length;
    const interviewRate = applied > 0 ? (interviews.length / applied) * 100 : 0;
    return { applied, interviews: interviews.length, interviewRate };
  }, [jobs, interviews]);

  const d = DIAS[diaAtivo];

  return (
    <div style={{ 
      fontFamily: "Arial, sans-serif", 
      background: darkMode ? "#0f172a" : "#f8fafc", 
      color: darkMode ? "#f8fafc" : "#1e293b",
      minHeight: "100vh", 
      padding: "0 0 40px",
      transition: "all 0.3s ease"
    }}>

      {/* Header */}
      <div style={{ background: darkMode ? "#1e293b" : "linear-gradient(135deg, #1a2e4a 0%, #2563eb 100%)", padding: "28px 24px 20px", color: "#fff" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: darkMode ? "#94a3b8" : "#93c5fd", textTransform: "uppercase", marginBottom: 6 }}>{t.header_subtitle}</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t.header_title}</h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: darkMode ? "#cbd5e1" : "#bfdbfe" }}>{t.header_desc}</p>
        </div>
      </div>

      {/* Abas */}
      <div style={{ background: darkMode ? "#1e293b" : "#fff", borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 4, padding: "0 24px", alignItems: "center" }}>
          {[
            ["vagas", t.tab_jobs], 
            ["plano", t.tab_plan], 
            ["empresas", t.tab_companies], 
            ["dashboard", t.tab_dashboard], 
            ["interviews", t.tab_interviews]
          ].map(([id, label]) => (
            <button key={id} onClick={() => setAba(id)} style={{
              padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
              fontWeight: aba === id ? 700 : 400, color: aba === id ? "#2563eb" : (darkMode ? "#94a3b8" : "#64748b"),
              borderBottom: aba === id ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: 14, transition: "all 0.2s"
            }}>{label}</button>
          ))}
          <button onClick={() => setLanguage(l => l === 'pt' ? 'en' : 'pt')} style={{
            marginLeft: "auto", padding: "8px", cursor: "pointer", borderRadius: "8px", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
            fontSize: 12, color: darkMode ? "#cbd5e1" : "#64748b", background: "none"
          }}>
            {language === 'pt' ? "🇺🇸 EN" : "🇧🇷 PT"}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "8px", cursor: "pointer", borderRadius: "50%", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, marginLeft: 8, background: "none" }}>
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── ABA VAGAS ── */}
        {aba === "vagas" && (
          <div>
            {/* Google Jobs Style Filters UI */}
            <div style={{ 
              background: darkMode ? "#1e293b" : "#fff", 
              padding: "20px", 
              borderRadius: "16px", 
              marginBottom: "24px", 
              border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              {/* Search Bar Row */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: "250px", position: "relative" }}>
                  <input 
                    type="text" 
                    placeholder={t.filter_search_placeholder}
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    style={{ 
                      width: "100%", 
                      padding: "12px 16px", 
                      borderRadius: "12px", 
                      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                      background: darkMode ? "#0f172a" : "#fff",
                      color: darkMode ? "#f8fafc" : "#1e293b",
                      fontSize: "14px"
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <input 
                    type="text" 
                    placeholder={t.filter_location_placeholder}
                    value={filters.location === "all" ? "" : filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value || "all"})}
                    style={{ 
                      width: "100%", 
                      padding: "12px 16px", 
                      borderRadius: "12px", 
                      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                      background: darkMode ? "#0f172a" : "#fff",
                      color: darkMode ? "#f8fafc" : "#1e293b",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </div>

              {/* Pill Selectors Row */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <select 
                  onChange={(e) => setFilters({...filters, tech: e.target.value})} 
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: "20px", 
                    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                    background: darkMode ? "#334155" : "#f1f5f9",
                    color: darkMode ? "#f8fafc" : "#475569",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">{t.filter_tech}: {t.filter_all}</option>
                  <option value="Power BI">Power BI</option>
                  <option value="SQL">SQL</option>
                  <option value="Python">Python</option>
                </select>

                <select 
                  onChange={(e) => setFilters({...filters, area: e.target.value})} 
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: "20px", 
                    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                    background: darkMode ? "#334155" : "#f1f5f9",
                    color: darkMode ? "#f8fafc" : "#475569",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">{t.filter_area}: {t.filter_all}</option>
                  <option value="data">{t.filter_area_data}</option>
                  <option value="bi">{t.filter_area_bi}</option>
                  <option value="automation">{t.filter_area_automation}</option>
                  <option value="consulting">{t.filter_area_consulting}</option>
                  <option value="industry">{t.filter_area_industry}</option>
                </select>

                <select 
                  onChange={(e) => setFilters({...filters, jobType: e.target.value})} 
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: "20px", 
                    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                    background: darkMode ? "#334155" : "#f1f5f9",
                    color: darkMode ? "#f8fafc" : "#475569",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">{t.filter_job_type}: {t.filter_all}</option>
                  <option value="Presencial">{t.filter_job_type_onsite}</option>
                  <option value="Remoto">{t.filter_job_type_remote}</option>
                  <option value="Híbrido">{t.filter_job_type_hybrid}</option>
                </select>

                <select 
                  onChange={(e) => setFilters({...filters, datePosted: e.target.value})} 
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: "20px", 
                    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                    background: darkMode ? "#334155" : "#f1f5f9",
                    color: darkMode ? "#f8fafc" : "#475569",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">{t.filter_date}: {t.filter_all}</option>
                  <option value="24h">{t.filter_date_24h}</option>
                  <option value="3d">{t.filter_date_3d}</option>
                  <option value="7d">{t.filter_date_7d}</option>
                </select>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                  <label style={{ fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b" }}>{t.filter_prob}: {filters.probMin}%</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={filters.probMin} 
                    onChange={(e) => setFilters({...filters, probMin: parseInt(e.target.value)})} 
                    style={{ width: "80px" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredJobs.sort((a, b) => b.prob - a.prob).map((v, i) => (
                <div key={i} style={{ 
                  background: darkMode ? "#1e293b" : "#fff", 
                  borderRadius: 12, 
                  border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, 
                  padding: "18px 20px", 
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: darkMode ? "#f8fafc" : "#1a2e4a" }}>{v.empresa}</span>
                        <span style={{ background: darkMode ? "#1e40af" : "#eff6ff", color: darkMode ? "#bfdbfe" : "#2563eb", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{v.nivel}</span>
                        <span style={{ background: darkMode ? "#064e3b" : "#f0fdf4", color: darkMode ? "#6ee7b7" : "#15803d", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{v.modelo}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 3 }}>{v.vaga}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#059669" }}>{v.salario}</div>
                      <div style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#94a3b8" }}>{v.regiao}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b" }}>🛠 <strong>{t.job_stack}</strong> {v.ferramentas}</div>
                    <div style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b" }}>📌 <strong>{t.job_source}</strong> {v.fonte}</div>
                  </div>

                  <div style={{ background: darkMode ? "#334155" : "#f8fafc", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: darkMode ? "#cbd5e1" : "#374151" }}>
                    {t.job_obs} {v.obs}
                  </div>

                  <div style={{ borderTop: `1px solid ${darkMode ? "#334155" : "#f1f5f9"}`, paddingTop: 12, marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: darkMode ? "#cbd5e1" : "#374151" }}>
                      <input type="checkbox" checked={v.tasks?.applied} onChange={() => {
                        const newJobs = [...jobs];
                        const index = jobs.findIndex(j => j.empresa === v.empresa && j.vaga === v.vaga);
                        newJobs[index].tasks = { ...newJobs[index].tasks, applied: !newJobs[index].tasks?.applied } as any;
                        setJobs(newJobs);
                      }} /> {t.job_applied}
                    </label>
                    <button onClick={async () => {
                      const msg = await generateMessage('outreach', v);
                      alert(msg);
                    }} style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>{t.job_generate_msg}</button>
                    <button onClick={async () => {
                      const analysis = await analyzeJobMatch(v, INITIAL_PROFILE);
                      alert(`Match: ${analysis.score}% \nSugestão: ${analysis.suggestions}`);
                    }} style={{ fontSize: 11, color: "#7c3aed", background: "none", border: "none", cursor: "pointer" }}>{t.job_analyze}</button>
                    <div style={{ flex: 1 }}><ProbBar value={v.prob} darkMode={darkMode} /></div>
                    <a href={v.link} target="_blank" rel="noreferrer" style={{
                      padding: "6px 14px", background: "#2563eb", color: "#fff", borderRadius: 8,
                      fontSize: 12, textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap"
                    }}>{t.job_view}</a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: darkMode ? "#422006" : "#fefce8", border: `1px solid ${darkMode ? "#78350f" : "#fde68a"}`, borderRadius: 10, padding: 14, marginTop: 20, fontSize: 12, color: darkMode ? "#fde68a" : "#92400e" }}>
              {t.job_warning}
            </div>
          </div>
        )}

        {/* ── ABA PLANO ── */}
        {aba === "plano" && (
          <div>
            {/* Seletor de dias */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {DIAS.map((dia, i) => (
                <button key={i} onClick={() => setDiaAtivo(i)} style={{
                  padding: "8px 16px", borderRadius: 10, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                  background: diaAtivo === i ? "#2563eb" : (darkMode ? "#1e293b" : "#fff"),
                  color: diaAtivo === i ? "#fff" : (darkMode ? "#cbd5e1" : "#374151"),
                  cursor: "pointer", fontSize: 13, fontWeight: diaAtivo === i ? 700 : 400
                }}>
                  {t.plan_day} {i + 1}
                </button>
              ))}
            </div>

            <div style={{ background: darkMode ? "#1e293b" : "#fff", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, padding: 24 }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 18, color: darkMode ? "#f8fafc" : "#1a2e4a" }}>{d.tema}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {d.acoes.map((tarefa, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${darkMode ? "#334155" : "#cbd5e1"}`, marginTop: 2 }}></div>
                    <div style={{ fontSize: 14, color: darkMode ? "#cbd5e1" : "#475569" }}>{tarefa}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: darkMode ? "#1e3a8a" : "#eff6ff", borderRadius: 12, padding: 18, marginTop: 20, border: `1px solid ${darkMode ? "#1e40af" : "#bfdbfe"}` }}>
              <h3 style={{ margin: "0 0 10px", color: darkMode ? "#bfdbfe" : "#1d4ed8", fontSize: 14 }}>{t.plan_strategy}</h3>
              <div style={{ fontSize: 13, color: darkMode ? "#93c5fd" : "#1e40af", lineHeight: 1.8 }}>
                <strong>{t.plan_prio1}</strong><br />
                <strong>{t.plan_prio2}</strong><br />
                <strong>{t.plan_prio3}</strong><br />
                <strong>{t.plan_prio4}</strong><br />
              </div>
            </div>
          </div>
        )}

        {/* ── ABA EMPRESAS ── */}
        {aba === "empresas" && (
          <div>
            <p style={{ color: darkMode ? "#94a3b8" : "#64748b", fontSize: 14, marginBottom: 20 }}>
              {t.companies_desc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {t.companies_data.sort((a, b) => b.fit - a.fit).map((e, i) => (
                <div key={i} style={{ 
                  background: darkMode ? "#1e293b" : "#fff", 
                  borderRadius: 12, 
                  border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, 
                  padding: "18px 20px" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: darkMode ? "#f8fafc" : "#1a2e4a" }}>{e.tipo}</div>
                      <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748b", marginTop: 3 }}>Ex: {e.exemplos}</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 20, color: e.fit >= 85 ? "#16a34a" : e.fit >= 75 ? "#d97706" : "#dc2626" }}>{e.fit}%</span>
                  </div>
                  <div style={{ background: darkMode ? "#334155" : "#f8fafc", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: darkMode ? "#cbd5e1" : "#374151" }}>
                    💡 {e.razao}
                  </div>
                  <div style={{ marginTop: 10 }}><ProbBar value={e.fit} darkMode={darkMode} /></div>
                </div>
              ))}
            </div>

            <div style={{ background: darkMode ? "#1e3a8a" : "#eff6ff", borderRadius: 12, padding: 18, marginTop: 20, border: `1px solid ${darkMode ? "#1e40af" : "#bfdbfe"}` }}>
              <h3 style={{ margin: "0 0 10px", color: darkMode ? "#bfdbfe" : "#1d4ed8", fontSize: 14 }}>{t.plan_strategy}</h3>
              <div style={{ fontSize: 13, color: darkMode ? "#93c5fd" : "#1e40af", lineHeight: 1.8 }}>
                <strong>{t.plan_prio1}</strong><br />
                <strong>{t.plan_prio2}</strong><br />
                <strong>{t.plan_prio3}</strong><br />
                <strong>{t.plan_prio4}</strong><br />
              </div>
            </div>
          </div>
        )}
        {/* ── ABA DASHBOARD ── */}
        {aba === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            <div style={{ background: darkMode ? "#1e293b" : "#fff", padding: 24, borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#2563eb" }}>{stats.applied}</div>
              <div style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>{t.dashboard_applied}</div>
            </div>
            <div style={{ background: darkMode ? "#1e293b" : "#fff", padding: 24, borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#059669" }}>{stats.interviews}</div>
              <div style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>{t.dashboard_interviews}</div>
            </div>
            <div style={{ background: darkMode ? "#1e293b" : "#fff", padding: 24, borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#7c3aed" }}>{stats.interviewRate.toFixed(1)}%</div>
              <div style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>{t.dashboard_rate}</div>
            </div>
          </div>
        )}

        {/* ── ABA INTERVIEWS ── */}
        {aba === "interviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button onClick={() => {
              const newInterview: Interview = {
                id: Math.random().toString(),
                jobId: "1",
                company: "Exemplo Corp",
                date: "2026-04-10",
                time: "14:00",
                status: "scheduled",
                notes: "Entrevista técnica"
              };
              setInterviews([...interviews, newInterview]);
            }} style={{ padding: 12, background: "#2563eb", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}>
              {t.interview_add}
            </button>
            {interviews.map(interview => (
              <div key={interview.id} style={{ background: darkMode ? "#1e293b" : "#fff", padding: 20, borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, color: darkMode ? "#f8fafc" : "#1a2e4a" }}>{interview.company}</span>
                  <span style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b" }}>{interview.date} às {interview.time}</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 8, color: darkMode ? "#cbd5e1" : "#374151" }}>{interview.notes}</div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                   <button style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, color: darkMode ? "#cbd5e1" : "#374151", background: "none", cursor: "pointer" }}>{t.interview_feedback}</button>
                   <button style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, color: "#2563eb", background: "none", cursor: "pointer" }}>{t.interview_calendar}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;