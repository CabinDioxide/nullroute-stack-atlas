"use strict";
/* Stack Atlas runtime. Zero dependencies. World paths are pre-projected
 * (build/build-world.mjs); this file wires the dual-map bidirectional highlight
 * and the evidence-honest detail panel. */

const D = window.ATLAS_DATA;
const PATHS = window.WORLD_PATHS || {};
const NAMES = window.WORLD_NAMES || {};
const CENTROIDS = window.WORLD_CENTROIDS || {};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

const VIEW_MODES = [
  { id: "map", label: "Map" },
  { id: "transmission", label: "Transmission" },
  { id: "evidence", label: "Evidence" },
  { id: "brief", label: "Brief" }
];
let activeViewMode = "map";

// ---- indices ----
const countryByCode = new Map(D.countries.map(c => [c.code, c]));
const countryByNum  = new Map(D.countries.map(c => [c.num, c]));
const nodeById = new Map();
const stackByNode = new Map();
D.stacks.forEach(stk => stk.nodes.forEach(n => { nodeById.set(n.id, n); stackByNode.set(n.id, stk); }));
const politicalNodeById = new Map();
const politicalStackByNode = new Map();
(D.politicalStacks || []).forEach(stk => stk.nodes.forEach(n => { politicalNodeById.set(n.id, n); politicalStackByNode.set(n.id, stk); }));
const companyById = new Map(D.companies.map(c => [c.id, c]));
const chokeById = new Map(D.chokepoints.map(c => [c.id, c]));

function countryCentroid(code){
  const c = countryByCode.get(code);
  if (c && c.centroidOverride) return c.centroidOverride;
  return CENTROIDS[c && c.num] || null;
}

// ---- render world map ----
const gCountries = document.getElementById("layer-countries");
const gChoke = document.getElementById("layer-chokepoints");
const gCompanies = document.getElementById("layer-companies");
const gLabels = document.getElementById("layer-labels");
const gLinks = document.getElementById("layer-links");
const worldSvg = document.getElementById("world");
const mapViewport = document.getElementById("map-viewport");
const SVGNS = "http://www.w3.org/2000/svg";
function svg(tag, attrs){ const e = document.createElementNS(SVGNS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); return e; }

// ---- map zoom + pan (pure SVG <g> transform, zero deps) ----
// The five map layers live inside #map-viewport; we translate+scale that group.
// Markers/labels/links get an inverse-scale size compensation so they stay
// readable (not ballooning or vanishing) across the 1x-8x range.
const mapViewBox = { w: 1000, h: 500 };
const zoomState = { scale: 1, x: 0, y: 0 };
const zoomLimits = { min: 1, max: 8 };
let panState = null;
let suppressNextMapClick = false;

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function clampPan(){
  // keep the scaled map covering the viewBox so it can't be dragged into the void
  const minX = mapViewBox.w * (1 - zoomState.scale);
  const minY = mapViewBox.h * (1 - zoomState.scale);
  zoomState.x = clamp(zoomState.x, minX, 0);
  zoomState.y = clamp(zoomState.y, minY, 0);
}
function svgPointFromEvent(e){
  const pt = worldSvg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const ctm = worldSvg.getScreenCTM();
  return ctm ? pt.matrixTransform(ctm.inverse()) : { x: mapViewBox.w/2, y: mapViewBox.h/2 };
}
function applyMapScaleCompensation(){
  const inv = 1 / zoomState.scale;
  gChoke.querySelectorAll(".choke").forEach(g => {
    const on = g.classList.contains("hl");
    const circle = g.querySelector("circle"), text = g.querySelector("text");
    if (circle){ circle.style.r = `${(on?7:5)*inv}px`; circle.style.strokeWidth = `${1*inv}px`; }
    if (text){ text.style.fontSize = `${9*inv}px`; text.style.strokeWidth = `${2*inv}px`; }
  });
  gCompanies.querySelectorAll(".company").forEach(g => {
    const on = g.classList.contains("hl");
    const circle = g.querySelector("circle"), text = g.querySelector("text");
    if (circle){ circle.style.r = `${(on?6:4)*inv}px`; circle.style.strokeWidth = `${1*inv}px`; }
    if (text){ text.style.fontSize = `${8.5*inv}px`; text.style.strokeWidth = `${2*inv}px`; }
  });
  gLabels.querySelectorAll(".clabel").forEach(t => { t.style.fontSize = `${9*inv}px`; t.style.strokeWidth = `${2.4*inv}px`; });
  gLabels.querySelectorAll(".cmarker-dot").forEach(dot => { dot.style.strokeWidth = `${1*inv}px`; });
  gLinks.querySelectorAll(".dep-link").forEach(p => { p.style.strokeWidth = `${1.4*inv}px`; });
}
function applyMapTransform(){
  clampPan();
  mapViewport.setAttribute("transform", `translate(${zoomState.x} ${zoomState.y}) scale(${zoomState.scale})`);
  applyMapScaleCompensation();
}
function zoomAt(point, nextScale){
  const oldScale = zoomState.scale;
  nextScale = clamp(nextScale, zoomLimits.min, zoomLimits.max);
  if (nextScale === oldScale) return;
  // keep the world point under the cursor fixed (zoom-to-cursor)
  const worldX = (point.x - zoomState.x) / oldScale;
  const worldY = (point.y - zoomState.y) / oldScale;
  zoomState.scale = nextScale;
  zoomState.x = point.x - worldX * nextScale;
  zoomState.y = point.y - worldY * nextScale;
  applyMapTransform();
}
function resetMapView(){ zoomState.scale = 1; zoomState.x = 0; zoomState.y = 0; applyMapTransform(); }

worldSvg.addEventListener("wheel", e => {
  e.preventDefault(); e.stopPropagation();
  zoomAt(svgPointFromEvent(e), zoomState.scale * Math.exp(-e.deltaY * 0.0012));
}, { passive:false });

worldSvg.addEventListener("pointerdown", e => {
  if (e.button !== 0) return;
  // Interactive map features own their click. Starting pan capture on top of
  // them swallows the later click event, making countries/labels feel dead.
  if (e.target.closest(".country.target,.country-marker,.clabel,.choke,.company")) return;
  panState = { pointerId:e.pointerId, last:svgPointFromEvent(e), startClientX:e.clientX, startClientY:e.clientY, totalDx:0, totalDy:0 };
  worldSvg.setPointerCapture(e.pointerId);
  worldSvg.classList.add("panning");
});
worldSvg.addEventListener("pointermove", e => {
  if (!panState || panState.pointerId !== e.pointerId) return;
  const point = svgPointFromEvent(e);
  zoomState.x += point.x - panState.last.x;
  zoomState.y += point.y - panState.last.y;
  panState.last = point;
  panState.totalDx = e.clientX - panState.startClientX;
  panState.totalDy = e.clientY - panState.startClientY;
  applyMapTransform();
});
worldSvg.addEventListener("pointerup", e => {
  if (!panState || panState.pointerId !== e.pointerId) return;
  const dragged = Math.hypot(panState.totalDx, panState.totalDy) > 4;
  panState = null;
  worldSvg.classList.remove("panning");
  worldSvg.releasePointerCapture(e.pointerId);
  if (dragged){ // a real pan -> swallow the click that follows so we don't select a country
    suppressNextMapClick = true;
    setTimeout(() => { suppressNextMapClick = false; }, 0);
  }
});
worldSvg.addEventListener("pointercancel", e => {
  if (panState && panState.pointerId === e.pointerId){ panState = null; worldSvg.classList.remove("panning"); }
});
worldSvg.addEventListener("click", e => {
  if (!suppressNextMapClick) return;
  e.preventDefault(); e.stopImmediatePropagation();
  suppressNextMapClick = false;
}, true);

document.querySelectorAll("[data-map-zoom]").forEach(button => {
  button.addEventListener("click", e => {
    e.stopPropagation();
    const action = button.getAttribute("data-map-zoom");
    const center = { x: mapViewBox.w/2, y: mapViewBox.h/2 };
    if (action === "in") zoomAt(center, zoomState.scale * 1.35);
    else if (action === "out") zoomAt(center, zoomState.scale / 1.35);
    else resetMapView();
  });
});

// base countries (all), our 13 are targets
Object.keys(PATHS).forEach(num => {
  const p = svg("path", { d: PATHS[num], class: "country", "data-num": num });
  const c = countryByNum.get(num);
  if (c){ p.classList.add("target"); p.setAttribute("data-code", c.code);
    p.addEventListener("click", e => { e.stopPropagation(); selectCountry(c.code); }); }
  gCountries.appendChild(p);
});

// chokepoints
D.chokepoints.forEach(cp => {
  const g = svg("g", { class:"choke", "data-choke": cp.id });
  g.appendChild(svg("circle", { cx: cp.pos[0], cy: cp.pos[1] }));
  const t = svg("text", { x: cp.pos[0]+7, y: cp.pos[1]+3 }); t.textContent = cp.name_en;
  g.appendChild(t);
  g.addEventListener("click", e => { e.stopPropagation(); selectChokepoint(cp.id); });
  gChoke.appendChild(g);
});

// company markers, spread around their country's centroid when several share one
const byCountry = {};
D.companies.forEach(co => { (byCountry[co.country] = byCountry[co.country] || []).push(co); });
const companyPos = new Map();
Object.entries(byCountry).forEach(([code, list]) => {
  const ctr = countryCentroid(code) || [500,250];
  list.forEach((co, i) => {
    const ang = (i / Math.max(1,list.length)) * Math.PI * 2;
    const r = list.length === 1 ? 0 : 14;
    const x = ctr[0] + Math.cos(ang)*r, y = ctr[1] + Math.sin(ang)*r;
    companyPos.set(co.id, [x,y]);
    const g = svg("g", { class:"company", "data-company": co.id });
    g.appendChild(svg("circle", { cx:x, cy:y }));
    const t = svg("text", { x:x+6, y:y+3 }); t.textContent = co.name;
    g.appendChild(t);
    g.addEventListener("click", e => { e.stopPropagation(); selectCompany(co.id); });
    gCompanies.appendChild(g);
  });
});

// country labels + fallback markers for countries with no rendered polygon
// (e.g. Singapore, too small for Natural Earth 110m) so every target country
// is directly clickable on the map, not only via the detail panel.
D.countries.forEach(c => {
  const ctr = countryCentroid(c.code); if(!ctr) return;
  const hasPolygon = PATHS[c.num] && PATHS[c.num].length > 3;
  if (!hasPolygon){
    const g = svg("g", { class:"country-marker", "data-code": c.code, style:"cursor:pointer" });
    const dot = svg("rect", { x: ctr[0]-4, y: ctr[1]-4, width:8, height:8, transform:`rotate(45 ${ctr[0]} ${ctr[1]})`,
      fill:"#33405a", stroke:"#5a6b8c", "stroke-width":1 });
    dot.setAttribute("class","cmarker-dot");
    g.appendChild(dot);
    g.addEventListener("click", e => { e.stopPropagation(); selectCountry(c.code); });
    gLabels.appendChild(g);
  }
  const t = svg("text", { class:"clabel", "data-code": c.code, x: ctr[0], y: ctr[1]-16, "text-anchor":"middle" });
  t.textContent = c.code;
  t.addEventListener("click", e => { e.stopPropagation(); selectCountry(c.code); });
  gLabels.appendChild(t);
});

// ---- render stack map ----
const stackGrid = document.getElementById("stack-grid");
const stackControls = document.getElementById("stack-controls");
const politicalGrid = document.getElementById("political-grid");
const politicalControls = document.getElementById("political-controls");
let activeStack = D.stacks[0].id;
D.stacks.forEach(stk => {
  const b = document.createElement("button");
  b.textContent = stk.name_zh + " / " + stk.name_en;
  b.dataset.stack = stk.id;
  b.addEventListener("click", () => { activeStack = stk.id; renderStack(); });
  stackControls.appendChild(b);
});
function renderStack(){
  [...stackControls.children].forEach(b => b.classList.toggle("active", b.dataset.stack === activeStack));
  const stk = D.stacks.find(s => s.id === activeStack);
  stackGrid.innerHTML = "";
  D.layers.forEach(layer => {
    const nodes = stk.nodes.filter(n => n.layer === layer.id);
    if (!nodes.length) return;
    const row = document.createElement("div"); row.className = `layer-row tech-stack-${stk.id} tech-layer-${layer.id}`;
    row.dataset.stackKind = stk.id;
    row.dataset.layer = layer.id;
    row.innerHTML = `<div class="layer-name">${esc(layer.label_zh)} · ${esc(layer.label_en)}</div>`;
    const nr = document.createElement("div"); nr.className = "node-row";
    nodes.forEach(n => {
      const el = document.createElement("div");
      el.className = `node s-${n.status} tech-stack-${stk.id} tech-layer-${n.layer}`; el.dataset.node = n.id;
      el.dataset.stackKind = stk.id;
      el.dataset.layer = n.layer;
      el.innerHTML = `<span class="nlabel">${esc(n.label_zh)}</span>
        <span class="nmeta"><span class="chip st-${n.status}">${esc(n.status)}</span><span class="ev ev-${n.evidence}">${esc(n.evidence)}</span>${magnitudeNodeBadge(n.id)}</span>`;
      el.addEventListener("click", e => { e.stopPropagation(); selectNode(n.id); });
      nr.appendChild(el);
    });
    row.appendChild(nr); stackGrid.appendChild(row);
  });
  applyHighlight(); // keep current highlight after re-render
}

