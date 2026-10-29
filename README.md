<h1 align="center">Hi, I'm Rayen Skhiri 👋</h1>
<h3 align="center">SOC Analyst L2/L3 · Web Application Security Engineer · Red Team enthusiast</h3>

<p align="center">
  <a href="https://rayenskhiri.online"><img src="https://img.shields.io/badge/Website-rayenskhiri.online-1A5BB5?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website"></a>
  <a href="https://linkedin.com/in/rayen-skhiri"><img src="https://img.shields.io/badge/LinkedIn-rayen--skhiri-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:skhirirayen@outlook.com"><img src="https://img.shields.io/badge/Email-Contact%20me-0078D4?style=for-the-badge&logo=microsoftoutlook&logoColor=white" alt="Email"></a>
  <img src="https://img.shields.io/badge/HackTheBox-Top%20700%20Global-9FEF00?style=for-the-badge&logo=hackthebox&logoColor=black" alt="HackTheBox">
  <img src="https://img.shields.io/badge/CRTP-Certified-C00000?style=for-the-badge" alt="CRTP">
</p>

---

### 🛡️ About me

- 🔎 SOC Analyst L2/L3 at **3S / TrustShield** (24/7 MSSP, 800+ endpoints): L1 escalations to containment on **Cortex XDR and XSIAM**; cut client onboarding from 3 weeks to 2 days with GPO and PowerShell pipelines
- 🏢 Previously SOC Analyst at **DataXion**, Tunisia's first Tier IV datacenter: blocked spear-phishing with Trend Micro DDEI, hardened 30+ accounts, 50+ prioritised Nessus remediations
- 🌐 Web Application Security Engineer: testing and hardening web apps
- ⚔️ **CRTP** certified (Certified Red Team Professional): Active Directory attack and defense
- 🏴 Top 700 globally on **HackTheBox**; former **Securinets** member (CTF challenge author and workshop facilitator)
- 🛰️ Maintainer of **Maghreb Threat Watch**, an open phishing early-warning feed for North African brands
- 🦠 Co-author of **MalwareScope**, my Master's thesis: ML + LLM malware analysis with an isolated sandbox
- 🤖 Currently building: an AI-assisted SOC triage agent with human approval
- 🎓 Master's in Information Systems and Infrastructure Security, ISI (University of Tunis El Manar)
- 🌍 Based in Tunisia, open to opportunities worldwide

---

### 🚀 Featured projects

