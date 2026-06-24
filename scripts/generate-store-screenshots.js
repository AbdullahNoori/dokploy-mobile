const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const IOS_SOURCE_DIR = path.join(ROOT, 'marketing', 'en');
const ANDROID_SOURCE_DIR = path.join(ROOT, 'marketing', 'android', 'en', 'app-store-shortlist');
const IOS_OUTPUT_DIR = path.join(ROOT, 'marketing', 'app-store', 'ios-6.9', 'en');
const ANDROID_OUTPUT_DIR = path.join(ROOT, 'marketing', 'app-store', 'android-phone', 'en');
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
].filter(Boolean);

const IOS_SLIDES = [
  {
    output: '01-monitor-projects.png',
    source: '01-projects.png',
    eyebrow: 'Projects',
    title: 'Monitor every Dokploy project',
    body: 'See live projects and service counts from a native iPhone command view.',
    accent: '#0a84ff',
  },
  {
    output: '02-inspect-requests.png',
    source: '02-requests.png',
    eyebrow: 'Traffic',
    title: 'Inspect request health live',
    body: 'Review Traefik request samples, response codes, hosts, and latency on the go.',
    accent: '#ff9f0a',
  },
];

const ANDROID_SLIDES = [
  {
    output: '01-monitor-projects.png',
    source: '01-projects-overview.png',
    eyebrow: 'Projects',
    title: 'Monitor every Dokploy project',
    body: 'See saved projects and service counts from a focused mobile command view.',
    accent: '#6ee7b7',
  },
  {
    output: '02-service-controls.png',
    source: '02-service-controls.png',
    eyebrow: 'Deployments',
    title: 'Act on services fast',
    body: 'Deploy, reload, rebuild, or stop services without opening the web dashboard.',
    accent: '#bfdbfe',
  },
  {
    output: '03-traffic-requests.png',
    source: '03-traffic-requests.png',
    eyebrow: 'Traffic',
    title: 'Inspect request health live',
    body: 'Review Traefik request samples, response codes, hosts, and latency on the go.',
    accent: '#facc15',
  },
  {
    output: '04-web-server-settings.png',
    source: '04-web-server-settings.png',
    eyebrow: 'Web Servers',
    title: 'Manage server domains and backups',
    body: 'Keep HTTPS settings and backup jobs close when production needs attention.',
    accent: '#f9a8d4',
  },
  {
    output: '05-notifications.png',
    source: '05-notification-routing.png',
    eyebrow: 'Alerts',
    title: 'Route operational alerts',
    body: 'Set up notification destinations for deployment, backup, and maintenance events.',
    accent: '#c4b5fd',
  },
  {
    output: '06-settings.png',
    source: '06-settings-overview.png',
    eyebrow: 'Settings',
    title: 'Keep operations organized',
    body: 'Switch organizations, reach operational tools, and tune preferences quickly.',
    accent: '#fdba74',
  },
];

const TARGETS = [
  {
    name: 'ios-6.9',
    width: 1320,
    height: 2868,
    sourceDir: IOS_SOURCE_DIR,
    outputDir: IOS_OUTPUT_DIR,
    slides: IOS_SLIDES,
    cssVars: {
      '--stage-padding-x': '96px',
      '--headline-top': '170px',
      '--device-width': '760px',
      '--device-top': '820px',
    },
  },
  {
    name: 'android-phone',
    width: 1080,
    height: 1920,
    sourceDir: ANDROID_SOURCE_DIR,
    outputDir: ANDROID_OUTPUT_DIR,
    slides: ANDROID_SLIDES,
    cssVars: {
      '--stage-padding-x': '72px',
      '--headline-top': '96px',
      '--device-width': '560px',
      '--device-top': '610px',
    },
  },
];

function findChrome() {
  for (const candidate of CHROME_PATHS) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {}
  }

  throw new Error('Google Chrome or Chromium was not found. Set CHROME_PATH to a headless Chrome binary.');
}

