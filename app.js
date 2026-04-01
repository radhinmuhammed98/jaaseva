/* ═══════════════════════════════════════════════════
   JANASEVA KENDRAM — Main Application Logic
═══════════════════════════════════════════════════ */

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let DATA = {};
let FAVS = new Set();
let RECENT = [];
const MAX_RECENT = 10;

// ══════════════════════════════════════════
//  STORAGE
// ══════════════════════════════════════════
function loadState() {
  try { const d = localStorage.getItem('jsv_data'); DATA = d ? JSON.parse(d) : JSON.parse(JSON.stringify(DEFAULT_DATA)); }
  catch { DATA = JSON.parse(JSON.stringify(DEFAULT_DATA)); }
  try { const f = localStorage.getItem('jsv_favs'); FAVS = f ? new Set(JSON.parse(f)) : new Set(); }
  catch { FAVS = new Set(); }
  try { const r = localStorage.getItem('jsv_recent'); RECENT = r ? JSON.parse(r) : []; }
  catch { RECENT = []; }
}
function saveState() {
  localStorage.setItem('jsv_data', JSON.stringify(DATA));
  localStorage.setItem('jsv_favs', JSON.stringify([...FAVS]));
  localStorage.setItem('jsv_recent', JSON.stringify(RECENT));
}

// ══════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════
function lkey(cat, sub, name) { return `${cat}||${sub}||${name}`; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// ══════════════════════════════════════════
//  FUZZY SEARCH
//  Handles: misspellings, partials, keyword match
// ══════════════════════════════════════════
function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); }

// Levenshtein distance for typo tolerance
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_,i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function fuzzyScore(query, text, weight = 1) {
  const q = normalize(query);
  const t = normalize(text);
  if (!q || !t) return 0;
  // Exact match
  if (t === q) return 100 * weight;
  // Contains query
  if (t.includes(q)) return 80 * weight;
  // Query contains text
  if (q.includes(t)) return 60 * weight;
  // Word by word partial match
  const qWords = q.split(' ');
  const tWords = t.split(' ');
  let wordScore = 0;
  qWords.forEach(qw => {
    tWords.forEach(tw => {
      if (tw.startsWith(qw) || qw.startsWith(tw)) wordScore += 20;
      else if (tw.includes(qw) || qw.includes(tw)) wordScore += 12;
      else {
        // Levenshtein for typos — allow 1 error per 4 chars
        const maxDist = Math.max(1, Math.floor(Math.min(qw.length, tw.length) / 4));
        const dist = levenshtein(qw, tw);
        if (dist <= maxDist) wordScore += Math.max(0, 15 - dist * 5);
      }
    });
  });
  return Math.min(wordScore, 70) * weight;
}

function searchAll(query) {
  if (!query.trim()) return [];
  const results = [];
  Object.entries(DATA).forEach(([cat, catObj]) => {
    Object.entries(catObj).forEach(([sub, links]) => {
      if (sub.startsWith('_') || !Array.isArray(links)) return;
      links.forEach(link => {
        let score = 0;
        score += fuzzyScore(query, link.name, 3);
        score += fuzzyScore(query, link.desc || '', 1.5);
        score += fuzzyScore(query, sub, 1.5);
        score += fuzzyScore(query, cat, 1);
        (link.keywords || []).forEach(kw => {
          score += fuzzyScore(query, kw, 2);
        });
        if (score > 8) results.push({ cat, sub, link, score, color: catObj._color || '#4f8cff' });
      });
    });
  });
  results.sort((a,b) => b.score - a.score);
  return results;
}

function highlightText(text, query) {
  if (!query || !text) return esc(text || '');
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return esc(text);
  return esc(text.slice(0,idx)) + `<mark>${esc(text.slice(idx,idx+q.length))}</mark>` + esc(text.slice(idx+q.length));
}

// ══════════════════════════════════════════
//  RECENT
// ══════════════════════════════════════════
function addRecent(cat, sub, name, url) {
  const key = lkey(cat, sub, name);
  RECENT = RECENT.filter(r => r.key !== key);
  RECENT.unshift({ key, cat, sub, name, url });
  if (RECENT.length > MAX_RECENT) RECENT.pop();
  saveState();
  renderRecent();
}

