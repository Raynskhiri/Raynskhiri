// rayen@soc: a pretend shell for people who live in terminals.
// Loaded only when someone presses ` (backtick). Nothing here is a real shell:
// it is a small interpreter over a fake file system made of the site's content.
// Every command you type is also run through my detection rules
// (the same engine as detections.rayenskhiri.online), so some of them get caught.

const PLAYGROUND = "https://detections.rayenskhiri.online";
const THREATWATCH = "https://threatwatch.rayenskhiri.online/stats.json";
const HOME = "/home/rayen";

// ---------------------------------------------------------------- file system

const FILES = {
  "/home/rayen/about.txt": `Rayen Skhiri
SOC Analyst L2/L3 · Web Application Security · Tunis, Tunisia

I defend by thinking like the attacker.
L2/L3 investigations across many client environments on Cortex XDR,
from alert triage to the incident report the client reads.
CRTP certified, top 700 on Hack The Box, former Securinets member
(CTF challenge author and workshop facilitator).
When something repetitive slows the team down, I automate it in Python.

Open to SOC, DFIR and AppSec roles. Type 'contact'.`,
  "/home/rayen/contact.txt": `email     skhirirayen@outlook.com
linkedin  https://www.linkedin.com/in/rayen-skhiri
github    https://github.com/Raynskhiri

Or type 'hire' and I'll take you to the contact form.`,
  "/home/rayen/skills.txt": `security operations  Cortex XDR, XQL, Splunk SPL, FortiGate, MITRE ATT&CK, incident response
offensive            Active Directory (CRTP), Burp Suite, OWASP Top 10, Kali, Metasploit
automation           Python, Bash, GitHub Actions, Docker, Git, Linux
platforms            Hack The Box (top 700), TryHackMe, Root-Me`,
  "/home/rayen/certs/CRTP.txt": `Certified Red Team Professional (Altered Security)   status: certified
Active Directory enumeration, Kerberos attacks, delegation, trusts, persistence.`,
  "/home/rayen/certs/in-progress.txt": `Splunk Core Certified Power User        preparing
Palo Alto Networks Certified XDR Analyst preparing
EC-Council Certified SOC Analyst         preparing`,
  "/home/rayen/projects/maghreb-threat-watch.md": `# Maghreb Threat Watch   [live]
Daily early warning for lookalike and phishing domains targeting 45 banks,
telecoms and public services in Tunisia, Morocco and Algeria.
Every score is explained; every finding ships with an XQL and SPL hunt.

dashboard  https://threatwatch.rayenskhiri.online
source     https://github.com/Raynskhiri/maghreb-threat-watch
try        threatwatch`,
  "/home/rayen/projects/malwarescope.md": `# MalwareScope   [master's thesis, with Omar Kharrat]
A trained Random Forest classifies Windows executables, an LLM explains the
verdict, and an isolated Windows sandbox shows what the file really does.
82% vs 36% for an LLM alone on the same samples. 437 tests.
It refuses to run a sample it cannot watch.

source     https://github.com/Raynskhiri/MalwareScope`,
  "/home/rayen/projects/detection-library.md": `# Detection library   [29 rules]
Each detection written once in YAML, compiled to Cortex XQL and Splunk SPL,
mapped to ATT&CK, with triage steps. CI checks Python, the compiled queries
and the browser engine against the same 800+ events.

playground https://detections.rayenskhiri.online
source     https://github.com/Raynskhiri/detection-library
try        detect rundll32 comsvcs.dll #24 624 C:\\x.bin full`,
  "/home/rayen/projects/soc-triage-agent.md": `# SOC triage agent   [in progress]
A local LLM agent that investigates Cortex XDR alerts, builds the timeline
and drafts a verdict. Nothing is contained or sent to a client until a human
approves it in Slack.`,
  "/home/rayen/.bash_history": `nmap -sC -sV 10.10.11.42
evil-winrm -i dc01 -u svc_sql -H <redacted>
python3 -m detlib test
git push origin main
sudo make me a sandwich`,
  "/etc/motd": `Authorized use only. Curiosity is welcome.`,
  "/etc/hostname": `soc`,
  "/etc/passwd": `root:x:0:0:root:/root:/bin/bash
rayen:x:1000:1000:Rayen Skhiri,,,:/home/rayen:/bin/bash
recruiter:x:1001:1001:You, probably:/home/recruiter:/bin/bash`,
};
const SECRET = "/home/rayen/.secrets";
const DIRS = new Set(["/", "/home", "/etc", "/root", HOME, `${HOME}/projects`, `${HOME}/certs`, SECRET]);
const LINKS = {
  about: "#about", services: "#services", stack: "#stack", projects: "#projects", contact: "#contact",
  threatwatch: "https://threatwatch.rayenskhiri.online", playground: PLAYGROUND, detections: PLAYGROUND,
  github: "https://github.com/Raynskhiri", linkedin: "https://www.linkedin.com/in/rayen-skhiri",
  malwarescope: "https://github.com/Raynskhiri/MalwareScope",
  "detection-library": "https://github.com/Raynskhiri/detection-library",
  "maghreb-threat-watch": "https://github.com/Raynskhiri/maghreb-threat-watch",
};

