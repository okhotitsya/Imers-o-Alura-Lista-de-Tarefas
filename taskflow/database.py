"""
database.py
-----------
Módulo de persistência e gerenciamento do banco de dados SQLite.
Responsável pela inicialização da tabela, execução de queries parametrizadas,
controle transacional e garantia de que os dados fiquem salvos em diretório seguro.
"""

import os
import sqlite3
from pathlib import Path
from typing import List, Optional, Tuple

from models import Task


class DatabaseError(Exception):
    """Exceção base para erros relacionados a operações no banco de dados."""
    pass


class TaskNotFoundError(DatabaseError):
    """Exceção lançada quando uma tarefa com o ID especificado não é encontrada."""
    pass


class DatabaseManager:
    """
    Gerenciador de conexões e operações no SQLite.

    Garante que a localização do banco não dependa apenas do terminal atual
    e oferece isolamento total para testes em memória (:memory:).
    """

    def __init__(self, db_path: Optional[str] = None):
        """
        Inicializa o gerenciador de banco de dados.

        Args:
            db_path: Caminho do arquivo .db ou ':memory:'.
                     Se for None, utiliza 'data/taskflow.db' dentro do diretório do projeto.
        """
        if db_path is None:
            # Garante que o banco seja salvo na pasta 'data' dentro de 'taskflow'
            base_dir = Path(__file__).resolve().parent
            data_dir = base_dir / "data"
            data_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = str(data_dir / "taskflow.db")
            self._is_memory = False
        else:
            self.db_path = db_path
            self._is_memory = (db_path == ":memory:")

        # Se for em memória, mantemos uma conexão persistente para os testes
        self._shared_memory_conn: Optional[sqlite3.Connection] = None
        if self._is_memory:
            self._shared_memory_conn = sqlite3.connect(":memory:")

        self.initialize_database()

    def get_connection(self) -> sqlite3.Connection:
        """
        Obtém uma conexão com o banco de dados.
        Para bancos em memória, reaproveita a mesma conexão ativa.
        """
        if self._is_memory and self._shared_memory_conn is not None:
            return self._shared_memory_conn

        conn = sqlite3.connect(self.db_path)
        # Ativa suporte a chaves estrangeiras por boa prática
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def close(self):
        """Fecha conexão em memória, se aplicável."""
        if self._shared_memory_conn is not None:
            self._shared_memory_conn.close()
            self._shared_memory_conn = None

    def initialize_database(self) -> None:
        """
        Cria a tabela de tarefas caso ainda não exista.
        Campos:
          - id: Inteiro com incremento automático (chave primária)
          - title: Título textual obrigatório
          - completed: Inteiro booleano (0 = pendente, 1 = concluída)
          - priority: Texto ('Baixa', 'Média' ou 'Alta')
          - created_at: Data e hora formatadas
          - due_date: Data específica no calendário (ex: '31/10/2026')
        """
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0,
            priority TEXT NOT NULL DEFAULT 'Média',
            created_at TEXT NOT NULL,
            due_date TEXT DEFAULT ''
        );
        """
        try:
            conn = self.get_connection()
            with conn:
                conn.execute(create_table_sql)
                # Migração defensiva: adiciona coluna due_date se a tabela já existia sem ela
                try:
                    conn.execute("ALTER TABLE tasks ADD COLUMN due_date TEXT DEFAULT '';")
                except sqlite3.OperationalError:
                    pass
            if not self._is_memory:
                conn.close()
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao inicializar o banco de dados: {e}") from e

    def insert_task(
        self,
        title: str,
        priority: str,
        created_at: str,
        due_date: str = ""
    ) -> int:
        """
        Insere uma nova tarefa no banco de dados.

        Args:
            title: Título da tarefa.
            priority: Nível de prioridade.
            created_at: Data de criação formatada.
            due_date: Data planejada no calendário (ex: '31/10/2026').

        Returns:
            int: O ID da tarefa recém-criada.
        """
        sql = """
        INSERT INTO tasks (title, completed, priority, created_at, due_date)
        VALUES (?, 0, ?, ?, ?);
        """
        try:
            conn = self.get_connection()
            with conn:
                cursor = conn.cursor()
                cursor.execute(sql, (title, priority, created_at, due_date))
                new_id = cursor.lastrowid
            if not self._is_memory:
                conn.close()
            return new_id
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao inserir tarefa: {e}") from e

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Recupera uma tarefa específica pelo seu ID.

        Returns:
            Instância de Task ou None se não existir.
        """
        sql = """
        SELECT id, title, completed, priority, created_at, due_date
        FROM tasks
        WHERE id = ?;
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (task_id,))
            row = cursor.fetchone()
            if not self._is_memory:
                conn.close()
            if row:
                return Task.from_row(row)
            return None
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao buscar tarefa #{task_id}: {e}") from e

    def fetch_all_tasks(
        self,
        status_filter: str = "Todas",
        search_query: str = "",
        date_filter: str = ""
    ) -> List[Task]:
        """
        Consulta tarefas no banco com suporte a filtros de status, busca textual e data no calendário.

        Args:
            status_filter: 'Todas', 'Pendentes' ou 'Concluídas'.
            search_query: Texto a ser buscado no título (ignora maiúsculas/minúsculas).
            date_filter: Data no formato 'DD/MM/YYYY' para filtrar tarefas de um dia específico de 2026.

        Returns:
            Lista de objetos Task ordenados por status (pendentes primeiro) e depois por id decrescente.
        """
        conditions = []
        params = []

        # Filtro de status
        if status_filter == "Pendentes":
            conditions.append("completed = 0")
        elif status_filter == "Concluídas":
            conditions.append("completed = 1")

        # Filtro de pesquisa textual
        clean_search = search_query.strip()
        if clean_search:
            conditions.append("title LIKE ?")
            params.append(f"%{clean_search}%")

        # Filtro por dia no calendário de 2026
        clean_date = date_filter.strip()
        if clean_date:
            conditions.append("due_date = ?")
            params.append(clean_date)

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        sql = f"""
        SELECT id, title, completed, priority, created_at, due_date
        FROM tasks
        {where_clause}
        ORDER BY completed ASC, id DESC;
        """

        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            if not self._is_memory:
                conn.close()
            return [Task.from_row(r) for r in rows]
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao listar tarefas: {e}") from e

    def get_tasks_count_by_date(self) -> dict:
        """
        Retorna a contagem de tarefas cadastradas agrupadas por data:
        ex: {'31/10/2026': 3, '01/11/2026': 1}
        """
        sql = """
        SELECT due_date, COUNT(*)
        FROM tasks
        WHERE due_date IS NOT NULL AND due_date != ''
        GROUP BY due_date;
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            rows = cursor.fetchall()
            if not self._is_memory:
                conn.close()
            return {row[0]: row[1] for row in rows}
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao obter contagens por data: {e}") from e

    def update_task_status(self, task_id: int, completed: bool) -> bool:
        """
        Atualiza o status de conclusão de uma tarefa.

        Args:
            task_id: ID da tarefa.
            completed: Novo status (True para concluída, False para pendente).

        Returns:
            True se a tarefa foi atualizada.
        Raises:
            TaskNotFoundError: se o ID não existir.
        """
        sql = "UPDATE tasks SET completed = ? WHERE id = ?;"
        try:
            conn = self.get_connection()
            with conn:
                cursor = conn.cursor()
                cursor.execute(sql, (1 if completed else 0, task_id))
                affected = cursor.rowcount
            if not self._is_memory:
                conn.close()

            if affected == 0:
                raise TaskNotFoundError(f"Tarefa com ID {task_id} não existe.")
            return True
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao atualizar status da tarefa #{task_id}: {e}") from e

    def delete_task(self, task_id: int) -> bool:
        """
        Remove permanentemente uma tarefa do banco.

        Args:
            task_id: ID da tarefa a ser excluída.

        Returns:
            True se a tarefa foi removida.
        Raises:
            TaskNotFoundError: se o ID não existir.
        """
        sql = "DELETE FROM tasks WHERE id = ?;"
        try:
            conn = self.get_connection()
            with conn:
                cursor = conn.cursor()
                cursor.execute(sql, (task_id,))
                affected = cursor.rowcount
            if not self._is_memory:
                conn.close()

            if affected == 0:
                raise TaskNotFoundError(f"Tarefa com ID {task_id} não existe.")
            return True
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao excluir tarefa #{task_id}: {e}") from e

    def get_counts(self) -> Tuple[int, int, int]:
        """
        Retorna a contagem geral de tarefas cadastradas no banco:
        (total, concluidas, pendentes).
        """
        sql = """
        SELECT
            COUNT(*),
            COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END), 0)
        FROM tasks;
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            row = cursor.fetchone()
            if not self._is_memory:
                conn.close()
            total, completed, pending = row
            return total, completed, pending
        except sqlite3.Error as e:
            raise DatabaseError(f"Erro ao obter estatísticas do banco: {e}") from e