function renderRecent() {
  const el = document.getElementById('recentLinks');
  if (!RECENT.length) {
    el.innerHTML = '<span class="empty-strip">Links you click will appear here for quick access</span>';
    return;
  }
  el.innerHTML = RECENT.map(r => `
    <a class="strip-link" href="${esc(r.url)}" target="_blank" rel="noopener"
       onclick="addRecent('${esc(r.cat)}','${esc(r.sub)}','${esc(r.name)}','${esc(r.url)}')">
      ${esc(r.name)} <span class="lc">${esc(r.cat)}</span>
    </a>`).join('');
}

// ══════════════════════════════════════════
//  FAVORITES
// ══════════════════════════════════════════
function toggleFav(cat, sub, name, btn) {
  const key = lkey(cat, sub, name);
  if (FAVS.has(key)) { FAVS.delete(key); btn.classList.remove('active'); toast('Removed from favorites'); }
  else { FAVS.add(key); btn.classList.add('active'); toast('⭐ Added to favorites'); }
  saveState(); renderFavs();
}

function renderFavs() {
  const section = document.getElementById('favsSection');
  const grid = document.getElementById('favsLinks');
  if (!FAVS.size) { section.classList.remove('visible'); return; }
  section.classList.add('visible');
  let html = '';
  FAVS.forEach(key => {
    const [cat, sub, name] = key.split('||');
    const links = DATA[cat]?.[sub];
    if (!Array.isArray(links)) return;
    const link = links.find(l => l.name === name);
    if (!link) return;
    html += `<a class="strip-link fav" href="${esc(link.url)}" target="_blank" rel="noopener"
      onclick="addRecent('${esc(cat)}','${esc(sub)}','${esc(name)}','${esc(link.url)}')">
      ★ ${esc(name)} <span class="lc">${esc(cat)}</span>
    </a>`;
  });
  grid.innerHTML = html;
  if (!html) section.classList.remove('visible');
}

// ══════════════════════════════════════════
//  SEARCH UI
// ══════════════════════════════════════════
let searchTimer;
function onSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderSearch(val.trim()), 150);
  const clearBtn = document.getElementById('searchClear');
  clearBtn.classList.toggle('visible', val.length > 0);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').classList.remove('visible');
  renderSearch('');
}

function renderSearch(query) {
  const pane = document.getElementById('searchPane');
  const catPane = document.getElementById('categoriesPane');
  if (!query) {
    pane.classList.remove('visible');
    catPane.style.display = '';
    return;
  }
  pane.classList.add('visible');
  catPane.style.display = 'none';
  const results = searchAll(query);
  const title = document.getElementById('searchTitle');
  const grid = document.getElementById('searchGrid');
  title.innerHTML = `<strong>${results.length}</strong> result${results.length!==1?'s':''} for "<strong>${esc(query)}</strong>"`;
  if (!results.length) {
    grid.innerHTML = `<div class="no-results"><span class="no-results-icon">🔍</span>No services found for "<strong>${esc(query)}</strong>"<br>Try different keywords or check spelling</div>`;
    return;
  }
  grid.innerHTML = results.map(({cat, sub, link, color}) => {
    const key = lkey(cat, sub, link.name);
    const isFav = FAVS.has(key);
    return `
    <a class="sri" href="${esc(link.url)}" target="_blank" rel="noopener"
       onclick="addRecent('${esc(cat)}','${esc(sub)}','${esc(link.name)}','${esc(link.url)}')">
      <div class="sri-accent" style="background:${color}"></div>
      <div class="sri-name">${highlightText(link.name, query)}</div>
      <div class="sri-sub">${highlightText(sub, query)}</div>
      <div class="sri-path">${esc(cat)}</div>
      ${link.desc ? `<div class="sri-desc">${highlightText(link.desc, query)}</div>` : ''}
      <button class="fav-btn ${isFav?'active':''}"
        onclick="event.preventDefault();event.stopPropagation();toggleFav('${esc(cat)}','${esc(sub)}','${esc(link.name)}',this)"
        title="Favorite">★</button>
    </a>`;
  }).join('');
}