let activePoliticalStack = D.politicalStacks?.[0]?.id || "";
(D.politicalStacks || []).forEach(stk => {
  const b = document.createElement("button");
  b.textContent = stk.name_zh + " / " + stk.name_en;
  b.dataset.politicalStack = stk.id;
  b.addEventListener("click", () => { activePoliticalStack = stk.id; renderPoliticalStack(); });
  politicalControls?.appendChild(b);
});

function renderPoliticalStack(){
  if (!politicalGrid || !D.politicalStacks?.length) return;
  [...politicalControls.children].forEach(b => b.classList.toggle("active", b.dataset.politicalStack === activePoliticalStack));
  const stk = D.politicalStacks.find(s => s.id === activePoliticalStack);
  politicalGrid.innerHTML = "";
  D.politicalLayers.forEach(layer => {
    const nodes = stk.nodes.filter(n => n.layer === layer.id);
    if (!nodes.length) return;
    const row = document.createElement("div"); row.className = `player-row pol-layer-${layer.id}`;
    row.dataset.layer = layer.id;
    row.innerHTML = `<div class="player-name">${esc(layer.label_zh)} · ${esc(layer.label_en)}</div>`;
    const nr = document.createElement("div"); nr.className = "pnode-row";
    nodes.forEach(n => {
      const el = document.createElement("div");
      el.className = `pnode s-${n.status} pol-layer-${n.layer}`; el.dataset.pnode = n.id;
      el.dataset.layer = n.layer;
      el.innerHTML = `<span class="nlabel">${esc(n.label_zh)}</span>
        <span class="nmeta"><span class="chip st-${n.status}">${esc(n.status)}</span><span class="ev ev-${n.evidence}">${esc(n.evidence)}</span></span>`;
      el.addEventListener("click", e => { e.stopPropagation(); selectPoliticalNode(n.id); });
      nr.appendChild(el);
    });
    row.appendChild(nr); politicalGrid.appendChild(row);
  });
  applyHighlight();
}

// ---- legend ----
document.getElementById("legend").innerHTML =
  D.statusVocab.map(s => `<span class="chip st-${s}">${esc(s)}</span>`).join("");

// ---- Magnitude layer controls ----
let magnitudeEnabled = true;
let magnitudeFilter = "all";
const MAG_FILTERS = [
  { id: "all", label: "all" },
  { id: "oil", label: "oil", families: ["seaborne_oil_flow / oil_chokepoint_share"] },
  { id: "gates", label: "gates", families: ["export_control_listings", "financial_sanctions_listings", "export_control_exposure", "internet_facility_inventory"] },
  { id: "minerals", label: "minerals", families: ["minerals_net_import_reliance / minerals_supplier_country_share", "mineral_refining_share"] },
  { id: "cables", label: "cables", families: ["cable_route_count"] },
  { id: "chips", label: "chips", families: ["material_global_share", "ic_substrate_capacity", "euv_installed_base", "hbm_share_of_dram_revenue / memory_maker_revenue"] },
  { id: "blocked", label: "blocked", matcher: c => ["blocked", "source-linked"].includes(c.evidence_status) || (c.gaps || []).some(g => ["blocked", "needs-api-key", "needs-extraction", "lead-only", "source-limited"].includes(g.status)) }
];

// ---- highlight engine ----
let current = null; // {type, id}
let HL = { countries:new Set(), nodes:new Set(), politicalNodes:new Set(), companies:new Set(), chokepoints:new Set() };

function emptyHL(){ return { countries:new Set(), nodes:new Set(), politicalNodes:new Set(), companies:new Set(), chokepoints:new Set() }; }

function hlFromNode(id, hl){
  const n = nodeById.get(id); if(!n) return;
  const seen = hl.nodes.has(id);
  hl.nodes.add(id);
  (n.countries||[]).forEach(c => hl.countries.add(c));
  (n.companies||[]).forEach(c => { hl.companies.add(c); const co=companyById.get(c); if(co) hl.countries.add(co.country); });
  (n.chokepoints||[]).forEach(c => hl.chokepoints.add(c));
  if (seen) return;
  politicalNodeById.forEach((pn, pid) => { if ((pn.techNodes || []).includes(id)) hlFromPoliticalNode(pid, hl); });
}
function hlFromPoliticalNode(id, hl){
  const n = politicalNodeById.get(id); if(!n) return;
  const seen = hl.politicalNodes.has(id);
  hl.politicalNodes.add(id);
  (n.countries||[]).forEach(c => hl.countries.add(c));
  (n.companies||[]).forEach(c => { hl.companies.add(c); const co=companyById.get(c); if(co) hl.countries.add(co.country); });
  (n.chokepoints||[]).forEach(c => hl.chokepoints.add(c));
  if (seen) return;
  (n.techNodes||[]).forEach(t => { if (nodeById.has(t)) hlFromNode(t, hl); });
}
function buildHighlight(type, id){
  const hl = emptyHL();
  if (type === "country"){
    hl.countries.add(id);
    nodeById.forEach((n,nid) => { if((n.countries||[]).includes(id)) hlFromNode(nid, hl); });
    politicalNodeById.forEach((n,nid) => { if((n.countries||[]).includes(id)) hlFromPoliticalNode(nid, hl); });
    companyById.forEach((co,cid) => { if(co.country===id) hl.companies.add(cid); });
    chokeById.forEach((cp,cid) => { if((cp.affectsCountries||[]).includes(id)) hl.chokepoints.add(cid); });
  } else if (type === "node"){
    hlFromNode(id, hl);
  } else if (type === "polnode"){
    hlFromPoliticalNode(id, hl);
  } else if (type === "chokepoint"){
    const cp = chokeById.get(id); if(cp){ hl.chokepoints.add(id);
      (cp.affectsCountries||[]).forEach(c => hl.countries.add(c));
      nodeById.forEach((n,nid) => { if((n.chokepoints||[]).includes(id)) hlFromNode(nid, hl); });
      politicalNodeById.forEach((n,nid) => { if((n.chokepoints||[]).includes(id)) hlFromPoliticalNode(nid, hl); }); }
  } else if (type === "company"){
    const co = companyById.get(id); if(co){ hl.companies.add(id); hl.countries.add(co.country);
      nodeById.forEach((n,nid) => { if((n.companies||[]).includes(id)) hlFromNode(nid, hl); });
      politicalNodeById.forEach((n,nid) => { if((n.companies||[]).includes(id)) hlFromPoliticalNode(nid, hl); }); }
  } else if (type === "alert"){
    const a = D.candidateAlerts.find(x => x.id === id); if(a){
      (a.relNodes||[]).forEach(nid => hlFromNode(nid, hl));
      (a.relCountries||[]).forEach(c => hl.countries.add(c));
      (a.relCompanies||[]).forEach(c => hl.companies.add(c));
      (a.relChokepoints||[]).forEach(c => hl.chokepoints.add(c));
    }
  }
  return hl;
}

function applyHighlight(){
  const any = HL.countries.size || HL.nodes.size || HL.politicalNodes.size || HL.companies.size || HL.chokepoints.size;
  // countries
  gCountries.querySelectorAll(".country.target").forEach(p => {
    const code = p.getAttribute("data-code");
    const hasMag = magCandidatesFor("country", code).length > 0;
    p.classList.toggle("hl", HL.countries.has(code));
    p.classList.toggle("mag-on", hasMag);
    p.classList.toggle("dim", any && !HL.countries.has(code));
  });
  gLabels.querySelectorAll(".clabel").forEach(t => {
    const code = t.getAttribute("data-code");
    t.classList.toggle("hl", HL.countries.has(code));
    t.classList.toggle("mag-on", magCandidatesFor("country", code).length > 0);
  });
  gLabels.querySelectorAll(".country-marker").forEach(g => {
    const code = g.getAttribute("data-code");
    const on = HL.countries.has(code);
    const hasMag = magCandidatesFor("country", code).length > 0;
    g.classList.toggle("mag-on", hasMag);
    g.querySelector(".cmarker-dot").setAttribute("fill", on ? "var(--hl)" : "#33405a");
    g.style.opacity = (any && !on) ? .35 : 1;
  });
  gChoke.querySelectorAll(".choke").forEach(g => {
    const id = g.getAttribute("data-choke");
    const hasMag = magCandidatesFor("chokepoint", id).length > 0;
    g.classList.toggle("hl", HL.chokepoints.has(id));
    g.classList.toggle("mag-on", hasMag);
    g.style.opacity = (any && !HL.chokepoints.has(id)) ? .35 : 1;
  });
  gCompanies.querySelectorAll(".company").forEach(g => {
    const id = g.getAttribute("data-company");
    g.classList.toggle("hl", HL.companies.has(id));
    g.style.opacity = (any && !HL.companies.has(id)) ? .3 : 1;
  });
  // nodes (only those rendered in active stack)
  stackGrid.querySelectorAll(".node").forEach(el => {
    const id = el.dataset.node;
    el.classList.toggle("hl", HL.nodes.has(id));
    el.classList.toggle("dim", any && !HL.nodes.has(id));
  });
  politicalGrid?.querySelectorAll(".pnode").forEach(el => {
    const id = el.dataset.pnode;
    el.classList.toggle("hl", HL.politicalNodes.has(id));
    el.classList.toggle("dim", any && !HL.politicalNodes.has(id));
  });
  // dependency links: from selected country/node centroids to highlighted countries
  drawLinks();
  applyMapScaleCompensation(); // re-applied because highlight changes marker radii + links
}

function drawLinks(){
  gLinks.innerHTML = "";
  if (!current) return;
  let origin = null;
  if (current.type === "country") origin = countryCentroid(current.id);
  else if (current.type === "node"){ const n = nodeById.get(current.id); origin = nodeMapOrigin(n); }
  else if (current.type === "chokepoint"){ const cp = chokeById.get(current.id); origin = cp && cp.pos; }
  else if (current.type === "company"){ origin = companyPos.get(current.id); }
  else if (current.type === "polnode"){ const pn = politicalNodeById.get(current.id); origin = countryCentroid((pn?.countries || [])[0]); }
  if (!origin) return;
  HL.countries.forEach(code => {
    if (current.type === "country" && code === current.id) return;
    const c = countryCentroid(code); if(!c) return;
    if (current.type === "node" && Math.abs(c[0] - origin[0]) < 0.1 && Math.abs(c[1] - origin[1]) < 0.1) return;
    const path = svg("path", { class:`dep-link ${relationshipLineClass()}`, d:`M${origin[0]},${origin[1]} Q${(origin[0]+c[0])/2},${Math.min(origin[1],c[1])-30} ${c[0]},${c[1]}` });
    gLinks.appendChild(path);
  });
}

function nodeMapOrigin(n){
  if (!n) return null;
  const company = (n.companies || []).map(id => companyPos.get(id)).find(Boolean);
  if (company) return company;
  const choke = (n.chokepoints || []).map(id => chokeById.get(id)?.pos).find(Boolean);
  if (choke) return choke;
  const country = (n.countries || []).map(countryCentroid).find(Boolean);
  return country || null;
}

function relationshipLineClass(){
  if (!current) return "rel-mixed";
  if (current.type === "node") {
    const stk = stackByNode.get(current.id);
    return stk ? `rel-tech rel-${stk.id}` : "rel-tech";
  }
  if (current.type === "polnode") {
    const n = politicalNodeById.get(current.id);
    return n ? `rel-political rel-${n.layer}` : "rel-political";
  }
  if (current.type === "chokepoint") return "rel-physical";
  return "rel-mixed";
}

// ---- selection + detail ----
function select(type, id, opts = {}){
  if (!opts.keepGuide) { activeGuide = null; renderGuidedPaths(); }
  activeOverlap = null; renderOverlapLab();
  current = { type, id };
  HL = buildHighlight(type, id);
  // if a node is selected, switch active stack to its stack so it's visible
  if (type === "node"){ const stk = stackByNode.get(id); if(stk && stk.id !== activeStack){ activeStack = stk.id; renderStack(); } }
  if (type === "polnode"){ const stk = politicalStackByNode.get(id); if(stk && stk.id !== activePoliticalStack){ activePoliticalStack = stk.id; renderPoliticalStack(); } }
  applyHighlight();
  renderDetail(type, id);
}
const selectCountry = id => select("country", id);
const selectNode = id => select("node", id);
const selectPoliticalNode = id => select("polnode", id);
const selectChokepoint = id => select("chokepoint", id);
const selectCompany = id => select("company", id);
const selectAlert = id => select("alert", id);

