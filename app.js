(function() {
  "use strict";

  // ─── CONSTANTS ──────────────────────────────────────────────────────────────
  const COLORS = [
    { name: 'Purple', bg: '#7F77DD', light: '#EEEDFE', hex: '#534AB7' },
    { name: 'Teal',   bg: '#1D9E75', light: '#E1F5EE', hex: '#0F6E56' },
    { name: 'Coral',  bg: '#D85A30', light: '#FAECE7', hex: '#993C1D' },
    { name: 'Pink',   bg: '#D4537E', light: '#FBEAF0', hex: '#993556' },
    { name: 'Amber',  bg: '#BA7517', light: '#FAEEDA', hex: '#854F0B' },
    { name: 'Blue',   bg: '#378ADD', light: '#E6F1FB', hex: '#185FA5' },
  ];

  const EMOJIS = ['👤','👨','👩','👴','👵','🧑','👦','👧','🧓','👶','🧔','👱'];

  const REL_TYPES = {
    'spouse':       { label: 'Spouse / partner', color: '#D4537E', dash: 'none',  desc: 'Married or partnered' },
    'sibling':      { label: 'Sibling',           color: '#378ADD', dash: '6,4',   desc: 'Shared parents' },
    'parent-child': { label: 'Parent-child',      color: '#1D9E75', dash: 'none',  desc: 'Direct lineage' },
  };

  const GEN_LABELS = ['Gen 1', 'Gen 2', 'Gen 3', 'Gen 4'];

  const DEFAULT_DATA = {
    members: [
      { id: '1', name: 'Arthur Pendelton', birthDate: '1942-03-12', deathDate: '2018-11-05', gender: 'male', color: 0, emoji: '👴', bio: 'Patriarch, passionate carpenter, loved jazz.', generation: 0, x: 420, y: 110 },
      { id: '2', name: 'Eleanor Vance', birthDate: '1945-07-22', deathDate: '', gender: 'female', color: 3, emoji: '👵', bio: 'Retired botanist, master gardener, classical pianist.', generation: 0, x: 640, y: 110 },
      { id: '3', name: 'Charles Pendelton', birthDate: '1970-05-15', deathDate: '', gender: 'male', color: 5, emoji: '👨', bio: 'Software architect, high-altitude mountaineer.', generation: 1, x: 250, y: 310 },
      { id: '4', name: 'Diana Ross-Pendelton', birthDate: '1973-09-02', deathDate: '', gender: 'female', color: 1, emoji: '👩', bio: 'Pediatric surgeon, watercolor painter.', generation: 1, x: 470, y: 310 },
      { id: '5', name: 'Beatrice Pendelton', birthDate: '1975-12-10', deathDate: '', gender: 'female', color: 0, emoji: '👩', bio: 'Environmental journalist, documentary filmmaker.', generation: 1, x: 760, y: 310 },
      { id: '6', name: 'Julian Mercer', birthDate: '1972-04-18', deathDate: '', gender: 'male', color: 2, emoji: '👨', bio: 'Chef and owner of "The Hearth" bistro.', generation: 1, x: 980, y: 310 },
      { id: '7', name: 'Fiona Pendelton', birthDate: '2001-08-24', deathDate: '', gender: 'female', color: 4, emoji: '👧', bio: 'Graduate student in aerospace engineering.', generation: 2, x: 150, y: 510 },
      { id: '8', name: 'Gabriel Pendelton', birthDate: '2004-11-30', deathDate: '', gender: 'male', color: 0, emoji: '👦', bio: 'Competitive chess player, college freshman.', generation: 2, x: 370, y: 510 },
      { id: '9', name: 'Henry Mercer', birthDate: '2008-01-14', deathDate: '', gender: 'male', color: 1, emoji: '👦', bio: 'Soccer captain, VR enthusiast.', generation: 2, x: 860, y: 510 }
    ],
    relationships: [
      { id: 'r1', person1Id: '1', person2Id: '2', type: 'spouse' },
      { id: 'r2', person1Id: '3', person2Id: '4', type: 'spouse' },
      { id: 'r3', person1Id: '5', person2Id: '6', type: 'spouse' },
      { id: 'r4', person1Id: '3', person2Id: '5', type: 'sibling' },
      { id: 'r5', person1Id: '7', person2Id: '8', type: 'sibling' },
      { id: 'r6', person1Id: '1', person2Id: '3', type: 'parent-child' },
      { id: 'r7', person1Id: '2', person2Id: '3', type: 'parent-child' },
      { id: 'r8', person1Id: '1', person2Id: '5', type: 'parent-child' },
      { id: 'r9', person1Id: '2', person2Id: '5', type: 'parent-child' },
      { id: 'r10', person1Id: '3', person2Id: '7', type: 'parent-child' },
      { id: 'r11', person1Id: '4', person2Id: '7', type: 'parent-child' },
      { id: 'r12', person1Id: '3', person2Id: '8', type: 'parent-child' },
      { id: 'r13', person1Id: '4', person2Id: '8', type: 'parent-child' },
      { id: 'r14', person1Id: '5', person2Id: '9', type: 'parent-child' },
      { id: 'r15', person1Id: '6', person2Id: '9', type: 'parent-child' }
    ]
  };

  const NODE_W = 176;
  const NODE_H = 76;

  // ─── CSV HELPERS ────────────────────────────────────────────────────────────
  function csvEscape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str === '') return '';
    if (/[",\r\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function csvParse(text) {
    if (text == null) return [];
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = 0;
    const len = text.length;
    while (i < len) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += ch;
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ',') {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      if (ch === '\r') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        if (text[i + 1] === '\n') i += 2; else i++;
        continue;
      }
      if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      field += ch;
      i++;
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    if (rows.length > 0) {
      const last = rows[rows.length - 1];
      if (last.length === 1 && last[0] === '') {
        rows.pop();
      }
    }
    return rows;
  }

  function coerceCell(raw, type) {
    if (raw === '' || raw === null || raw === undefined) {
      if (type === 'number') return 0;
      if (type === 'boolean') return false;
      return '';
    }
    if (type === 'number') {
      const n = Number(raw);
      return isNaN(n) ? 0 : n;
    }
    if (type === 'boolean') {
      const v = String(raw).trim().toLowerCase();
      return v === 'true' || v === '1' || v === 'yes';
    }
    return String(raw);
  }

  const MEMBER_COLUMNS = [
    { key: 'id',           type: 'string'  },
    { key: 'name',         type: 'string'  },
    { key: 'birthDate',    type: 'string'  },
    { key: 'deathDate',    type: 'string'  },
    { key: 'gender',       type: 'string'  },
    { key: 'color',        type: 'number'  },
    { key: 'emoji',        type: 'string'  },
    { key: 'bio',          type: 'string'  },
    { key: 'generation',   type: 'number'  },
    { key: 'x',            type: 'number'  },
    { key: 'y',            type: 'number'  },
    { key: 'milkMotherId', type: 'string'  },
    { key: 'approved',     type: 'boolean' },
    { key: 'addedBy',      type: 'string'  },
  ];

  const RELATIONSHIP_COLUMNS = [
    { key: 'id',         type: 'string'  },
    { key: 'person1Id',  type: 'string'  },
    { key: 'person2Id',  type: 'string'  },
    { key: 'type',       type: 'string'  },
    { key: 'approved',   type: 'boolean' },
    { key: 'addedBy',    type: 'string'  },
  ];

  function serializeRows(columns, rows) {
    const lines = [columns.map(c => csvEscape(c.key)).join(',')];
    rows.forEach(row => {
      const cells = columns.map(c => {
        const v = row[c.key];
        if (c.type === 'boolean') return csvEscape(v ? 'true' : 'false');
        return csvEscape(v);
      });
      lines.push(cells.join(','));
    });
    return '\uFEFF' + lines.join('\r\n') + '\r\n';
  }

  function deserializeRows(columns, csvText) {
    const rows = csvParse(csvText);
    if (rows.length === 0) return [];
    const out = [];
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      if (cells.length === 1 && cells[0] === '') continue;
      const obj = {};
      columns.forEach((col, idx) => {
        const raw = cells[idx] !== undefined ? cells[idx] : '';
        obj[col.key] = coerceCell(raw, col.type);
      });
      out.push(obj);
    }
    return out;
  }

  function membersToCsv(membersList) {
    return serializeRows(MEMBER_COLUMNS, membersList);
  }

  function csvToMembers(text) {
    return deserializeRows(MEMBER_COLUMNS, text);
  }

  function relationshipsToCsv(relsList) {
    return serializeRows(RELATIONSHIP_COLUMNS, relsList);
  }

  function csvToRelationships(text) {
    return deserializeRows(RELATIONSHIP_COLUMNS, text);
  }


  // ─── STATE variables ────────────────────────────────────────────────────────
  let members = [];
  let relationships = [];
  let selectedId = null;
  let zoom = 1;
  let pan = { x: 80, y: 60 };
  let relFilters = { spouse: true, sibling: true, 'parent-child': true };
  let searchQ = '';
  let historyStack = [];
  
  // Drag states
  let isDraggingCanvas = false;
  let canvasDragStart = { x: 0, y: 0 };
  let draggedNodeId = null;
  let nodeDragOffset = { x: 0, y: 0 };
  let hasDragged = false;

  // Touch / Pointer Gesture states
  let activePointers = [];
  let initialTouchDistance = 0;
  let initialZoom = 1;
  let initialCenter = { x: 0, y: 0 };
  
  // Alert timeouts
  let alertTimeout = null;

  // Role status
  let userRole = 'member'; // 'admin' or 'member'

  // Dialog fields memory
  let memberDialogEmoji = '👤';
  let memberDialogColor = 0;
  let editingMemberId = null; // null for add, string id for edit
  let relationDialogType = 'spouse';

  // ─── DOM ELEMENTS ───────────────────────────────────────────────────────────
  const elBtnAlign = document.getElementById('btnAlign');
  const elSearchInput = document.getElementById('searchInput');
  const elSearchClear = document.getElementById('searchClear');
  const elFilterSpouse = document.getElementById('filterSpouse');
  const elFilterSibling = document.getElementById('filterSibling');
  const elFilterParentChild = document.getElementById('filterParentChild');
  const elDetailPanel = document.getElementById('detailPanel');
  
  const elBtnOpenAddMember = document.getElementById('btnOpenAddMember');
  const elBtnOpenAddLink = document.getElementById('btnOpenAddLink');
  
  const elCanvasWrapper = document.getElementById('canvasWrapper');
  const elCanvasViewport = document.getElementById('canvasViewport');
  const elConnectionsSvg = document.getElementById('connectionsSvg');
  const elNodeCardsContainer = document.getElementById('nodeCardsContainer');
  
  // Responsive UI elements
  const elSidebar = document.querySelector('.sidebar');
  const elBtnToggleSidebar = document.getElementById('btnToggleSidebar');
  const elSidebarBackdrop = document.getElementById('sidebarBackdrop');
  
  const elBtnUndo = document.getElementById('btnUndo');
  const elBtnExport = document.getElementById('btnExport');
  const elFileImportInput = document.getElementById('fileImportInput');
  const elBtnImportLabel = document.getElementById('btnImportLabel');
  const elBtnThemeToggle = document.getElementById('btnThemeToggle');
  
  const elBtnZoomIn = document.getElementById('btnZoomIn');
  const elBtnZoomOut = document.getElementById('btnZoomOut');
  const elBtnZoomFit = document.getElementById('btnZoomFit');
  const elZoomLevelIndicator = document.getElementById('zoomLevelIndicator');
  
  // Quick Add elements
  const elQuickAddPanel = document.getElementById('quickAddPanel');
  const elBtnQuickAddClose = document.getElementById('btnQuickAddClose');
  const elQuickAddName = document.getElementById('quickAddName');
  const elQuickAddEmojiGrid = document.getElementById('quickAddEmojiGrid');
  const elQuickAddColorGrid = document.getElementById('quickAddColorGrid');
  const elQuickAddGender = document.getElementById('quickAddGender');
  const elQuickAddGen = document.getElementById('quickAddGen');
  const elQuickAddBirthY = document.getElementById('quickAddBirthY');
  const elBtnQuickAddSave = document.getElementById('btnQuickAddSave');
  const elBtnQuickAddMore = document.getElementById('btnQuickAddMore');
  let quickAddEmoji = '👤';
  let quickAddColor = 0;

  // Dialog elements
  const elMemberDialog = document.getElementById('memberDialog');
  const elBtnMemberDialogClose = document.getElementById('btnMemberDialogClose');
  const elMemberDialogName = document.getElementById('memberDialogName');
  const elMemberDialogEmojiGrid = document.getElementById('memberDialogEmojiGrid');
  const elMemberDialogColorGrid = document.getElementById('memberDialogColorGrid');
  const elMemberDialogBirthDate = document.getElementById('memberDialogBirthDate');
  const elMemberDialogDeathDate = document.getElementById('memberDialogDeathDate');
  const elMemberDialogGender = document.getElementById('memberDialogGender');
  const elMemberDialogGen = document.getElementById('memberDialogGen');
  const elMemberDialogBio = document.getElementById('memberDialogBio');
  const elMemberDialogMilkMother = document.getElementById('memberDialogMilkMother');
  const elBtnMemberDialogCancel = document.getElementById('btnMemberDialogCancel');
  const elBtnMemberDialogSave = document.getElementById('btnMemberDialogSave');
  const elMemberDialogTitle = document.getElementById('memberDialogTitle');

  const elRelationDialog = document.getElementById('relationDialog');
  const elBtnRelationDialogClose = document.getElementById('btnRelationDialogClose');
  const elRelationDialogP1 = document.getElementById('relationDialogP1');
  const elRelationDialogP2 = document.getElementById('relationDialogP2');
  const elRelationDialogP1Label = document.getElementById('relationDialogP1Label');
  const elRelationDialogP2Label = document.getElementById('relationDialogP2Label');
  const elRelationDialogP2Group = document.getElementById('relationDialogP2Group');
  const elRelationDialogP2Hint = document.getElementById('relationDialogP2Hint');
  const elRelationDialogSiblingCount = document.getElementById('relationDialogSiblingCount');
  const elRelationDialogFatherGroup = document.getElementById('relationDialogFatherGroup');
  const elRelationDialogMotherGroup = document.getElementById('relationDialogMotherGroup');
  const elRelationDialogFather = document.getElementById('relationDialogFather');
  const elRelationDialogMother = document.getElementById('relationDialogMother');
  const elRelOptionSpouse = document.getElementById('relOptionSpouse');
  const elRelOptionSibling = document.getElementById('relOptionSibling');
  const elRelOptionParentChild = document.getElementById('relOptionParentChild');
  const elBtnRelationDialogCancel = document.getElementById('btnRelationDialogCancel');
  const elBtnRelationDialogSave = document.getElementById('btnRelationDialogSave');

  // Alert elements
  const elAlertToast = document.getElementById('alertToast');
  const elAlertToastDot = document.getElementById('alertToastDot');
  const elAlertToastText = document.getElementById('alertToastText');

  // Admin / RBAC elements
  const elRoleBadge = document.getElementById('roleBadge');
  const elBtnAdminToggle = document.getElementById('btnAdminToggle');
  const elLoginDialog = document.getElementById('loginDialog');
  const elBtnLoginDialogClose = document.getElementById('btnLoginDialogClose');
  const elAdminPasswordInput = document.getElementById('adminPasswordInput');
  const elBtnLoginCancel = document.getElementById('btnLoginCancel');
  const elBtnLoginSubmit = document.getElementById('btnLoginSubmit');

  // ─── INVITATION CODE GATE ───────────────────────────────────────────────────
  const INVITATION_CODE = 'tree';
  const INVITATION_STORAGE_KEY = 'kinship_invitation_verified';

  const elInvitationGate = document.getElementById('invitationGate');
  const elInvitationForm = document.getElementById('invitationForm');
  const elInvitationInput = document.getElementById('invitationCodeInput');
  const elInvitationError = document.getElementById('invitationError');
  const elInvitationCard = elInvitationGate ? elInvitationGate.querySelector('.invitation-card') : null;

  function isInvitationVerified() {
    try {
      return localStorage.getItem(INVITATION_STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setInvitationVerified() {
    try {
      localStorage.setItem(INVITATION_STORAGE_KEY, 'true');
    } catch (e) {
      // ignore storage errors
    }
  }

  function lockApp() {
    document.body.classList.add('gate-locked');
  }

  function unlockApp() {
    document.body.classList.remove('gate-locked');
  }

  function showInvitationError(message) {
    if (elInvitationError) elInvitationError.textContent = message;
    if (elInvitationInput) elInvitationInput.classList.add('has-error');
    if (elInvitationCard) {
      elInvitationCard.classList.remove('shake');
      // Force reflow to restart animation
      void elInvitationCard.offsetWidth;
      elInvitationCard.classList.add('shake');
    }
  }

  function clearInvitationError() {
    if (elInvitationError) elInvitationError.textContent = '';
    if (elInvitationInput) elInvitationInput.classList.remove('has-error');
  }

  function attemptUnlock() {
    if (!elInvitationInput) return;
    const entered = (elInvitationInput.value || '').trim();
    if (!entered) {
      showInvitationError('Please enter an invitation code.');
      elInvitationInput.focus();
      return;
    }
    if (entered.toLowerCase() === INVITATION_CODE.toLowerCase()) {
      setInvitationVerified();
      clearInvitationError();
      elInvitationInput.disabled = true;
      const submitBtn = document.getElementById('invitationSubmit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Unlocked ✓';
      }
      if (elInvitationGate) elInvitationGate.classList.add('hidden');
      unlockApp();
      // Start the actual app after the gate fades out
      setTimeout(() => {
        if (elInvitationGate && elInvitationGate.parentNode) {
          elInvitationGate.parentNode.removeChild(elInvitationGate);
        }
        initApp();
      }, 480);
    } else {
      showInvitationError('Invalid invitation code. Access denied.');
      elInvitationInput.value = '';
      elInvitationInput.focus();
    }
  }

  function setupInvitationGate() {
    if (!elInvitationGate || !elInvitationForm || !elInvitationInput) return;
    elInvitationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      attemptUnlock();
    });
    elInvitationInput.addEventListener('input', () => {
      if (elInvitationInput.classList.contains('has-error')) {
        clearInvitationError();
      }
    });
    // Lock the app behind the gate initially
    lockApp();
    // Auto-focus the input
    setTimeout(() => {
      elInvitationInput.focus();
    }, 100);
  }

  // ─── INITIALIZATION ─────────────────────────────────────────────────────────
  function initApp() {
    loadData().then(() => {
      recalculateGenerations();
      setupEventListeners();
      renderAll();
    });
  }

  function init() {
    if (isInvitationVerified()) {
      // Already verified - skip the gate and run the app
      if (elInvitationGate && elInvitationGate.parentNode) {
        elInvitationGate.parentNode.removeChild(elInvitationGate);
      }
      unlockApp();
      initApp();
    } else {
      // Show the gate and block the app until a valid code is entered
      setupInvitationGate();
    }
  }

  async function loadData() {
    // 1. Try local storage (CSV format)
    try {
      const storedMembers = localStorage.getItem('family_tree_members_csv');
      const storedRels = localStorage.getItem('family_tree_relationships_csv');
      if (storedMembers && storedRels) {
        members = csvToMembers(storedMembers);
        relationships = csvToRelationships(storedRels);
        return;
      }
    } catch (e) {
      console.warn('Failed parsing local storage CSV data', e);
    }

    // 2. Try fetching members.csv and relationships.csv
    try {
      const [memRes, relRes] = await Promise.all([
        fetch('members.csv'),
        fetch('relationships.csv')
      ]);
      if (memRes.ok && relRes.ok) {
        const memText = await memRes.text();
        const relText = await relRes.text();
        members = csvToMembers(memText);
        relationships = csvToRelationships(relText);
        saveToLocalStorage();
        return;
      }
    } catch (e) {
      console.warn('Failed fetching CSV files (often due to local file:// CORS policies). Falling back to internal data.', e);
    }

    // 3. Fallback to default copy (round-tripped through CSV to keep in-memory shape consistent)
    const defaultMemCsv = membersToCsv(DEFAULT_DATA.members.map(m => Object.assign({ approved: true, addedBy: 'admin' }, m)));
    const defaultRelCsv = relationshipsToCsv(DEFAULT_DATA.relationships.map(r => Object.assign({ approved: true, addedBy: 'admin' }, r)));
    members = csvToMembers(defaultMemCsv);
    relationships = csvToRelationships(defaultRelCsv);
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('family_tree_members_csv', membersToCsv(members));
      localStorage.setItem('family_tree_relationships_csv', relationshipsToCsv(relationships));
      // Clean up legacy JSON cache if present
      if (localStorage.getItem('family_tree_data')) {
        localStorage.removeItem('family_tree_data');
      }
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────
  function canModifyMember(member) {
    if (userRole === 'admin') return true;
    return member.addedBy === 'member' && !member.approved;
  }

  function canModifyRelation(rel) {
    if (userRole === 'admin') return true;
    return rel.addedBy === 'member' && !rel.approved;
  }

  const nodeCenter = (m) => ({ x: m.x + NODE_W / 2, y: m.y + NODE_H / 2 });

  function buildPath(rel, membersList) {
    const from = membersList.find(m => m.id === rel.person1Id);
    const to   = membersList.find(m => m.id === rel.person2Id);
    if (!from || !to) return null;
    const fc = nodeCenter(from);
    const tc = nodeCenter(to);

    if (rel.type === 'spouse') {
      const dy = Math.abs(tc.y - fc.y);
      if (dy < 50) return `M${fc.x},${fc.y}L${tc.x},${tc.y}`;
      const cx = (fc.x + tc.x) / 2;
      return `M${fc.x},${fc.y}C${cx},${fc.y},${cx},${tc.y},${tc.x},${tc.y}`;
    }
    if (rel.type === 'parent-child') {
      const my = (fc.y + tc.y) / 2;
      return `M${fc.x},${fc.y}L${fc.x},${my}L${tc.x},${my}L${tc.x},${tc.y}`;
    }
    // sibling arch
    const mx = (fc.x + tc.x) / 2;
    const arch = Math.max(30, Math.abs(tc.x - fc.x) * 0.15);
    const cy = Math.min(fc.y, tc.y) - arch;
    return `M${fc.x},${fc.y}Q${mx},${cy},${tc.x},${tc.y}`;
  }

  function recalculateGenerations() {
    if (members.length === 0) return;
    
    // Build adjacency list for relationship graph
    const adj = {};
    members.forEach(m => {
      adj[m.id] = [];
    });
    
    relationships.forEach(r => {
      const p1 = r.person1Id;
      const p2 = r.person2Id;
      if (!adj[p1] || !adj[p2]) return;
      
      if (r.type === 'spouse' || r.type === 'sibling') {
        adj[p1].push({ to: p2, diff: 0 });
        adj[p2].push({ to: p1, diff: 0 });
      } else if (r.type === 'parent-child') {
        // person1 is parent, person2 is child
        adj[p1].push({ to: p2, diff: 1 });
        adj[p2].push({ to: p1, diff: -1 });
      }
    });
    
    const visited = new Set();
    const components = [];
    const tempVisited = new Set();
    
    // Find all connected components
    members.forEach(m => {
      if (!tempVisited.has(m.id)) {
        const comp = [];
        const queue = [m.id];
        tempVisited.add(m.id);
        while (queue.length > 0) {
          const curr = queue.shift();
          comp.push(curr);
          adj[curr].forEach(edge => {
            if (!tempVisited.has(edge.to)) {
              tempVisited.add(edge.to);
              queue.push(edge.to);
            }
          });
        }
        components.push(comp);
      }
    });
    
    // For each component, calculate generations relative to an anchor node
    components.forEach(comp => {
      // Find anchor node (one that already has a generation set, preferably the smallest index)
      let anchorId = comp[0];
      let minGen = Infinity;
      
      comp.forEach(id => {
        const m = members.find(x => x.id === id);
        if (m && m.generation !== undefined && m.generation < minGen) {
          minGen = m.generation;
          anchorId = id;
        }
      });
      
      const anchorMember = members.find(x => x.id === anchorId);
      const anchorGen = (anchorMember && anchorMember.generation !== undefined) ? anchorMember.generation : 1;
      
      const genMap = {};
      genMap[anchorId] = anchorGen;
      const queue = [anchorId];
      visited.add(anchorId);
      
      while (queue.length > 0) {
        const curr = queue.shift();
        const currGen = genMap[curr];
        
        adj[curr].forEach(edge => {
          if (!visited.has(edge.to)) {
            const nextGen = currGen + edge.diff;
            genMap[edge.to] = nextGen;
            visited.add(edge.to);
            queue.push(edge.to);
          }
        });
      }
      
      // Shift so minimum generation in component is at least 0
      let minCalculatedGen = Infinity;
      comp.forEach(id => {
        if (genMap[id] < minCalculatedGen) {
          minCalculatedGen = genMap[id];
        }
      });
      
      const offset = minCalculatedGen < 0 ? -minCalculatedGen : 0;
      
      comp.forEach(id => {
        const m = members.find(x => x.id === id);
        if (m) {
          m.generation = Math.max(0, genMap[id] + offset);
        }
      });
    });
  }

  // ─── AUTO GENERATION HELPERS ───────────────────────────────────────────────

  // Suggests a generation for a brand-new standalone member (one with no
  // parent links yet). The strategy is to drop them one row BELOW the
  // deepest existing generation, so the new card appears at the bottom
  // of the tree until a parent-child link is created — at which point
  // recalculateGenerations() will promote them to the correct row.
  // For an empty tree we return 0.
  function getSuggestedGeneration() {
    if (!members || members.length === 0) return 0;
    let maxGen = 0;
    for (let i = 0; i < members.length; i++) {
      const g = members[i].generation;
      if (typeof g === 'number' && g > maxGen) maxGen = g;
    }
    return Math.max(0, maxGen + 1);
  }

  // Populate a generation <select> with a single read-only option that
  // shows the auto-calculated generation. The select stays disabled so
  // the user cannot pick a different one — generation is purely a
  // function of the parent-child graph.
  function renderAutoGenSelect(selectEl, genValue) {
    if (!selectEl) return;
    const genInt = (typeof genValue === 'number' && isFinite(genValue)) ? genValue : 0;
    const labels = ['Gen 1', 'Gen 2', 'Gen 3', 'Gen 4', 'Gen 5', 'Gen 6', 'Gen 7', 'Gen 8'];
    const label = labels[genInt] || ('Gen ' + (genInt + 1));
    if (selectEl.options.length === 1 && selectEl.options[0].textContent === label) {
      selectEl.value = String(genInt);
      return;
    }
    selectEl.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = String(genInt);
    opt.textContent = label;
    selectEl.appendChild(opt);
    selectEl.value = String(genInt);
  }

  // ─── PICKER RENDERERS ───────────────────────────────────────────────────────
  function renderEmojiPicker(container, selectedEmoji, onClickCallback) {
    container.innerHTML = '';
    EMOJIS.forEach(emoji => {
      const item = document.createElement('div');
      item.className = `emoji-picker-item ${emoji === selectedEmoji ? 'active' : ''}`;
      item.textContent = emoji;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.addEventListener('click', () => {
        container.querySelectorAll('.emoji-picker-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        onClickCallback(emoji);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          item.click();
        }
      });
      container.appendChild(item);
    });
  }

  function renderColorPicker(container, selectedColorIdx, onClickCallback) {
    container.innerHTML = '';
    COLORS.forEach((color, idx) => {
      const dot = document.createElement('div');
      dot.className = `color-picker-dot ${idx === selectedColorIdx ? 'active' : ''}`;
      dot.style.backgroundColor = color.bg;
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.title = color.name;
      dot.addEventListener('click', () => {
        container.querySelectorAll('.color-picker-dot').forEach(el => el.classList.remove('active'));
        dot.classList.add('active');
        onClickCallback(idx);
      });
      dot.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          dot.click();
        }
      });
      container.appendChild(dot);
    });
  }

  function renderModalColorPicker(container, selectedColorIdx, onClickCallback) {
    container.innerHTML = '';
    COLORS.forEach((color, idx) => {
      const item = document.createElement('div');
      item.className = `color-selector-item-modal ${idx === selectedColorIdx ? 'active' : ''}`;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.title = color.name;
      
      const dot = document.createElement('span');
      dot.className = 'color-selector-dot-modal';
      dot.style.backgroundColor = color.bg;
      
      const label = document.createElement('span');
      label.textContent = color.name;
      
      item.appendChild(dot);
      item.appendChild(label);
      item.addEventListener('click', () => {
        container.querySelectorAll('.color-selector-item-modal').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        onClickCallback(idx);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          item.click();
        }
      });
      container.appendChild(item);
    });
  }

  // ─── KINSHIP HELPERS ────────────────────────────────────────────────────────
  function getParents(personId) {
    return relationships
      .filter(r => r.type === 'parent-child' && r.person2Id === personId)
      .map(r => r.person1Id);
  }

  function getChildren(personId) {
    return relationships
      .filter(r => r.type === 'parent-child' && r.person1Id === personId)
      .map(r => r.person2Id);
  }

  function getCurrentSpouses(personId) {
    return relationships
      .filter(r => r.type === 'spouse' && (r.person1Id === personId || r.person2Id === personId))
      .map(r => r.person1Id === personId ? r.person2Id : r.person1Id);
  }

  function getPastSpouses(personId) {
    const currentSpouses = getCurrentSpouses(personId);
    const children = getChildren(personId);
    const pastSpouses = new Set();
    
    children.forEach(childId => {
      getParents(childId).forEach(pId => {
        if (pId !== personId && !currentSpouses.includes(pId)) {
          pastSpouses.add(pId);
        }
      });
    });
    return Array.from(pastSpouses);
  }

  function getEverSpouses(personId) {
    const current = getCurrentSpouses(personId);
    const past = getPastSpouses(personId);
    return Array.from(new Set([...current, ...past]));
  }

  function getAncestors(personId) {
    const ancestors = new Set();
    const queue = [personId];
    while (queue.length > 0) {
      const curr = queue.shift();
      getParents(curr).forEach(pId => {
        if (!ancestors.has(pId)) {
          ancestors.add(pId);
          queue.push(pId);
        }
      });
    }
    return Array.from(ancestors);
  }

  function getDescendants(personId) {
    const descendants = new Set();
    const queue = [personId];
    while (queue.length > 0) {
      const curr = queue.shift();
      getChildren(curr).forEach(cId => {
        if (!descendants.has(cId)) {
          descendants.add(cId);
          queue.push(cId);
        }
      });
    }
    return Array.from(descendants);
  }

  function areSiblings(p1Id, p2Id) {
    if (p1Id === p2Id) return false;
    const hasSharedParent = getParents(p1Id).some(p => getParents(p2Id).includes(p));
    if (hasSharedParent) return true;

    const explicitSib = relationships.some(r => 
      r.type === 'sibling' && ((r.person1Id === p1Id && r.person2Id === p2Id) || (r.person1Id === p2Id && r.person2Id === p1Id))
    );
    if (explicitSib) return true;

    const parents1 = getParents(p1Id);
    const parents2 = getParents(p2Id);
    for (const p1 of parents1) {
      for (const p2 of parents2) {
        if (getEverSpouses(p1).includes(p2)) return true;
      }
    }
    return false;
  }

  // Returns a Set of all member IDs that belong to the same sibling group
  // as the given person. The group includes the person themselves, all
  // members connected via explicit 'sibling' relationships, and all
  // members who share at least one parent (via 'parent-child' edges).
  // The traversal is transitive: if A↔B are siblings and B↔C are siblings,
  // all three end up in the same group.
  function getSiblingGroup(personId) {
    const group = new Set();
    group.add(personId);
    const queue = [personId];
    while (queue.length > 0) {
      const curr = queue.shift();

      // 1. Walk explicit 'sibling' relationship edges
      relationships.forEach(r => {
        if (r.type === 'sibling') {
          let siblingId = null;
          if (r.person1Id === curr) siblingId = r.person2Id;
          else if (r.person2Id === curr) siblingId = r.person1Id;
          if (siblingId && !group.has(siblingId)) {
            group.add(siblingId);
            queue.push(siblingId);
          }
        }
      });

      // 2. Walk shared-parent edges: every child of the same parent is a sibling
      getParents(curr).forEach(parentId => {
        getChildren(parentId).forEach(childId => {
          if (!group.has(childId)) {
            group.add(childId);
            queue.push(childId);
          }
        });
      });
    }
    return group;
  }

  function isSiblingOfAncestor(personId, candidateId) {
    return getAncestors(personId).some(ancId => areSiblings(ancId, candidateId));
  }

  function isNephewNiece(personId, candidateId) {
    const siblings = members.filter(m => areSiblings(personId, m.id)).map(m => m.id);
    return siblings.some(sibId => getDescendants(sibId).includes(candidateId));
  }

  // In-laws
  function isParentOfSpouse(personId, candidateId) {
    return getEverSpouses(personId).some(spouseId => getParents(spouseId).includes(candidateId));
  }

  function isStepchild(personId, candidateId) {
    return getEverSpouses(personId).some(spouseId => {
      const isChildOfSpouse = getChildren(spouseId).includes(candidateId);
      const isOwnChild = getParents(candidateId).includes(personId);
      return isChildOfSpouse && !isOwnChild;
    });
  }

  function wasSpouseOfAncestorOrDescendant(personId, candidateId) {
    const person = members.find(m => m.id === personId);
    if (!person || person.gender !== 'male') return false;
    const relatives = [...getAncestors(personId), ...getDescendants(personId)];
    return relatives.some(relId => getEverSpouses(relId).includes(candidateId));
  }

  function isSpouseOfDescendant(personId, candidateId) {
    return getDescendants(personId).some(descId => getEverSpouses(descId).includes(candidateId));
  }

  // Simultaneous rules for men
  function isSiblingOfExistingSpouse(personId, candidateId) {
    const person = members.find(m => m.id === personId);
    if (!person || person.gender !== 'male') return false;
    return getCurrentSpouses(personId).some(spouseId => areSiblings(spouseId, candidateId));
  }

  function isAuntOrNieceOfExistingSpouse(personId, candidateId) {
    const person = members.find(m => m.id === personId);
    if (!person || person.gender !== 'male') return false;
    return getCurrentSpouses(personId).some(spouseId => 
      isSiblingOfAncestor(spouseId, candidateId) || isNephewNiece(spouseId, candidateId)
    );
  }

  function getGrandparents(personId) {
    const grandparents = new Set();
    getParents(personId).forEach(pId => {
      getParents(pId).forEach(gId => grandparents.add(gId));
    });
    return Array.from(grandparents);
  }

  function areFirstCousins(personId, candidateId) {
    if (personId === candidateId || areSiblings(personId, candidateId)) return false;
    if (getAncestors(personId).includes(candidateId) || getDescendants(personId).includes(candidateId)) return false;
    const gp1 = getGrandparents(personId);
    const gp2 = getGrandparents(candidateId);
    return gp1.some(g => gp2.includes(g));
  }

  // ─── SIBLING-RULE HELPERS ───────────────────────────────────────────────────
  // The data model uses one generic 'parent-child' edge with no mother/father
  // distinction. We treat any female parent as the "biological mother" and any
  // male parent as the "biological father" — this matches the existing kinship
  // helper conventions elsewhere in this file.
  function getMothers(personId) {
    return getParents(personId).filter(pid => {
      const p = members.find(m => m.id === pid);
      return p && p.gender === 'female';
    });
  }

  function getFathers(personId) {
    return getParents(personId).filter(pid => {
      const p = members.find(m => m.id === pid);
      return p && p.gender === 'male';
    });
  }

  function getMilkMother(personId) {
    const m = members.find(x => x.id === personId);
    if (!m) return '';
    return m.milkMotherId || '';
  }

  // Returns a small descriptor of how the two people are related as siblings
  // (or null if no shared biological/foster parent at all).
  function getSiblingRelationDescriptor(p1Id, p2Id) {
    const sharedMother = getMothers(p1Id).some(m => getMothers(p2Id).includes(m));
    const sharedFather = getFathers(p1Id).some(f => getFathers(p2Id).includes(f));
    const mm1 = getMilkMother(p1Id);
    const mm2 = getMilkMother(p2Id);
    const sharedMilkMother = mm1 && mm2 && mm1 === mm2;
    return { sharedMother, sharedFather, sharedMilkMother };
  }

  // Step-siblings: their respective parents are married to each other, but they
  // share ZERO biological parents. (Parents are coupled but the kids are not
  // blood-related — only socially.)
  function isStepSibling(p1Id, p2Id) {
    if (p1Id === p2Id) return false;
    const { sharedMother, sharedFather } = getSiblingRelationDescriptor(p1Id, p2Id);
    if (sharedMother || sharedFather) return false;

    const parents1 = getParents(p1Id);
    const parents2 = getParents(p2Id);
    for (const a of parents1) {
      for (const b of parents2) {
        if (a === b) continue; // same person, would already be a shared parent
        if (getEverSpouses(a).includes(b)) return true;
      }
    }
    return false;
  }

  // Sibling-in-law (concurrent only): one is currently a spouse of the other's
  // *real* sibling. Past marriages don't count — matches the rule that
  // simultaneous polygamy with two sisters is blocked, but a man may marry a
  // deceased/divorced wife's sister after iddah.
  function isSiblingInLawConcurrent(p1Id, p2Id) {
    const p1Siblings = members
      .filter(m => m.id !== p1Id && areSiblings(p1Id, m.id))
      .map(m => m.id);
    const p2Siblings = members
      .filter(m => m.id !== p2Id && areSiblings(p2Id, m.id))
      .map(m => m.id);

    return p1Siblings.some(sib => getCurrentSpouses(p2Id).includes(sib)) ||
           p2Siblings.some(sib => getCurrentSpouses(p1Id).includes(sib));
  }

  // Returns:
  //   { blocked: true,  reason: '...' }  for hard blocks
  //   { blocked: false, warn: 'step-sibling' }  for soft warnings
  //   { blocked: false }  otherwise
  function checkSiblingBlock(p1Id, p2Id) {
    const p1 = members.find(m => m.id === p1Id);
    const p2 = members.find(m => m.id === p2Id);
    if (!p1 || !p2) return { blocked: false };

    // 1. Self
    if (p1Id === p2Id) return { blocked: true, reason: 'Self-selection' };

    // 2. Ancestor of each other
    if (getAncestors(p1Id).includes(p2Id)) {
      return { blocked: true, reason: 'Ancestor (parent/grandparent) cannot be sibling' };
    }
    if (getAncestors(p2Id).includes(p1Id)) {
      return { blocked: true, reason: 'Ancestor (parent/grandparent) cannot be sibling' };
    }

    // 3. Descendant of each other
    if (getDescendants(p1Id).includes(p2Id)) {
      return { blocked: true, reason: 'Descendant (child/grandchild) cannot be sibling' };
    }
    if (getDescendants(p2Id).includes(p1Id)) {
      return { blocked: true, reason: 'Descendant (child/grandchild) cannot be sibling' };
    }

    // 4-6. Blood / foster siblings
    const desc = getSiblingRelationDescriptor(p1Id, p2Id);

    if (desc.sharedMother && desc.sharedFather) {
      return { blocked: true, reason: 'Full sibling (shared mother and father)' };
    }
    if (desc.sharedMother) {
      return { blocked: true, reason: 'Half-sibling — same mother' };
    }
    if (desc.sharedFather) {
      return { blocked: true, reason: 'Half-sibling — same father' };
    }
    if (desc.sharedMilkMother) {
      return { blocked: true, reason: 'Foster / milk sibling' };
    }

    // 7. Sibling-in-law (concurrent only)
    if (isSiblingInLawConcurrent(p1Id, p2Id)) {
      return { blocked: true, reason: 'Sibling of current spouse (siblings-in-law)' };
    }

    // 8. Step-sibling → soft warning, NOT a hard block
    if (isStepSibling(p1Id, p2Id)) {
      return { blocked: false, warn: 'step-sibling' };
    }

    return { blocked: false };
  }

  function checkSpouseBlock(personId, candidateId) {
    const person = members.find(m => m.id === personId);
    const candidate = members.find(m => m.id === candidateId);
    if (!person || !candidate) return { blocked: false };

    // Status checks
    if (person.id === candidate.id) return { blocked: true, reason: 'Self-selection' };
    if (person.gender === candidate.gender) return { blocked: true, reason: 'Same gender' };
    if (getCurrentSpouses(person.id).includes(candidate.id)) return { blocked: true, reason: 'Already married' };
    if (candidate.gender === 'female' && getCurrentSpouses(candidate.id).length > 0) return { blocked: true, reason: 'Candidate wife already married' };
    if (person.gender === 'male' && getCurrentSpouses(person.id).length >= 4) return { blocked: true, reason: 'Husband exceeds 4 wives limit' };

    // Blood relatives (mahram)
    if (getAncestors(person.id).includes(candidate.id)) return { blocked: true, reason: 'Ancestor (parent/grandparent)' };
    if (getDescendants(person.id).includes(candidate.id)) return { blocked: true, reason: 'Descendant (child/grandchild)' };
    if (areSiblings(person.id, candidate.id)) return { blocked: true, reason: 'Sibling (full/half/step)' };
    if (isSiblingOfAncestor(person.id, candidate.id)) return { blocked: true, reason: 'Aunt / Uncle' };
    if (isNephewNiece(person.id, candidate.id)) return { blocked: true, reason: 'Nephew / Niece' };

    // In-law relations
    if (isParentOfSpouse(person.id, candidate.id)) return { blocked: true, reason: 'Parent-in-law' };
    if (isStepchild(person.id, candidate.id)) return { blocked: true, reason: 'Stepchild' };
    if (wasSpouseOfAncestorOrDescendant(person.id, candidate.id)) return { blocked: true, reason: "Spouse's ex-wife" };
    if (isSpouseOfDescendant(person.id, candidate.id)) return { blocked: true, reason: 'Daughter-in-law' };

    // Simultaneous restrictions
    if (isSiblingOfExistingSpouse(person.id, candidate.id)) return { blocked: true, reason: 'Sibling of existing wife' };
    if (isAuntOrNieceOfExistingSpouse(person.id, candidate.id)) return { blocked: true, reason: 'Aunt/Niece of existing wife' };

    return { blocked: false };
  }

  function snapshot() {
    historyStack.push({
      members: JSON.parse(JSON.stringify(members)),
      relationships: JSON.parse(JSON.stringify(relationships))
    });
    if (historyStack.length > 30) {
      historyStack.shift();
    }
    updateUndoState();
  }

  function doUndo() {
    if (!historyStack.length) return;
    const last = historyStack.pop();
    members = last.members;
    relationships = last.relationships;
    if (selectedId && !members.some(m => m.id === selectedId)) {
      selectedId = null;
    }
    recalculateGenerations();
    saveToLocalStorage();
    updateUndoState();
    renderAll();
    showAlert('Undo applied');
  }

  function updateUndoState() {
    elBtnUndo.disabled = (historyStack.length === 0);
  }

  function showAlert(text, type = 'success') {
    if (alertTimeout) clearTimeout(alertTimeout);
    
    elAlertToastText.textContent = text;
    
    // Dot styling
    const colors = { success: '#1D9E75', warning: '#BA7517', error: '#A32D2D' };
    elAlertToastDot.style.backgroundColor = colors[type] || colors.success;
    
    elAlertToast.classList.add('visible');
    
    alertTimeout = setTimeout(() => {
      elAlertToast.classList.remove('visible');
    }, 3500);
  }

  // ─── RENDERING ──────────────────────────────────────────────────────────────
  
  function renderAll() {
    // 1. Viewport pan/zoom
    elCanvasViewport.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
    elZoomLevelIndicator.textContent = `${Math.round(zoom * 100)}%`;

    // 2. Derive visible members (search query filter)
    let visibleMembers = members;
    const query = searchQ.trim().toLowerCase();
    if (query) {
      visibleMembers = members.filter(m => m.name.toLowerCase().includes(query) || (m.bio && m.bio.toLowerCase().includes(query)));
    }

    // 3. Render connection lines
    renderConnections();

    // 4. Render nodes
    renderNodes(visibleMembers);

    // 5. Render details panel
    renderDetailsPanel();

    // 6. Update Legend items classes and ARIA states
    elFilterSpouse.className = `legend-item ${relFilters.spouse ? 'active' : ''}`;
    elFilterSpouse.setAttribute('aria-checked', relFilters.spouse ? 'true' : 'false');
    elFilterSibling.className = `legend-item ${relFilters.sibling ? 'active' : ''}`;
    elFilterSibling.setAttribute('aria-checked', relFilters.sibling ? 'true' : 'false');
    elFilterParentChild.className = `legend-item ${relFilters['parent-child'] ? 'active' : ''}`;
    elFilterParentChild.setAttribute('aria-checked', relFilters['parent-child'] ? 'true' : 'false');

    // 7. Update Admin Import Visibility
    if (userRole === 'admin') {
      elBtnImportLabel.style.display = 'flex';
    } else {
      elBtnImportLabel.style.display = 'none';
    }
  }

  function renderConnections() {
    elConnectionsSvg.innerHTML = '';
    
    relationships.forEach(r => {
      // Skip if filter is off
      if (r.type === 'spouse' && !relFilters.spouse) return;
      if (r.type === 'sibling' && !relFilters.sibling) return;
      if (r.type === 'parent-child' && !relFilters['parent-child']) return;

      const pathData = buildPath(r, members);
      if (!pathData) return;

      const rMeta = REL_TYPES[r.type];
      const isHighlighted = selectedId && (r.person1Id === selectedId || r.person2Id === selectedId);
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Background glow path for highlighted connections
      if (isHighlighted) {
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glow.setAttribute('d', pathData);
        glow.setAttribute('fill', 'none');
        glow.setAttribute('stroke', rMeta.color);
        glow.setAttribute('stroke-width', '7');
        glow.setAttribute('stroke-linecap', 'round');
        glow.setAttribute('opacity', '0.18');
        g.appendChild(glow);
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', rMeta.color);
      path.setAttribute('stroke-width', isHighlighted ? '2.5' : '1.5');
      const isPending = !r.approved;
      if (r.type === 'sibling' || isPending) {
        path.setAttribute('stroke-dasharray', '6,4');
      }
      path.setAttribute('stroke-linecap', 'round');
      
      // Calculate opacity
      let opacity = isPending ? '0.35' : '0.7';
      if (selectedId) {
        if (isHighlighted) {
          opacity = isPending ? '0.6' : '1';
        } else {
          opacity = '0.15';
        }
      }
      path.setAttribute('opacity', opacity);

      g.appendChild(path);
      elConnectionsSvg.appendChild(g);
    });
  }

  function renderNodes(visibleMembers) {
    elNodeCardsContainer.innerHTML = '';

    visibleMembers.forEach(m => {
      const isSelected = m.id === selectedId;
      
      // Check if linked to selected node
      let linkedRel = null;
      if (selectedId && !isSelected) {
        linkedRel = relationships.find(r => 
          ((r.person1Id === selectedId && r.person2Id === m.id) || (r.person2Id === selectedId && r.person1Id === m.id))
        );
      }
      
      const isFaded = selectedId && !isSelected && !linkedRel;
      const themeColors = COLORS[m.color] || COLORS[0];

      // Create card element
      const card = document.createElement('div');
      const isPending = !m.approved;
      card.className = `node-card node-color-${m.color} ${isSelected ? 'selected' : ''} ${linkedRel ? 'linked' : ''} ${isFaded ? 'faded' : ''} ${isPending ? 'pending' : ''}`;
      card.style.left = `${m.x}px`;
      card.style.top = `${m.y}px`;
      card.setAttribute('data-id', m.id);

      // 1. Relation tag
      if (linkedRel) {
        const tag = document.createElement('div');
        tag.className = 'node-relation-tag';
        tag.style.backgroundColor = REL_TYPES[linkedRel.type].color;
        tag.textContent = REL_TYPES[linkedRel.type].label + (isPending ? ' (Pending)' : '');
        card.appendChild(tag);
      } else if (isPending) {
        const tag = document.createElement('div');
        tag.className = 'node-relation-tag';
        tag.style.backgroundColor = '#BA7517'; // Amber color for pending alert badge
        tag.textContent = 'Pending Approval';
        card.appendChild(tag);
      }

      // 2. Profile Row
      const profileRow = document.createElement('div');
      profileRow.className = 'node-profile-row';

      const avatar = document.createElement('div');
      avatar.className = 'node-avatar';
      avatar.textContent = m.emoji;
      
      const name = document.createElement('div');
      name.className = 'node-name';
      name.textContent = m.name;

      profileRow.appendChild(avatar);
      profileRow.appendChild(name);
      card.appendChild(profileRow);

      // 3. Footer row
      const footer = document.createElement('div');
      footer.className = 'node-footer';

      const dates = document.createElement('span');
      dates.className = 'node-dates';
      const bY = m.birthDate ? m.birthDate.slice(0, 4) : '';
      const dY = m.deathDate ? m.deathDate.slice(0, 4) : '';
      let dateText = '';
      if (bY && dY) {
        dateText = `${bY} – ${dY}`;
      } else if (bY) {
        dateText = `${bY} – present`;
      } else if (dY) {
        dateText = `? – ${dY}`;
      } else {
        dateText = '—';
      }
      dates.textContent = dateText;

      const genBadge = document.createElement('span');
      genBadge.className = 'node-generation-badge';
      genBadge.textContent = GEN_LABELS[m.generation] || `Gen ${m.generation + 1}`;

      footer.appendChild(dates);
      footer.appendChild(genBadge);
      card.appendChild(footer);

      // Card Events
      card.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return; // Ignore button clicks
        e.stopPropagation();
        
        // Only drag with left click or touch
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        
        draggedNodeId = m.id;
        hasDragged = false;

        const rect = elCanvasWrapper.getBoundingClientRect();
        const pointerX = (e.clientX - rect.left - pan.x) / zoom;
        const pointerY = (e.clientY - rect.top - pan.y) / zoom;
        nodeDragOffset = { x: pointerX - m.x, y: pointerY - m.y };
      });

      card.addEventListener('click', (e) => {
        // Prevent trigger if they dragged the node
        if (hasDragged) return;
        e.stopPropagation();
        
        if (selectedId === m.id) {
          selectedId = null;
        } else {
          selectedId = m.id;
        }
        renderAll();
      });

      elNodeCardsContainer.appendChild(card);
    });
  }

  function renderDetailsPanel() {
    elDetailPanel.innerHTML = '';

    const member = members.find(m => m.id === selectedId);
    if (!member) {
      elDetailPanel.innerHTML = `
        <div class="empty-detail-state">
          <div class="empty-detail-avatar" aria-hidden="true">👨‍👩‍👧‍👦</div>
          <p class="brand-text" style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary);">No member selected</p>
          <p class="brand-subtext" style="font-size: 12px; line-height: 1.5;">Click any card on the canvas to view details and connections.</p>
        </div>
      `;
      return;
    }

    const c = COLORS[member.color] || COLORS[0];
    const activeConnections = relationships.filter(r => r.person1Id === selectedId || r.person2Id === selectedId);

    // Build the detail layout
    const detailCard = document.createElement('div');
    detailCard.className = 'detail-card';

    // Header Row
    const header = document.createElement('div');
    header.className = 'detail-card-header';

    const profile = document.createElement('div');
    profile.className = 'detail-profile-info';

    const avatar = document.createElement('div');
    avatar.className = 'detail-avatar';
    avatar.style.backgroundColor = c.bg;
    avatar.style.color = '#fff';
    avatar.textContent = member.emoji;

    const namesCol = document.createElement('div');
    namesCol.style.minWidth = '0';
    
    const name = document.createElement('div');
    name.className = 'detail-name';
    name.textContent = member.name;
    name.title = member.name;

    const meta = document.createElement('div');
    meta.className = 'detail-meta';
    const genName = GEN_LABELS[member.generation] || `Gen ${member.generation + 1}`;
    const genGender = member.gender.charAt(0).toUpperCase() + member.gender.slice(1);
    meta.textContent = `${genGender} · ${genName}`;

    namesCol.appendChild(name);
    namesCol.appendChild(meta);
    profile.appendChild(avatar);
    profile.appendChild(namesCol);

    const actionBox = document.createElement('div');
    actionBox.className = 'detail-action-buttons';

    const canModify = canModifyMember(member);

    if (canModify) {
      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn-detail-action';
      btnEdit.innerHTML = '✏️';
      btnEdit.title = 'Edit member details';
      btnEdit.addEventListener('click', () => {
        openMemberModalForEdit(member);
      });
      actionBox.appendChild(btnEdit);

      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn-detail-action';
      btnDelete.innerHTML = '🗑';
      btnDelete.title = 'Remove member';
      btnDelete.addEventListener('click', () => {
        if (confirm(`Are you sure you want to remove ${member.name}? All relationship links involving them will be deleted.`)) {
          deleteMember(member.id);
        }
      });
      actionBox.appendChild(btnDelete);
    }
    
    // Close selection button (always available)
    const btnClose = document.createElement('button');
    btnClose.className = 'btn-detail-action';
    btnClose.innerHTML = '✕';
    btnClose.title = 'Clear selection';
    btnClose.addEventListener('click', () => {
      selectedId = null;
      renderAll();
    });
    actionBox.appendChild(btnClose);
    
    header.appendChild(profile);
    header.appendChild(actionBox);
    detailCard.appendChild(header);

    // Admin Moderation panel
    if (!member.approved) {
      const modPanel = document.createElement('div');
      modPanel.style.display = 'flex';
      modPanel.style.alignItems = 'center';
      modPanel.style.justifyContent = 'space-between';
      modPanel.style.background = 'var(--color-background-secondary)';
      modPanel.style.padding = '8px 10px';
      modPanel.style.borderRadius = 'var(--radius-sm)';
      modPanel.style.border = '0.5px dashed var(--color-border-secondary)';
      modPanel.style.marginTop = '8px';
      
      if (userRole === 'admin') {
        modPanel.innerHTML = `
          <span class="moderation-status-badge" style="background-color: var(--color-brand-light); color: var(--color-brand); border: none;">Pending review</span>
          <div style="display: flex; gap: 6px;">
            <button id="btnModApprove" class="btn-moderation-approve">✓ Approve</button>
            <button id="btnModReject" class="btn-moderation-reject">✕ Reject</button>
          </div>
        `;
        detailCard.appendChild(modPanel);
        
        // Bind listeners after DOM updates
        setTimeout(() => {
          const btnApp = document.getElementById('btnModApprove');
          const btnRej = document.getElementById('btnModReject');
          if (btnApp) btnApp.addEventListener('click', () => approveMember(member.id));
          if (btnRej) btnRej.addEventListener('click', () => {
            if (confirm(`Reject and delete ${member.name}?`)) rejectMember(member.id);
          });
        }, 0);
      } else {
        modPanel.innerHTML = `
          <span class="moderation-status-badge">Pending Admin Approval</span>
          <span style="font-size: 10px; color: var(--color-text-tertiary);">Temporary entry</span>
        `;
        detailCard.appendChild(modPanel);
      }
    }

    // Dates Grid
    const datesGrid = document.createElement('div');
    datesGrid.className = 'detail-dates-grid';

    const bornBox = document.createElement('div');
    bornBox.className = 'date-box';
    bornBox.innerHTML = `
      <div class="date-label">Born</div>
      <div class="date-value">${member.birthDate || 'Unknown'}</div>
    `;

    const deceasedBox = document.createElement('div');
    deceasedBox.className = 'date-box';
    const isLiving = !member.deathDate;
    deceasedBox.innerHTML = `
      <div class="date-label">Deceased</div>
      <div class="date-value ${isLiving ? 'living' : ''}">${member.deathDate || 'Living'}</div>
    `;

    datesGrid.appendChild(bornBox);
    datesGrid.appendChild(deceasedBox);
    detailCard.appendChild(datesGrid);

    // Biography
    if (member.bio) {
      const bioBox = document.createElement('div');
      bioBox.className = 'detail-section-box';
      bioBox.innerHTML = `
        <div class="section-box-title">Biography</div>
        <div class="section-box-content">${member.bio}</div>
      `;
      detailCard.appendChild(bioBox);
    }

    // Connections List
    const connectionsBox = document.createElement('div');
    connectionsBox.className = 'connections-box';

    const connHeader = document.createElement('div');
    connHeader.className = 'connections-header-row';
    connHeader.innerHTML = `
      <span class="connections-title">Links (${activeConnections.length})</span>
      <button class="btn-add-connection" id="btnDetailAddLink">+ Add link</button>
    `;
    connectionsBox.appendChild(connHeader);

    if (activeConnections.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-connections-placeholder';
      placeholder.textContent = 'No connections yet';
      connectionsBox.appendChild(placeholder);
    } else {
      const connList = document.createElement('div');
      connList.className = 'connections-list';

      activeConnections.forEach(r => {
        const otherId = r.person1Id === selectedId ? r.person2Id : r.person1Id;
        const other = members.find(m => m.id === otherId);
        if (!other) return;

        const rMeta = REL_TYPES[r.type];
        const connItem = document.createElement('div');
        connItem.className = 'connection-item';

        const itemLeft = document.createElement('div');
        itemLeft.className = 'connection-item-left';
        itemLeft.innerHTML = `
          <span class="connection-color-dot" style="background-color: ${rMeta.color};"></span>
          <div class="connection-info-wrapper">
            <div class="connection-name">${other.name}</div>
            <div class="connection-type-lbl">${rMeta.label}</div>
          </div>
        `;
        itemLeft.addEventListener('click', () => {
          selectedId = otherId;
          renderAll();
        });

        connItem.appendChild(itemLeft);

        const isRelPending = !r.approved;
        const canRemoveConn = canModifyRelation(r);

        if (isRelPending && userRole === 'admin') {
          // Admin sees moderation check/cross buttons next to it
          const btnApprove = document.createElement('button');
          btnApprove.className = 'btn-remove-connection';
          btnApprove.innerHTML = '✓';
          btnApprove.title = 'Approve connection link';
          btnApprove.style.color = '#1D9E75';
          btnApprove.style.fontWeight = '700';
          btnApprove.addEventListener('click', (e) => {
            e.stopPropagation();
            approveRelation(r.id);
          });
          
          const btnReject = document.createElement('button');
          btnReject.className = 'btn-remove-connection';
          btnReject.innerHTML = '✕';
          btnReject.title = 'Reject connection link';
          btnReject.style.color = '#A32D2D';
          btnReject.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Reject and delete this connection link?')) {
              rejectRelation(r.id);
            }
          });
          
          const modGrp = document.createElement('div');
          modGrp.style.display = 'flex';
          modGrp.style.gap = '2px';
          modGrp.appendChild(btnApprove);
          modGrp.appendChild(btnReject);
          connItem.appendChild(modGrp);
        } else if (canRemoveConn) {
          const btnRemove = document.createElement('button');
          btnRemove.className = 'btn-remove-connection';
          btnRemove.innerHTML = '✕';
          btnRemove.title = 'Remove this connection link';
          btnRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRelation(r.id);
          });
          connItem.appendChild(btnRemove);
        } else if (isRelPending) {
          const labelPending = document.createElement('span');
          labelPending.style.fontSize = '9px';
          labelPending.style.color = 'var(--color-text-tertiary)';
          labelPending.style.fontStyle = 'italic';
          labelPending.textContent = 'pending';
          connItem.appendChild(labelPending);
        }
        
        connList.appendChild(connItem);
      });

      connectionsBox.appendChild(connList);
    }

    detailCard.appendChild(connectionsBox);
    elDetailPanel.appendChild(detailCard);

    // Event listener for the dynamically added Add Link button
    document.getElementById('btnDetailAddLink').addEventListener('click', () => {
      openRelationModal(selectedId);
    });
  }

  // ─── CRUD ACTIONS ───────────────────────────────────────────────────────────
  
  function addMember(data) {
    snapshot();
    // Generation is auto-derived from the relationship graph by
    // recalculateGenerations() below. The caller-supplied value (if any)
    // is intentionally ignored — see getSuggestedGeneration() for the
    // initial spawn row.
    const gen = getSuggestedGeneration();
    const newId = `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isApproved = (userRole === 'admin');
    const newMember = {
      ...data,
      id: newId,
      x: 300 + Math.random() * 300,
      y: 120 + gen * 185 + Math.random() * 50,
      generation: gen,
      approved: isApproved,
      addedBy: userRole
    };
    members.push(newMember);
    selectedId = newId;
    recalculateGenerations();
    // After recalculation, re-sync y with the (possibly promoted) generation
    // so the new card sits on the right row even if a parent-child link
    // already exists for it.
    const finalGen = (typeof newMember.generation === 'number') ? newMember.generation : gen;
    newMember.y = 120 + finalGen * 185 + Math.random() * 50;
    saveToLocalStorage();
    renderAll();
    showAlert(`${newMember.name} added`);
  }

  function saveMember(id, data) {
    const member = members.find(m => m.id === id);
    if (!member || !canModifyMember(member)) {
      showAlert('You do not have permission to modify this member', 'error');
      return;
    }
    snapshot();
    const idx = members.findIndex(m => m.id === id);
    if (idx !== -1) {
      members[idx] = { ...members[idx], ...data };
      recalculateGenerations();
      saveToLocalStorage();
      renderAll();
      showAlert('Member updated');
    }
  }

  function deleteMember(id) {
    const member = members.find(m => m.id === id);
    if (!member || !canModifyMember(member)) {
      showAlert('You do not have permission to remove this member', 'error');
      return;
    }
    snapshot();
    members = members.filter(m => m.id !== id);
    relationships = relationships.filter(r => r.person1Id !== id && r.person2Id !== id);
    if (selectedId === id) {
      selectedId = null;
    }
    recalculateGenerations();
    saveToLocalStorage();
    renderAll();
    showAlert(`${member ? member.name : 'Member'} removed`, 'warning');
  }

  function saveRelation(p1, p2, type) {
    // Check if duplicate exists
    const duplicate = relationships.some(r => 
      ((r.person1Id === p1 && r.person2Id === p2) || (r.person1Id === p2 && r.person2Id === p1)) && r.type === type
    );
    
    if (duplicate) {
      showAlert('This link already exists', 'error');
      return;
    }

    snapshot();
    const isApproved = (userRole === 'admin');
    const newRel = {
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      person1Id: p1,
      person2Id: p2,
      type: type,
      approved: isApproved,
      addedBy: userRole
    };
    relationships.push(newRel);
    recalculateGenerations();
    saveToLocalStorage();
    renderAll();
    showAlert('Link created');
  }

  function deleteRelation(id) {
    const rel = relationships.find(r => r.id === id);
    if (!rel || !canModifyRelation(rel)) {
      showAlert('You do not have permission to remove this link', 'error');
      return;
    }
    snapshot();
    relationships = relationships.filter(r => r.id !== id);
    recalculateGenerations();
    saveToLocalStorage();
    renderAll();
    showAlert('Link removed', 'warning');
  }

  // Moderation Methods
  function approveMember(id) {
    snapshot();
    const m = members.find(x => x.id === id);
    if (m) {
      m.approved = true;
      saveToLocalStorage();
      renderAll();
      showAlert(`${m.name} approved`);
    }
  }

  function rejectMember(id) {
    deleteMember(id);
  }

  function approveRelation(id) {
    snapshot();
    const r = relationships.find(x => x.id === id);
    if (r) {
      r.approved = true;
      saveToLocalStorage();
      renderAll();
      showAlert('Link approved');
    }
  }

  function rejectRelation(id) {
    deleteRelation(id);
  }

  function handleAutoLayout() {
    if (members.length === 0) return;
    snapshot();

    // Group members by generation
    const gens = {};
    members.forEach(m => {
      const g = m.generation || 0;
      if (!gens[g]) gens[g] = [];
      gens[g].push(m);
    });

    // Rearrange positions
    members.forEach(m => {
      const g = m.generation || 0;
      const list = gens[g];
      const idx = list.findIndex(x => x.id === m.id);
      const spacing = 1100 / (list.length + 1);
      
      m.x = Math.round(spacing * (idx + 1));
      m.y = 100 + g * 190;
    });

    saveToLocalStorage();
    renderAll();
    showAlert('Tree aligned');
  }

  function handleExport() {
    // Trigger two CSV downloads in sequence (members + relationships)
    function triggerDownload(filename, content) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    triggerDownload('family-tree-members.csv', membersToCsv(members));
    setTimeout(() => {
      triggerDownload('family-tree-relationships.csv', relationshipsToCsv(relationships));
    }, 250);
    showAlert('Tree exported');
  }

  function getDistance(p1, p2) {
    return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
  }

  // ─── EVENT LISTENERS ────────────────────────────────────────────────────────
  function setupEventListeners() {
    // 1. Auto align
    elBtnAlign.addEventListener('click', handleAutoLayout);

    // 2. Search
    elSearchInput.addEventListener('input', (e) => {
      searchQ = e.target.value;
      if (searchQ.trim()) {
        elSearchClear.classList.add('visible');
      } else {
        elSearchClear.classList.remove('visible');
      }
      renderAll();
    });

    elSearchClear.addEventListener('click', () => {
      elSearchInput.value = '';
      searchQ = '';
      elSearchClear.classList.remove('visible');
      renderAll();
    });

    // 3. Legend filters
    elFilterSpouse.addEventListener('click', () => {
      relFilters.spouse = !relFilters.spouse;
      renderAll();
    });
    elFilterSibling.addEventListener('click', () => {
      relFilters.sibling = !relFilters.sibling;
      renderAll();
    });
    elFilterParentChild.addEventListener('click', () => {
      relFilters['parent-child'] = !relFilters['parent-child'];
      renderAll();
    });

    // Keyboard support for accessibility
    [elFilterSpouse, elFilterSibling, elFilterParentChild].forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          el.click();
        }
      });
    });

    // 3.5 Theme Toggle
    if (elBtnThemeToggle) {
      elBtnThemeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = 'light';
        
        if (currentTheme === 'light') {
          newTheme = 'dark';
        } else if (currentTheme === 'dark') {
          newTheme = 'light';
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          newTheme = prefersDark ? 'light' : 'dark';
        }
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update the meta color-scheme tag so native browser UI updates immediately
        const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaColorScheme) {
          metaColorScheme.setAttribute('content', newTheme);
        }
        
        localStorage.setItem('theme', newTheme);
        renderAll();
        showAlert(`Theme changed to ${newTheme} mode`);
      });
    }

    // 4. Sidebar footer actions
    elBtnOpenAddMember.addEventListener('click', () => {
      // Toggle quick add panel
      elQuickAddPanel.classList.toggle('open');
      if (elQuickAddPanel.classList.contains('open')) {
        elQuickAddName.value = '';
        elQuickAddBirthY.value = '';
        quickAddEmoji = '👤';
        quickAddColor = 0;

        renderEmojiPicker(elQuickAddEmojiGrid, quickAddEmoji, (em) => { quickAddEmoji = em; });
        renderColorPicker(elQuickAddColorGrid, quickAddColor, (idx) => { quickAddColor = idx; });

        // Generation is auto-derived from the relationship graph; show the
        // current suggestion in the disabled select as a read-only indicator.
        renderAutoGenSelect(elQuickAddGen, getSuggestedGeneration());

        elQuickAddName.focus();
      }
    });

    elBtnOpenAddLink.addEventListener('click', () => {
      openRelationModal(selectedId);
    });

    // 5. Canvas pointer controls (Dragging, panning & pinch-to-zoom)
    elCanvasWrapper.addEventListener('pointerdown', (e) => {
      // Ignore click if it's on a card or panel overlay controls
      if (
        e.target.closest('.node-card') || 
        e.target.closest('[data-panel]') || 
        e.target.closest('#quickAddPanel') || 
        e.target.closest('.btn-toggle-sidebar') ||
        e.target.closest('.canvas-controls-top') ||
        e.target.closest('.zoom-controls') ||
        e.target.closest('.canvas-badge')
      ) return;
      
      // Prevent capturing non-left clicks for mouse
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      // Add to tracked pointers list
      activePointers.push({
        pointerId: e.pointerId,
        clientX: e.clientX,
        clientY: e.clientY
      });
      
      if (activePointers.length === 1) {
        isDraggingCanvas = true;
        canvasDragStart = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        elCanvasWrapper.style.cursor = 'grabbing';
        try { elCanvasWrapper.setPointerCapture(e.pointerId); } catch(err) {}
      } else if (activePointers.length === 2) {
        // Switch to pinch-to-zoom
        isDraggingCanvas = false;
        initialTouchDistance = getDistance(activePointers[0], activePointers[1]);
        initialZoom = zoom;
        
        // Find screen midpoint of fingers
        const midX = (activePointers[0].clientX + activePointers[1].clientX) / 2;
        const midY = (activePointers[0].clientY + activePointers[1].clientY) / 2;
        const rect = elCanvasWrapper.getBoundingClientRect();
        initialCenter = {
          x: midX - rect.left,
          y: midY - rect.top
        };
      }
    });

    window.addEventListener('pointermove', (e) => {
      // Update pointer position in activePointers
      const idx = activePointers.findIndex(p => p.pointerId === e.pointerId);
      if (idx !== -1) {
        activePointers[idx].clientX = e.clientX;
        activePointers[idx].clientY = e.clientY;
      }
      
      if (isDraggingCanvas && activePointers.length === 1) {
        pan.x = e.clientX - canvasDragStart.x;
        pan.y = e.clientY - canvasDragStart.y;
        renderAll();
      } else if (draggedNodeId) {
        const rect = elCanvasWrapper.getBoundingClientRect();
        const pointerX = (e.clientX - rect.left - pan.x) / zoom;
        const pointerY = (e.clientY - rect.top - pan.y) / zoom;
        
        const m = members.find(x => x.id === draggedNodeId);
        if (m) {
          if (!hasDragged) {
            snapshot();
            hasDragged = true;
          }
          m.x = Math.round(pointerX - nodeDragOffset.x);
          m.y = Math.round(pointerY - nodeDragOffset.y);
          renderAll();
        }
      } else if (activePointers.length === 2) {
        const currentDist = getDistance(activePointers[0], activePointers[1]);
        if (initialTouchDistance > 0 && currentDist > 0) {
          const ratio = currentDist / initialTouchDistance;
          const newZoom = Math.max(0.3, Math.min(2.5, initialZoom * ratio));
          
          // Calculate Zoom around initialCenter
          const canvasX = (initialCenter.x - pan.x) / zoom;
          const canvasY = (initialCenter.y - pan.y) / zoom;
          
          zoom = newZoom;
          pan.x = initialCenter.x - canvasX * zoom;
          pan.y = initialCenter.y - canvasY * zoom;
          
          renderAll();
        }
      }
    });

    const handlePointerUp = (e) => {
      activePointers = activePointers.filter(p => p.pointerId !== e.pointerId);
      
      if (isDraggingCanvas && activePointers.length === 0) {
        isDraggingCanvas = false;
        elCanvasWrapper.style.cursor = 'grab';
        try { elCanvasWrapper.releasePointerCapture(e.pointerId); } catch(err) {}
      }
      
      if (draggedNodeId) {
        draggedNodeId = null;
        saveToLocalStorage();
      }
      
      if (activePointers.length < 2) {
        initialTouchDistance = 0;
      }
      
      // If we still have 1 finger, transition back to panning
      if (activePointers.length === 1 && !draggedNodeId) {
        isDraggingCanvas = true;
        canvasDragStart = { x: activePointers[0].clientX - pan.x, y: activePointers[0].clientY - pan.y };
      }
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // Canvas click outside node clears selection
    elCanvasWrapper.addEventListener('click', (e) => {
      if (
        e.target.closest('.node-card') || 
        e.target.closest('[data-panel]') || 
        e.target.closest('#quickAddPanel') || 
        e.target.closest('.btn-toggle-sidebar') ||
        e.target.closest('.canvas-controls-top') ||
        e.target.closest('.zoom-controls')
      ) return;
      if (selectedId !== null) {
        selectedId = null;
        renderAll();
      }
    });

    // 6. Canvas Scroll Zoom (Cursor-centered zoom)
    elCanvasWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = elCanvasWrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const canvasX = (mouseX - pan.x) / zoom;
      const canvasY = (mouseY - pan.y) / zoom;
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.3, Math.min(2.5, zoom + delta));
      
      pan.x = mouseX - canvasX * newZoom;
      pan.y = mouseY - canvasY * newZoom;
      zoom = newZoom;
      
      renderAll();
    }, { passive: false });

    // 7. Zoom Controls
    elBtnZoomIn.addEventListener('click', () => {
      zoom = Math.min(2.5, zoom + 0.15);
      renderAll();
    });
    elBtnZoomOut.addEventListener('click', () => {
      zoom = Math.max(0.3, zoom - 0.15);
      renderAll();
    });
    elBtnZoomFit.addEventListener('click', () => {
      zoom = 1;
      pan = { x: 80, y: 60 };
      renderAll();
    });

    // Sidebar toggle for mobile responsive layouts
    if (elBtnToggleSidebar && elSidebarBackdrop && elSidebar) {
      elBtnToggleSidebar.addEventListener('click', () => {
        elSidebar.classList.toggle('mobile-open');
        elSidebarBackdrop.classList.toggle('visible');
      });
      elSidebarBackdrop.addEventListener('click', () => {
        elSidebar.classList.remove('mobile-open');
        elSidebarBackdrop.classList.remove('visible');
      });
    }

    // 8. Undo, Export, Import
    elBtnUndo.addEventListener('click', doUndo);
    elBtnExport.addEventListener('click', handleExport);
    
    elFileImportInput.addEventListener('change', (e) => {
      if (userRole !== 'admin') {
        showAlert('Only admins can import data', 'error');
        e.target.value = '';
        return;
      }
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Filter to .csv files
      const csvFiles = files.filter(f => /\.csv$/i.test(f.name));
      if (csvFiles.length === 0) {
        showAlert('Please select .csv files', 'error');
        e.target.value = '';
        return;
      }

      let pending = csvFiles.length;
      let importedMembers = null;
      let importedRels = null;
      let hadError = false;

      function tryFinish() {
        if (hadError) return;
        if (pending > 0) return;
        if (importedMembers === null && importedRels === null) {
          showAlert('No valid CSV files found', 'error');
          e.target.value = '';
          return;
        }
        snapshot();
        if (importedMembers) {
          members = importedMembers.map(m => Object.assign({ approved: true, addedBy: 'admin' }, m));
        }
        if (importedRels) {
          relationships = importedRels.map(r => Object.assign({ approved: true, addedBy: 'admin' }, r));
        }
        selectedId = null;
        recalculateGenerations();
        saveToLocalStorage();
        renderAll();
        showAlert('Tree imported');
        e.target.value = '';
      }

      csvFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const text = ev.target.result;
            const lower = file.name.toLowerCase();
            if (lower.includes('member')) {
              importedMembers = csvToMembers(text);
            } else if (lower.includes('relationship') || lower.includes('rel')) {
              importedRels = csvToRelationships(text);
            } else {
              // Fall back to header detection
              const firstLine = text.split(/\r?\n/, 1)[0] || '';
              if (firstLine.indexOf('person1Id') !== -1) {
                importedRels = csvToRelationships(text);
              } else {
                importedMembers = csvToMembers(text);
              }
            }
          } catch (err) {
            hadError = true;
            showAlert(`Failed to parse ${file.name}`, 'error');
            e.target.value = '';
            return;
          }
          pending--;
          tryFinish();
        };
        reader.onerror = () => {
          hadError = true;
          showAlert(`Failed to read ${file.name}`, 'error');
          e.target.value = '';
        };
        reader.readAsText(file);
      });
    });

    // 9. Quick Add Panel Close & Save
    elBtnQuickAddClose.addEventListener('click', () => {
      elQuickAddPanel.classList.remove('open');
    });

    elBtnQuickAddSave.addEventListener('click', () => {
      const nameVal = elQuickAddName.value.trim();
      if (!nameVal) {
        elQuickAddName.focus();
        return;
      }

      const birthYVal = elQuickAddBirthY.value;
      // The generation field is read-only and auto-derived from the graph
      // by addMember(); we pass the suggestion just for the initial spawn
      // y-coordinate. recalculateGenerations() will overwrite the actual
      // generation once parent-child links exist.
      addMember({
        name: nameVal,
        emoji: quickAddEmoji,
        color: quickAddColor,
        gender: elQuickAddGender.value,
        birthDate: birthYVal ? `${birthYVal}-01-01` : '',
        deathDate: '',
        bio: ''
      });

      elQuickAddPanel.classList.remove('open');
    });

    // Quick Add ENTER key support
    elQuickAddName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') elBtnQuickAddSave.click();
    });
    elQuickAddBirthY.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') elBtnQuickAddSave.click();
    });

    elBtnQuickAddMore.addEventListener('click', () => {
      const nameVal = elQuickAddName.value.trim();
      elQuickAddPanel.classList.remove('open');

      // Open the full dialog. Generation is auto-calculated inside
      // openMemberModalForAdd(), so we don't pass it here.
      openMemberModalForAdd({
        name: nameVal,
        emoji: quickAddEmoji,
        color: quickAddColor,
        gender: elQuickAddGender.value,
        birthDate: elQuickAddBirthY.value ? `${elQuickAddBirthY.value}-01-01` : '',
        deathDate: '',
        bio: ''
      });
    });

    // 10. Native dialog actions
    // Member Dialog Close button
    elBtnMemberDialogClose.addEventListener('click', () => elMemberDialog.close());
    elBtnMemberDialogCancel.addEventListener('click', () => elMemberDialog.close());
    
    // Relation Dialog Close button
    elBtnRelationDialogClose.addEventListener('click', () => elRelationDialog.close());
    elBtnRelationDialogCancel.addEventListener('click', () => elRelationDialog.close());

    // Member Dialog Save
    elBtnMemberDialogSave.addEventListener('click', () => {
      const nameVal = elMemberDialogName.value.trim();
      if (!nameVal) {
        elMemberDialogName.focus();
        return;
      }

      // The generation field is read-only and auto-derived from the graph
      // (see renderAutoGenSelect and recalculateGenerations). For new
      // members, addMember() recomputes it. For edits, saveMember() also
      // calls recalculateGenerations() afterwards, so any value we pass
      // here is ignored.
      const data = {
        name: nameVal,
        emoji: memberDialogEmoji,
        color: memberDialogColor,
        birthDate: elMemberDialogBirthDate.value,
        deathDate: elMemberDialogDeathDate.value,
        gender: elMemberDialogGender.value,
        bio: elMemberDialogBio.value.trim(),
        milkMotherId: elMemberDialogMilkMother ? elMemberDialogMilkMother.value : ''
      };

      if (editingMemberId) {
        saveMember(editingMemberId, data);
      } else {
        addMember(data);
      }

      elMemberDialog.close();
    });

    // When the P1 (Child / First member) changes, we need to refresh
    // both the sibling-mode P2 list AND the father/mother dropdowns in
    // parent-child mode.
    elRelationDialogP1.addEventListener('change', () => {
      if (relationDialogType === 'parent-child') {
        updateRelationDialogFather();
        updateRelationDialogMother();
      } else {
        updateRelationDialogP2();
      }
    });
    elRelationDialogP2.addEventListener('change', updateRelationDialogSiblingHint);
    elRelationDialogFather.addEventListener('change', () => {
      // Re-render mother dropdown so the selected father is excluded
      updateRelationDialogMother();
    });
    elRelationDialogMother.addEventListener('change', () => {
      // Re-render father dropdown so the selected mother is excluded
      updateRelationDialogFather();
    });

    // Relation Dialog Radio Select
    const radioOptions = [
      { el: elRelOptionSpouse, val: 'spouse' },
      { el: elRelOptionSibling, val: 'sibling' },
      { el: elRelOptionParentChild, val: 'parent-child' },
    ];
    
    radioOptions.forEach(opt => {
      opt.el.addEventListener('click', () => {
        radioOptions.forEach(x => {
          x.el.classList.remove('active');
          x.el.setAttribute('aria-checked', 'false');
        });
        opt.el.classList.add('active');
        opt.el.setAttribute('aria-checked', 'true');
        
        relationDialogType = opt.val;
        
        const radio = opt.el.querySelector('.rel-option-radio');
        if (radio) radio.checked = true;

        applyRelationDialogTypeLayout();
      });

      // Accessibility keybindings
      opt.el.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          opt.el.click();
        }
      });
    });

    // ─── RELATION DIALOG SAVE ──────────────────────────────────────────────────
    // The three relation types take very different inputs:
    //   • spouse       → two free members
    //   • sibling      → two free members; on save we auto-link the entire
    //                    sibling group of P2 to P1 AND auto-inherit P2's parents
    //                    onto P1 (per the user's "join the family" workflow)
    //   • parent-child → child (P1) + optional father + optional mother; we
    //                    create 1 or 2 parent-child edges in a single save
    elBtnRelationDialogSave.addEventListener('click', () => {
      if (relationDialogType === 'parent-child') {
        handleParentChildSave();
      } else if (relationDialogType === 'sibling') {
        handleSiblingSave();
      } else {
        handleSpouseSave();
      }
    });

    function handleSpouseSave() {
      const p1 = elRelationDialogP1.value;
      const p2 = elRelationDialogP2.value;

      if (!p1 || !p2) {
        showAlert('Please select both members', 'error');
        return;
      }
      if (p1 === p2) {
        showAlert('Cannot connect a member to themselves', 'error');
        return;
      }
      const check = checkSpouseBlock(p1, p2);
      if (check.blocked) {
        showAlert(`Cannot link: ${check.reason}`, 'error');
        return;
      }
      saveRelation(p1, p2, 'spouse');
      elRelationDialog.close();
    }

    function handleParentChildSave() {
      const childId = elRelationDialogP1.value;
      const fatherId = elRelationDialogFather.value;
      const motherId = elRelationDialogMother.value;

      if (!childId) {
        showAlert('Please select a child', 'error');
        return;
      }
      if (!fatherId && !motherId) {
        showAlert('Please select at least a Father or a Mother', 'error');
        return;
      }
      if (fatherId && motherId && fatherId === motherId) {
        showAlert('Father and Mother cannot be the same person', 'error');
        return;
      }
      // Defensive gender check (the dropdowns already filter by gender, but
      // belt-and-braces in case data was edited manually or imported).
      if (fatherId) {
        const f = members.find(m => m.id === fatherId);
        if (f && f.gender !== 'male') {
          showAlert('Father must be a male member', 'error');
          return;
        }
      }
      if (motherId) {
        const mo = members.find(m => m.id === motherId);
        if (mo && mo.gender !== 'female') {
          showAlert('Mother must be a female member', 'error');
          return;
        }
      }
      // Defensive: don't allow linking a child to themselves (shouldn't be
      // possible given the dropdowns filter out the child, but be safe).
      if ((fatherId && fatherId === childId) || (motherId && motherId === childId)) {
        showAlert('A person cannot be their own parent', 'error');
        return;
      }

      snapshot();
      const isApproved = (userRole === 'admin');
      let created = 0;

      if (fatherId && !getParents(childId).includes(fatherId)) {
        relationships.push({
          id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          person1Id: fatherId,
          person2Id: childId,
          type: 'parent-child',
          approved: isApproved,
          addedBy: userRole
        });
        created++;
      }
      if (motherId && !getParents(childId).includes(motherId)) {
        relationships.push({
          id: `r-${Date.now() + 1}-${Math.floor(Math.random() * 1000)}`,
          person1Id: motherId,
          person2Id: childId,
          type: 'parent-child',
          approved: isApproved,
          addedBy: userRole
        });
        created++;
      }

      if (created === 0) {
        // Both already exist as parents — roll back the snapshot we just took
        // so the undo stack doesn't show a no-op.
        historyStack.pop();
        updateUndoState();
        showAlert('Both parents are already linked to this child', 'warning');
        return;
      }

      recalculateGenerations();
      saveToLocalStorage();
      renderAll();
      const childName = (members.find(m => m.id === childId) || {}).name || '?';
      showAlert(`${childName} now has ${created} new parent link${created === 1 ? '' : 's'}`);
      elRelationDialog.close();
    }

    function handleSiblingSave() {
      const p1 = elRelationDialogP1.value;
      const p2 = elRelationDialogP2.value;

      if (!p1 || !p2) {
        showAlert('Please select both members', 'error');
        return;
      }
      if (p1 === p2) {
        showAlert('Cannot connect a member to themselves', 'error');
        return;
      }

      // Hard-block check against the anchor (P2). If the anchor itself can't
      // be linked, the whole auto-group is impossible.
      const anchorCheck = checkSiblingBlock(p1, p2);
      if (anchorCheck.blocked) {
        showAlert(`Cannot link as siblings: ${anchorCheck.reason}`, 'error');
        return;
      }
      if (anchorCheck.warn === 'step-sibling') {
        const p1Name = (members.find(m => m.id === p1) || {}).name || '?';
        const p2Name = (members.find(m => m.id === p2) || {}).name || '?';
        const proceed = confirm(
          `${p1Name} and ${p2Name} appear to be step-siblings — their parents are married but they share no biological parents. ` +
          `In Islamic law this marriage is technically permissible, but many scholars advise against it.\n\n` +
          `Connect them as siblings anyway?`
        );
        if (!proceed) return;
      }

      // Discover the entire sibling group of P2 and (optionally) extend it to
      // P1. We do a single snapshot so the whole "join the family" action is
      // one undo step.
      snapshot();
      const isApproved = (userRole === 'admin');
      const group = getSiblingGroup(p2);
      const p1Parents = new Set(getParents(p1));

      let siblingLinksCreated = 0;
      let parentLinksInherited = 0;
      const skipped = [];

      // 1) Create sibling edges between P1 and every other member of P2's group.
      group.forEach(otherId => {
        if (otherId === p1) return; // would be self-link
        const check = checkSiblingBlock(p1, otherId);
        if (check.blocked) {
          skipped.push({ otherId, reason: check.reason });
          return;
        }
        const isDuplicate = relationships.some(r =>
          r.type === 'sibling' &&
          ((r.person1Id === p1 && r.person2Id === otherId) ||
           (r.person1Id === otherId && r.person2Id === p1))
        );
        if (isDuplicate) return;
        relationships.push({
          id: `r-${Date.now() + siblingLinksCreated}-${Math.floor(Math.random() * 1000)}`,
          person1Id: p1,
          person2Id: otherId,
          type: 'sibling',
          approved: isApproved,
          addedBy: userRole
        });
        siblingLinksCreated++;
      });

      // 2) Inherit P2's parents onto P1. This is the "join the family" UX:
      //    pick one sibling, the new member becomes a full child of the same
      //    parents. We skip parents P1 already has (no duplicates) and skip
      //    P1 themselves if they appear as a parent of P2 (impossible but
      //    defensive against weird data).
      const p2Parents = getParents(p2);
      p2Parents.forEach(parentId => {
        if (parentId === p1) return;
        if (p1Parents.has(parentId)) return; // already has this parent
        const isDuplicate = relationships.some(r =>
          r.type === 'parent-child' && r.person1Id === parentId && r.person2Id === p1
        );
        if (isDuplicate) return;
        relationships.push({
          id: `r-${Date.now() + 100 + parentLinksInherited}-${Math.floor(Math.random() * 1000)}`,
          person1Id: parentId,
          person2Id: p1,
          type: 'parent-child',
          approved: isApproved,
          addedBy: userRole
        });
        parentLinksInherited++;
      });

      if (siblingLinksCreated === 0 && parentLinksInherited === 0) {
        // Nothing was actually created — roll back the snapshot.
        historyStack.pop();
        updateUndoState();
        showAlert('No new links were created (already linked or blocked)', 'warning');
        return;
      }

      recalculateGenerations();
      saveToLocalStorage();
      renderAll();

      // Compose a friendly summary.
      const p1Name = (members.find(m => m.id === p1) || {}).name || '?';
      const parts = [];
      if (siblingLinksCreated > 0) parts.push(`siblings with ${siblingLinksCreated} ${siblingLinksCreated === 1 ? 'member' : 'members'}`);
      if (parentLinksInherited > 0) parts.push(`inherited ${parentLinksInherited} parent${parentLinksInherited === 1 ? '' : 's'}`);
      const summary = parts.length ? parts.join(' and ') : 'no new links';
      if (skipped.length > 0) {
        showAlert(`${p1Name} joined the family (${summary}). ${skipped.length} sibling link${skipped.length === 1 ? ' was' : 's were'} skipped due to kinship rules.`);
      } else {
        showAlert(`${p1Name} joined the family (${summary})`);
      }
      elRelationDialog.close();
    }

    // Admin Toggle lock button
    elBtnAdminToggle.addEventListener('click', () => {
      if (userRole === 'admin') {
        // Logout
        userRole = 'member';
        elRoleBadge.textContent = 'Guest Mode';
        elRoleBadge.className = 'role-badge guest';
        elBtnAdminToggle.textContent = '🔒';
        elBtnAdminToggle.title = 'Unlock Admin Mode';
        renderAll();
        showAlert('Logged out of Admin Mode');
      } else {
        // Open login
        elAdminPasswordInput.value = '';
        elLoginDialog.showModal();
        elAdminPasswordInput.focus();
      }
    });

    // Login modal buttons
    elBtnLoginDialogClose.addEventListener('click', () => elLoginDialog.close());
    elBtnLoginCancel.addEventListener('click', () => elLoginDialog.close());

    function handleLoginSubmit() {
      const pw = elAdminPasswordInput.value ? elAdminPasswordInput.value.trim().toLowerCase() : '';
      if (pw === 'jalpari') {
        userRole = 'admin';
        elRoleBadge.textContent = 'Admin Mode';
        elRoleBadge.className = 'role-badge admin';
        elBtnAdminToggle.textContent = '🔓';
        elBtnAdminToggle.title = 'Lock Admin Mode';
        elLoginDialog.close();
        renderAll();
        showAlert('Admin Mode Unlocked', 'success');
      } else {
        showAlert('Incorrect password', 'error');
        elAdminPasswordInput.focus();
        elAdminPasswordInput.select();
      }
    }

    elBtnLoginSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      handleLoginSubmit();
    });
    elAdminPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLoginSubmit();
      }
    });

    registerLightDismissFallback(elLoginDialog);

    // Register modern-web-guidance light-dismiss fallback
    registerLightDismissFallback(elMemberDialog);
    registerLightDismissFallback(elRelationDialog);
  }

  // ─── MODAL CONTROLLERS ──────────────────────────────────────────────────────

  // Populate the milk-mother dropdown with all female members (excluding self).
  function populateMilkMotherDropdown(selectEl, currentMemberId, selectedMilkMotherId) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    const noneOpt = document.createElement('option');
    noneOpt.value = '';
    noneOpt.textContent = '— none —';
    selectEl.appendChild(noneOpt);

    const sortedMothers = members
      .filter(m => m.id !== currentMemberId && m.gender === 'female')
      .sort((a, b) => a.name.localeCompare(b.name));

    sortedMothers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = (m.emoji || '👤') + ' ' + m.name;
      if (m.id === selectedMilkMotherId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function openMemberModalForAdd(presetData) {
    editingMemberId = null;
    elMemberDialogTitle.textContent = 'Add new member';
    elBtnMemberDialogSave.textContent = 'Create member';

    // Preset inputs
    elMemberDialogName.value = presetData ? presetData.name : '';
    memberDialogEmoji = presetData ? presetData.emoji : '👤';
    memberDialogColor = presetData ? presetData.color : 0;
    elMemberDialogBirthDate.value = presetData ? presetData.birthDate : '';
    elMemberDialogDeathDate.value = presetData ? presetData.deathDate : '';
    elMemberDialogGender.value = presetData ? presetData.gender : 'male';
    elMemberDialogBio.value = presetData ? presetData.bio : '';

    // Generation field is read-only and auto-derived from the graph.
    // For a brand-new member, show the next-available row suggestion.
    renderAutoGenSelect(elMemberDialogGen, getSuggestedGeneration());

    renderEmojiPicker(elMemberDialogEmojiGrid, memberDialogEmoji, (em) => { memberDialogEmoji = em; });
    renderModalColorPicker(elMemberDialogColorGrid, memberDialogColor, (idx) => { memberDialogColor = idx; });
    populateMilkMotherDropdown(elMemberDialogMilkMother, null, '');

    elMemberDialog.showModal();
  }

  function openMemberModalForEdit(member) {
    editingMemberId = member.id;
    elMemberDialogTitle.textContent = 'Edit member';
    elBtnMemberDialogSave.textContent = 'Save changes';

    // Preset inputs
    elMemberDialogName.value = member.name;
    memberDialogEmoji = member.emoji || '👤';
    memberDialogColor = member.color || 0;
    elMemberDialogBirthDate.value = member.birthDate || '';
    elMemberDialogDeathDate.value = member.deathDate || '';
    elMemberDialogGender.value = member.gender || 'male';
    elMemberDialogBio.value = member.bio || '';

    // Generation field is read-only and shows the member's current
    // computed generation (which is already a function of their parents).
    renderAutoGenSelect(elMemberDialogGen, (typeof member.generation === 'number') ? member.generation : 0);

    renderEmojiPicker(elMemberDialogEmojiGrid, memberDialogEmoji, (em) => { memberDialogEmoji = em; });
    renderModalColorPicker(elMemberDialogColorGrid, memberDialogColor, (idx) => { memberDialogColor = idx; });
    populateMilkMotherDropdown(elMemberDialogMilkMother, member.id, member.milkMotherId || '');

    elMemberDialog.showModal();
  }

  function updateRelationDialogP2() {
    const p1Id = elRelationDialogP1.value;
    const selectedP2Val = elRelationDialogP2.value;

    elRelationDialogP2.innerHTML = '<option value="">— select —</option>';

    if (!p1Id) {
      const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));
      sortedMembers.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        if (m.id === selectedP2Val) opt.selected = true;
        elRelationDialogP2.appendChild(opt);
      });
      updateRelationDialogSiblingHint();
      return;
    }

    const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));
    sortedMembers.forEach(m => {
      if (m.id === p1Id) return;

      // Filter out blocked candidates by relation type
      if (relationDialogType === 'spouse') {
        const check = checkSpouseBlock(p1Id, m.id);
        if (check.blocked) return;
      } else if (relationDialogType === 'sibling') {
        const check = checkSiblingBlock(p1Id, m.id);
        if (check.blocked) return;
      }

      const opt = document.createElement('option');
      opt.value = m.id;

      let suffix = '';
      if (relationDialogType === 'spouse' && areFirstCousins(p1Id, m.id)) {
        suffix = ' (first cousin)';
      } else if (relationDialogType === 'sibling') {
        const check = checkSiblingBlock(p1Id, m.id);
        if (check.warn === 'step-sibling') {
          suffix = ' (step-sibling)';
        }
      }
      opt.textContent = m.name + suffix;

      if (m.id === selectedP2Val) opt.selected = true;
      elRelationDialogP2.appendChild(opt);
    });
    updateRelationDialogSiblingHint();
  }

  // Populate the Father (male) dropdown. Excludes:
  //   - the child (P1) themselves
  //   - the currently-selected mother (can't be the same person as father)
  //   - the child already has as a father (defensive: would be a duplicate)
  function updateRelationDialogFather() {
    const childId = elRelationDialogP1.value;
    const motherId = elRelationDialogMother ? elRelationDialogMother.value : '';
    const selectedVal = elRelationDialogFather.value;
    elRelationDialogFather.innerHTML = '<option value="">— unknown —</option>';

    if (!childId) return;

    const child = members.find(m => m.id === childId);
    if (!child) return;

    const existingFatherIds = getFathers(childId);

    const sortedMales = members
      .filter(m => m.id !== childId)
      .filter(m => m.gender === 'male')
      .filter(m => m.id !== motherId)
      .filter(m => !existingFatherIds.includes(m.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    sortedMales.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = (m.emoji || '👤') + ' ' + m.name;
      if (m.id === selectedVal) opt.selected = true;
      elRelationDialogFather.appendChild(opt);
    });
  }

  // Populate the Mother (female) dropdown. Symmetric to updateRelationDialogFather().
  function updateRelationDialogMother() {
    const childId = elRelationDialogP1.value;
    const fatherId = elRelationDialogFather ? elRelationDialogFather.value : '';
    const selectedVal = elRelationDialogMother.value;
    elRelationDialogMother.innerHTML = '<option value="">— unknown —</option>';

    if (!childId) return;

    const child = members.find(m => m.id === childId);
    if (!child) return;

    const existingMotherIds = getMothers(childId);

    const sortedFemales = members
      .filter(m => m.id !== childId)
      .filter(m => m.gender === 'female')
      .filter(m => m.id !== fatherId)
      .filter(m => !existingMotherIds.includes(m.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    sortedFemales.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = (m.emoji || '👤') + ' ' + m.name;
      if (m.id === selectedVal) opt.selected = true;
      elRelationDialogMother.appendChild(opt);
    });
  }

  // When the relation type is "sibling", the P2 dropdown shows existing members
  // with at least one sibling. The hint text tells the user how many siblings
  // will be auto-linked. We compute that count here so it updates as P1 or P2
  // changes.
  function updateRelationDialogSiblingHint() {
    if (relationDialogType !== 'sibling') {
      elRelationDialogP2Hint.style.display = 'none';
      return;
    }
    const p2Id = elRelationDialogP2.value;
    if (!p2Id) {
      elRelationDialogP2Hint.style.display = 'none';
      return;
    }
    const group = getSiblingGroup(p2Id);
    // Exclude the P1 (new member being added) from the count, since P1
    // is the one being added to the group rather than an existing member.
    const p1Id = elRelationDialogP1.value;
    let count = group.size;
    if (p1Id && group.has(p1Id)) count -= 1;
    // Also exclude P2 itself from the count
    count -= 1;
    if (count < 0) count = 0;
    elRelationDialogSiblingCount.textContent = String(count);
    elRelationDialogP2Hint.style.display = '';
  }

  // Switch the dialog's lower slot between "Second member" (spouse/sibling)
  // and "Father + Mother" (parent-child). Also relabels P1 as "Child" for the
  // parent-child flow.
  function applyRelationDialogTypeLayout() {
    if (relationDialogType === 'parent-child') {
      elRelationDialogP1Label.textContent = 'Child';
      elRelationDialogP2Group.style.display = 'none';
      elRelationDialogFatherGroup.style.display = '';
      elRelationDialogMotherGroup.style.display = '';
      updateRelationDialogFather();
      updateRelationDialogMother();
    } else {
      elRelationDialogP1Label.textContent = 'First member';
      elRelationDialogP2Group.style.display = '';
      elRelationDialogFatherGroup.style.display = 'none';
      elRelationDialogMotherGroup.style.display = 'none';
      if (relationDialogType === 'sibling') {
        elRelationDialogP2Label.textContent = 'Sibling anchor';
        elRelationDialogP2Hint.style.display = '';
      } else {
        elRelationDialogP2Label.textContent = 'Second member';
        elRelationDialogP2Hint.style.display = 'none';
      }
      updateRelationDialogP2();
    }
  }

  function openRelationModal(presetP1Id) {
    elRelationDialogP1.innerHTML = '<option value="">— select —</option>';
    elRelationDialogP2.innerHTML = '<option value="">— select —</option>';
    elRelationDialogFather.value = '';
    elRelationDialogMother.value = '';

    // Sort members alphabetically for easy lookup
    const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedMembers.forEach(m => {
      const opt1 = document.createElement('option');
      opt1.value = m.id;
      opt1.textContent = m.name;
      if (m.id === presetP1Id) opt1.selected = true;
      elRelationDialogP1.appendChild(opt1);
    });

    // Reset relation selection (this also triggers applyRelationDialogTypeLayout)
    elRelOptionSpouse.click();

    elRelationDialog.showModal();
  }

  // Light-dismiss click outside content fallback
  function registerLightDismissFallback(dialog) {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  // Run app on DOM Load
  document.addEventListener('DOMContentLoaded', init);

})();
