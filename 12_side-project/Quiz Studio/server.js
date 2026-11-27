const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const dentalDb = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');
const TMP_FILE  = path.join(DATA_DIR, 'content.tmp.json');

const SEED = {
  chapters: [
    {
      id: 'seed-ch-1',
      name: '예시 챕터',
      questions: [
        {
          id: 'seed-q-1',
          type: 'multiple_choice',
          question: '예시 문제입니다. 정답은 무엇인가요?',
          options: ['보기 A', '보기 B', '보기 C', '보기 D'],
          answer: '보기 A',
          explanation: '이건 예시 해설입니다.'
        },
        {
          id: 'seed-q-2',
          type: 'fill_in',
          question: '빈칸에 들어갈 말은?  ___ 은(는) 학습의 첫걸음이다.',
          answer: '반복',
          explanation: '반복 학습이 기억 정착에 효과적입니다.'
        },
        {
          id: 'seed-q-3',
          type: 'flashcard',
          question: '플래시카드 앞면\n이 단어의 뜻은?',
          answer: '플래시카드 뒷면\n정답이 여기에 나옵니다.'
        }
      ]
    }
  ]
};

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(SEED));
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { chapters: [] };
  }
}

function saveData() {
  fs.writeFileSync(TMP_FILE, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(TMP_FILE, DATA_FILE);
}

function validateQuestion(body) {
  const { type, question, answer } = body;
  if (!['multiple_choice', 'fill_in', 'flashcard'].includes(type)) return '유효하지 않은 문제 유형입니다';
  if (!question?.trim()) return '문제 내용을 입력해 주세요';
  if (!answer?.trim()) return '정답을 입력해 주세요';
  if (type === 'multiple_choice') {
    if (!Array.isArray(body.options) || body.options.length !== 4 || body.options.some(o => !o?.trim())) {
      return '객관식은 보기 4개를 모두 입력해야 합니다';
    }
    if (!body.options.includes(answer)) return '정답은 보기 중 하나여야 합니다';
  }
  return null;
}

let db = loadData();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── GET /api/content ──────────────────────────────────────
app.get('/api/content', (req, res) => {
  res.json(db);
});

// ── POST /api/chapters ────────────────────────────────────
app.post('/api/chapters', (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: '챕터 이름을 입력해 주세요' });
  const chapter = { id: randomUUID(), name, questions: [] };
  db.chapters.push(chapter);
  saveData();
  res.status(201).json({ chapter });
});

// ── PUT /api/chapters/:id ─────────────────────────────────
app.put('/api/chapters/:id', (req, res) => {
  const ch = db.chapters.find(c => c.id === req.params.id);
  if (!ch) return res.status(404).json({ error: '챕터를 찾을 수 없습니다' });
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: '챕터 이름을 입력해 주세요' });
  ch.name = name;
  saveData();
  res.json({ chapter: ch });
});

// ── DELETE /api/chapters/:id ──────────────────────────────
app.delete('/api/chapters/:id', (req, res) => {
  const idx = db.chapters.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '챕터를 찾을 수 없습니다' });
  db.chapters.splice(idx, 1);
  saveData();
  res.status(204).end();
});

// ── POST /api/chapters/:id/questions ─────────────────────
app.post('/api/chapters/:id/questions', (req, res) => {
  const ch = db.chapters.find(c => c.id === req.params.id);
  if (!ch) return res.status(404).json({ error: '챕터를 찾을 수 없습니다' });
  const err = validateQuestion(req.body);
  if (err) return res.status(400).json({ error: err });
  const { type, question, answer, options, explanation } = req.body;
  const q = { id: randomUUID(), type, question: question.trim(), answer: answer.trim() };
  if (type === 'multiple_choice') q.options = options.map(o => o.trim());
  if (explanation?.trim()) q.explanation = explanation.trim();
  ch.questions.push(q);
  saveData();
  res.status(201).json({ question: q });
});

// ── PUT /api/questions/:id ────────────────────────────────
app.put('/api/questions/:id', (req, res) => {
  let found = null;
  for (const ch of db.chapters) {
    found = ch.questions.find(q => q.id === req.params.id);
    if (found) break;
  }
  if (!found) return res.status(404).json({ error: '문제를 찾을 수 없습니다' });
  const err = validateQuestion(req.body);
  if (err) return res.status(400).json({ error: err });
  const { type, question, answer, options, explanation } = req.body;
  found.type = type;
  found.question = question.trim();
  found.answer = answer.trim();
  if (type === 'multiple_choice') {
    found.options = options.map(o => o.trim());
  } else {
    delete found.options;
  }
  if (explanation?.trim()) {
    found.explanation = explanation.trim();
  } else {
    delete found.explanation;
  }
  saveData();
  res.json({ question: found });
});

// ── DELETE /api/questions/:id ─────────────────────────────
app.delete('/api/questions/:id', (req, res) => {
  for (const ch of db.chapters) {
    const idx = ch.questions.findIndex(q => q.id === req.params.id);
    if (idx !== -1) {
      ch.questions.splice(idx, 1);
      saveData();
      return res.status(204).end();
    }
  }
  res.status(404).json({ error: '문제를 찾을 수 없습니다' });
});

// ── GET /api/dental/all ───────────────────────────────────
app.get('/api/dental/all', (req, res) => {
  const terms = dentalDb.prepare('SELECT id, chapter_id as ch, en, ko, desc, memo FROM terms ORDER BY id').all();
  const chapters = dentalDb.prepare('SELECT id, short, emoji FROM term_chapters ORDER BY id').all();
  const morphChapters = dentalDb.prepare('SELECT id, name, emoji FROM morph_chapters ORDER BY id').all();
  const morphCards = dentalDb.prepare('SELECT chapter_id, front as f, back as b FROM morph_cards ORDER BY chapter_id, sort_order').all();
  const morphQuizRaw = dentalDb.prepare('SELECT chapter_id as ch, question as q, options, answer_idx as a, explanation as e FROM morph_quiz ORDER BY id').all();

  const morphStudy = morphChapters.map(ch => ({
    id: ch.id,
    title: ch.name,
    cards: morphCards.filter(c => c.chapter_id === ch.id).map(({ f, b }) => ({ f, b })),
  }));

  const morphQuiz = morphQuizRaw.map(row => ({
    q: row.q,
    o: JSON.parse(row.options),
    a: row.a,
    e: row.e,
    ch: row.ch,
  }));

  res.json({ terms, chapters, morphStudy, morphQuiz, morphChapters });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