document.body.addEventListener("click", () => { // click empty -> clear
  current = null; HL = emptyHL(); applyHighlight();
  activeGuide = null; activeOverlap = null; renderGuidedPaths(); renderOverlapLab();
  document.getElementById("detail-body").classList.add("hidden");
  document.getElementById("detail-empty").classList.remove("hidden");
});

const detailBody = document.getElementById("detail-body");
const detailEmpty = document.getElementById("detail-empty");
function evChip(ev){ return `<span class="ev ev-${esc(ev)}">${esc(ev)}</span>`; }
function countryName(code){ const c = countryByCode.get(code); return c ? `${c.name_zh}/${c.name_en}` : code; }
function tagButtons(items, fn){ return `<div class="tagrow">${items.join("")}</div>`; }
function relatedAlerts(pred){ return D.candidateAlerts.filter(pred); }

function renderViewToolbar() {
  const toolbar = document.getElementById("view-toolbar");
  if (!toolbar) return;
  toolbar.innerHTML = VIEW_MODES.map(mode => (
    `<button type="button" class="${activeViewMode === mode.id ? "active" : ""}" data-view-mode="${esc(mode.id)}">${esc(mode.label)}</button>`
  )).join("");
  toolbar.querySelectorAll("[data-view-mode]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      activeViewMode = button.getAttribute("data-view-mode") || "map";
      applyViewMode();
    });
  });
}

function applyViewMode() {
  document.body.dataset.viewMode = activeViewMode;
  renderViewToolbar();
}

function politicalMagFor(polnodeId) {
  return POLITICAL_MAG_PLACEHOLDERS.filter(row => row.polnode === polnodeId);
}

function politicalMagCard(row) {
  const pn = politicalNodeById.get(row.polnode);
  return `<article class="political-mag-card">
    <div class="political-mag-card-head">
      <div>
        <h3>${esc(row.metric)}</h3>
        <p>${esc(pn ? pn.label_zh : row.polnode)}</p>
      </div>
      <span class="ev ev-${evidenceClass(row.evidence_status)}">${esc(row.evidence_status)}</span>
    </div>
    <div class="mag-meta-row"><span class="mag-scale">${esc(row.scale_family)}</span></div>
    <p>${esc(row.why)}</p>
    <div class="political-mag-source-line">候选来源 / sources: ${esc(row.candidate_sources)}</div>
    <div class="gap-strong">下一步：${esc(row.next_action)}</div>
    <div class="tagrow"><button data-polnode="${esc(row.polnode)}">打开政治节点</button></div>
  </article>`;
}

function renderPoliticalMagLab() {
  const grid = document.getElementById("political-mag-grid");
  if (!grid) return;
  grid.innerHTML = POLITICAL_MAG_PLACEHOLDERS.map(politicalMagCard).join("");
  grid.querySelectorAll("[data-polnode]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      activeViewMode = "evidence";
      applyViewMode();
      selectPoliticalNode(button.getAttribute("data-polnode"));
    });
  });
}

// ---- guided viewer paths ----
// These are presentation paths, not new evidence. Each path begins with a real
// Atlas object and then offers a few next hops so the audience sees the two-map
// grammar without needing to know the data model first.
const GUIDED_PATHS = [
  {
    id: "compute-control",
    kicker: "AI Compute",
    title_zh: "先进算力不是一条供应链，而是一组权限闸门",
    title_en: "Advanced compute is a chain of permission gates",
    start: { type: "node", id: "ac-export" },
    lead: "从出口管制开始看：美国法域、GPU、EDA、EUV、台湾制造和中国需求端会同时被点亮。这里要传递的是“控制面”如何压在物理制造之上。",
    hops: [
      { type: "country", id: "US", label: "美国控制面" },
      { type: "polnode", id: "ps-export-control", label: "出口管制/许可" },
      { type: "company", id: "asml", label: "ASML/EUV" },
      { type: "country", id: "TW", label: "台湾制造落点" },
      { type: "node", id: "ac-hbm", label: "HBM 近身瓶颈" }
    ]
  },
  {
    id: "hormuz-energy",
    kicker: "Energy Transmission",
    title_zh: "霍尔木兹不是红点，是 expensive mode 触发器",
    title_en: "Hormuz converts disruption into expensive mode",
    start: { type: "chokepoint", id: "hormuz" },
    lead: "从霍尔木兹开始看：原油、LNG、东亚买家、油轮航道和战略储备会连到一起。重点不是马上断供，而是保险、绕航、替代管道和国家背书运输如何重新定价。",
    hops: [
      { type: "country", id: "JP", label: "日本依赖端" },
      { type: "country", id: "KR", label: "韩国依赖端" },
      { type: "polnode", id: "ps-energy-coordination", label: "能源协调/买家政策" },
      { type: "node", id: "en-tanker", label: "油轮/LNG 航道" },
      { type: "node", id: "en-reserve", label: "战略储备缺口" }
    ]
  },
  {
    id: "malacca-overlap",
    kicker: "Cross-stack Overlap",
    title_zh: "马六甲把能源航道和互联网底盘叠在同一个地理瓶颈",
    title_en: "Malacca overlaps energy lanes and cable reachability",
    start: { type: "chokepoint", id: "malacca" },
    lead: "从马六甲开始看：它同时触发东亚能源栈和互联网可达性栈。这里适合解释为什么 Stack Atlas 需要“多标签页 + 同一张地图”，因为不同技术栈会在同一个现实通道上重叠。",
    hops: [
      { type: "country", id: "SG", label: "新加坡接点密度" },
      { type: "polnode", id: "ps-naval-transit", label: "通道强制/护航能力" },
      { type: "node", id: "re-cable", label: "海底光缆" },
      { type: "node", id: "en-tanker", label: "能源航道" },
      { type: "alert", id: "ca-malacca-dual", label: "跨栈待复查线索" }
    ]
  }
];
let activeGuide = null;
let activeOverlap = null;

const CROSS_STACK_OVERLAPS = [
  {
    id: "malacca-energy-cable",
    title_zh: "马六甲：能源航道 + 海底光缆",
    title_en: "Malacca: energy lane plus cable reachability",
    stacks: ["energy", "reachability"],
    anchor: { type: "chokepoint", id: "malacca" },
    objects: [
      { type: "chokepoint", id: "malacca", label: "马六甲海峡" },
      { type: "node", id: "en-tanker", label: "油轮/LNG 航道" },
      { type: "node", id: "re-cable", label: "海底光缆" },
      { type: "polnode", id: "ps-naval-transit", label: "海上通道强制/护航能力" },
      { type: "polnode", id: "ps-port-access", label: "港口/登陆点准入" },
      { type: "country", id: "SG", label: "新加坡" },
      { type: "country", id: "JP", label: "日本" },
      { type: "country", id: "CN", label: "中国" }
    ],
    thesis: "同一个海峡不只是一条能源路线，也是一段互联网物理底盘。Stack Atlas 要看的就是这种跨栈重叠：一个地理瓶颈会把油气成本、维修能力、路由冗余和国家安全放到同一张图上。",
    flow: [
      { label: "断点", body: "海峡通行、海缆维修或区域安全状态变差。", target: { type: "chokepoint", id: "malacca" } },
      { label: "直接影响", body: "东亚油轮/LNG 航道和海底光缆走廊同时进入高摩擦状态。", target: { type: "node", id: "en-tanker" } },
      { label: "政治控制面", body: "护航能力、港口准入、维修船可用性和区域安全承诺决定摩擦能否被吸收。", target: { type: "polnode", id: "ps-naval-transit" } },
      { label: "MAG/数量级", body: "能源流量、海缆路线数、维修能力和绕航时间不能合成一个粗箭头，要分量纲读。", target: { type: "node", id: "re-cable" } },
      { label: "替代/反馈", body: "能源绕航和网络备用路由都不是免费替代；成本最后落到区域安全承诺和买家政策上。", target: { type: "country", id: "SG" } },
      { label: "证据边界", body: "本版确认地理和结构重叠；逐条 cable 业主、具体流量比例仍需 source-linked 数据。", evidence: "needs-review" }
    ]
  },
  {
    id: "us-compute-control",
    title_zh: "美国：AI 算力的控制面叠加",
    title_en: "United States: layered compute control plane",
    stacks: ["ai-compute", "reachability"],
    anchor: { type: "country", id: "US" },
    objects: [
      { type: "country", id: "US", label: "美国" },
      { type: "node", id: "ac-gpu", label: "GPU" },
      { type: "node", id: "ac-eda", label: "EDA 工具" },
      { type: "node", id: "ac-cloud", label: "云 GPU 容量" },
      { type: "node", id: "ac-export", label: "出口管制" },
      { type: "node", id: "re-cloud", label: "云控制面" },
      { type: "polnode", id: "ps-export-control", label: "出口管制/许可" },
      { type: "polnode", id: "ps-sanctions-service", label: "制裁/服务可达性" }
    ],
    thesis: "美国在图里不是单个供应商国家，而是多个 permission gate 的叠加位置：芯片设计、EDA、云容量、出口管制和服务可达性会互相放大。",
    flow: [
      { label: "断点", body: "出口管制、服务限制或云容量访问条件变化。", target: { type: "node", id: "ac-export" } },
      { label: "政治控制面", body: "许可、实体清单、制裁和服务条款把技术节点转换成可达/不可达问题。", target: { type: "polnode", id: "ps-export-control" } },
      { label: "MAG/数量级", body: "需要看 EUV 安装基础、GPU/HBM 供应、许可清单规模和替代滞后，而不是只看谁连着谁。", target: { type: "country", id: "US" } },
      { label: "替代路径", body: "替代不只是买别的硬件，还要替代工具链、云服务、许可和支持网络。", target: { type: "node", id: "ac-eda" } },
      { label: "反馈层", body: "技术主权和国家安全叙事会反过来支撑管制与补贴。", target: { type: "polnode", id: "ps-legitimacy-narratives" } },
      { label: "证据边界", body: "本版展示结构依赖；逐条许可状态、区域云容量和实际替代进度要回原文核。", evidence: "source-linked" }
    ]
  },
  {
    id: "taiwan-advanced-fab",
    title_zh: "台湾：先进制造的高密度落点",
    title_en: "Taiwan: dense anchor for advanced fabrication",
    stacks: ["ai-compute"],
    anchor: { type: "country", id: "TW" },
    objects: [
      { type: "country", id: "TW", label: "台湾" },
      { type: "company", id: "tsmc", label: "TSMC" },
      { type: "node", id: "ac-fab", label: "先进芯片制造" },
      { type: "node", id: "ac-gpu", label: "GPU" },
      { type: "node", id: "ac-euv", label: "EUV 光刻设备" },
      { type: "country", id: "NL", label: "荷兰/ASML" },
      { type: "polnode", id: "ps-industrial-policy", label: "产业政策/本土替代" },
      { type: "polnode", id: "ps-alliance-regimes", label: "盟友协调机制" }
    ],
    thesis: "台湾不是普通供应商点，而是设计、设备、材料、晶圆制造和安全环境压缩在一起的高密度落点。它说明 Stack Atlas 的国家节点要和公司、设备、控制规则一起读。",
    flow: [
      { label: "断点", body: "先进晶圆制造、设备服务或安全环境受到扰动。", target: { type: "country", id: "TW" } },
      { label: "直接影响", body: "AI GPU 交付、先进制程产能和客户排产被牵动。", target: { type: "node", id: "ac-fab" } },
      { label: "上游闸门", body: "EUV 设备和服务把荷兰/ASML 接入台湾制造节点。", target: { type: "company", id: "asml" } },
      { label: "政治控制面", body: "产业政策、盟友协调和出口许可决定扩产、服务与替代路径的政治条件。", target: { type: "polnode", id: "ps-industrial-policy" } },
      { label: "反馈层", body: "先进算力不是只由一个国家控制；它是多个高密度技术节点和政治协调机制的组合。", target: { type: "node", id: "ac-gpu" } },
      { label: "证据边界", body: "本版确认公司/国家/设备结构；产能、良率、客户占比和库存天数仍需 MAG v0.2 补数。", evidence: "needs-review" }
    ]
  }
];

