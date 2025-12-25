// Demo “case file” subjects (fictional UI data)
const SUBJECTS = [
  {
    subjectId: "SUBJECT_001",
    caseId: "CF-0001",
    portrait: "img/rami.jpeg",
    tags: ["INTRUSION", "MALWARE", "SOCIAL ENGINEERING"],
    risk: "HIGH",
    status: "CONTAINED",
    summary: [
      "Unauthorized system access reported across multiple nodes.",
      "Artifacts indicate credential stuffing + lateral movement.",
      "Payload class: remote loader, staged execution, timed beacons.",
      "Evidence preserved. Monitoring ongoing.",
    ],
  },
  {
    subjectId: "SUBJECT_002",
    caseId: "CF-0002",
    portrait: "img/bhav.jpeg",
    tags: ["FRAUD", "DATA THEFT", "PHISHING"],
    risk: "MEDIUM",
    status: "UNDER REVIEW",
    summary: [
      "Suspicious transactions correlated with compromised accounts.",
      "Phishing infrastructure linked via repeated signature patterns.",
      "Data exfil suspected from multiple endpoints.",
      "Case escalated for deeper forensic review.",
    ],
  },
  
];

let current = 0;
let isEditing = false;

// localStorage keys
const LS_PREFIX = "casefile_console_v1:";
const storageKeyFor = (subjectId) => `${LS_PREFIX}${subjectId}`;

// DOM
const portraitEl = document.getElementById("portrait");
const consoleEdit = document.getElementById("consoleEdit");
const subjectName = document.getElementById("subjectName");
const subjectIndex = document.getElementById("subjectIndex");
const caseIdEl = document.getElementById("caseId");
const packetEl = document.getElementById("packet");
const clockEl = document.getElementById("clock");
const echoStateEl = document.getElementById("echoState");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");

prevBtn.addEventListener("click", () => loadSubject(current - 1));
nextBtn.addEventListener("click", () => loadSubject(current + 1));

editBtn.addEventListener("click", () => toggleEdit());
saveBtn.addEventListener("click", () => saveEdits());
resetBtn.addEventListener("click", () => resetEdits());

// Save shortcuts
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") loadSubject(current + 1);
  if (e.key === "ArrowLeft") loadSubject(current - 1);

  // Ctrl/Cmd+S to save while editing
  const isSave = (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "s");
  if (isSave && isEditing) {
    e.preventDefault();
    saveEdits();
  }

  // Escape to exit edit mode (no auto-save)
  if (e.key === "Escape" && isEditing) {
    setEditing(false);
    loadConsoleForCurrent(); // revert view to last saved/default
  }
});

function hexPacket() {
  const n = Math.floor(Math.random() * 0xffff);
  return "0x" + n.toString(16).toUpperCase().padStart(4, "0");
}

function setClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  clockEl.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(setClock, 250);
setClock();

function renderDefaultConsole(s) {
  const lines = [
    `> INIT CASEFILE_DB :: OK`,
    `> LOAD SUBJECT     :: ${s.subjectId}`,
    `> CASE ID          :: ${s.caseId}`,
    `> RISK             :: ${s.risk}`,
    `> STATUS           :: ${s.status}`,
    `> TAGS             :: ${s.tags.join(" | ")}`,
    ``,
    `--- SUMMARY ----------------------------------------------------`,
    ...s.summary.map((x) => `- ${x}`),
    ``,
    `--- NOTES ------------------------------------------------------`,
    `* DEMO INTERFACE: fictional case content for UI/portfolio use.`,
    `* Use NEXT/PREV to cycle subjects.`,
    ``,
    `STATUS: READY`,
  ];
  return lines.join("\n");
}

function getSavedConsole(subjectId) {
  try {
    return localStorage.getItem(storageKeyFor(subjectId));
  } catch {
    return null;
  }
}

function setSavedConsole(subjectId, text) {
  try {
    localStorage.setItem(storageKeyFor(subjectId), text);
  } catch {
    // ignore if storage blocked
  }
}

function clearSavedConsole(subjectId) {
  try {
    localStorage.removeItem(storageKeyFor(subjectId));
  } catch {
    // ignore
  }
}

function setEditing(on) {
  isEditing = on;

  consoleEdit.readOnly = !on;
  consoleEdit.classList.toggle("is-editing", on);

  saveBtn.disabled = !on;
  resetBtn.disabled = !on;

  editBtn.textContent = on ? "LOCK" : "EDIT";
  echoStateEl.textContent = on ? "ON" : "OFF";

  // While editing, prevent accidental subject switching
  prevBtn.disabled = on;
  nextBtn.disabled = on;

  if (on) {
    // put cursor at end
    consoleEdit.focus();
    consoleEdit.setSelectionRange(consoleEdit.value.length, consoleEdit.value.length);
  } else {
    consoleEdit.blur();
  }
}

function toggleEdit() {
  setEditing(!isEditing);
}

function loadConsoleForCurrent() {
  const s = SUBJECTS[current];
  const saved = getSavedConsole(s.subjectId);

  // If there's saved content, use it; otherwise use default render.
  consoleEdit.value = saved ?? renderDefaultConsole(s);
}

function saveEdits() {
  const s = SUBJECTS[current];
  setSavedConsole(s.subjectId, consoleEdit.value);
  setEditing(false);
}

function resetEdits() {
  const s = SUBJECTS[current];
  clearSavedConsole(s.subjectId);
  consoleEdit.value = renderDefaultConsole(s);
  setEditing(false);
}

function loadSubject(index) {
  // Guard: if somehow triggered while editing
  if (isEditing) return;

  current = (index + SUBJECTS.length) % SUBJECTS.length;
  const s = SUBJECTS[current];

  subjectName.textContent = s.subjectId;
  subjectIndex.textContent =
    String(current + 1).padStart(2, "0") + "/" + String(SUBJECTS.length).padStart(2, "0");

  caseIdEl.textContent = s.caseId;
  packetEl.textContent = hexPacket();

  // swap portrait
  portraitEl.src = s.portrait;

  // load console (saved or default)
  loadConsoleForCurrent();
}

// boot
setEditing(false);
loadSubject(0);