// ══════════════════════════════════════════
//  RENDER CATEGORIES
// ══════════════════════════════════════════
function countCatLinks(catObj) {
  let n = 0;
  Object.entries(catObj).forEach(([k,v]) => { if (!k.startsWith('_') && Array.isArray(v)) n += v.length; });
  return n;
}

function renderCategories() {
  const grid = document.getElementById('catsGrid');
  const cats = Object.keys(DATA);
  let html = cats.map(cat => {
    const obj = DATA[cat];
    const icon = obj._icon || '📁';
    const color = obj._color || '#4f8cff';
    const total = countCatLinks(obj);
    const subs = Object.entries(obj).filter(([k]) => !k.startsWith('_'));

    const subcatHTML = subs.map(([sub, links]) => {
      if (!Array.isArray(links)) return '';
      const linksHTML = links.map(link => {
        const key = lkey(cat, sub, link.name);
        const isFav = FAVS.has(key);
        return `<div class="link-row">
          <a class="link-main" href="${esc(link.url)}" target="_blank" rel="noopener"
             onclick="addRecent('${esc(cat)}','${esc(sub)}','${esc(link.name)}','${esc(link.url)}')">
            <span class="link-name">${esc(link.name)}</span>
            ${link.desc ? `<span class="link-desc">${esc(link.desc)}</span>` : ''}
          </a>
          <div class="link-btns">
            <button class="fav-btn ${isFav?'active':''}"
              onclick="toggleFav('${esc(cat)}','${esc(sub)}','${esc(link.name)}',this)"
              title="Favorite">★</button>
            <button class="link-edit-btn" onclick="openEditLink('${esc(cat)}','${esc(sub)}','${esc(link.name)}')">✏ Edit</button>
          </div>
        </div>`;
      }).join('');
      return `<div class="subcat">
        <div class="subcat-head" onclick="toggleSubcat(this)">
          <span class="subcat-pip"></span>
          <span class="subcat-name">${esc(sub)}</span>
          <span class="subcat-count">${links.length}</span>
          <div class="subcat-actions">
            <button class="subcat-action-btn" onclick="event.stopPropagation();openEditSubcat('${esc(cat)}','${esc(sub)}')">✏ Rename</button>
            <button class="subcat-action-btn" onclick="event.stopPropagation();openDeleteSubcat('${esc(cat)}','${esc(sub)}')">🗑 Delete</button>
          </div>
          <span class="subcat-arrow">▶</span>
        </div>
        <div class="subcat-links">${linksHTML}</div>
        <div class="add-link-row">
          <button class="btn-add-link" onclick="openAddLink('${esc(cat)}','${esc(sub)}')">＋ Add Link to ${esc(sub)}</button>
        </div>
      </div>`;
    }).join('');

    return `<div class="cat-card" id="cat-${esc(cat)}">
      <div class="cat-top-bar" style="background:${color}"></div>
      <div class="cat-head" onclick="toggleCat(this)">
        <div class="cat-icon-wrap" style="background:${color}22">${icon}</div>
        <div class="cat-info">
          <div class="cat-name">${esc(cat)}</div>
          <div class="cat-meta">${subs.length} subcategories · ${total} links</div>
        </div>
        <div class="cat-actions">
          <button class="cat-edit-btn" onclick="event.stopPropagation();openEditCat('${esc(cat)}')">⚙ Edit</button>
        </div>
        <span class="cat-arrow">▶</span>
      </div>
      <div class="cat-body">
        ${subcatHTML}
        <div class="add-subcat-row">
          <button class="btn-add-subcat" onclick="openAddSubcat('${esc(cat)}')">＋ Add Subcategory to ${esc(cat)}</button>
        </div>
      </div>
    </div>`;
  }).join('');

  // Add new category tile
  html += `<div class="add-cat-tile" onclick="openAddCat()">＋ Add New Category</div>`;
  grid.innerHTML = html;
}

function toggleCat(head) { head.parentElement.classList.toggle('open'); }
function toggleSubcat(head) { head.parentElement.classList.toggle('open'); }

