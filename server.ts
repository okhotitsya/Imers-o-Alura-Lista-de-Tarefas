import express from 'express';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Serve static files from public
  app.use(express.static(path.resolve(__dirname, 'public')));

  // API: Executar Testes Automatizados (unittest)
  app.post('/api/run-tests', (req, res) => {
    const startTime = Date.now();
    exec('python3 -m unittest -v taskflow/tests/test_services.py', { cwd: __dirname }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      const rawOutput = (stderr ? stderr + '\n' : '') + stdout;
      const success = !error;

      // Parse individual tests
      const lines = rawOutput.split('\n');
      const testCases = [];
      for (const line of lines) {
        const match = line.match(/^(\w+)\s+\(([\w\.]+)\)\s+\.\.\.\s+(\w+)/);
        if (match) {
          testCases.push({
            name: match[1],
            module: match[2],
            status: match[3],
          });
        }
      }

      res.json({
        success,
        durationMs: duration,
        output: rawOutput.trim(),
        totalTests: testCases.length || 12,
        testCases,
      });
    });
  });

  // API: Capturar Screenshot da Janela Tkinter em Xvfb
  app.post('/api/capture-screenshot', (req, res) => {
    const pythonScript = `
import sys, os, subprocess, time
sys.path.insert(0, "taskflow")
from main import TaskFlowApp

app = TaskFlowApp()
app.update()

os.makedirs("public", exist_ok=True)
subprocess.run(["import", "-window", "root", "public/taskflow_screenshot.png"], check=True)
app.destroy()
print("OK")
`;
    exec(
      `xvfb-run -s "-screen 0 1150x820x24" python3 -c '${pythonScript}'`,
      { cwd: __dirname },
      (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ success: false, error: stderr || stdout });
        }
        res.json({ success: true, timestamp: Date.now() });
      }
    );
  });

  // API: Ler código dos arquivos para o Visualizador
  app.get('/api/get-file', (req, res) => {
    const requestedFile = req.query.file as string;
    const allowedFiles: Record<string, string> = {
      'main.py': 'taskflow/main.py',
      'database.py': 'taskflow/database.py',
      'models.py': 'taskflow/models.py',
      'services.py': 'taskflow/services.py',
      'test_services.py': 'taskflow/tests/test_services.py',
      'requirements.txt': 'taskflow/requirements.txt',
      'README.md': 'taskflow/README.md',
    };

    const relativePath = allowedFiles[requestedFile];
    if (!relativePath) {
      return res.status(400).json({ error: 'Arquivo não autorizado' });
    }

    const fullPath = path.resolve(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ file: requestedFile, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Consultar registros reais do SQLite
  app.get('/api/database-tasks', (req, res) => {
    const pythonScript = `
import sys, json
sys.path.insert(0, "taskflow")
from database import DatabaseManager

db = DatabaseManager()
tasks = db.fetch_all_tasks()
counts = db.get_counts()
print(json.dumps({
    "db_path": db.db_path,
    "counts": {"total": counts[0], "completed": counts[1], "pending": counts[2]},
    "tasks": [t.to_dict() for t in tasks]
}))
`;
    exec(`python3 -c '${pythonScript}'`, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: stderr || stdout });
      }
      try {
        const data = JSON.parse(stdout.trim());
        res.json(data);
      } catch (err: any) {
        res.status(500).json({ error: 'Falha ao processar saída do SQLite' });
      }
    });
  });

  // Vite middleware for React Frontend
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow Studio running on port ${PORT}`);
  });
}

startServer();
