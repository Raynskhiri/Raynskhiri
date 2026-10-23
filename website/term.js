// rayen@soc: browse this site like a server.
// A small, safe interpreter over a pretend file system built from the site's
// own content. No eval, no network except this site, the Threat Watch stats and
// the detection rules, and every piece of text is HTML-escaped before display.

const PLAYGROUND = "https://detections.rayenskhiri.online";
const THREATWATCH = "https://threatwatch.rayenskhiri.online/stats.json";
const KEV = "data/kev.json";
const HOME = "/home/rayen";
const MAX_INPUT = 300;

// ---------------------------------------------------------------- content

const STATIC = {
  "README.md": `Welcome to rayen@soc. This is my portfolio, as a file system.

  ls              see what is here (click any name to open it)
  cd projects     go into a folder        cd ..   go back up
  cat README.md   read a file
  help            every command

Start with:  benchmark   or   ls experience   or   ls projects
Live data:   cat feeds/exploited.txt   (what attackers exploit right now)`,

  "about/whoami.md": `# Rayen Skhiri
SOC Analyst L2/L3 · Web Application Security · Tunis, Tunisia

I defend by thinking like the attacker.
L2/L3 investigations across many client environments on Cortex XDR,
from alert triage to the incident report the client reads.
When something repetitive slows the team down, I automate it in Python.

Open to SOC, DFIR and AppSec roles.   ->  cd ../contact`,
  "about/facts.txt": `role         SOC Analyst L2/L3 (24/7 MSSP), Web App Security
stack        multi-vendor: each client brings its own XDR, EDR and NDR
based in     Tunis, Tunisia
experience   2+ years in SOC operations
languages    English, French
certified    CRTP (Altered Security)
studying     MSc Infrastructure Security, ISI`,

  "skills/detection-and-response.md": `# Detection and response
L2/L3 triage, investigation and containment for many clients at once, each on
its own XDR, EDR and NDR stack, written up so clients understand what happened.

Cortex XDR and XSIAM   daily: alerts, incidents, causality chains, XQL
Splunk                 SPL hunting and dashboards
Wazuh                  detection and response at a Tier IV datacenter
Security Onion         network security monitoring
Elastic (ELK)          threat intelligence dashboards
Microsoft Sentinel, CrowdStrike Falcon
Kaspersky, Symantec, Trend Micro (Deep Discovery Email Inspector)
FortiGate, Cisco FTD   firewall logs, tuning and parsing`,
  "skills/threat-hunting-and-intel.md": `# Threat hunting and intel
Hypothesis-driven hunts in XQL and SPL mapped to MITRE ATT&CK, enriched with
threat intelligence, and forensics when an alert turns out to be real.

Cortex XSOAR, TheHive   orchestration and case management
MISP, OpenCTI           threat intelligence platforms
VirusTotal, ANY.RUN     triage and sandboxing
Wireshark, tcpdump      packet analysis
Volatility, Autopsy, Sysinternals   forensics
Nessus, OpenVAS         vulnerability management
see: cd ~/projects/detection-library`,
  "skills/offensive-and-web-app-security.md": `# Offensive and web app security
Testing web applications and Active Directory the way attackers do, then
explaining fixes developers and admins can ship.

Burp Suite, OWASP Top 10   web application testing
Active Directory           CRTP: Kerberos, delegation, trusts
BloodHound, Impacket, Mimikatz, Metasploit, Kali Linux
Hack The Box (top 700), TryHackMe`,
  "skills/security-automation.md": `# Security automation
In an MSSP the same process repeats for every client. I automate the
repetitive part: ticket sync, deployment pipelines, enrichment, and the
reports and client emails that eat analyst time.

Python        XDR to GLPI bridge, this site's pipelines, Threat Watch
PowerShell    GPO deployment pipelines (client onboarding: 3 weeks to 2 days)
Bash, Linux, Git, Docker
GitHub Actions   CI/CD and scheduled intelligence
Ollama        local LLMs for SOC triage
see: cd ~/projects/maghreb-threat-watch`,

  "impact/credentials.md": `certified    CRTP, Certified Red Team Professional (Altered Security)
preparing    Splunk Core Certified Power User
preparing    Palo Alto Networks Certified XDR Analyst
preparing    EC-Council Certified SOC Analyst
ranking      Hack The Box, top 700 worldwide
community    Securinets, past member: CTF challenge author and workshop facilitator
             writeups  https://github.com/Raynskhiri/Writeup`,

  "experience/3s-trustshield.md": `# SOC Analyst L2/L3   Jul 2025 to present
Standard Sharing Software (3S) · TrustShield SOCaaS · Tunis

- Escalation point in a 24/7 MSSP covering 800+ endpoints: L1 escalations to
  containment, on each client's own XDR, EDR and NDR stack (Cortex XDR and
  XSIAM most of all).
- Investigated a Pass-the-Hash lateral movement alert on a domain controller
  and a malspam VBS campaign hidden behind Unicode extension padding, both
  scoped across the fleet before closure.
- Cut client integration lead time from 3 weeks to 2 days (GPO, PowerShell).
- Reduced a FortiGate log footprint of about 450 GB with Cortex XDR parsing
  rules; took a fleet-wide anomaly to Palo Alto Networks TAC to root cause.
- Weekly and monthly client security reports in French (MTTD, MTTA, MTTR).
- The process repeats per client, so I automate it: XDR incidents become GLPI
  tickets kept in sync, and tooling for the reports and client emails.
- Mentor L1 analysts; write runbooks and client onboarding templates.`,
  "experience/dataxion.md": `# SOC Analyst L1/L2   Jul 2024 to Mar 2025
DataXion · first Tier IV certified datacenter in Tunisia · Tunis

- Detected and contained targeted attacks on hosted critical services (Wazuh).
- Blocked spear-phishing campaigns (Trend Micro DDEI), hardened 30+ accounts.
- Nessus scans: 50+ prioritised remediations, followed with the system teams.
- ISO 27001, PCI DSS and GDPR compliance; red team findings mapped to ATT&CK.`,
  "experience/internships.md": `# Internships   2023 to 2024
BITS Tunisia (2024)    cybersecurity: Nessus and OpenVAS assessments,
                       remediation reports, cyber ranges in GNS3 and Docker
Mazars Tunisia (2023)  threat intelligence: MISP and OpenCTI integration,
                       threat dashboards in ELK`,
  "experience/education.md": `M.Sc. Information Systems and Infrastructure Security   2024 to present
  ISI, University of Tunis El Manar   (thesis: cd ~/projects/malwarescope)
B.Sc. Networks and Telecommunications                  2021 to 2024
  ISI, University of Tunis El Manar`,

  "projects/maghreb-threat-watch/README.md": `# Maghreb Threat Watch   [live]
Open early warning for lookalike and phishing domains targeting 45 banks,
telecoms and public services in Tunisia, Morocco and Algeria.
Every score is explained; every finding ships with an XQL and SPL hunt.
Runs every morning on GitHub Actions, for free.

live numbers:  cat stats.txt
links:         cat links.txt`,
  "projects/maghreb-threat-watch/links.txt": `dashboard  https://threatwatch.rayenskhiri.online
source     https://github.com/Raynskhiri/maghreb-threat-watch`,
  "projects/malwarescope/README.md": `# MalwareScope   [master's thesis, with Omar Kharrat]
A trained Random Forest classifies Windows executables, an LLM explains the
verdict, and an isolated Windows sandbox shows what the file really does.
It refuses to run a sample it cannot watch, signs its evidence, and exports
findings to Splunk, Cortex XDR, STIX/TAXII and MISP.

results:  cat results.txt`,
  "projects/malwarescope/results.txt": `dataset              760 Windows PE files, 7 classes
held-out test split  89.5% accuracy (Random Forest, 152 files)
same 50 files        82.0% Random Forest vs 36.0% LLM alone
automated tests      437 passing
source               https://github.com/Raynskhiri/MalwareScope`,
  "projects/detection-library/README.md": `# Detection library   [29 rules]
Each detection is written once in YAML and compiled to Cortex XDR XQL and
Splunk SPL, mapped to MITRE ATT&CK, with triage steps. CI checks Python,
the compiled queries and the browser engine against the same 800+ events.

all rules:  cat rules.txt
try one:    detect vssadmin delete shadows /all /quiet
links:      cat links.txt`,
  "projects/detection-library/links.txt": `playground https://detections.rayenskhiri.online
source     https://github.com/Raynskhiri/detection-library`,
  "projects/soc-triage-agent/README.md": `# SOC triage agent   [in progress]
A local LLM agent that investigates Cortex XDR alerts, builds the timeline
and drafts a verdict. Nothing is contained or sent to a client until a human
approves it in Slack.`,

  "contact/contact.md": `email     skhirirayen@outlook.com
linkedin  https://www.linkedin.com/in/rayen-skhiri
github    https://github.com/Raynskhiri

Want to talk about a role? Type 'hire' to open the contact form.`,
};

