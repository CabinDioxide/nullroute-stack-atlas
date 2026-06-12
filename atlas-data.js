/* Stack Atlas data — hand-authored from public structural facts only.
 *
 * Evidence discipline (aligns with wiki/monitoring source-registry taxonomy):
 *   verified       — geographic / corporate-HQ / official-control facts
 *   source-linked  — well-reported structural dependency, Atlas is not the origin
 *   query-designed — a monitoring/query design layer, not validated commodity evidence
 *   needs-review   — candidate signal for later verification; NEVER a conclusion
 *   unknown        — relationship not established here; shown as a gap, not hidden
 *
 * Nothing uncertain is dressed up as verified. Where a relationship is not
 * defensible from public structural fact, it is left `unknown` / `needs source`.
 * Final evidence grading is Nullroute's, not the interface's.
 */
window.ATLAS_DATA = {
  meta: {
    title_zh: "Stack Atlas · 技术栈与世界的双地图",
    title_en: "Stack Atlas · dual map of stacks and the world",
    note_zh: "公共可读的依赖探索界面，不是结论预言机。candidate alert 只是待复查线索。",
    note_en: "A public dependency-exploration interface, not a conclusion oracle. Candidate alerts are leads to review.",
    liveDataHook: "wiki/monitoring/data/live/live-data.js", // future ingest target
    evidenceLevels: ["verified", "source-linked", "query-designed", "needs-review", "unknown"]
  },

  // node status vocabulary (per ticket)
  statusVocab: ["controlled", "dependent", "contested", "blocked", "fallback", "unknown"],

  layers: [
    { id: "L0", label_zh: "L0 物理层", label_en: "L0 Physical" },
    { id: "L1", label_zh: "L1 计算/系统", label_en: "L1 Compute / System" },
    { id: "L2", label_zh: "L2 组织", label_en: "L2 Organization" },
    { id: "L3", label_zh: "L3 法律/控制", label_en: "L3 Legal / Control" },
    { id: "L4", label_zh: "L4 叙事/市场", label_en: "L4 Narrative / Market" }
  ],

  politicalLayers: [
    { id: "P0", label_zh: "P0 物理强制层", label_en: "P0 Physical coercion" },
    { id: "P1", label_zh: "P1 法域/规则层", label_en: "P1 Jurisdiction / rules" },
    { id: "P2", label_zh: "P2 制度/联盟层", label_en: "P2 Institutions / alliances" },
    { id: "P3", label_zh: "P3 国内政治层", label_en: "P3 Domestic politics" },
    { id: "P4", label_zh: "P4 叙事/合法性层", label_en: "P4 Narrative / legitimacy" }
  ],

  // 13 countries. centroid: [x,y] in the 1000x500 world viewBox.
  // Most come from WORLD_CENTROIDS at runtime; SG is injected (too small for 110m).
  countries: [
    { code: "US", num: "840", name_zh: "美国", name_en: "United States" },
    { code: "CN", num: "156", name_zh: "中国", name_en: "China" },
    { code: "TW", num: "158", name_zh: "台湾", name_en: "Taiwan" },
    { code: "JP", num: "392", name_zh: "日本", name_en: "Japan" },
    { code: "KR", num: "410", name_zh: "韩国", name_en: "South Korea" },
    { code: "NL", num: "528", name_zh: "荷兰", name_en: "Netherlands" },
    { code: "DE", num: "276", name_zh: "德国", name_en: "Germany" },
    { code: "SG", num: "702", name_zh: "新加坡", name_en: "Singapore", centroidOverride: [788.3, 246.3] },
    { code: "MY", num: "458", name_zh: "马来西亚", name_en: "Malaysia" },
    { code: "SA", num: "682", name_zh: "沙特", name_en: "Saudi Arabia" },
    { code: "QA", num: "634", name_zh: "卡塔尔", name_en: "Qatar" },
    { code: "AE", num: "784", name_zh: "阿联酋", name_en: "UAE" },
    { code: "IN", num: "356", name_zh: "印度", name_en: "India" }
  ],

  // chokepoints: pos [x,y] projected from lon/lat (equirectangular, 1000x500).
  chokepoints: [
    { id: "hormuz",   name_zh: "霍尔木兹海峡",  name_en: "Strait of Hormuz",   pos: [656.4, 196.4], evidence: "verified",
      affectsCountries: ["SA","QA","AE","JP","KR","IN","CN"], affectsStacks: ["energy"],
      note_zh: "波斯湾原油/LNG 出海口；地理事实。具体流量依赖比例 needs source。",
      note_en: "Gulf crude/LNG outlet; geographic fact. Exact dependency shares: needs source." },
    { id: "malacca",  name_zh: "马六甲海峡",    name_en: "Strait of Malacca",  pos: [787.5, 248.6], evidence: "verified",
      affectsCountries: ["CN","JP","KR","SG","MY"], affectsStacks: ["energy","reachability"],
      note_zh: "东亚原油/LNG 主航道 + 主要海缆走廊；地理事实。",
      note_en: "Main East Asia crude/LNG lane + major submarine-cable corridor; geographic fact." },
    { id: "suez",     name_zh: "苏伊士运河",    name_en: "Suez Canal",         pos: [589.7, 167.8], evidence: "verified",
      affectsCountries: ["DE","NL","IN","SA"], affectsStacks: ["energy","reachability"],
      note_zh: "欧亚海运/海缆通道；地理事实。",
      note_en: "Europe–Asia shipping / cable corridor; geographic fact." },
    { id: "panama",   name_zh: "巴拿马运河",    name_en: "Panama Canal",       pos: [264.0, 270.0], evidence: "verified",
      affectsCountries: ["US"], affectsStacks: ["energy"],
      note_zh: "美洲两洋通道；与本版三 stack 关联较弱，列入供对照。",
      note_en: "Inter-ocean Americas route; weak link to these 3 stacks, shown for contrast." },
    { id: "babelmandeb", name_zh: "曼德海峡",   name_en: "Bab-el-Mandeb",      pos: [619.4, 219.4], evidence: "verified",
      affectsCountries: ["SA","IN","DE","NL"], affectsStacks: ["energy","reachability"],
      note_zh: "红海南口；原油与海缆通道。",
      note_en: "Red Sea southern gate; crude and cable corridor." }
  ],

  // representative, defensible companies only. Uncertain scope -> not invented.
  companies: [
    { id: "nvidia",   name: "NVIDIA",     country: "US", role_zh: "GPU 设计",      role_en: "GPU design",        evidence: "verified" },
    { id: "tsmc",     name: "TSMC",       country: "TW", role_zh: "先进代工",      role_en: "Advanced foundry",  evidence: "verified" },
    { id: "asml",     name: "ASML",       country: "NL", role_zh: "EUV 光刻",      role_en: "EUV lithography",   evidence: "verified" },
    { id: "samsung",  name: "Samsung",    country: "KR", role_zh: "存储/代工",     role_en: "Memory / foundry",  evidence: "verified" },
    { id: "skhynix",  name: "SK Hynix",   country: "KR", role_zh: "HBM/存储",      role_en: "HBM / memory",      evidence: "verified" },
    { id: "synopsys", name: "Synopsys",   country: "US", role_zh: "EDA",           role_en: "EDA",               evidence: "verified" },
    { id: "cadence",  name: "Cadence",    country: "US", role_zh: "EDA",           role_en: "EDA",               evidence: "verified" },
    { id: "aramco",   name: "Saudi Aramco", country: "SA", role_zh: "原油",        role_en: "Crude oil",         evidence: "verified" },
    { id: "qatargas", name: "QatarEnergy",  country: "QA", role_zh: "LNG",         role_en: "LNG",               evidence: "verified" },
    { id: "adnoc",    name: "ADNOC",      country: "AE", role_zh: "原油/天然气",   role_en: "Crude / gas",       evidence: "verified" },
    { id: "hyperscalers", name: "US hyperscalers (AWS/Azure/GCP)", country: "US", role_zh: "云控制面",  role_en: "Cloud control plane", evidence: "source-linked" }
  ],

  // 3 stacks. Each node: layer, status, evidence, related countries/companies/chokepoints, gap.
  stacks: [
    {
      id: "ai-compute", name_zh: "AI 算力栈", name_en: "AI Compute Stack",
      nodes: [
        { id: "ac-power",   layer: "L0", label_zh: "数据中心电力/冷却", label_en: "DC power / cooling", status: "contested", evidence: "source-linked",
          countries: ["US","CN"], companies: [], chokepoints: [], gap_zh: "各国具体并网/许可瓶颈 needs source", gap_en: "Grid/permit bottlenecks per country: needs source" },
        { id: "ac-fab",     layer: "L0", label_zh: "先进芯片制造", label_en: "Advanced fab", status: "controlled", evidence: "verified",
          countries: ["TW","KR"], companies: ["tsmc","samsung"], chokepoints: [], gap_zh: "", gap_en: "" },
        { id: "ac-euv",     layer: "L0", label_zh: "EUV 光刻设备", label_en: "EUV lithography", status: "controlled", evidence: "verified",
          countries: ["NL"], companies: ["asml"], chokepoints: [], gap_zh: "", gap_en: "" },
        { id: "ac-gpu",     layer: "L1", label_zh: "GPU", label_en: "GPU", status: "controlled", evidence: "verified",
          countries: ["US","TW"], companies: ["nvidia","tsmc"], chokepoints: [], gap_zh: "", gap_en: "" },
        { id: "ac-hbm",     layer: "L1", label_zh: "HBM 高带宽存储", label_en: "HBM memory", status: "dependent", evidence: "source-linked",
          countries: ["KR","US"], companies: ["skhynix","samsung"], chokepoints: [], gap_zh: "中国本土 HBM 进度 needs source", gap_en: "China domestic HBM progress: needs source" },
        { id: "ac-eda",     layer: "L1", label_zh: "EDA 工具", label_en: "EDA tools", status: "controlled", evidence: "verified",
          countries: ["US"], companies: ["synopsys","cadence"], chokepoints: [], gap_zh: "", gap_en: "" },
        { id: "ac-cloud",   layer: "L2", label_zh: "云 GPU 容量", label_en: "Cloud GPU capacity", status: "dependent", evidence: "source-linked",
          countries: ["US"], companies: ["hyperscalers"], chokepoints: [], gap_zh: "区域可用区分布 needs source", gap_en: "Regional AZ distribution: needs source" },
        { id: "ac-export",  layer: "L3", label_zh: "出口管制", label_en: "Export control", status: "blocked", evidence: "source-linked",
          countries: ["US","CN"], companies: [], chokepoints: [], gap_zh: "逐条许可状态回到 BIS 原文核", gap_en: "Per-license status: verify against BIS originals" },
        { id: "ac-narr",    layer: "L4", label_zh: "算力主权叙事", label_en: "Compute-sovereignty narrative", status: "contested", evidence: "unknown",
          countries: ["US","CN"], companies: [], chokepoints: [], gap_zh: "叙事强度无可审计指标，标 unknown", gap_en: "No auditable metric for narrative; marked unknown" }
      ]
    },
    {
      id: "energy", name_zh: "东亚能源栈", name_en: "East Asia Energy Stack",
      nodes: [
        { id: "en-crude",   layer: "L0", label_zh: "原油生产", label_en: "Crude production", status: "dependent", evidence: "verified",
          countries: ["SA","AE"], companies: ["aramco","adnoc"], chokepoints: ["hormuz"], gap_zh: "", gap_en: "" },
        { id: "en-lng",     layer: "L0", label_zh: "LNG 生产", label_en: "LNG production", status: "dependent", evidence: "verified",
          countries: ["QA"], companies: ["qatargas"], chokepoints: ["hormuz"], gap_zh: "", gap_en: "" },
        { id: "en-tanker",  layer: "L1", label_zh: "油轮/LNG 航道", label_en: "Tanker / LNG routes", status: "contested", evidence: "source-linked",
          countries: ["JP","KR","CN","IN"], companies: [], chokepoints: ["hormuz","malacca","babelmandeb"], gap_zh: "保险/重航成本 needs source", gap_en: "Insurance / rerouting cost: needs source" },
        { id: "en-refinery",layer: "L1", label_zh: "炼厂", label_en: "Refining", status: "dependent", evidence: "unknown",
          countries: ["CN","IN","SG"], companies: [], chokepoints: [], gap_zh: "各国炼能与依赖度 needs source", gap_en: "Refining capacity & dependency: needs source" },
        { id: "en-reserve", layer: "L2", label_zh: "战略储备", label_en: "Strategic reserves", status: "unknown", evidence: "unknown",
          countries: ["CN","JP","KR","IN"], companies: [], chokepoints: [], gap_zh: "储备天数为非公开/估算，标 unknown", gap_en: "Reserve days are non-public/estimated; unknown" },
        { id: "en-sanction",layer: "L3", label_zh: "能源制裁/价格上限", label_en: "Energy sanctions / price cap", status: "contested", evidence: "source-linked",
          countries: ["US","DE","NL"], companies: [], chokepoints: [], gap_zh: "逐项措施回官方公告核", gap_en: "Per-measure: verify against official notices" },
        { id: "en-narr",    layer: "L4", label_zh: "能源安全叙事", label_en: "Energy-security narrative", status: "contested", evidence: "unknown",
          countries: ["JP","KR","CN"], companies: [], chokepoints: [], gap_zh: "无可审计指标，标 unknown", gap_en: "No auditable metric; unknown" }
      ]
    },
    {
      id: "reachability", name_zh: "互联网可达性栈", name_en: "Internet Reachability Stack",
      nodes: [
        { id: "re-cable",   layer: "L0", label_zh: "海底光缆", label_en: "Submarine cables", status: "contested", evidence: "source-linked",
          countries: ["SG","US","JP"], companies: [], chokepoints: ["malacca","suez","babelmandeb"], gap_zh: "逐条 cable 走向/业主 needs source", gap_en: "Per-cable route/owner: needs source" },
        { id: "re-bgp",     layer: "L1", label_zh: "BGP 路由", label_en: "BGP routing", status: "contested", evidence: "query-designed",
          countries: ["US","CN"], companies: [], chokepoints: [], gap_zh: "可由 RIPEstat watched ASN 监测；本版仅设计层", gap_en: "Monitorable via RIPEstat watched ASNs; design layer only here" },
        { id: "re-cloud",   layer: "L1", label_zh: "云控制面", label_en: "Cloud control plane", status: "dependent", evidence: "source-linked",
          countries: ["US"], companies: ["hyperscalers"], chokepoints: [], gap_zh: "各国主权云替代度 needs source", gap_en: "Sovereign-cloud substitution per country: needs source" },
        { id: "re-dns",     layer: "L1", label_zh: "DNS / CA", label_en: "DNS / CA", status: "dependent", evidence: "unknown",
          countries: ["US"], companies: [], chokepoints: [], gap_zh: "集中度证据 needs source", gap_en: "Concentration evidence: needs source" },
        { id: "re-cdn",     layer: "L2", label_zh: "CDN", label_en: "CDN", status: "dependent", evidence: "source-linked",
          countries: ["US"], companies: [], chokepoints: [], gap_zh: "可由 Cloudflare Radar 监测（needs token）", gap_en: "Monitorable via Cloudflare Radar (needs token)" },
        { id: "re-filter",  layer: "L3", label_zh: "可用性/制裁/过滤", label_en: "Availability / sanctions / filtering", status: "blocked", evidence: "query-designed",
          countries: ["CN"], companies: [], chokepoints: [], gap_zh: "可由 OONI 测量；本版仅设计层", gap_en: "Measurable via OONI; design layer only here" },
        { id: "re-narr",    layer: "L4", label_zh: "数字主权叙事", label_en: "Digital-sovereignty narrative", status: "contested", evidence: "unknown",
          countries: ["CN","DE"], companies: [], chokepoints: [], gap_zh: "无可审计指标，标 unknown", gap_en: "No auditable metric; unknown" }
      ]
    }
  ],

  politicalStacks: [
    {
      id: "geo-control", name_zh: "地缘政治控制栈", name_en: "Geopolitical Control Stack",
      nodes: [
        { id: "ps-naval-transit", layer: "P0", label_zh: "海上通道强制/护航能力", label_en: "Naval transit coercion / escort capacity", status: "controlled", evidence: "source-linked",
          countries: ["US","JP","KR","SG","SA","AE"], companies: [], chokepoints: ["hormuz","malacca","suez","babelmandeb"], techNodes: ["en-tanker","re-cable"],
          gap_zh: "具体舰队部署、护航规则和维修船可用性需回公开军事/航运来源核", gap_en: "Fleet posture, escort rules, and repair-vessel availability need public-source verification" },
        { id: "ps-port-access", layer: "P0", label_zh: "港口/登陆点准入", label_en: "Port / landing-point access", status: "dependent", evidence: "source-linked",
          countries: ["SG","MY","AE","SA","JP"], companies: [], chokepoints: ["malacca","hormuz","suez"], techNodes: ["en-tanker","re-cable"],
          gap_zh: "逐港口、逐海缆登陆点的所有权与准入规则 needs source", gap_en: "Per-port and cable-landing ownership/access rules need source" },
        { id: "ps-export-control", layer: "P1", label_zh: "出口管制/许可", label_en: "Export controls / licensing", status: "blocked", evidence: "source-linked",
          countries: ["US","CN","NL","TW","JP","KR"], companies: ["asml","nvidia","synopsys","cadence","tsmc"], chokepoints: [], techNodes: ["ac-export","ac-euv","ac-gpu","ac-eda","ac-fab"],
          gap_zh: "逐条许可、实体清单和最终用途规则需回 BIS / EU / NL / JP / KR 原文核", gap_en: "Per-license, entity-list, and end-use rules need original-source verification" },
        { id: "ps-sanctions-service", layer: "P1", label_zh: "制裁/金融与服务可达性", label_en: "Sanctions / financial and service availability", status: "contested", evidence: "source-linked",
          countries: ["US","DE","NL","CN","IN"], companies: ["hyperscalers"], chokepoints: [], techNodes: ["en-sanction","re-filter","re-cloud","re-cdn"],
          gap_zh: "逐项制裁、支付、保险、云服务条款需回官方公告和服务条款核", gap_en: "Measures for sanctions, payment, insurance, and cloud terms need official/source verification" },
        { id: "ps-standards-licensing", layer: "P1", label_zh: "标准/认证/工具授权", label_en: "Standards / certification / tool licensing", status: "controlled", evidence: "source-linked",
          countries: ["US","NL","DE","TW"], companies: ["asml","synopsys","cadence"], chokepoints: [], techNodes: ["ac-eda","ac-euv","re-dns"],
          gap_zh: "认证、授权和标准组织影响力需拆成可审计来源", gap_en: "Certification, licensing, and standards leverage need auditable source rows" },
        { id: "ps-alliance-regimes", layer: "P2", label_zh: "盟友体系/协调机制", label_en: "Alliance regimes / coordination mechanisms", status: "controlled", evidence: "source-linked",
          countries: ["US","JP","KR","TW","NL","DE"], companies: [], chokepoints: ["malacca","suez"], techNodes: ["ac-export","en-sanction","re-cable"],
          gap_zh: "联盟承诺、政策协调和例外条款不能用一句话概括，需拆政策原文", gap_en: "Alliance commitments, coordination, and carve-outs need policy-text decomposition" },
        { id: "ps-energy-coordination", layer: "P2", label_zh: "能源协调/OPEC+与买家政策", label_en: "Energy coordination / OPEC+ and buyer policy", status: "contested", evidence: "source-linked",
          countries: ["SA","QA","AE","JP","KR","CN","IN","US"], companies: ["aramco","qatargas","adnoc"], chokepoints: ["hormuz","malacca"], techNodes: ["en-crude","en-lng","en-tanker","en-reserve"],
          gap_zh: "产量协调、长期合约、储备释放和买家政策需要分来源核", gap_en: "Production coordination, long-term contracts, reserves, and buyer policy need source-separated verification" },
        { id: "ps-industrial-policy", layer: "P3", label_zh: "产业政策/补贴/本土替代", label_en: "Industrial policy / subsidies / substitution", status: "contested", evidence: "source-linked",
          countries: ["US","CN","JP","KR","TW","DE","NL"], companies: ["tsmc","samsung","skhynix","asml","nvidia"], chokepoints: [], techNodes: ["ac-power","ac-fab","ac-hbm","ac-cloud"],
          gap_zh: "补贴金额、项目状态、并网许可和本土替代进度需进 MAG v0.2", gap_en: "Subsidy amounts, project status, permits, and substitution progress belong in MAG v0.2" },
        { id: "ps-domestic-price", layer: "P3", label_zh: "国内价格/就业/选举压力", label_en: "Domestic prices / jobs / electoral pressure", status: "contested", evidence: "unknown",
          countries: ["US","CN","JP","KR","IN","DE"], companies: [], chokepoints: ["hormuz","malacca"], techNodes: ["en-reserve","en-refinery","en-narr","ac-narr"],
          gap_zh: "本版只标出政治压力入口，不给强度评分；需要民调、价格、就业和政策响应数据", gap_en: "This version marks pressure entry points only; intensity needs polling, price, jobs, and response data" },
        { id: "ps-legitimacy-narratives", layer: "P4", label_zh: "国家安全/技术主权/能源安全叙事", label_en: "National-security / tech-sovereignty / energy-security narratives", status: "contested", evidence: "unknown",
          countries: ["US","CN","JP","KR","DE","IN"], companies: [], chokepoints: [], techNodes: ["ac-narr","en-narr","re-narr","ac-export","re-filter"],
          gap_zh: "叙事层目前不做数值判断，只作为政策合法化和动员路径入口", gap_en: "Narrative layer is not quantified here; it is an entry point for legitimation and mobilization paths" }
      ]
    }
  ],

  // candidate alerts — leads only, never conclusions. status fixed to needs-review.
  candidateAlerts: [
    { id: "ca-euv-choke", status: "needs-review", priority: "high",
      title_zh: "EUV 单点依赖（ASML/荷兰）", title_en: "Single-point EUV dependency (ASML/NL)",
      signal_zh: "AI 算力栈 L0 的 EUV 节点为单国单公司控制——结构性单点。请回原文核当前管制与替代进度。",
      signal_en: "AI-compute L0 EUV node is single-country/single-firm controlled — structural single point. Verify current controls and substitution against originals.",
      relNodes: ["ac-euv"], relCountries: ["NL"], relCompanies: ["asml"], relChokepoints: [] },
    { id: "ca-hormuz", status: "needs-review", priority: "high",
      title_zh: "霍尔木兹聚合多依赖", title_en: "Hormuz aggregates multiple dependencies",
      signal_zh: "原油与 LNG 生产节点同时依赖霍尔木兹——多信号汇聚同一 chokepoint。流量比例 needs source。",
      signal_en: "Both crude and LNG production nodes depend on Hormuz — signals converge on one chokepoint. Flow shares: needs source.",
      relNodes: ["en-crude","en-lng"], relCountries: ["SA","QA","AE"], relCompanies: ["aramco","qatargas"], relChokepoints: ["hormuz"] },
    { id: "ca-malacca-dual", status: "needs-review", priority: "medium",
      title_zh: "马六甲同时承能源与海缆", title_en: "Malacca carries both energy and cables",
      signal_zh: "马六甲同时是东亚能源航道与海缆走廊——跨栈 chokepoint。具体 cable 业主 needs source。",
      signal_en: "Malacca is both an East-Asia energy lane and a cable corridor — cross-stack chokepoint. Per-cable owners: needs source.",
      relNodes: ["en-tanker","re-cable"], relCountries: ["CN","JP","KR","SG","MY"], relCompanies: [], relChokepoints: ["malacca"] }
  ]
};
