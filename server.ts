import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en el entorno del servidor.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseGeminiJson<T>(rawText: string | undefined, contextLabel: string): T {
  const cleaned = (rawText ?? '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned) {
    console.error(`[Gemini Empty Output] Context: ${contextLabel}`);
    throw new Error('Gemini devolvió una respuesta vacía. Intenta de nuevo.');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error(`[Gemini JSON Parse Failure] Context: ${contextLabel}`, {
      preview: cleaned.slice(0, 300),
      err,
    });
    throw new Error('No se pudo interpretar la respuesta estructurada del asistente. Intenta nuevamente.');
  }
}

function handleGeminiError(res: express.Response, err: unknown, fallbackMsg: string) {
  console.error('[Gemini API Error]:', err);
  const message = err instanceof Error ? err.message : fallbackMsg;
  if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
    return res.status(403).json({
      error: 'La clave de Gemini API no es válida o no tiene permisos. Verifica Settings > Secrets.',
    });
  }
  if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
    return res.status(429).json({
      error: 'Se alcanzó temporalmente el límite de solicitudes. Intenta de nuevo en unos segundos.',
    });
  }
  return res.status(500).json({ error: message || fallbackMsg });
}

interface TransformIdeaBody {
  questionEs: string;
  questionEn: string;
  userInput: string;
  trainingProgram?: string;
}

interface TransformIdeaGeminiResponse {
  needsMoreDetail: boolean;
  clarificationEs: string;
  englishSentence: string;
  spanishTranslation: string;
  grammarNote: string;
}

interface GenerateScriptBody {
  profile: {
    fullName: string;
    idNumber: string;
    trainingGroup: string;
    instructorName: string;
    activityName: string;
    trainingProgram?: string;
  };
  customIntroduction: string;
  journeyAnswers: Array<{
    questionEs: string;
    questionEn: string;
    userInput: string;
    suggestedEnglish: string;
  }>;
}

interface ImproveScriptBody {
  part1: string;
  part2: {
    journey: string;
    futurePlans: string;
    decisionsAndActions: string;
    problemsAndSolutions: string;
    leadership: string;
    adaptability: string;
  };
}

