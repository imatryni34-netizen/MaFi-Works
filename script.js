const STORAGE_KEY = "peopledesk_employees";
const SESSION_KEY = "mafiworks_session";

const DEMO_CREDENTIALS = {
  username: "admin",
  password: "mafi123",
};

const DEPARTMENTS = [
  { name: "Engineering", color: "#0E8E89" },
  { name: "Product",     color: "#3D6FD9" },
  { name: "Design",      color: "#C75BAE" },
  { name: "Sales",       color: "#E1A23A" },
  { name: "HR",          color: "#6B6FE0" },
  { name: "Finance",     color: "#5BA37A" },
];

const SEED_EMPLOYEES = [
  { id: "EMP-1042", name: "Dian Saraswati",  role: "Backend Engineer",     dept: "Engineering", email: "dian.s@peopledesk.io",   join: "2023-02-14", status: "active" },
  { id: "EMP-1043", name: "Raka Pratama",    role: "Product Manager",      dept: "Product",     email: "raka.p@peopledesk.io",   join: "2022-09-01", status: "active" },
  { id: "EMP-1044", name: "Nadia Putri",     role: "UI/UX Designer",       dept: "Design",      email: "nadia.p@peopledesk.io",  join: "2024-01-10", status: "leave"  },
  { id: "EMP-1045", name: "Farhan Ardiansyah", role: "Sales Executive",    dept: "Sales",       email: "farhan.a@peopledesk.io", join: "2023-06-20", status: "active" },
  { id: "EMP-1046", name: "Citra Lestari",   role: "HR Specialist",        dept: "HR",          email: "citra.l@peopledesk.io",  join: "2021-11-05", status: "active" },
  { id: "EMP-1047", name: "Bagas Wirawan",   role: "Financial Analyst",    dept: "Finance",      email: "bagas.w@peopledesk.io", join: "2022-03-18", status: "inactive" },
  { id: "EMP-1048", name: "Salsabila Putri", role: "Frontend Engineer",    dept: "Engineering", email: "salsa.p@peopledesk.io",  join: "2024-04-02", status: "active" },
  { id: "EMP-1049", name: "Yoga Anggara",    role: "Account Executive",    dept: "Sales",       email: "yoga.a@peopledesk.io",   join: "2023-10-11", status: "active" },
];

let employees = [];
let editingId = null;
let deletingId = null;
let sortKey = null;
let sortDir = 1; // 1 = ascending, -1 = descending

/* ---------------- Storage ---------------- */
function loadEmployees(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try { employees = JSON.parse(raw); return; }
    catch(e){ /* fall through to seed */ }
  }
  employees = SEED_EMPLOYEES.slice();
  saveEmployees();
}

