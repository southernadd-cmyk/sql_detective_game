/**
 * Dynamically generates app cards from JSON data
 */

// Apps data embedded directly to avoid fetch issues when opening file://
const appsData = [
  {
    "id": "think2code",
    "title": "Think2Code",
    "description": "A visual IDE where learners build flowcharts that generate Python code. Includes 30 challenges with a Submit and Test feature to check answers.",
    "image": "images/think2code-screenshot.jpg",
    "imageAlt": "Think2Code interface",
    "badge": "Python",
    "badgeClass": "python",
    "launchUrl": "https://think2code.toolsforteaching.co.uk/",
    "githubUrl": "https://github.com/southernadd-cmyk/think2code",
    "buyMeACoffeeUrl": "https://buymeacoffee.com/adamclement",
    "moreInfoKey": "think2code",
    "moreInfo": {
      "title": "Think2Code - More info",
      "body": "<h2>Think2Code - Visual Flowcharts That Generate Real Python</h2><p><strong>Think2Code</strong> is a browser-based learning tool where students build <strong>flowcharts</strong> that compile into <strong>real Python code</strong>. It helps learners understand programming logic before they get stuck on syntax.</p><hr /><h3>What It Does</h3><ul><li>Students drag and connect flowchart blocks to build an algorithm</li><li>The flowchart compiles into readable Python automatically</li><li>Students can run the program and view output in the browser</li><li>Flowcharts can be used to teach sequence, selection, iteration, and variables</li></ul><hr /><h3>Challenges + Submit and Test</h3><p>Think2Code includes built-in challenges that students can complete independently. Each challenge focuses on a specific programming skill (such as inputs, decisions, loops, or lists).</p><p>Challenges include a <strong>Submit and Test</strong> feature which automatically checks the student's solution and marks it as <strong>correct</strong> or <strong>incorrect</strong>. This is ideal for self-paced learning and quick formative assessment.</p><hr /><h3>Teacher tips (quick)</h3><ul><li>Start with <strong>sequence</strong> challenges, then move to <strong>if</strong> and <strong>loops</strong></li><li>Ask students to predict output before pressing run</li><li>Use Submit and Test as an \"exit ticket\" task at the end of a lesson</li></ul>"
    }
  },
  {
    "id": "kanban",
    "title": "Kanban Pizza Game",
    "description": "A real-time multiplayer game where teams run a pizza kitchen in timed rounds. Anyone can join a room using a shared room name.",
    "image": "images/kanbanpizza-screenshot.jpg",
    "imageAlt": "Kanban Pizza Game interface",
    "badge": "Agile Working",
    "badgeClass": "agile",
    "launchUrl": "https://kanbanpizzagame.toolsforteaching.co.uk/",
    "githubUrl": "https://github.com/southernadd-cmyk/kanbanpizza2",
    "buyMeACoffeeUrl": "https://buymeacoffee.com/adamclement",
    "moreInfoKey": "kanban",
    "moreInfo": {
      "title": "Kanban Pizza Game - More info",
      "body": "<h2>Kanban Pizza Game - Collaborative Agile Workflow Simulator</h2><p><strong>Kanban Pizza Game</strong> is a real-time multiplayer classroom game where learners work together to run a pizza kitchen. It teaches <strong>Agile workflow</strong>, <strong>WIP limits</strong>, <strong>bottlenecks</strong>, and <strong>continuous improvement</strong> through timed rounds.</p><p>Anyone can join or setup a room: students simply enter a room name shared someone else. There are no accounts, logins, or special permissions required.</p><hr /><h3>Copy link to room (fast classroom setup)</h3><ol><li>Open the game on the teacher PC</li><li>Create / enter a room name (e.g. <code>H217</code> or <code>TeamA</code>)</li><li>Copy the room link from the address bar and share it on Teams / the board</li></ol><p>Tip: the join screen also provides a <strong>QR code</strong> so students can join instantly on phones/tablets.</p><hr /><h3>What Students Learn</h3><ul><li><strong>Kanban workflow</strong> (work moving through stages)</li><li><strong>WIP limits</strong> and why doing less at once can deliver more</li><li><strong>Team coordination</strong> under time pressure</li><li><strong>Bottleneck spotting</strong> (where work gets stuck)</li><li><strong>Improvement cycles</strong> (getting better each round)</li></ul><hr /><h3>Teacher tips (quick)</h3><ul><li>Run a short \"chaos round\" first, then introduce roles</li><li>Assign roles (prep / build / deliver) to reduce confusion</li><li>Pause after each round and ask: \"Where did work pile up?\"</li></ul>"
    }
  },
  {
    "id": "bash",
    "title": "Bash Game",
    "description": "An interactive terminal adventure that teaches real bash commands through puzzles and exploration. Great for Linux basics and cybersecurity foundations.",
    "image": "images/bashgame-screenshot.jpg",
    "imageAlt": "Bash Game interface",
    "badge": "Terminal",
    "badgeClass": "terminal",
    "launchUrl": "https://bashgame.toolsforteaching.co.uk/",
    "githubUrl": "https://github.com/southernadd-cmyk/bashgame/",
    "buyMeACoffeeUrl": "https://buymeacoffee.com/adamclement",
    "moreInfoKey": "bash",
    "moreInfo": {
      "title": "Bash Game - More info",
      "body": "<h2>Bash Game - Learn Linux Commands Through a Terminal Adventure</h2><p><strong>Bash Game</strong> is an interactive terminal-style text adventure. Students progress by typing <strong>real Linux commands</strong> correctly to explore, find clues, and solve puzzles.</p><hr /><h3>Commands Practised</h3><ul><li><code>pwd</code> - show current directory</li><li><code>ls</code> - list files</li><li><code>cd</code> - change directory</li><li><code>cat</code> - read a file</li><li><code>grep</code> - search inside files</li><li><code>mkdir</code> / <code>touch</code> - create folders/files</li><li><code>mv</code> - move/rename files</li><li><code>rm</code> - delete files (carefully)</li></ul><hr /><h3>Common Mistakes</h3><ul><li><strong>Case matters:</strong> <code>File.txt</code> is not the same as <code>file.txt</code></li><li><strong>Spaces matter:</strong> <code>cd folder</code> not <code>cdfolder</code></li><li><strong>Feeling lost?</strong> use <code>pwd</code> then <code>ls</code></li></ul><hr /><h3>Teacher tips (quick)</h3><ul><li>Give students a \"command bank\" on the board for the first 10 minutes</li><li>Ask students to explain what each command did in plain English</li><li>Use it as a warm-up before Git / servers / cybersecurity labs</li></ul>"
    }
  },
  {
    "id": "sqldetective",
    "title": "SQL Detective Game",
    "description": "An interactive browser-based SQL learning game where students solve a detective mystery by writing SQL queries. Features a visual query builder and stylized result viewer.",
    "image": "images/sql-detective-screenshot.jpg",
    "imageAlt": "SQL Detective Game interface",
    "badge": "SQL",
    "badgeClass": "sql",
    "launchUrl": "https://conansql.toolsforteaching.co.uk/",
    "githubUrl": "https://github.com/southernadd-cmyk/sql-detective-game",
    "buyMeACoffeeUrl": "https://buymeacoffee.com/adamclement",
    "moreInfoKey": "sqldetective",
    "moreInfo": {
      "title": "SQL Detective Game - More info",
      "body": "<h2>SQL Detective Game - Learn SQL by Solving a Mystery</h2><p><strong>SQL Detective Game</strong> is an interactive browser-based learning tool where students solve a detective mystery by writing <strong>SQL queries</strong>. The game features a visual query builder with drag-and-drop functionality and a stylized SQL result viewer.</p><hr /><h3>The Case</h3><p>Graffiti has appeared on a wall in Exeter city center with the message \"SQL is Rubbish\". Students must investigate this crime by querying a SQLite database to piece together a timeline of events and identify the culprit.</p><hr /><h3>What It Does</h3><ul><li>Students write SQL queries to explore a database of suspects, locations, timeline, witnesses, evidence, and CCTV footage</li><li>Visual query builder allows drag-and-drop query construction without typing</li><li>Traditional SQL editor with syntax highlighting for direct query writing</li><li>Clue system unlocks as students run specific queries</li><li>Everything runs client-side using sql.js (SQLite in the browser) - no backend required</li></ul><hr /><h3>Skills Practised</h3><ul><li><code>SELECT</code> statements and filtering with <code>WHERE</code></li><li>Sorting with <code>ORDER BY</code></li><li>Joining multiple tables with <code>JOIN</code></li><li>Aggregating data with <code>GROUP BY</code></li><li>Understanding database relationships</li><li>Analyzing data to solve problems</li></ul><hr /><h3>Teacher tips (quick)</h3><ul><li>Start with simple <code>SELECT * FROM</code> queries to explore tables</li><li>Use the visual builder for beginners, then move to the SQL editor</li><li>Encourage students to predict results before running queries</li><li>Ask students to explain their queries in plain English</li></ul>"
    }
  }
];