function norm(path, cwd) {
  if (!path || path === "~") return HOME;
  let p = path.replace(/^~(?=\/|$)/, HOME).replace(/\\/g, "/").replace(/^[A-Za-z]:/, "");
  if (!p.startsWith("/")) p = `${cwd}/${p}`;
  const out = [];
  for (const part of p.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop(); else out.push(part);
  }
  return "/" + out.join("/");
}

function children(dir) {
  const names = new Set();
  const prefix = dir === "/" ? "/" : dir + "/";
  for (const p of [...Object.keys(FILES), ...DIRS]) {
    if (p !== dir && p.startsWith(prefix)) names.add(p.slice(prefix.length).split("/")[0]);
  }
  return [...names].sort();
}

const isDir = (p) => DIRS.has(p);
const isFile = (p) => Object.prototype.hasOwnProperty.call(FILES, p);

// ---------------------------------------------------------------- detections

let enginePromise = null;
function loadEngine() {
  if (!enginePromise) {
    enginePromise = Promise.all([
      import(`${PLAYGROUND}/engine.js`),
      fetch(`${PLAYGROUND}/data/rules.json`).then((r) => r.json()),
    ]).then(([engine, lib]) => ({ engine, rules: lib.rules })).catch(() => null);
  }
  return enginePromise;
}

async function detect(line, mode) {
  const loaded = await loadEngine();
  if (!loaded) return [];
  const { engine, rules } = loaded;
  const parsed = mode === "pwsh"
    ? { logsource: "process_creation", event: { "process.name": "powershell.exe", "process.command_line": `powershell.exe -c ${line}`, "parent.name": "explorer.exe" } }
    : engine.parseCommandLine(line, "bash");
  return engine.evaluate(rules, parsed.logsource, parsed.event);
}

// ---------------------------------------------------------------- UI

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const linkify = (s) => esc(s).replace(/https?:\/\/[^\s)]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);

