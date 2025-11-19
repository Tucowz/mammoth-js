const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS liberado (ajusta depois se quiser restringir)
app.use(cors());
app.use(express.json());

// Multer em memória (sem salvar em disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB
  }
});

// Healthcheck simples
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * POST /convert
 * Body: multipart/form-data
 *   - file: arquivo .docx
 *
 * Retorno (JSON):
 * {
 *   "html": "<p>...</p>",
 *   "warnings": [ ... ]
 * }
 */
app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Nenhum arquivo enviado. Use o campo 'file' no form-data."
      });
    }

    // Verifica se é DOCX (opcional, mas ajuda a evitar lixo)
    if (
      req.file.mimetype !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      !req.file.originalname.toLowerCase().endsWith(".docx")
    ) {
      return res.status(400).json({
        error: "Arquivo inválido. Envie um .docx."
      });
    }

    const buffer = req.file.buffer;

    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value; // HTML resultante
    const warnings = result.messages || [];

    // Você pode aqui já "limpar" ou pós-processar o HTML se quiser

    return res.json({
      html,
      warnings
    });
  } catch (err) {
    console.error("Erro ao converter DOCX para HTML:", err);
    return res.status(500).json({
      error: "Erro interno ao converter o arquivo.",
      details: err.message
    });
  }
});

// Fallback pra rota desconhecida
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`DOCX → HTML service rodando na porta ${PORT}`);
});
