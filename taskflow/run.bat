@echo off
title TaskFlow - Gerenciador de Tarefas Desktop
echo ========================================================
echo         TaskFlow - Gerenciador de Tarefas Desktop
echo ========================================================
echo.

:: 1. Verificar se ambiente virtual existe
if not exist "venv" (
    echo [1/3] Criando ambiente virtual Python (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao criar o ambiente virtual. Verifique se o Python esta instalado.
        pause
        exit /b %errorlevel%
    )
    echo       Ambiente virtual criado com sucesso!
) else (
    echo [1/3] Ambiente virtual 'venv' detectado.
)

:: 2. Ativar ambiente virtual
echo [2/3] Ativando ambiente virtual...
call venv\Scripts\activate.bat

:: 3. Instalar/Verificar dependencias
echo [3/3] Verificando dependencias...
pip install -r requirements.txt --quiet

:: 4. Executar aplicacao
echo.
echo Iniciando TaskFlow Desktop...
python main.py

pause