// Files whose content is fetched when read.
const LIVE = {
  "impact/benchmark.txt": benchmark,
  "feeds/exploited.txt": exploitedFeed,
  "feeds/threatwatch.txt": threatwatchStats,
  "projects/maghreb-threat-watch/stats.txt": threatwatchStats,
  "projects/detection-library/rules.txt": rulesList,
};

const DESCRIBE = {
  "README.md": "start here", about: "who I am", impact: "the numbers, benchmarked", experience: "where I have worked",
  skills: "what I bring to a team, and the tools", projects: "things I built", feeds: "live data, refreshed daily",
  "benchmark.txt": "run me", "credentials.md": "certifications and community",
  contact: "how to reach me", "maghreb-threat-watch": "phishing early warning, live",
  malwarescope: "ML + LLM malware analysis, thesis", "detection-library": "29 rules, XQL + SPL",
  "soc-triage-agent": "LLM triage with human approval, in progress", "exploited.txt": "CISA KEV, actively exploited",
  "threatwatch.txt": "today's Threat Watch numbers",
};

const SECTION = {
  about: "#home", impact: "#impact", experience: "#experience", skills: "#skills", projects: "#projects", contact: "#contact",
  "projects/maghreb-threat-watch": "https://threatwatch.rayenskhiri.online",
  "projects/malwarescope": "https://github.com/Raynskhiri/MalwareScope",
  "projects/detection-library": PLAYGROUND,
  feeds: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
};

