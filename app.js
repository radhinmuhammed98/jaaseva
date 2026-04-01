/* ═══════════════════════════════════════════
   app.js — Janaseva Kendram CSC Dashboard
   ═══════════════════════════════════════════ */

// ── STATE ──
let DATA = {}, FAVS = new Set(), RECENT = [], EDIT_MODE = false;
const MAX_RECENT = 10;

// ── BOOT ──
function boot() {
  loadState();
  applyTheme();
  renderAll();
  bindGlobal();
}

// ── PERSISTENCE ──
function loadState() {
  try { DATA = JSON.parse(localStorage.getItem('csc_data')) || DEFAULT_DATA; } catch { DATA = JSON.parse(JSON.stringify(DEFAULT_DATA)); }
  try { FAVS = new Set(JSON.parse(localStorage.getItem('csc_favs')) || []); } catch { FAVS = new Set(); }
  try { RECENT = JSON.parse(localStorage.getItem('csc_recent')) || []; } catch { RECENT = []; }
}
function save() {
  localStorage.setItem('csc_data', JSON.stringify(DATA));
  localStorage.setItem('csc_favs', JSON.stringify([...FAVS]));
  localStorage.setItem('csc_recent', JSON.stringify(RECENT));
}

// ── THEME ──
function applyTheme() {
  const t = localStorage.getItem('csc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t === 'dark' ? '' : 'light');
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  updateThemeBtn(t);
}
function toggleTheme() {
  const cur = localStorage.getItem('csc_theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  localStorage.setItem('csc_theme', next);
  if (next === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  updateThemeBtn(next);
  toast(next === 'dark' ? '🌙 Dark mode' : '☀️ Light mode', 'info');
}
function updateThemeBtn(t) {
  const btn = qs('#theme-btn');
  if (!btn) return;
  btn.innerHTML = t === 'dark' ? '☀️ <span>Light</span>' : '🌙 <span>Dark</span>';
}

// ── EDIT MODE ──
function toggleEditMode() {
  EDIT_MODE = !EDIT_MODE;
  document.body.classList.toggle('edit-mode', EDIT_MODE);
  qs('#edit-btn').classList.toggle('on', EDIT_MODE);
  qs('#edit-btn').innerHTML = EDIT_MODE
    ? '🔒 <span>Lock</span>'
    : '✏️ <span>Edit</span>';
  toast(EDIT_MODE ? '🔓 Edit mode ON — you can now add, edit or delete anything' : '🔒 Edit mode OFF', EDIT_MODE ? 'warn' : 'info');
}

// ── RENDER ──
function renderAll() {
  renderFavs(); renderRecent(); renderCats(); updateStats();
}
function updateStats() {
  let cats=0, subs=0, links=0;
  Object.entries(DATA).forEach(([, obj]) => {
    cats++;
    Object.entries(obj).forEach(([k,v]) => { if(!k.startsWith('_')&&Array.isArray(v)){subs++;links+=v.length;} });
  });
  qs('#sc').textContent=cats; qs('#ss').textContent=subs;
  qs('#sl').textContent=links; qs('#sf').textContent=FAVS.size;
}

// ── RECENT ──
function addRecent(cat,sub,name,url) {
  const key=lk(cat,sub,name);
  RECENT=RECENT.filter(r=>r.key!==key);
  RECENT.unshift({key,cat,sub,name,url});
  if(RECENT.length>MAX_RECENT) RECENT.pop();
  save(); renderRecent();
}
function renderRecent() {
  const el=qs('#recent-chips');
  if(!RECENT.length){el.innerHTML='<span class="empty">⚡ Clicked links appear here</span>';return;}
  el.innerHTML=RECENT.map(r=>`
    <a class="chip" href="${r.url}" target="_blank" rel="noopener"
       onclick="addRecent('${es(r.cat)}','${es(r.sub)}','${es(r.name)}','${es(r.url)}')">
      ${r.name}<span class="ccat">${r.cat}</span>
    </a>`).join('');
}

// ── FAVS ──
function toggleFav(cat,sub,name,btn) {
  const key=lk(cat,sub,name);
  if(FAVS.has(key)){FAVS.delete(key);if(btn)btn.classList.remove('on');toast('Removed from favourites','info');}
  else{FAVS.add(key);if(btn)btn.classList.add('on');toast('⭐ Added to favourites','ok');}
  save(); renderFavs(); updateStats();
  qsa(`[data-fk="${key}"]`).forEach(b=>b.classList.toggle('on',FAVS.has(key)));
}
function renderFavs() {
  const sec=qs('#favs-panel'),grid=qs('#favs-chips');
  if(!FAVS.size){sec.style.display='none';return;}
  sec.style.display='';
  let h='';
  FAVS.forEach(key=>{
    const[cat,sub,name]=key.split('||');
    const links=DATA[cat]?.[sub];
    if(!Array.isArray(links))return;
    const lnk=links.find(l=>l.name===name);
    if(!lnk)return;
    h+=`<a class="chip chipfav" href="${lnk.url}" target="_blank" rel="noopener"
         onclick="addRecent('${es(cat)}','${es(sub)}','${es(name)}','${es(lnk.url)}')">
        ⭐ ${name}<span class="ccat">${cat}</span></a>`;
  });
  grid.innerHTML=h||'';
}

// ── CATEGORIES ──
function renderCats() {
  const grid=qs('#cgrid');
  grid.innerHTML=Object.keys(DATA).map(cat=>renderCatCard(cat)).join('')+
    `<div class="add-ccard" onclick="openCatModal()"><span style="font-size:22px">➕</span><span>Add Category</span></div>`;
}

function renderCatCard(cat) {
  const obj=DATA[cat], icon=obj._icon||'📁', color=obj._color||'#3b82f6';
  const subs=Object.entries(obj).filter(([k])=>!k.startsWith('_'));
  const total=subs.reduce((n,[,v])=>n+(Array.isArray(v)?v.length:0),0);

  const subsH=subs.map(([sub,links])=>{
    if(!Array.isArray(links))return'';
    const linksH=links.map(lnk=>{
      const key=lk(cat,sub,lnk.name);
      return `
        <div class="lrow">
          <a class="la" href="${lnk.url}" target="_blank" rel="noopener"
             onclick="addRecent('${es(cat)}','${es(sub)}','${es(lnk.name)}','${es(lnk.url)}')">
            <span class="laarr">↗</span>
            <span class="latxt">
              <span class="laname">${lnk.name}</span>
              ${lnk.desc?`<span class="ladesc">${lnk.desc}</span>`:''}
            </span>
          </a>
          <div class="lbtns">
            <button class="lbtn fav ${FAVS.has(key)?'on':''}" data-fk="${key}"
              onclick="toggleFav('${es(cat)}','${es(sub)}','${es(lnk.name)}',this)" title="Favourite">★</button>
          </div>
          <div class="lbtns lebtns">
            <button class="lbtn ed" onclick="openLinkModal('${es(cat)}','${es(sub)}','${es(lnk.name)}')" title="Edit">✏️</button>
            <button class="lbtn dl" onclick="confirmDel('link','${es(cat)}','${es(sub)}','${es(lnk.name)}')" title="Delete">🗑</button>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="sub" data-sub="${es(sub)}">
        <div class="subh" onclick="toggleSub(this)">
          <span class="spip" style="color:${color}"></span>
          <span class="sbn">${sub}</span>
          <span class="sbc">${links.length}</span>
          <div class="sbacts ec" onclick="event.stopPropagation()">
            <button class="ibtn" onclick="openSubModal('${es(cat)}','${es(sub)}')" title="Edit subcategory">✏️</button>
            <button class="ibtn del" onclick="confirmDel('sub','${es(cat)}','${es(sub)}')" title="Delete subcategory">🗑</button>
          </div>
          <span class="sbarr">▶</span>
        </div>
        <div class="sblinks">
          ${linksH}
          <button class="add-lbtn" onclick="openLinkModal('${es(cat)}','${es(sub)}',null)">➕ Add Link</button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="cat-card" id="c-${slugify(cat)}">
      <div class="cbar" style="background:${color}"></div>
      <div class="chead" onclick="toggleCat(this)">
        <div class="cico" style="background:${color}22">${icon}</div>
        <div class="cmeta">
          <div class="cname">${cat}</div>
          <div class="ccnt">${subs.length} subcategories · ${total} links</div>
        </div>
        <div class="cacts ec" onclick="event.stopPropagation()">
          <button class="ibtn" onclick="openCatModal('${es(cat)}')" title="Edit category">✏️</button>
          <button class="ibtn del" onclick="confirmDel('cat','${es(cat)}')" title="Delete category">🗑</button>
        </div>
        <span class="carrow">▶</span>
      </div>
      <div class="cbody">
        ${subsH}
        <button class="add-sbtn" onclick="openSubModal('${es(cat)}',null)">➕ Add Subcategory</button>
      </div>
    </div>`;
}

function toggleCat(h){h.parentElement.classList.toggle('open')}
function toggleSub(h){h.parentElement.classList.toggle('open')}

// ── FUZZY SEARCH ──
function lev(a,b){
  const m=a.length,n=b.length;
  const d=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)
    d[i][j]=a[i-1]===b[j-1]?d[i-1][j-1]:1+Math.min(d[i-1][j],d[i][j-1],d[i-1][j-1]);
  return d[m][n];
}
function trgrams(s){
  const str=' '+s.toLowerCase()+' ',set=new Set();
  for(let i=0;i<str.length-2;i++)set.add(str.slice(i,i+3));
  return set;
}
function trsim(a,b){
  const ta=trgrams(a),tb=trgrams(b);
  let c=0; ta.forEach(t=>{if(tb.has(t))c++;});
  return(2*c)/(ta.size+tb.size+.001);
}
function scoreLink(lnk,cat,sub,q){
  const ql=q.toLowerCase().trim();
  if(!ql)return 0;
  const fields=[lnk.name.toLowerCase(),sub.toLowerCase(),cat.toLowerCase(),(lnk.desc||'').toLowerCase(),...(lnk.keywords||[]).map(k=>k.toLowerCase())];
  // exact substring
  for(const f of fields)if(f.includes(ql))return 100+(f===ql?50:0);
  // all words
  const words=ql.split(/\s+/),allText=fields.join(' ');
  if(words.every(w=>allText.includes(w)))return 70;
  // trigram
  let maxT=0;
  for(const f of fields){
    const s=trsim(ql,f);if(s>maxT)maxT=s;
    if(f.length>ql.length+2){
      for(let i=0;i<=f.length-ql.length;i++){const s2=trsim(ql,f.slice(i,i+ql.length+3));if(s2>maxT)maxT=s2;}
    }
  }
  if(maxT>.42)return Math.round(maxT*60);
  // levenshtein
  let bestL=Infinity;
  for(const f of[lnk.name.toLowerCase(),sub.toLowerCase(),cat.toLowerCase()]){
    const d=lev(ql,f.slice(0,ql.length+3));if(d<bestL)bestL=d;
  }
  const maxD=Math.max(2,Math.floor(ql.length/3));
  if(bestL<=maxD)return Math.max(5,40-bestL*10);
  return 0;
}

let stimer;
function onSearch(val){
  clearTimeout(stimer);
  stimer=setTimeout(()=>doSearch(val.trim()),90);
  qs('.sc').classList.toggle('vis',val.length>0);
  qs('.sk').style.display=val.length>0?'none':'';
}
function clearSearch(){
  qs('#si').value='';onSearch('');qs('#si').focus();
}
function doSearch(q){
  const panel=qs('#spanel'),catg=qs('#cgrid'),qrow=qs('#qrow');
  if(!q){panel.classList.remove('on');catg.style.display='';qrow.style.display='';return;}
  catg.style.display='none';qrow.style.display='none';panel.classList.add('on');
  const res=[];
  Object.entries(DATA).forEach(([cat,obj])=>{
    Object.entries(obj).forEach(([sub,links])=>{
      if(sub.startsWith('_')||!Array.isArray(links))return;
      links.forEach(lnk=>{const score=scoreLink(lnk,cat,sub,q);if(score>0)res.push({cat,sub,lnk,score});});
    });
  });
  res.sort((a,b)=>b.score-a.score);
  qs('#spcnt').innerHTML=`<strong>${res.length}</strong> result${res.length!==1?'s':''} for "<em>${q}</em>"`;
  if(!res.length){qs('#sgrid').innerHTML=`<div class="nores" style="grid-column:1/-1"><strong>🔍</strong>No results for "${q}".<br>Try different spelling or keywords.</div>`;return;}
  qs('#sgrid').innerHTML=res.slice(0,40).map(({cat,sub,lnk,score})=>{
    const key=lk(cat,sub,lnk.name),fav=FAVS.has(key),color=DATA[cat]?._color||'#3b82f6';
    return `
      <div style="position:relative">
        <a class="src" href="${lnk.url}" target="_blank" rel="noopener"
           style="border-left:3px solid ${color}"
           onclick="addRecent('${es(cat)}','${es(sub)}','${es(lnk.name)}','${es(lnk.url)}')">
          <div class="srn">${hl(lnk.name,q)}</div>
          ${lnk.desc?`<div class="srd">${lnk.desc}</div>`:''}
          <div class="srp">${hl(cat,q)} › ${hl(sub,q)}</div>
        </a>
        <button class="srfav ${fav?'on':''}" data-fk="${key}"
          onclick="toggleFav('${es(cat)}','${es(sub)}','${es(lnk.name)}',this)" title="Favourite">★</button>
      </div>`;
  }).join('');
}
function hl(t,q){
  const i=t.toLowerCase().indexOf(q.toLowerCase());
  if(i<0)return t;
  return t.slice(0,i)+`<mark>${t.slice(i,i+q.length)}</mark>`+t.slice(i+q.length);
}

// ── CAT MODAL ──
const EMOJIS=['🏛️','🪪','🏠','🚗','🌾','💡','💻','🏥','📄','🏦','📱','🎓','⚖️','🌐','📋','🔖','🧾','💰','🛡️','📞','🌿','🔆','🆔'];
const COLORS=['#3b82f6','#22c55e','#f97316','#a78bfa','#34d399','#f472b6','#ef4444','#2dd4bf','#fbbf24','#0891b2','#e879f9','#65a30d'];
let _eCat=null;
function openCatModal(cat){
  if(!EDIT_MODE){toast('Turn on Edit mode first','warn');return;}
  _eCat=cat||null;
  const obj=cat?DATA[cat]:null;
  qs('#cm-t').textContent=cat?'Edit Category':'Add Category';
  qs('#cm-name').value=cat||'';
  qs('#cm-icon').value=obj?._icon||'📁';
  qs('#cm-eg').innerHTML=EMOJIS.map(e=>`<button class="eopt ${(obj?._icon||'📁')===e?'sel':''}" onclick="selEmoji('${e}')">${e}</button>`).join('');
  qs('#cm-cg').innerHTML=COLORS.map(c=>`<div class="clropt ${(obj?._color||'#3b82f6')===c?'sel':''}" style="background:${c}" onclick="selColor('${c}')"></div>`).join('');
  qs('#cm-cg').dataset.sel=obj?._color||'#3b82f6';
  showOv('cat-ov');
}
function selEmoji(e){qs('#cm-icon').value=e;qsa('#cm-eg .eopt').forEach(b=>b.classList.toggle('sel',b.textContent===e))}
function selColor(c){
  qsa('#cm-cg .clropt').forEach(b=>b.classList.remove('sel'));
  event.target.classList.add('sel');
  qs('#cm-cg').dataset.sel=c;
}
function saveCat(){
  const name=qs('#cm-name').value.trim(),icon=qs('#cm-icon').value.trim()||'📁',color=qs('#cm-cg').dataset.sel||'#3b82f6';
  if(!name){toast('Category name required','err');return;}
  if(_eCat&&_eCat!==name){
    const nd={};
    Object.keys(DATA).forEach(k=>{nd[k===_eCat?name:k]=k===_eCat?{...DATA[k],_icon:icon,_color:color}:DATA[k];});
    DATA=nd;
    FAVS=new Set([...FAVS].map(k=>k.startsWith(_eCat+'||')?name+'||'+k.slice(_eCat.length+2):k));
    RECENT=RECENT.map(r=>r.cat===_eCat?{...r,cat:name,key:lk(name,r.sub,r.name)}:r);
  } else if(_eCat){
    DATA[_eCat]._icon=icon;DATA[_eCat]._color=color;
  } else {
    if(DATA[name]){toast('Category already exists','err');return;}
    DATA[name]={_icon:icon,_color:color};
  }
  save();closeOv('cat-ov');renderAll();toast(_eCat?'✅ Category updated':'✅ Category added','ok');
}

// ── SUB MODAL ──
let _eSCat=null,_eSub=null;
function openSubModal(cat,sub){
  if(!EDIT_MODE){toast('Turn on Edit mode first','warn');return;}
  _eSCat=cat;_eSub=sub;
  qs('#sm-t').textContent=sub?'Edit Subcategory':'Add Subcategory';
  qs('#sm-cl').textContent=cat;
  qs('#sm-name').value=sub||'';
  showOv('sub-ov');
}
function saveSub(){
  const name=qs('#sm-name').value.trim();
  if(!name){toast('Subcategory name required','err');return;}
  if(_eSub&&_eSub!==name){
    const co=DATA[_eSCat],nco={};
    Object.entries(co).forEach(([k,v])=>{nco[k===_eSub?name:k]=v;});
    DATA[_eSCat]=nco;
    FAVS=new Set([...FAVS].map(k=>k===lk(_eSCat,_eSub,k.split('||')[2])?lk(_eSCat,name,k.split('||')[2]):k));
    RECENT=RECENT.map(r=>(r.cat===_eSCat&&r.sub===_eSub)?{...r,sub:name,key:lk(_eSCat,name,r.name)}:r);
  } else if(!_eSub){
    if(DATA[_eSCat][name]){toast('Subcategory already exists','err');return;}
    DATA[_eSCat][name]=[];
  }
  save();closeOv('sub-ov');renderAll();toast(_eSub?'✅ Subcategory updated':'✅ Subcategory added','ok');
  setTimeout(()=>{const c=qs(`#c-${slugify(_eSCat)}`);if(c)c.classList.add('open');},80);
}

// ── LINK MODAL ──
let _lCat,_lSub,_lName;
function openLinkModal(cat,sub,name){
  if(!EDIT_MODE){toast('Turn on Edit mode first','warn');return;}
  _lCat=cat;_lSub=sub;_lName=name;
  qs('#lm-t').textContent=name?'Edit Link':'Add Link';
  qs('#lm-loc').textContent=`${cat} › ${sub}`;
  const lnk=name?(DATA[cat]?.[sub]||[]).find(l=>l.name===name):null;
  qs('#lm-name').value=lnk?.name||'';
  qs('#lm-url').value=lnk?.url||'';
  qs('#lm-desc').value=lnk?.desc||'';
  qs('#lm-kw').value=(lnk?.keywords||[]).join(', ');
  showOv('lnk-ov');
}
function saveLink(){
  const name=qs('#lm-name').value.trim(),url=qs('#lm-url').value.trim(),
        desc=qs('#lm-desc').value.trim(),kw=qs('#lm-kw').value.trim();
  if(!name){toast('Name required','err');return;}
  if(!url){toast('URL required','err');return;}
  if(!/^https?:\/\//i.test(url)){toast('URL must start with https://','warn');return;}
  const keywords=kw?kw.split(',').map(s=>s.trim()).filter(Boolean):[];
  const nl={name,url,desc,keywords};
  const arr=DATA[_lCat][_lSub];
  if(_lName){
    const idx=arr.findIndex(l=>l.name===_lName);
    if(idx>=0){
      arr[idx]=nl;
      if(_lName!==name){
        const ok=lk(_lCat,_lSub,_lName),nk=lk(_lCat,_lSub,name);
        if(FAVS.has(ok)){FAVS.delete(ok);FAVS.add(nk);}
        RECENT=RECENT.map(r=>r.key===ok?{...r,name,key:nk}:r);
      }
    }
  } else { arr.push(nl); }
  save();closeOv('lnk-ov');renderAll();toast(_lName?'✅ Link updated':'✅ Link added','ok');
  setTimeout(()=>{
    const c=qs(`#c-${slugify(_lCat)}`);
    if(c){c.classList.add('open');const s=c.querySelector(`[data-sub="${_lSub}"]`);if(s)s.classList.add('open');}
  },80);
}

// ── DELETE ──
let _dt,_da,_db,_dc;
function confirmDel(type,a,b,c){
  if(!EDIT_MODE){toast('Turn on Edit mode first','warn');return;}
  _dt=type;_da=a;_db=b;_dc=c;
  qs('#del-msg').innerHTML={
    cat:`Delete category "<strong>${a}</strong>" and ALL its subcategories and links?`,
    sub:`Delete subcategory "<strong>${b}</strong>" and all its links?`,
    link:`Delete link "<strong>${c}</strong>"?`
  }[type];
  showOv('del-ov');
}
function doDel(){
  if(_dt==='cat'){
    FAVS=new Set([...FAVS].filter(k=>!k.startsWith(_da+'||')));
    RECENT=RECENT.filter(r=>r.cat!==_da);delete DATA[_da];
  } else if(_dt==='sub'){
    FAVS=new Set([...FAVS].filter(k=>!k.startsWith(lk(_da,_db,''))));
    RECENT=RECENT.filter(r=>!(r.cat===_da&&r.sub===_db));delete DATA[_da][_db];
  } else {
    const key=lk(_da,_db,_dc);FAVS.delete(key);
    RECENT=RECENT.filter(r=>r.key!==key);
    DATA[_da][_db]=DATA[_da][_db].filter(l=>l.name!==_dc);
  }
  save();closeOv('del-ov');renderAll();toast('🗑 Deleted','warn');
}

// ── JSON EDITOR ──
function openJson(){
  qs('#json-ta').value=JSON.stringify(DATA,null,2);showOv('json-ov');
}
function saveJson(){
  try{DATA=JSON.parse(qs('#json-ta').value);save();closeOv('json-ov');renderAll();toast('✅ JSON saved','ok');}
  catch(e){toast('❌ Invalid JSON: '+e.message,'err');}
}
function exportJson(){
  const b=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='csc-services.json';a.click();
  toast('📥 Exported','info');
}
function importJson(){
  const i=document.createElement('input');i.type='file';i.accept='.json';
  i.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{try{DATA=JSON.parse(ev.target.result);save();renderAll();closeOv('json-ov');toast('✅ Imported','ok');}catch{toast('❌ Invalid JSON','err');}};
    r.readAsText(f);
  };i.click();
}
function resetData(){
  if(!confirm('Reset ALL data to defaults?'))return;
  DATA=JSON.parse(JSON.stringify(DEFAULT_DATA));FAVS=new Set();RECENT=[];
  save();renderAll();closeOv('json-ov');toast('↩️ Reset to defaults','warn');
}

// ── OVERLAY ──
function showOv(id){qs('#'+id).classList.add('on')}
function closeOv(id){qs('#'+id).classList.remove('on')}

// ── TOAST ──
function toast(msg,type='info'){
  const w=qs('#twrap'),el=document.createElement('div');
  el.className=`toast ${type}`;el.textContent=msg;w.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')));
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),300);},2800);
}

// ── GLOBAL ──
function bindGlobal(){
  qs('#si').addEventListener('input',e=>onSearch(e.target.value));
  qsa('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('on');}));
  document.addEventListener('keydown',e=>{
    const ov=qs('.ov.on');
    if(e.key==='Escape'){if(ov){ov.classList.remove('on');return;}if(qs('#si').value){clearSearch();return;}}
    if(e.key==='/'&&document.activeElement!==qs('#si')&&!ov){e.preventDefault();qs('#si').focus();}
  });
}

// ── UTILS ──
function qs(s){return document.querySelector(s)}
function qsa(s){return document.querySelectorAll(s)}
function es(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;')}
function lk(c,s,n){return`${c}||${s}||${n}`}
function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]/g,'-')}

document.addEventListener('DOMContentLoaded',boot);
