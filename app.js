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
  const elBtnMemberDialogCancel = document.getElementById('btnMemberDialogCancel');
  const elBtnMemberDialogSave = document.getElementById('btnMemberDialogSave');
  const elMemberDialogTitle = document.getElementById('memberDialogTitle');

  const elRelationDialog = document.getElementById('relationDialog');
  const elBtnRelationDialogClose = document.getElementById('btnRelationDialogClose');
  const elRelationDialogP1 = document.getElementById('relationDialogP1');
  const elRelationDialogP2 = document.getElementById('relationDialogP2');
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

  // ─── INITIALIZATION ─────────────────────────────────────────────────────────
  function init() {
    loadData().then(() => {
      recalculateGenerations();
      setupEventListeners();
      renderAll();
    });
  }

  async function loadData() {
    // 1. Try local storage
    const stored = localStorage.getItem('family_tree_data');
    if (stored) {
      try {
        const d = JSON.parse(stored);
        if (d.members && d.relationships) {
          members = d.members.map(m => Object.assign({ approved: true, addedBy: 'admin' }, m));
          relationships = d.relationships.map(r => Object.assign({ approved: true, addedBy: 'admin' }, r));
          return;
        }
      } catch (e) {
        console.warn('Failed parsing local storage data', e);
      }
    }

    // 2. Try fetching data.json
    try {
      const response = await fetch('data.json');
      if (response.ok) {
        const d = await response.json();
        if (d.members && d.relationships) {
          members = d.members.map(m => Object.assign({ approved: true, addedBy: 'admin' }, m));
          relationships = d.relationships.map(r => Object.assign({ approved: true, addedBy: 'admin' }, r));
          saveToLocalStorage();
          return;
        }
      }
    } catch (e) {
      console.warn('Failed fetching data.json (often due to local file:// CORS policies). Falling back to internal data.', e);
    }

    // 3. Fallback to default copy
    members = JSON.parse(JSON.stringify(DEFAULT_DATA.members)).map(m => Object.assign({ approved: true, addedBy: 'admin' }, m));
    relationships = JSON.parse(JSON.stringify(DEFAULT_DATA.relationships)).map(r => Object.assign({ approved: true, addedBy: 'admin' }, r));
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem('family_tree_data', JSON.stringify({ members, relationships }));
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
    const gen = data.generation || 0;
    const newId = `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isApproved = (userRole === 'admin');
    const newMember = {
      ...data,
      id: newId,
      x: 300 + Math.random() * 300,
      y: 120 + gen * 185 + Math.random() * 50,
      approved: isApproved,
      addedBy: userRole
    };
    members.push(newMember);
    selectedId = newId;
    recalculateGenerations();
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
    const dataStr = JSON.stringify({ members, relationships }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-tree.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const d = JSON.parse(ev.target.result);
          if (Array.isArray(d.members) && Array.isArray(d.relationships)) {
            snapshot();
            // Default imported nodes/links to approved/admin if not set
            members = d.members.map(m => Object.assign({ approved: true, addedBy: 'admin' }, m));
            relationships = d.relationships.map(r => Object.assign({ approved: true, addedBy: 'admin' }, r));
            selectedId = null;
            recalculateGenerations();
            saveToLocalStorage();
            renderAll();
            showAlert('Tree imported');
          } else {
            showAlert('Invalid import format', 'error');
          }
        } catch (err) {
          showAlert('Failed to parse JSON', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Clear file input
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
      addMember({
        name: nameVal,
        emoji: quickAddEmoji,
        color: quickAddColor,
        gender: elQuickAddGender.value,
        generation: parseInt(elQuickAddGen.value, 10),
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
      
      // Preset dialog fields
      openMemberModalForAdd({
        name: nameVal,
        emoji: quickAddEmoji,
        color: quickAddColor,
        gender: elQuickAddGender.value,
        generation: parseInt(elQuickAddGen.value, 10),
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

      const data = {
        name: nameVal,
        emoji: memberDialogEmoji,
        color: memberDialogColor,
        birthDate: elMemberDialogBirthDate.value,
        deathDate: elMemberDialogDeathDate.value,
        gender: elMemberDialogGender.value,
        generation: parseInt(elMemberDialogGen.value, 10),
        bio: elMemberDialogBio.value.trim()
      };

      if (editingMemberId) {
        saveMember(editingMemberId, data);
      } else {
        addMember(data);
      }

      elMemberDialog.close();
    });

    elRelationDialogP1.addEventListener('change', updateRelationDialogP2);

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

        updateRelationDialogP2();
      });

      // Accessibility keybindings
      opt.el.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          opt.el.click();
        }
      });
    });

    // Relation Dialog Save
    elBtnRelationDialogSave.addEventListener('click', () => {
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

      if (relationDialogType === 'spouse') {
        const check = checkSpouseBlock(p1, p2);
        if (check.blocked) {
          showAlert(`Cannot link: ${check.reason}`, 'error');
          return;
        }
      }

      saveRelation(p1, p2, relationDialogType);
      elRelationDialog.close();
    });

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
    elMemberDialogGen.value = presetData ? presetData.generation : 1;
    elMemberDialogBio.value = presetData ? presetData.bio : '';

    renderEmojiPicker(elMemberDialogEmojiGrid, memberDialogEmoji, (em) => { memberDialogEmoji = em; });
    renderModalColorPicker(elMemberDialogColorGrid, memberDialogColor, (idx) => { memberDialogColor = idx; });

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
    elMemberDialogGen.value = member.generation !== undefined ? member.generation : 1;
    elMemberDialogBio.value = member.bio || '';

    renderEmojiPicker(elMemberDialogEmojiGrid, memberDialogEmoji, (em) => { memberDialogEmoji = em; });
    renderModalColorPicker(elMemberDialogColorGrid, memberDialogColor, (idx) => { memberDialogColor = idx; });

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
      return;
    }
    
    const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));
    sortedMembers.forEach(m => {
      if (m.id === p1Id) return;
      
      if (relationDialogType === 'spouse') {
        const check = checkSpouseBlock(p1Id, m.id);
        if (check.blocked) return;
      }
      
      const opt = document.createElement('option');
      opt.value = m.id;
      
      let suffix = '';
      if (relationDialogType === 'spouse' && areFirstCousins(p1Id, m.id)) {
        suffix = ' (first cousin)';
      }
      opt.textContent = m.name + suffix;
      
      if (m.id === selectedP2Val) opt.selected = true;
      elRelationDialogP2.appendChild(opt);
    });
  }

  function openRelationModal(presetP1Id) {
    elRelationDialogP1.innerHTML = '<option value="">— select —</option>';
    elRelationDialogP2.innerHTML = '<option value="">— select —</option>';

    // Sort members alphabetically for easy lookup
    const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedMembers.forEach(m => {
      const opt1 = document.createElement('option');
      opt1.value = m.id;
      opt1.textContent = m.name;
      if (m.id === presetP1Id) opt1.selected = true;
      elRelationDialogP1.appendChild(opt1);
    });

    // Reset relation selection
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