// ══════════════════════════════════════════
//  MODAL SYSTEM
// ══════════════════════════════════════════
const COLORS = ['#3b82f6','#16a34a','#f59e0b','#06b6d4','#a855f7','#ec4899','#f87171','#34d399','#fb923c','#f97316','#e11d48','#0ea5e9'];
const ICONS = ['🏛️','📋','🏠','🚗','💡','💻','🏥','🤝','📄','💳','🔑','📊','🌾','⚡','🚌','🏦','📱','🔐','📞','🌐'];

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function closeAllModals() {
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
}

// ── ADD CATEGORY ──
function openAddCat() {
  document.getElementById('addCatName').value = '';
  document.getElementById('addCatIcon').value = '📁';
  renderColorPicker('addCatColorRow', 'addCatColor', '#3b82f6');
  renderIconPicker();
  openModal('modalAddCat');
}
function saveAddCat() {
  const name = document.getElementById('addCatName').value.trim();
  const icon = document.getElementById('addCatIcon').value.trim() || '📁';
  const color = document.getElementById('addCatColor').value;
  if (!name) { toast('❌ Category name required'); return; }
  if (DATA[name]) { toast('❌ Category already exists'); return; }
  DATA[name] = { _icon: icon, _color: color };
  saveState(); renderCategories(); closeAllModals();
  toast('✅ Category added');
  setTimeout(() => scrollToCard('cat-'+name), 100);
}

// ── EDIT CATEGORY ──
let _editCat = '';
function openEditCat(cat) {
  _editCat = cat;
  const obj = DATA[cat];
  document.getElementById('editCatName').value = cat;
  document.getElementById('editCatIcon').value = obj._icon || '📁';
  renderColorPicker('editCatColorRow', 'editCatColor', obj._color || '#3b82f6');
  openModal('modalEditCat');
}
function saveEditCat() {
  const newName = document.getElementById('editCatName').value.trim();
  const icon = document.getElementById('editCatIcon').value.trim() || '📁';
  const color = document.getElementById('editCatColor').value;
  if (!newName) { toast('❌ Category name required'); return; }
  if (newName !== _editCat && DATA[newName]) { toast('❌ Name already exists'); return; }
  const old = DATA[_editCat];
  delete DATA[_editCat];
  DATA[newName] = { ...old, _icon: icon, _color: color };
  // Update favorites/recent that referenced old cat
  FAVS = new Set([...FAVS].map(k => k.startsWith(_editCat+'||') ? k.replace(_editCat+'||', newName+'||') : k));
  RECENT = RECENT.map(r => r.cat === _editCat ? {...r, cat: newName, key: lkey(newName, r.sub, r.name)} : r);
  saveState(); renderCategories(); renderFavs(); renderRecent();
  closeAllModals(); toast('✅ Category updated');
}
function deleteCategory() {
  if (!confirm(`Delete entire category "${_editCat}" and all its links?`)) return;
  delete DATA[_editCat];
  FAVS = new Set([...FAVS].filter(k => !k.startsWith(_editCat+'||')));
  RECENT = RECENT.filter(r => r.cat !== _editCat);
  saveState(); renderCategories(); renderFavs(); renderRecent();
  closeAllModals(); toast('🗑 Category deleted');
}

// ── ADD SUBCATEGORY ──
let _addSubcatCat = '';
function openAddSubcat(cat) {
  _addSubcatCat = cat;
  document.getElementById('addSubcatName').value = '';
  document.getElementById('modalAddSubcatTitle').textContent = `Add Subcategory to "${cat}"`;
  openModal('modalAddSubcat');
}
function saveAddSubcat() {
  const name = document.getElementById('addSubcatName').value.trim();
  if (!name) { toast('❌ Subcategory name required'); return; }
  if (DATA[_addSubcatCat][name]) { toast('❌ Already exists'); return; }
  DATA[_addSubcatCat][name] = [];
  saveState(); renderCategories(); closeAllModals();
  toast('✅ Subcategory added');
  // Auto-open that category
  setTimeout(() => {
    const card = document.getElementById('cat-'+_addSubcatCat);
    if (card) card.classList.add('open');
  }, 100);
}

