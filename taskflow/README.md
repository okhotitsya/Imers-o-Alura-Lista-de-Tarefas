# TaskFlow — Gerenciador de Tarefas Desktop

**TaskFlow** é uma aplicação desktop moderna e intuitiva para gerenciamento de tarefas (*To-Do List*) e acompanhamento de produtividade pessoal. Desenvolvida em **Python** utilizando **Tkinter / ttk** para a interface gráfica, **SQLite** para persistência confiável dos dados e **Unittest** para testes automatizados.

O projeto foi projetado com foco em arquitetura limpa, separação clara de responsabilidades, código limpo aderente à **PEP 8** e propósitos educativos para estudantes e desenvolvedores de software.



---

## 🌟 Principais Funcionalidades

1. **Cadastro Rápido de Tarefas**:
   - Inserção com título e seleção de prioridade (**Baixa**, **Média**, **Alta**).
   - Atalho de teclado: tecla **Enter** cadastra a tarefa instantaneamente.
   - Validação preventiva contra títulos em branco ou preenchidos apenas com espaços.
2. **Conclusão e Reabertura**:
   - Alternância de status com um clique no botão de status (`✔` ou `○`).
   - Diferenciação visual imediata: tarefas concluídas ganham texto riscado (*strikethrough*), cores suavizadas e indicativo `[Concluída]`.
   - Capacidade de reabertura, retornando a atividade para o estado pendente.
3. **Exclusão Segura com Diálogo Nativo**:
   - Confirmação explícita de exclusão via `messagebox.askyesno`.
   - Se confirmada, remove o registro do banco de dados e recalcula as métricas.
   - Se cancelada, mantém a integridade dos dados sem qualquer alteração.
4. **Filtros e Pesquisa em Tempo Real**:
   - Três filtros de exibição: **Todas**, **Pendentes** e **Concluídas**.
   - Campo de busca textual por título que opera de forma integrada aos filtros.
   - Limpeza rápida da busca através do botão `✕`.
5. **Painel de Indicadores de Produtividade**:
   - **Total de Tarefas**: quantidade absoluta cadastrada.
   - **Pendentes**: tarefas ativas aguardando conclusão.
   - **Concluídas**: tarefas já finalizadas.
   - **Taxa de Conclusão**: percentual calculado pela fórmula `(concluídas / total) × 100` (ou `0%` quando vazio).
   - **Barra de Progresso Visual**: feedback visual proporcional ao progresso geral.
6. **Estados Vazios Amigáveis**:
   - Mensagens acolhedoras quando não houver registros ou quando a busca/filtro não retornar resultados.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem**: Python 3.10+
- **Interface Gráfica**: `tkinter` e `tkinter.ttk` (com tema moderno `clam` e fontes customizadas)
- **Persistência**: `sqlite3` (módulo nativo com consultas parametrizadas e controle transacional)
- **Testes Automatizados**: `unittest` (com banco em memória `:memory:` para isolamento)
- **Modelagem**: `dataclasses` (Python 3.7+)
- **Manipulação de Caminhos**: `pathlib.Path`

---

## 📁 Estrutura do Projeto

```text
taskflow/
├── main.py              # Interface gráfica, loop Tkinter e callbacks de eventos
├── database.py          # Gerenciamento de conexões, criação de tabelas e queries SQLite
├── models.py            # Entidades Task e ProductivityMetrics com dataclasses
├── services.py          # Regras de negócio, validações e cálculo de métricas
├── requirements.txt     # Informações de dependências da biblioteca padrão
├── README.md            # Documentação completa e guia de estudo
├── .gitignore           # Ignora caches Python e bancos de dados locais
├── data/                # Diretório onde o banco taskflow.db é persistido
└── tests/
    ├── __init__.py      # Pacote de testes
    └── test_services.py # 12 testes unitários automatizados com unittest
```

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos

- Python 3.10 ou superior instalado em seu sistema operacional.
- No **Linux (Ubuntu/Debian)**, se o Tkinter não estiver presente, instale:
  ```bash
  sudo apt-get update && sudo apt-get install python3-tk
  ```
  *(No Windows e macOS, o Tkinter já acompanha a instalação padrão do instalador oficial do Python.org)*.