function saveEmployees(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

/* ---------------- Helpers ---------------- */
function deptColor(deptName){
  const d = DEPARTMENTS.find(d => d.name === deptName);
  return d ? d.color : "#999";
}

/* ----------------- Initials & Deterministic Color ----------------- */
function initials(name){
  return name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
}

function avatarColor(name){
  const hash = name.split("").reduce((a,c) => a + c.charCodeAt(0), 0);
  return DEPARTMENTS[hash % DEPARTMENTS.length].color;
}

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function nextEmployeeId(){
  const nums = employees.map(e => parseInt(e.id.replace("EMP-",""), 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1041;
  return "EMP-" + (max + 1);
}

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------------- Stats ---------------- */
function renderStats(){
  const total = employees.length;
  const deptCount = new Set(employees.map(e => e.dept)).size;
  const now = new Date();
  const thisMonth = employees.filter(e => {
    const d = new Date(e.join);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const onLeave = employees.filter(e => e.status === "leave").length;

  const stats = [
    { icon: "👥", value: total, label: "Total Employees", bg: "var(--teal-tint)" },
    { icon: "🏷️", value: deptCount, label: "Active Departments", bg: "var(--amber-tint)" },
    { icon: "🆕", value: thisMonth, label: "Joined This Month", bg: "#EAF0FE" },
    { icon: "🌴", value: onLeave, label: "On Leave Today", bg: "var(--rose-tint)" },
  ];

  const row = document.getElementById("statsRow");
  row.innerHTML = stats.map(s => `
    <div class="stat-badge">
      <div class="stat-icon" style="background:${s.bg}">${s.icon}</div>
      <p class="stat-value">${s.value}</p>
      <p class="stat-label">${s.label}</p>
    </div>
  `).join("");
}

/* ---------------- Table ---------------- */
function renderTable(){
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const deptFilter = document.getElementById("deptFilter").value;

  let filtered = employees.filter(e => {
    const matchesSearch = !search ||
      e.name.toLowerCase().includes(search) ||
      e.role.toLowerCase().includes(search) ||
      e.dept.toLowerCase().includes(search);
    const matchesDept = deptFilter === "all" || e.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  if(sortKey){
    filtered = filtered.slice().sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if(sortKey === "join"){ av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if(av < bv) return -1 * sortDir;
      if(av > bv) return 1 * sortDir;
      return 0;
    });
  }

  document.querySelectorAll(".sortable .sort-arrow").forEach(el => el.textContent = "");
  if(sortKey){
    const activeTh = document.querySelector(`.sortable[data-sort="${sortKey}"] .sort-arrow`);
    if(activeTh) activeTh.textContent = sortDir === 1 ? "▲" : "▼";
  }

  const body = document.getElementById("employeeTableBody");
  const emptyState = document.getElementById("emptyState");

  if(filtered.length === 0){
    body.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  body.innerHTML = filtered.map(e => `
    <tr>
      <td>
        <div class="emp-cell">
          <div class="avatar" style="background:${avatarColor(e.name)}">${initials(e.name)}</div>
          <div>
            <span class="emp-name">${e.name}</span>
            <span class="emp-id">${e.id}</span>
          </div>
        </div>
      </td>
      <td><span class="dept-tag" style="background:${deptColor(e.dept)}1A; color:${deptColor(e.dept)};"><span style="background:${deptColor(e.dept)}"></span>${e.dept}</span></td>
      <td>${e.role}</td>
      <td>${formatDate(e.join)}</td>
      <td><span class="status-pill status-${e.status}">${statusLabel(e.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Edit" data-edit="${e.id}">✎</button>
          <button class="icon-btn" title="Remove" data-delete="${e.id}">🗑</button>
        </div>
      </td>
    </tr>
  `).join("");

  body.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => openEditModal(btn.dataset.edit)));
  body.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", () => openDeleteConfirm(btn.dataset.delete)));
}

function statusLabel(s){
  return { active: "Active", leave: "On Leave", inactive: "Inactive" }[s] || s;
}

/* ---------------- Chart ---------------- */
function renderChart(){
  const canvas = document.getElementById("deptChart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.parentElement.clientWidth - 44; 
  if(size <= 0) return; 
  canvas.width = size * dpr;
  canvas.height = 220 * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = "220px";
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,size,220);

  const counts = {};
  employees.forEach(e => counts[e.dept] = (counts[e.dept] || 0) + 1);
  const entries = Object.entries(counts);
  const total = employees.length || 1;

  const cx = size/2, cy = 110, rOuter = 86, rInner = 54;
  let startAngle = -Math.PI/2;

  entries.forEach(([dept, count]) => {
    const slice = (count/total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, startAngle, startAngle + slice);
    ctx.arc(cx, cy, rInner, startAngle + slice, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = deptColor(dept);
    ctx.fill();
    startAngle += slice;
  });

  ctx.fillStyle = "#14213D";
  ctx.font = "700 22px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(total, cx, cy - 2);
  ctx.font = "500 11px Inter, sans-serif";
  ctx.fillStyle = "#6B7488";
  ctx.fillText("employees", cx, cy + 16);

  const legend = document.getElementById("chartLegend");
  legend.innerHTML = entries.map(([dept, count]) => `
    <li>
      <span class="swatch" style="background:${deptColor(dept)}"></span>
      ${dept}
      <strong>${count}</strong>
    </li>
  `).join("");
}

/* ---------------- Department Controls ---------------- */
function populateDeptControls(){
  const filter = document.getElementById("deptFilter");
  const formSelect = document.getElementById("fieldDept");
  const options = DEPARTMENTS.map(d => `<option value="${d.name}">${d.name}</option>`).join("");
  formSelect.innerHTML = options;
  filter.innerHTML = `<option value="all">All Departments</option>` + options;
}

/* ---------------- Modal: Add / Edit ---------------- */
function openAddModal(){
  editingId = null;
  document.getElementById("modalTitle").textContent = "Add Employee";
  document.getElementById("employeeForm").reset();
  document.getElementById("fieldStatus").value = "active";
  document.getElementById("formError").hidden = true;
  document.getElementById("modalOverlay").hidden = false;
  document.getElementById("fieldName").focus();
}

function openEditModal(id){
  const emp = employees.find(e => e.id === id);
  if(!emp) return;
  editingId = id;
  document.getElementById("modalTitle").textContent = "Edit Employee";
  document.getElementById("fieldName").value = emp.name;
  document.getElementById("fieldRole").value = emp.role;
  document.getElementById("fieldDept").value = emp.dept;
  document.getElementById("fieldEmail").value = emp.email;
  document.getElementById("fieldJoin").value = emp.join;
  document.getElementById("fieldStatus").value = emp.status;
  document.getElementById("formError").hidden = true;
  document.getElementById("modalOverlay").hidden = false;
}

function closeModal(){
  document.getElementById("modalOverlay").hidden = true;
  document.getElementById("formError").hidden = true;
  editingId = null;
}

function handleFormSubmit(ev){
  ev.preventDefault();
  const formError = document.getElementById("formError");
  formError.hidden = true;

  const data = {
    name: document.getElementById("fieldName").value.trim(),
    role: document.getElementById("fieldRole").value.trim(),
    dept: document.getElementById("fieldDept").value,
    email: document.getElementById("fieldEmail").value.trim().toLowerCase(),
    join: document.getElementById("fieldJoin").value,
    status: document.getElementById("fieldStatus").value,
  };

  const duplicate = employees.find(e =>
    e.email.toLowerCase() === data.email && e.id !== editingId
  );
  if(duplicate){
    formError.textContent = `That email is already used by ${duplicate.name}. Please use a different one.`;
    formError.hidden = false;
    return;
  }

  if(editingId){
    const emp = employees.find(e => e.id === editingId);
    Object.assign(emp, data);
    showToast(`Updated ${data.name}`);
  } else {
    employees.push({ id: nextEmployeeId(), ...data });
    showToast(`Added ${data.name} to the directory`);
  }

  saveEmployees();
  closeModal();
  renderAll();
}

/* ---------------- Delete ---------------- */
function openDeleteConfirm(id){
  const emp = employees.find(e => e.id === id);
  if(!emp) return;
  deletingId = id;
  document.getElementById("confirmName").textContent = emp.name;
  document.getElementById("confirmOverlay").hidden = false;
}

// Menutup modal konfirmasi hapus
function closeConfirm(){
  document.getElementById("confirmOverlay").hidden = true;
  deletingId = null;
}

function handleDelete(){
  if(!deletingId) return;
  const emp = employees.find(e => e.id === deletingId);
  employees = employees.filter(e => e.id !== deletingId);
  saveEmployees();
  showToast(`Removed ${emp.name}`);
  closeConfirm();
  renderAll();
}

function togglePasswordVisibility(){
  const input = document.getElementById("loginPassword");
  const icon = document.getElementById("eyeIcon");
  const btn = document.getElementById("eyeToggle");
  const willShow = input.type === "password";
  input.type = willShow ? "text" : "password";
  btn.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
  icon.innerHTML = willShow
    ? `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>`
    : `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
}

/* ---------------- Auth ---------------- */
function isLoggedIn(){
  return sessionStorage.getItem(SESSION_KEY) !== null;
}

function handleLoginSubmit(ev){
  ev.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");

  if(username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password){
    sessionStorage.setItem(SESSION_KEY, username);
    errorEl.hidden = true;
    showApp(username);
    renderAll();
  } else {
    errorEl.hidden = false;
  }
}

function showApp(username){
  document.getElementById("loginScreen").hidden = true;
  document.getElementById("appShell").hidden = false;
  document.getElementById("currentUserName").textContent = "HR Admin (" + username + ")";
}

function handleLogout(){
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById("loginForm").reset();
  document.getElementById("loginError").hidden = true;
  document.getElementById("appShell").hidden = true;
  document.getElementById("loginScreen").hidden = false;
}

/* ---------------- Departments View ---------------- */
function renderDepartmentsView(){
  const grid = document.getElementById("departmentsGrid");
  if(employees.length === 0){
    grid.innerHTML = `<p class="dept-card-empty">No employees yet. Add someone to see department breakdowns here.</p>`;
    return;
  }

  grid.innerHTML = DEPARTMENTS.map(d => {
    const members = employees.filter(e => e.dept === d.name);
    const active = members.filter(e => e.status === "active").length;
    const leave = members.filter(e => e.status === "leave").length;
    const inactive = members.filter(e => e.status === "inactive").length;

    return `
      <div class="dept-card" style="border-top:4px solid ${d.color}">
        <p class="dept-card-name">${d.name}</p>
        <p class="dept-card-count">${members.length}</p>
        <p class="dept-card-label">${members.length === 1 ? "employee" : "employees"}</p>
        <div class="dept-card-breakdown">
          <span><b>${active}</b> active</span>
          <span><b>${leave}</b> on leave</span>
          <span><b>${inactive}</b> inactive</span>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------------- Reset Data ---------------- */
function handleResetData(){
  localStorage.removeItem(STORAGE_KEY);
  loadEmployees();
  closeResetConfirm();
  showToast("Demo data has been reset");
  renderAll();
}

function openResetConfirm(){
  document.getElementById("resetConfirmOverlay").hidden = false;
}
function closeResetConfirm(){
  document.getElementById("resetConfirmOverlay").hidden = true;
}

/* ---------------- Render ---------------- */
function renderAll(){
  renderStats();
  renderTable();
  renderChart();
  renderDepartmentsView();
}

/* ---------------- Init ---------------- */
function init(){
  loadEmployees();
  populateDeptControls();

  document.getElementById("loginForm").addEventListener("submit", handleLoginSubmit);
  document.getElementById("eyeToggle").addEventListener("click", togglePasswordVisibility);
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  document.getElementById("resetDataBtn").addEventListener("click", openResetConfirm);
  document.getElementById("resetCancel").addEventListener("click", closeResetConfirm);
  document.getElementById("resetConfirm").addEventListener("click", handleResetData);
  document.getElementById("resetConfirmOverlay").addEventListener("click", (e) => {
    if(e.target.id === "resetConfirmOverlay") closeResetConfirm();
  });

  document.getElementById("addEmployeeBtn").addEventListener("click", openAddModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("employeeForm").addEventListener("submit", handleFormSubmit);

  document.getElementById("confirmCancel").addEventListener("click", closeConfirm);
  document.getElementById("confirmDelete").addEventListener("click", handleDelete);

  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("deptFilter").addEventListener("change", renderTable);

  document.querySelectorAll(".sortable").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if(sortKey === key){ sortDir *= -1; }
      else { sortKey = key; sortDir = 1; }
      renderTable();
    });
  });

  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if(e.target.id === "modalOverlay") closeModal();
  });
  document.getElementById("confirmOverlay").addEventListener("click", (e) => {
    if(e.target.id === "confirmOverlay") closeConfirm();
  });

  window.addEventListener("resize", renderChart);

  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      const dashboardView = document.getElementById("dashboardView");
      const statsRow = document.getElementById("statsRow");
      const departmentsView = document.getElementById("departmentsView");

      if(item.dataset.view === "departments"){
        dashboardView.hidden = true;
        statsRow.hidden = true;
        departmentsView.hidden = false;
        renderDepartmentsView();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        dashboardView.hidden = false;
        statsRow.hidden = false;
        departmentsView.hidden = true;
        if(item.dataset.view === "employees"){
          document.querySelector(".table-panel").scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
  });

  if(isLoggedIn()){
    showApp(sessionStorage.getItem(SESSION_KEY));
    renderAll();
  }
}

init();