// ── EDIT / DELETE SUBCATEGORY ──
let _editSubcatCat = '', _editSubcatSub = '';
function openEditSubcat(cat, sub) {
  _editSubcatCat = cat; _editSubcatSub = sub;
  document.getElementById('editSubcatName').value = sub;
  document.getElementById('editSubcatCatName').textContent = cat;
  openModal('modalEditSubcat');
}
function saveEditSubcat() {
  const newName = document.getElementById('editSubcatName').value.trim();
  if (!newName) { toast('❌ Name required'); return; }
  if (newName !== _editSubcatSub && DATA[_editSubcatCat][newName]) { toast('❌ Already exists'); return; }
  const links = DATA[_editSubcatCat][_editSubcatSub];
  delete DATA[_editSubcatCat][_editSubcatSub];
  DATA[_editSubcatCat][newName] = links;
  FAVS = new Set([...FAVS].map(k => {
    const [c,s,n] = k.split('||');
    return (c===_editSubcatCat && s===_editSubcatSub) ? lkey(c, newName, n) : k;
  }));
  RECENT = RECENT.map(r => (r.cat===_editSubcatCat && r.sub===_editSubcatSub) ? {...r, sub:newName, key:lkey(r.cat, newName, r.name)} : r);
  saveState(); renderCategories(); renderFavs(); renderRecent();
  closeAllModals(); toast('✅ Subcategory renamed');
}
function openDeleteSubcat(cat, sub) {
  _editSubcatCat = cat; _editSubcatSub = sub;
  if (!confirm(`Delete subcategory "${sub}" and all its links?`)) return;
  delete DATA[cat][sub];
  FAVS = new Set([...FAVS].filter(k => !k.startsWith(`${cat}||${sub}||`)));
  RECENT = RECENT.filter(r => !(r.cat===cat && r.sub===sub));
  saveState(); renderCategories(); renderFavs(); renderRecent();
  toast('🗑 Subcategory deleted');
}