const FILES = new Map();
for (const [p, v] of Object.entries(STATIC)) FILES.set(`${HOME}/${p}`, v);
for (const [p, v] of Object.entries(LIVE)) FILES.set(`${HOME}/${p}`, v);
const DIRS = new Set(["/", "/home", HOME, `${HOME}/.secrets`]);
for (const p of FILES.keys()) {
  const parts = p.split("/");
  for (let i = 2; i < parts.length; i++) DIRS.add(parts.slice(0, i).join("/"));
}
const SECRET = `${HOME}/.secrets`;

// ---------------------------------------------------------------- paths

function resolve(path, cwd) {
  let p = String(path || "~").replace(/\\/g, "/").replace(/^[A-Za-z]:/, "");
  if (p === "~" || p.startsWith("~/")) p = HOME + p.slice(1);
  if (!p.startsWith("/")) p = `${cwd}/${p}`;
  const out = [];
  for (const part of p.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop(); else out.push(part);
  }
  return "/" + out.join("/");
}
const pretty = (p) => (p === HOME ? "~" : p.startsWith(HOME + "/") ? "~" + p.slice(HOME.length) : p);
const rel = (p) => p.slice(HOME.length + 1);
const isDir = (p) => DIRS.has(p);
const isFile = (p) => FILES.has(p);

function children(dir) {
  const prefix = dir === "/" ? "/" : dir + "/";
  const names = new Set();
  for (const p of [...FILES.keys(), ...DIRS]) {
    if (p !== dir && p.startsWith(prefix)) names.add(p.slice(prefix.length).split("/")[0]);
  }
  return [...names].sort((a, b) => (isDir(prefix + b) - isDir(prefix + a)) || a.localeCompare(b));
}

// ---------------------------------------------------------------- live files

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Only our own text is linkified, and only https URLs.
const linkify = (s) => esc(s).replace(/https:\/\/[A-Za-z0-9.\-/_#?=%]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);

let kevCache = null;
const getKev = () => (kevCache ||= fetch(KEV, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))));

