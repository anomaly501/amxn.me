/* ==========================================
   THE MATRIX PORTFOLIO - CORE ENGINE SCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------
     1. WEB AUDIO SYNTHESIZER (SOUND FX)
     ------------------------------------------ */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.05) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }

    playKeystroke() {
      const freqs = [600, 750, 900, 1100];
      const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
      this.playTone(randomFreq, 'square', 0.03, 0.02);
    }

    playChime() {
      this.playTone(440, 'sine', 0.15, 0.08);
      setTimeout(() => this.playTone(880, 'sine', 0.25, 0.08), 100);
    }

    playGlitchSound() {
      this.playTone(150, 'sawtooth', 0.2, 0.06);
      setTimeout(() => this.playTone(400, 'square', 0.15, 0.05), 80);
    }
  }

  const sound = new SoundEngine();

  // Audio Toggle UI
  const audioToggleBtn = document.getElementById('toggle-audio');
  const audioIcon = document.getElementById('audio-icon');
  const audioStatus = document.getElementById('audio-status');

  audioToggleBtn?.addEventListener('click', () => {
    sound.enabled = !sound.enabled;
    sound.init();
    if (sound.enabled) {
      audioIcon.textContent = '🔊';
      audioStatus.textContent = 'ON';
      sound.playChime();
    } else {
      audioIcon.textContent = '🔇';
      audioStatus.textContent = 'OFF';
    }
  });

  // CRT Overlay Toggle UI
  const crtToggleBtn = document.getElementById('toggle-crt');
  const crtOverlay = document.getElementById('crt-overlay');

  crtToggleBtn?.addEventListener('click', () => {
    sound.playKeystroke();
    crtOverlay.classList.toggle('disabled');
  });

  /* Hologram / HD Mode Toggle Handler */
  const toggleAvatarBtn = document.getElementById('toggle-avatar-mode');
  const operatorImg = document.getElementById('operator-img');
  const hologramBadge = document.getElementById('hologram-mode-badge');

  toggleAvatarBtn?.addEventListener('click', () => {
    sound.playChime();
    operatorImg?.classList.toggle('hologram-mode');
    if (operatorImg?.classList.contains('hologram-mode')) {
      hologramBadge.textContent = '[HOLOGRAM_ACTIVE]';
      hologramBadge.style.color = 'var(--matrix-green)';
    } else {
      hologramBadge.textContent = '[DECODED_HD_ACTIVE]';
      hologramBadge.style.color = '#fff';
    }
  });

  /* ------------------------------------------
     2. MATRIX DIGITAL RAIN CANVAS RENDERER
     ------------------------------------------ */
  const canvas = document.getElementById('matrix-rain');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const characters = 'アカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズブヅプエケセテネヘメレヱゲゼデベペオコソトノホモヨロヲゴゾドボポ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}/*+=~';
  const fontSize = 16;
  let columns = Math.floor(width / fontSize);
  let drops = Array(columns).fill(1);
  let rainBoost = false;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = Array(columns).fill(1);
  });

  function drawMatrixRain() {
    // Translucent black overlay to create falling trail fade
    ctx.fillStyle = 'rgba(5, 8, 5, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = characters.charAt(Math.floor(Math.random() * characters.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Leading character is bright white/light-green, trails are matrix green
      if (Math.random() > 0.92) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#00ff41';
        ctx.shadowColor = '#003b00';
        ctx.shadowBlur = 4;
      }

      ctx.fillText(char, x, y);

      // Reset drop to top once it hits bottom
      const speedMultiplier = rainBoost ? 0.95 : 0.975;
      if (y > height && Math.random() > speedMultiplier) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  setInterval(drawMatrixRain, 33); // ~30FPS smooth rain

  /* ------------------------------------------
     3. TYPEWRITER & RED/BLUE PILL INTRO MODAL
     ------------------------------------------ */
  const introModal = document.getElementById('intro-modal');
  const typewriterElement = document.getElementById('intro-typewriter');
  const pillChoiceBox = document.getElementById('pill-choice-box');
  const btnRedPill = document.getElementById('btn-red-pill');
  const btnBluePill = document.getElementById('btn-blue-pill');

  const introText = "Wake up, Neo...\n\nThe Matrix has you...\n\nFollow the white rabbit.\n\nKnock, knock, Neo.";
  let charIndex = 0;

  function typeIntroMessage() {
    if (charIndex < introText.length) {
      const char = introText.charAt(charIndex);
      if (char === '\n') {
        typewriterElement.innerHTML += '<br>';
      } else {
        typewriterElement.innerHTML += char;
      }
      charIndex++;
      sound.playKeystroke();
      setTimeout(typeIntroMessage, 60);
    } else {
      // Reveal Pill Choice Buttons
      pillChoiceBox.classList.add('visible');
    }
  }

  // Start typing after short pause
  setTimeout(typeIntroMessage, 500);

  function enterConstruct(theme = 'red') {
    sound.playChime();
    introModal.classList.add('hidden');
    sound.init();

    if (theme === 'blue') {
      alert("IGNORANCE IS BLISS...\n\n(You took the blue pill, but the Operator decided to show you the Matrix construct anyway!)");
    }
  }

  btnRedPill?.addEventListener('click', () => enterConstruct('red'));
  btnBluePill?.addEventListener('click', () => enterConstruct('blue'));

  /* ------------------------------------------
     4. PROJECTS CONSTRUCT DATA & RENDERER
     ------------------------------------------ */
  const projectsData = [
    {
      id: 'P01',
      title: 'ZION_DEFENSE_OS',
      category: 'cyber',
      desc: 'Distributed cyber threat detection engine written in Rust and WebAssembly. Analyzes network telemetry in real-time.',
      tech: ['Rust', 'WebAssembly', 'TypeScript', 'WebSockets'],
      code: 'RUST_DEFENSE_V1.RS',
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'P02',
      title: 'NEBUCHADNEZZAR_CLI',
      category: 'system',
      desc: 'High-speed terminal system monitor providing CPU, memory, process tree, and packet monitoring.',
      tech: ['Node.js', 'Go', 'Docker', 'Linux CLI'],
      code: 'CLI_TELEMETRY.GO',
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'P03',
      title: 'MATRIX_RELOADED_UI',
      category: 'web',
      desc: '3D WebGL cyber dashboard constructed using Three.js and React with live WebSocket data streaming.',
      tech: ['React', 'Three.js', 'WebGL', 'Tailwind/CSS'],
      code: 'CONSTRUCT_VIEW.TSX',
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'P04',
      title: 'ORACLE_AI_PREDICTOR',
      category: 'cyber',
      desc: 'Deep neural network anomaly detection model trained to predict security breaches and matrix glitches.',
      tech: ['Python', 'PyTorch', 'FastAPI', 'Redis'],
      code: 'ORACLE_NEURAL.PY',
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'P05',
      title: 'CYPHER_VAULT_DB',
      category: 'system',
      desc: 'Zero-knowledge encrypted key-value store utilizing AES-256-GCM and memory-safe cryptography.',
      tech: ['C++', 'AES-256', 'PostgreSQL', 'Docker'],
      code: 'VAULT_CRYPTO.CPP',
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'P06',
      title: 'AGENT_SMITH_MONITOR',
      category: 'web',
      desc: 'Microservice process watchdog with real-time graph metrics, incident auto-healing, and alerting.',
      tech: ['Next.js', 'Node.js', 'GraphQL', 'Chart.js'],
      code: 'SMITH_WATCHDOG.TS',
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    }
  ];

  const projectsGrid = document.getElementById('projects-grid');
  const projectFilters = document.getElementById('project-filters');

  function renderProjects(filter = 'all') {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    const filtered = filter === 'all' 
      ? projectsData 
      : projectsData.filter(p => p.category === filter);

    filtered.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card-header">
          <span>PROGRAM [${proj.id}]</span>
          <span>${proj.code}</span>
        </div>
        <div class="project-card-body">
          <h3 class="project-title">${proj.title}</h3>
          <p class="project-desc">${proj.desc}</p>
          <div class="tech-tags">
            ${proj.tech.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="project-actions">
            <button class="btn-cyber open-modal-btn" data-id="${proj.id}" style="font-size:0.8rem; padding:8px 14px;">
              INSPECT PROGRAM
            </button>
          </div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });

    // Attach modal trigger listeners
    document.querySelectorAll('.open-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openProjectModal(id);
      });
    });
  }

  renderProjects('all');

  // Filter Buttons Event Listener
  projectFilters?.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      sound.playKeystroke();
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderProjects(filter);
    }
  });

  /* Modal Dialog Logic */
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-project-title');
  const modalCode = document.getElementById('modal-project-code');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalTech = document.getElementById('modal-project-tech');

  function openProjectModal(projId) {
    const proj = projectsData.find(p => p.id === projId);
    if (!proj) return;

    sound.playChime();
    modalTitle.textContent = proj.title;
    modalCode.textContent = `${proj.code} // ID: ${proj.id}`;
    modalDesc.textContent = proj.desc;
    modalTech.innerHTML = proj.tech.map(t => `<span class="tag">${t}</span>`).join('');

    projectModal.classList.add('active');
  }

  modalCloseBtn?.addEventListener('click', () => {
    sound.playKeystroke();
    projectModal.classList.remove('active');
  });

  projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      projectModal.classList.remove('active');
    }
  });

  /* ------------------------------------------
     5. SKILL MATRIX DATA & RENDERER
     ------------------------------------------ */
  const skillsData = [
    {
      category: 'FRONTEND CYBERNETICS',
      items: [
        { name: 'React / Next.js', percent: 95 },
        { name: 'TypeScript', percent: 90 },
        { name: 'WebGL / Three.js', percent: 85 },
        { name: 'Vanilla CSS / Modern Layouts', percent: 95 }
      ]
    },
    {
      category: 'BACKEND & SYSTEMS',
      items: [
        { name: 'Node.js / Express', percent: 92 },
        { name: 'Rust & WebAssembly', percent: 88 },
        { name: 'Python / FastAPI', percent: 85 },
        { name: 'PostgreSQL / Redis', percent: 90 }
      ]
    },
    {
      category: 'CLOUD & INFRASTRUCTURE',
      items: [
        { name: 'Docker / Kubernetes', percent: 88 },
        { name: 'AWS & Cloud Security', percent: 85 },
        { name: 'CI/CD Automated Pipelines', percent: 90 },
        { name: 'Linux System Administration', percent: 94 }
      ]
    },
    {
      category: 'CORE INTELLIGENCE',
      items: [
        { name: 'Neural Networks & AI APIs', percent: 82 },
        { name: 'Cybersecurity Architecture', percent: 88 },
        { name: 'Data Encryption (AES / RSA)', percent: 90 },
        { name: 'Algorithmic Optimization', percent: 92 }
      ]
    }
  ];

  const skillsGrid = document.getElementById('skills-grid');

  function renderSkills() {
    if (!skillsGrid) return;
    skillsGrid.innerHTML = '';

    skillsData.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'skill-category-card';
      card.innerHTML = `
        <h3 class="category-title">
          <span>⚡</span> ${cat.category}
        </h3>
        ${cat.items.map(item => `
          <div class="skill-item">
            <div class="skill-info">
              <span class="skill-name">${item.name}</span>
              <span class="skill-percentage">${item.percent}%</span>
            </div>
            <div class="skill-bar-bg">
              <div class="skill-bar-fill" data-percent="${item.percent}"></div>
            </div>
          </div>
        `).join('')}
      `;
      skillsGrid.appendChild(card);
    });

    // IntersectionObserver to animate skill bar filling when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-bar-fill').forEach(fill => {
            const p = fill.getAttribute('data-percent');
            fill.style.width = `${p}%`;
          });
        }
      });
    }, { threshold: 0.2 });

    observer.observe(skillsGrid);
  }

  renderSkills();

  /* ------------------------------------------
     6. INTERACTIVE TERMINAL CLI (SHELL ENGINE)
     ------------------------------------------ */
  const terminalInput = document.getElementById('terminal-input');
  const terminalHistory = document.getElementById('terminal-history');
  const terminalViewport = document.getElementById('terminal-viewport');

  let commandHistoryArray = [];
  let historyIndex = -1;

  function appendTerminalLine(text, isCommand = false) {
    const line = document.createElement('div');
    line.className = 'terminal-output-line';
    if (isCommand) {
      line.innerHTML = `<span style="color:var(--matrix-green); font-weight:bold;">neo@matrix-construct:~$</span> ${text}`;
    } else {
      line.innerHTML = text;
    }
    terminalHistory?.appendChild(line);
    terminalViewport.scrollTop = terminalViewport.scrollHeight;
  }

  function processCommand(cmd) {
    const cleanCmd = cmd.trim().toLowerCase();
    sound.playGlitchSound();

    if (!cleanCmd) return;

    appendTerminalLine(cmd, true);
    commandHistoryArray.push(cmd);
    historyIndex = commandHistoryArray.length;

    const parts = cleanCmd.split(' ');
    const mainCommand = parts[0];

    switch (mainCommand) {
      case 'help':
        appendTerminalLine(`Available Commands:
  <span style="color:#fff;">help</span>        - Display this menu
  <span style="color:#fff;">whoami</span>      - Display current operator profile
  <span style="color:#fff;">projects</span>    - List all decoded construct programs
  <span style="color:#fff;">skills</span>      - Show neural capabilities
  <span style="color:#fff;">contact</span>     - Show signal transmission endpoints
  <span style="color:#fff;">matrix</span>      - Boost digital rain speed & intensity
  <span style="color:#fff;">date</span>        - Display system timestamp
  <span style="color:#fff;">clear</span>       - Clear shell screen
  <span style="color:#fff;">sudo</span>        - Request root permissions`);
        break;

      case 'whoami':
        appendTerminalLine(`OPERATOR: Aman Kumar (The Architect)
DISCIPLINE: Senior Full-Stack & Cybernetic Software Engineer
SECURITY CLEARANCE: Level 5 Root Access
STATUS: Unplugged from the Construct.`);
        break;

      case 'projects':
        appendTerminalLine(`Decoded Construct Programs:
${projectsData.map(p => `  • <span style="color:#fff;">${p.title}</span> [${p.category.toUpperCase()}] - ${p.desc}`).join('\n')}`);
        break;

      case 'skills':
        appendTerminalLine(`Neural Capabilities Summary:
  • Frontend: React, Next.js, TypeScript, WebGL, CSS Glassmorphism
  • Backend: Node.js, Rust, WASM, Python, PostgreSQL, Redis
  • DevOps: Docker, Kubernetes, AWS, CI/CD, Linux Admin`);
        break;

      case 'contact':
        appendTerminalLine(`Transmission Channels:
  • Email: neo@matrix-construct.io
  • GitHub: github.com/matrix-operator
  • LinkedIn: linkedin.com/in/matrix-operator`);
        break;

      case 'matrix':
        rainBoost = !rainBoost;
        appendTerminalLine(rainBoost 
          ? `<span style="color:#fff; font-weight:bold;">[MATRIX OVERDRIVE ACTIVATED] Digital rain speed boosted!</span>`
          : `[MATRIX NORMAL MODE] Digital rain returned to normal speed.`);
        break;

      case 'date':
        appendTerminalLine(`SYSTEM TIMESTAMP: ${new Date().toISOString()}`);
        break;

      case 'clear':
        terminalHistory.innerHTML = '';
        break;

      case 'sudo':
        appendTerminalLine(`<span style="color:var(--red-pill);">AGENT SMITH: Access Denied! Sudo privileges restricted to Zion Council.</span>`);
        break;

      default:
        appendTerminalLine(`Command not recognized: '<span style="color:var(--red-pill);">${cleanCmd}</span>'. Type '<span style="color:#fff;">help</span>' for available options.`);
        break;
    }
  }

  terminalInput?.addEventListener('keydown', (e) => {
    sound.playKeystroke();
    if (e.key === 'Enter') {
      const value = terminalInput.value;
      terminalInput.value = '';
      processCommand(value);
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistoryArray[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistoryArray.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistoryArray[historyIndex];
      } else {
        historyIndex = commandHistoryArray.length;
        terminalInput.value = '';
      }
    }
  });

  /* ------------------------------------------
     7. ENCRYPTED CONTACT FORM SUBMIT ANIMATION
     ------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    sound.playChime();

    const originalText = submitBtn.innerHTML;
    let iterations = 0;
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$@!%';

    const interval = setInterval(() => {
      submitBtn.innerHTML = `<span>⚡</span> TRANSMITTING: ${Array(16)
        .fill(0)
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join('')}`;
      
      iterations++;
      if (iterations > 15) {
        clearInterval(interval);
        submitBtn.innerHTML = `<span>✔</span> SIGNAL SENT SUCCESSFULLY!`;
        submitBtn.style.background = 'var(--matrix-green)';
        submitBtn.style.color = '#000';

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
          contactForm.reset();
        }, 3500);
      }
    }, 80);
  });

  // Smooth Active Nav Link Highlighting on Scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 120) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

});