const DUAL_STACK_TRANSMISSIONS = [
  {
    id: "dst-compute-permission",
    title_zh: "AI 算力：物理制造之外的 permission failure",
    title_en: "AI compute: permission failure above physical manufacturing",
    thesis: "GPU、EDA、EUV 和云容量的断点，很多时候先通过 P1 法域/规则层表现出来，而不是通过仓库断货表现出来。",
    chain: [
      { role: "技术断点", type: "node", id: "ac-gpu", label: "GPU / EDA / EUV / 云容量", body: "技术栈里看似是硬件、工具和云资源的组合依赖。" },
      { role: "政治控制面", type: "polnode", id: "ps-export-control", label: "出口管制/许可", body: "许可、实体清单、最终用途和服务条款把技术调用转成可达性问题。" },
      { role: "MAG", type: "node", id: "ac-euv", label: "设备、产能、清单规模", body: "要补的不是一条关系，而是 EUV 安装基础、GPU/HBM 供应、许可/清单规模和替代滞后。" },
      { role: "替代路径", type: "polnode", id: "ps-industrial-policy", label: "产业政策/本土替代", body: "替代需要工具链、制造、封装、云服务和支持网络同时移动，不能只看单点国产化。" },
      { role: "反馈层", type: "polnode", id: "ps-legitimacy-narratives", label: "技术主权/国家安全叙事", body: "P4 叙事给 P1 管制和 P3 补贴提供持续合法性，也会限制妥协空间。" }
    ]
  },
  {
    id: "dst-hormuz-expensive-mode",
    title_zh: "霍尔木兹：从物理通道到价格政治",
    title_en: "Hormuz: from physical chokepoint to price politics",
    thesis: "霍尔木兹冲击通常不是先变成“没油”，而是进入 expensive mode：保险、绕航、护航、储备释放和国内价格压力同步重定价。",
    chain: [
      { role: "技术断点", type: "chokepoint", id: "hormuz", label: "霍尔木兹通道摩擦", body: "能源栈的 L0/L1 流量被同一个海峡聚合。" },
      { role: "政治控制面", type: "polnode", id: "ps-naval-transit", label: "海上通道强制/护航能力", body: "通道能否维持，不只取决于航运市场，也取决于护航能力和安全承诺。" },
      { role: "MAG", type: "node", id: "en-tanker", label: "流量 share / 绕航时间 / 保险成本", body: "MAG 应该追踪承载流量、替代管道能力、重航时间、保险和运价变化。" },
      { role: "替代路径", type: "node", id: "en-reserve", label: "战略储备 / 替代供应", body: "储备释放、买家转向、炼厂适配和长期合约决定 expensive mode 能撑多久。" },
      { role: "反馈层", type: "polnode", id: "ps-domestic-price", label: "国内价格/就业/选举压力", body: "油气价格会把外部通道问题转换为国内政治承受力问题。" }
    ]
  },
  {
    id: "dst-malacca-overlap",
    title_zh: "马六甲：一个地理瓶颈，两条技术栈，多个政治接口",
    title_en: "Malacca: one geography, two tech stacks, multiple political interfaces",
    thesis: "马六甲同时承载能源航道和互联网物理底盘；真正的风险是多系统共用一个地理瓶颈后，维修、护航、港口准入和备用路径一起受限。",
    chain: [
      { role: "技术断点", type: "chokepoint", id: "malacca", label: "能源航道 + 海底光缆走廊", body: "能源栈和 reachability 栈在同一段地理通道上重叠。" },
      { role: "政治控制面", type: "polnode", id: "ps-port-access", label: "港口/登陆点准入", body: "港口、登陆点、维修船和区域准入规则决定替代路径是否真的可用。" },
      { role: "MAG", type: "node", id: "re-cable", label: "cable route count / 维修能力 / 航运流量", body: "需要把海缆路线数、登陆点、维修船、能源流量和绕航时间分开计量。" },
      { role: "替代路径", type: "node", id: "en-tanker", label: "绕航与备用路由", body: "能源侧绕航，网络侧走备用路由；两者都不是免费替代。" },
      { role: "反馈层", type: "polnode", id: "ps-alliance-regimes", label: "联盟协调/区域安全承诺", body: "区域安全承诺和盟友协调决定谁承担护航、维修、优先通行和成本转嫁。" }
    ]
  }
];

const POLITICAL_MAG_PLACEHOLDERS = [
  {
    id: "pmag-export-control",
    polnode: "ps-export-control",
    metric: "许可/实体清单/最终用途规则规模",
    scale_family: "permission_scope / listing_count / license_path",
    candidate_sources: "BIS / EU / NL / JP / KR official notices",
    why: "把 AI 算力断点从“有无硬件”转成“哪些主体、产品、服务和最终用途被许可”。",
    evidence_status: "unknown",
    next_action: "拆官方清单与规则文本，建立可审计 row，不估算。"
  },
  {
    id: "pmag-sanctions-service",
    polnode: "ps-sanctions-service",
    metric: "制裁、支付、保险、云服务可达性范围",
    scale_family: "service_availability / sanction_scope / payment_insurance_gate",
    candidate_sources: "OFAC / EU sanctions / cloud service terms / marine insurance notices",
    why: "政治栈可以不移动货物，却改变结算、保险、维修、云服务和持续使用权。",
    evidence_status: "unknown",
    next_action: "先定义对象级 scope，再补官方公告和服务条款。"
  },
  {
    id: "pmag-naval-transit",
    polnode: "ps-naval-transit",
    metric: "护航容量、维修船、通道安全承诺",
    scale_family: "escort_capacity / repair_vessel_availability / transit_security",
    candidate_sources: "public naval posture, shipping advisories, cable repair fleet references",
    why: "霍尔木兹/马六甲不是只看物理宽度，还要看谁能维持通行和维修。",
    evidence_status: "unknown",
    next_action: "不要做军事能力评分；先列公开可审计的通道支持指标。"
  },
  {
    id: "pmag-industrial-policy",
    polnode: "ps-industrial-policy",
    metric: "补贴金额、项目状态、许可/并网进度、替代滞后",
    scale_family: "subsidy_amount / project_status / substitution_lag",
    candidate_sources: "CHIPS Act awards, EU/Japan/Korea/Taiwan industrial-policy notices, company IR",
    why: "产业政策是政治系统试图改写技术依赖的主要慢变量。",
    evidence_status: "unknown",
    next_action: "按项目建立 status row，避免把公告金额当作已落地产能。"
  },
  {
    id: "pmag-domestic-price",
    polnode: "ps-domestic-price",
    metric: "价格敏感度、储备天数、就业/选区暴露",
    scale_family: "price_sensitivity / reserve_days / employment_exposure",
    candidate_sources: "IEA/EIA reserve data, national statistics, price series, election geography",
    why: "国内政治压力决定 P1/P2 的政策能持续多久。",
    evidence_status: "unknown",
    next_action: "先从能源储备和价格序列做低风险量纲，不碰主观政治评分。"
  }
];

function selectGuide(pathId, hop = null) {
  const path = GUIDED_PATHS.find(p => p.id === pathId);
  if (!path) return;
  const target = hop || path.start;
  activeGuide = { pathId, target };
  select(target.type, target.id, { keepGuide: true });
  renderGuidedPaths();
  document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function guideTargetLabel(target) {
  if (!target) return "";
  if (target.type === "country") return countryName(target.id);
  if (target.type === "node") return nodeById.get(target.id)?.label_zh || target.id;
  if (target.type === "polnode") return politicalNodeById.get(target.id)?.label_zh || target.id;
  if (target.type === "chokepoint") return chokeById.get(target.id)?.name_zh || target.id;
  if (target.type === "company") return companyById.get(target.id)?.name || target.id;
  if (target.type === "alert") return D.candidateAlerts.find(a => a.id === target.id)?.title_zh || target.id;
  return target.id;
}

function activeGuideBanner() {
  if (!activeGuide) return "";
  const path = GUIDED_PATHS.find(p => p.id === activeGuide.pathId);
  if (!path) return "";
  return `<section class="guide-context">
    <div>
      <span class="guide-context-kicker">${esc(path.kicker)}</span>
      <strong>${esc(path.title_zh)}</strong>
    </div>
    <p>${esc(path.lead)}</p>
  </section>`;
}

function renderGuidedPaths() {
  const grid = document.getElementById("guided-grid");
  if (!grid) return;
  grid.innerHTML = GUIDED_PATHS.map(path => {
    const active = activeGuide?.pathId === path.id;
    const selected = active ? guideTargetLabel(activeGuide.target) : guideTargetLabel(path.start);
    const hopButtons = path.hops.map(h => (
      `<button type="button" data-guide-hop="${esc(path.id)}" data-hop-type="${esc(h.type)}" data-hop-id="${esc(h.id)}">${esc(h.label)}</button>`
    )).join("");
    return `<article class="guided-card ${active ? "active" : ""}">
      <div class="guided-kicker">${esc(path.kicker)}</div>
      <h3>${esc(path.title_zh)}</h3>
      <p class="guided-en">${esc(path.title_en)}</p>
      <p>${esc(path.lead)}</p>
      <div class="guided-actions">
        <button type="button" class="guided-start" data-guide="${esc(path.id)}">从这里开始 · ${esc(selected)}</button>
      </div>
      <div class="guided-hops">${hopButtons}</div>
    </article>`;
  }).join("");
  grid.querySelectorAll("[data-guide]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      selectGuide(button.getAttribute("data-guide"));
    });
  });
  grid.querySelectorAll("[data-guide-hop]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      selectGuide(button.getAttribute("data-guide-hop"), {
        type: button.getAttribute("data-hop-type"),
        id: button.getAttribute("data-hop-id")
      });
    });
  });
}

function hlFromTarget(target, hl) {
  if (!target) return;
  if (target.type === "country") {
    hl.countries.add(target.id);
    nodeById.forEach((n,nid) => { if((n.countries||[]).includes(target.id)) hlFromNode(nid, hl); });
  } else if (target.type === "node") {
    hlFromNode(target.id, hl);
  } else if (target.type === "polnode") {
    hlFromPoliticalNode(target.id, hl);
  } else if (target.type === "chokepoint") {
    const cp = chokeById.get(target.id);
    if (!cp) return;
    hl.chokepoints.add(target.id);
    (cp.affectsCountries || []).forEach(code => hl.countries.add(code));
  } else if (target.type === "company") {
    const co = companyById.get(target.id);
    if (!co) return;
    hl.companies.add(target.id);
    hl.countries.add(co.country);
  } else if (target.type === "alert") {
    const a = D.candidateAlerts.find(x => x.id === target.id);
    if (!a) return;
    (a.relNodes||[]).forEach(nid => hlFromNode(nid, hl));
    (a.relCountries||[]).forEach(code => hl.countries.add(code));
    (a.relCompanies||[]).forEach(cid => hl.companies.add(cid));
    (a.relChokepoints||[]).forEach(cid => hl.chokepoints.add(cid));
  }
}

function overlapById(id) {
  return CROSS_STACK_OVERLAPS.find(o => o.id === id);
}

function selectOverlap(id, focusTarget = null) {
  const overlap = overlapById(id);
  if (!overlap) return;
  activeGuide = null; renderGuidedPaths();
  activeOverlap = { id, focusTarget: focusTarget || overlap.anchor };
  current = { type: "overlap", id };
  HL = emptyHL();
  overlap.objects.forEach(obj => hlFromTarget(obj, HL));
  hlFromTarget(overlap.anchor, HL);
  if (focusTarget) hlFromTarget(focusTarget, HL);
  applyHighlight();
  renderOverlapLab();
  renderOverlapDetail(overlap, focusTarget || overlap.anchor);
  document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function overlapStackChip(stackId) {
  const stack = D.stacks.find(s => s.id === stackId);
  return `<span class="overlap-stack">${esc(stack ? stack.name_zh : stackId)}</span>`;
}

function objectButton(obj, attrs = "") {
  return `<button type="button" ${attrs} data-object-type="${esc(obj.type)}" data-object-id="${esc(obj.id)}">${esc(obj.label || guideTargetLabel(obj))}</button>`;
}

function renderFlowStep(step, index, overlapId) {
  const ev = step.evidence ? `<span class="ev ev-${evidenceClass(step.evidence)}">${esc(step.evidence)}</span>` : "";
  const action = step.target
    ? objectButton({ ...step.target, label: guideTargetLabel(step.target) }, `data-flow-overlap="${esc(overlapId)}"`)
    : "";
  return `<div class="flow-step">
    <div class="flow-num">${index + 1}</div>
    <div class="flow-copy">
      <div class="flow-label">${esc(step.label)} ${ev}</div>
      <p>${esc(step.body)}</p>
      ${action ? `<div class="flow-action">${action}</div>` : ""}
    </div>
  </div>`;
}

function renderOverlapLab() {
  const list = document.getElementById("overlap-list");
  const panel = document.getElementById("flow-panel");
  if (!list || !panel) return;
  list.innerHTML = CROSS_STACK_OVERLAPS.map(overlap => {
    const active = activeOverlap?.id === overlap.id;
    const objects = overlap.objects.slice(0, 5).map(obj => objectButton(obj, `data-overlap-object="${esc(overlap.id)}"`)).join("");
    return `<article class="overlap-card ${active ? "active" : ""}">
      <div class="overlap-card-head">
        <div>
          <h3>${esc(overlap.title_zh)}</h3>
          <p>${esc(overlap.title_en)}</p>
        </div>
        <button type="button" class="overlap-start" data-overlap="${esc(overlap.id)}">点亮</button>
      </div>
      <div class="overlap-stacks">${overlap.stacks.map(overlapStackChip).join("")}</div>
      <p class="overlap-thesis">${esc(overlap.thesis)}</p>
      <div class="overlap-objects">${objects}</div>
    </article>`;
  }).join("");
  const active = activeOverlap ? overlapById(activeOverlap.id) : CROSS_STACK_OVERLAPS[0];
  panel.innerHTML = active ? `<div class="flow-head">
      <span>Scenario Flow</span>
      <strong>${esc(active.title_zh)}</strong>
    </div>
    <div class="flow-steps">${active.flow.map((step, index) => renderFlowStep(step, index, active.id)).join("")}</div>` : "";

  list.querySelectorAll("[data-overlap]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      selectOverlap(button.getAttribute("data-overlap"));
    });
  });
  list.querySelectorAll("[data-overlap-object]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      selectOverlap(button.getAttribute("data-overlap-object"), {
        type: button.getAttribute("data-object-type"),
        id: button.getAttribute("data-object-id")
      });
    });
  });
  panel.querySelectorAll("[data-flow-overlap]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      selectOverlap(button.getAttribute("data-flow-overlap"), {
        type: button.getAttribute("data-object-type"),
        id: button.getAttribute("data-object-id")
      });
    });
  });
}