async function exploitedFeed(_, opts = {}) {
  const k = await getKev();
  let rows = opts.ransomware ? (k.ransomware_latest || []) : k.latest;
  if (opts.filter) {
    const f = opts.filter.toLowerCase();
    rows = rows.filter((r) => `${r.vendor} ${r.product} ${r.name} ${r.cve}`.toLowerCase().includes(f));
  }
  rows = rows.slice(0, opts.limit || 12);
  const head = `<span class="o">${opts.ransomware ? "Most recent KEV entries used in ransomware campaigns" : "Actively exploited vulnerabilities"}</span> <span class="d">(CISA KEV ${esc(k.catalog_version)}, ${k.total.toLocaleString("en-US")} total, ${k.added_7d} added in 7 days, ${k.added_30d} in 30)</span>`;
  if (!rows.length) return `${head}\nnothing matches '${esc(opts.filter || "")}' in the ${k.latest.length} most recent entries. Full catalog: <a href="${k.source_url}" target="_blank" rel="noopener noreferrer">cisa.gov</a>`;
  const lines = rows.map((r) => {
    const url = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(r.cve)}`;
    return `<span class="d">${esc(r.added)}</span>  <a href="${url}" target="_blank" rel="noopener noreferrer">${esc(r.cve)}</a>  <b>${esc(r.vendor)} ${esc(r.product)}</b>${r.ransomware ? '  <span class="sev critical">RANSOMWARE</span>' : ""}\n            <span class="d">${esc(r.name)}</span>`;
  });
  return `${head}\n${lines.join("\n")}\n<span class="d">filter: kev fortinet · kev --ransomware · details: kev CVE-…   source: CISA, refreshed twice a day</span>`;
}

async function kevDetail(cve) {
  const k = await getKev();
  const r = k.latest.find((x) => x.cve.toLowerCase() === cve.toLowerCase());
  if (!r) return `${esc(cve)} is not in the ${k.latest.length} most recent entries. Full catalog: <a href="${k.source_url}" target="_blank" rel="noopener noreferrer">cisa.gov</a>`;
  return `<b>${esc(r.cve)}</b>  ${esc(r.vendor)} ${esc(r.product)}${r.ransomware ? '  <span class="sev critical">USED BY RANSOMWARE</span>' : ""}
${esc(r.name)}
added to KEV  ${esc(r.added)}      federal patch deadline  ${esc(r.due)}

${esc(r.summary)}

<a href="https://nvd.nist.gov/vuln/detail/${encodeURIComponent(r.cve)}" target="_blank" rel="noopener noreferrer">NVD entry</a>`;
}

async function benchmark() {
  let domains = "70,000+";
  let day = "every morning";
  try {
    const s = await fetch(THREATWATCH, { cache: "no-store" }).then((r) => r.json());
    domains = Number(s.domains_checked_last_run).toLocaleString("en-US");
    day = s.last_run_day;
  } catch { /* keep the static value */ }
  const row = (n, what, src) => `  <b>${esc(n.padEnd(12))}</b>${esc(what.padEnd(34))}<span class="d">${esc(src)}</span>`;
  return [
    `<span class="d">$</span> rayen --benchmark --since 2024`,
    "",
    `<span class="o">AT WORK</span>`,
    row("800+", "endpoints monitored, 24/7", "3S · TrustShield"),
    row("3 wk → 2 d", "client integration lead time", "3S · TrustShield"),
    row("~450 GB", "FortiGate log footprint reduced", "3S · TrustShield"),
    row("30+", "compromised accounts hardened", "DataXion"),
    row("50+", "prioritised remediations", "DataXion"),
    row("L1 → L3", "in 2+ years of SOC operations", "since Jul 2024"),
    "",
    `<span class="o">IN THE OPEN</span>`,
    row(domains, `domains checked (${day})`, "Maghreb Threat Watch, live"),
    row("29 rules", "800+ events checked per commit", "detection library"),
    row("82% vs 36%", "ML model vs an LLM alone", "MalwareScope"),
    row("Top 700", "worldwide on Hack The Box", "of ~2M players"),
    "",
    `<span class="d">KPIs I report weekly: MTTD · MTTA · MTTR · SLA · NIST SP 800-61</span>`,
    `<span class="g">result: PASS</span>  <span class="d">next step:</span> ${'<button type="button" class="tk f" data-cmd="hire">hire</button>'}`,
  ].join("\n");
}

async function threatwatchStats() {
  const s = await fetch(THREATWATCH, { cache: "no-store" }).then((r) => r.json());
  return esc(`Maghreb Threat Watch, last run ${s.last_run_day}
  domains checked  ${Number(s.domains_checked_last_run).toLocaleString("en-US")}
  new findings     ${s.new_last_run}
  last 30 days     ${s.findings_30d} findings, ${s.high_30d} high
  watching         ${s.brands} brands in ${s.countries} countries
  sources ok       ${(s.sources_ok || []).join(", ")}`) + `\n<a href="https://threatwatch.rayenskhiri.online" target="_blank" rel="noopener noreferrer">open the dashboard</a>`;
}

let enginePromise = null;
const loadEngine = () => (enginePromise ||= Promise.all([
  import(`${PLAYGROUND}/engine.js`),
  fetch(`${PLAYGROUND}/data/rules.json`).then((r) => r.json()),
]).then(([engine, lib]) => ({ engine, rules: lib.rules })).catch(() => null));

async function rulesList() {
  const l = await loadEngine();
  if (!l) return "rules are loading from detections.rayenskhiri.online, try again in a moment";
  return l.rules.map((r) => `${esc(r.id)}  <span class="sev ${esc(r.severity)}">${esc(r.severity.toUpperCase())}</span>  ${esc(r.title)}`).join("\n");
}

// ---------------------------------------------------------------- terminal

export function mount(root) {
  if (root.dataset.ready) return root.querySelector(".rt-in");
  root.dataset.ready = "1";
  root.innerHTML = `
    <div class="rt-bar"><span class="rt-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="rt-title">rayen@soc: ~</span><span class="rt-mode">bash</span></div>
    <div class="rt-out" role="log" aria-live="polite" aria-label="Terminal output"></div>
    <form class="rt-line" autocomplete="off"><label class="rt-ps" for="rt-in"></label>
      <input class="rt-in" id="rt-in" maxlength="${MAX_INPUT}" spellcheck="false" autocapitalize="off" autocomplete="off"
        enterkeyhint="go" aria-label="Type a command, for example ls or help"></form>
    <div class="rt-chips" aria-label="Suggested commands"></div>`;

  const out = root.querySelector(".rt-out");
  const input = root.querySelector(".rt-in");
  const ps = root.querySelector(".rt-ps");
  const title = root.querySelector(".rt-title");
  const modeTag = root.querySelector(".rt-mode");
  const chips = root.querySelector(".rt-chips");
  const st = { cwd: HOME, mode: "bash", history: [], hi: 0 };

  const promptHtml = () => (st.mode === "bash"
    ? `<span class="g">rayen@soc</span>:<span class="b">${esc(pretty(st.cwd))}</span>$`
    : `PS C:${esc(st.cwd.replace(/\//g, "\\"))}&gt;`);
  const print = (html, cls) => {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  const say = (text, cls) => print(linkify(text), cls);
  const err = (text) => print(esc(text), "e");
  const btn = (label, cmd, cls = "") => `<button type="button" class="tk ${cls}" data-cmd="${esc(cmd)}">${esc(label)}</button>`;

  function refresh() {
    ps.innerHTML = promptHtml();
    title.textContent = st.mode === "bash" ? `rayen@soc: ${pretty(st.cwd)}` : "Windows PowerShell";
    modeTag.textContent = st.mode === "bash" ? "bash" : "pwsh";
    root.classList.toggle("pwsh", st.mode === "pwsh");
    // Suggestions follow where you are.
    const kids = isDir(st.cwd) ? children(st.cwd).filter((n) => !n.startsWith(".")) : [];
    const sug = ["ls"];
    if (st.cwd !== HOME) sug.push("cd ..");
    if (st.cwd === HOME) sug.push("benchmark", "cd experience", "cd projects", "kev", "help");
    else {
      kids.slice(0, 3).forEach((n) => sug.push(isDir(`${st.cwd}/${n}`) ? `cd ${n}` : `cat ${n}`));
      sug.push("open .");
    }
    chips.innerHTML = sug.map((c) => btn(c, c, "chip")).join("");
  }

  // ------------------------------------------------------------ commands

  function ls(args) {
    const flags = args.filter((a) => a.startsWith("-")).join("");
    const target = args.find((a) => !a.startsWith("-")) || ".";
    const p = resolve(target, st.cwd);
    if (p === SECRET) return denied(p);
    if (isFile(p)) return print(btn(target, `cat ${target}`, "f"));
    if (!isDir(p)) return err(`ls: cannot access '${target}': No such file or directory`);
    const all = /a/.test(flags);
    const long = /l/.test(flags) || st.mode === "pwsh";
    const names = children(p).filter((n) => all || !n.startsWith("."));
    const base = target === "." ? "" : target.replace(/\/?$/, "/");
    const item = (n) => {
      const full = `${p}/${n}`;
      return isDir(full) ? btn(`${n}/`, `cd ${base}${n}`, "d") : btn(n, `cat ${base}${n}`, LIVE[rel(full)] ? "f live" : "f");
    };
    if (!long) return print(names.map(item).join("  "));
    print(names.map((n) => {
      const full = `${p}/${n}`;
      const kind = full === SECRET ? "drwx------" : isDir(full) ? "drwxr-xr-x" : LIVE[rel(full)] ? "-r--r--r--" : "-rw-r--r--";
      const note = DESCRIBE[n] ? `<span class="d">  ${esc(DESCRIBE[n])}</span>` : LIVE[rel(full)] ? '<span class="d">  live</span>' : "";
      return `<span class="d">${kind}</span>  ${item(n)}${note}`;
    }).join("\n"));
  }

  function cd(args) {
    const target = args[0] || "~";
    const p = resolve(target, st.cwd);
    if (p === SECRET) return denied(p);
    if (isFile(p)) return err(`cd: ${target}: Not a directory. Try: cat ${target}`);
    if (!isDir(p)) return err(`cd: ${target}: No such file or directory`);
    st.cwd = p;
    if (p !== HOME && p.startsWith(HOME)) ls([]);
  }

  async function cat(args) {
    if (!args.length) return err("cat: missing file name. Try: ls");
    for (const target of args) {
      const p = resolve(target, st.cwd);
      if (p === SECRET || p.startsWith(SECRET + "/") || p === "/etc/shadow") { denied(p); continue; }
      if (isDir(p)) { err(`cat: ${target}: Is a directory. Try: cd ${target}`); continue; }
      const f = FILES.get(p);
      if (f === undefined) { err(`cat: ${target}: No such file or directory`); continue; }
      if (typeof f === "function") {
        print('<span class="d">fetching…</span>', "wait");
        try { const html = await f(); out.lastChild.remove(); print(html); }
        catch { out.lastChild.remove(); err(`cat: ${target}: could not fetch live data right now`); }
      } else say(f);
    }
  }

  function tree() {
    const lines = [esc(pretty(st.cwd))];
    const walk = (dir, pre) => children(dir).filter((n) => !n.startsWith(".")).forEach((n, i, arr) => {
      const last = i === arr.length - 1;
      const full = `${dir}/${n}`;
      const r = rel(full);
      lines.push(`${pre}${last ? "└── " : "├── "}${isDir(full) ? btn(`${n}/`, `cd ${pretty(full)}`, "d") : btn(n, `cat ${pretty(full)}`, LIVE[r] ? "f live" : "f")}`);
      if (isDir(full)) walk(full, pre + (last ? "    " : "│   "));
    });
    walk(st.cwd, "");
    print(lines.join("\n"));
  }

  function grep(args) {
    const word = args.filter((a) => !a.startsWith("-")).join(" ");
    if (!word) return err("usage: grep <word>   e.g. grep cortex");
    const w = word.toLowerCase();
    const hits = [];
    for (const [p, v] of FILES) {
      if (typeof v !== "string") continue;
      v.split("\n").forEach((line) => { if (line.toLowerCase().includes(w)) hits.push([p, line]); });
    }
    if (!hits.length) return say(`no match for '${word}'`);
    print(hits.slice(0, 30).map(([p, line]) => {
      const i = line.toLowerCase().indexOf(w);
      return `${btn(pretty(p), `cat ${pretty(p)}`, "f")}<span class="d">:</span> ${esc(line.slice(0, i))}<mark>${esc(line.slice(i, i + word.length))}</mark>${esc(line.slice(i + word.length))}`;
    }).join("\n"));
  }

  function open(args) {
    const target = args[0] || ".";
    const p = resolve(target, st.cwd);
    const key = rel(p);
    const url = SECTION[key] || SECTION[key.split("/")[0]];
    if (!url) return err(`open: nothing to open for '${target}'. Try: open projects`);
    if (url.startsWith("#")) {
      say(`scrolling to ${url.slice(1)}`);
      document.querySelector(url)?.scrollIntoView({ behavior: "smooth" });
    } else {
      say(`opening ${url}`);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  async function kev(args) {
    const cveArg = args.find((a) => /^cve-\d{4}-\d+$/i.test(a));
    try {
      if (cveArg) return print(await kevDetail(cveArg));
      const ransomware = args.includes("--ransomware") || args.includes("-r");
      const filter = args.filter((a) => !a.startsWith("-")).join(" ");
      print(await exploitedFeed(null, { ransomware, filter, limit: filter || ransomware ? 20 : 10 }));
    } catch { err("kev: the feed is not available right now"); }
  }

  async function detectCmd(raw) {
    const arg = raw.replace(/^\S+\s*/, "");
    if (!arg) return err("usage: detect <command line>   e.g. detect vssadmin delete shadows /all /quiet");
    const l = await loadEngine();
    if (!l) return err("detect: rule engine unavailable right now");
    const parsed = l.engine.parseCommandLine(arg);
    const hits = l.engine.evaluate(l.rules, parsed.logsource, parsed.event);
    if (!hits.length) return say(`no rule fired. Normal activity, or a gap worth a new rule.`);
    print(hits.map((r) => `<span class="sev ${esc(r.severity)}">${esc(r.severity.toUpperCase())}</span> <b>${esc(r.id)}</b> ${esc(r.title)} <span class="d">${esc(r.attack.join(" "))}</span>`).join("\n"));
    say(`triage steps, XQL and SPL: ${PLAYGROUND}`);
  }

  function denied(p) {
    err(`${p}: Permission denied`);
    alertBox([{ id: "DL-1337", severity: "medium", title: "Curious visitor touched .secrets (T1552.001, credentials in files)" }],
      "Good instinct. That is exactly where I would look too. Type <b>hire</b> if you want to talk.");
  }

  function alertBox(hits, note) {
    print(`<div class="rt-alert"><b>ALERT</b> ${hits.map((r) => `<div><span class="sev ${esc(r.severity)}">${esc(r.severity.toUpperCase())}</span> ${esc(r.id)} ${esc(r.title)}</div>`).join("")}<div class="d">${note}</div></div>`);
  }

  async function neofetch() {
    let tw = "offline";
    let kv = "offline";
    try { const s = await fetch(THREATWATCH, { cache: "no-store" }).then((r) => r.json()); tw = `${Number(s.domains_checked_last_run).toLocaleString("en-US")} domains on ${s.last_run_day}`; } catch { /* offline */ }
    try { const k = await getKev(); kv = `${k.added_7d} new exploited CVEs this week`; } catch { /* offline */ }
    const logo = ["   ▄▄▄▄▄▄▄   ", "  █ ▄▄▄▄▄ █  ", "  █ █ ◉ █ █  ", "  █ ▀▀▀▀▀ █  ", "   ▀▄   ▄▀   ", "     ▀▄▀     ", "", "", "", ""];
    const info = [
      '<span class="o">rayen</span>@<span class="o">soc</span>', "---------",
      `<span class="o">Role</span>     SOC Analyst L2/L3, AppSec`, '<span class="o">Uptime</span>   2+ years in SOC operations',
      '<span class="o">XDR/EDR</span>  Cortex XDR, XSIAM, CrowdStrike, Trend Micro', '<span class="o">SIEM</span>     Splunk, Wazuh, Security Onion, ELK', '<span class="o">Certs</span>    CRTP',
      '<span class="o">HTB</span>      top 700 worldwide', `<span class="o">Watch</span>    ${esc(tw)}`, `<span class="o">KEV</span>      ${esc(kv)}`,
    ];
    print(info.map((l, i) => `<span class="o">${esc(logo[i] || "").padEnd(13, " ")}</span>  ${l}`).join("\n"));
  }

  const row = (cmd, desc) => `<span class="h-c">${cmd}</span><span class="h-d">${desc}</span>`;
  const HELP = () => print(`<div class="rt-help">
<b class="h-t">Moving around</b>
${row(`${btn("ls", "ls")} [-l]`, "list this folder (click any name)")}
${row("cd &lt;folder&gt;", `go into a folder · ${btn("cd ..", "cd ..")} up · ${btn("cd ~", "cd ~")} home`)}
${row("cat &lt;file&gt;", "read a file")}
${row(btn("tree", "tree"), "everything below here")}
${row(btn("pwd", "pwd"), "where am I")}
${row("grep &lt;word&gt;", `search every file, e.g. ${btn("grep cortex", "grep cortex")}`)}
${row("open [path]", "jump to that part of the page, or open the project")}
<b class="h-t">Numbers</b>
${row(btn("benchmark", "benchmark"), "impact at work and in the open, benchmarked")}
<b class="h-t">Live data</b>
${row(`${btn("kev", "kev")} [vendor]`, "vulnerabilities exploited in the wild right now (CISA KEV)")}
${row(btn("kev --ransomware", "kev --ransomware"), "only the ones ransomware groups use")}
${row("kev &lt;CVE-id&gt;", "details for one vulnerability")}
${row(btn("cat feeds/threatwatch.txt", "cat ~/feeds/threatwatch.txt"), "today's phishing-domain watch")}
<b class="h-t">Detections</b>
${row("detect &lt;command&gt;", `run my 29 rules on any command line, e.g. ${btn("detect vssadmin delete shadows /all", "detect vssadmin delete shadows /all")}`)}
<b class="h-t">Me</b>
${row(`${btn("whoami", "whoami")} ${btn("neofetch", "neofetch")}`, "who is behind this")}
${row(btn("hire", "hire"), "open the contact form")}
${row(`${btn("pwsh", "pwsh")} ${btn("clear", "clear")} ${btn("history", "history")}`, "PowerShell mode, clear the screen, past commands")}
</div><span class="d">Tab completes names, ↑ ↓ walk the history. Every command is also checked by my detection rules.</span>`.replace(/\n/g, ""));

  const C = {
    help: HELP, "?": HELP, man: HELP,
    ls, ll: (a) => ls(["-l", ...a]), dir: (a) => ls(["-l", ...a]),
    cd, pwd: () => say(st.mode === "bash" ? st.cwd : `C:${st.cwd.replace(/\//g, "\\")}`),
    cat, less: cat, more: cat, head: cat, type: cat, tree, grep, open, kev,
    benchmark: () => cat(["~/impact/benchmark.txt"]), bench: () => cat(["~/impact/benchmark.txt"]),
    detect: (_, raw) => detectCmd(raw),
    clear: () => { out.innerHTML = ""; }, cls: () => { out.innerHTML = ""; },
    history: () => say(st.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join("\n")),
    whoami: () => say(st.mode === "bash" ? "rayen   (you are browsing as a guest. Welcome.)" : "soc\\rayen"),
    id: () => say("uid=1000(rayen) gid=1000(rayen) groups=1000(rayen),27(blue-team),1337(red-team-alumni)"),
    hostname: () => say("soc"), date: () => say(new Date().toString()),
    uname: (a) => say(a.includes("-a") ? "Linux soc 6.18.0-detection #29 SMP PREEMPT x86_64 GNU/Linux" : "Linux"),
    echo: (a) => say(a.join(" ")),
    neofetch, fastfetch: neofetch,
    hire: () => { say("opening the contact form"); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); setTimeout(() => document.querySelector('#compose [name="name"]')?.focus({ preventScroll: true }), 700); },
    sudo: () => alertBox([{ id: "DL-0000", severity: "high", title: "rayen is not in the sudoers file. This incident will be reported." }], "Reported to: me. I read it. Hello."),
    su: () => err("su: Authentication failure"),
    rm: (a) => (a.join(" ").includes("-r") ? alertBox([{ id: "DL-0029", severity: "critical", title: "Destructive command on a production host" }], "Endpoint isolated. Just kidding, everything is still here.") : err("rm: read-only file system")),
    curl: () => err("curl: outbound traffic is blocked here. This shell has no network, only opinions."), wget: () => err("wget: outbound traffic is blocked here."),
    ssh: () => err("ssh: connect to host soc port 22: Connection refused (it's a website)"),
    nmap: () => say("Nmap scan report for rayenskhiri.online\nPORT    STATE SERVICE\n443/tcp open  https   (the site you are on)\nScanning my portfolio counts as reconnaissance, T1595. Noted."),
    vim: () => say("Not vim. You are safe. You can always leave."), exit: () => { say("logout. The terminal stays here if you need it."); input.blur(); },
    pwsh: () => { st.mode = "pwsh"; say("Windows PowerShell (pretend). Get-ChildItem, Set-Location, Get-Content, Get-Help work. Type 'bash' to go back."); },
    powershell: () => C.pwsh(), bash: () => { if (st.mode === "bash") say("you are already in bash"); st.mode = "bash"; },
    // PowerShell names
    "get-childitem": (a) => ls(["-l", ...a]), gci: (a) => ls(["-l", ...a]),
    "set-location": cd, sl: cd, "get-location": () => C.pwd(), "get-content": cat, gc: cat,
    "get-help": HELP, "clear-host": () => { out.innerHTML = ""; }, "select-string": grep, "start-process": open,
    "get-process": () => say("Handles  Status     ProcessName\n-------  ------     -----------\n     45  Running    maghreb-threat-watch\n     29  Running    detection-library\n    437  Completed  malwarescope\n      1  Building   soc-triage-agent"),
  };

  async function run(raw) {
    const line = String(raw).slice(0, MAX_INPUT).trim();
    print(`${promptHtml()} ${esc(line)}`, "cmd");
    if (!line) return;
    st.history.push(line);
    st.hi = st.history.length;
    const [name, ...args] = line.split(/\s+/);
    const fn = C[name.toLowerCase()];
    const modeBefore = st.mode;
    try {
      if (fn) await fn(args, line);
      else if (st.mode === "bash") err(`${name}: command not found. Type 'help' or 'ls'.`);
      else err(`${name} : The term '${name}' is not recognized. Try Get-Help.`);
    } catch { err(`${name}: something went wrong`); }
    refresh();
    // My own rules watch this shell too.
    if (!["detect", "kev", "grep", "echo"].includes(name.toLowerCase())) {
      const l = await loadEngine();
      if (l) {
        const ev = modeBefore === "pwsh"
          ? { logsource: "process_creation", event: { "process.name": "powershell.exe", "process.command_line": `powershell.exe -c ${line}`, "parent.name": "explorer.exe" } }
          : l.engine.parseCommandLine(line, "bash");
        const hits = l.engine.evaluate(l.rules, ev.logsource, ev.event);
        if (hits.length) alertBox(hits, `My own detection rules just caught that command. Details: <a href="${PLAYGROUND}" target="_blank" rel="noopener noreferrer">detections.rayenskhiri.online</a>`);
      }
    }
  }

  // Commands run one after another, in the order typed. Nothing is dropped.
  let queue = Promise.resolve();
  function exec(cmd) {
    queue = queue.then(() => run(cmd)).catch(() => {});
    return queue;
  }

  // ------------------------------------------------------------ input

  function complete() {
    const v = input.value;
    const parts = v.split(/\s+/);
    const last = parts[parts.length - 1];
    let pool;
    if (parts.length === 1) pool = Object.keys(C).filter((k) => st.mode === "pwsh" || !k.includes("-"));
    else {
      const slash = last.lastIndexOf("/");
      const base = slash >= 0 ? last.slice(0, slash + 1) : "";
      const dir = resolve(base || ".", st.cwd);
      pool = isDir(dir) ? children(dir).filter((n) => !n.startsWith(".")).map((n) => base + n + (isDir(`${dir}/${n}`) ? "/" : "")) : [];
    }
    const hits = pool.filter((c) => c.toLowerCase().startsWith(last.toLowerCase()));
    if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(" ") + (hits[0].endsWith("/") ? "" : " "); }
    else if (hits.length > 1) {
      let common = hits[0];
      for (const h of hits) while (!h.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1);
      if (common.length > last.length) { parts[parts.length - 1] = common; input.value = parts.join(" "); }
      else { print(`${promptHtml()} ${esc(v)}`, "cmd"); say(hits.join("   ")); }
    }
  }

  root.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; exec(v); });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cmd]");
    if (b) { exec(b.dataset.cmd); input.focus({ preventScroll: true }); return; }
    if (!e.target.closest("a") && !window.getSelection().toString()) input.focus({ preventScroll: true });
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (st.hi > 0) input.value = st.history[--st.hi] || ""; }
    else if (e.key === "ArrowDown") { e.preventDefault(); st.hi = Math.min(st.history.length, st.hi + 1); input.value = st.history[st.hi] || ""; }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
    else if (e.key === "c" && e.ctrlKey && !window.getSelection().toString()) { e.preventDefault(); print(`${promptHtml()} ${esc(input.value)}^C`, "cmd"); input.value = ""; }
  });

  print(`<span class="o">rayen@soc</span> · my portfolio as a file system. Type <b>help</b>, or click any name below.`);
  refresh();
  ls([]);
  return input;
}
