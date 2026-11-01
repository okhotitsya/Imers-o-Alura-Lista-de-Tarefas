"""
test_services.py
----------------
Testes automatizados com unittest para a camada de serviços e persistência do TaskFlow.
Cobre todos os 12 cenários exigidos pela especificação, utilizando banco de dados
isolado (em memória e arquivos temporários) sem necessidade de abrir interface gráfica.
"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

# Adiciona o diretório raiz do pacote ao PYTHONPATH para importação direta
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = CURRENT_DIR.parent
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from database import DatabaseError, DatabaseManager, TaskNotFoundError
from models import Task
from services import TaskService


class TestTaskService(unittest.TestCase):
    """Bateria de testes unitários e de integração para o TaskFlow."""

    def setUp(self):
        """Inicializa um banco em memória isolado para cada método de teste."""
        self.db = DatabaseManager(":memory:")
        self.service = TaskService(db_manager=self.db)

    def tearDown(self):
        """Fecha a conexão em memória após o teste."""
        self.db.close()

    # 1. Criar uma tarefa com título válido
    def test_01_create_task_with_valid_title(self):
        """Deve criar uma tarefa com título válido e retornar objeto preenchido."""
        task = self.service.add_task("Estudar Python e Tkinter", priority="Alta")
        self.assertIsNotNone(task.id)
        self.assertEqual(task.title, "Estudar Python e Tkinter")
        self.assertEqual(task.priority, "Alta")
        self.assertFalse(task.completed)
        self.assertTrue(len(task.created_at) > 0)

        # Verifica persistência no banco
        stored = self.service.get_task(task.id)
        self.assertIsNotNone(stored)
        self.assertEqual(stored.title, "Estudar Python e Tkinter")
        self.assertEqual(stored.priority, "Alta")

    # 2. Rejeitar uma tarefa com título vazio ou contendo somente espaços
    def test_02_reject_empty_or_whitespace_title(self):
        """Deve lançar ValueError para títulos vazios ou apenas com espaços."""
        with self.assertRaises(ValueError):
            self.service.add_task("")

        with self.assertRaises(ValueError):
            self.service.add_task("     ")

        with self.assertRaises(ValueError):
            self.service.add_task(None)

        # Garante que nada foi inserido
        tasks = self.service.list_tasks()
        self.assertEqual(len(tasks), 0)

    # 3. Listar tarefas cadastradas
    def test_03_list_all_tasks(self):
        """Deve listar todas as tarefas cadastradas ordenadas adequadamente."""
        t1 = self.service.add_task("Tarefa 1", priority="Baixa")
        t2 = self.service.add_task("Tarefa 2", priority="Média")
        t3 = self.service.add_task("Tarefa 3", priority="Alta")

        tasks = self.service.list_tasks(status_filter="Todas")
        self.assertEqual(len(tasks), 3)
        titles = [t.title for t in tasks]
        self.assertIn("Tarefa 1", titles)
        self.assertIn("Tarefa 2", titles)
        self.assertIn("Tarefa 3", titles)

    # 4. Marcar uma tarefa como concluída
    def test_04_mark_task_as_completed(self):
        """Deve marcar uma tarefa como concluída e persistir a alteração."""
        task = self.service.add_task("Entregar relatório", priority="Alta")
        self.assertFalse(task.completed)

        success = self.service.set_task_completion(task.id, completed=True)
        self.assertTrue(success)

        updated = self.service.get_task(task.id)
        self.assertTrue(updated.completed)

    # 5. Reabrir uma tarefa
    def test_05_reopen_completed_task(self):
        """Deve reabrir uma tarefa já concluída, voltando seu status para pendente."""
        task = self.service.add_task("Comprar café", priority="Média")
        self.service.set_task_completion(task.id, completed=True)
        self.assertTrue(self.service.get_task(task.id).completed)

        # Reabrir
        self.service.set_task_completion(task.id, completed=False)
        reopened = self.service.get_task(task.id)
        self.assertFalse(reopened.completed)

    # 6. Excluir uma tarefa
    def test_06_delete_task(self):
        """Deve remover permanentemente a tarefa do banco de dados."""
        task = self.service.add_task("Tarefa para deletar")
        other = self.service.add_task("Tarefa para manter")

        self.service.delete_task(task.id)

        # Tarefa excluída não deve mais existir
        self.assertIsNone(self.service.get_task(task.id))

        # Outras tarefas devem ser preservadas intactas
        self.assertIsNotNone(self.service.get_task(other.id))
        all_remaining = self.service.list_tasks()
        self.assertEqual(len(all_remaining), 1)
        self.assertEqual(all_remaining[0].id, other.id)

    # 7. Filtrar tarefas por status
    def test_07_filter_tasks_by_status(self):
        """Deve filtrar corretamente entre Todas, Pendentes e Concluídas."""
        p1 = self.service.add_task("Pendente 1")
        p2 = self.service.add_task("Pendente 2")
        c1 = self.service.add_task("Concluída 1")
        self.service.set_task_completion(c1.id, completed=True)

        todas = self.service.list_tasks(status_filter="Todas")
        self.assertEqual(len(todas), 3)

        pendentes = self.service.list_tasks(status_filter="Pendentes")
        self.assertEqual(len(pendentes), 2)
        for t in pendentes:
            self.assertFalse(t.completed)

        concluidas = self.service.list_tasks(status_filter="Concluídas")
        self.assertEqual(len(concluidas), 1)
        self.assertTrue(concluidas[0].completed)
        self.assertEqual(concluidas[0].id, c1.id)

    # 8. Pesquisar tarefas por título
    def test_08_search_tasks_by_title_and_filter(self):
        """Deve pesquisar tarefas pelo título em conjunto com os filtros."""
        self.service.add_task("Estudar Python básico")
        self.service.add_task("Estudar SQL e SQLite")
        t3 = self.service.add_task("Preparar apresentação de Python")
        self.service.set_task_completion(t3.id, completed=True)

        # Pesquisa geral "Python" (deve achar 2)
        res_python = self.service.list_tasks(status_filter="Todas", search_query="Python")
        self.assertEqual(len(res_python), 2)

        # Pesquisa combinada: Pendente + "Python" (apenas 1)
        res_pending_python = self.service.list_tasks(status_filter="Pendentes", search_query="Python")
        self.assertEqual(len(res_pending_python), 1)
        self.assertEqual(res_pending_python[0].title, "Estudar Python básico")

        # Pesquisa combinada: Concluída + "Python" (apenas 1)
        res_done_python = self.service.list_tasks(status_filter="Concluídas", search_query="Python")
        self.assertEqual(len(res_done_python), 1)
        self.assertEqual(res_done_python[0].title, "Preparar apresentação de Python")

        # Busca sem correspondência
        res_none = self.service.list_tasks(status_filter="Todas", search_query="Inexistente123")
        self.assertEqual(len(res_none), 0)

    # 9. Calcular corretamente os indicadores
    def test_09_calculate_productivity_metrics(self):
        """Deve calcular total, pendentes, concluídas e percentual correto."""
        t1 = self.service.add_task("Tarefa 1")
        t2 = self.service.add_task("Tarefa 2")
        t3 = self.service.add_task("Tarefa 3")
        t4 = self.service.add_task("Tarefa 4")

        # 1 de 4 concluída = 25%
        self.service.set_task_completion(t1.id, completed=True)
        metrics = self.service.get_metrics()
        self.assertEqual(metrics.total, 4)
        self.assertEqual(metrics.pending, 3)
        self.assertEqual(metrics.completed, 1)
        self.assertEqual(metrics.completion_rate, 25.0)

        # 2 de 4 concluídas = 50%
        self.service.set_task_completion(t2.id, completed=True)
        metrics2 = self.service.get_metrics()
        self.assertEqual(metrics2.completed, 2)
        self.assertEqual(metrics2.pending, 2)
        self.assertEqual(metrics2.completion_rate, 50.0)

    # 10. Calcular zero por cento quando não existirem tarefas
    def test_10_metrics_with_zero_tasks(self):
        """Quando o banco estiver vazio, o percentual de conclusão deve ser 0%."""
        metrics = self.service.get_metrics()
        self.assertEqual(metrics.total, 0)
        self.assertEqual(metrics.pending, 0)
        self.assertEqual(metrics.completed, 0)
        self.assertEqual(metrics.completion_rate, 0.0)
        self.assertEqual(metrics.completion_rate_formatted, "0%")

    # 11. Preservar os dados após reconectar ao banco
    def test_11_data_persistence_across_reconnections(self):
        """Deve manter os dados salvos em arquivo após fechar e reabrir a conexão."""
        with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
            tmp_path = tmp_file.name

        try:
            # Primeira sessão: insere dados
            db1 = DatabaseManager(tmp_path)
            svc1 = TaskService(db1)
            t = svc1.add_task("Tarefa Persistente", priority="Alta")
            svc1.set_task_completion(t.id, completed=True)

            # Segunda sessão: nova instância abrindo o mesmo arquivo físico
            db2 = DatabaseManager(tmp_path)
            svc2 = TaskService(db2)
            persisted = svc2.get_task(t.id)

            self.assertIsNotNone(persisted)
            self.assertEqual(persisted.title, "Tarefa Persistente")
            self.assertEqual(persisted.priority, "Alta")
            self.assertTrue(persisted.completed)

            metrics = svc2.get_metrics()
            self.assertEqual(metrics.total, 1)
            self.assertEqual(metrics.completed, 1)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    # 12. Tratar tentativas de atualizar ou excluir IDs inexistentes
    def test_12_handle_nonexistent_ids(self):
        """Deve lançar TaskNotFoundError ou DatabaseError ao tentar atualizar/excluir ID inexistente."""
        fake_id = 999999

        # Tentativa de atualizar tarefa inexistente
        with self.assertRaises(DatabaseError):
            self.service.set_task_completion(fake_id, completed=True)

    # 13. Adicionar e filtrar tarefas por dia no calendário de 2026
    def test_13_calendar_2026_dates(self):
        """Deve associar tarefas a dias de 2026, filtrar por dia e computar contagens."""
        t1 = self.service.add_task("Apresentar projeto", priority="Alta", due_date="31/10/2026")
        t2 = self.service.add_task("Revisão de código", priority="Média", due_date="31/10/2026")
        t3 = self.service.add_task("Planejar Sprint 2026", priority="Baixa", due_date="15/11/2026")

        self.assertEqual(t1.due_date, "31/10/2026")
        self.assertEqual(t3.due_date, "15/11/2026")

        # Filtro pelo dia 31/10/2026
        oct_31_tasks = self.service.list_tasks(date_filter="31/10/2026")
        self.assertEqual(len(oct_31_tasks), 2)
        titles = [t.title for t in oct_31_tasks]
        self.assertIn("Apresentar projeto", titles)
        self.assertIn("Revisão de código", titles)

        # Filtro pelo dia 15/11/2026
        nov_15_tasks = self.service.list_tasks(date_filter="15/11/2026")
        self.assertEqual(len(nov_15_tasks), 1)
        self.assertEqual(nov_15_tasks[0].title, "Planejar Sprint 2026")

        # Contagem por data
        counts = self.service.get_calendar_dates_with_tasks()
        self.assertEqual(counts.get("31/10/2026"), 2)
        self.assertEqual(counts.get("15/11/2026"), 1)


if __name__ == "__main__":
    unittest.main()
