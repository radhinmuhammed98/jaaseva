/* ═══════════════════════════════════════════
   app.js — Janaseva Kendram CSC Dashboard
   ═══════════════════════════════════════════ */

// ── STATE ──────────────────────────────────
let DATA = {};
let FAVS = new Set();
let RECENT = [];
const MAX_RECENT = 10;

// ── BOOT ───────────────────────────────────
function boot() {
  loadState();
  renderAll();
  bindGlobal();
  updateStats();
}

// ── PERSISTENCE ────────────────────────────
function loadState() {
  try { DATA = JSON.parse(localStorage.getItem('csc_data')) || DEFAULT_DATA; }
  catch { DATA = JSON.parse(JSON.stringify(DEFAULT_DATA)); }
  try { FAVS = new Set(JSON.parse(localStorage.getItem('csc_favs')) || []); }
  catch { FAVS = new Set(); }
  try { RECENT = JSON.parse(localStorage.getItem('csc_recent')) || []; }
  catch { RECENT = []; }
}

function save() {
  localStorage.setItem('csc_data', JSON.stringify(DATA));
  localStorage.setItem('csc_favs', JSON.stringify([...FAVS]));
  localStorage.setItem('csc_recent', JSON.stringify(RECENT));
}

// ── LINK KEY ───────────────────────────────
function lk(cat, sub, name) { return `${cat}||${sub}||${name}`; }

// ── RENDER ALL ─────────────────────────────
function renderAll() {
  renderFavs();
  renderRecent();
  renderCategories();
  updateStats();
}

// ── STATS ──────────────────────────────────
function updateStats() {
  let cats = 0, subs = 0, links = 0;
  Object.entries(DATA).forEach(([cat, obj]) => {
    cats++;
    Object.entries(obj).forEach(([k, v]) => {
      if (k.startsWith('_') || !Array.isArray(v)) return;
      subs++; links += v.length;
    });
  });
  qs('#stat-cats').textContent = cats;
  qs('#stat-subs').textContent = subs;
  qs('#stat-links').textContent = links;
  qs('#stat-favs').textContent = FAVS.size;
}

// ── RECENT ─────────────────────────────────
function addRecent(cat, sub, name, url) {
  const key = lk(cat, sub, name);
  RECENT = RECENT.filter(r => r.key !== key);
  RECENT.unshift({ key, cat, sub, name, url });
  if (RECENT.length > MAX_RECENT) RECENT.pop();
  save();
  renderRecent();
}

function renderRecent() {
  const el = qs('#recent-chips');
  if (!RECENT.length) {
    el.innerHTML = '<span class="empty">⚡ Clicked links appear here</span>';
    return;
  }
  el.innerHTML = RECENT.map(r => `
    <a class="chip" href="${r.url}" target="_blank" rel="noopener"
       onclick="addRecent('${es(r.cat)}','${es(r.sub)}','${es(r.name)}','${es(r.url)}')">
      ${r.name}
      <span class="chip-cat">${r.cat}</span>
    </a>`).join('');
}

// ── FAVS ───────────────────────────────────
function toggleFav(cat, sub, name, btn) {
  const key = lk(cat, sub, name);
  if (FAVS.has(key)) {
    FAVS.delete(key);
    if (btn) btn.classList.remove('active');
    toast('Removed from favourites', 'info');
  } else {
    FAVS.add(key);
    if (btn) btn.classList.add('active');
    toast('⭐ Added to favourites', 'ok');
  }
  save();
  renderFavs();
  updateStats();
  // sync all fav buttons with same key
  qsa(`[data-fav-key="${key}"]`).forEach(b => {
    b.classList.toggle('active', FAVS.has(key));
  });
}

function renderFavs() {
  const sec = qs('#favs-panel');
  const grid = qs('#favs-chips');
  if (!FAVS.size) { sec.style.display = 'none'; return; }
  sec.style.display = '';
  let html = '';
  FAVS.forEach(key => {
    const [cat, sub, name] = key.split('||');
    const links = DATA[cat]?.[sub];
    if (!Array.isArray(links)) return;
    const lnk = links.find(l => l.name === name);
    if (!lnk) return;
    html += `
      <a class="chip chip-fav" href="${lnk.url}" target="_blank" rel="noopener"
         onclick="addRecent('${es(cat)}','${es(sub)}','${es(name)}','${es(lnk.url)}')">
        ⭐ ${name} <span class="chip-cat">${cat}</span>
      </a>`;
  });
  grid.innerHTML = html || '';
}