// Make appsData globally accessible
window.appsData = appsData;

function loadAppCards() {
  const toolsGrid = document.querySelector('.tools-grid');
  if (!toolsGrid) {
    console.error('Tools grid not found');
    return;
  }

  // Clear existing cards
  toolsGrid.innerHTML = '';

  // Generate cards for each app
  appsData.forEach((app, index) => {
    const card = createAppCard(app, index);
    toolsGrid.appendChild(card);
  });

  // Re-observe cards for animations after they're added
  observeToolCards();
}

function createAppCard(app, index) {
  const article = document.createElement('article');
  article.className = 'tool-card';
  
  // Set animation delay based on index
  if (index === 0) {
    article.style.animationDelay = '0.1s';
  } else if (index === 1) {
    article.style.animationDelay = '0.15s';
  } else if (index === 2) {
    article.style.animationDelay = '0.2s';
  } else if (index === 3) {
    article.style.animationDelay = '0.25s';
  }

  article.innerHTML = `
    <img src="${app.image}" alt="${app.imageAlt}" class="tool-card-image" loading="lazy">
    <div class="tool-card-content">
      <div class="tool-card-header">
        <h3 class="tool-card-title">${app.title}</h3>
        <span class="tool-badge ${app.badgeClass}">${app.badge}</span>
      </div>
      <p class="tool-card-description">
        ${app.description}
      </p>
      <div class="tool-card-actions">
        <button class="more-info-btn"
                type="button"
                aria-label="More info about ${app.title}"
                title="More info"
                data-moreinfo="${app.moreInfoKey}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20Zm0 15a1 1 0 0 1-1-1v-4a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1Zm0-9a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 12 8Z"/>
          </svg>
          More info
        </button>
        <a href="${app.launchUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          Launch ↗
        </a>
        <a href="${app.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          GitHub ↗
        </a>
        <div class="bmc-right" style="transform: scale(0.85); transform-origin: right center;">
          <a class="bmc-icon"
             href="${app.buyMeACoffeeUrl || 'https://buymeacoffee.com/adamclement'}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Buy the ${app.title} dev a coffee"
             title="Buy the ${app.title} dev a coffee">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M6.5 8.5h9v6.2c0 2-1.6 3.8-3.8 3.8H10.3c-2.2 0-3.8-1.8-3.8-3.8V8.5z"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M15.5 9.6h1.3c1.7 0 2.7 1.1 2.7 2.4s-1 2.4-2.7 2.4h-1.3"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M9 3.5c1.2 1.1 1.2 2.6 0 3.7M12 3.5c1.2 1.1 1.2 2.6 0 3.7"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M6 19.5h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `;

  return article;
}

// Load cards when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAppCards);
} else {
  loadAppCards();
}
