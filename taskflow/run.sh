#!/usr/bin/env bash
# TaskFlow - Script de inicialização rápida (Linux / macOS)

set -e

echo "========================================================"
echo "        TaskFlow - Gerenciador de Tarefas Desktop"
echo "========================================================"
echo ""

# 1. Verificar ambiente virtual
if [ ! -d "venv" ]; then
    echo "[1/3] Criando ambiente virtual Python (venv)..."
    python3 -m venv venv
    echo "      Ambiente virtual criado com sucesso!"
else
    echo "[1/3] Ambiente virtual 'venv' detectado."
fi

# 2. Ativar ambiente virtual
echo "[2/3] Ativando ambiente virtual..."
source venv/bin/activate

# 3. Dependências
echo "[3/3] Verificando requisitos..."
pip install -r requirements.txt --quiet

# 4. Execução
echo ""
echo "Iniciando TaskFlow Desktop..."
python3 main.py
