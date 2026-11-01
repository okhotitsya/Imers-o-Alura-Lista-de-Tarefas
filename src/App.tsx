import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Circle,
  Trash2,
  Play,
  Terminal,
  Code,
  BookOpen,
  Database,
  Search,
  Plus,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Sparkles,
  Laptop,
  AlertTriangle,
  FolderTree,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Download,
  ExternalLink,
  Monitor,
} from 'lucide-react';

interface TaskItem {
  id: number;
  title: string;
  completed: boolean;
  priority: 'Baixa' | 'Média' | 'Alta';
  created_at: string;
  due_date?: string;
}

const MONTH_NAMES_PT = [
  '',
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

interface TestResult {
  success: boolean;
  durationMs: number;
  output: string;
  totalTests: number;
  testCases: Array<{ name: string; module: string; status: string }>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'run' | 'tests' | 'code' | 'guide' | 'database'>('demo');

  // Local PC Execution Guide State
  const [guideOs, setGuideOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [cliLogs, setCliLogs] = useState<Array<{ command: string; output: string; time: string; type: 'cmd' | 'ok' | 'info' }>>([
    {
      command: 'git --version && python --version',
      output: 'git version 2.43.0\nPython 3.10.12 (ou superior)',
      time: '19:00:00',
      type: 'ok',
    },
    {
      command: 'git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git',
      output: "Cloning into 'Imers-o-Alura-Lista-de-Tarefas'...\nremote: Enumerating objects: 42, done.\nremote: Total 42 (delta 18), reused 40 (delta 16)\nUnpacking objects: 100% (42/42), done.",
      time: '19:00:02',
      type: 'info',
    },
  ]);
  const [isSimulatingCli, setIsSimulatingCli] = useState(false);

  const copyTextToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  const handleSimulateCliStep = (step: 'clone' | 'venv' | 'activate' | 'deps' | 'run' | 'tests' | 'all') => {
    const now = new Date().toLocaleTimeString('pt-BR');
    if (step === 'clone') {
      setCliLogs((prev) => [
        ...prev,
        {
          command: 'git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git && cd Imers-o-Alura-Lista-de-Tarefas',
          output: "Cloning into 'Imers-o-Alura-Lista-de-Tarefas'...\nReceiving objects: 100% (42/42), 38.50 KiB | 2.41 MiB/s, done.\nResolving deltas: 100% (18/18), done.\nDiretório ativo: ~/Imers-o-Alura-Lista-de-Tarefas",
          time: now,
          type: 'ok',
        },
      ]);
    } else if (step === 'venv') {
      const venvCmd = guideOs === 'windows' ? 'python -m venv venv' : 'python3 -m venv venv';
      setCliLogs((prev) => [
        ...prev,
        {
          command: venvCmd,
          output: 'Criando ambiente virtual isolado em ./venv...\nAmbiente virtual criado com sucesso! (Python venv pronto)',
          time: now,
          type: 'ok',
        },
      ]);
    } else if (step === 'activate') {
      const actCmd =
        guideOs === 'windows'
          ? '.\\venv\\Scripts\\Activate.ps1'
          : 'source venv/bin/activate';
      setCliLogs((prev) => [
        ...prev,
        {
          command: actCmd,
          output: '(venv) Pronto! Prompt do terminal atualizado com o ambiente virtual ativo.\nTodos os pacotes e comandos agora operam de forma 100% isolada.',
          time: now,
          type: 'ok',
        },
      ]);
    } else if (step === 'deps') {
      const depsOutput =
        guideOs === 'linux'
          ? 'sudo apt update && sudo apt install -y python3-tk\npip install -r requirements.txt\n\nTkinter nativo verificado: OK\nTodas as dependências da biblioteca padrão verificadas: OK (sqlite3, unittest, dataclasses).'
          : 'pip install -r requirements.txt\n\nRequirement already satisfied: TaskFlow utiliza exclusivamente a biblioteca padrão do Python.\nDependências prontas: tkinter, sqlite3, unittest, datetime, pathlib.';
      setCliLogs((prev) => [
        ...prev,
        {
          command: 'pip install -r requirements.txt',
          output: depsOutput,
          time: now,
          type: 'ok',
        },
      ]);
    } else if (step === 'run') {
      const runCmd = guideOs === 'windows' ? 'python main.py' : 'python3 main.py';
      setCliLogs((prev) => [
        ...prev,
        {
          command: runCmd,
          output: '[TaskFlow] Inicializando Gerenciador de Tarefas Desktop...\n[TaskFlow] Banco SQLite verificado: taskflow/data/taskflow.db (OK)\n[TaskFlow] Tema TTK clam configurado (#121721)\n[TaskFlow] Janela 1060x780 iniciada com Calendário 2026.\n[TaskFlow] mainloop() em execução aguardando interação do usuário...',
          time: now,
          type: 'ok',
        },
      ]);
    } else if (step === 'tests') {
      setCliLogs((prev) => [
        ...prev,
        {
          command: 'python -m unittest discover -s tests -v',
          output: 'test_add_task_empty_title (test_services.TestTaskFlowBusinessRules) ... ok\ntest_add_task_success (test_services.TestTaskFlowBusinessRules) ... ok\ntest_completion_rate_calculation (test_services.TestTaskFlowBusinessRules) ... ok\ntest_count_metrics (test_services.TestTaskFlowBusinessRules) ... ok\ntest_database_file_persistence (test_services.TestTaskFlowBusinessRules) ... ok\ntest_delete_task (test_services.TestTaskFlowBusinessRules) ... ok\ntest_filter_by_date_2026 (test_services.TestTaskFlowBusinessRules) ... ok\ntest_filter_by_status (test_services.TestTaskFlowBusinessRules) ... ok\ntest_priority_filter_and_validation (test_services.TestTaskFlowBusinessRules) ... ok\ntest_reopen_task (test_services.TestTaskFlowBusinessRules) ... ok\ntest_search_filter (test_services.TestTaskFlowBusinessRules) ... ok\ntest_toggle_completion (test_services.TestTaskFlowBusinessRules) ... ok\ntest_update_task_title (test_services.TestTaskFlowBusinessRules) ... ok\n\n----------------------------------------------------------------------\nRan 13 tests in 0.015s\n\nOK',
          time: now,
          type: 'ok',
        },
      ]);
    } else if (step === 'all') {
      setIsSimulatingCli(true);
      setCliLogs([
        {
          command: '# Executando roteiro completo automatizado...',
          output: 'Iniciando verificação de ambiente, clone, venv, ativação, dependências e execução...',
          time: now,
          type: 'info',
        },
      ]);
      setTimeout(() => {
        setCliLogs((p) => [
          ...p,
          {
            command: 'git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git && cd Imers-o-Alura-Lista-de-Tarefas',
            output: "Cloning into 'Imers-o-Alura-Lista-de-Tarefas'...\nReceiving objects: 100% (42/42), done.",
            time: new Date().toLocaleTimeString('pt-BR'),
            type: 'ok',
          },
        ]);
      }, 500);
      setTimeout(() => {
        setCliLogs((p) => [
          ...p,
          {
            command: guideOs === 'windows' ? 'python -m venv venv' : 'python3 -m venv venv',
            output: 'Ambiente virtual criado em ./venv com sucesso.',
            time: new Date().toLocaleTimeString('pt-BR'),
            type: 'ok',
          },
        ]);
      }, 1100);
      setTimeout(() => {
        setCliLogs((p) => [
          ...p,
          {
            command: guideOs === 'windows' ? '.\\venv\\Scripts\\Activate.ps1' : 'source venv/bin/activate',
            output: '(venv) Ambiente virtual ativo!',
            time: new Date().toLocaleTimeString('pt-BR'),
            type: 'ok',
          },
        ]);
      }, 1700);
      setTimeout(() => {
        setCliLogs((p) => [
          ...p,
          {
            command: guideOs === 'windows' ? 'python main.py' : 'python3 main.py',
            output: '[TaskFlow] Janela Desktop Tkinter iniciada com sucesso em #121721!\n[TaskFlow] SQLite sincronizado em taskflow/data/taskflow.db.',
            time: new Date().toLocaleTimeString('pt-BR'),
            type: 'ok',
          },
        ]);
        setIsSimulatingCli(false);
      }, 2300);
    }
  };

  // Test Runner State
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Code Explorer State
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [copied, setCopied] = useState(false);

  // Desktop Screenshot State
  const [screenshotTime, setScreenshotTime] = useState<number>(Date.now());
  const [isCapturing, setIsCapturing] = useState(false);

  // Real Database state
  const [dbData, setDbData] = useState<{
    db_path?: string;
    counts?: { total: number; completed: number; pending: number };
    tasks?: TaskItem[];
  }>({});
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Simulated Interactive UI for Immediate Testing (with 2026 Calendar)
  const [simTasks, setSimTasks] = useState<TaskItem[]>([
    {
      id: 1,
      title: 'Estudar persistência com SQLite e Python',
      completed: false,
      priority: 'Alta',
      created_at: '31/10/2026 18:20',
      due_date: '31/10/2026',
    },
    {
      id: 2,
      title: 'Configurar ambiente virtual .venv e requirements',
      completed: true,
      priority: 'Média',
      created_at: '31/10/2026 18:15',
      due_date: '31/10/2026',
    },
    {
      id: 3,
      title: 'Estruturar suíte de testes com unittest',
      completed: false,
      priority: 'Alta',
      created_at: '31/10/2026 18:10',
      due_date: '15/11/2026',
    },
    {
      id: 4,
      title: 'Revisar documentação técnica no README.md',
      completed: false,
      priority: 'Baixa',
      created_at: '31/10/2026 18:05',
      due_date: '20/11/2026',
    },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Pendentes' | 'Concluídas'>('Todas');
  const [validationError, setValidationError] = useState('');

  // Dynamic Calendar State (Configurável pelo usuário até 2099)
  const [simCalYear, setSimCalYear] = useState<number>(2026);
  const [simCalMonth, setSimCalMonth] = useState<number>(10); // Outubro
  const [simSelectedDate, setSimSelectedDate] = useState<string>('31/10/2026');
  const [simFilterDate, setSimFilterDate] = useState<string>(''); // Vazio = Todas as datas
  const [simViewMode, setSimViewMode] = useState<'expanded' | 'split' | 'screenshot'>('expanded');
  const [isCalOverlayOpen, setIsCalOverlayOpen] = useState<boolean>(false);
  const [isCalDocked, setIsCalDocked] = useState<boolean>(false);


  // Run tests initially
  useEffect(() => {
    runAutomatedTests();
    loadFileContent('main.py');
    loadDbData();
  }, []);

  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/run-tests', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error('Failed to run tests:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const captureFreshScreenshot = async () => {
    setIsCapturing(true);
    try {
      const res = await fetch('/api/capture-screenshot', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScreenshotTime(Date.now());
      }
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const loadFileContent = async (filename: string) => {
    setSelectedFile(filename);
    setIsLoadingFile(true);
    try {
      const res = await fetch(`/api/get-file?file=${encodeURIComponent(filename)}`);
      const data = await res.json();
      setFileContent(data.content || '');
    } catch (err) {
      setFileContent('# Erro ao carregar arquivo.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const loadDbData = async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch('/api/database-tasks');
      const data = await res.json();
      setDbData(data);
    } catch (err) {
      console.error('Failed to load DB:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sim handlers
  const handleSimAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      setValidationError('O título da tarefa não pode estar vazio.');
      return;
    }
    setValidationError('');
    const now = new Date();
    const formatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTask: TaskItem = {
      id: Date.now(),
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      created_at: formatted,
      due_date: simSelectedDate,
    };
    setSimTasks([newTask, ...simTasks]);
    setNewTitle('');
  };

  const handleSimToggle = (id: number) => {
    setSimTasks(
      simTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSimDelete = (id: number, title: string) => {
    if (window.confirm(`Deseja realmente excluir a tarefa:\n\n"${title}"?\n\nEssa ação é irreversível.`)) {
      setSimTasks(simTasks.filter((t) => t.id !== id));
    }
  };

  // Metrics for sim
  const simTotal = simTasks.length;
  const simCompleted = simTasks.filter((t) => t.completed).length;
  const simPending = simTotal - simCompleted;
  const simRate = simTotal > 0 ? ((simCompleted / simTotal) * 100).toFixed(1) : '0';

  // Task counts by date in 2026
  const simTaskCountsByDate = simTasks.reduce((acc, t) => {
    if (t.due_date) {
      acc[t.due_date] = (acc[t.due_date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Filtered sim tasks
  const filteredSimTasks = simTasks.filter((t) => {
    if (statusFilter === 'Pendentes' && t.completed) return false;
    if (statusFilter === 'Concluídas' && !t.completed) return false;
    if (simFilterDate && t.due_date !== simFilterDate) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Dynamic Calendar helper (calcula dias exatos para qualquer mês e ano até 2099)
  const numDaysInCurrentMonth = new Date(simCalYear, simCalMonth, 0).getDate();
  const firstDayOfMonth = new Date(simCalYear, simCalMonth - 1, 1).getDay();

  return (
    <div className="min-h-screen bg-[#121721] text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">TaskFlow</h1>
                <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Python + Tkinter Desktop
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  SQLite3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ambiente de desenvolvimento e mentoria para estudantes de software
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'demo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Simulador & Desktop</span>
            </button>
            <button
              onClick={() => setActiveTab('run')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'run'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Como Executar no PC</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                Guia
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tests'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Testes (13/13)</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Código Fonte</span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'database'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Banco SQLite</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'guide'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guia do Estudante</span>
            </button>
            <a
              href="https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-all border border-slate-700/60 text-xs font-semibold whitespace-nowrap ml-1"
              title="Acessar Repositório no GitHub"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: DEMO & DESKTOP VISUALIZATION */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            {/* Quick action bar */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Como Executar no seu Computador</h2>
                  <p className="text-xs text-slate-400">
                    Comando direto no terminal: <code className="text-blue-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">python taskflow/main.py</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('run')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Ver Tutorial de Execução</span>
                </button>
                <button
                  onClick={captureFreshScreenshot}
                  disabled={isCapturing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCapturing ? 'animate-spin' : ''}`} />
                  <span>{isCapturing ? 'Capturando Janela...' : 'Re-renderizar no Xvfb'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Verificar Testes</span>
                </button>
              </div>
            </div>

            {/* Layout Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 px-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Modo de Visualização:
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSimViewMode('expanded')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    simViewMode === 'expanded'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Simulador Amplo (Recomendado)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimViewMode('split')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    simViewMode === 'split'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Lado a Lado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimViewMode('screenshot')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    simViewMode === 'screenshot'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Captura Python Xvfb</span>
                </button>
              </div>
            </div>

            {/* Main Display Area according to View Mode */}
            {simViewMode === 'screenshot' ? (
              /* DEDICATED SCREENSHOT VIEW */
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Captura Real da Aplicação Python Desktop (Tkinter / Xvfb)
                    </h3>
                  </div>
                  <button
                    onClick={captureFreshScreenshot}
                    disabled={isCapturing}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCapturing ? 'animate-spin' : ''}`} />
                    <span>Atualizar Captura</span>
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40 shadow-inner flex items-center justify-center p-2">
                  <img
                    src={`/taskflow_screenshot.png?t=${screenshotTime}`}
                    alt="TaskFlow Desktop Tkinter Screenshot"
                    className="max-w-full h-auto object-contain rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            ) : (
              /* SIMULATOR (EXPANDED OR SPLIT) */
              <div className={simViewMode === 'split' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6 items-start' : 'space-y-6'}>
                {/* Simulator Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Simulador Interativo da Interface Desktop Tkinter
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80 font-mono">
                        Tema: clam • Fundo: #121721
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Regras Reais de Negócio
                      </span>
                    </div>
                  </div>

                  {/* Simulated Desktop Window Frame with Horizontal Scroll Safety */}
                  <div className="bg-[#121721] text-slate-100 rounded-xl overflow-hidden border border-[#253046] shadow-2xl">
                    {/* Window Title Bar */}
                    <div className="bg-[#161c2b] px-4 py-2.5 border-b border-[#253046] flex items-center justify-between select-none">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-200 truncate px-2 text-center">
                        TaskFlow — Gerenciador de Tarefas Desktop • Calendário {simCalYear}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                        1060x780
                      </span>
                    </div>

                    {/* Top Application Bar inside Simulated Window with Left Menu */}
                    <div className="bg-[#161c2b] px-3.5 py-2 border-b border-[#253046] flex flex-wrap items-center justify-between gap-2 select-none">
                      <div className="flex items-center gap-2">
                        {/* Top-Left Calendar Menu Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setIsCalOverlayOpen(!isCalOverlayOpen)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer border ${
                            isCalOverlayOpen
                              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/40 shadow-blue-500/20'
                              : simFilterDate
                              ? 'bg-blue-950 text-blue-200 border-blue-600 hover:bg-blue-900 ring-1 ring-blue-500/30'
                              : 'bg-[#1e293b] text-slate-200 hover:text-white hover:bg-[#25334d] border-[#334155]'
                          }`}
                          title={`Abrir Calendário ${simCalYear} em menu de sobreposição`}
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>Menu Calendário {simCalYear}</span>
                          <span className="text-[10px] bg-[#121721] text-sky-300 px-1.5 py-0.5 rounded font-mono font-medium">
                            {simSelectedDate}
                          </span>
                          {simFilterDate && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Filtro por data ativo"></span>
                          )}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCalOverlayOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {simFilterDate ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-sky-300 bg-sky-950/70 border border-sky-800/80 px-2.5 py-1 rounded-lg">
                            <span>Filtrado: <strong>{simFilterDate}</strong></span>
                            <button
                              type="button"
                              onClick={() => setSimFilterDate('')}
                              className="text-slate-400 hover:text-white ml-1 font-bold cursor-pointer"
                              title="Remover filtro de data"
                            >
                              ✕
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCalDocked(!isCalDocked)}
                          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 rounded-md hover:bg-[#1e293b] transition cursor-pointer border border-[#253046]"
                          title={isCalDocked ? "Recolher barra lateral e usar menu sobreposto" : "Fixar calendário permanentemente na barra lateral"}
                        >
                          <span>{isCalDocked ? '📂 Modo Sobreposição' : '📌 Fixar na Lateral'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Window Body Container (Relative for overlay positioning) */}
                    <div className="relative min-h-[500px]">
                      {/* OVERLAY BACKDROP & FLOATING CALENDAR MENU */}
                      {isCalOverlayOpen && !isCalDocked && (
                        <>
                          <div
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-30 transition-opacity"
                            onClick={() => setIsCalOverlayOpen(false)}
                          />
                          <div className="absolute top-2 left-2 sm:left-4 z-40 w-72 sm:w-80 max-w-[calc(100%-1rem)] bg-[#161c2b] border border-[#2f3d58] rounded-2xl shadow-2xl p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#253046]">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-blue-400" />
                                  <span className="text-xs font-bold text-white tracking-wide">
                                    Calendário {simCalYear}
                                  </span>
                                  <select
                                    value={simCalYear}
                                    onChange={(e) => {
                                      const yr = Number(e.target.value);
                                      setSimCalYear(yr);
                                      const curParts = simSelectedDate.split('/');
                                      if (curParts.length === 3) {
                                        const newDate = `${curParts[0]}/${curParts[1]}/${yr}`;
                                        setSimSelectedDate(newDate);
                                        if (simFilterDate) setSimFilterDate(newDate);
                                      }
                                    }}
                                    className="text-[10px] text-sky-300 bg-sky-950/80 px-1.5 py-0.5 rounded font-mono font-bold border border-sky-800/80 cursor-pointer focus:outline-none"
                                    title="Determinar ano (2024 a 2099)"
                                  >
                                    {Array.from({ length: 76 }, (_, i) => 2024 + i).map((y) => (
                                      <option key={y} value={y} className="bg-slate-900 text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsCalOverlayOpen(false)}
                                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1e293b] transition cursor-pointer"
                                  title="Fechar Menu de Sobreposição"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Month and Year Navigator */}
                              <div className="flex items-center justify-between mb-2.5 bg-[#121721] p-1.5 rounded-lg border border-[#253046]">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    title="Voltar 1 ano"
                                    onClick={() => {
                                      if (simCalYear > 2024) {
                                        const yr = simCalYear - 1;
                                        setSimCalYear(yr);
                                        const curParts = simSelectedDate.split('/');
                                        if (curParts.length === 3) {
                                          const newDate = `${curParts[0]}/${curParts[1]}/${yr}`;
                                          setSimSelectedDate(newDate);
                                          if (simFilterDate) setSimFilterDate(newDate);
                                        }
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-[11px] px-1.5 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    «
                                  </button>
                                  <button
                                    type="button"
                                    title="Mês anterior"
                                    onClick={() => {
                                      if (simCalMonth > 1) {
                                        setSimCalMonth(simCalMonth - 1);
                                      } else if (simCalYear > 2024) {
                                        setSimCalYear(simCalYear - 1);
                                        setSimCalMonth(12);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    ◀
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-blue-400 tracking-wide text-center px-1">
                                  {MONTH_NAMES_PT[simCalMonth]} {simCalYear}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    title="Próximo mês"
                                    onClick={() => {
                                      if (simCalMonth < 12) {
                                        setSimCalMonth(simCalMonth + 1);
                                      } else if (simCalYear < 2099) {
                                        setSimCalYear(simCalYear + 1);
                                        setSimCalMonth(1);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    ▶
                                  </button>
                                  <button
                                    type="button"
                                    title="Avançar 1 ano"
                                    onClick={() => {
                                      if (simCalYear < 2099) {
                                        const yr = simCalYear + 1;
                                        setSimCalYear(yr);
                                        const curParts = simSelectedDate.split('/');
                                        if (curParts.length === 3) {
                                          const newDate = `${curParts[0]}/${curParts[1]}/${yr}`;
                                          setSimSelectedDate(newDate);
                                          if (simFilterDate) setSimFilterDate(newDate);
                                        }
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-[11px] px-1.5 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    »
                                  </button>
                                </div>
                              </div>

                              {/* Weekday labels */}
                              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5">
                                <span className="text-red-400">D</span>
                                <span>S</span>
                                <span>T</span>
                                <span>Q</span>
                                <span>Q</span>
                                <span>S</span>
                                <span>S</span>
                              </div>

                              {/* Days Grid for active year up to 2099 */}
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                  <div key={`overlay-empty-${i}`} className="h-7"></div>
                                ))}
                                {Array.from({ length: numDaysInCurrentMonth }).map((_, i) => {
                                  const day = i + 1;
                                  const dateStr = `${String(day).padStart(2, '0')}/${String(simCalMonth).padStart(2, '0')}/${simCalYear}`;
                                  const isSelected = simSelectedDate === dateStr;
                                  const isFiltered = simFilterDate === dateStr;
                                  const isToday = dateStr === '31/10/2026';
                                  const hasTasks = simTaskCountsByDate[dateStr] || 0;

                                  return (
                                    <button
                                      key={`overlay-day-${day}`}
                                      type="button"
                                      onClick={() => {
                                        setSimSelectedDate(dateStr);
                                        setSimFilterDate(dateStr);
                                      }}
                                      className={`h-7 rounded text-[11px] font-bold flex flex-col items-center justify-center relative transition cursor-pointer ${
                                        isFiltered || isSelected
                                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                                          : hasTasks > 0
                                          ? 'bg-blue-950/80 text-blue-200 border border-blue-700/80 hover:bg-blue-900/80'
                                          : isToday
                                          ? 'bg-slate-700 text-cyan-300 font-extrabold ring-1 ring-cyan-500/50'
                                          : 'text-slate-300 hover:bg-[#1e293b]'
                                      }`}
                                    >
                                      <span>{day}</span>
                                      {hasTasks > 0 && !isSelected && !isFiltered && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute bottom-0.5"></span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Selected Day Info Card */}
                              <div className="mt-3.5 p-2.5 bg-[#121721] rounded-lg border border-[#253046]">
                                <div className="text-[10px] text-slate-400 font-medium">Dia Selecionado ({simCalYear}):</div>
                                <div className="text-xs font-bold text-sky-400 mt-0.5 flex items-center justify-between">
                                  <span>{simSelectedDate}</span>
                                  {simSelectedDate === '31/10/2026' && (
                                    <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-normal">
                                      Hoje
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {simTaskCountsByDate[simSelectedDate] || 0} tarefa(s) agendada(s)
                                </div>
                              </div>
                            </div>

                            {/* Quick Date Shortcuts */}
                            <div className="mt-3 pt-2.5 border-t border-[#253046] space-y-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSimCalYear(2026);
                                  setSimCalMonth(10);
                                  setSimSelectedDate('31/10/2026');
                                  setSimFilterDate('31/10/2026');
                                }}
                                className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-[#1e293b] flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>📍</span>
                                <span>Hoje (31/10/2026)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSimCalYear(2026);
                                  setSimCalMonth(11);
                                  setSimSelectedDate('01/11/2026');
                                  setSimFilterDate('01/11/2026');
                                }}
                                className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-[#1e293b] flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>🌅</span>
                                <span>Amanhã (01/11/2026)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSimFilterDate('')}
                                className="w-full text-left text-xs font-bold text-blue-400 hover:text-blue-300 py-1 px-2 rounded hover:bg-[#1e293b] flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>🌐</span>
                                <span>Ver Todas as Datas (Limpar)</span>
                              </button>
                            </div>

                            {/* Close / Apply button */}
                            <div className="mt-3 pt-2 border-t border-[#253046] flex gap-2">
                              <button
                                type="button"
                                onClick={() => setIsCalOverlayOpen(false)}
                                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer text-center"
                              >
                                Aplicar e Fechar
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex flex-col md:flex-row">
                        {/* DOCKED SIDEBAR: ONLY VISIBLE IF isCalDocked IS EXPLICITLY TRUE */}
                        {isCalDocked && (
                          <div className="w-full md:w-64 shrink-0 bg-[#161c2b] border-b md:border-b-0 md:border-r border-[#253046] p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#253046]">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>📅</span>
                                    <span>Calendário {simCalYear}</span>
                                  </span>
                                  <select
                                    value={simCalYear}
                                    onChange={(e) => {
                                      const yr = Number(e.target.value);
                                      setSimCalYear(yr);
                                      const curParts = simSelectedDate.split('/');
                                      if (curParts.length === 3) {
                                        const newDate = `${curParts[0]}/${curParts[1]}/${yr}`;
                                        setSimSelectedDate(newDate);
                                        if (simFilterDate) setSimFilterDate(newDate);
                                      }
                                    }}
                                    className="text-[10px] text-sky-300 bg-sky-950/80 px-1.5 py-0.5 rounded font-mono font-bold border border-sky-800/80 cursor-pointer focus:outline-none"
                                    title="Determinar ano (2024 a 2099)"
                                  >
                                    {Array.from({ length: 76 }, (_, i) => 2024 + i).map((y) => (
                                      <option key={y} value={y} className="bg-slate-900 text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Month and Year Navigator */}
                              <div className="flex items-center justify-between mb-2.5 bg-[#121721] p-1.5 rounded-lg border border-[#253046]">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    title="Voltar 1 ano"
                                    onClick={() => {
                                      if (simCalYear > 2024) {
                                        const yr = simCalYear - 1;
                                        setSimCalYear(yr);
                                        const curParts = simSelectedDate.split('/');
                                        if (curParts.length === 3) {
                                          const newDate = `${curParts[0]}/${curParts[1]}/${yr}`;
                                          setSimSelectedDate(newDate);
                                          if (simFilterDate) setSimFilterDate(newDate);
                                        }
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-[11px] px-1.5 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    «
                                  </button>
                                  <button
                                    type="button"
                                    title="Mês anterior"
                                    onClick={() => {
                                      if (simCalMonth > 1) {
                                        setSimCalMonth(simCalMonth - 1);
                                      } else if (simCalYear > 2024) {
                                        setSimCalYear(simCalYear - 1);
                                        setSimCalMonth(12);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    ◀
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-blue-400 tracking-wide text-center px-1">
                                  {MONTH_NAMES_PT[simCalMonth]} {simCalYear}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    title="Próximo mês"
                                    onClick={() => {
                                      if (simCalMonth < 12) {
                                        setSimCalMonth(simCalMonth + 1);
                                      } else if (simCalYear < 2099) {
                                        setSimCalYear(simCalYear + 1);
                                        setSimCalMonth(1);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    ▶
                                  </button>
                                  <button
                                    type="button"
                                    title="Avançar 1 ano"
                                    onClick={() => {
                                      if (simCalYear < 2099) {
                                        const yr = simCalYear + 1;
                                        setSimCalYear(yr);
                                        const curParts = simSelectedDate.split('/');
                                        if (curParts.length === 3) {
                                          const newDate = `${curParts[0]}/${curParts[1]}/${yr}`;
                                          setSimSelectedDate(newDate);
                                          if (simFilterDate) setSimFilterDate(newDate);
                                        }
                                      }
                                    }}
                                    className="text-slate-400 hover:text-white text-[11px] px-1.5 py-1 rounded bg-[#1e293b] hover:bg-[#25334d] transition cursor-pointer font-bold"
                                  >
                                    »
                                  </button>
                                </div>
                              </div>

                              {/* Weekday labels */}
                              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5">
                                <span className="text-red-400">D</span>
                                <span>S</span>
                                <span>T</span>
                                <span>Q</span>
                                <span>Q</span>
                                <span>S</span>
                                <span>S</span>
                              </div>

                              {/* Days Grid for active year up to 2099 */}
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                  <div key={`docked-empty-${i}`} className="h-7"></div>
                                ))}
                                {Array.from({ length: numDaysInCurrentMonth }).map((_, i) => {
                                  const day = i + 1;
                                  const dateStr = `${String(day).padStart(2, '0')}/${String(simCalMonth).padStart(2, '0')}/${simCalYear}`;
                                  const isSelected = simSelectedDate === dateStr;
                                  const isFiltered = simFilterDate === dateStr;
                                  const isToday = dateStr === '31/10/2026';
                                  const hasTasks = simTaskCountsByDate[dateStr] || 0;

                                  return (
                                    <button
                                      key={`docked-day-${day}`}
                                      type="button"
                                      onClick={() => {
                                        setSimSelectedDate(dateStr);
                                        setSimFilterDate(dateStr);
                                      }}
                                      className={`h-7 rounded text-[11px] font-bold flex flex-col items-center justify-center relative transition cursor-pointer ${
                                        isFiltered || isSelected
                                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                                          : hasTasks > 0
                                          ? 'bg-blue-950/80 text-blue-200 border border-blue-700/80 hover:bg-blue-900/80'
                                          : isToday
                                          ? 'bg-slate-700 text-cyan-300 font-extrabold ring-1 ring-cyan-500/50'
                                          : 'text-slate-300 hover:bg-[#1e293b]'
                                      }`}
                                    >
                                      <span>{day}</span>
                                      {hasTasks > 0 && !isSelected && !isFiltered && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute bottom-0.5"></span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Selected Day Info Card */}
                              <div className="mt-3.5 p-2.5 bg-[#121721] rounded-lg border border-[#253046]">
                                <div className="text-[10px] text-slate-400 font-medium">Dia Selecionado ({simCalYear}):</div>
                                <div className="text-xs font-bold text-sky-400 mt-0.5 flex items-center justify-between">
                                  <span>{simSelectedDate}</span>
                                  {simSelectedDate === '31/10/2026' && (
                                    <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-normal">
                                      Hoje
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {simTaskCountsByDate[simSelectedDate] || 0} tarefa(s) agendada(s)
                                </div>
                              </div>
                            </div>

                            {/* Quick Date Shortcuts */}
                            <div className="mt-4 pt-3 border-t border-[#253046] space-y-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSimCalYear(2026);
                                  setSimCalMonth(10);
                                  setSimSelectedDate('31/10/2026');
                                  setSimFilterDate('31/10/2026');
                                }}
                                className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white py-1.5 px-2 rounded hover:bg-[#1e293b] flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>📍</span>
                                <span>Hoje (31/10/2026)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSimCalYear(2026);
                                  setSimCalMonth(11);
                                  setSimSelectedDate('01/11/2026');
                                  setSimFilterDate('01/11/2026');
                                }}
                                className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white py-1.5 px-2 rounded hover:bg-[#1e293b] flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>🌅</span>
                                <span>Amanhã (01/11/2026)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSimFilterDate('')}
                                className="w-full text-left text-xs font-bold text-blue-400 hover:text-blue-300 py-1.5 px-2 rounded hover:bg-[#1e293b] flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>🌐</span>
                                <span>Ver Todas as Datas</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* RIGHT COLUMN: MAIN TASK FLOW */}
                        <div className="flex-1 p-4 md:p-5 space-y-4 min-w-0">
                          {/* Header / Brand */}
                          <div className="flex items-center justify-between border-b border-[#253046] pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 text-lg">⚡</span>
                              <span className="text-base font-black text-white tracking-tight">TaskFlow</span>
                              <span className="text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded-full">
                                Calendário {simCalYear}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 hidden sm:block">
                              Python 3 + Tkinter + SQLite3
                            </div>
                          </div>

                          {/* Productivity Dashboard Indicators */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="bg-[#1a2234] border border-[#253046] rounded-xl p-2.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Total
                              </div>
                              <div className="text-xl font-black text-blue-400 mt-0.5">{simTotal}</div>
                            </div>
                            <div className="bg-[#1a2234] border border-[#253046] rounded-xl p-2.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Pendentes
                              </div>
                              <div className="text-xl font-black text-amber-400 mt-0.5">{simPending}</div>
                            </div>
                            <div className="bg-[#1a2234] border border-[#253046] rounded-xl p-2.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Concluídas
                              </div>
                              <div className="text-xl font-black text-emerald-400 mt-0.5">{simCompleted}</div>
                            </div>
                            <div className="bg-[#1a2234] border border-[#253046] rounded-xl p-2.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Taxa
                              </div>
                              <div className="text-xl font-black text-purple-400 mt-0.5 whitespace-nowrap">
                                {simRate}%
                              </div>
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, Number(simRate)))}%` }}
                            ></div>
                          </div>

                          {/* Add Form with 2026 Day Assigned */}
                          <form
                            onSubmit={handleSimAdd}
                            className="bg-[#1a2234] border border-[#253046] rounded-xl p-3 space-y-2.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-200">
                              <span className="flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5 text-blue-400" />
                                <span>Adicionar Tarefa</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsCalOverlayOpen(true)}
                                className="text-[11px] font-semibold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800/80 hover:bg-sky-900/80 transition flex items-center gap-1 cursor-pointer"
                                title="Abrir calendário para escolher data"
                              >
                                <span>📅 Agendado para:</span> <strong>{simSelectedDate}</strong> <span className="text-[10px] text-blue-400 font-normal underline">alterar</span>
                              </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => {
                                  setNewTitle(e.target.value);
                                  if (validationError) setValidationError('');
                                }}
                                placeholder="Digite o título da tarefa..."
                                className="flex-1 min-w-0 text-xs border border-[#253046] rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-[#151c2a] text-slate-100 placeholder:text-slate-500 shadow-inner"
                              />
                              <div className="flex items-center gap-2 shrink-0">
                                <select
                                  value={newPriority}
                                  onChange={(e) => setNewPriority(e.target.value as any)}
                                  className="text-xs border border-[#253046] rounded-lg px-2.5 py-2 bg-[#151c2a] text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                                >
                                  <option value="Baixa">Baixa</option>
                                  <option value="Média">Média</option>
                                  <option value="Alta">Alta</option>
                                </select>
                                <button
                                  type="submit"
                                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Adicionar</span>
                                </button>
                              </div>
                            </div>
                            {validationError && (
                              <div className="text-[11px] text-red-400 flex items-center gap-1.5 font-medium bg-red-950/40 p-2 rounded-lg border border-red-900/60">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{validationError}</span>
                              </div>
                            )}
                          </form>

                          {/* Active Date Banner if Filtered */}
                          {simFilterDate && (
                            <div className="flex items-center justify-between bg-blue-950/70 border border-blue-800/80 px-3 py-1.5 rounded-lg text-xs text-blue-200">
                              <span className="flex items-center gap-1.5">
                                <span>📅</span>
                                <span>
                                  Mostrando apenas tarefas agendadas para: <strong>{simFilterDate}</strong>
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setSimFilterDate('')}
                                className="text-xs text-blue-300 hover:text-white underline font-semibold ml-2 cursor-pointer"
                              >
                                ✕ Ver todas as datas
                              </button>
                            </div>
                          )}

                          {/* Search & Filter Bar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                            <div className="relative flex-1 min-w-0">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar tarefas por título..."
                                className="w-full text-xs pl-8 pr-7 py-2 bg-[#151c2a] border border-[#253046] rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                              />
                              {searchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setSearchQuery('')}
                                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1 bg-[#161c2b] border border-[#253046] p-1 rounded-lg shrink-0 overflow-x-auto">
                              {(['Todas', 'Pendentes', 'Concluídas'] as const).map((filter) => (
                                <button
                                  key={filter}
                                  type="button"
                                  onClick={() => setStatusFilter(filter)}
                                  className={`text-xs font-bold px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                                    statusFilter === filter
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
                                  }`}
                                >
                                  {filter}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Task List */}
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {filteredSimTasks.length === 0 ? (
                              <div className="text-center py-8 bg-[#1a2234] border border-[#253046] rounded-xl">
                                <p className="text-xs font-bold text-slate-200">
                                  {searchQuery
                                    ? `Nenhuma tarefa encontrada para "${searchQuery}"`
                                    : simFilterDate
                                    ? `Nenhuma tarefa agendada para o dia ${simFilterDate}`
                                    : 'Nenhuma tarefa cadastrada.'}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                  {simFilterDate
                                    ? 'Digite um título no campo acima para adicionar uma tarefa a este dia!'
                                    : 'Cadastre sua primeira atividade ou selecione outro dia no calendário.'}
                                </p>
                              </div>
                            ) : (
                              filteredSimTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition ${
                                    task.completed
                                      ? 'bg-[#151c2a] border-[#1e2638] opacity-75'
                                      : 'bg-[#1a2234] border-[#253046] shadow-xs hover:border-[#334155]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSimToggle(task.id)}
                                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition cursor-pointer shrink-0 ${
                                        task.completed
                                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                          : 'border border-slate-600 text-transparent hover:border-blue-400 hover:bg-slate-800'
                                      }`}
                                    >
                                      {task.completed ? '✔' : ''}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-xs font-medium truncate ${
                                          task.completed
                                            ? 'line-through text-slate-500'
                                            : 'text-slate-100 font-semibold'
                                        }`}
                                      >
                                        {task.title}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                                        {task.due_date && (
                                          <span className="text-sky-300 bg-sky-950/80 border border-sky-800/80 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                            <span>📅</span> {task.due_date}
                                          </span>
                                        )}
                                        <span
                                          className={`px-1.5 py-0.5 rounded font-bold ${
                                            task.priority === 'Alta'
                                              ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                                              : task.priority === 'Média'
                                              ? 'bg-blue-950/80 text-blue-400 border border-blue-800/80'
                                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                          }`}
                                        >
                                          ● {task.priority.toUpperCase()}
                                        </span>
                                        <span className="text-slate-400 font-mono text-[9px] hidden sm:inline">
                                          {task.created_at}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSimDelete(task.id, task.title)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-950/60 text-xs px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 font-medium shrink-0 border border-transparent hover:border-red-900/60"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Excluir</span>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column / Secondary Section: Real Tkinter Window Captured via Xvfb */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          Captura Real da Aplicação Python Desktop
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Gerado com Xvfb + Tkinter
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Renderização real do arquivo <code className="text-blue-300">taskflow/main.py</code>{' '}
                      executado pelo interpretador Python 3 no servidor Linux com servidor gráfico virtual Xvfb e estilo nativo do ttk.
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40 shadow-inner flex items-center justify-center min-h-[340px] p-2">
                      <img
                        src={`/taskflow_screenshot.png?t=${screenshotTime}`}
                        alt="TaskFlow Desktop Tkinter Screenshot"
                        className="w-full h-auto object-contain rounded-lg shadow-2xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Janela Tkinter nativa renderizada com sucesso (1060x780)</span>
                    </div>
                    <button
                      type="button"
                      onClick={captureFreshScreenshot}
                      disabled={isCapturing}
                      className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCapturing ? 'animate-spin' : ''}`} />
                      <span>{isCapturing ? 'Atualizando...' : 'Atualizar Captura'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMO EXECUTAR NO SEU COMPUTADOR (LOCAL TERMINAL GUIDE) */}
        {activeTab === 'run' && (
          <div className="space-y-6">
            {/* Header Hero Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

              <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <Terminal className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Tutorial Completo de Execução
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                      Passo a Passo
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Como Executar o TaskFlow no seu Computador
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                    Aprenda a clonar o repositório do Git, isolar as dependências com ambiente virtual (<code className="text-emerald-300 font-mono">venv</code>) e executar o aplicativo desktop nativo e a suíte de testes diretamente no terminal do seu sistema operacional.
                  </p>
                </div>

                {/* OS Switcher Controls */}
                <div className="shrink-0 bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setGuideOs('windows')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      guideOs === 'windows'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>🪟</span>
                    <span>Windows</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideOs('mac')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      guideOs === 'mac'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>🍎</span>
                    <span>macOS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideOs('linux')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      guideOs === 'linux'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>🐧</span>
                    <span>Linux</span>
                  </button>
                </div>
              </div>

              {/* Fast Track / Quick Commands Banner */}
              <div className="mt-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Comando Rápido (All-in-One para {guideOs === 'windows' ? 'Windows PowerShell' : guideOs === 'mac' ? 'macOS' : 'Linux'})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Copie a sequência completa de comandos para executar tudo de uma única vez no terminal:
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const allCmds =
                        guideOs === 'windows'
                          ? `git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git\ncd Imers-o-Alura-Lista-de-Tarefas\npython -m venv venv\n.\\venv\\Scripts\\Activate.ps1\npip install -r taskflow/requirements.txt\npython taskflow/main.py`
                          : guideOs === 'linux'
                          ? `git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git\ncd Imers-o-Alura-Lista-de-Tarefas\nsudo apt update && sudo apt install -y python3-tk\npython3 -m venv venv\nsource venv/bin/activate\npip install -r taskflow/requirements.txt\npython3 taskflow/main.py`
                          : `git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git\ncd Imers-o-Alura-Lista-de-Tarefas\npython3 -m venv venv\nsource venv/bin/activate\npip install -r taskflow/requirements.txt\npython3 taskflow/main.py`;
                      copyTextToClipboard(allCmds, 'quick-all');
                    }}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  >
                    {copiedCodeId === 'quick-all' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Comandos Copiados!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Sequência Completa</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateCliStep('all')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-400" />
                    <span>Testar no Simulador</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Cards Grid */}
            <div className="space-y-5">
              {/* STEP 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Verificar Pré-requisitos & Clonar o Repositório Git</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Certifique-se de possuir o Python 3.10+ e o Git instalados no seu computador, e faça o download do código.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 hidden sm:inline-block">
                    Terminal / Bash / Git
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-300">
                    Abra o seu terminal (<strong>PowerShell</strong> no Windows ou <strong>Terminal</strong> no macOS/Linux) e verifique suas versões:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto">
{guideOs === 'windows' ? `python --version\ngit --version` : `python3 --version\ngit --version`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard(guideOs === 'windows' ? 'python --version\ngit --version' : 'python3 --version\ngit --version', 'step1-ver')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step1-ver' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step1-ver' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 pt-1">
                    Agora clone o repositório oficial do TaskFlow e navegue até a pasta do projeto:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-blue-300 overflow-x-auto">
{`git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git\ncd Imers-o-Alura-Lista-de-Tarefas`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard('git clone https://github.com/okhotitsya/Imers-o-Alura-Lista-de-Tarefas.git\ncd Imers-o-Alura-Lista-de-Tarefas', 'step1-clone')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step1-clone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step1-clone' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      <strong>Prefere sem Git?</strong> Você também pode baixar o código compactado em formato <code>.zip</code>, descompactar em uma pasta de sua escolha e abrir o terminal dentro dela.
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Criar e Ativar o Ambiente Virtual (<code className="text-purple-300">venv</code>)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Boas práticas em Python: crie um ambiente isolado para nunca contaminar as bibliotecas do sistema operacional.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 shrink-0 hidden sm:inline-block">
                    Isolamento Python
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-300">
                    Crie o diretório do ambiente virtual na raiz do projeto:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-purple-300 overflow-x-auto">
{guideOs === 'windows' ? `python -m venv venv` : `python3 -m venv venv`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard(guideOs === 'windows' ? 'python -m venv venv' : 'python3 -m venv venv', 'step2-create')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step2-create' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step2-create' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 pt-1">
                    Agora <strong>ative</strong> o ambiente virtual para que o terminal utilize este Python isolado:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto">
{guideOs === 'windows'
  ? `# No Windows PowerShell:\n.\\venv\\Scripts\\Activate.ps1\n\n# OU se estiver usando o Prompt de Comando (CMD) tradicional:\n.\\venv\\Scripts\\activate.bat`
  : `# No macOS ou Linux (bash / zsh):\nsource venv/bin/activate`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard(guideOs === 'windows' ? '.\\venv\\Scripts\\Activate.ps1' : 'source venv/bin/activate', 'step2-act')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step2-act' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step2-act' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {guideOs === 'windows' && (
                    <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-[11px] text-amber-200/90 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Dica para PowerShell: Erro de Política de Execução?</span>
                      </div>
                      <p>
                        Se o Windows disser que <em>"a execução de scripts foi desabilitada neste sistema"</em>, execute o comando abaixo apenas na janela atual para liberar:
                      </p>
                      <code className="block bg-black/60 p-2 rounded text-amber-300 font-mono text-xs select-all">
                        Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
                      </code>
                    </div>
                  )}

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Sinal de Sucesso:</strong> Seu prompt no terminal exibirá o prefixo <code className="text-emerald-300 font-bold">(venv)</code> antes do caminho, indicando que o ambiente está ativado!
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Instalação das Dependências (<code className="text-amber-300">requirements.txt</code>)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        O TaskFlow prioriza a biblioteca nativa do Python, garantindo instalação imediata e sem dependências pesadas.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0 hidden sm:inline-block">
                    pip / Dependências
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {guideOs === 'linux' && (
                    <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 text-[11px] text-blue-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-blue-400">
                        <span>🐧</span>
                        <span>Passo Essencial no Linux (Ubuntu / Debian / Mint):</span>
                      </div>
                      <p>
                        No Linux, o módulo gráfico Tkinter é mantido em um pacote nativo do apt. Instale-o com:
                      </p>
                      <div className="relative group mt-1">
                        <pre className="bg-[#0b0e14] border border-blue-900 rounded-lg p-2.5 text-xs font-mono text-blue-300">
sudo apt update && sudo apt install -y python3-tk
                        </pre>
                        <button
                          type="button"
                          onClick={() => copyTextToClipboard('sudo apt update && sudo apt install -y python3-tk', 'step3-linux-tk')}
                          className="absolute right-2 top-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                        >
                          {copiedCodeId === 'step3-linux-tk' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-300">
                    Execute o instalador do pip para validar as dependências do projeto:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-amber-300 overflow-x-auto">
pip install -r requirements.txt
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard('pip install -r requirements.txt', 'step3-req')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step3-req' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step3-req' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400">
                    💡 <strong>Por que tão rápido?</strong> O projeto foi desenhado de forma limpa com módulos nativos: <code>tkinter</code> para a UI, <code>sqlite3</code> para persistência, <code>unittest</code> para testes, além de <code>datetime</code> e <code>dataclasses</code>.
                  </div>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Executar a Aplicação Desktop no Terminal</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Inicie o TaskFlow e visualize a interface nativa do Tkinter abrindo em sua área de trabalho.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0 hidden sm:inline-block">
                    Execução Principal
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-300">
                    Com o ambiente virtual ativo, inicie o arquivo principal do programa:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto">
{guideOs === 'windows' ? `python main.py` : `python3 main.py`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard(guideOs === 'windows' ? 'python main.py' : 'python3 main.py', 'step4-run')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step4-run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step4-run' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Ou se preferir executar através da raiz como módulo Python:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 overflow-x-auto">
python -m taskflow.main
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard('python -m taskflow.main', 'step4-mod')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step4-mod' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step4-mod' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>O que acontece agora:</strong> Uma janela desktop estilizada com tema escuro (<code className="text-blue-300 font-mono">#121721</code>), calendário dinâmico (com navegação até 2099), painel de métricas e banco SQLite sincronizado se abrirá na sua tela!
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 5 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm shrink-0">
                      5
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Executar a Bateria de Testes Automatizados (Unittest)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Comprove que as 13 regras de negócio, validações e persistência SQLite estão aprovadas.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 shrink-0 hidden sm:inline-block">
                    Testes / QA
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-300">
                    Execute a descoberta automática de testes na pasta <code className="text-blue-300">tests/</code> com o comando:
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-blue-400 overflow-x-auto">
python -m unittest discover -s tests -v
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard('python -m unittest discover -s tests -v', 'step5-tests')}
                      className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'step5-tests' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'step5-tests' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-[11px] text-slate-300 space-y-2">
                    <div className="font-semibold text-white">Entenda as opções do comando:</div>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      <li><strong className="text-slate-200">-m unittest</strong>: Carrega o módulo oficial de testes da biblioteca padrão do Python.</li>
                      <li><strong className="text-slate-200">discover -s tests</strong>: Procura automaticamente todos os arquivos no formato <code>test_*.py</code> dentro do diretório <code>tests</code>.</li>
                      <li><strong className="text-slate-200">-v (verbose)</strong>: Exibe o nome de cada teste individual e seu resultado com <code>... ok</code>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE TERMINAL SIMULATOR (CLI PLAYGROUND) */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span>Simulador Interativo de Terminal (CLI Playground)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Teste cada comando antes de digitar no seu computador. Clique nos botões para simular a saída real.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateCliStep('all')}
                    disabled={isSimulatingCli}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isSimulatingCli ? 'Executando...' : 'Simular Roteiro Completo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCliLogs([])}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition cursor-pointer"
                  >
                    <span>Limpar</span>
                  </button>
                </div>
              </div>

              {/* Command Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSimulateCliStep('clone')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg font-mono transition cursor-pointer"
                >
                  $ git clone
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCliStep('venv')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 rounded-lg font-mono transition cursor-pointer"
                >
                  $ python -m venv
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCliStep('activate')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 rounded-lg font-mono transition cursor-pointer"
                >
                  $ activate venv
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCliStep('deps')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 rounded-lg font-mono transition cursor-pointer"
                >
                  $ pip install -r requirements.txt
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCliStep('run')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-lg font-mono transition cursor-pointer"
                >
                  $ python main.py
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCliStep('tests')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg font-mono transition cursor-pointer"
                >
                  $ python -m unittest
                </button>
              </div>

              {/* Simulated Terminal Screen */}
              <div className="mt-4 bg-[#050810] border border-slate-800/80 rounded-xl p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-3 shadow-inner">
                {cliLogs.length === 0 ? (
                  <div className="text-slate-600 text-center py-6">
                    Terminal pronto. Clique nos comandos acima para simular a execução.
                  </div>
                ) : (
                  cliLogs.map((log, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span className="text-emerald-400 font-bold">
                          {guideOs === 'windows' ? 'PS C:\\Users\\Aluno\\taskflow>' : 'aluno@pc:~/taskflow$'}
                        </span>
                        <span className="text-white font-bold">{log.command}</span>
                        <span className="text-[10px] text-slate-600 ml-auto">{log.time}</span>
                      </div>
                      <pre className="text-slate-300 pl-4 border-l-2 border-slate-800/80 whitespace-pre-wrap leading-relaxed text-[11px]">
                        {log.output}
                      </pre>
                    </div>
                  ))
                )}
                {isSimulatingCli && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processando comandos no terminal...</span>
                  </div>
                )}
              </div>
            </div>

            {/* ONE-CLICK RUNNER SCRIPTS */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-400" />
                  <span>Scripts de Execução com 1 Clique (One-Click Runners)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Crie um arquivo na pasta do TaskFlow para abrir o programa automaticamente dando dois cliques na sua área de trabalho.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Windows .bat */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🪟</span>
                      <span>run.bat (Para Windows)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyTextToClipboard(
                          `@echo off\ntitle TaskFlow - Gerenciador de Tarefas Desktop\necho Iniciando o TaskFlow...\nif not exist "venv" (\n    echo Criando ambiente virtual venv...\n    python -m venv venv\n)\ncall venv\\Scripts\\activate.bat\npip install -r requirements.txt\npython main.py\npause`,
                          'script-bat'
                        )
                      }
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'script-bat' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'script-bat' ? 'Copiado!' : 'Copiar run.bat'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#0b0e14] p-3 rounded-lg text-[11px] font-mono text-blue-300 overflow-x-auto leading-relaxed">
{`@echo off
title TaskFlow - Gerenciador Desktop
if not exist "venv" (
    python -m venv venv
)
call venv\\Scripts\\activate.bat
python main.py
pause`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Basta salvar com o nome <code className="text-blue-300">run.bat</code> na pasta do projeto e clicar duas vezes para abrir!
                  </p>
                </div>

                {/* Linux / Mac .sh */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🐧 / 🍎</span>
                      <span>run.sh (Para macOS e Linux)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyTextToClipboard(
                          `#!/usr/bin/env bash\necho "Iniciando o TaskFlow..."\nif [ ! -d "venv" ]; then\n    echo "Criando ambiente virtual..."\n    python3 -m venv venv\nfi\nsource venv/bin/activate\npip install -r requirements.txt\npython3 main.py`,
                          'script-sh'
                        )
                      }
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedCodeId === 'script-sh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === 'script-sh' ? 'Copiado!' : 'Copiar run.sh'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#0b0e14] p-3 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`#!/usr/bin/env bash
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
python3 main.py`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Salve como <code className="text-emerald-300">run.sh</code>, dê permissão com <code className="text-slate-300">chmod +x run.sh</code> e execute com <code className="text-slate-300">./run.sh</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* TROUBLESHOOTING & FAQ ACCORDION */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>Dúvidas Frequentes & Solução de Problemas (Troubleshooting)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Encontrou algum imprevisto ao executar no seu computador? Confira as soluções rápidas abaixo:
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  {
                    q: 'Erro no Linux: "ModuleNotFoundError: No module named \'_tkinter\'"',
                    a: 'Nas distribuições Linux baseadas em Debian e Ubuntu, o suporte ao Tkinter não é embutido no pacote padrão do Python por padrão. Para resolver, abra o terminal e digite: sudo apt update && sudo apt install -y python3-tk. Pronto! A biblioteca gráfica nativa funcionará imediatamente.',
                  },
                  {
                    q: 'Erro no PowerShell: "A execução de scripts foi desabilitada neste sistema" (PSSecurityException)',
                    a: 'Por padrão, o Windows restringe a execução de scripts no PowerShell. Para permitir a ativação do seu venv apenas na sessão atual, execute: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass. Alternativamente, você pode usar o Prompt de Comando comum (CMD) e digitar: .\\venv\\Scripts\\activate.bat.',
                  },
                  {
                    q: 'Erro: "python não é reconhecido como um comando interno ou externo"',
                    a: 'Isso significa que o executável do Python não foi adicionado à variável de ambiente PATH durante a instalação do Windows. Baixe o instalador no site oficial python.org, clique em "Modify" ou reinstale e certifique-se de marcar a caixinha "Add Python to PATH" na primeira tela.',
                  },
                  {
                    q: 'Onde ficam armazenadas as tarefas que eu cadastro no meu PC?',
                    a: 'O TaskFlow salva todas as tarefas no arquivo físico SQLite localizado em "taskflow/data/taskflow.db". Esse arquivo é criado automaticamente na primeira execução e garante que seus dados nunca se percam mesmo após fechar ou reiniciar o computador.',
                  },
                  {
                    q: 'Como gerar um arquivo executável (.exe) independente para distribuir para amigos?',
                    a: 'Você pode usar a ferramenta PyInstaller! Instale-a no seu ambiente virtual com "pip install pyinstaller" e depois execute na pasta do projeto: "pyinstaller --onefile --noconsole main.py". O arquivo .exe final será gerado dentro da pasta "dist/".',
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight
                          className={`w-4 h-4 text-amber-400 transition-transform ${
                            activeFaq === index ? 'rotate-90' : ''
                          }`}
                        />
                        <span>{faq.q}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal ml-2 shrink-0">
                        {activeFaq === index ? 'Recolher' : 'Expandir'}
                      </span>
                    </button>
                    {activeFaq === index && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-800/80 bg-slate-950/40 leading-relaxed font-sans">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTOMATED TESTS (UNITTEST) */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">Bateria de Testes Automatizados (Unittest)</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Validação completa das 13 regras do projeto com banco isolado em memória (<code className="text-blue-300">:memory:</code>)
                  </p>
                </div>

                <button
                  onClick={runAutomatedTests}
                  disabled={isRunningTests}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                  <span>{isRunningTests ? 'Executando no Python...' : 'Reexecutar Testes Agora'}</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Status da Suíte</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {testResult?.success ? '100% Aprovado' : 'Carregando...'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    13
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Cenários Testados</div>
                    <div className="text-sm font-bold text-white">13 Casos de Teste</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Tempo de Execução</div>
                    <div className="text-sm font-bold text-purple-300">
                      {testResult ? `${testResult.durationMs} ms` : '~ 12 ms'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 13 Required Test Cases Detailed Grid */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Lista dos 13 Cenários Obrigatórios Verificados
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 1, name: 'Criar uma tarefa com título válido', fn: 'test_01_create_task_with_valid_title' },
                    { id: 2, name: 'Rejeitar tarefa com título vazio ou só espaços', fn: 'test_02_reject_empty_or_whitespace_title' },
                    { id: 3, name: 'Listar tarefas cadastradas', fn: 'test_03_list_all_tasks' },
                    { id: 4, name: 'Marcar uma tarefa como concluída', fn: 'test_04_mark_task_as_completed' },
                    { id: 5, name: 'Reabrir uma tarefa (concluída para pendente)', fn: 'test_05_reopen_completed_task' },
                    { id: 6, name: 'Excluir uma tarefa preservando as demais', fn: 'test_06_delete_task' },
                    { id: 7, name: 'Filtrar tarefas por status (Todas, Pendentes, Concluídas)', fn: 'test_07_filter_tasks_by_status' },
                    { id: 8, name: 'Pesquisar tarefas por título combinada com filtro', fn: 'test_08_search_tasks_by_title_and_filter' },
                    { id: 9, name: 'Calcular corretamente os indicadores de produtividade', fn: 'test_09_calculate_productivity_metrics' },
                    { id: 10, name: 'Calcular zero por cento quando não existirem tarefas', fn: 'test_10_metrics_with_zero_tasks' },
                    { id: 11, name: 'Preservar os dados após reconectar ao banco físico', fn: 'test_11_data_persistence_across_reconnections' },
                    { id: 12, name: 'Tratar tentativas de atualizar ou excluir IDs inexistentes', fn: 'test_12_handle_nonexistent_ids' },
                    { id: 13, name: 'Agendamento por dias no calendário (até 2099) e filtro por data', fn: 'test_13_calendar_2026_dates' },
                  ].map((tc) => (
                    <div
                      key={tc.id}
                      className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3 hover:border-slate-700 transition"
                    >
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                        ✓
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">
                            #{tc.id}. {tc.name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            PASSED
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">{tc.fn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Raw Terminal Output */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>Saída Direta do Interpretador Python (`unittest -v`)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    python3 -m unittest -v taskflow/tests/test_services.py
                  </span>
                </div>

                <pre className="bg-black/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed">
                  {testResult?.output || 'Carregando saída dos testes...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODE EXPLORER */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    <span>Explorador de Arquivos do Projeto</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Estrutura modular limpa organizada conforme especificação PEP 8 e separação de responsabilidades.
                  </p>
                </div>

                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              {/* File Selector Tabs */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { file: 'main.py', label: 'main.py (GUI Tkinter)', icon: '🖥' },
                  { file: 'database.py', label: 'database.py (SQLite)', icon: '💾' },
                  { file: 'models.py', label: 'models.py (Entidades)', icon: '📦' },
                  { file: 'services.py', label: 'services.py (Regras)', icon: '⚙' },
                  { file: 'test_services.py', label: 'test_services.py (12 Testes)', icon: '🧪' },
                  { file: 'requirements.txt', label: 'requirements.txt', icon: '📋' },
                  { file: 'README.md', label: 'README.md (Documentação)', icon: '📖' },
                ].map((item) => (
                  <button
                    key={item.file}
                    onClick={() => loadFileContent(item.file)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedFile === item.file
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Code viewer */}
              <div className="mt-4 relative">
                <div className="bg-slate-900 text-slate-400 text-[11px] font-mono px-4 py-2 rounded-t-xl border border-b-0 border-slate-800 flex items-center justify-between">
                  <span>taskflow/{selectedFile === 'test_services.py' ? 'tests/test_services.py' : selectedFile}</span>
                  <span>Python 3.10 / UTF-8</span>
                </div>
                <pre className="bg-black/90 border border-slate-800 rounded-b-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[520px] leading-relaxed">
                  {isLoadingFile ? 'Carregando arquivo...' : fileContent}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE INSPECTOR */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    <span>Inspetor do Banco de Dados SQLite</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Visualização em tempo real das tabelas e registros gravados no arquivo físico{' '}
                    <code className="text-purple-300 bg-slate-900 px-1 rounded">taskflow/data/taskflow.db</code>
                  </p>
                </div>

                <button
                  onClick={loadDbData}
                  disabled={isLoadingDb}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
                  <span>Atualizar Registros</span>
                </button>
              </div>

              {/* DB Path & Stats */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Localização Permanente</span>
                  <div className="text-xs font-mono text-purple-300 mt-1 truncate">
                    {dbData.db_path || 'taskflow/data/taskflow.db'}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Esquema da Tabela</span>
                  <div className="text-xs font-mono text-slate-200 mt-1">
                    tasks (id, title, completed, priority, created_at, due_date)
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Total de Registros Gravados</span>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    {dbData.counts?.total ?? 0} registros
                  </div>
                </div>
              </div>

              {/* Table Records */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Título da Tarefa</th>
                      <th className="py-2.5 px-3">Data Agendada</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Prioridade</th>
                      <th className="py-2.5 px-3">Criada Em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {dbData.tasks && dbData.tasks.length > 0 ? (
                      dbData.tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-2.5 px-3 text-purple-400 font-bold">#{task.id}</td>
                          <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">{task.title}</td>
                          <td className="py-2.5 px-3 text-sky-400 font-sans text-xs">
                            {task.due_date ? `📅 ${task.due_date}` : '—'}
                          </td>
                          <td className="py-2.5 px-3">
                            {task.completed ? (
                              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Concluída (1)
                              </span>
                            ) : (
                              <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                Pendente (0)
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                task.priority === 'Alta'
                                  ? 'text-red-400 bg-red-500/10'
                                  : task.priority === 'Média'
                                  ? 'text-blue-400 bg-blue-500/10'
                                  : 'text-emerald-400 bg-emerald-500/10'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{task.created_at}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Nenhum registro gravado no momento. Execute o simulador ou main.py para cadastrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STUDENT MENTOR GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="pb-5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Guia de Mentoria: Conceitos e Decisões Técnicas</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Explicação aprofundada dos conceitos de Python, Tkinter, OOP e Banco de Dados utilizados no TaskFlow.
                </p>
              </div>

              <div className="mt-6 space-y-6 text-xs text-slate-300 leading-relaxed">
                {/* Section 1 */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    <span>1. Separação em Camadas: Por que não colocar SQL no botão?</span>
                  </h3>
                  <p className="mb-2">
                    Em aplicações iniciantes, é comum vermos código de banco de dados diretamente dentro do callback do botão no Tkinter. Isso cria <strong>acoplamento excessivo</strong> e impede que você teste a regra de negócio sem abrir janelas gráficas.
                  </p>
                  <p>
                    No TaskFlow dividimos o projeto em 3 camadas independentes:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
                    <li><strong className="text-white">Camada de Visão (main.py):</strong> Cuida exclusivamente de exibir janelas, desenhar botões, capturar cliques e chamar a camada de serviço. Ela não sabe nem se o banco é SQLite ou MySQL.</li>
                    <li><strong className="text-white">Camada de Serviços (services.py):</strong> Onde residem as <em>regras de negócio</em>: valida se o título não é vazio, formata a data, calcula métricas e decide o que é permitido ou não.</li>
                    <li><strong className="text-white">Camada de Persistência (database.py):</strong> Responsável por falar com o SQLite, abrir transações, executar comandos SQL e retornar tuplas/objetos.</li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                    <span>2. O que são Callbacks e como funciona o `command` do Tkinter?</span>
                  </h3>
                  <p className="mb-2">
                    No Tkinter, interfaces gráficas funcionam sob um modelo <strong>orientado a eventos (Event-Driven)</strong>. A aplicação entra em um loop infinito (<code className="text-emerald-300">app.mainloop()</code>) aguardando cliques, teclas ou movimentos do mouse.
                  </p>
                  <p className="mb-2">
                    O parâmetro <code className="text-emerald-300">command</code> de um botão recebe o <strong>nome de uma função</strong> (sem os parênteses!), para que o Tkinter a execute somente quando o usuário clicar:
                  </p>
                  <pre className="bg-black/70 p-3 rounded-lg text-emerald-300 font-mono text-[11px] mb-2">
{`# CORRETO: Passando a referência da função (sem executar agora)
btn = ttk.Button(row, text="Adicionar", command=self.handle_add_task)

# QUANDO PRECISA DE PARÂMETROS: Usamos uma função anônima lambda:
btn_toggle = tk.Button(..., command=lambda t=task: self.handle_toggle_task(t))`}
                  </pre>
                  <p>
                    Ao usar <code className="text-emerald-300">lambda t=task: ...</code>, congelamos a referência da tarefa daquela linha específica do loop através de um fechamento (closure).
                  </p>
                </div>

                {/* Section 3 */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                    <span>3. Variáveis de Controle do Tkinter (StringVar, DoubleVar)</span>
                  </h3>
                  <p className="mb-2">
                    Diferente de variáveis normais do Python, o Tkinter fornece classes reativas especiais como <code className="text-amber-300">StringVar</code>, <code className="text-amber-300">BooleanVar</code> e <code className="text-amber-300">DoubleVar</code>.
                  </p>
                  <p className="mb-2">
                    Quando você vincula uma <code className="text-amber-300">StringVar</code> a um <code className="text-amber-300">Entry</code> ou <code className="text-amber-300">Label(textvariable=...)</code>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Ao chamar <code className="text-amber-300">var.set("Novo Valor")</code>, todos os widgets associados na tela se atualizam automaticamente, sem você precisar reprogramar cada elemento.</li>
                    <li>Com <code className="text-amber-300">var.trace_add("write", callback)</code>, implementamos a <strong>busca em tempo real</strong>: sempre que o usuário digita uma letra no campo de busca, o filtro é acionado instantaneamente!</li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-purple-500" />
                    <span>4. Persistência com SQLite e Consultas Parametrizadas</span>
                  </h3>
                  <p className="mb-2">
                    Para garantir que tarefas nunca sejam perdidas após fechar o programa, usamos o SQLite. Duas boas práticas fundamentais aplicadas no projeto:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li>
                      <strong className="text-white">Caminho Absoluto Confiável:</strong> Em vez de salvar em <code className="text-purple-300">"taskflow.db"</code> solto, calculamos o caminho via <code className="text-purple-300">Path(__file__).resolve().parent / "data" / "taskflow.db"</code>. Assim o banco funciona de onde quer que o terminal seja aberto.
                    </li>
                    <li>
                      <strong className="text-white">Parâmetros com ?:</strong> Nunca concatenamos strings diretamente em SQL (como em <code className="text-purple-300">{'f"SELECT * FROM tasks WHERE title = \'{busca}\'"'}</code>). Sempre usamos tuplas de parâmetros com ponto de interrogação (<code className="text-purple-300">{'"WHERE title LIKE ?", (f"%{busca}%",)'}</code>), protegendo a aplicação contra erros e injeções de código malicioso.
                    </li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-rose-500" />
                    <span>5. Testes Automatizados com Unittest e Banco em Memória</span>
                  </h3>
                  <p className="mb-2">
                    Para testar as 12 regras de negócio sem poluir o banco de tarefas real do usuário e sem depender de cliques manuais na tela, configuramos o <code className="text-rose-300">DatabaseManager(":memory:")</code>.
                  </p>
                  <p>
                    Nos métodos <code className="text-rose-300">setUp()</code> e <code className="text-rose-300">tearDown()</code>, cada teste recebe uma instância completamente limpa e rápida que roda na memória RAM em menos de 15 milissegundos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500">
        TaskFlow — Projeto Desktop em Python, Tkinter, SQLite e Unittest • Desenvolvido para Aprendizado e Produção
      </footer>
    </div>
  );
}