function renderOverlapDetail(overlap, focusTarget) {
  detailEmpty.classList.add("hidden");
  detailBody.classList.remove("hidden");
  const objects = overlap.objects.map(obj => objectButton(obj, `data-overlap-object="${esc(overlap.id)}"`)).join("");
  detailBody.innerHTML = `<section class="guide-context overlap-context">
      <div>
        <span class="guide-context-kicker">Cross-stack Overlap</span>
        <strong>${esc(overlap.title_zh)}</strong>
      </div>
      <p>${esc(overlap.thesis)}</p>
    </section>
    <div class="detail-kind">结构视图 / Structure view</div>
    <h3>${esc(overlap.title_zh)} <span class="ev ev-needs-review">structure view</span></h3>
    <section class="narrative-card">
      <h4>What this means · 观众导览</h4>
      <p>${esc(overlap.thesis)}</p>
      <p><strong>当前焦点：</strong>${esc(guideTargetLabel(focusTarget))}。</p>
      <p><strong>边界：</strong>这里展示已有 Atlas 对象之间的重叠关系；具体比例、时间、容量仍以各对象的 MAG / EAE / source-linked 证据为准。</p>
    </section>
    <div class="detail-grid">
      <div class="dcard"><h4>涉及技术栈</h4><div class="tagrow">${overlap.stacks.map(overlapStackChip).join("")}</div></div>
      <div class="dcard"><h4>涉及对象</h4><div class="tagrow">${objects}</div></div>
    </div>
    <section class="scenario-detail">
      <h4>Scenario Flow · 传导链</h4>
      ${overlap.flow.map((step, index) => renderFlowStep(step, index, overlap.id)).join("")}
    </section>`;
  detailBody.querySelectorAll("[data-overlap-object],[data-flow-overlap]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      selectOverlap(button.getAttribute("data-overlap-object") || button.getAttribute("data-flow-overlap"), {
        type: button.getAttribute("data-object-type"),
        id: button.getAttribute("data-object-id")
      });
    });
  });
}

function selectTransmissionStep(transmissionId, stepIndex = 0) {
  const transmission = DUAL_STACK_TRANSMISSIONS.find(t => t.id === transmissionId);
  if (!transmission) return;
  const step = transmission.chain[stepIndex] || transmission.chain[0];
  if (step.type === "node") selectNode(step.id);
  else if (step.type === "polnode") selectPoliticalNode(step.id);
  else if (step.type === "chokepoint") selectChokepoint(step.id);
  else if (step.type === "country") selectCountry(step.id);
  else if (step.type === "company") selectCompany(step.id);
  renderTransmissionLab(transmissionId, stepIndex);
  document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderTransmissionLab(activeId = null, activeStep = null) {
  const grid = document.getElementById("transmission-grid");
  if (!grid) return;
  grid.innerHTML = DUAL_STACK_TRANSMISSIONS.map(transmission => {
    const active = activeId === transmission.id;
    const steps = transmission.chain.map((step, index) => {
      const selected = active && activeStep === index;
      return `<button type="button" class="transmission-step ${selected ? "active" : ""}" data-transmission="${esc(transmission.id)}" data-step="${index}">
        <span>${esc(step.role)}</span>
        <strong>${esc(step.label)}</strong>
        <em>${esc(step.body)}</em>
      </button>`;
    }).join("");
    return `<article class="transmission-card ${active ? "active" : ""}">
      <div class="transmission-card-head">
        <span>Dual-stack chain</span>
        <h3>${esc(transmission.title_zh)}</h3>
        <p>${esc(transmission.title_en)}</p>
      </div>
      <p class="transmission-thesis">${esc(transmission.thesis)}</p>
      <div class="transmission-chain">${steps}</div>
    </article>`;
  }).join("");
  grid.querySelectorAll("[data-transmission]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      selectTransmissionStep(button.getAttribute("data-transmission"), Number(button.getAttribute("data-step") || 0));
    });
  });
}

function alertCard(a){
  return `<div class="alert-card">
    <div class="atitle">${esc(a.title_zh)} · ${esc(a.title_en)} <span class="ev ev-needs-review">${esc(a.status)}</span></div>
    <div class="asig">${esc(a.signal_zh)}</div>
    <button data-alert="${esc(a.id)}">在地图上点亮 →</button>
  </div>`;
}

function narrativeMetricLine(type, id, nodes = [], chokes = [], alerts = []) {
  const magCandidates = MAG ? magCandidatesFor(type, id) : [];
  const verifiedFacts = magCandidates.reduce((sum, c) => sum + (c.facts || []).filter(f => f.evidence_status === "verified").length, 0);
  const scaleFamilies = [...new Set(magCandidates.map(c => c.scale_family))].slice(0, 3);
  const nodeNames = nodes.slice(0, 4).map(n => n.label_zh).join(" / ");
  const chokeNames = chokes.slice(0, 3).map(c => c.name_zh).join(" / ");
  const parts = [];
  if (nodeNames) parts.push(`关联节点：${nodeNames}`);
  if (chokeNames) parts.push(`关键通道：${chokeNames}`);
  if (magCandidates.length) parts.push(`MAG：${magCandidates.length} 个数量级候选，${verifiedFacts} 条 verified 事实`);
  if (scaleFamilies.length) parts.push(`量纲：${scaleFamilies.join("；")}`);
  if (alerts.length) parts.push(`待复查线索：${alerts.length} 条`);
  return parts.join("。");
}

function countryNarrative(code, nodes, chokes, alerts) {
  const c = countryByCode.get(code);
  const nodeIds = new Set(nodes.map(n => n.id));
  const magCandidates = MAG ? magCandidatesFor("country", code) : [];
  const hasAi = nodes.some(n => stackByNode.get(n.id)?.id === "ai-compute");
  const hasEnergy = nodes.some(n => stackByNode.get(n.id)?.id === "energy");
  const hasReach = nodes.some(n => stackByNode.get(n.id)?.id === "reachability");
  let message = `${c.name_zh}在这张图里不是一个地理色块，而是一组技术依赖的落点。`;
  if (code === "US") {
    message = "美国在这里主要表现为控制面：GPU、EDA、云、出口管制、金融/服务可达性都从这里向外施加权限。要看的不是“美国很强”这种空话，而是哪些调用必须经过美国公司、美国法域或美国名单。";
  } else if (code === "CN") {
    message = "中国在这里同时是超大需求端、制造端和被管制对象。它既被能源航道、先进芯片工具和云/网络可达性牵动，也在寻找替代路径；关键问题是替代路径有没有足够数量级。";
  } else if (code === "JP" || code === "KR") {
    message = `${c.name_zh}在这张图里最像高工业化但被外部流量喂养的系统：能源进口、海运 chokepoint、关键制造节点同时出现。要看的是断点先落在油气成本、储备释放、工业配给，还是芯片/存储产能。`;
  } else if (code === "TW") {
    message = "台湾在这里主要是先进芯片制造的物理落点。它不是普通供应商节点，而是 AI 算力栈里把设计、设备、材料和地缘安全同时压到一起的高密度节点。";
  } else if (code === "NL") {
    message = "荷兰在这里被 ASML/EUV 放大。国家体量不是重点；重点是一个小法域里的设备公司掌握了先进制程的关键通过条件。";
  } else if (["SA", "QA", "AE"].includes(code)) {
    message = `${c.name_zh}在这里是能源流的上游节点。它的重要性不只在产量，还在油气出海口、替代管道、LNG/原油流量和东亚买家的联动。`;
  } else if (code === "SG") {
    message = "新加坡在这里是小地理、大通道：海运、海缆、云与金融/物流节点叠在一起。它的可见面积小，但系统接点密度高。";
  }
  const stacks = [
    hasAi ? "AI 算力栈" : "",
    hasEnergy ? "东亚能源栈" : "",
    hasReach ? "互联网可达性栈" : ""
  ].filter(Boolean).join("、");
  const metric = narrativeMetricLine("country", code, nodes, chokes, alerts);
  return `<section class="narrative-card">
    <h4>What this means · 观众导览</h4>
    <p>${esc(message)}</p>
    ${stacks ? `<p><strong>跨栈位置：</strong>${esc(stacks)}。</p>` : ""}
    ${metric ? `<p><strong>当前证据：</strong>${esc(metric)}。</p>` : ""}
    ${magCandidates.length ? `<p><strong>我想让你看到：</strong>关系图只说明“连着谁”，Magnitude 才说明这条连接是小风险、局部闸门，还是低名气高控制节点。</p>` : ""}
  </section>`;
}

function nodeNarrative(n, comps, chokes, alerts) {
  const stk = stackByNode.get(n.id);
  const magCandidates = MAG ? magCandidatesFor("node", n.id) : [];
  let message = `${n.label_zh}是 ${stk.name_zh} 里的 ${n.layer} 节点，当前状态标为 ${n.status}，证据层级是 ${n.evidence}。`;
  if (n.id === "ac-export") {
    message = "出口管制不是边境上的检查站，而是 AI 算力栈里的 permission chokepoint：产品、服务、人员支持和最终用途可能在法律状态变化后突然不可达。";
  } else if (n.id === "ac-euv") {
    message = "EUV 是先进制程的设备闸门。它的重要性来自单一供应商、安装基础、服务能力和许可环境叠加，不是单纯“机器很贵”。";
  } else if (n.id === "ac-hbm") {
    message = "HBM 是 AI 加速器的近身瓶颈。GPU 不是孤立运行，存储带宽、封装和供应商扩产节奏会把算力叙事拖回制造现实。";
  } else if (n.id === "en-tanker") {
    message = "油轮/LNG 航道是能源冲击的传导层。危机不一定先变成没油，常常先变成运费、保险、等待时间和国家背书的运输优先级。";
  } else if (n.id === "en-sanction") {
    message = "制裁和价格上限是服务可达性闸门。它不移动货物，却能改变谁能结算、保险、维修、采购或继续使用某个系统。";
  } else if (n.id === "re-cable") {
    message = "海底光缆是互联网可达性的物理底盘。它看起来像通信问题，实际牵涉登陆点、路由、所有权、维修船和地缘安全。";
  }
  const metric = narrativeMetricLine("node", n.id, [n], chokes, alerts);
  return `<section class="narrative-card">
    <h4>What this means · 观众导览</h4>
    <p>${esc(message)}</p>
    ${comps.length ? `<p><strong>现实落点：</strong>${esc(comps.map(c => c.name).join("、"))}。</p>` : ""}
    ${metric ? `<p><strong>当前证据：</strong>${esc(metric)}。</p>` : ""}
    ${magCandidates.length ? `<p><strong>读图方式：</strong>先看它连到哪些国家/公司，再看 MAG 里有没有可审计数量级；没有数量级时，不要把箭头画得很粗。</p>` : ""}
  </section>`;
}

