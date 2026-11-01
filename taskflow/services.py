"""
services.py
-----------
Módulo de regras de negócio da aplicação TaskFlow.
Isola a lógica operacional tanto da interface gráfica (Tkinter) quanto
dos detalhes de persistência direta no banco de dados (SQLite).
"""

from datetime import datetime
from typing import List, Optional

from database import DatabaseManager, TaskNotFoundError
from models import PRIORITIES, ProductivityMetrics, Task


class TaskService:
    """
    Camada de serviços responsável por coordenar as operações de tarefas,
    validar dados de entrada e calcular indicadores de produtividade.
    """

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        """
        Inicializa o serviço de tarefas.

        Args:
            db_manager: Instância de DatabaseManager. Se omitido, instancia o gerenciador padrão.
        """
        self.db = db_manager if db_manager is not None else DatabaseManager()

    def add_task(
        self,
        title: str,
        priority: str = "Média",
        due_date: str = ""
    ) -> Task:
        """
        Cadastra uma nova tarefa no sistema após validação dos campos.

        Args:
            title: Título da atividade.
            priority: Nível de prioridade ('Baixa', 'Média' ou 'Alta').
            due_date: Data planejada no calendário (ex: '31/10/2026').

        Returns:
            Task: Objeto recém-criado com ID atribuído.

        Raises:
            ValueError: Se o título for vazio ou contiver apenas espaços em branco.
        """
        clean_title = (title or "").strip()
        if not clean_title:
            raise ValueError("O título da tarefa não pode estar vazio.")

        # Normaliza a prioridade
        norm_priority = (priority or "Média").strip().capitalize()
        if norm_priority in ("Media", "Média"):
            norm_priority = "Média"
        elif norm_priority not in PRIORITIES:
            norm_priority = "Média"

        # Timestamp legível no padrão brasileiro
        created_at = datetime.now().strftime("%d/%m/%Y %H:%M")

        # Normalização da data planejada (garante ano 2026 se omitido)
        clean_due_date = (due_date or "").strip()
        if clean_due_date:
            parts = clean_due_date.split("/")
            if len(parts) == 2:
                clean_due_date = f"{parts[0].zfill(2)}/{parts[1].zfill(2)}/2026"
            elif len(parts) == 3:
                clean_due_date = f"{parts[0].zfill(2)}/{parts[1].zfill(2)}/{parts[2]}"

        # Persistência no banco
        task_id = self.db.insert_task(
            title=clean_title,
            priority=norm_priority,
            created_at=created_at,
            due_date=clean_due_date
        )

        return Task(
            id=task_id,
            title=clean_title,
            completed=False,
            priority=norm_priority,
            created_at=created_at,
            due_date=clean_due_date
        )

    def list_tasks(
        self,
        status_filter: str = "Todas",
        search_query: str = "",
        date_filter: str = ""
    ) -> List[Task]:
        """
        Retorna a lista de tarefas filtrada por status, termo de pesquisa e dia do calendário.

        Args:
            status_filter: 'Todas', 'Pendentes' ou 'Concluídas'.
            search_query: Termo a pesquisar no título.
            date_filter: Data no formato 'DD/MM/YYYY' para filtrar por dia específico.
        """
        # Garante filtro válido
        valid_filters = ("Todas", "Pendentes", "Concluídas")
        normalized_filter = status_filter if status_filter in valid_filters else "Todas"

        return self.db.fetch_all_tasks(
            status_filter=normalized_filter,
            search_query=search_query.strip(),
            date_filter=date_filter.strip()
        )

    def get_calendar_dates_with_tasks(self) -> dict:
        """Retorna mapa de contagem de tarefas por data para destacar dias no calendário."""
        return self.db.get_tasks_count_by_date()

    def get_task(self, task_id: int) -> Optional[Task]:
        """Recupera uma tarefa pelo ID."""
        return self.db.get_task_by_id(task_id)

    def set_task_completion(self, task_id: int, completed: bool) -> bool:
        """
        Marca uma tarefa como concluída ou reabre uma tarefa finalizada.

        Args:
            task_id: ID da tarefa.
            completed: True para concluir, False para reabrir (pendente).

        Returns:
            bool: True se atualizado com sucesso.

        Raises:
            TaskNotFoundError: Se o ID não existir.
        """
        return self.db.update_task_status(task_id, completed)

    def delete_task(self, task_id: int) -> bool:
        """
        Remove permanentemente uma tarefa cadastrada.

        Args:
            task_id: ID da tarefa a ser removida.

        Returns:
            bool: True se removida com sucesso.

        Raises:
            TaskNotFoundError: Se o ID não existir.
        """
        return self.db.delete_task(task_id)

    def get_metrics(self) -> ProductivityMetrics:
        """
        Calcula os 4 indicadores de produtividade sobre a totalidade das tarefas:
          1. Total de tarefas cadastradas.
          2. Tarefas pendentes.
          3. Tarefas concluídas.
          4. Percentual de conclusão: (concluídas / total) * 100.

        Quando total for 0, o percentual é 0.0%.
        Os indicadores independem dos filtros ativos de tela.
        """
        total, completed, pending = self.db.get_counts()

        if total == 0:
            rate = 0.0
        else:
            rate = round((completed / total) * 100.0, 1)

        return ProductivityMetrics(
            total=total,
            pending=pending,
            completed=completed,
            completion_rate=rate
        )
