// Bundled source code of the TaskFlow Python application for static deployments (e.g. Vercel)
import mainPy from '../taskflow/main.py?raw';
import databasePy from '../taskflow/database.py?raw';
import modelsPy from '../taskflow/models.py?raw';
import servicesPy from '../taskflow/services.py?raw';
import testServicesPy from '../taskflow/tests/test_services.py?raw';
import requirementsTxt from '../taskflow/requirements.txt?raw';
import readmeMd from '../README.md?raw';

export const TASKFLOW_SOURCE_FILES: Record<string, string> = {
  'main.py': mainPy,
  'database.py': databasePy,
  'models.py': modelsPy,
  'services.py': servicesPy,
  'test_services.py': testServicesPy,
  'requirements.txt': requirementsTxt,
  'README.md': readmeMd,
};

export const FALLBACK_TEST_RESULT = {
  success: true,
  durationMs: 14,
  totalTests: 13,
  output: `test_add_task_empty_title (test_services.TestTaskFlowBusinessRules) ... ok
test_add_task_success (test_services.TestTaskFlowBusinessRules) ... ok
test_completion_rate_calculation (test_services.TestTaskFlowBusinessRules) ... ok
test_count_metrics (test_services.TestTaskFlowBusinessRules) ... ok
test_database_file_persistence (test_services.TestTaskFlowBusinessRules) ... ok
test_delete_task (test_services.TestTaskFlowBusinessRules) ... ok
test_filter_by_date_2026 (test_services.TestTaskFlowBusinessRules) ... ok
test_filter_by_status (test_services.TestTaskFlowBusinessRules) ... ok
test_priority_filter_and_validation (test_services.TestTaskFlowBusinessRules) ... ok
test_reopen_task (test_services.TestTaskFlowBusinessRules) ... ok
test_search_filter (test_services.TestTaskFlowBusinessRules) ... ok
test_toggle_completion (test_services.TestTaskFlowBusinessRules) ... ok
test_update_task_title (test_services.TestTaskFlowBusinessRules) ... ok

----------------------------------------------------------------------
Ran 13 tests in 0.014s

OK`,
  testCases: [
    { name: 'test_add_task_empty_title', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_add_task_success', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_completion_rate_calculation', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_count_metrics', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_database_file_persistence', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_delete_task', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_filter_by_date_2026', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_filter_by_status', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_priority_filter_and_validation', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_reopen_task', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_search_filter', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_toggle_completion', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
    { name: 'test_update_task_title', module: 'test_services.TestTaskFlowBusinessRules', status: 'ok' },
  ],
};

export const FALLBACK_DB_DATA = {
  db_path: 'taskflow/data/taskflow.db',
  counts: { total: 4, completed: 1, pending: 3 },
  tasks: [
    {
      id: 1,
      title: 'Estudar persistência com SQLite e Python',
      completed: false,
      priority: 'Alta' as const,
      created_at: '31/10/2026 18:20',
      due_date: '31/10/2026',
    },
    {
      id: 2,
      title: 'Configurar ambiente virtual .venv e requirements',
      completed: true,
      priority: 'Média' as const,
      created_at: '31/10/2026 18:15',
      due_date: '31/10/2026',
    },
    {
      id: 3,
      title: 'Estruturar suíte de testes com unittest',
      completed: false,
      priority: 'Alta' as const,
      created_at: '31/10/2026 18:10',
      due_date: '15/11/2026',
    },
    {
      id: 4,
      title: 'Revisar documentação técnica no README.md',
      completed: false,
      priority: 'Baixa' as const,
      created_at: '31/10/2026 18:05',
      due_date: '20/11/2026',
    },
  ],
};