// ── CATEGORIES RENDER ──────────────────────
function renderCategories() {
  const grid = qs('#cat-grid');
  const cats = Object.keys(DATA);
  grid.innerHTML = cats.map(cat => renderCatCard(cat)).join('') +
    `<div class="add-cat-card" onclick="openCatModal()">
      <span style="font-size:22px">➕</span>
      <span>Add Category</span>
    </div>`;
}

function renderCatCard(cat) {
  const obj = DATA[cat];
  const icon = obj._icon || '📁';
  const color = obj._color || '#1a56db';
  const subcats = Object.entries(obj).filter(([k]) => !k.startsWith('_'));
  const total = subcats.reduce((n, [, v]) => n + (Array.isArray(v) ? v.length : 0), 0);

  const subsHTML = subcats.map(([sub, links]) => {
    if (!Array.isArray(links)) return '';
    const linksHTML = links.map(lnk => {
      const key = lk(cat, sub, lnk.name);
      const fav = FAVS.has(key);
      return `
        <div class="link-row">
          <a class="link-a" href="${lnk.url}" target="_blank" rel="noopener"
             onclick="addRecent('${es(cat)}','${es(sub)}','${es(lnk.name)}','${es(lnk.url)}')">
            <span class="la-arrow">↗</span>
            <span class="la-text">
              <span class="la-name">${lnk.name}</span>
              ${lnk.desc ? `<span class="la-desc">${lnk.desc}</span>` : ''}
            </span>
          </a>
          <div class="link-btns">
            <button class="lbtn fav ${fav ? 'active' : ''}" data-fav-key="${key}"
              onclick="toggleFav('${es(cat)}','${es(sub)}','${es(lnk.name)}',this)"
              title="Favourite">★</button>
            <button class="lbtn edit"
              onclick="openLinkModal('${es(cat)}','${es(sub)}','${es(lnk.name)}')"
              title="Edit">✏️</button>
            <button class="lbtn del"
              onclick="confirmDel('link','${es(cat)}','${es(sub)}','${es(lnk.name)}')"
              title="Delete">🗑</button>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="subcat" data-sub="${es(sub)}">
        <div class="sub-head" onclick="toggleSub(this)">
          <span class="sub-pip" style="color:${color}"></span>
          <span class="sub-name">${sub}</span>
          <span class="sub-cnt">${links.length}</span>
          <div class="sub-acts" onclick="event.stopPropagation()">
            <button class="icon-btn" onclick="openSubModal('${es(cat)}','${es(sub)}')" title="Edit subcategory">✏️</button>
            <button class="icon-btn del" onclick="confirmDel('sub','${es(cat)}','${es(sub)}')" title="Delete subcategory">🗑</button>
          </div>
          <span class="sub-arrow">▶</span>
        </div>
        <div class="sub-links">
          ${linksHTML}
          <button class="add-link-btn" onclick="openLinkModal('${es(cat)}','${es(sub)}',null)">➕ Add Link</button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="cat-card" id="cat-${slugify(cat)}">
      <div class="cat-bar" style="background:${color}"></div>
      <div class="cat-head" onclick="toggleCat(this)">
        <div class="cat-icon" style="background:${color}22">${icon}</div>
        <div class="cat-meta">
          <div class="cat-name">${cat}</div>
          <div class="cat-cnt">${subcats.length} subcategories · ${total} links</div>
        </div>
        <div class="cat-acts" onclick="event.stopPropagation()">
          <button class="icon-btn" onclick="openCatModal('${es(cat)}')" title="Edit category">✏️</button>
          <button class="icon-btn del" onclick="confirmDel('cat','${es(cat)}')" title="Delete category">🗑</button>
        </div>
        <span class="cat-arrow">▶</span>
      </div>
      <div class="cat-body">
        ${subsHTML}
        <button class="add-sub-btn" onclick="openSubModal('${es(cat)}',null)">➕ Add Subcategory</button>
      </div>
    </div>`;
}

function toggleCat(head) { head.parentElement.classList.toggle('open'); }
function toggleSub(head) { head.parentElement.classList.toggle('open'); }

// ── SEARCH ─────────────────────────────────
// Fuzzy / typo-tolerant search using:
// 1. Exact substring match (highest)
// 2. Keyword match (exact)
// 3. Keyword fuzzy (trigram similarity)
// 4. Levenshtein distance fallback

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i===0?j:j===0?i:0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

function trigrams(str) {
  const s = ' ' + str.toLowerCase() + ' ';
  const set = new Set();
  for (let i=0;i<s.length-2;i++) set.add(s.slice(i,i+3));
  return set;
}

function trigramSim(a, b) {
  const ta = trigrams(a), tb = trigrams(b);
  let common = 0;
  ta.forEach(t => { if (tb.has(t)) common++; });
  return (2 * common) / (ta.size + tb.size + 0.001);
}

function scoreLink(lnk, cat, sub, q) {
  const ql = q.toLowerCase().trim();
  if (!ql) return 0;
  const fields = [
    lnk.name.toLowerCase(),
    sub.toLowerCase(),
    cat.toLowerCase(),
    (lnk.desc || '').toLowerCase(),
    ...(lnk.keywords || []).map(k => k.toLowerCase())
  ];

  // 1. Exact substring anywhere
  for (const f of fields) if (f.includes(ql)) return 100 + (f === ql ? 50 : 0);

  // 2. All query words appear across fields
  const words = ql.split(/\s+/);
  const allText = fields.join(' ');
  if (words.every(w => allText.includes(w))) return 70;

  // 3. High trigram similarity in any field
  let maxTri = 0;
  for (const f of fields) {
    const sim = trigramSim(ql, f);
    if (sim > maxTri) maxTri = sim;
    // sliding window for long fields
    if (f.length > ql.length + 2) {
      for (let i=0; i<=f.length-ql.length; i++) {
        const chunk = f.slice(i, i+ql.length+3);
        const s2 = trigramSim(ql, chunk);
        if (s2 > maxTri) maxTri = s2;
      }
    }
  }
  if (maxTri > 0.45) return Math.round(maxTri * 60);

  // 4. Levenshtein on short fields
  let bestLev = Infinity;
  for (const f of [lnk.name.toLowerCase(), sub.toLowerCase(), cat.toLowerCase()]) {
    const dist = levenshtein(ql, f.slice(0, ql.length + 3));
    if (dist < bestLev) bestLev = dist;
  }
  const maxDist = Math.max(2, Math.floor(ql.length / 3));
  if (bestLev <= maxDist) return Math.max(5, 40 - bestLev * 10);

  return 0;
}

let searchTimer;
function onSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => doSearch(val.trim()), 100);
  qs('.s-clear').classList.toggle('vis', val.length > 0);
  qs('.s-key').style.display = val.length > 0 ? 'none' : '';
}

function clearSearch() {
  qs('#searchInput').value = '';
  onSearch('');
  qs('#searchInput').focus();
}

function doSearch(q) {
  const panel = qs('#search-panel');
  const catGrid = qs('#cat-grid');
  const qrow = qs('#quick-row');

  if (!q) {
    panel.classList.remove('active');
    catGrid.style.display = '';
    qrow.style.display = '';
    return;
  }

  catGrid.style.display = 'none';
  qrow.style.display = 'none';
  panel.classList.add('active');

  const results = [];
  Object.entries(DATA).forEach(([cat, obj]) => {
    Object.entries(obj).forEach(([sub, links]) => {
      if (sub.startsWith('_') || !Array.isArray(links)) return;
      links.forEach(lnk => {
        const score = scoreLink(lnk, cat, sub, q);
        if (score > 0) results.push({ cat, sub, lnk, score });
      });
    });
  });
  results.sort((a,b) => b.score - a.score);

  qs('#sp-count').innerHTML = `<strong>${results.length}</strong> result${results.length!==1?'s':''} for "<em>${q}</em>"`;

  if (!results.length) {
    qs('#search-grid').innerHTML = `<div class="no-res" style="grid-column:1/-1"><strong>🔍</strong>No results for "${q}".<br>Try different spelling or keywords.</div>`;
    return;
  }

  qs('#search-grid').innerHTML = results.slice(0, 40).map(({cat, sub, lnk, score}) => {
    const key = lk(cat, sub, lnk.name);
    const fav = FAVS.has(key);
    const color = DATA[cat]?._color || '#1a56db';
    return `
      <div style="position:relative">
        <a class="sr-card" href="${lnk.url}" target="_blank" rel="noopener"
           style="border-left:3px solid ${color}"
           onclick="addRecent('${es(cat)}','${es(sub)}','${es(lnk.name)}','${es(lnk.url)}')">
          <div class="sr-name">${hl(lnk.name, q)}</div>
          ${lnk.desc ? `<div class="sr-desc">${lnk.desc}</div>` : ''}
          <div class="sr-path">${hl(cat,q)} › ${hl(sub,q)}</div>
        </a>
        <button class="sr-fav ${fav?'active':''}" data-fav-key="${key}"
          onclick="toggleFav('${es(cat)}','${es(sub)}','${es(lnk.name)}',this)"
          title="Favourite">★</button>
      </div>`;
  }).join('');
}

function hl(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return text.slice(0,idx) + `<mark>${text.slice(idx,idx+q.length)}</mark>` + text.slice(idx+q.length);
}

// ── CATEGORY MODAL ─────────────────────────
const CAT_EMOJIS = ['🏛️','🪪','🏠','🚗','🌾','💡','💻','🏥','📄','🏦','📱','🎓','⚖️','🌐','📋','🔖','🧾','💰','🛡️','📞'];
const CAT_COLORS = ['#1a56db','#059669','#7c3aed','#d97706','#dc2626','#db2777','#0891b2','#0f766e','#9333ea','#ea580c','#65a30d','#0284c7'];

let _editCat = null; // null = new

function openCatModal(cat) {
  _editCat = cat || null;
  const obj = cat ? DATA[cat] : null;
  qs('#cat-modal-title').textContent = cat ? 'Edit Category' : 'Add Category';
  qs('#cat-name-input').value = cat || '';
  qs('#cat-icon-input').value = obj?._icon || '📁';

  // emoji grid
  qs('#cat-emoji-grid').innerHTML = CAT_EMOJIS.map(e =>
    `<button class="eopt ${(obj?._icon||'📁')===e?'sel':''}" onclick="selectEmoji('${e}')">${e}</button>`
  ).join('');

  // color grid
  qs('#cat-color-grid').innerHTML = CAT_COLORS.map(c =>
    `<div class="copt ${(obj?._color||'#1a56db')===c?'sel':''}"
      style="background:${c}" onclick="selectColor('${c}')"></div>`
  ).join('');

  showOverlay('cat-overlay');
}

function selectEmoji(e) {
  qs('#cat-icon-input').value = e;
  qsa('#cat-emoji-grid .eopt').forEach(b => b.classList.toggle('sel', b.textContent===e));
}

function selectColor(c) {
  qsa('#cat-color-grid .copt').forEach(b => b.classList.toggle('sel', b.style.background===c || b.style.background===hexToRgb(c)));
  qs('#cat-color-grid').dataset.selected = c;
}

function saveCat() {
  const name = qs('#cat-name-input').value.trim();
  const icon = qs('#cat-icon-input').value.trim() || '📁';
  const color = qs('#cat-color-grid').dataset.selected || '#1a56db';
  if (!name) { toast('Category name required', 'err'); return; }

  if (_editCat && _editCat !== name) {
    // rename
    const keys = Object.keys(DATA);
    const newData = {};
    keys.forEach(k => {
      if (k === _editCat) {
        newData[name] = { ...DATA[k], _icon: icon, _color: color };
      } else { newData[k] = DATA[k]; }
    });
    DATA = newData;
    // update favs and recent with new cat name
    FAVS = new Set([...FAVS].map(k => k.startsWith(_editCat+'||') ? name+'||'+k.slice(_editCat.length+2) : k));
    RECENT = RECENT.map(r => r.cat===_editCat ? {...r,cat:name,key:lk(name,r.sub,r.name)} : r);
  } else if (_editCat) {
    DATA[_editCat]._icon = icon;
    DATA[_editCat]._color = color;
  } else {
    if (DATA[name]) { toast('Category already exists', 'err'); return; }
    DATA[name] = { _icon: icon, _color: color };
  }
  save(); closeOverlay('cat-overlay'); renderAll();
  toast(_editCat ? '✅ Category updated' : '✅ Category added', 'ok');
}

// ── SUBCAT MODAL ───────────────────────────
let _editSubCat = null, _editSubName = null;

function openSubModal(cat, sub) {
  _editSubCat = cat;
  _editSubName = sub;
  qs('#sub-modal-title').textContent = sub ? 'Edit Subcategory' : 'Add Subcategory';
  qs('#sub-cat-label').textContent = cat;
  qs('#sub-name-input').value = sub || '';
  showOverlay('sub-overlay');
}

function saveSub() {
  const name = qs('#sub-name-input').value.trim();
  if (!name) { toast('Subcategory name required', 'err'); return; }
  const cat = _editSubCat;

  if (_editSubName && _editSubName !== name) {
    // rename
    const catObj = DATA[cat];
    const newCatObj = {};
    Object.entries(catObj).forEach(([k,v]) => {
      if (k === _editSubName) newCatObj[name] = v;
      else newCatObj[k] = v;
    });
    DATA[cat] = newCatObj;
    FAVS = new Set([...FAVS].map(k => k === lk(cat,_editSubName,k.split('||')[2]) ? lk(cat,name,k.split('||')[2]) : k));
    RECENT = RECENT.map(r => (r.cat===cat&&r.sub===_editSubName) ? {...r,sub:name,key:lk(cat,name,r.name)} : r);
  } else if (!_editSubName) {
    if (DATA[cat][name]) { toast('Subcategory already exists', 'err'); return; }
    DATA[cat][name] = [];
  }
  save(); closeOverlay('sub-overlay'); renderAll();
  toast(_editSubName ? '✅ Subcategory updated' : '✅ Subcategory added', 'ok');
  // reopen parent cat
  setTimeout(() => {
    const card = qs(`#cat-${slugify(cat)}`);
    if (card) card.classList.add('open');
  }, 100);
}

// ── LINK MODAL ─────────────────────────────
let _lCat, _lSub, _lName; // null name = new link

function openLinkModal(cat, sub, name) {
  _lCat = cat; _lSub = sub; _lName = name;
  const isEdit = name !== null;
  qs('#link-modal-title').textContent = isEdit ? 'Edit Link' : 'Add Link';
  qs('#link-cat-label').textContent = `${cat} › ${sub}`;

  const lnk = isEdit ? (DATA[cat]?.[sub]||[]).find(l=>l.name===name) : null;
  qs('#link-name-input').value = lnk?.name || '';
  qs('#link-url-input').value = lnk?.url || '';
  qs('#link-desc-input').value = lnk?.desc || '';
  qs('#link-kw-input').value = (lnk?.keywords||[]).join(', ');
  showOverlay('link-overlay');
}

function saveLink() {
  const name = qs('#link-name-input').value.trim();
  const url  = qs('#link-url-input').value.trim();
  const desc = qs('#link-desc-input').value.trim();
  const kw   = qs('#link-kw-input').value.trim();
  if (!name) { toast('Link name required', 'err'); return; }
  if (!url)  { toast('URL required', 'err'); return; }
  if (!/^https?:\/\//i.test(url)) { toast('URL must start with http:// or https://', 'warn'); return; }

  const keywords = kw ? kw.split(',').map(s=>s.trim()).filter(Boolean) : [];
  const newLnk = { name, url, desc, keywords };

  const arr = DATA[_lCat][_lSub];
  if (_lName) {
    // edit
    const idx = arr.findIndex(l=>l.name===_lName);
    if (idx>=0) {
      arr[idx] = newLnk;
      // update favs/recent if name changed
      if (_lName !== name) {
        const oldKey = lk(_lCat,_lSub,_lName);
        const newKey = lk(_lCat,_lSub,name);
        if (FAVS.has(oldKey)) { FAVS.delete(oldKey); FAVS.add(newKey); }
        RECENT = RECENT.map(r => r.key===oldKey ? {...r,name,key:newKey} : r);
      }
    }
  } else {
    arr.push(newLnk);
  }
  save(); closeOverlay('link-overlay'); renderAll();
  toast(_lName ? '✅ Link updated' : '✅ Link added', 'ok');
  setTimeout(() => {
    const card = qs(`#cat-${slugify(_lCat)}`);
    if (card) {
      card.classList.add('open');
      const sub = card.querySelector(`[data-sub="${_lSub}"]`);
      if (sub) sub.classList.add('open');
    }
  }, 100);
}

// ── DELETE ─────────────────────────────────
let _delType, _delA, _delB, _delC;

function confirmDel(type, a, b, c) {
  _delType=type; _delA=a; _delB=b; _delC=c;
  const msgs = {
    cat: `Delete category "<strong>${a}</strong>" and ALL its subcategories and links?`,
    sub: `Delete subcategory "<strong>${b}</strong>" and all its links?`,
    link: `Delete link "<strong>${c}</strong>"?`
  };
  qs('#del-msg').innerHTML = msgs[type];
  showOverlay('del-overlay');
}

function doDelete() {
  if (_delType==='cat') {
    // remove favs
    const prefix = _delA + '||';
    FAVS = new Set([...FAVS].filter(k => !k.startsWith(prefix)));
    RECENT = RECENT.filter(r => r.cat !== _delA);
    delete DATA[_delA];
  } else if (_delType==='sub') {
    const prefix = lk(_delA, _delB, '');
    FAVS = new Set([...FAVS].filter(k => !k.startsWith(prefix)));
    RECENT = RECENT.filter(r => !(r.cat===_delA && r.sub===_delB));
    delete DATA[_delA][_delB];
  } else if (_delType==='link') {
    const key = lk(_delA, _delB, _delC);
    FAVS.delete(key);
    RECENT = RECENT.filter(r => r.key !== key);
    DATA[_delA][_delB] = DATA[_delA][_delB].filter(l => l.name !== _delC);
  }
  save(); closeOverlay('del-overlay'); renderAll();
  toast('🗑 Deleted successfully', 'warn');
}

// ── JSON EDITOR ────────────────────────────
function openJsonEditor() {
  qs('#json-ta').value = JSON.stringify(DATA, null, 2);
  showOverlay('json-overlay');
}

function saveJson() {
  try {
    DATA = JSON.parse(qs('#json-ta').value);
    save(); closeOverlay('json-overlay'); renderAll();
    toast('✅ Data saved from JSON', 'ok');
  } catch(e) {
    toast('❌ Invalid JSON: ' + e.message, 'err');
  }
}

function exportJson() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'csc-services.json'; a.click();
  toast('📥 JSON exported', 'info');
}

function importJson() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        DATA = JSON.parse(ev.target.result);
        save(); renderAll(); closeOverlay('json-overlay');
        toast('✅ JSON imported successfully', 'ok');
      } catch { toast('❌ Invalid JSON file', 'err'); }
    };
    r.readAsText(f);
  };
  inp.click();
}