| Project | What it does | Stack |
|---|---|---|
| **[Maghreb Threat Watch](https://github.com/Raynskhiri/maghreb-threat-watch)** 🛰️ | Open-source early warning for lookalike and phishing domains targeting 45 North African banks, telecoms and public services. Runs daily for free, explains every score, and ships ready-to-paste **Cortex XQL and Splunk SPL** hunts. **[Live dashboard](https://threatwatch.rayenskhiri.online)** | Python, Certificate Transparency, GitHub Actions, XQL, SPL |
| **[MalwareScope](https://github.com/Raynskhiri/MalwareScope)** 🦠 | Master's thesis (with Omar Kharrat). A Random Forest classifies Windows executables (82% vs 36% for an LLM alone on the same samples; 89.5% on the full held-out split), an LLM explains the verdict, and an isolated KVM sandbox shows the behaviour. It refuses to run a sample it can't watch, signs its evidence, and exports to Splunk, Cortex XDR, STIX/TAXII and MISP. 437 tests. | Python, scikit-learn, KVM, Sysmon, FastAPI, React |
| **[Detection Library](https://github.com/Raynskhiri/detection-library)** 🎯 | 62 detections written once in YAML and compiled to **Cortex XQL and Splunk SPL**, including full Active Directory attack coverage (Kerberos, delegation, ACLs, AD CS, DCSync), mapped to MITRE ATT&CK, each with triage steps. CI runs the compiled queries against events that must and must not fire. **[Live playground](https://detections.rayenskhiri.online)**: paste a command line, a Sysmon or a Windows Security event and watch the rules fire, or replay a full intrusion. | Python, XQL, SPL, Sysmon, ATT&CK |
| **SOC Triage Agent** 🚧 | Local LLM agent that investigates Cortex XDR alerts (enrichment, correlation, timeline), suggests classification and response, and drafts reports. Every action goes through **human approval in Slack**. | Python, Ollama, Slack API, Cortex XDR API |
| **[Securinets CTF writeups](https://github.com/Raynskhiri/Writeup)** 🏴 | Writeups from my Securinets days: server-side template injection (Jinja2) and local file inclusion challenges. | Web exploitation |

<sub>🚧 = work in progress</sub>

---

### 🧰 Tech stack

**SIEM, XDR and endpoint**
![Cortex XDR](https://img.shields.io/badge/Cortex%20XDR%20%2F%20XSIAM-FA582D?style=flat-square&logo=paloaltonetworks&logoColor=white)
![XQL](https://img.shields.io/badge/XQL-FA582D?style=flat-square)
![Splunk](https://img.shields.io/badge/Splunk-000000?style=flat-square&logo=splunk&logoColor=white)
![Wazuh](https://img.shields.io/badge/Wazuh-3595F4?style=flat-square)
![Security Onion](https://img.shields.io/badge/Security%20Onion-2E4A62?style=flat-square)
![Elastic](https://img.shields.io/badge/Elastic%20(ELK)-005571?style=flat-square&logo=elastic&logoColor=white)
![Microsoft Sentinel](https://img.shields.io/badge/Microsoft%20Sentinel-0078D4?style=flat-square)
![CrowdStrike](https://img.shields.io/badge/CrowdStrike%20Falcon-E01F3D?style=flat-square)
![Kaspersky](https://img.shields.io/badge/Kaspersky-006D5C?style=flat-square)
![Symantec](https://img.shields.io/badge/Symantec-FDB511?style=flat-square&logo=symantec&logoColor=black)
![Trend Micro](https://img.shields.io/badge/Trend%20Micro-D71921?style=flat-square&logo=trendmicro&logoColor=white)
![FortiGate](https://img.shields.io/badge/FortiGate-EE3124?style=flat-square&logo=fortinet&logoColor=white)

**Response, intel and forensics**
![Cortex XSOAR](https://img.shields.io/badge/Cortex%20XSOAR-FA582D?style=flat-square&logo=paloaltonetworks&logoColor=white)
![TheHive](https://img.shields.io/badge/TheHive-F3D02F?style=flat-square)
![MISP](https://img.shields.io/badge/MISP-2C4A6E?style=flat-square)
![OpenCTI](https://img.shields.io/badge/OpenCTI-001BDA?style=flat-square)
![Volatility](https://img.shields.io/badge/Volatility-6A1B9A?style=flat-square)
![Nessus](https://img.shields.io/badge/Nessus-00C176?style=flat-square)
![MITRE ATT&CK](https://img.shields.io/badge/MITRE%20ATT%26CK-C00000?style=flat-square)

**Offensive security**
![Burp Suite](https://img.shields.io/badge/Burp%20Suite-FF6633?style=flat-square&logo=burpsuite&logoColor=white)
![Kali Linux](https://img.shields.io/badge/Kali%20Linux-557C94?style=flat-square&logo=kalilinux&logoColor=white)
![Active Directory](https://img.shields.io/badge/Active%20Directory-0078D4?style=flat-square&logo=windows&logoColor=white)
![BloodHound](https://img.shields.io/badge/BloodHound-E61616?style=flat-square)
![Impacket](https://img.shields.io/badge/Impacket-333333?style=flat-square)

**Automation and dev**
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=flat-square)
![Bash](https://img.shields.io/badge/Bash-4EAA25?style=flat-square&logo=gnubash&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)

---

### 📜 Certifications

- ✅ **CRTP**: Certified Red Team Professional (Altered Security)
- 🔄 **Splunk Core Certified Power User**: in progress
- 🔄 **Palo Alto Networks Certified XDR Analyst**: in progress
- 🔄 **EC-Council Certified SOC Analyst (CSA)**: in progress

---

### 📊 GitHub stats

<p align="center">
  <img src="https://streak-stats.demolab.com?user=Raynskhiri&theme=tokyonight&hide_border=true" alt="GitHub streak">
</p>

---

<p align="center"><i>"Defend like an attacker thinks."</i></p>
