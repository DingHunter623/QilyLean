const sleep = ms => new Promise(r => setTimeout(r, ms));
const fail = m => { throw new Error(m); };
const EXPECTED = '20260904-cooperation-axis-current-white-r10';

async function newTarget() {
  const r = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
  if (!r.ok) fail(`target ${r.status}`);
  return r.json();
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let seq = 0;
    const pending = new Map();
    ws.onerror = reject;
    ws.onopen = () => resolve({
      call(method, params = {}) {
        return new Promise((res, rej) => {
          const id = ++seq;
          pending.set(id, { res, rej });
          ws.send(JSON.stringify({ id, method, params }));
        });
      },
      close() { ws.close(); }
    });
    ws.onmessage = event => {
      const msg = JSON.parse(event.data);
      if (!msg.id || !pending.has(msg.id)) return;
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? p.rej(new Error(msg.error.message)) : p.res(msg.result);
    };
  });
}

async function evaluate(c, expression) {
  const r = await c.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) fail(r.exceptionDetails.text || 'evaluate failed');
  return r.result?.value;
}

async function audit(c, width, height) {
  await c.call('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 600
  });

  for (let attempt = 1; attempt <= 30; attempt++) {
    await c.call('Network.clearBrowserCache');
    await c.call('Page.navigate', {
      url: `https://qilylean.com/cooperation/?__qily_r10=${Date.now()}_${attempt}`
    });
    await sleep(1800);

    const data = await evaluate(c, `(() => {
      const card = document.querySelector('.qily-system-axis__step[href="/cooperation/"]');
      const css = document.querySelector('link[href*="site-commercial-quality-closure-v1.css"]');
      if (!card) return null;
      const strong = card.querySelector('strong');
      const span = card.querySelector('span');
      if (!strong || !span) return null;
      const a = getComputedStyle(card), b = getComputedStyle(strong), s = getComputedStyle(span);
      return {
        stylesheet: css?.getAttribute('href') || '',
        background: a.backgroundColor,
        border: a.borderColor,
        cardColor: a.color,
        cardFill: a.webkitTextFillColor,
        strongColor: b.color,
        strongFill: b.webkitTextFillColor,
        spanColor: s.color,
        spanFill: s.webkitTextFillColor,
        text: card.innerText
      };
    })()`);

    console.log(`attempt ${attempt} ${width}x${height}`, JSON.stringify(data));
    if (data?.stylesheet.includes(EXPECTED)) {
      if (data.background !== 'rgb(15, 75, 90)') fail(`${width}: background is not VI deep teal: ${data.background}`);
      if (data.border !== 'rgb(202, 161, 95)') fail(`${width}: border is not VI gold: ${data.border}`);
      for (const k of ['cardColor','cardFill','strongColor','strongFill','spanColor','spanFill']) {
        if (data[k] !== 'rgb(255, 255, 255)') fail(`${width}: ${k} is not white: ${data[k]}`);
      }
      console.log(`PASS production ${width}x${height}: 05 = deep teal + gold border + white text`);
      return;
    }
    await sleep(8000);
  }
  fail(`${width}: production did not expose ${EXPECTED} within propagation window`);
}

const target = await newTarget();
const c = await connect(target.webSocketDebuggerUrl);
try {
  await c.call('Page.enable');
  await c.call('Runtime.enable');
  await c.call('Network.enable');
  await c.call('Network.setCacheDisabled', { cacheDisabled: true });
  await audit(c, 1680, 950);
  await audit(c, 390, 844);
} finally {
  c.close();
}
