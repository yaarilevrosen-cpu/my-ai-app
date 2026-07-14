const GAME_HTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project C.O.R.E - ניתוח אישיות AI</title>
  <style>
    :root {
      --bg: #0d0f12;
      --card: #161b22;
      --accent: #00ffcc;
      --danger: #ff3366;
      --text: #f0f6fc;
      --subtext: #8b949e;
    }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background-color: var(--bg); color: var(--text); display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
    .game-container { background: var(--card); border: 2px solid #30363d; border-radius: 16px; width: 100%; max-width: 600px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); text-align: center; position: relative; }
    h1 { color: var(--accent); margin-top: 0; font-size: 1.8rem; }
    .status-bar { display: flex; justify-content: space-between; background: #21262d; padding: 10px 20px; border-radius: 8px; margin-bottom: 25px; font-weight: bold; color: var(--subtext); }
    .status-bar span { color: var(--accent); }
    .btn { background: var(--accent); color: #000; border: none; padding: 14px 28px; font-size: 1.1rem; font-weight: bold; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; margin: 10px 5px; }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,255,204,0.3); }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-danger:hover { box-shadow: 0 5px 15px rgba(255,51,102,0.4); }
    .core-sphere { width: 130px; height: 130px; border-radius: 50%; background: radial-gradient(circle, var(--accent) 0%, rgba(0,0,0,0.8) 70%); margin: 20px auto; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: bold; color: #000; box-shadow: 0 0 30px var(--accent); transition: transform 0.1s ease; }
    .ai-response { background: #0d1117; border-right: 4px solid var(--accent); padding: 20px; border-radius: 8px; text-align: right; line-height: 1.6; font-size: 1.1rem; white-space: pre-wrap; margin-top: 20px; display: none; }
    .hidden { display: none !important; }
    .loader { border: 4px solid #30363d; border-top: 4px solid var(--accent); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>

<div class="game-container">
  <h1>🛡️ PROJECT: C.O.R.E</h1>
  <p id="sub-title" style="color: var(--subtext);">מערכת אבחון התנהגותית בזמן אמת</p>

  <div id="start-screen">
    <p>3 מבחנים מהירים שיחשפו איך אתה מתפקד תחת לחץ, סיכון וקבלת החלטות.</p>
    <button class="btn" onclick="startGame()">התחל אבחון 🚀</button>
  </div>

  <div id="game-ui" class="hidden">
    <div class="status-bar">
      <div>שלב: <span id="stage-num">1</span>/3</div>
      <div>ניקוד: <span id="score-val">0</span></div>
    </div>

    <div id="stage-1" class="stage">
      <h3>מבחן 1: טעינת הליבה</h3>
      <p style="color: var(--subtext);">כל הקלקה מעלה ניקוד וסיכון. פרוש בזמן לפני שהיא תתפוצץ!</p>
      <div id="core" class="core-sphere">0</div>
      <button class="btn" onclick="pumpCore()">טען ליבה ⚡</button>
      <button class="btn btn-danger" onclick="bankCore()">פרוש ושמור 💰</button>
    </div>

    <div id="stage-2" class="stage hidden">
      <h3>מבחן 2: תגובת פאניקה</h3>
      <p id="panic-instruction" style="font-size: 1.2rem; font-weight: bold; color: var(--danger);"></p>
      <div style="margin: 25px 0;">
        <button class="btn" style="background:#ff3366; color:#fff" onclick="handlePanicChoice('red')">אדום</button>
        <button class="btn" style="background:#3388ff; color:#fff" onclick="handlePanicChoice('blue')">כחול</button>
        <button class="btn" style="background:#ffcc00; color:#000" onclick="handlePanicChoice('yellow')">צהוב</button>
      </div>
    </div>

    <div id="stage-3" class="stage hidden">
      <h3>מבחן 3: חלוקת הניקוד</h3>
      <p style="color: var(--subtext);">דילמה חברתית: האם לחלוק את הקופה או לגנוב הכל?</p>
      <div style="margin: 25px 0;">
        <button class="btn" onclick="handleSocialChoice('share')">🤝 חלוק בשווה</button>
        <button class="btn btn-danger" onclick="handleSocialChoice('steal')">🗡️ גנוב הכל</button>
      </div>
    </div>
  </div>

  <div id="loading-screen" class="hidden">
    <div class="loader"></div>
    <p>שולח נתונים לשרת לניתוח פסיכולוגי...</p>
  </div>

  <div id="ai-result" class="ai-response"></div>
</div>

<script>
  const metrics = {
    totalScore: 0,
    pumpsPerRound: [],
    explosions: 0,
    bankedEarly: 0,
    panicReflexTimes: [],
    panicErrors: 0,
    socialDecision: ''
  };

  let currentStage = 1;
  let coreRisk = 0;
  let coreValue = 0;
  let panicStartTime = 0;
  let currentCorrectColor = '';
  let pumpsInCurrentRound = 0;

  function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    startStage1();
  }

  function startStage1() {
    coreRisk = 0;
    coreValue = 0;
    pumpsInCurrentRound = 0;
    updateCoreUI();
  }

  function pumpCore() {
    pumpsInCurrentRound++;
    coreRisk += Math.floor(Math.random() * 12) + 6;
    if (Math.random() * 100 < coreRisk) {
      metrics.explosions++;
      alert('💥 הליבה התפוצצה!');
      metrics.pumpsPerRound.push(pumpsInCurrentRound);
      nextStage();
      return;
    }
    coreValue += 100;
    updateCoreUI();
  }

  function bankCore() {
    metrics.totalScore += coreValue;
    if (pumpsInCurrentRound <= 3) metrics.bankedEarly++;
    metrics.pumpsPerRound.push(pumpsInCurrentRound);
    document.getElementById('score-val').innerText = metrics.totalScore;
    nextStage();
  }

  function updateCoreUI() {
    const core = document.getElementById('core');
    core.innerText = coreValue;
    core.style.transform = \`scale(\${1 + coreRisk / 100})\`;
  }

  function nextStage() {
    currentStage++;
    document.getElementById('stage-num').innerText = Math.min(currentStage, 3);
    document.querySelectorAll('.stage').forEach(el => el.classList.add('hidden'));

    if (currentStage === 2) {
      document.getElementById('stage-2').classList.remove('hidden');
      startPanicTest();
    } else if (currentStage === 3) {
      document.getElementById('stage-3').classList.remove('hidden');
    } else {
      finishGameAndAnalyze();
    }
  }

  function startPanicTest() {
    const colors = ['red', 'blue', 'yellow'];
    const colorNames = { red: 'אדום', blue: 'כחול', yellow: 'צהוב' };
    const forbiddenColor = colors[Math.floor(Math.random() * colors.length)];
    const validColors = colors.filter(c => c !== forbiddenColor);
    currentCorrectColor = validColors[Math.floor(Math.random() * validColors.length)];

    document.getElementById('panic-instruction').innerText = \`לחץ על צבע שהוא *לא* \${colorNames[forbiddenColor]}!\`;
    panicStartTime = Date.now();
  }

  function handlePanicChoice(chosenColor) {
    const reactionTime = Date.now() - panicStartTime;
    metrics.panicReflexTimes.push(reactionTime);
    if (chosenColor === currentCorrectColor) {
      metrics.totalScore += 300;
    } else {
      metrics.panicErrors++;
    }
    document.getElementById('score-val').innerText = metrics.totalScore;
    nextStage();
  }

  function handleSocialChoice(choice) {
    metrics.socialDecision = choice;
    nextStage();
  }

  async function finishGameAndAnalyze() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');

    const avgReaction = metrics.panicReflexTimes.reduce((a,b) => a+b, 0) / (metrics.panicReflexTimes.length || 1);
    const avgPumps = metrics.pumpsPerRound.reduce((a,b) => a+b, 0) / (metrics.pumpsPerRound.length || 1);

    const promptText = \`
נתח את אישיות השחקן על בסיס נתוני המשחק הבאים:
- ניקוד סופי: \${metrics.totalScore}
- ממוצע לחיצות סיכון בכל סיבוב: \${avgPumps.toFixed(1)}
- כמה פעמים הליבה התפוצצה לו: \${metrics.explosions}
- כמה פעמים פרש מוקדם וזהיר: \${metrics.bankedEarly}
- זמן תגובה ממוצע בלחץ: \${avgReaction.toFixed(0)} מילישניות
- טעויות פאניקה: \${metrics.panicErrors}
- החלטה חברתית בסוף: \${metrics.socialDecision === 'steal' ? 'בגד וניסה לגנוב הכל' : 'שיתף פעולה'}

תחזיר דוח אישיות שנון, מצחיק, עוקצני בעברית מחולק לסעיפים:
1. 🏷️ תואר/פרופיל אישיות מצחיק
2. 🧠 ניתוח התנהגות הסיכון
3. ⚡ תפקוד תחת לחץ
4. 🔮 תחזית קורעת לעתיד
    \`;

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: promptText })
      });
      const data = await res.json();
      document.getElementById('loading-screen').classList.add('hidden');
      const resultBox = document.getElementById('ai-result');
      resultBox.style.display = 'block';
      resultBox.innerText = data.reply || "שגיאה בקבלת תשובה";
    } catch (e) {
      document.getElementById('loading-screen').classList.add('hidden');
      alert('שגיאה בתקשורת: ' + e.message);
    }
  }
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'GET') {
      return new Response(GAME_HTML, {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8' 
        }
      });
    }

    if (request.method === 'POST') {
      try {
        const { text } = await request.json();

        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
          messages: [
            {
              role: 'system',
              content: 'אתה פסיכולוג, סטנדאפיסט ומבקר התנהגות שנון ומצחיק. תן ניתוח אישיות קצר, קורע ושנון בעברית לנתונים שהמשתמש שולח.'
            },
            {
              role: 'user',
              content: text
            }
          ]
        });

        return new Response(JSON.stringify({ reply: response.response }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ reply: `שגיאת שרת: ${e.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }
};