interface CoachBody {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  currentMission?: string;
  trainingProgram?: string;
  learnerName?: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // 1. Mission 3: Transform learner idea into natural intermediate English
  app.post('/api/ai/transform-idea', async (req, res) => {
    try {
      const { questionEs, questionEn, userInput, trainingProgram } = req.body as TransformIdeaBody;
      const trimmedInput = (userInput || '').trim();
      if (!trimmedInput) {
        return res.status(400).json({ error: 'Escribe primero tu idea en español o inglés.' });
      }

      if (trimmedInput.length < 2) {
        return res.json({
          needsMoreDetail: true,
          clarificationEs:
            'Tu respuesta es demasiado corta. Por favor escribe al menos una palabra o frase clara sobre tu idea para convertirla sin inventar información.',
          englishSentence: '',
          spanishTranslation: '',
          grammarNote: '',
        });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Pregunta guía (ES): ${questionEs}
Guiding question (EN): ${questionEn}
Programa de formación (opcional): ${trainingProgram || 'No especificado'}
Idea original del aprendiz: "${trimmedInput}"`,
        config: {
          systemInstruction: `Eres un profesor experto de inglés para aprendices del SENA en Colombia (nivel B1 intermedio).
Analiza la idea original del aprendiz en español o inglés y la pregunta guía correspondiente.

REGLAS ESTRICTAS:
1. NUNCA inventes experiencias personales, empresas, títulos, años ni datos que el aprendiz no haya mencionado. Mantén exactamente la intención original.
2. Si el aprendiz da una respuesta breve pero clara y válida en contexto (ejemplo: pregunta "¿Qué estás estudiando actualmente?" y respuesta "video games" -> "I am currently studying video games." / "Actualmente estoy estudiando videojuegos."), SÍ debes convertirla en una oración completa y natural usando el contexto de la pregunta, con vocabulario sencillo, corrigiendo errores gramaticales si los hay, y estableciendo needsMoreDetail: false.
3. ÚNICAMENTE si la respuesta es incomprensible, vacía de significado o demasiado ambigua para responder la pregunta sin inventar datos (ej: "no sé", "ok", "sí", "nada", "asdf", signos sueltos), establece needsMoreDetail: true, deja englishSentence y spanishTranslation vacíos, y en clarificationEs pídele amablemente en español que amplíe su respuesta con un ejemplo concreto.
4. Cuando needsMoreDetail sea false:
   - englishSentence: 1 o 2 oraciones claras y naturales en inglés nivel intermedio.
   - spanishTranslation: traducción fiel al español de englishSentence.
   - grammarNote: nota breve en español (máximo 1 frase) explicando la estructura o vocabulario utilizado.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              needsMoreDetail: {
                type: Type.BOOLEAN,
                description:
                  'True only if the user input is meaningless or too ambiguous to convert without inventing facts.',
              },
              clarificationEs: {
                type: Type.STRING,
                description:
                  'Friendly request in Spanish asking the learner to expand their idea when needsMoreDetail is true, or empty string when false.',
              },
              englishSentence: {
                type: Type.STRING,
                description: 'Natural intermediate English sentence(s) based strictly on user idea.',
              },
              spanishTranslation: {
                type: Type.STRING,
                description: 'Accurate Spanish translation of the suggested English sentence.',
              },
              grammarNote: {
                type: Type.STRING,
                description: 'Brief 1-sentence tip in Spanish about vocabulary or grammar used.',
              },
            },
            required: [
              'needsMoreDetail',
              'clarificationEs',
              'englishSentence',
              'spanishTranslation',
              'grammarNote',
            ],
          },
        },
      });

      const parsed = parseGeminiJson<TransformIdeaGeminiResponse>(
        response.text,
        'transform-idea'
      );
      return res.json(parsed);
    } catch (err) {
      return handleGeminiError(res, err, 'No se pudo transformar tu idea en este momento.');
    }
  });

  // 2. Mission 5: Generate full 2-5 minute SENA audio script
  app.post('/api/ai/generate-script', async (req, res) => {
    try {
      const { profile, customIntroduction, journeyAnswers } = req.body as GenerateScriptBody;
      const ai = getAiClient();

      const answersBlock = (journeyAnswers || [])
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.questionEn}\n   - Original idea: ${item.userInput || '(not provided)'}\n   - English sentence: ${item.suggestedEnglish || '(not provided)'}`
        )
        .join('\n');

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Learner Data:
- Full Name: ${profile.fullName}
- ID: ${profile.idNumber}
- Training Group (Ficha): ${profile.trainingGroup}
- Instructor: ${profile.instructorName}
- Activity: ${profile.activityName}
- Training Program: ${profile.trainingProgram || 'Not specified'}

Part 1 Custom Introduction provided by learner:
"${customIntroduction}"

Learner's Mission 3 Journey Ideas:
${answersBlock}`,
        config: {
          systemInstruction: `Eres un diseñador pedagógico y coach de inglés del SENA. Debes construir el guion completo de la evidencia GA3-240202501-AA2-EV02 – AUDIO.
REQUISITOS OBLIGATORIOS DEL GUION:
1. Estructura en dos partes:
   - part1: Presentación personal usando exactamente los datos proporcionados en Part 1 Custom Introduction (mejórala mínimamente solo si tiene errores evidentes de gramática, sin alterar nombres, números ni ficha).
   - part2: 6 secciones claras en inglés natural de nivel intermedio (B1):
     1) journey (My academic and professional journey)
     2) futurePlans (My future plans and goals)
     3) decisionsAndActions (My decisions and actions)
     4) problemsAndSolutions (Possible problems and solutions)
     5) leadership (Leadership and professional responsibility)
     6) adaptability (Flexibility and adaptability + brief closing conclusion)
2. Longitud total del guion (part1 + las 6 secciones de part2): entre 320 y 460 palabras para que al leerse en voz alta a ritmo normal (120 palabras por minuto) dure entre 2.5 y 4 minutos (dentro del rango exigido de 2 a 5 minutos).
3. Gramática obligatoria: debes integrar de forma natural y contextualizada al menos un ejemplo de ZERO CONDITIONAL (If + present simple, present simple), un ejemplo de FIRST CONDITIONAL (If + present simple, will + verb) y un ejemplo de SECOND CONDITIONAL (If + past simple, would + verb) distribuidos en las secciones de decisiones, soluciones y liderazgo/adaptabilidad.
4. Usa conectores claros y naturales (First, In addition, Furthermore, However, On the other hand, Finally, In conclusion).
5. NUNCA inventes experiencias laborales, empresas o títulos que el aprendiz no haya escrito. Si algún tema tiene poca información del aprendiz, redacta reflexiones profesionales honestas y generales alineadas con su programa de formación y sus metas declaradas.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              part1: { type: Type.STRING },
              part2: {
                type: Type.OBJECT,
                properties: {
                  journey: { type: Type.STRING },
                  futurePlans: { type: Type.STRING },
                  decisionsAndActions: { type: Type.STRING },
                  problemsAndSolutions: { type: Type.STRING },
                  leadership: { type: Type.STRING },
                  adaptability: { type: Type.STRING },
                },
                required: [
                  'journey',
                  'futurePlans',
                  'decisionsAndActions',
                  'problemsAndSolutions',
                  'leadership',
                  'adaptability',
                ],
              },
              conditionalsUsed: {
                type: Type.OBJECT,
                properties: {
                  zero: { type: Type.STRING },
                  first: { type: Type.STRING },
                  second: { type: Type.STRING },
                },
                required: ['zero', 'first', 'second'],
              },
            },
            required: ['part1', 'part2', 'conditionalsUsed'],
          },
        },
      });

      const parsed = parseGeminiJson<Record<string, unknown>>(response.text, 'generate-script');
      return res.json(parsed);
    } catch (err) {
      return handleGeminiError(res, err, 'No se pudo generar el guion en este momento.');
    }
  });

  // 3. Mission 5: Improve existing script without changing original ideas
  app.post('/api/ai/improve-script', async (req, res) => {
    try {
      const { part1, part2 } = req.body as ImproveScriptBody;
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `PART 1 (Personal Introduction):
${part1}

PART 2 SECTIONS:
1. Journey: ${part2.journey}
2. Future Plans: ${part2.futurePlans}
3. Decisions and Actions: ${part2.decisionsAndActions}
4. Problems and Solutions: ${part2.problemsAndSolutions}
5. Leadership and Responsibility: ${part2.leadership}
6. Flexibility and Adaptability: ${part2.adaptability}`,
        config: {
          systemInstruction: `Eres un corrector profesional de inglés (nivel B1 intermedio) para aprendices del SENA.
Revisa y mejora la gramática, ortografía, conectores, fluidez oral y coherencia del guion proporcionado.
REGLAS CRÍTICAS:
1. NO cambies las ideas originales, metas, datos personales ni experiencias del aprendiz.
2. Mantén el vocabulario claro y fácil de pronunciar en voz alta.
3. Conserva ejemplos claros de Zero, First y Second Conditional.
4. Mantén una extensión apropiada para 2 a 5 minutos (entre 300 y 500 palabras en total).
5. Proporciona en "feedbackEs" una explicación breve y motivadora en español de las mejoras realizadas (máximo 3 puntos).`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              part1: { type: Type.STRING },
              part2: {
                type: Type.OBJECT,
                properties: {
                  journey: { type: Type.STRING },
                  futurePlans: { type: Type.STRING },
                  decisionsAndActions: { type: Type.STRING },
                  problemsAndSolutions: { type: Type.STRING },
                  leadership: { type: Type.STRING },
                  adaptability: { type: Type.STRING },
                },
                required: [
                  'journey',
                  'futurePlans',
                  'decisionsAndActions',
                  'problemsAndSolutions',
                  'leadership',
                  'adaptability',
                ],
              },
              feedbackEs: { type: Type.STRING },
            },
            required: ['part1', 'part2', 'feedbackEs'],
          },
        },
      });

      const parsed = parseGeminiJson<Record<string, unknown>>(response.text, 'improve-script');
      return res.json(parsed);
    } catch (err) {
      return handleGeminiError(res, err, 'No se pudo mejorar el guion en este momento.');
    }
  });

  // 4. Persistent AI English Coach across all missions
  app.post('/api/ai/coach', async (req, res) => {
    try {
      const { message, history, currentMission, trainingProgram, learnerName } =
        req.body as CoachBody;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Escribe tu consulta para el AI English Coach.' });
      }

      const ai = getAiClient();
      const recentHistory = (history || [])
        .slice(-6)
        .map((h) => `${h.role === 'user' ? 'Aprendiz' : 'Coach'}: ${h.text}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `${recentHistory ? `Historial reciente:\n${recentHistory}\n\n` : ''}Misión actual: ${currentMission || 'General'}
Aprendiz: ${learnerName || 'Aprendiz SENA'}
Programa de formación: ${trainingProgram || 'No especificado'}
Consulta del aprendiz: "${message.trim()}"`,
        config: {
          systemInstruction: `Eres "AI ENGLISH COACH", un tutor amable, claro y motivador para aprendices del SENA que preparan su evidencia GA3-240202501-AA2-EV02 – AUDIO (un audio en inglés de 2 a 5 minutos sobre trayectoria académica/laboral, planes futuros, decisiones, soluciones, liderazgo y adaptabilidad usando Zero, First y Second Conditional).
REGLAS:
1. Explica principalmente en español sencillo, cercano y motivador (sin tecnicismos complejos).
2. Siempre incluye ejemplos prácticos en inglés relacionados con la duda del aprendiz (y su programa de formación si lo especificó).
3. Sé conciso y accionable (máximo 150 palabras en la explicación).
4. En "englishExamples" devuelve de 1 a 3 frases clave en inglés limpias (sin comillas extra ni viñetas) para que el aprendiz pueda escucharlas con Text-to-Speech.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyEs: {
                type: Type.STRING,
                description: 'Clear, encouraging coaching explanation in Spanish.',
              },
              englishExamples: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1 to 3 concise English example sentences ready for TTS playback.',
              },
            },
            required: ['replyEs', 'englishExamples'],
          },
        },
      });

      const parsed = parseGeminiJson<Record<string, unknown>>(response.text, 'coach');
      return res.json(parsed);
    } catch (err) {
      return handleGeminiError(res, err, 'El AI English Coach no pudo responder en este momento.');
    }
  });

  // Catch-all for unknown /api/* routes so they ALWAYS return JSON (never HTML fallback)
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global JSON error handler for Express (prevents HTML error responses on malformed body/server errors)
  app.use(
    (
      err: unknown,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (req.path.startsWith('/api')) {
        console.error('[Express API Middleware Error]:', err);
        const status =
          typeof err === 'object' &&
          err !== null &&
          'status' in err &&
          typeof (err as { status?: unknown }).status === 'number'
            ? (err as { status: number }).status
            : 500;
        const message =
          err instanceof Error
            ? err.message
            : 'Error interno al procesar la solicitud.';
        return res.status(status).json({ error: message });
      }
      return next(err);
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ENGLISH AUDIO MISSION server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
