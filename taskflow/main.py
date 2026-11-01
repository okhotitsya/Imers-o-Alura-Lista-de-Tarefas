"""
main.py
-------
Ponto de entrada e interface gráfica (GUI) da aplicação TaskFlow.
Construída com Python nativo, Tkinter e ttk.
Inclui coluna lateral dedicada para gerenciamento de tarefas por dia com o calendário de 2026,
painel de métricas, cards de tarefas com estilo tachado, filtros, busca e caixas de diálogo nativas.
"""

import calendar
import sys
import tkinter as tk
from datetime import datetime
from pathlib import Path
from tkinter import font as tkfont
from tkinter import messagebox, ttk
from typing import Optional

# Garante que o diretório atual esteja no PYTHONPATH
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from database import DatabaseError, DatabaseManager, TaskNotFoundError
from models import PRIORITIES, ProductivityMetrics, Task
from services import TaskService


# Meses em português para o calendário de 2026
MONTH_NAMES = [
    "",
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
]


class TaskFlowApp(tk.Tk):
    """
    Janela principal da aplicação desktop TaskFlow.
    Gerencia a hierarquia de widgets do Tkinter, a coluna de calendário de 2026
    e conecta eventos da interface à camada de serviço (TaskService).
    """

    # Paleta de cores moderna e profissional em tema escuro (#121721)
    COLOR_BG = "#121721"             # Fundo da janela solicitado (#121721)
    COLOR_SURFACE = "#1a2234"        # Fundo de cards, caixas e painéis
    COLOR_SURFACE_ALT = "#161c2b"    # Fundo alternativo mais suave
    COLOR_PRIMARY = "#3b82f6"        # Azul de destaque vibrante (Primary Blue)
    COLOR_PRIMARY_HOVER = "#2563eb"  # Azul hover
    COLOR_TEXT_MAIN = "#f8fafc"      # Texto principal claro e legível (Slate 50)
    COLOR_TEXT_MUTED = "#94a3b8"     # Texto secundário suave (Slate 400)
    COLOR_BORDER = "#253046"         # Bordas dos cards e caixas
    COLOR_INPUT_BG = "#151c2a"       # Fundo de campos de entrada e busca

    # Cores de prioridade (Texto / Fundo / Borda) adaptadas ao tema escuro
    PRIORITY_COLORS = {
        "Baixa": {"fg": "#34d399", "bg": "#064e3b", "border": "#059669"},
        "Média": {"fg": "#60a5fa", "bg": "#1e3a8a", "border": "#2563eb"},
        "Alta": {"fg": "#f87171", "bg": "#7f1d1d", "border": "#dc2626"}
    }

    def __init__(self, service: Optional[TaskService] = None):
        super().__init__()

        # Camada de serviços e dados
        self.service = service if service is not None else TaskService()

        # Variáveis de controle de estado (Tkinter Variables)
        self.var_task_title = tk.StringVar()
        self.var_priority = tk.StringVar(value="Média")
        self.var_search = tk.StringVar()
        self.var_filter = tk.StringVar(value="Todas")

        # Variáveis do Calendário Dinâmico (Ano determinado pelo usuário até 2099)
        # Data de referência inicial: 31/10/2026
        self.cal_year = 2026
        self.cal_month = 10
        self.var_cal_year = tk.StringVar(value="2026")
        self.var_selected_date = tk.StringVar(value="31/10/2026")
        self.var_filter_date = tk.StringVar(value="")  # Vazio = todas as datas

        # Variáveis dos indicadores do painel
        self.var_stat_total = tk.StringVar(value="0")
        self.var_stat_pending = tk.StringVar(value="0")
        self.var_stat_completed = tk.StringVar(value="0")
        self.var_stat_rate = tk.StringVar(value="0%")
        self.var_progress_val = tk.DoubleVar(value=0.0)

        # Configurações da Janela
        self.title("TaskFlow — Gerenciador de Tarefas Desktop")
        self.geometry("1060x780")
        self.minsize(920, 620)
        self.configure(bg=self.COLOR_BG)

        # Configuração de fontes personalizadas
        self._setup_fonts()

        # Configuração de estilos do ttk
        self._setup_styles()

        # Componentes estruturais
        self._build_header()

        # Container principal com divisão em 2 colunas:
        # Coluna Esquerda: Calendário 2026 / Planejamento Diário
        # Coluna Direita: Dashboard, Formulário de Cadastro e Lista de Tarefas
        self.content_container = tk.Frame(self, bg=self.COLOR_BG)
        self.content_container.pack(fill="both", expand=True, padx=20, pady=(0, 6))

        self._build_calendar_column()
        self._build_main_task_column()

        self._build_status_bar()

        # Vincula busca dinâmica ao digitar
        self.var_search.trace_add("write", lambda *args: self.refresh_task_list())

        # Carga inicial dos dados
        self.refresh_all()

    def _setup_fonts(self):
        """Inicializa fontes tipográficas para garantir legibilidade e consistência."""
        self.font_title = tkfont.Font(family="Segoe UI", size=18, weight="bold")
        self.font_subtitle = tkfont.Font(family="Segoe UI", size=10)
        self.font_stat_number = tkfont.Font(family="Segoe UI", size=18, weight="bold")
        self.font_stat_label = tkfont.Font(family="Segoe UI", size=9, weight="bold")
        self.font_task_title = tkfont.Font(family="Segoe UI", size=11, weight="bold")
        self.font_task_completed = tkfont.Font(family="Segoe UI", size=11, overstrike=1)
        self.font_meta = tkfont.Font(family="Segoe UI", size=9)
        self.font_badge = tkfont.Font(family="Segoe UI", size=9, weight="bold")

    def _setup_styles(self):
        """Configura os estilos modernos do ttk."""
        self.style = ttk.Style(self)
        try:
            self.style.theme_use("clam")
        except tk.TclError:
            pass

        # Estilo para botões principais de ação
        self.style.configure(
            "Primary.TButton",
            font=("Segoe UI", 10, "bold"),
            background=self.COLOR_PRIMARY,
            foreground="#ffffff",
            padding=(14, 6),
            borderwidth=0
        )
        self.style.map(
            "Primary.TButton",
            background=[("active", self.COLOR_PRIMARY_HOVER), ("disabled", "#64748b")]
        )

        # Estilo para o campo de seleção (Combobox)
        self.style.configure(
            "TCombobox",
            font=("Segoe UI", 10),
            padding=4
        )

        # Barra de progresso visual
        self.style.configure(
            "Task.Horizontal.TProgressbar",
            troughcolor="#1e293b",
            background=self.COLOR_PRIMARY,
            thickness=6
        )

    # =========================================================================
    # CABEÇALHO SUPERIOR
    # =========================================================================

    def _build_header(self):
        """Constrói o cabeçalho superior com título, badge e subtítulo."""
        header_frame = tk.Frame(self, bg=self.COLOR_BG, padx=24, pady=12)
        header_frame.pack(fill="x")

        title_row = tk.Frame(header_frame, bg=self.COLOR_BG)
        title_row.pack(anchor="w")

        lbl_icon = tk.Label(
            title_row,
            text="⚡",
            font=("Segoe UI", 16),
            bg=self.COLOR_BG,
            fg=self.COLOR_PRIMARY
        )
        lbl_icon.pack(side="left", padx=(0, 6))

        lbl_title = tk.Label(
            title_row,
            text="TaskFlow",
            font=self.font_title,
            bg=self.COLOR_BG,
            fg=self.COLOR_TEXT_MAIN
        )
        lbl_title.pack(side="left")

        self.lbl_badge = tk.Label(
            title_row,
            text=f"DESKTOP • CALENDÁRIO {self.cal_year}",
            font=("Segoe UI", 8, "bold"),
            bg="#1e293b",
            fg="#60a5fa",
            padx=7,
            pady=2
        )
        self.lbl_badge.pack(side="left", padx=(10, 0))

        lbl_subtitle = tk.Label(
            header_frame,
            text="Organize suas tarefas diárias, agende por data até 2099 e acompanhe sua produtividade.",
            font=self.font_subtitle,
            bg=self.COLOR_BG,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_subtitle.pack(anchor="w", pady=(2, 0))

    # =========================================================================
    # COLUNA ESQUERDA: CALENDÁRIO DE 2026 / DIAS
    # =========================================================================

    def _build_calendar_column(self):
        """Constrói a coluna lateral com o calendário interativo de 2026."""
        self.cal_frame = tk.Frame(
            self.content_container,
            bg=self.COLOR_SURFACE,
            highlightbackground=self.COLOR_BORDER,
            highlightthickness=1,
            width=290,
            padx=14,
            pady=14
        )
        self.cal_frame.pack(side="left", fill="y", padx=(0, 14))
        self.cal_frame.pack_propagate(False)

        # Título da Coluna (Dinâmico com o ano determinado pelo usuário)
        self.lbl_cal_title = tk.Label(
            self.cal_frame,
            text=f"📅 Calendário {self.cal_year}",
            font=("Segoe UI", 11, "bold"),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MAIN
        )
        self.lbl_cal_title.pack(anchor="w")

        lbl_cal_sub = tk.Label(
            self.cal_frame,
            text="Selecione o ano até 2099 para planejar ou filtrar",
            font=("Segoe UI", 8),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_cal_sub.pack(anchor="w", pady=(0, 6))

        # Barra de Seleção e Navegação do Ano (2024 a 2099)
        year_row = tk.Frame(self.cal_frame, bg=self.COLOR_SURFACE)
        year_row.pack(fill="x", pady=(0, 6))

        btn_prev_year = tk.Button(
            year_row,
            text="«",
            font=("Segoe UI", 8, "bold"),
            bg="#1e293b",
            fg=self.COLOR_TEXT_MAIN,
            activebackground="#253046",
            activeforeground="#ffffff",
            bd=0,
            padx=7,
            pady=2,
            cursor="hand2",
            command=self.handle_prev_year
        )
        btn_prev_year.pack(side="left")

        lbl_year_tag = tk.Label(
            year_row,
            text="Ano:",
            font=("Segoe UI", 8, "bold"),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_year_tag.pack(side="left", padx=(4, 2))

        year_values = [str(y) for y in range(2024, 2100)]
        self.combo_year = ttk.Combobox(
            year_row,
            textvariable=self.var_cal_year,
            values=year_values,
            state="readonly",
            width=6,
            font=("Segoe UI", 8, "bold")
        )
        self.combo_year.pack(side="left", fill="x", expand=True, padx=2)
        self.combo_year.bind("<<ComboboxSelected>>", self.handle_year_selected)

        btn_next_year = tk.Button(
            year_row,
            text="»",
            font=("Segoe UI", 8, "bold"),
            bg="#1e293b",
            fg=self.COLOR_TEXT_MAIN,
            activebackground="#253046",
            activeforeground="#ffffff",
            bd=0,
            padx=7,
            pady=2,
            cursor="hand2",
            command=self.handle_next_year
        )
        btn_next_year.pack(side="right")

        # Barra de Navegação do Mês
        nav_row = tk.Frame(self.cal_frame, bg=self.COLOR_SURFACE)
        nav_row.pack(fill="x", pady=(0, 8))

        btn_prev = tk.Button(
            nav_row,
            text="◀",
            font=("Segoe UI", 9, "bold"),
            bg="#1e293b",
            fg=self.COLOR_TEXT_MAIN,
            activebackground="#253046",
            activeforeground="#ffffff",
            bd=0,
            padx=8,
            pady=3,
            cursor="hand2",
            command=self.handle_prev_month
        )
        btn_prev.pack(side="left")

        self.lbl_month_year = tk.Label(
            nav_row,
            text="",
            font=("Segoe UI", 9, "bold"),
            bg=self.COLOR_SURFACE,
            fg="#60a5fa"
        )
        self.lbl_month_year.pack(side="left", fill="x", expand=True)

        btn_next = tk.Button(
            nav_row,
            text="▶",
            font=("Segoe UI", 9, "bold"),
            bg="#1e293b",
            fg=self.COLOR_TEXT_MAIN,
            activebackground="#253046",
            activeforeground="#ffffff",
            bd=0,
            padx=8,
            pady=3,
            cursor="hand2",
            command=self.handle_next_month
        )
        btn_next.pack(side="right")

        # Container dos Dias da Semana e Matriz do Calendário
        self.cal_grid_frame = tk.Frame(self.cal_frame, bg=self.COLOR_SURFACE)
        self.cal_grid_frame.pack(fill="x")

        # Painel Informativo da Data Selecionada
        self.selected_info_box = tk.Frame(
            self.cal_frame,
            bg=self.COLOR_INPUT_BG,
            highlightbackground=self.COLOR_BORDER,
            highlightthickness=1,
            padx=10,
            pady=10
        )
        self.selected_info_box.pack(fill="x", pady=(14, 10))

        self.lbl_sel_date_title = tk.Label(
            self.selected_info_box,
            text=f"Dia Ativo ({self.cal_year}):",
            font=("Segoe UI", 8, "bold"),
            bg=self.COLOR_INPUT_BG,
            fg=self.COLOR_TEXT_MUTED
        )
        self.lbl_sel_date_title.pack(anchor="w")

        self.lbl_sel_date_val = tk.Label(
            self.selected_info_box,
            textvariable=self.var_selected_date,
            font=("Segoe UI", 12, "bold"),
            bg=self.COLOR_INPUT_BG,
            fg="#38bdf8"
        )
        self.lbl_sel_date_val.pack(anchor="w", pady=(2, 0))

        self.lbl_sel_date_count = tk.Label(
            self.selected_info_box,
            text="Carregando tarefas...",
            font=("Segoe UI", 8),
            bg=self.COLOR_INPUT_BG,
            fg=self.COLOR_TEXT_MUTED
        )
        self.lbl_sel_date_count.pack(anchor="w", pady=(2, 0))

        # Atalhos rápidos para dias
        shortcuts_box = tk.Frame(self.cal_frame, bg=self.COLOR_SURFACE)
        shortcuts_box.pack(fill="x", side="bottom", pady=(10, 0))

        lbl_quick = tk.Label(
            shortcuts_box,
            text="Atalhos Rápidos:",
            font=("Segoe UI", 8, "bold"),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_quick.pack(anchor="w", pady=(0, 4))

        btn_today = tk.Button(
            shortcuts_box,
            text="📍 Hoje (31/10/2026)",
            font=("Segoe UI", 8, "bold"),
            bg="#1e293b",
            fg=self.COLOR_TEXT_MAIN,
            activebackground="#253046",
            bd=0,
            pady=4,
            cursor="hand2",
            command=lambda: self.select_calendar_day("31/10/2026")
        )
        btn_today.pack(fill="x", pady=2)

        btn_tomorrow = tk.Button(
            shortcuts_box,
            text="🌅 Amanhã (01/11/2026)",
            font=("Segoe UI", 8),
            bg="#1e293b",
            fg=self.COLOR_TEXT_MAIN,
            activebackground="#253046",
            bd=0,
            pady=4,
            cursor="hand2",
            command=lambda: self.select_calendar_day("01/11/2026")
        )
        btn_tomorrow.pack(fill="x", pady=2)

        btn_all_dates = tk.Button(
            shortcuts_box,
            text="🌐 Ver Todas as Datas",
            font=("Segoe UI", 8, "bold"),
            bg="#253046",
            fg="#93c5fd",
            activebackground="#334155",
            bd=0,
            pady=5,
            cursor="hand2",
            command=self.clear_date_filter
        )
        btn_all_dates.pack(fill="x", pady=(4, 0))

    def render_calendar(self):
        """Desenha a grade de dias do mês e ano determinados pelo usuário (até 2099)."""
        for widget in self.cal_grid_frame.winfo_children():
            widget.destroy()

        # Atualiza títulos e indicadores com o ano ativo determinado pelo usuário
        if hasattr(self, "lbl_cal_title"):
            self.lbl_cal_title.config(text=f"📅 Calendário {self.cal_year}")
        if hasattr(self, "lbl_badge"):
            self.lbl_badge.config(text=f"DESKTOP • CALENDÁRIO {self.cal_year}")
        if hasattr(self, "lbl_sel_date_title"):
            self.lbl_sel_date_title.config(text=f"Dia Ativo ({self.cal_year}):")
        if hasattr(self, "lbl_db"):
            db_location = Path(self.service.db.db_path).name
            self.lbl_db.config(text=f"Ano: {self.cal_year} | Banco: {db_location}")

        month_label = f"{MONTH_NAMES[self.cal_month]} {self.cal_year}"
        self.lbl_month_year.config(text=month_label)
        self.var_cal_year.set(str(self.cal_year))

        # Cabeçalho dos dias da semana
        week_days = ["D", "S", "T", "Q", "Q", "S", "S"]
        for col_idx, day_name in enumerate(week_days):
            self.cal_grid_frame.columnconfigure(col_idx, weight=1, uniform="cal_col")
            lbl_wd = tk.Label(
                self.cal_grid_frame,
                text=day_name,
                font=("Segoe UI", 8, "bold"),
                bg=self.COLOR_SURFACE,
                fg="#64748b"
            )
            lbl_wd.grid(row=0, column=col_idx, pady=(0, 4))

        # Obter contagem de tarefas cadastradas por data
        task_counts = self.service.get_calendar_dates_with_tasks()

        # Matriz de semanas do calendário dinâmico para qualquer ano até 2099
        month_matrix = calendar.monthcalendar(self.cal_year, self.cal_month)
        active_date = self.var_selected_date.get()
        filter_date = self.var_filter_date.get()

        for row_idx, week in enumerate(month_matrix, start=1):
            for col_idx, day_num in enumerate(week):
                if day_num == 0:
                    lbl_empty = tk.Label(self.cal_grid_frame, text="", bg=self.COLOR_SURFACE)
                    lbl_empty.grid(row=row_idx, column=col_idx, padx=1, pady=1)
                    continue

                date_str = f"{str(day_num).zfill(2)}/{str(self.cal_month).zfill(2)}/{self.cal_year}"
                has_tasks = task_counts.get(date_str, 0)
                is_selected = (active_date == date_str)
                is_filtered = (filter_date == date_str)
                is_today = (date_str == "31/10/2026")

                # Estilização visual do botão do dia
                if is_filtered or is_selected:
                    btn_bg = self.COLOR_PRIMARY
                    btn_fg = "#ffffff"
                elif has_tasks > 0:
                    btn_bg = "#1e3a8a"
                    btn_fg = "#bfdbfe"
                elif is_today:
                    btn_bg = "#334155"
                    btn_fg = "#38bdf8"
                else:
                    btn_bg = "#151c2a"
                    btn_fg = self.COLOR_TEXT_MAIN

                # Texto do botão (inclui indicador se houver tarefas)
                label_text = f"{day_num}•" if has_tasks > 0 else str(day_num)

                btn_day = tk.Button(
                    self.cal_grid_frame,
                    text=label_text,
                    font=("Segoe UI", 8, "bold" if (is_selected or is_today) else "normal"),
                    bg=btn_bg,
                    fg=btn_fg,
                    activebackground=self.COLOR_PRIMARY_HOVER,
                    activeforeground="#ffffff",
                    relief="flat",
                    bd=0,
                    cursor="hand2",
                    padx=1,
                    pady=2,
                    command=lambda d=date_str: self.select_calendar_day(d)
                )
                btn_day.grid(row=row_idx, column=col_idx, padx=1, pady=1, sticky="nsew")

        # Atualiza a contagem no painel informativo da data
        cur_date = self.var_selected_date.get()
        cur_count = task_counts.get(cur_date, 0)
        self.lbl_sel_date_count.config(text=f"{cur_count} tarefa(s) para este dia")

    def handle_prev_month(self):
        """Navega para o mês anterior, retrocedendo o ano se necessário até 2024."""
        if self.cal_month > 1:
            self.cal_month -= 1
        else:
            if self.cal_year > 2024:
                self.cal_year -= 1
                self.cal_month = 12
        self.render_calendar()

    def handle_next_month(self):
        """Navega para o próximo mês, avançando o ano se necessário até 2099."""
        if self.cal_month < 12:
            self.cal_month += 1
        else:
            if self.cal_year < 2099:
                self.cal_year += 1
                self.cal_month = 1
        self.render_calendar()

    def handle_prev_year(self):
        """Recua um ano no calendário (mínimo: 2024)."""
        if self.cal_year > 2024:
            self.cal_year -= 1
            self.render_calendar()

    def handle_next_year(self):
        """Avança um ano no calendário (máximo: 2099)."""
        if self.cal_year < 2099:
            self.cal_year += 1
            self.render_calendar()

    def handle_year_selected(self, event=None):
        """Atualiza o calendário quando o usuário seleciona um ano na lista (até 2099)."""
        try:
            chosen = int(self.var_cal_year.get())
            if 2024 <= chosen <= 2099:
                self.cal_year = chosen
                self.render_calendar()
        except ValueError:
            pass

    def select_calendar_day(self, date_str: str):
        """Seleciona um dia específico do calendário e filtra a lista de tarefas."""
        self.var_selected_date.set(date_str)
        self.var_filter_date.set(date_str)

        # Ajusta mês e ano exibido caso selecione uma data de outro período
        parts = date_str.split("/")
        if len(parts) == 3:
            try:
                m = int(parts[1])
                y = int(parts[2])
                if 1 <= m <= 12:
                    self.cal_month = m
                if 2024 <= y <= 2099:
                    self.cal_year = y
            except ValueError:
                pass

        self.render_calendar()
        self.refresh_task_list()
        self.lbl_status.config(text=f'Mostrando tarefas para o dia {date_str} (Calendário {self.cal_year}).')

    def clear_date_filter(self):
        """Limpa o filtro de data para exibir tarefas de todas as datas."""
        self.var_filter_date.set("")
        self.render_calendar()
        self.refresh_task_list()
        self.lbl_status.config(text=f"Exibindo tarefas de todas as datas (Calendário {self.cal_year}).")

    # =========================================================================
    # COLUNA DIREITA: GERENCIADOR DE TAREFAS
    # =========================================================================

    def _build_main_task_column(self):
        """Constrói a coluna principal com métricas, formulário e lista."""
        self.task_col = tk.Frame(self.content_container, bg=self.COLOR_BG)
        self.task_col.pack(side="left", fill="both", expand=True)

        self._build_metrics_panel()
        self._build_add_task_form()
        self._build_search_and_filters()
        self._build_task_list_area()

    def _build_metrics_panel(self):
        """Constrói o painel com os 4 cards de produtividade e a barra de progresso."""
        container = tk.Frame(self.task_col, bg=self.COLOR_BG, pady=2)
        container.pack(fill="x")

        # Grid de cards com 4 colunas
        cards_grid = tk.Frame(container, bg=self.COLOR_BG)
        cards_grid.pack(fill="x")
        for i in range(4):
            cards_grid.columnconfigure(i, weight=1, uniform="stat_card")

        stats_config = [
            ("TOTAL DE TAREFAS", self.var_stat_total, "#60a5fa", 0),
            ("PENDENTES", self.var_stat_pending, "#fbbf24", 1),
            ("CONCLUÍDAS", self.var_stat_completed, "#34d399", 2),
            ("TAXA DE CONCLUSÃO", self.var_stat_rate, "#c084fc", 3),
        ]

        for label_text, var_value, color, col in stats_config:
            card = tk.Frame(
                cards_grid,
                bg=self.COLOR_SURFACE,
                highlightbackground=self.COLOR_BORDER,
                highlightthickness=1,
                padx=12,
                pady=8
            )
            card.grid(row=0, column=col, sticky="nsew", padx=3)

            lbl_title = tk.Label(
                card,
                text=label_text,
                font=self.font_stat_label,
                bg=self.COLOR_SURFACE,
                fg=self.COLOR_TEXT_MUTED
            )
            lbl_title.pack(anchor="w")

            lbl_num = tk.Label(
                card,
                textvariable=var_value,
                font=self.font_stat_number,
                bg=self.COLOR_SURFACE,
                fg=color
            )
            lbl_num.pack(anchor="w", pady=(2, 0))

        # Barra visual de progresso
        progress_box = tk.Frame(container, bg=self.COLOR_BG, pady=5)
        progress_box.pack(fill="x")

        self.progress_bar = ttk.Progressbar(
            progress_box,
            variable=self.var_progress_val,
            maximum=100.0,
            style="Task.Horizontal.TProgressbar"
        )
        self.progress_bar.pack(fill="x")

    def _build_add_task_form(self):
        """Constrói a área de cadastro com título, dia em 2026, prioridade e botão."""
        card = tk.Frame(
            self.task_col,
            bg=self.COLOR_SURFACE,
            highlightbackground=self.COLOR_BORDER,
            highlightthickness=1,
            padx=14,
            pady=10
        )
        card.pack(fill="x", pady=(6, 6))

        row_top = tk.Frame(card, bg=self.COLOR_SURFACE)
        row_top.pack(fill="x", pady=(0, 6))

        form_label = tk.Label(
            row_top,
            text="Adicionar Nova Tarefa por Data",
            font=("Segoe UI", 9, "bold"),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MAIN
        )
        form_label.pack(side="left")

        # Rótulo mostrando o dia do calendário associado
        lbl_date_hint = tk.Label(
            row_top,
            text="Dia Agendado:",
            font=("Segoe UI", 8, "bold"),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_date_hint.pack(side="left", padx=(16, 4))

        self.entry_date = tk.Entry(
            row_top,
            textvariable=self.var_selected_date,
            font=("Segoe UI", 9),
            bg=self.COLOR_INPUT_BG,
            fg="#38bdf8",
            insertbackground="#ffffff",
            relief="solid",
            bd=1,
            width=11,
            highlightthickness=0
        )
        self.entry_date.pack(side="left")

        # Linha inferior de inputs
        row = tk.Frame(card, bg=self.COLOR_SURFACE)
        row.pack(fill="x")

        self.entry_task = tk.Entry(
            row,
            textvariable=self.var_task_title,
            font=("Segoe UI", 10),
            bg=self.COLOR_INPUT_BG,
            fg=self.COLOR_TEXT_MAIN,
            insertbackground="#ffffff",
            relief="solid",
            bd=1,
            highlightthickness=0
        )
        self.entry_task.pack(side="left", fill="x", expand=True, ipady=5, padx=(0, 8))

        # Tecla Enter para cadastrar rapidamente
        self.entry_task.bind("<Return>", lambda event: self.handle_add_task())

        lbl_prio = tk.Label(
            row,
            text="Prioridade:",
            font=("Segoe UI", 9, "bold"),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_prio.pack(side="left", padx=(0, 4))

        self.combo_priority = ttk.Combobox(
            row,
            textvariable=self.var_priority,
            values=list(PRIORITIES),
            state="readonly",
            width=8
        )
        self.combo_priority.pack(side="left", padx=(0, 8))

        self.btn_add = ttk.Button(
            row,
            text="+ Adicionar",
            style="Primary.TButton",
            command=self.handle_add_task
        )
        self.btn_add.pack(side="left")

    def _build_search_and_filters(self):
        """Constrói a área de pesquisa e os filtros de status e data ativa."""
        bar = tk.Frame(self.task_col, bg=self.COLOR_BG, pady=4)
        bar.pack(fill="x")

        # Campo de pesquisa
        search_frame = tk.Frame(
            bar,
            bg=self.COLOR_INPUT_BG,
            highlightbackground=self.COLOR_BORDER,
            highlightthickness=1
        )
        search_frame.pack(side="left", fill="x", expand=True, padx=(0, 8))

        lbl_search_icon = tk.Label(
            search_frame,
            text="🔍",
            bg=self.COLOR_INPUT_BG,
            fg=self.COLOR_TEXT_MUTED,
            padx=6
        )
        lbl_search_icon.pack(side="left")

        self.entry_search = tk.Entry(
            search_frame,
            textvariable=self.var_search,
            font=("Segoe UI", 9),
            bg=self.COLOR_INPUT_BG,
            fg=self.COLOR_TEXT_MAIN,
            insertbackground="#ffffff",
            bd=0,
            highlightthickness=0
        )
        self.entry_search.pack(side="left", fill="x", expand=True, ipady=4)

        btn_clear_search = tk.Button(
            search_frame,
            text="✕",
            font=("Segoe UI", 8),
            bg=self.COLOR_INPUT_BG,
            fg=self.COLOR_TEXT_MUTED,
            bd=0,
            activebackground=self.COLOR_INPUT_BG,
            activeforeground="#ffffff",
            cursor="hand2",
            command=self.handle_clear_search
        )
        btn_clear_search.pack(side="right", padx=6)

        # Filtros de status (Todas | Pendentes | Concluídas)
        filter_box = tk.Frame(bar, bg=self.COLOR_BG)
        filter_box.pack(side="right")

        self.filter_buttons = {}
        for opt in ("Todas", "Pendentes", "Concluídas"):
            btn = tk.Button(
                filter_box,
                text=opt,
                font=("Segoe UI", 8, "bold"),
                relief="flat",
                bd=0,
                padx=10,
                pady=4,
                cursor="hand2",
                command=lambda f=opt: self.handle_set_filter(f)
            )
            btn.pack(side="left", padx=2)
            self.filter_buttons[opt] = btn

        self._update_filter_button_styles()

    def _update_filter_button_styles(self):
        """Atualiza a aparência dos botões de filtro para destacar o selecionado."""
        active_filter = self.var_filter.get()
        for opt, btn in self.filter_buttons.items():
            if opt == active_filter:
                btn.configure(
                    bg=self.COLOR_PRIMARY,
                    fg="#ffffff",
                    activebackground=self.COLOR_PRIMARY_HOVER,
                    activeforeground="#ffffff"
                )
            else:
                btn.configure(
                    bg="#1e293b",
                    fg="#94a3b8",
                    activebackground="#2a374f",
                    activeforeground="#f8fafc"
                )

    def _build_task_list_area(self):
        """Constrói a área rolável de tarefas."""
        list_container = tk.Frame(self.task_col, bg=self.COLOR_BG)
        list_container.pack(fill="both", expand=True, pady=(4, 0))

        self.canvas = tk.Canvas(
            list_container,
            bg=self.COLOR_BG,
            highlightthickness=0,
            bd=0
        )
        self.scrollbar = ttk.Scrollbar(
            list_container,
            orient="vertical",
            command=self.canvas.yview
        )

        self.scrollable_frame = tk.Frame(self.canvas, bg=self.COLOR_BG)

        self.canvas_window = self.canvas.create_window(
            (0, 0),
            window=self.scrollable_frame,
            anchor="nw"
        )

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.bind(
            "<Configure>",
            lambda e: self.canvas.itemconfig(self.canvas_window, width=e.width)
        )

        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        self.canvas.bind_all("<Button-4>", lambda e: self.canvas.yview_scroll(-1, "units"))
        self.canvas.bind_all("<Button-5>", lambda e: self.canvas.yview_scroll(1, "units"))

        self.canvas.configure(xscrollcommand=None, yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")

    def _on_mousewheel(self, event):
        """Rolagem suave com o scroll do mouse."""
        if sys.platform == "darwin":
            self.canvas.yview_scroll(int(-1 * event.delta), "units")
        else:
            self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def _build_status_bar(self):
        """Barra inferior informativa de status."""
        status_frame = tk.Frame(
            self,
            bg="#0d121c",
            highlightbackground=self.COLOR_BORDER,
            highlightthickness=1,
            padx=16,
            pady=4
        )
        status_frame.pack(fill="x", side="bottom")

        self.lbl_status = tk.Label(
            status_frame,
            text="Pronto.",
            font=self.font_meta,
            bg="#0d121c",
            fg=self.COLOR_TEXT_MUTED
        )
        self.lbl_status.pack(side="left")

        db_location = Path(self.service.db.db_path).name
        lbl_db = tk.Label(
            status_frame,
            text=f"Ano: 2026 | Banco: {db_location}",
            font=self.font_meta,
            bg="#0d121c",
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_db.pack(side="right")

    # =========================================================================
    # RENDERIZAÇÃO DA LISTA DE TAREFAS
    # =========================================================================

    def refresh_task_list(self):
        """Limpa e recria os cards visuais das tarefas conforme os filtros ativos."""
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()

        active_filter = self.var_filter.get()
        search_query = self.var_search.get()
        filter_date = self.var_filter_date.get()

        # Banner de filtro de data ativo
        if filter_date:
            banner = tk.Frame(
                self.scrollable_frame,
                bg="#1e3a8a",
                padx=12,
                pady=6,
                highlightbackground="#3b82f6",
                highlightthickness=1
            )
            banner.pack(fill="x", pady=(0, 6))

            lbl_banner = tk.Label(
                banner,
                text=f"📅 Filtrando tarefas do dia: {filter_date} (Calendário {self.cal_year})",
                font=("Segoe UI", 9, "bold"),
                bg="#1e3a8a",
                fg="#ffffff"
            )
            lbl_banner.pack(side="left")

            btn_clear_date = tk.Button(
                banner,
                text="✕ Ver Todos os Dias",
                font=("Segoe UI", 8, "bold"),
                bg="#2563eb",
                fg="#ffffff",
                activebackground="#1d4ed8",
                activeforeground="#ffffff",
                bd=0,
                padx=8,
                pady=2,
                cursor="hand2",
                command=self.clear_date_filter
            )
            btn_clear_date.pack(side="right")

        try:
            tasks = self.service.list_tasks(
                status_filter=active_filter,
                search_query=search_query,
                date_filter=filter_date
            )
        except DatabaseError as e:
            messagebox.showerror("Erro de Banco", f"Não foi possível carregar as tarefas:\n{e}")
            return

        if not tasks:
            self._render_empty_state(active_filter, search_query, filter_date)
            return

        for task in tasks:
            self._render_task_card(task)

    def _render_empty_state(self, active_filter: str, search_query: str, filter_date: str):
        """Exibe uma mensagem amigável quando nenhuma tarefa for encontrada."""
        empty_box = tk.Frame(
            self.scrollable_frame,
            bg=self.COLOR_SURFACE,
            highlightbackground=self.COLOR_BORDER,
            highlightthickness=1,
            padx=24,
            pady=30
        )
        empty_box.pack(fill="x", pady=16)

        if search_query:
            icon = "🔎"
            msg = f'Nenhuma tarefa encontrada com o termo "{search_query}".'
            sub = "Tente buscar por outras palavras ou limpe o campo de busca."
        elif filter_date:
            icon = "📅"
            msg = f"Nenhuma tarefa cadastrada para o dia {filter_date}."
            sub = "Digite uma atividade no campo acima para adicioná-la a este dia!"
        elif active_filter == "Pendentes":
            icon = "🎉"
            msg = "Você não tem nenhuma tarefa pendente no momento!"
            sub = "Tudo em dia! Que tal adicionar novas metas?"
        elif active_filter == "Concluídas":
            icon = "📝"
            msg = "Nenhuma tarefa foi concluída ainda."
            sub = "Marque as tarefas da sua lista conforme for completando suas metas."
        else:
            icon = "✨"
            msg = "Nenhuma tarefa por aqui."
            sub = "Que tal adicionar sua primeira atividade no formulário acima?"

        lbl_icon = tk.Label(empty_box, text=icon, font=("Segoe UI", 24), bg=self.COLOR_SURFACE)
        lbl_icon.pack()

        lbl_msg = tk.Label(
            empty_box,
            text=msg,
            font=("Segoe UI", 11, "bold"),
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MAIN
        )
        lbl_msg.pack(pady=(4, 2))

        lbl_sub = tk.Label(
            empty_box,
            text=sub,
            font=self.font_subtitle,
            bg=self.COLOR_SURFACE,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_sub.pack()

    def _render_task_card(self, task: Task):
        """Renderiza um card individual para uma tarefa específica."""
        card_bg = self.COLOR_SURFACE if not task.completed else "#151c2a"
        card_border = self.COLOR_BORDER if not task.completed else "#1e2638"

        card = tk.Frame(
            self.scrollable_frame,
            bg=card_bg,
            highlightbackground=card_border,
            highlightthickness=1,
            padx=12,
            pady=8
        )
        card.pack(fill="x", pady=3)

        btn_check_text = "✔" if task.completed else "○"
        btn_check_fg = "#34d399" if task.completed else "#64748b"
        btn_check_bg = "#064e3b" if task.completed else "#1e293b"

        btn_toggle = tk.Button(
            card,
            text=btn_check_text,
            font=("Segoe UI", 10, "bold"),
            fg=btn_check_fg,
            bg=btn_check_bg,
            activeforeground=btn_check_fg,
            activebackground=btn_check_bg,
            relief="flat",
            bd=0,
            width=3,
            cursor="hand2",
            command=lambda t=task: self.handle_toggle_task(t)
        )
        btn_toggle.pack(side="left", padx=(0, 10))

        content_frame = tk.Frame(card, bg=card_bg)
        content_frame.pack(side="left", fill="both", expand=True)

        title_font = self.font_task_completed if task.completed else self.font_task_title
        title_color = "#64748b" if task.completed else self.COLOR_TEXT_MAIN

        lbl_title = tk.Label(
            content_frame,
            text=task.title,
            font=title_font,
            bg=card_bg,
            fg=title_color,
            anchor="w"
        )
        lbl_title.pack(anchor="w")

        meta_row = tk.Frame(content_frame, bg=card_bg)
        meta_row.pack(anchor="w", pady=(2, 0))

        # Badge de Data do Calendário 2026
        if task.due_date:
            lbl_due = tk.Label(
                meta_row,
                text=f"📅 {task.due_date}",
                font=self.font_badge,
                fg="#38bdf8",
                bg="#0c4a6e",
                padx=5,
                pady=1
            )
            lbl_due.pack(side="left", padx=(0, 6))

        # Badge de Prioridade
        prio_cfg = self.PRIORITY_COLORS.get(
            task.priority,
            {"fg": self.COLOR_TEXT_MAIN, "bg": "#1e293b", "border": "#334155"}
        )

        lbl_prio = tk.Label(
            meta_row,
            text=f"● {task.priority.upper()}",
            font=self.font_badge,
            fg=prio_cfg["fg"],
            bg=prio_cfg["bg"],
            padx=5,
            pady=1
        )
        lbl_prio.pack(side="left", padx=(0, 6))

        lbl_date = tk.Label(
            meta_row,
            text=f"Criada: {task.created_at}",
            font=self.font_meta,
            bg=card_bg,
            fg=self.COLOR_TEXT_MUTED
        )
        lbl_date.pack(side="left", padx=(0, 8))

        status_text = "Concluída" if task.completed else "Pendente"
        status_color = "#34d399" if task.completed else "#fbbf24"
        lbl_status_flag = tk.Label(
            meta_row,
            text=f"[{status_text}]",
            font=self.font_meta,
            bg=card_bg,
            fg=status_color
        )
        lbl_status_flag.pack(side="left")

        btn_delete = tk.Button(
            card,
            text="🗑 Excluir",
            font=("Segoe UI", 8),
            fg="#f87171",
            bg="#361519",
            activeforeground="#fca5a5",
            activebackground="#451a20",
            relief="flat",
            bd=0,
            padx=8,
            pady=3,
            cursor="hand2",
            command=lambda t=task: self.handle_delete_task(t)
        )
        btn_delete.pack(side="right")

    # =========================================================================
    # ATUALIZAÇÃO DOS INDICADORES E ESTADO GERAL
    # =========================================================================

    def refresh_metrics(self):
        """Calcula e atualiza os 4 cards de produtividade e a barra de progresso."""
        try:
            metrics: ProductivityMetrics = self.service.get_metrics()
            self.var_stat_total.set(str(metrics.total))
            self.var_stat_pending.set(str(metrics.pending))
            self.var_stat_completed.set(str(metrics.completed))
            self.var_stat_rate.set(metrics.completion_rate_formatted)
            self.var_progress_val.set(metrics.completion_rate)
        except DatabaseError as e:
            self.lbl_status.config(text=f"Erro ao atualizar métricas: {e}")

    def refresh_all(self):
        """Atualiza calendário, indicadores e a listagem visual."""
        self.render_calendar()
        self.refresh_metrics()
        self.refresh_task_list()

    # =========================================================================
    # CALLBACKS E TRATAMENTO DE EVENTOS
    # =========================================================================

    def handle_add_task(self):
        """Callback executado ao clicar no botão Adicionar ou pressionar Enter."""
        raw_title = self.var_task_title.get()
        priority = self.var_priority.get()
        due_date = self.var_selected_date.get()

        try:
            new_task = self.service.add_task(
                title=raw_title,
                priority=priority,
                due_date=due_date
            )
            self.var_task_title.set("")
            self.entry_task.focus_set()

            self.lbl_status.config(
                text=f'Tarefa "#{new_task.id}" agendada para {new_task.due_date}!'
            )
            self.refresh_all()
        except ValueError as ve:
            messagebox.showwarning("Atenção", str(ve), parent=self)
            self.entry_task.focus_set()
        except DatabaseError as de:
            messagebox.showerror("Erro de Banco", f"Não foi possível salvar a tarefa:\n{de}", parent=self)

    def handle_toggle_task(self, task: Task):
        """Callback para alternar entre concluída e reaberta (pendente)."""
        new_status = not task.completed
        action_word = "concluída" if new_status else "reaberta"

        try:
            self.service.set_task_completion(task.id, completed=new_status)
            self.lbl_status.config(text=f'Tarefa "#{task.id}" marcada como {action_word}.')
            self.refresh_all()
        except (TaskNotFoundError, DatabaseError) as e:
            messagebox.showerror("Erro", f"Não foi possível alterar a tarefa:\n{e}", parent=self)

    def handle_delete_task(self, task: Task):
        """Callback para exclusão com janela de confirmação nativa."""
        confirm = messagebox.askyesno(
            "Confirmar Exclusão",
            f"Deseja realmente excluir a tarefa:\n\n\"{task.title}\"?\n\nEssa ação é irreversível.",
            icon="warning",
            parent=self
        )

        if not confirm:
            self.lbl_status.config(text="Exclusão cancelada pelo usuário.")
            return

        try:
            self.service.delete_task(task.id)
            self.lbl_status.config(text=f'Tarefa "#{task.id}" excluída com sucesso.')
            self.refresh_all()
        except (TaskNotFoundError, DatabaseError) as e:
            messagebox.showerror("Erro de Exclusão", f"Não foi possível excluir a tarefa:\n{e}", parent=self)

    def handle_set_filter(self, filter_name: str):
        """Callback executado ao alternar entre os botões de filtro de status."""
        self.var_filter.set(filter_name)
        self._update_filter_button_styles()
        self.refresh_task_list()
        self.lbl_status.config(text=f'Filtro ativo: "{filter_name}".')

    def handle_clear_search(self):
        """Limpa o campo de pesquisa de texto."""
        self.var_search.set("")
        self.entry_search.focus_set()
        self.lbl_status.config(text="Pesquisa limpa.")


def main():
    """Inicializador da aplicação desktop."""
    app = TaskFlowApp()
    app.mainloop()


if __name__ == "__main__":
    main()