function fileUrl(filePath) {
  return `file://${filePath.replace(/#/g, '%23').replace(/\?/g, '%3F')}`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createHtml(slide, target) {
  const sourcePath = path.join(target.sourceDir, slide.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source screenshot: ${sourcePath}`);
  }

  const cssVars = Object.entries(target.cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n        ');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      :root {
        ${cssVars}
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        width: ${target.width}px;
        height: ${target.height}px;
        margin: 0;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
        color: #f8fafc;
        background: #07080a;
      }

      .stage {
        position: relative;
        width: ${target.width}px;
        height: ${target.height}px;
        padding: var(--headline-top) var(--stage-padding-x) 0;
        background:
          radial-gradient(circle at 82% 8%, color-mix(in srgb, ${slide.accent} 28%, transparent), transparent 28%),
          linear-gradient(155deg, #12151c 0%, #08090b 46%, #050506 100%);
      }

      .accent-line {
        width: 96px;
        height: 10px;
        border-radius: 999px;
        margin-bottom: 36px;
        background: ${slide.accent};
      }

      .eyebrow {
        margin: 0 0 22px;
        color: ${slide.accent};
        font-size: 34px;
        font-weight: 760;
        letter-spacing: 0;
      }

      h1 {
        width: 100%;
        max-width: 1040px;
        margin: 0;
        font-size: ${target.name === 'ios-6.9' ? 88 : 64}px;
        line-height: 1.02;
        letter-spacing: 0;
        font-weight: 830;
      }

      .body {
        width: 100%;
        max-width: 940px;
        margin-top: 30px;
        color: #cbd5e1;
        font-size: ${target.name === 'ios-6.9' ? 38 : 29}px;
        line-height: 1.28;
        letter-spacing: 0;
        font-weight: 520;
      }

      .device-wrap {
        position: absolute;
        left: 50%;
        top: var(--device-top);
        width: var(--device-width);
        transform: translateX(-50%);
        border-radius: ${target.name === 'ios-6.9' ? 76 : 56}px;
        padding: ${target.name === 'ios-6.9' ? 18 : 13}px;
        background: linear-gradient(145deg, #f9fafb, #737373 34%, #1f2937 58%, #050505);
        box-shadow:
          0 54px 120px rgb(0 0 0 / 60%),
          0 0 0 1px rgb(255 255 255 / 12%);
      }

      .device {
        position: relative;
        overflow: hidden;
        width: 100%;
        aspect-ratio: 1080 / 2400;
        border-radius: ${target.name === 'ios-6.9' ? 60 : 43}px;
        background: #000;
        box-shadow: inset 0 0 0 2px rgb(255 255 255 / 8%);
      }

      .device::before {
        content: "";
        position: absolute;
        z-index: 2;
        top: ${target.name === 'ios-6.9' ? 18 : 12}px;
        left: 50%;
        width: ${target.name === 'ios-6.9' ? 190 : 138}px;
        height: ${target.name === 'ios-6.9' ? 52 : 38}px;
        transform: translateX(-50%);
        border-radius: 999px;
        background: #050505;
        box-shadow: 0 0 0 1px rgb(255 255 255 / 10%);
      }

      .screenshot {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .brand {
        position: absolute;
        right: var(--stage-padding-x);
        bottom: ${target.name === 'ios-6.9' ? 74 : 44}px;
        color: #94a3b8;
        font-size: ${target.name === 'ios-6.9' ? 30 : 24}px;
        font-weight: 700;
        letter-spacing: 0;
      }
    </style>
  </head>
  <body>
    <main class="stage">
      <div class="accent-line"></div>
      <p class="eyebrow">${escapeHtml(slide.eyebrow)}</p>
      <h1>${escapeHtml(slide.title)}</h1>
      <p class="body">${escapeHtml(slide.body)}</p>
      <section class="device-wrap" aria-label="Dokploy Mobile screenshot">
        <div class="device">
          <img class="screenshot" src="${fileUrl(sourcePath)}" alt="">
        </div>
      </section>
      <div class="brand">Dokploy Mobile</div>
    </main>
  </body>
</html>`;
}

function renderSlide(chromePath, slide, target, tempDir) {
  fs.mkdirSync(target.outputDir, { recursive: true });

  const htmlPath = path.join(tempDir, `${target.name}-${slide.output}.html`);
  const outputPath = path.join(target.outputDir, slide.output);
  fs.writeFileSync(htmlPath, createHtml(slide, target));

  execFileSync(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-device-scale-factor=1',
      `--window-size=${target.width},${target.height}`,
      `--screenshot=${outputPath}`,
      fileUrl(htmlPath),
    ],
    { stdio: 'ignore' }
  );

  return outputPath;
}

function main() {
  const chromePath = findChrome();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dokploy-store-screenshots-'));
  const outputs = [];

  try {
    for (const target of TARGETS) {
      fs.rmSync(target.outputDir, { recursive: true, force: true });
      for (const slide of target.slides) {
        outputs.push(renderSlide(chromePath, slide, target, tempDir));
      }
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log(`Generated ${outputs.length} store screenshots:`);
  outputs.forEach((filePath) => console.log(path.relative(ROOT, filePath)));
}

main();