---

### 2. Criação do Ambiente Virtual (Recomendado)

Abra o terminal na pasta raiz do projeto e crie o ambiente virtual:

```bash
python -m venv .venv
```

#### Ativação no Windows:
```cmd
.venv\Scripts\activate
```
*(Se estiver utilizando o PowerShell no Windows e houver restrição de execução de scripts, execute previamente: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`)*.

#### Ativação no Linux / macOS:
```bash
source .venv/bin/activate
```

---

### 3. Instalação de Dependências

Como o TaskFlow utiliza estritamente módulos da biblioteca padrão do Python, nenhuma biblioteca externa precisa ser baixada via `pip`.

---

### 4. Executando a Aplicação

Para iniciar o TaskFlow com interface gráfica:

```bash
python main.py
```
*(Ou, se você estiver na pasta pai):*
```bash
python taskflow/main.py
```

---

### 5. Executando os Testes Automatizados

Para rodar os testes unitários sem abrir nenhuma janela:

```bash
python -m unittest taskflow/tests/test_services.py
```
Ou executando a suíte com detecção automática:
```bash
python -m unittest discover -s taskflow/tests
```

**Resultado esperado:**
```text
Ran 12 tests in 0.011s
OK
```

---

## 💾 Localização e Persistência do Banco de Dados

O banco de dados SQLite é gerado automaticamente na primeira execução no caminho:

```text
taskflow/data/taskflow.db
```

### Por que esse caminho é seguro?
No arquivo `database.py`, o caminho é determinado via `pathlib.Path(__file__).resolve().parent / "data" / "taskflow.db"`. Isso significa que:
1. Ele não depende do diretório onde o terminal foi aberto (`os.getcwd()`).
2. Fica salvo dentro de um diretório permanente da própria aplicação.
3. Não é excluído quando o computador reinicia (ao contrário de pastas temporárias `/tmp` ou `AppData\Local\Temp`).

---

## 🎓 Guia do Estudante: Como o Projeto Funciona por Dentro

### 1. Separação em Três Camadas (Arquitetura Limpa)

- **Camada de Visão (`main.py`)**: Cuida apenas do que o usuário vê (janelas, botões, entradas, cores, fontes). Ela **não sabe** como o SQLite grava dados; ela apenas delega para a camada de serviço.
- **Camada de Serviços (`services.py`)**: Contém as regras de negócio: valida se o título não está em branco, calcula percentuais, decide quais tarefas exibir. Não possui código do Tkinter, permitindo que seja testada facilmente.
- **Camada de Dados (`database.py`)**: Cuida de abrir a conexão, executar as sentenças SQL parametrizadas (`?`) para evitar *SQL Injection*, e confirmar as transações (`commit`).

### 2. Fluxo Completo de uma Operação (Exemplo: Adicionar Tarefa)

1. **Ação do Usuário**: O usuário digita `"Aprender Tkinter"` no campo de texto e clica em **"+ Adicionar Tarefa"** (ou pressiona a tecla **Enter**).
2. **Disparo do Evento**: O Tkinter invoca a função de retorno (callback) `handle_add_task()` definida no `command` do botão ou ligada via `bind("<Return>")`.
3. **Coleta de Dados**: O método lê os valores atuais de `self.var_task_title.get()` e `self.var_priority.get()`.
4. **Chamada de Serviço**: Chama `self.service.add_task(title, priority)`.
5. **Validação**: `TaskService` remove espaços em branco das pontas com `.strip()`. Se o título for vazio, dispara uma exceção `ValueError`.
6. **Persistência**: `TaskService` formata a data atual e chama `self.db.insert_task(...)`. O SQLite executa o comando `INSERT` e retorna o novo `id`.
7. **Atualização da Interface**: A GUI limpa o campo de texto (`self.var_task_title.set("")`), atualiza os indicadores numéricos com `refresh_metrics()`, e recria os cards da lista com `refresh_task_list()`.
8. **Feedback**: A barra de status na parte inferior exibe: `Tarefa #1 adicionada com sucesso!`.

---

## 📄 Licença

Projeto desenvolvido para fins didáticos e práticos sob a licença MIT. Sinta-se livre para estudar, modificar e aprimorar!