// ── ADD LINK ──
let _addLinkCat = '', _addLinkSub = '';
function openAddLink(cat, sub) {
  _addLinkCat = cat; _addLinkSub = sub;
  ['addLinkName','addLinkUrl','addLinkDesc','addLinkKeywords'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('modalAddLinkTitle').textContent = `Add Link to "${sub}"`;
  openModal('modalAddLink');
}
function saveAddLink() {
  const name = document.getElementById('addLinkName').value.trim();
  const url  = document.getElementById('addLinkUrl').value.trim();
  const desc = document.getElementById('addLinkDesc').value.trim();
  const kwRaw= document.getElementById('addLinkKeywords').value.trim();
  if (!name) { toast('❌ Link name required'); return; }
  if (!url)  { toast('❌ URL required'); return; }
  const keywords = kwRaw ? kwRaw.split(',').map(k=>k.trim()).filter(Boolean) : [];
  if (!DATA[_addLinkCat][_addLinkSub]) DATA[_addLinkCat][_addLinkSub] = [];
  DATA[_addLinkCat][_addLinkSub].push({ name, url, desc, keywords });
  saveState(); renderCategories(); closeAllModals();
  toast('✅ Link added');
  setTimeout(() => {
    const card = document.getElementById('cat-'+_addLinkCat);
    if (card) { card.classList.add('open'); const sub = card.querySelector(`.subcat-name`); }
  }, 100);
}

// ── EDIT LINK ──
let _editLinkCat = '', _editLinkSub = '', _editLinkName = '';
function openEditLink(cat, sub, name) {
  _editLinkCat = cat; _editLinkSub = sub; _editLinkName = name;
  const links = DATA[cat][sub];
  const link = links.find(l => l.name === name);
  if (!link) return;
  document.getElementById('editLinkName').value = link.name;
  document.getElementById('editLinkUrl').value  = link.url;
  document.getElementById('editLinkDesc').value = link.desc || '';
  document.getElementById('editLinkKeywords').value = (link.keywords || []).join(', ');
  openModal('modalEditLink');
}
function saveEditLink() {
  const name = document.getElementById('editLinkName').value.trim();
  const url  = document.getElementById('editLinkUrl').value.trim();
  const desc = document.getElementById('editLinkDesc').value.trim();
  const kwRaw= document.getElementById('editLinkKeywords').value.trim();
  if (!name) { toast('❌ Name required'); return; }
  if (!url)  { toast('❌ URL required'); return; }
  const keywords = kwRaw ? kwRaw.split(',').map(k=>k.trim()).filter(Boolean) : [];
  const links = DATA[_editLinkCat][_editLinkSub];
  const idx = links.findIndex(l => l.name === _editLinkName);
  if (idx < 0) return;
  links[idx] = { name, url, desc, keywords };
  if (name !== _editLinkName) {
    FAVS = new Set([...FAVS].map(k => k === lkey(_editLinkCat,_editLinkSub,_editLinkName) ? lkey(_editLinkCat,_editLinkSub,name) : k));
    RECENT = RECENT.map(r => (r.cat===_editLinkCat&&r.sub===_editLinkSub&&r.name===_editLinkName) ? {...r,name,key:lkey(r.cat,r.sub,name)} : r);
  }
  saveState(); renderCategories(); renderFavs(); renderRecent();
  closeAllModals(); toast('✅ Link updated');
}
function deleteLink() {
  if (!confirm(`Delete link "${_editLinkName}"?`)) return;
  DATA[_editLinkCat][_editLinkSub] = DATA[_editLinkCat][_editLinkSub].filter(l => l.name !== _editLinkName);
  FAVS.delete(lkey(_editLinkCat, _editLinkSub, _editLinkName));
  RECENT = RECENT.filter(r => r.key !== lkey(_editLinkCat, _editLinkSub, _editLinkName));
  saveState(); renderCategories(); renderFavs(); renderRecent();
  closeAllModals(); toast('🗑 Link deleted');
}

// ── COLOR PICKER ──
function renderColorPicker(rowId, inputId, selected) {
  const row = document.getElementById(rowId);
  const input = document.getElementById(inputId);
  input.value = selected;
  row.innerHTML = COLORS.map(c => `
    <div class="color-swatch ${c===selected?'selected':''}"
      style="background:${c}"
      onclick="selectColor('${rowId}','${inputId}','${c}',this)"></div>`).join('');
}
function selectColor(rowId, inputId, color, el) {
  document.getElementById(inputId).value = color;
  document.getElementById(rowId).querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

// ── ICON PICKER ──
function renderIconPicker() {
  const grid = document.getElementById('addCatIconGrid');
  if (!grid) return;
  grid.innerHTML = ICONS.map(i => `<span style="font-size:22px;cursor:pointer;padding:4px;border-radius:6px;transition:background .1s"
    onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background=''"
    onclick="document.getElementById('addCatIcon').value='${i}';toast('Icon set to ${i}')">${i}</span>`).join('');
}

// ── EXPORT / IMPORT ──
function exportData() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'janaseva-data.json'; a.click();
  toast('📥 Data exported');
}
function openImport() {
  document.getElementById('importFile').value = '';
  openModal('modalImport');
}
function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      DATA = parsed; saveState(); renderAll();
      closeAllModals(); toast('✅ Data imported successfully');
    } catch { toast('❌ Invalid JSON file'); }
  };
  reader.readAsText(file);
}

// ── RESET ──
function resetData() {
  if (!confirm('Reset all data to default? This cannot be undone.')) return;
  DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
  FAVS = new Set(); RECENT = [];
  saveState(); renderAll(); closeAllModals();
  toast('🔄 Data reset to default');
}

// ── SCROLL HELPER ──
function scrollToCard(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ══════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ══════════════════════════════════════════
document.addEventListener('keydown', e => {
  const search = document.getElementById('searchInput');
  if (e.key === '/' && document.activeElement !== search && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault(); search.focus();
  }
  if (e.key === 'Escape') {
    if (document.querySelector('.overlay.active')) { closeAllModals(); return; }
    search.value = ''; clearSearch(); search.blur();
  }
});

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) closeAllModals();
});

// ══════════════════════════════════════════
//  RENDER ALL
// ══════════════════════════════════════════
function renderAll() {
  renderCategories();
  renderFavs();
  renderRecent();
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
loadState();
renderAll();
