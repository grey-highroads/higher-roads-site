const stage=document.querySelector('#stage'),hotspots=[...document.querySelectorAll('.hotspot')],nav=[...document.querySelectorAll('.machine-nav button')],panelEyebrow=document.querySelector('#panel-eyebrow'),panelTitle=document.querySelector('#panel-title'),panelSummary=document.querySelector('#panel-summary'),whatEnters=document.querySelector('#what-enters'),whatHappens=document.querySelector('#what-happens'),whatComesOut=document.querySelector('#what-comes-out'),chipList=document.querySelector('#chip-list'),repoPaths=document.querySelector('#repo-paths'),saveButton=document.querySelector('#save-concept'),copyCurrentButton=document.querySelector('#copy-current'),savedDrawer=document.querySelector('#saved-drawer'),savedList=document.querySelector('#saved-list'),savedCount=document.querySelector('#saved-count'),copySavedButton=document.querySelector('#copy-saved'),clearSavedButton=document.querySelector('#clear-saved'),toast=document.querySelector('.toast');const glow={overview:['50%','50%'],produce:['16%','37%'],package:['49%','38%'],publish:['78%','42%'],prove:['29%','77%'],preserve:['62%','75%']};const overview={id:'overview',label:'Overview',machineName:'Choose a machine',eyebrow:'Factory overview',summary:'The factory map is the overview. Each machine opens a focused scene and a reusable concept card.',whatEnters:'Raw expert conversations and source media.',whatHappens:'The factory turns source material into owned media assets.',whatComesOut:'Published assets, measured results, and reusable memory.',bullets:['Factory map','Scene switching','Reusable cards','Saved concept tray'],repoPaths:['Owned Media Index']};let concepts={},active=overview,saved=[];function t(m){toast.textContent=m;toast.classList.add('is-visible');clearTimeout(t.timer);t.timer=setTimeout(()=>toast.classList.remove('is-visible'),1800)}function setBtns(id){nav.forEach(b=>b.classList.toggle('is-active',b.dataset.concept===id));hotspots.forEach(h=>h.classList.toggle('is-active',h.dataset.concept===id))}function render(c){active=c;stage.dataset.scene=c.id;setBtns(c.id);let g=glow[c.id]||glow.overview;stage.style.setProperty('--glow-x',g[0]);stage.style.setProperty('--glow-y',g[1]);panelEyebrow.textContent=c.eyebrow;panelTitle.textContent=c.machineName;panelSummary.textContent=c.summary;whatEnters.textContent=c.whatEnters;whatHappens.textContent=c.whatHappens;whatComesOut.textContent=c.whatComesOut;chipList.innerHTML=(c.bullets||[]).map(x=>`<li>${x}</li>`).join('');repoPaths.innerHTML=(c.repoPaths||[]).map(x=>`<li>${x}</li>`).join('');saveButton.disabled=c.id==='overview';copyCurrentButton.disabled=c.id==='overview'}function toText(c){return `${c.label}: ${c.machineName}

Summary:
${c.summary}

What enters:
${c.whatEnters}

What happens:
${c.whatHappens}

What comes out:
${c.whatComesOut}

Key parts:
${(c.bullets||[]).map(x=>'- '+x).join('
')}

Repo basis:
${(c.repoPaths||[]).map(x=>'- '+x).join('
')}`}async function copy(text,msg){try{await navigator.clipboard.writeText(text);t(msg)}catch(e){t('Copy failed. Select text from the panel instead.')}}function save(){if(active.id==='overview')return;if(!saved.some(x=>x.id===active.id)){saved.push(active);drawSaved();t(`${active.label} saved to concept tray.`)}else t(`${active.label} already saved.`);savedDrawer.classList.add('is-open')}function drawSaved(){savedCount.textContent=String(saved.length);savedList.innerHTML=saved.map(x=>`<li>${x.label}: ${x.machineName}</li>`).join('')}function show(id){if(id==='overview'){render(overview);return} if(concepts[id])render(concepts[id]);else t('Concept not found.')}async function load(){try{let r=await fetch('content/concepts.json',{cache:'no-store'});concepts=await r.json();t('Concept content loaded.')}catch(e){t('Concept content failed to load.')}render(overview)}hotspots.forEach(h=>h.addEventListener('click',()=>show(h.dataset.concept)));nav.forEach(b=>b.addEventListener('click',()=>show(b.dataset.concept)));saveButton.addEventListener('click',save);copyCurrentButton.addEventListener('click',()=>copy(toText(active),'Concept card copied.'));copySavedButton.addEventListener('click',()=>{if(!saved.length){t('Save at least one concept first.');return}copy('Riggg Factory Saved Concepts

'+saved.map(toText).join('

---

'),'Saved brief copied.')});clearSavedButton.addEventListener('click',()=>{saved=[];drawSaved();t('Saved tray cleared.')});drawSaved();load();