export function openTerminal() {
  const existing = document.getElementById("rterm");
  if (existing) { existing.hidden = false; existing.querySelector("input").focus(); return; }

  const lastFocus = document.activeElement;
  const root = document.createElement("div");
  root.id = "rterm";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Terminal");
  root.innerHTML = `
    <div class="rt-win">
      <div class="rt-bar"><span class="rt-dots"><i></i><i></i><i></i></span><span class="rt-title">rayen@soc: ~</span>
        <button class="rt-x" type="button" aria-label="Close terminal">esc</button></div>
      <div class="rt-out" aria-live="polite"></div>
      <form class="rt-line" autocomplete="off"><label class="rt-ps"></label>
        <input class="rt-in" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Command"></form>
    </div>`;
  document.body.appendChild(root);

  const out = root.querySelector(".rt-out");
  const input = root.querySelector(".rt-in");
  const ps = root.querySelector(".rt-ps");
  const title = root.querySelector(".rt-title");
  const state = { cwd: HOME, mode: "bash", history: [], hi: 0 };

  const prompt = () => (state.mode === "bash"
    ? `<span class="g">rayen@soc</span>:<span class="b">${esc(state.cwd.replace(HOME, "~"))}</span>$`
    : `PS C:${esc(state.cwd.replace(/\//g, "\\") || "\\")}>`);
  const refreshPrompt = () => {
    ps.innerHTML = prompt();
    title.textContent = state.mode === "bash" ? `rayen@soc: ${state.cwd.replace(HOME, "~")}` : "Windows PowerShell";
    root.classList.toggle("pwsh", state.mode === "pwsh");
  };
  const print = (html, cls = "") => {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  const text = (s, cls) => print(linkify(s), cls);
  const close = () => { root.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); };

  print(`<span class="o">rayen@soc</span> · a pretend shell for terminal people. Nothing here is real, except the content.
Type <b>help</b> to start, <b>pwsh</b> if you are a Windows admin, <b>esc</b> to leave.
<span class="d">Every command is run through my detection rules. Some of them will get caught.</span>`);
  refreshPrompt();
  input.focus();
  loadEngine();

  // ------------------------------------------------------------ commands

  const go = (target) => {
    const url = LINKS[target] || (target && target.startsWith("http") ? target : null);
    if (!url) { text(`open: unknown target '${target}'. Try: ${Object.keys(LINKS).join(", ")}`, "e"); return; }
    text(`opening ${url}`);
    if (url.startsWith("#")) { close(); document.querySelector(url)?.scrollIntoView({ behavior: "smooth" }); }
    else window.open(url, "_blank", "noopener");
  };

  const listing = (path, long) => {
    const p = norm(path, state.cwd);
    if (p === SECRET) return denied(p);
    if (isFile(p)) return text(path);
    if (!isDir(p)) return text(`ls: cannot access '${path}': No such file or directory`, "e");
    const names = children(p).filter((n) => long || !n.startsWith("."));
    if (state.mode === "pwsh") {
      text(`\n    Directory: C:${p.replace(/\//g, "\\")}\n\nMode   Name\n----   ----\n` +
        names.map((n) => `${isDir(norm(n, p)) ? "d----" : "-a---"}  ${n}`).join("\n"));
      return;
    }
    if (long) {
      text(names.map((n) => {
        const full = norm(n, p);
        const dir = isDir(full);
        const size = dir ? 4096 : (FILES[full] || "").length;
        const perm = full === SECRET ? "drwx------" : dir ? "drwxr-xr-x" : "-rw-r--r--";
        return `${perm} rayen rayen ${String(size).padStart(5)} Oct 23 09:12 ${n}${dir ? "/" : ""}`;
      }).join("\n"));
    } else {
      print(names.map((n) => (isDir(norm(n, p)) ? `<span class="b">${esc(n)}/</span>` : esc(n))).join("   "));
    }
  };

  const denied = (p) => {
    print(`${state.mode === "bash" ? "bash" : "Get-Content"}: ${esc(p)}: Permission denied`, "e");
    alertBox([{ id: "DL-1337", severity: "medium", title: "Curious visitor touched .secrets (T1552.001, credentials in files)" }],
      "Good instinct. That is exactly where I would look too. Want to talk? Type <b>hire</b>.");
  };

  const cat = (path) => {
    if (!path) return text("cat: missing file operand", "e");
    const p = norm(path, state.cwd);
    if (p === SECRET || p.startsWith(SECRET + "/") || p === "/etc/shadow" || p.startsWith("/root")) return denied(p);
    if (isDir(p)) return text(`cat: ${path}: Is a directory`, "e");
    if (!isFile(p)) return text(`cat: ${path}: No such file or directory`, "e");
    text(FILES[p]);
  };

  const cd = (path) => {
    const p = norm(path || "~", state.cwd);
    if (p === SECRET || p === "/root") return denied(p);
    if (!isDir(p)) return text(`cd: ${path}: No such file or directory`, "e");
    state.cwd = p;
  };

  const tree = () => {
    const walk = (dir, pre) => children(dir).filter((n) => !n.startsWith(".")).forEach((n, i, arr) => {
      const last = i === arr.length - 1;
      const full = norm(n, dir);
      lines.push(`${pre}${last ? "└── " : "├── "}${n}${isDir(full) ? "/" : ""}`);
      if (isDir(full)) walk(full, pre + (last ? "    " : "│   "));
    });
    const lines = [state.cwd.replace(HOME, "~")];
    walk(state.cwd, "");
    text(lines.join("\n"));
  };

  async function neofetch() {
    let tw = "loading…";
    try {
      const s = await fetch(THREATWATCH, { cache: "no-store" }).then((r) => r.json());
      tw = `${s.domains_checked_last_run.toLocaleString("en-US")} domains on ${s.last_run_day}, ${s.new_last_run} new`;
    } catch { tw = "offline"; }
    const logo = ["   ▄▄▄▄▄▄▄   ", "  █ ▄▄▄▄▄ █  ", "  █ █ ◉ █ █  ", "  █ ▀▀▀▀▀ █  ", "   ▀▄   ▄▀   ", "     ▀▄▀     "];
    const info = [
      `<span class="o">rayen</span>@<span class="o">soc</span>`, "---------",
      `<span class="o">Role</span>     SOC Analyst L2/L3, AppSec`, `<span class="o">Uptime</span>   2+ years in SOC operations`,
      `<span class="o">Shell</span>    ${state.mode === "bash" ? "bash (pretend)" : "PowerShell (pretend)"}`,
      `<span class="o">EDR</span>      Cortex XDR`, `<span class="o">SIEM</span>     Splunk`, `<span class="o">Certs</span>    CRTP`,
      `<span class="o">HTB</span>      top 700 worldwide`, `<span class="o">Watch</span>    ${esc(tw)}`,
    ];
    print(info.map((l, i) => `<span class="o">${esc(logo[i] || " ".repeat(13))}</span>  ${l}`).join("\n"));
  }

  async function threatwatch() {
    try {
      const s = await fetch(THREATWATCH, { cache: "no-store" }).then((r) => r.json());
      text(`Maghreb Threat Watch, last run ${s.last_run_day}
  domains checked  ${s.domains_checked_last_run.toLocaleString("en-US")}
  new findings     ${s.new_last_run}
  last 30 days     ${s.findings_30d} findings, ${s.high_30d} high
  watching         ${s.brands} brands in ${s.countries} countries
  sources ok       ${s.sources_ok.join(", ")}
dashboard: https://threatwatch.rayenskhiri.online`);
    } catch { text("threatwatch: could not reach the dashboard right now", "e"); }
  }

  async function detectCmd(arg) {
    if (!arg) return text('usage: detect <command line>   e.g. detect vssadmin delete shadows /all /quiet', "e");
    const loaded = await loadEngine();
    if (!loaded) return text("detect: rule engine unavailable right now", "e");
    const parsed = loaded.engine.parseCommandLine(arg);
    const hits = loaded.engine.evaluate(loaded.rules, parsed.logsource, parsed.event);
    if (!hits.length) return text(`no rule fired for '${arg}'. Normal activity, or a gap worth a new rule.`);
    hits.forEach((r) => print(`<span class="sev ${r.severity}">${r.severity.toUpperCase()}</span> <b>${r.id}</b> ${esc(r.title)} <span class="d">${r.attack.join(" ")}</span>`));
    text(`full details, XQL and SPL: ${PLAYGROUND}`);
  }

  function alertBox(hits, note) {
    print(`<div class="rt-alert"><b>⚠ ALERT</b> ${hits.map((r) => `<div><span class="sev ${r.severity}">${r.severity.toUpperCase()}</span> ${r.id} ${esc(r.title)}</div>`).join("")}
      <div class="d">${note}</div></div>`);
  }

  const HELP_BASH = `navigation   ls [-la]  cd <dir>  pwd  tree  cat <file>
about me     whoami  neofetch  cv  contact  hire
projects     open <projects|threatwatch|playground|github|linkedin|…>
live data    threatwatch            today's numbers from Maghreb Threat Watch
detections   detect <command line>  run my 29 rules against any command
             rules                  list them
other        history  clear  date  echo  pwsh  exit
Try something you shouldn't. It's monitored.`;
  const HELP_PWSH = `Get-ChildItem (ls, dir, gci)   Set-Location (cd)   Get-Location (pwd)
Get-Content (cat, type, gc)     Get-Process (ps)    Get-Help (help)
Start-Process <target>          Clear-Host (cls)    whoami   bash   exit
$PSVersionTable                 Every line runs through the detection rules.`;

  const BASH = {
    help: () => text(HELP_BASH), man: () => text(HELP_BASH),
    ls: (a) => listing(a.filter((x) => !x.startsWith("-"))[0] || ".", a.some((x) => x.startsWith("-") && /[la]/.test(x))),
    ll: (a) => listing(a[0] || ".", true), dir: (a) => listing(a[0] || ".", false),
    cd: (a) => cd(a[0]), pwd: () => text(state.cwd), tree: () => tree(),
    cat: (a) => cat(a[0]), less: (a) => cat(a[0]), more: (a) => cat(a[0]), head: (a) => cat(a[a.length - 1]),
    whoami: () => text("rayen   (you are a guest. Probably a recruiter. Welcome.)"),
    id: () => text("uid=1000(rayen) gid=1000(rayen) groups=1000(rayen),27(blue-team),666(red-team-alumni)"),
    hostname: () => text("soc"), uname: (a) => text(a.includes("-a") ? "Linux soc 6.18.0-detection #29 SMP PREEMPT x86_64 GNU/Linux" : "Linux"),
    date: () => text(new Date().toString()), uptime: () => text("up 2+ years in SOC operations, 29 detection rules loaded"),
    echo: (a) => text(a.join(" ")), history: () => text(state.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join("\n") || ""),
    clear: () => { out.innerHTML = ""; }, neofetch, fastfetch: neofetch,
    threatwatch, detect: (a, raw) => detectCmd(raw.replace(/^\S+\s*/, "")), rules: async () => {
      const l = await loadEngine();
      if (!l) return text("rules: rule engine unavailable right now", "e");
      text(l.rules.map((r) => `${r.id}  ${r.severity.padEnd(8)} ${r.title}`).join("\n"));
    },
    open: (a) => go(a[0]), contact: () => cat("~/contact.txt"), hire: () => go("contact"),
    cv: () => { const a = document.getElementById("cv-btn"); if (a && a.getAttribute("href").endsWith(".pdf")) { text("downloading cv…"); a.click(); } else text("cv: not published yet. Type 'hire' and ask me for it."); },
    email: () => { text("opening mail to skhirirayen@outlook.com"); location.href = "mailto:skhirirayen@outlook.com"; },
    github: () => go("github"), linkedin: () => go("linkedin"),
    sudo: () => alertBox([{ id: "DL-0000", severity: "high", title: "rayen is not in the sudoers file. This incident will be reported." }], "Reported to: me. I read it. Hello."),
    su: () => text("su: Authentication failure (nice try)", "e"),
    rm: (a) => (a.join(" ").includes("-rf") ? alertBox([{ id: "DL-0029", severity: "critical", title: "Destructive command on a production host" }], "Endpoint isolated. Just kidding. Everything is still here.") : text("rm: read-only file system", "e")),
    nmap: () => text(`Starting Nmap ( https://nmap.org )
Nmap scan report for rayenskhiri.online
PORT    STATE SERVICE
443/tcp open  https   (the site you are on)
1 IP address scanned. Scanning my portfolio counts as reconnaissance, T1595. Logged.`),
    ssh: () => text("ssh: connect to host soc port 22: Connection refused (it's a website)", "e"),
    curl: () => text("curl: egress blocked by policy. This shell has no network, only opinions.", "e"),
    wget: () => text("wget: egress blocked by policy.", "e"),
    vim: () => text("You are now stuck in vim. Just kidding. Type :q to... no, this is not vim."),
    exit: () => close(), logout: () => close(),
    pwsh: () => { state.mode = "pwsh"; text("Windows PowerShell\nCopyright (C) Rayen. All rights reserved.\nType Get-Help. Type 'bash' to go back."); },
    powershell: () => BASH.pwsh(),
    bash: () => text("you are already in bash"),
  };

  const PWSH = {
    "get-help": () => text(HELP_PWSH), help: () => text(HELP_PWSH),
    "get-childitem": (a) => listing(a.filter((x) => !x.startsWith("-"))[0] || ".", true), gci: (a) => PWSH["get-childitem"](a),
    ls: (a) => PWSH["get-childitem"](a), dir: (a) => PWSH["get-childitem"](a),
    "set-location": (a) => cd(a[0]), cd: (a) => cd(a[0]), sl: (a) => cd(a[0]),
    "get-location": () => text(`\nPath\n----\nC:${state.cwd.replace(/\//g, "\\")}`), pwd: () => PWSH["get-location"](),
    "get-content": (a) => cat(a[0]), gc: (a) => cat(a[0]), cat: (a) => cat(a[0]), type: (a) => cat(a[0]),
    "clear-host": () => { out.innerHTML = ""; }, cls: () => { out.innerHTML = ""; }, clear: () => { out.innerHTML = ""; },
    whoami: () => text("soc\\rayen"),
    "get-process": () => text(`Handles  Status        ProcessName
-------  ------        -----------
     45  Running       maghreb-threat-watch
     29  Running       detection-library
    437  Completed     malwarescope
      1  Building      soc-triage-agent`),
    ps: () => PWSH["get-process"](),
    "start-process": (a) => go(a[0]), start: (a) => go(a[0]),
    "get-date": () => text(new Date().toString()), hostname: () => text("SOC"),
    "$psversiontable": () => text("Name          Value\n----          -----\nPSVersion     7.5 (pretend)\nPSEdition     Core\nAuthor        Rayen"),
    "get-command": () => text(Object.keys(PWSH).filter((k) => k.includes("-")).sort().join("\n")),
    "invoke-webrequest": () => text("Invoke-WebRequest: blocked by egress policy. Also, see DL-0002.", "e"), iwr: () => PWSH["invoke-webrequest"](),
    bash: () => { state.mode = "bash"; }, exit: () => { state.mode = "bash"; },
    threatwatch, neofetch, detect: (a, raw) => detectCmd(raw.replace(/^\S+\s*/, "")),
  };

  async function run(raw) {
    const line = raw.trim();
    print(`${prompt()} ${esc(line)}`, "cmd");
    if (!line) return;
    state.history.push(line);
    state.hi = state.history.length;
    const [name, ...args] = line.split(/\s+/);
    const table = state.mode === "bash" ? BASH : PWSH;
    const fn = table[name.toLowerCase()] || (state.mode === "bash" ? table[name] : null);
    const modeBefore = state.mode;
    if (fn) await fn(args, line);
    else if (state.mode === "bash") text(`bash: ${name}: command not found. Type 'help'.`, "e");
    else text(`${name} : The term '${name}' is not recognized as a cmdlet. Try Get-Help.`, "e");
    refreshPrompt();
    const hits = await detect(line, modeBefore).catch(() => []);
    if (hits.length) alertBox(hits, `My own rules just caught your command. Details, XQL and SPL: <a href="${PLAYGROUND}" target="_blank" rel="noopener">${PLAYGROUND.replace("https://", "")}</a>`);
    refreshPrompt();
  }

  // ------------------------------------------------------------ keys

  const complete = () => {
    const v = input.value;
    const parts = v.split(/\s+/);
    const last = parts[parts.length - 1];
    let pool;
    if (parts.length === 1) pool = Object.keys(state.mode === "bash" ? BASH : PWSH);
    else {
      const slash = last.lastIndexOf("/");
      const base = slash >= 0 ? last.slice(0, slash + 1) : "";
      const dir = norm(base || ".", state.cwd);
      pool = children(dir).map((n) => base + n + (isDir(norm(n, dir)) ? "/" : ""));
      if (parts[0] === "open" || parts[0].toLowerCase() === "start-process") pool = Object.keys(LINKS);
    }
    const hits = pool.filter((c) => c.toLowerCase().startsWith(last.toLowerCase()));
    if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(" "); }
    else if (hits.length > 1) { print(`${prompt()} ${esc(v)}`, "cmd"); text(hits.join("   ")); }
  };

  root.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; run(v); });
  root.querySelector(".rt-x").addEventListener("click", close);
  root.addEventListener("click", (e) => { if (e.target === root) close(); });
  root.querySelector(".rt-win").addEventListener("click", (e) => { if (!e.target.closest("a,button")) input.focus(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (state.hi > 0) input.value = state.history[--state.hi] || ""; }
    else if (e.key === "ArrowDown") { e.preventDefault(); state.hi = Math.min(state.history.length, state.hi + 1); input.value = state.history[state.hi] || ""; }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
  });
}
