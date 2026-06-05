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
  
  // Alert timeouts
  let alertTimeout = null;

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
  
  const elBtnUndo = document.getElementById('btnUndo');
  const elBtnExport = document.getElementById('btnExport');
  const elFileImportInput = document.getElementById('fileImportInput');
  
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
          members = d.members;
          relationships = d.relationships;
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
          members = d.members;
          relationships = d.relationships;
          saveToLocalStorage();
          return;
        }
      }
    } catch (e) {
      console.warn('Failed fetching data.json (often due to local file:// CORS policies). Falling back to internal data.', e);
    }

    // 3. Fallback to default copy
    members = JSON.parse(JSON.stringify(DEFAULT_DATA.members));
    relationships = JSON.parse(JSON.stringify(DEFAULT_DATA.relationships));
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem('family_tree_data', JSON.stringify({ members, relationships }));
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────
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

    // 6. Update Legend items classes
    elFilterSpouse.className = `legend-item ${relFilters.spouse ? 'active' : ''}`;
    elFilterSibling.className = `legend-item ${relFilters.sibling ? 'active' : ''}`;
    elFilterParentChild.className = `legend-item ${relFilters.parentChild ? 'active' : ''}`;
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
      if (r.type === 'sibling') {
        path.setAttribute('stroke-dasharray', '6,4');
      }
      path.setAttribute('stroke-linecap', 'round');
      
      // Calculate opacity
      let opacity = '0.7';
      if (selectedId) {
        opacity = isHighlighted ? '1' : '0.15';
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
      card.className = `node-card node-color-${m.color} ${isSelected ? 'selected' : ''} ${linkedRel ? 'linked' : ''} ${isFaded ? 'faded' : ''}`;
      card.style.left = `${m.x}px`;
      card.style.top = `${m.y}px`;
      card.setAttribute('data-id', m.id);

      // 1. Relation tag
      if (linkedRel) {
        const tag = document.createElement('div');
        tag.className = 'node-relation-tag';
        tag.style.backgroundColor = REL_TYPES[linkedRel.type].color;
        tag.textContent = REL_TYPES[linkedRel.type].label;
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
      card.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return; // Ignore button clicks
        e.stopPropagation();
        e.preventDefault();
        
        draggedNodeId = m.id;
        hasDragged = false;

        const rect = elCanvasWrapper.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        nodeDragOffset = { x: mouseX - m.x, y: mouseY - m.y };
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

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-detail-action';
    btnEdit.innerHTML = '✏️';
    btnEdit.title = 'Edit member details';
    btnEdit.addEventListener('click', () => {
      openMemberModalForEdit(member);
    });

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-detail-action';
    btnDelete.innerHTML = '🗑';
    btnDelete.title = 'Remove member';
    btnDelete.addEventListener('click', () => {
      if (confirm(`Are you sure you want to remove ${member.name}? All relationship links involving them will be deleted.`)) {
        deleteMember(member.id);
      }
    });

    actionBox.appendChild(btnEdit);
    actionBox.appendChild(btnDelete);
    
    header.appendChild(profile);
    header.appendChild(actionBox);
    detailCard.appendChild(header);

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

        const btnRemove = document.createElement('button');
        btnRemove.className = 'btn-remove-connection';
        btnRemove.innerHTML = '✕';
        btnRemove.title = 'Remove this connection link';
        btnRemove.addEventListener('click', () => {
          deleteRelation(r.id);
        });

        connItem.appendChild(itemLeft);
        connItem.appendChild(btnRemove);
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
    const newMember = {
      ...data,
      id: newId,
      x: 300 + Math.random() * 300,
      y: 120 + gen * 185 + Math.random() * 50,
    };
    members.push(newMember);
    selectedId = newId;
    recalculateGenerations();
    saveToLocalStorage();
    renderAll();
    showAlert(`${newMember.name} added`);
  }

  function saveMember(id, data) {
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
    const newRel = {
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      person1Id: p1,
      person2Id: p2,
      type: type
    };
    relationships.push(newRel);
    recalculateGenerations();
    saveToLocalStorage();
    renderAll();
    showAlert('Link created');
  }

  function deleteRelation(id) {
    snapshot();
    relationships = relationships.filter(r => r.id !== id);
    recalculateGenerations();
    saveToLocalStorage();
    renderAll();
    showAlert('Link removed', 'warning');
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

    // 5. Canvas mouse controls (Dragging & panning)
    elCanvasWrapper.addEventListener('mousedown', (e) => {
      // Ignore click if it's on a card or panel
      if (e.target.closest('.node-card') || e.target.closest('[data-panel]') || e.target.closest('#quickAddPanel')) return;
      isDraggingCanvas = true;
      canvasDragStart = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      elCanvasWrapper.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingCanvas) {
        pan.x = e.clientX - canvasDragStart.x;
        pan.y = e.clientY - canvasDragStart.y;
        renderAll();
      } else if (draggedNodeId) {
        const rect = elCanvasWrapper.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        
        const m = members.find(x => x.id === draggedNodeId);
        if (m) {
          if (!hasDragged) {
            snapshot();
            hasDragged = true;
          }
          m.x = Math.round(mouseX - nodeDragOffset.x);
          m.y = Math.round(mouseY - nodeDragOffset.y);
          renderAll();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingCanvas) {
        isDraggingCanvas = false;
        elCanvasWrapper.style.cursor = 'grab';
      }
      if (draggedNodeId) {
        draggedNodeId = null;
        saveToLocalStorage();
      }
    });

    // Canvas click outside node clears selection
    elCanvasWrapper.addEventListener('click', (e) => {
      if (e.target.closest('.node-card') || e.target.closest('[data-panel]') || e.target.closest('#quickAddPanel')) return;
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

    // 8. Undo, Export, Import
    elBtnUndo.addEventListener('click', doUndo);
    elBtnExport.addEventListener('click', handleExport);
    
    elFileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const d = JSON.parse(ev.target.result);
          if (Array.isArray(d.members) && Array.isArray(d.relationships)) {
            snapshot();
            members = d.members;
            relationships = d.relationships;
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

      saveRelation(p1, p2, relationDialogType);
      elRelationDialog.close();
    });

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

      const opt2 = document.createElement('option');
      opt2.value = m.id;
      opt2.textContent = m.name;
      elRelationDialogP2.appendChild(opt2);
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
