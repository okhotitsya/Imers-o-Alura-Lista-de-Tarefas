"""
models.py
---------
Módulo responsável pelas entidades de domínio do TaskFlow.
Define as classes de dados (dataclasses) para representação de tarefas
e métricas de produtividade.
"""

from dataclasses import dataclass
from typing import Optional, Tuple


# Lista de prioridades permitidas no sistema
PRIORITIES = ("Baixa", "Média", "Alta")


@dataclass
class Task:
    """
    Representa uma tarefa dentro do sistema TaskFlow.

    Atributos:
        id: Identificador único da tarefa (gerado pelo banco de dados).
        title: Descrição ou título da atividade.
        completed: Booleano indicando se a tarefa foi finalizada.
        priority: Nível de prioridade ('Baixa', 'Média' ou 'Alta').
        created_at: Data e hora de criação no formato 'DD/MM/YYYY HH:MM'.
        due_date: Data atribuída no calendário de 2026 no formato 'DD/MM/YYYY'.
    """
    title: str
    id: Optional[int] = None
    completed: bool = False
    priority: str = "Média"
    created_at: str = ""
    due_date: str = ""

    def __post_init__(self):
        """Validação e normalização dos dados após a instanciação."""
        if self.priority not in PRIORITIES:
            # Caso a prioridade venha com grafia diferente (ex: 'media' sem acento)
            normalized = self.priority.strip().capitalize()
            if normalized in ("Media", "Média"):
                self.priority = "Média"
            elif normalized in PRIORITIES:
                self.priority = normalized
            else:
                self.priority = "Média"

    @classmethod
    def from_row(cls, row: Tuple) -> "Task":
        """
        Cria uma instância de Task a partir de uma tupla retornada pelo SQLite.
        Ordem esperada da consulta: (id, title, completed, priority, created_at, due_date)
        """
        return cls(
            id=row[0],
            title=row[1],
            completed=bool(row[2]),
            priority=row[3],
            created_at=row[4],
            due_date=row[5] if len(row) > 5 and row[5] else ""
        )

    def to_dict(self) -> dict:
        """Converte o objeto para um dicionário legível."""
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
            "priority": self.priority,
            "created_at": self.created_at,
            "due_date": self.due_date
        }


@dataclass
class ProductivityMetrics:
    """
    Representa os indicadores de produtividade calculados para o painel.

    Atributos:
        total: Quantidade total de tarefas cadastradas.
        pending: Quantidade de tarefas ainda pendentes.
        completed: Quantidade de tarefas marcadas como concluídas.
        completion_rate: Percentual de conclusão (0.0 a 100.0).
    """
    total: int = 0
    pending: int = 0
    completed: int = 0
    completion_rate: float = 0.0

    @property
    def completion_rate_formatted(self) -> str:
        """Retorna o percentual formatado como texto (ex: '75.0%' ou '100%')."""
        if self.completion_rate.is_integer():
            return f"{int(self.completion_rate)}%"
        return f"{self.completion_rate:.1f}%"