function politicalNodeNarrative(n, techNodes, chokes) {
  let message = `${n.label_zh} 是政治栈 ${n.layer} 节点。它不表示一件物理货物，而表示技术依赖如何被法域、联盟、强制能力、国内压力或叙事合法化机制接管。`;
  if (n.id === "ps-export-control") {
    message = "出口管制/许可是政治栈里最接近技术栈的闸门：它把 GPU、EDA、EUV、先进制造这些技术节点转换成法律权限问题。";
  } else if (n.id === "ps-naval-transit") {
    message = "海上通道强制/护航能力解释的是：能源和海缆不是只在市场里流动，它们也要经过安全承诺、护航能力和通道控制。";
  } else if (n.id === "ps-industrial-policy") {
    message = "产业政策/补贴/本土替代是政治系统试图改写技术依赖的工具。它不会立刻消除瓶颈，但会改变投资、许可、并网和替代路线。";
  } else if (n.id === "ps-legitimacy-narratives") {
    message = "国家安全/技术主权/能源安全叙事是 P4 层：它本身不生产芯片或油气，但会给管制、补贴、制裁和反制提供合法性。";
  }
  const techLine = techNodes.length ? `对应技术节点：${techNodes.map(t => t.label_zh).join(" / ")}` : "";
  const chokeLine = chokes.length ? `关联通道：${chokes.map(c => c.name_zh).join(" / ")}` : "";
  return `<section class="narrative-card political-narrative">
    <h4>What this means · 政治栈导览</h4>
    <p>${esc(message)}</p>
    ${techLine ? `<p><strong>技术接口：</strong>${esc(techLine)}。</p>` : ""}
    ${chokeLine ? `<p><strong>现实通道：</strong>${esc(chokeLine)}。</p>` : ""}
    <p><strong>读图方式：</strong>先看它接到哪些技术节点，再看它通过哪些国家、公司或 chokepoint 发生作用。政治栈不是背景噪音，是控制面。</p>
  </section>`;
}

function chokepointNarrative(cp, nodes, alerts) {
  const magCandidates = MAG ? magCandidatesFor("chokepoint", cp.id) : [];
  let message = `${cp.name_zh}是物理通道，但它真正重要的是把一种流量的扰动转换成别的系统压力。`;
  if (cp.id === "hormuz") {
    message = "霍尔木兹不是地图上的红点，而是能源流量、保险价格、替代管道和东亚工业成本的转换器。这里一变，影响通常先表现为 expensive mode，而不一定立刻表现为空油罐。";
  } else if (cp.id === "malacca") {
    message = "马六甲是跨栈 chokepoint：能源航道和海缆走廊在这里叠加。它同时让油气流和互联网可达性进入同一个地理瓶颈。";
  } else if (cp.id === "suez" || cp.id === "babelmandeb") {
    message = `${cp.name_zh}把欧亚航运、能源和海缆风险接在一起。它的意义不是“可能堵”，而是绕航成本、保险、维修和政治护航会怎样重新定价。`;
  }
  const metric = narrativeMetricLine("chokepoint", cp.id, nodes, [cp], alerts);
  return `<section class="narrative-card">
    <h4>What this means · 观众导览</h4>
    <p>${esc(message)}</p>
    ${metric ? `<p><strong>当前证据：</strong>${esc(metric)}。</p>` : ""}
    ${magCandidates.length ? `<p><strong>我想传递的信息：</strong>chokepoint 不只是“通/不通”，还要看承载流量、可绕行能力和替代路径质量。</p>` : ""}
  </section>`;
}

function companyNarrative(co, nodes) {
  const magCandidates = MAG ? magCandidatesFor("company", co.id) : [];
  let message = `${co.name} 在图里不是股票代码，而是一个技术栈调用点：它的产品、服务或许可条件会影响哪些国家能继续运行。`;
  if (co.id === "asml") {
    message = "ASML 是 EUV 设备和服务依赖的现实落点。它把荷兰、先进制程、美国/盟友管制和晶圆厂扩产节奏接到同一个节点。";
  } else if (co.id === "skhynix" || co.id === "samsung") {
    message = `${co.name} 在这里代表 HBM/存储供应的制造现实。AI 算力不是只有 GPU，内存带宽和封装产能同样会限制可交付算力。`;
  } else if (co.id === "synopsys" || co.id === "cadence") {
    message = `${co.name} 代表 EDA 工具层。先进芯片设计要调用这些工具，因此工具授权、出口管制和客户名单会变成 permission gate。`;
  }
  return `<section class="narrative-card">
    <h4>What this means · 观众导览</h4>
    <p>${esc(message)}</p>
    ${nodes.length ? `<p><strong>关联节点：</strong>${esc(nodes.map(n => n.label_zh).join("、"))}。</p>` : ""}
    ${magCandidates.length ? `<p><strong>数量级提示：</strong>这里挂着 ${magCandidates.length} 个 MAG 候选；先看证据状态，再看它是否真有 verified 数字。</p>` : ""}
  </section>`;
}