function resetData() {
  if (!confirm('Reset ALL data to default? This cannot be undone.')) return;
  DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
  FAVS = new Set(); RECENT = [];
  save(); renderAll(); closeOverlay('json-overlay');
  toast('↩️ Data reset to default', 'warn');
}

// ── OVERLAY HELPERS ────────────────────────
function showOverlay(id) { qs('#'+id).classList.add('active'); }
function closeOverlay(id) { qs('#'+id).classList.remove('active'); }

// ── TOAST ──────────────────────────────────
let toastIdx = 0;
function toast(msg, type='info') {
  const wrap = qs('#toast-wrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  requestAnimationFrame(() => { requestAnimationFrame(() => el.classList.add('show')); });
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

// ── GLOBAL BINDS ───────────────────────────
function bindGlobal() {
  // search
  qs('#searchInput').addEventListener('input', e => onSearch(e.target.value));

  // close overlays on backdrop click
  qsa('.overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target===o) o.classList.remove('active'); });
  });

  // keyboard
  document.addEventListener('keydown', e => {
    if (e.key==='/' && document.activeElement!==qs('#searchInput') && !qs('.overlay.active')) {
      e.preventDefault(); qs('#searchInput').focus();
    }
    if (e.key==='Escape') {
      const open = qs('.overlay.active');
      if (open) { open.classList.remove('active'); return; }
      if (qs('#searchInput').value) { clearSearch(); }
    }
  });
}

// ── UTILS ──────────────────────────────────
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }
function es(s) { return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;'); }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]/g,'-'); }
function hexToRgb(hex) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── START ──────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