function renderDetail(type, id){
  detailEmpty.classList.add("hidden");
  detailBody.classList.remove("hidden");
  let html = "";
  if (type === "country"){
    const c = countryByCode.get(id);
    const nodes = [...nodeById.values()].filter(n => (n.countries||[]).includes(id));
    const pnodes = [...politicalNodeById.values()].filter(n => (n.countries||[]).includes(id));
    const comps = D.companies.filter(co => co.country === id);
    const chokes = D.chokepoints.filter(cp => (cp.affectsCountries||[]).includes(id));
    const alerts = relatedAlerts(a => (a.relCountries||[]).includes(id));
    html = `<div class="detail-kind">国家 / Country</div><h3>${esc(c.name_zh)} · ${esc(c.name_en)} <span class="ev ev-verified">verified · geography</span></h3>
      ${countryNarrative(id, nodes, chokes, alerts)}
      <div class="detail-grid">
        <div class="dcard"><h4>相关栈节点 Stack nodes</h4>${nodes.length?`<div class="tagrow">${nodes.map(n=>`<button data-node="${esc(n.id)}">${esc(n.label_zh)} · ${esc(n.status)}</button>`).join("")}</div>`:`<div class="gap-line">unknown / 本版未建立</div>`}</div>
        <div class="dcard"><h4>政治栈节点 Political nodes</h4>${pnodes.length?`<div class="tagrow">${pnodes.map(n=>`<button data-polnode="${esc(n.id)}">${esc(n.label_zh)} · ${esc(n.status)}</button>`).join("")}</div>`:`<div class="gap-line">unknown / 本版未建立</div>`}</div>
        <div class="dcard"><h4>公司/产业 Companies</h4>${comps.length?`<div class="tagrow">${comps.map(co=>`<button data-company="${esc(co.id)}">${esc(co.name)} · ${esc(co.role_zh)}</button>`).join("")}</div>`:`<div class="gap-line">unknown / needs source</div>`}</div>
        <div class="dcard"><h4>相关航道/Chokepoints</h4>${chokes.length?`<div class="tagrow">${chokes.map(cp=>`<button data-choke="${esc(cp.id)}">${esc(cp.name_zh)}</button>`).join("")}</div>`:`<div class="gap-line">unknown</div>`}</div>
        ${magnitudeSummaryCard("country", id)}
      </div>
      ${alerts.length?`<div><h4 style="margin:12px 0 0;color:#c4ccd8">Candidate alerts（待复查）</h4>${alerts.map(alertCard).join("")}</div>`:""}
      ${renderEastAsiaEnergyBlock("country", id)}
      ${renderMagnitudeLayerBlock("country", id)}`;
  } else if (type === "node"){
    const n = nodeById.get(id); const stk = stackByNode.get(id);
    const comps = (n.companies||[]).map(cid=>companyById.get(cid)).filter(Boolean);
    const chokes = (n.chokepoints||[]).map(cid=>chokeById.get(cid)).filter(Boolean);
    const pnodes = [...politicalNodeById.values()].filter(pn => (pn.techNodes||[]).includes(id));
    const alerts = relatedAlerts(a => (a.relNodes||[]).includes(id));
    html = `<div class="detail-kind">栈节点 / Stack node · ${esc(stk.name_en)} · ${esc(n.layer)}</div>
      <h3>${esc(n.label_zh)} · ${esc(n.label_en)} <span class="chip st-${n.status}">${esc(n.status)}</span> ${evChip(n.evidence)}</h3>
      ${nodeNarrative(n, comps, chokes, alerts)}
      <div class="detail-grid">
        <div class="dcard"><h4>相关国家 Countries</h4><div class="tagrow">${(n.countries||[]).map(c=>`<button data-code="${esc(c)}">${esc(countryName(c))}</button>`).join("")||'<span class="gap-line">unknown</span>'}</div></div>
        <div class="dcard"><h4>公司 Companies</h4>${comps.length?`<div class="tagrow">${comps.map(co=>`<button data-company="${esc(co.id)}">${esc(co.name)}</button>`).join("")}</div>`:`<div class="gap-line">unknown / needs source</div>`}</div>
        <div class="dcard"><h4>航道 Chokepoints</h4>${chokes.length?`<div class="tagrow">${chokes.map(cp=>`<button data-choke="${esc(cp.id)}">${esc(cp.name_zh)}</button>`).join("")}</div>`:`<div class="gap-line">无 / none</div>`}</div>
        <div class="dcard"><h4>政治栈接口 Political interface</h4>${pnodes.length?`<div class="tagrow">${pnodes.map(pn=>`<button data-polnode="${esc(pn.id)}">${esc(pn.label_zh)}</button>`).join("")}</div>`:`<div class="gap-line">本版未建立</div>`}</div>
        ${magnitudeSummaryCard("node", id)}
      </div>
      ${ (n.gap_zh||n.evidence==="unknown") ? `<div class="gap-strong">缺口 Gap：${esc(n.gap_zh||"该节点关系/数值证据不足，标 unknown，待补来源。")}</div>` : ""}
      ${alerts.length?`<div><h4 style="margin:12px 0 0;color:#c4ccd8">Candidate alerts（待复查）</h4>${alerts.map(alertCard).join("")}</div>`:""}
      ${renderEastAsiaEnergyBlock("node", id)}
      ${renderMagnitudeLayerBlock("node", id)}`;
  } else if (type === "polnode"){
    const n = politicalNodeById.get(id); const stk = politicalStackByNode.get(id);
    const techNodes = (n.techNodes||[]).map(nid=>nodeById.get(nid)).filter(Boolean);
    const comps = (n.companies||[]).map(cid=>companyById.get(cid)).filter(Boolean);
    const chokes = (n.chokepoints||[]).map(cid=>chokeById.get(cid)).filter(Boolean);
    const pmag = politicalMagFor(id);
    html = `<div class="detail-kind">政治栈节点 / Political stack node · ${esc(stk.name_en)} · ${esc(n.layer)}</div>
      <h3>${esc(n.label_zh)} · ${esc(n.label_en)} <span class="chip st-${n.status}">${esc(n.status)}</span> ${evChip(n.evidence)}</h3>
      ${politicalNodeNarrative(n, techNodes, chokes)}
      <div class="detail-grid">
        <div class="dcard"><h4>相关国家 Countries</h4><div class="tagrow">${(n.countries||[]).map(c=>`<button data-code="${esc(c)}">${esc(countryName(c))}</button>`).join("")||'<span class="gap-line">unknown</span>'}</div></div>
        <div class="dcard"><h4>技术接口 Tech nodes</h4>${techNodes.length?`<div class="tagrow">${techNodes.map(t=>`<button data-node="${esc(t.id)}">${esc(t.label_zh)}</button>`).join("")}</div>`:`<div class="gap-line">unknown</div>`}</div>
        <div class="dcard"><h4>公司/机构落点 Companies</h4>${comps.length?`<div class="tagrow">${comps.map(co=>`<button data-company="${esc(co.id)}">${esc(co.name)}</button>`).join("")}</div>`:`<div class="gap-line">无 / none</div>`}</div>
        <div class="dcard"><h4>通道 Chokepoints</h4>${chokes.length?`<div class="tagrow">${chokes.map(cp=>`<button data-choke="${esc(cp.id)}">${esc(cp.name_zh)}</button>`).join("")}</div>`:`<div class="gap-line">无 / none</div>`}</div>
      </div>
      ${(n.gap_zh||n.evidence==="unknown") ? `<div class="gap-strong">缺口 Gap：${esc(n.gap_zh||"政治栈节点关系/强度证据不足，标 unknown，待补来源。")}</div>` : ""}
      ${pmag.length ? `<section class="political-mag-inline"><h4>Political MAG · 数量级缺口</h4>${pmag.map(politicalMagCard).join("")}</section>` : ""}`;
  } else if (type === "chokepoint"){
    const cp = chokeById.get(id);
    const nodes = [...nodeById.values()].filter(n => (n.chokepoints||[]).includes(id));
    const pnodes = [...politicalNodeById.values()].filter(n => (n.chokepoints||[]).includes(id));
    const alerts = relatedAlerts(a => (a.relChokepoints||[]).includes(id));
    html = `<div class="detail-kind">航道 / Chokepoint</div>
      <h3>${esc(cp.name_zh)} · ${esc(cp.name_en)} ${evChip(cp.evidence)}</h3>
      ${chokepointNarrative(cp, nodes, alerts)}
      <div class="detail-grid">
        <div class="dcard"><h4>受影响国家 Affected countries</h4><div class="tagrow">${(cp.affectsCountries||[]).map(c=>`<button data-code="${esc(c)}">${esc(countryName(c))}</button>`).join("")}</div></div>
        <div class="dcard"><h4>受影响栈节点 Affected nodes</h4>${nodes.length?`<div class="tagrow">${nodes.map(n=>`<button data-node="${esc(n.id)}">${esc(n.label_zh)}</button>`).join("")}</div>`:`<div class="gap-line">unknown</div>`}</div>
        <div class="dcard"><h4>政治栈节点 Political nodes</h4>${pnodes.length?`<div class="tagrow">${pnodes.map(n=>`<button data-polnode="${esc(n.id)}">${esc(n.label_zh)}</button>`).join("")}</div>`:`<div class="gap-line">unknown</div>`}</div>
        ${magnitudeSummaryCard("chokepoint", id)}
      </div>
      <div class="gap-strong">${esc(cp.note_zh)}</div>
      ${alerts.length?`<div><h4 style="margin:12px 0 0;color:#c4ccd8">Candidate alerts（待复查）</h4>${alerts.map(alertCard).join("")}</div>`:""}
      ${renderEastAsiaEnergyBlock("chokepoint", id)}
      ${renderMagnitudeLayerBlock("chokepoint", id)}`;
  } else if (type === "company"){
    const co = companyById.get(id);
    const nodes = [...nodeById.values()].filter(n => (n.companies||[]).includes(id));
    const pnodes = [...politicalNodeById.values()].filter(n => (n.companies||[]).includes(id));
    html = `<div class="detail-kind">公司 / Company</div>
      <h3>${esc(co.name)} <span class="ev ev-${co.evidence}">${esc(co.evidence)}</span></h3>
      ${companyNarrative(co, nodes)}
      <div class="detail-grid">
        <div class="dcard"><h4>所在国 Country</h4><div class="tagrow"><button data-code="${esc(co.country)}">${esc(countryName(co.country))}</button></div></div>
        <div class="dcard"><h4>角色 Role</h4><div>${esc(co.role_zh)} · ${esc(co.role_en)}</div></div>
        <div class="dcard"><h4>相关栈节点 Stack nodes</h4>${nodes.length?`<div class="tagrow">${nodes.map(n=>`<button data-node="${esc(n.id)}">${esc(n.label_zh)}</button>`).join("")}</div>`:`<div class="gap-line">unknown</div>`}</div>
        <div class="dcard"><h4>政治栈节点 Political nodes</h4>${pnodes.length?`<div class="tagrow">${pnodes.map(n=>`<button data-polnode="${esc(n.id)}">${esc(n.label_zh)}</button>`).join("")}</div>`:`<div class="gap-line">本版未建立</div>`}</div>
        ${magnitudeSummaryCard("company", id)}
      </div>
      ${renderMagnitudeLayerBlock("company", id)}`;
  } else if (type === "alert"){
    const a = D.candidateAlerts.find(x => x.id === id);
    html = `<div class="detail-kind">Candidate alert · 待复查线索</div>
      <h3>${esc(a.title_zh)} · ${esc(a.title_en)} <span class="ev ev-needs-review">${esc(a.status)}</span></h3>
      <p>${esc(a.signal_zh)}</p><p style="color:var(--muted)">${esc(a.signal_en)}</p>
      <div class="gap-strong">这是 candidate alert，只是线索，<strong>不是结论</strong>。请回原始来源核证后再判断。</div>`;
  }
  detailBody.innerHTML = activeGuideBanner() + html;
  // wire cross-reference buttons inside detail
  detailBody.querySelectorAll("[data-node]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); selectNode(b.getAttribute("data-node")); }));
  detailBody.querySelectorAll("[data-polnode]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); selectPoliticalNode(b.getAttribute("data-polnode")); }));
  detailBody.querySelectorAll("[data-code]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); selectCountry(b.getAttribute("data-code")); }));
  detailBody.querySelectorAll("[data-company]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); selectCompany(b.getAttribute("data-company")); }));
  detailBody.querySelectorAll("[data-choke]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); selectChokepoint(b.getAttribute("data-choke")); }));
  detailBody.querySelectorAll("[data-alert]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); selectAlert(b.getAttribute("data-alert")); }));
}

// ---- East Asia Energy data pack (v1, source-linked only) ----
// Pure renderer. Pulls from window.STACK_ATLAS_EAST_ASIA_ENERGY, never mutates
// it, never upgrades any row's evidence_status. RU appears in relations but is
// not on the MVP map, so it's shown as an "external source" badge without a
// jump link. Institutional entities (knoc/jogmec/meti_enecho/motie/iea) are
// shown as plain chips without jump links.
const EAE = window.STACK_ATLAS_EAST_ASIA_ENERGY || null;
const EAE_ATLAS_COUNTRIES = new Set(EAE ? EAE.meta.atlas_countries : []);
const EAE_ENERGY_NODES = new Set(EAE ? EAE.meta.energy_nodes : []);
const EAE_CHOKEPOINTS = new Set(EAE ? EAE.meta.chokepoints : []);
const EAE_INSTITUTIONS = new Set(["iea", "eia", "knoc", "jogmec", "meti_enecho", "motie"]);

function eaeEntityLabel(id) {
  if (!EAE) return esc(id);
  if (EAE_ATLAS_COUNTRIES.has(id)) return esc(countryName(id));
  const ent = EAE.entities.find(e => e.entity_id === id);
  if (ent) return `${esc(ent.name_zh)} · ${esc(ent.name_en)}`;
  return esc(id);
}

function eaeEntityChip(id) {
  if (!EAE) return esc(id);
  if (EAE_ATLAS_COUNTRIES.has(id)) {
    return `<button class="eae-chip" data-code="${esc(id)}">${esc(countryName(id))}</button>`;
  }
  if (EAE_CHOKEPOINTS.has(id)) {
    const cp = chokeById.get(id);
    return `<button class="eae-chip" data-choke="${esc(id)}">${esc(cp ? cp.name_zh : id)}</button>`;
  }
  if (EAE_ENERGY_NODES.has(id)) {
    const n = nodeById.get(id);
    return `<button class="eae-chip" data-node="${esc(id)}">${esc(n ? n.label_zh : id)}</button>`;
  }
  // RU and other non-atlas country codes → external-source badge, not clickable
  if (/^[A-Z]{2}$/.test(id)) {
    return `<span class="eae-chip eae-ext-source" title="external source — not on MVP map">${esc(id)} · external source · not on MVP map</span>`;
  }
  // institutions and the rest → plain chip
  return `<span class="eae-chip eae-inst">${eaeEntityLabel(id)}</span>`;
}

function eaeMetricRow(m) {
  const partner = m.partner_country_or_source && m.partner_country_or_source !== "-"
    ? `<span class="eae-partner">vs ${esc(m.partner_country_or_source)}</span>` : "";
  const commodity = m.commodity && m.commodity !== "-"
    ? `<span class="eae-commodity">${esc(m.commodity)}</span>` : "";
  const period = m.period ? `<span class="eae-period">${esc(m.period)}</span>` : "";
  const value = `<strong class="eae-value">${esc(m.value)}</strong> <span class="eae-unit">${esc(m.unit)}</span>`;
  const src = m.source_url
    ? `<a class="eae-src" href="${esc(m.source_url)}" target="_blank" rel="noopener">${esc(m.source_title)}</a>`
    : `<span class="eae-src">${esc(m.source_title)}</span>`;
  const note = m.method_note ? `<div class="eae-note">${esc(m.method_note)}</div>` : "";
  const gapNote = m.gap_note ? `<div class="eae-gap-inline">⚠ ${esc(m.gap_note)}</div>` : "";
  return `<div class="eae-metric">
    <div class="eae-metric-head">
      <span class="eae-mid">${esc(m.metric_id)}</span>
      ${period}${commodity}${partner}
      <span class="ev ev-${esc(m.evidence_status)}">${esc(m.evidence_status)}</span>
    </div>
    <div class="eae-metric-body">${value}</div>
    ${note}
    ${gapNote}
    <div class="eae-src-line">来源 / source: ${src}</div>
  </div>`;
}

function eaeRelationRow(r) {
  const fromChip = eaeEntityChip(r.from_entity);
  const viaChip = r.via_stack_node ? eaeEntityChip(r.via_stack_node) : "";
  const toChip = eaeEntityChip(r.to_entity);
  const commodity = r.commodity ? `<span class="eae-commodity">${esc(r.commodity)}</span>` : "";
  const src = r.source_url
    ? `<a class="eae-src" href="${esc(r.source_url)}" target="_blank" rel="noopener">${esc(r.source_title)}</a>`
    : `<span class="eae-src">${esc(r.source_title)}</span>`;
  const note = r.note ? `<div class="eae-note">${esc(r.note)}</div>` : "";
  return `<div class="eae-relation">
    <div class="eae-rel-flow">${fromChip} → ${viaChip} → ${toChip} ${commodity}
      <span class="ev ev-${esc(r.evidence_status)}">${esc(r.evidence_status)}</span>
    </div>
    ${note}
    <div class="eae-src-line">来源 / source: ${src}</div>
  </div>`;
}

function eaeGapRow(g) {
  return `<div class="eae-gap-row eae-gap-status-${esc(g.status)}">
    <div class="eae-gap-head">
      <span class="eae-gap-topic">${esc(g.topic)}</span>
      <span class="ev ev-${esc(g.status)}">${esc(g.status)}</span>
    </div>
    <div class="eae-gap-body">${esc(g.what_is_missing)}</div>
    <div class="eae-gap-meta">为什么影响数据 / why: ${esc(g.why_it_matters_for_data)}</div>
    ${g.candidate_source ? `<div class="eae-gap-meta">候选来源 / candidate: ${esc(g.candidate_source)}</div>` : ""}
  </div>`;
}

function eaePickGaps(type, id) {
  if (!EAE) return [];
  const all = EAE.gaps;
  if (type === "country") {
    if (id === "CN") return all.filter(g => g.gap_id.includes("cn") || g.gap_id === "gap_jp_kr_netimport_days" || g.gap_id === "gap_comtrade" || g.gap_id === "gap_refinery_adapt" || g.gap_id === "gap_reroute_time");
    if (id === "JP" || id === "KR") return all.filter(g => g.gap_id.includes("jp") || g.gap_id.includes("kr") || g.gap_id === "gap_comtrade" || g.gap_id === "gap_refinery_adapt" || g.gap_id === "gap_reroute_time");
    if (id === "IN") return all.filter(g => g.gap_id === "gap_india" || g.gap_id === "gap_comtrade" || g.gap_id === "gap_refinery_adapt" || g.gap_id === "gap_reroute_time");
    if (id === "SG") return all.filter(g => g.gap_id === "gap_singapore" || g.gap_id === "gap_refinery_adapt");
    if (id === "SA" || id === "AE") return all.filter(g => g.gap_id === "gap_ae_bypass" || g.gap_id === "gap_comtrade");
    if (id === "QA") return all.filter(g => g.gap_id === "gap_comtrade");
    return [];
  }
  if (type === "node") {
    if (id === "en-refinery") return all.filter(g => ["gap_refinery_adapt", "gap_india", "gap_singapore"].includes(g.gap_id));
    if (id === "en-reserve") return all.filter(g => ["gap_cn_spr", "gap_jp_kr_netimport_days", "gap_kr_lpg_days"].includes(g.gap_id));
    if (id === "en-tanker") return all.filter(g => ["gap_reroute_time", "gap_ae_bypass"].includes(g.gap_id));
    if (id === "en-crude") return all.filter(g => ["gap_comtrade", "gap_ae_bypass"].includes(g.gap_id));
    if (id === "en-lng") return all.filter(g => g.gap_id === "gap_comtrade");
    return [];
  }
  if (type === "chokepoint") {
    if (id === "hormuz") return all.filter(g => ["gap_ae_bypass", "gap_reroute_time"].includes(g.gap_id));
    if (id === "malacca") return all.filter(g => g.gap_id === "gap_singapore" || g.gap_id === "gap_reroute_time");
    return all.filter(g => g.gap_id === "gap_reroute_time");
  }
  return [];
}

function eaeAllGapsBlock() {
  if (!EAE || !EAE.gaps.length) return "";
  const rows = EAE.gaps.map(eaeGapRow).join("");
  return `<details class="eae-all-gaps">
    <summary>查看全部 ${EAE.gaps.length} 个数据缺口 / All ${EAE.gaps.length} data gaps</summary>
    <div class="eae-all-gaps-body">${rows}</div>
  </details>`;
}

function eaeBlock(opts) {
  // opts: { title, metrics, relations, gaps }
  if (!EAE) return "";
  const m = opts.metrics || [];
  const r = opts.relations || [];
  const g = opts.gaps || [];
  if (!m.length && !r.length && !g.length) {
    return `<section class="eae-section">
      <h4 class="eae-title">East Asia Energy · ${esc(opts.title)}</h4>
      <p class="eae-discipline">${esc(EAE.meta.discipline_note_zh)}<br><span class="eae-discipline-en">${esc(EAE.meta.discipline_note_en)}</span></p>
      <p class="eae-empty">本批数据包未覆盖此节点。Data pack does not cover this entity.</p>
      ${eaeAllGapsBlock()}
    </section>`;
  }
  const metricsHtml = m.length ? `<div class="eae-sub"><h5>指标 / Metrics (${m.length})</h5>${m.map(eaeMetricRow).join("")}</div>` : "";
  const relsHtml = r.length ? `<div class="eae-sub"><h5>关系边 / Relations (${r.length})</h5>${r.map(eaeRelationRow).join("")}</div>` : "";
  const gapsHtml = g.length ? `<div class="eae-sub"><h5>本节点相关缺口 / Related gaps (${g.length})</h5>${g.map(eaeGapRow).join("")}</div>` : "";
  return `<section class="eae-section">
    <h4 class="eae-title">East Asia Energy · ${esc(opts.title)}</h4>
    <p class="eae-discipline">${esc(EAE.meta.discipline_note_zh)}<br><span class="eae-discipline-en">${esc(EAE.meta.discipline_note_en)}</span></p>
    ${metricsHtml}${relsHtml}${gapsHtml}
    ${eaeAllGapsBlock()}
  </section>`;
}

function renderEastAsiaEnergyBlock(type, id) {
  if (!EAE) return "";
  if (type === "country") {
    if (!EAE_ATLAS_COUNTRIES.has(id)) return "";
    const c = countryByCode.get(id);
    return eaeBlock({
      title: `${c.name_zh} / ${c.name_en}`,
      metrics: EAE.lookup.metricsByCountry[id] || [],
      relations: EAE.lookup.relationsByCountry[id] || [],
      gaps: eaePickGaps("country", id)
    });
  }
  if (type === "node") {
    if (!EAE_ENERGY_NODES.has(id)) return "";
    const n = nodeById.get(id);
    return eaeBlock({
      title: `${n.label_zh} / ${n.label_en}`,
      metrics: EAE.lookup.metricsByNode[id] || [],
      relations: EAE.lookup.relationsByNode[id] || [],
      gaps: eaePickGaps("node", id)
    });
  }
  if (type === "chokepoint") {
    if (!EAE_CHOKEPOINTS.has(id)) return "";
    const cp = chokeById.get(id);
    return eaeBlock({
      title: `${cp.name_zh} / ${cp.name_en}`,
      metrics: EAE.lookup.metricsByChokepoint[id] || [],
      relations: EAE.lookup.relationsByChokepoint[id] || [],
      gaps: eaePickGaps("chokepoint", id)
    });
  }
  return "";
}

// ---- Magnitude Layer (v0.1 seed ledger) ----
// Shows "how much / how concentrated / how gate-like" without pretending that
// different scale families are comparable. No line width or area encoding is
// derived here; every card keeps its scale_family visible.
const MAG = window.STACK_ATLAS_MAGNITUDE_LAYER || null;
const magCandidateById = new Map(MAG ? MAG.candidates.map(c => [c.candidate_id, c]) : []);

function magFilterDef() {
  return MAG_FILTERS.find(f => f.id === magnitudeFilter) || MAG_FILTERS[0];
}

function magPassesFilter(candidate) {
  if (!candidate || !magnitudeEnabled) return false;
  const filter = magFilterDef();
  if (filter.id === "all") return true;
  if (filter.matcher) return filter.matcher(candidate);
  return (filter.families || []).includes(candidate.scale_family);
}

function filteredMagCandidates(candidates) {
  return (candidates || []).filter(magPassesFilter);
}

function renderMagnitudeControls() {
  const toggle = document.getElementById("mag-toggle");
  const group = document.getElementById("mag-filter-group");
  if (!toggle || !group) return;
  if (!MAG) {
    toggle.disabled = true;
    toggle.textContent = "MAG unavailable";
    return;
  }
  toggle.textContent = magnitudeEnabled ? "MAG on" : "MAG off";
  toggle.classList.toggle("active", magnitudeEnabled);
  toggle.setAttribute("aria-pressed", String(magnitudeEnabled));
  group.innerHTML = MAG_FILTERS.map(filter => {
    const active = magnitudeFilter === filter.id;
    return `<button type="button" class="${active ? "active" : ""}" data-mag-filter="${esc(filter.id)}">${esc(filter.label)}</button>`;
  }).join("");
  group.querySelectorAll("[data-mag-filter]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      magnitudeFilter = button.getAttribute("data-mag-filter") || "all";
      renderMagnitudeControls();
      renderStack();
      if (current) renderDetail(current.type, current.id);
    });
  });
  toggle.onclick = e => {
    e.stopPropagation();
    magnitudeEnabled = !magnitudeEnabled;
    renderMagnitudeControls();
    renderStack();
    if (current) renderDetail(current.type, current.id);
  };
}

function evidenceClass(status) {
  if (status === "verified" || status === "source-linked" || status === "query-designed" || status === "needs-review" || status === "unknown") return status;
  if (status === "blocked" || status === "needs-api-key" || status === "needs-extraction" || status === "source-limited") return "unknown";
  if (status === "lead-only") return "needs-review";
  return "unknown";
}

function magCandidatesFor(type, id) {
  if (!MAG) return [];
  const key = type === "node" ? "byNode"
    : type === "country" ? "byCountry"
    : type === "company" ? "byCompany"
    : type === "chokepoint" ? "byChokepoint"
    : "";
  return filteredMagCandidates((MAG.lookup[key]?.[id] || []).map(cid => magCandidateById.get(cid)).filter(Boolean));
}

function magnitudeNodeBadge(nodeId) {
  if (!MAG || !magnitudeEnabled) return "";
  const candidates = filteredMagCandidates((MAG.lookup.byNode[nodeId] || []).map(id => magCandidateById.get(id)).filter(Boolean));
  if (!candidates.length) return "";
  const verified = candidates.filter(c => c.evidence_status === "verified").length;
  const label = verified ? `MAG ${verified}/${candidates.length}` : `MAG ${candidates.length}`;
  return `<span class="mag-badge" title="Magnitude Layer candidates">${esc(label)}</span>`;
}

function magnitudeSummaryCard(type, id) {
  const candidates = magCandidatesFor(type, id);
  if (!candidates.length) return "";
  const verifiedFacts = candidates.reduce((sum, c) => sum + (c.facts || []).filter(f => f.evidence_status === "verified").length, 0);
  const sourceLinkedFacts = candidates.reduce((sum, c) => sum + (c.facts || []).filter(f => f.evidence_status === "source-linked").length, 0);
  const scaleFamilies = [...new Set(candidates.map(c => c.scale_family))].slice(0, 4);
  return `<div class="dcard mag-summary-card">
    <h4>Magnitude</h4>
    <div class="mag-summary-line"><strong>MAG</strong><span>${candidates.length} candidates</span></div>
    <div class="mag-summary-line"><span>${verifiedFacts} verified facts</span><span>${sourceLinkedFacts} source-linked</span></div>
    <div class="tagrow">${scaleFamilies.map(s => `<span class="mag-scale">${esc(s)}</span>`).join("")}</div>
    <div class="gap-line">完整数量级卡在下方 Magnitude Layer 分区。</div>
  </div>`;
}

function magFactRow(row) {
  const value = `${esc(row.value)} ${esc(row.unit)}`.trim();
  return `<div class="mag-fact-row">
    <div class="mag-fact-main">
      <strong>${value}</strong>
      <span class="mag-scope">${esc(row.scope)}</span>
      <span class="ev ev-${evidenceClass(row.evidence_status)}">${esc(row.evidence_status)}</span>
    </div>
    <div class="mag-fact-meta">
      <span>${esc(row.time_period)}</span>
      <span>${esc(row.organization)}</span>
      <span>${esc(row.original_caption)}</span>
    </div>
  </div>`;
}

function magGapRow(gap) {
  return `<div class="mag-gap-row">
    <div class="mag-gap-head">
      <strong>${esc(gap.gap_type)}</strong>
      <span class="ev ev-${evidenceClass(gap.status)}">${esc(gap.status)}</span>
    </div>
    <div>${esc(gap.what_is_missing)}</div>
    <div class="mag-gap-meta">${esc(gap.next_action)}</div>
  </div>`;
}

function magLagRow(lag) {
  const value = lag.value ? `${esc(lag.value)} ${esc(lag.unit)}`.trim() : "unknown";
  return `<div class="mag-lag-row">
    <strong>${esc(lag.lag_type)}</strong>
    <span>${value}</span>
    <span class="ev ev-${evidenceClass(lag.evidence_status)}">${esc(lag.evidence_status)}</span>
    <div class="mag-gap-meta">${esc(lag.notes)}</div>
  </div>`;
}

function magCandidateCard(candidate) {
  const facts = candidate.facts || [];
  const visibleFacts = facts.slice(0, 6);
  const hiddenFacts = facts.slice(6);
  const factsHtml = facts.length
    ? `<div class="mag-sub"><h5>事实行 / Facts (${facts.length})</h5>${visibleFacts.map(magFactRow).join("")}
        ${hiddenFacts.length ? `<details class="mag-more"><summary>展开其余 ${hiddenFacts.length} 条事实行</summary>${hiddenFacts.map(magFactRow).join("")}</details>` : ""}</div>`
    : `<div class="mag-empty">本候选暂无可展示事实行。No fact rows yet.</div>`;
  const gapsHtml = candidate.gaps?.length
    ? `<div class="mag-sub"><h5>缺口 / Blockers (${candidate.gaps.length})</h5>${candidate.gaps.map(magGapRow).join("")}</div>`
    : "";
  const lagsHtml = candidate.lags?.length
    ? `<div class="mag-sub"><h5>替代滞后 / Substitution lag (${candidate.lags.length})</h5>${candidate.lags.map(magLagRow).join("")}</div>`
    : "";
  return `<article class="mag-card">
    <div class="mag-card-head">
      <div>
        <h5>${esc(candidate.object || candidate.candidate_id)}</h5>
        <div class="mag-target">${esc(candidate.target)}</div>
      </div>
      <span class="ev ev-${evidenceClass(candidate.evidence_status)}">${esc(candidate.evidence_status)}</span>
    </div>
    <div class="mag-meta-row">
      <span class="mag-scale">${esc(candidate.scale_family)}</span>
      ${candidate.gate_type ? `<span class="mag-gate">${esc(candidate.gate_type)}</span>` : ""}
    </div>
    ${candidate.why_low_fame_high_control ? `<p class="mag-why">${esc(candidate.why_low_fame_high_control)}</p>` : ""}
    ${factsHtml}${lagsHtml}${gapsHtml}
  </article>`;
}

function renderMagnitudeLayerBlock(type, id) {
  if (!MAG) return "";
  const candidates = magCandidatesFor(type, id);
  if (!candidates.length) return "";
  const verifiedFacts = candidates.reduce((sum, c) => sum + (c.facts || []).filter(f => f.evidence_status === "verified").length, 0);
  const sourceLinkedFacts = candidates.reduce((sum, c) => sum + (c.facts || []).filter(f => f.evidence_status === "source-linked").length, 0);
  return `<section class="mag-section">
    <div class="mag-section-head">
      <div>
        <h4>Magnitude Layer · 数量级层</h4>
        <p>${esc(MAG.meta.discipline_note_zh)}<br><span>${esc(MAG.meta.discipline_note_en)}</span></p>
      </div>
      <div class="mag-counts">
        <span>${candidates.length} candidates</span>
        <span>${verifiedFacts} verified facts</span>
        <span>${sourceLinkedFacts} source-linked</span>
      </div>
    </div>
    <div class="mag-warning">${esc(MAG.meta.encoding_warning)}</div>
    <div class="mag-grid">${candidates.map(magCandidateCard).join("")}</div>
  </section>`;
}

// init
renderMagnitudeControls();
applyMapTransform();
renderStack();
renderPoliticalStack();
renderGuidedPaths();
renderOverlapLab();
renderTransmissionLab();
renderPoliticalMagLab();
applyViewMode();
