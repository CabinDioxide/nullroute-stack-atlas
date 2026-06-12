window.STACK_ATLAS_MAGNITUDE_LAYER = {
  "meta": {
    "package": "stack-atlas magnitude seed ledger",
    "version": "v0.1",
    "generated_date": "2026-06-09",
    "built_from": "data/magnitude-seed-ledger/",
    "discipline_note_zh": "数量级层只显示同一 scale_family 内的重量线索；不同量纲不可比较，不能用统一线宽或面积编码。",
    "discipline_note_en": "Magnitude rows are comparable only within the same scale_family. Cross-family line widths or areas are forbidden.",
    "encoding_warning": "Different scale_family values are NOT comparable. minerals_share_pct, seaborne_oil_flow(Mbpd), regulatory_listing_count(entities), memory_maker_revenue(KRW), cable_route_count are distinct dimensions; do not draw a single 'magnitude' line width across them.",
    "counts": {
      "candidates": 12,
      "facts": 39,
      "verified_facts": 34,
      "source_linked_facts": 5,
      "gaps": 11
    }
  },
  "candidates": [
    {
      "candidate_id": "ic-abf",
      "seed_id": "1",
      "suggested_layer": "L0/L1",
      "target": "NEW node ac-abf (material under ac-fab/ac-gpu substrate chain)",
      "scale_family": "material_global_share",
      "metrics": [
        "m-abf-share"
      ],
      "evidence_status": "source-linked",
      "note": "Low-fame/high-control material monopoly; 95% PR-only, qualitative IR-verified.",
      "targets": {
        "nodes": [
          "ac-fab",
          "ac-gpu"
        ],
        "companies": [],
        "chokepoints": [],
        "countries": []
      },
      "gate_type": "material_monopoly",
      "object": "Ajinomoto Build-up Film (ABF)",
      "why_low_fame_high_control": "A food-company-derived insulating film that practically all high-performance CPU/GPU FC-BGA substrates depend on; near-invisible in public tech narrative.",
      "facts": [
        {
          "ledger_id": "lg-abf-share-pr",
          "seed_id": "1",
          "seed_family": "Ajinomoto ABF",
          "metric_id": "m-abf-share",
          "scale_family": "material_global_share",
          "value": "95",
          "unit": "pct (PR-register, NOT verified)",
          "scope": "ABF global market share (Ajinomoto STORY page)",
          "time_period": "2025",
          "source_id": "ajinomoto-story-abf",
          "organization": "Ajinomoto Co. Inc.",
          "local_file": "snapshots/ajinomoto-abf/Ajinomoto_ABF_share_claim_provenance.md",
          "original_caption": "'More like 95% market share' (Ajinomoto corporate STORY / PR page)",
          "evidence_status": "source-linked",
          "reproduce_method": "transcribed from official Ajinomoto story page snapshot",
          "notes": "NOT promoted to verified per Nullroute boundary: 95% does NOT appear in audited IR. Third-party ~95% = lead_only."
        },
        {
          "ledger_id": "lg-abf-share-ir",
          "seed_id": "1",
          "seed_family": "Ajinomoto ABF",
          "metric_id": "m-abf-share",
          "scale_family": "material_global_share",
          "value": "overwhelming share / de facto standard",
          "unit": "qualitative",
          "scope": "ABF global share (audited IR)",
          "time_period": "2025",
          "source_id": "ajinomoto-asv-2025",
          "organization": "Ajinomoto Co. Inc.",
          "local_file": "downloads/ajinomoto-abf/Ajinomoto_ASV_Report_2025_en.pdf",
          "original_caption": "'ABF has an overwhelming share of the global market' / 'de facto standard in the semiconductor industry' (ASV Report 2025, audited)",
          "evidence_status": "source-linked",
          "reproduce_method": "verbatim from audited Integrated Report (qualitative only; no numeric % stated)",
          "notes": "Qualitative claim is audited-IR-backed; numeric share is NOT in the IR."
        }
      ],
      "gaps": [
        {
          "gap_id": "g-abf-numeric",
          "seed_id": "1",
          "seed_family": "Ajinomoto ABF",
          "gap_type": "evidence_tier",
          "what_is_missing": "No numeric ABF market share in any audited Ajinomoto IR; only qualitative 'overwhelming/de facto'.",
          "blocker": "95% exists only on PR story page (source-linked) + third-party (lead_only)",
          "status": "lead-only",
          "next_action": "Keep 95% as source-linked PR; do not promote. If a numeric audited figure is ever needed, it does not currently exist."
        }
      ],
      "lags": [],
      "metric_definitions": [
        {
          "metric_id": "m-abf-share",
          "seed_id": "1",
          "seed_family": "Ajinomoto ABF",
          "metric_type": "share",
          "scale_family": "material_global_share",
          "unit": "pct_or_qualitative",
          "scope": "ABF global market share",
          "time_period": "2025",
          "source_id": "ajinomoto-story-abf;ajinomoto-asv-2025",
          "source_role": "primary",
          "evidence_status": "source-linked",
          "extraction_state": "mixed_tier",
          "notes": "95% PR-only (source-linked); audited IR qualitative 'overwhelming/de facto'."
        }
      ]
    },
    {
      "candidate_id": "ic-substrate",
      "seed_id": "5",
      "suggested_layer": "L0/L1",
      "target": "NEW node ac-substrate (FC-BGA/ABF substrate makers under ac-gpu/ac-hbm)",
      "scale_family": "ic_substrate_capacity",
      "metrics": [
        "m-substrate-capacity"
      ],
      "evidence_status": "source-linked",
      "note": "Per-maker IR capacity; cross-maker split lead_only.",
      "targets": {
        "nodes": [
          "ac-fab",
          "ac-gpu",
          "ac-hbm"
        ],
        "companies": [],
        "chokepoints": [],
        "countries": [
          "TW",
          "KR"
        ]
      },
      "gate_type": "capacity_bottleneck",
      "object": "FC-BGA / ABF package substrate makers (Ibiden, Shinko, Unimicron, Nan Ya)",
      "why_low_fame_high_control": "Advanced package substrate is a multi-year-lead, few-supplier capacity bottleneck under the GPU/HBM stack.",
      "facts": [],
      "gaps": [
        {
          "gap_id": "g-substrate-cap",
          "seed_id": "5",
          "seed_family": "Advanced substrates",
          "gap_type": "extraction_pending",
          "what_is_missing": "Ibiden/Shinko substrate capacity figures not extracted; cross-maker share split absent from any single IR.",
          "blocker": "PDF extraction pending; market split is commercial (lead_only)",
          "status": "needs-extraction",
          "next_action": "Extract per-company capacity from IR PDFs; keep market-share split as lead_only."
        }
      ],
      "lags": [
        {
          "candidate_id": "sl-substrate",
          "seed_id": "5",
          "object": "FC-BGA/ABF package substrate capacity",
          "lag_type": "capacity_expansion_lead_time",
          "value": "unknown",
          "unit": "",
          "source_id": "ibiden-integrated-2025",
          "evidence_status": "unknown",
          "notes": "Substrate capacity expansion is known to be multi-year, but no explicit lead-time figure extracted from IR this round -> unknown, do not guess."
        }
      ],
      "metric_definitions": [
        {
          "metric_id": "m-substrate-capacity",
          "seed_id": "5",
          "seed_family": "Advanced substrates",
          "metric_type": "capacity",
          "scale_family": "ic_substrate_capacity",
          "unit": "relative",
          "scope": "Ibiden/Shinko FC-BGA/ABF substrate capacity",
          "time_period": "FY2024-25",
          "source_id": "ibiden-integrated-2025;shinko-frm-fy2024",
          "source_role": "primary",
          "evidence_status": "source-linked",
          "extraction_state": "pending",
          "notes": "In IR PDFs; extract next version. Cross-maker share split = lead_only."
        }
      ]
    },
    {
      "candidate_id": "ic-euv",
      "seed_id": "2",
      "suggested_layer": "L1",
      "target": "existing asml / ac-euv",
      "scale_family": "euv_installed_base",
      "metrics": [
        "m-asml-euv"
      ],
      "evidence_status": "source-linked",
      "note": "Attach installed-base/backlog magnitude badge once extracted from 20-F.",
      "targets": {
        "nodes": [
          "ac-euv"
        ],
        "companies": [
          "asml"
        ],
        "chokepoints": [],
        "countries": [
          "NL"
        ]
      },
      "gate_type": "capacity_bottleneck",
      "object": "ASML EUV lithography (installed base + service)",
      "why_low_fame_high_control": "Single global supplier of EUV; installed base + service dependency is the canonical chokepoint.",
      "facts": [],
      "gaps": [
        {
          "gap_id": "g-asml-euv",
          "seed_id": "2",
          "seed_family": "ASML EUV",
          "gap_type": "extraction_pending",
          "what_is_missing": "EUV installed-base / systems-sold / backlog numbers not yet extracted from the 20-F.",
          "blocker": "24MB HTM on disk; extraction not done this round",
          "status": "needs-extraction",
          "next_action": "Parse ASML_Form_20-F_FY2025_SEC.htm for installed base / systems sold / backlog in next version."
        }
      ],
      "lags": [
        {
          "candidate_id": "sl-euv",
          "seed_id": "2",
          "object": "EUV tool build/install + service ramp",
          "lag_type": "tool_lead_time",
          "value": "unknown",
          "unit": "",
          "source_id": "asml-20f-fy2025",
          "evidence_status": "unknown",
          "notes": "Backlog/lead-time discussed in 20-F; specific months not extracted this round."
        }
      ],
      "metric_definitions": [
        {
          "metric_id": "m-asml-euv",
          "seed_id": "2",
          "seed_family": "ASML EUV",
          "metric_type": "capacity",
          "scale_family": "euv_installed_base",
          "unit": "systems",
          "scope": "cumulative EUV systems installed / shipped / backlog",
          "time_period": "FY2025",
          "source_id": "asml-20f-fy2025",
          "source_role": "primary",
          "evidence_status": "source-linked",
          "extraction_state": "pending",
          "notes": "In 20-F on disk; extract next version."
        }
      ]
    },
    {
      "candidate_id": "ic-hbm",
      "seed_id": "3",
      "suggested_layer": "L1",
      "target": "existing skhynix/samsung/ac-hbm",
      "scale_family": "hbm_share_of_dram_revenue / memory_maker_revenue",
      "metrics": [
        "m-hbm-share-dram",
        "m-hbm-rev"
      ],
      "evidence_status": "source-linked",
      "note": "Official-issuer only.",
      "targets": {
        "nodes": [
          "ac-hbm"
        ],
        "companies": [
          "skhynix",
          "samsung"
        ],
        "chokepoints": [],
        "countries": [
          "KR",
          "US"
        ]
      },
      "gate_type": "capacity_bottleneck",
      "object": "HBM (SK hynix / Samsung / Micron)",
      "why_low_fame_high_control": "3-supplier oligopoly; HBM gates AI accelerator output; >40% of one maker's DRAM revenue.",
      "facts": [
        {
          "ledger_id": "lg-skhynix-rev-fy2025",
          "seed_id": "3",
          "seed_family": "HBM supply",
          "metric_id": "m-hbm-rev",
          "scale_family": "memory_maker_revenue",
          "value": "97.1467",
          "unit": "trillion_KRW",
          "scope": "SK hynix FY2025 consolidated revenue",
          "time_period": "FY2025",
          "source_id": "skhynix-fy2025-results",
          "organization": "SK hynix Inc",
          "local_file": "snapshots/hbm/HBM_official_IR_releases.md",
          "original_caption": "FY2025 revenue 97.1467 trillion KRW (+47% YoY); operating profit 47.2063tn (+101%)",
          "evidence_status": "source-linked",
          "reproduce_method": "official SK hynix press release (2026-01-28), transcribed; not re-extracted from audited statement",
          "notes": "HBM revenue 'more than doubled YoY' (no absolute disclosed)."
        },
        {
          "ledger_id": "lg-skhynix-hbm-dram-4q24",
          "seed_id": "3",
          "seed_family": "HBM supply",
          "metric_id": "m-hbm-share-dram",
          "scale_family": "hbm_share_of_dram_revenue",
          "value": ">40",
          "unit": "pct",
          "scope": "HBM as % of SK hynix DRAM revenue",
          "time_period": "4Q24",
          "source_id": "skhynix-fy2025-results",
          "organization": "SK hynix Inc",
          "local_file": "snapshots/hbm/HBM_official_IR_releases.md",
          "original_caption": "HBM accounted for >40% of total DRAM revenue in 4Q24 (SK hynix 4Q24 release)",
          "evidence_status": "source-linked",
          "reproduce_method": "official SK hynix 4Q24 release figure transcribed",
          "notes": "TrendForce/industry HBM market-share splits = lead_only, excluded."
        },
        {
          "ledger_id": "lg-samsung-rev-q4fy2025",
          "seed_id": "3",
          "seed_family": "HBM supply",
          "metric_id": "m-hbm-rev",
          "scale_family": "memory_maker_revenue",
          "value": "93.8",
          "unit": "trillion_KRW",
          "scope": "Samsung Q4 2025 consolidated revenue",
          "time_period": "Q4 2025",
          "source_id": "samsung-q4fy2025-results",
          "organization": "Samsung Electronics",
          "local_file": "snapshots/hbm/HBM_official_IR_releases.md",
          "original_caption": "Q4 2025 revenue KRW 93.8tn, operating profit KRW 20.1tn (all-time highs); record Memory, expanding HBM",
          "evidence_status": "source-linked",
          "reproduce_method": "Samsung newsroom figures transcribed (page timed out on direct fetch; deeper PDF not closed)",
          "notes": ""
        }
      ],
      "gaps": [
        {
          "gap_id": "g-hbm-absolute",
          "seed_id": "3",
          "seed_family": "HBM supply",
          "gap_type": "metric_unavailable",
          "what_is_missing": "No absolute HBM revenue / HBM unit share disclosed by issuers (only growth + >40%-of-DRAM-rev qualitative point).",
          "blocker": "issuers do not break out absolute HBM revenue",
          "status": "source-limited",
          "next_action": "Treat HBM magnitude as growth/relative only; absolute requires lead_only industry data (excluded)."
        }
      ],
      "lags": [
        {
          "candidate_id": "sl-hbm",
          "seed_id": "3",
          "object": "HBM capacity ramp",
          "lag_type": "capacity_ramp",
          "value": "unknown",
          "unit": "",
          "source_id": "micron-10k-fy2025",
          "evidence_status": "unknown",
          "notes": "Capex/capacity ramp in 10-K; no clean substitution-lag figure extracted."
        }
      ],
      "metric_definitions": [
        {
          "metric_id": "m-hbm-share-dram",
          "seed_id": "3",
          "seed_family": "HBM supply",
          "metric_type": "share",
          "scale_family": "hbm_share_of_dram_revenue",
          "unit": "pct",
          "scope": "HBM as % of maker DRAM revenue",
          "time_period": "4Q24",
          "source_id": "skhynix-fy2025-results",
          "source_role": "primary",
          "evidence_status": "source-linked",
          "extraction_state": "article_text",
          "notes": "SK hynix: HBM >40% of DRAM revenue 4Q24 (prior release)."
        },
        {
          "metric_id": "m-hbm-rev",
          "seed_id": "3",
          "seed_family": "HBM supply",
          "metric_type": "flow",
          "scale_family": "memory_maker_revenue",
          "unit": "trillion_KRW",
          "scope": "SK hynix / Samsung consolidated revenue",
          "time_period": "FY/Q4 2025",
          "source_id": "skhynix-fy2025-results;samsung-q4fy2025-results",
          "source_role": "primary",
          "evidence_status": "source-linked",
          "extraction_state": "article_text",
          "notes": "Official-issuer PR figures; not re-extracted from audited statement."
        }
      ]
    },
    {
      "candidate_id": "ic-eda",
      "seed_id": "4",
      "suggested_layer": "L1/L3",
      "target": "existing synopsys/cadence/ac-eda + ac-export",
      "scale_family": "export_control_exposure",
      "metrics": [
        "m-bis-fdpr-eccn"
      ],
      "evidence_status": "source-linked",
      "note": "Permission-gate badge from 10-K export-control exposure.",
      "targets": {
        "nodes": [
          "ac-eda",
          "ac-export"
        ],
        "companies": [
          "synopsys",
          "cadence"
        ],
        "chokepoints": [],
        "countries": [
          "US"
        ]
      },
      "gate_type": "permission_gate",
      "object": "Synopsys / Cadence / Siemens EDA",
      "why_low_fame_high_control": "Design-tool layer that advanced-chip design must call; heavy export-control/Entity-List exposure makes it a permission chokepoint.",
      "facts": [],
      "gaps": [],
      "lags": [],
      "metric_definitions": [
        {
          "metric_id": "m-bis-fdpr-eccn",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_type": "gate_ratio",
          "scale_family": "controlled_item_scope",
          "unit": "eccn_count",
          "scope": "ECCNs added/revised by Dec 2024 FDPR rule",
          "time_period": "2024-12",
          "source_id": "bis-fdpr-2024-28270",
          "source_role": "primary",
          "evidence_status": "source-linked",
          "extraction_state": "manifest_text",
          "notes": "8 new + 8 revised per rule; XML on disk, not parsed this round."
        }
      ]
    },
    {
      "candidate_id": "ic-usgs",
      "seed_id": "6",
      "suggested_layer": "L0",
      "target": "NEW node group raw_material (criticals feeding ac-fab via supply edge)",
      "scale_family": "minerals_net_import_reliance / minerals_supplier_country_share",
      "metrics": [
        "m-usgs-nir",
        "m-usgs-supplier-share"
      ],
      "evidence_status": "verified",
      "note": "Cleanest verified layer; NIR% + supplier-country share re-derived. Atlas currently lacks an upstream raw_material layer.",
      "targets": {
        "nodes": [
          "ac-fab",
          "ac-gpu"
        ],
        "companies": [],
        "chokepoints": [],
        "countries": [
          "US",
          "CN"
        ]
      },
      "gate_type": "material_monopoly",
      "object": "Gallium (and other 100%-NIR criticals)",
      "why_low_fame_high_control": "US 100% net-import-reliant; concentrated suppliers; gallium/germanium are export-control levers for chips.",
      "facts": [
        {
          "ledger_id": "lg-usgs-nir100-count",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "16",
          "unit": "commodities",
          "scope": "US commodities with 100% net import reliance",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig2_Net_Import_Reliance.csv",
          "original_caption": "Net import reliance as a percentage of apparent consumption (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "rows of MCS2026_Fig2_Net_Import_Reliance.csv where Net_Import_Reliance_pct_2025 == 100",
          "notes": "of 68 commodities listed"
        },
        {
          "ledger_id": "lg-usgs-nir-gallium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "100",
          "unit": "pct",
          "scope": "US net import reliance, Gallium",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Gallium NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=Y"
        },
        {
          "ledger_id": "lg-usgs-supplier-gallium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "28",
          "unit": "pct",
          "scope": "top US import source share, Gallium = Canada",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Gallium: Canada 28% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-germanium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "50",
          "unit": "pct",
          "scope": "US net import reliance, Germanium",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Germanium NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=Y"
        },
        {
          "ledger_id": "lg-usgs-supplier-germanium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "41",
          "unit": "pct",
          "scope": "top US import source share, Germanium = Belgium",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Germanium: Belgium 41% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-antimony",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "91",
          "unit": "pct",
          "scope": "US net import reliance, Antimony",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Antimony NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=Y"
        },
        {
          "ledger_id": "lg-usgs-supplier-antimony",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "55",
          "unit": "pct",
          "scope": "top US import source share, Antimony = China",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Antimony: China 55% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-fluorspar",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "100",
          "unit": "pct",
          "scope": "US net import reliance, Fluorspar",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Fluorspar NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=Y"
        },
        {
          "ledger_id": "lg-usgs-supplier-fluorspar",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "64",
          "unit": "pct",
          "scope": "top US import source share, Fluorspar = Mexico",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Fluorspar: Mexico 64% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-tungsten",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "50",
          "unit": "pct",
          "scope": "US net import reliance, Tungsten",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Tungsten NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=Y"
        },
        {
          "ledger_id": "lg-usgs-supplier-tungsten",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "26",
          "unit": "pct",
          "scope": "top US import source share, Tungsten = China",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Tungsten: China 26% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-indium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "100",
          "unit": "pct",
          "scope": "US net import reliance, Indium",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Indium NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=N"
        },
        {
          "ledger_id": "lg-usgs-supplier-indium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "25",
          "unit": "pct",
          "scope": "top US import source share, Indium = Republic of Korea",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Indium: Republic of Korea 25% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-niobium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "100",
          "unit": "pct",
          "scope": "US net import reliance, Niobium",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Niobium NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=N"
        },
        {
          "ledger_id": "lg-usgs-supplier-niobium",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "67",
          "unit": "pct",
          "scope": "top US import source share, Niobium = Brazil",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Niobium: Brazil 67% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-tantalum",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "100",
          "unit": "pct",
          "scope": "US net import reliance, Tantalum",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Tantalum NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=N"
        },
        {
          "ledger_id": "lg-usgs-supplier-tantalum",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "22",
          "unit": "pct",
          "scope": "top US import source share, Tantalum = China",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Tantalum: China 22% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        },
        {
          "ledger_id": "lg-usgs-nir-cobalt",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-nir",
          "scale_family": "minerals_net_import_reliance",
          "value": "79",
          "unit": "pct",
          "scope": "US net import reliance, Cobalt",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Cobalt NIR (MCS 2026)",
          "evidence_status": "verified",
          "reproduce_method": "NIR column of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "critical_mineral_2025=Y"
        },
        {
          "ledger_id": "lg-usgs-supplier-cobalt",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_id": "m-usgs-supplier-share",
          "scale_family": "minerals_supplier_country_share",
          "value": "26",
          "unit": "pct",
          "scope": "top US import source share, Cobalt = Norway",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "organization": "USGS",
          "local_file": "downloads/usgs-mcs2026/MCS2026_Fig3_Major_Import_Sources.csv",
          "original_caption": "Cobalt: Norway 26% of US imports (avg 2021-24)",
          "evidence_status": "verified",
          "reproduce_method": "first (descending) supplier row of MCS2026_Fig3_Major_Import_Sources.csv for this commodity",
          "notes": "low-fame/high-control supplier-concentration signal"
        }
      ],
      "gaps": [],
      "lags": [
        {
          "candidate_id": "sl-gallium",
          "seed_id": "6",
          "object": "Gallium/germanium alternative supply",
          "lag_type": "supply_substitution",
          "value": "unknown",
          "unit": "",
          "source_id": "usgs-mcs2026-datarelease",
          "evidence_status": "unknown",
          "notes": "NIR 100%/50% indicates low domestic substitution, but explicit time-to-substitute not in USGS data."
        }
      ],
      "metric_definitions": [
        {
          "metric_id": "m-usgs-nir",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_type": "share",
          "scale_family": "minerals_net_import_reliance",
          "unit": "pct",
          "scope": "US net import reliance of apparent consumption",
          "time_period": "2025",
          "source_id": "usgs-mcs2026-datarelease",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "extracted",
          "notes": "68 commodities; per-commodity NIR% in ledger."
        },
        {
          "metric_id": "m-usgs-supplier-share",
          "seed_id": "6",
          "seed_family": "USGS critical minerals",
          "metric_type": "share",
          "scale_family": "minerals_supplier_country_share",
          "unit": "pct",
          "scope": "share of US imports by source country",
          "time_period": "2021-24 avg",
          "source_id": "usgs-mcs2026-datarelease",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "extracted",
          "notes": "Top-supplier share per critical mineral in ledger."
        }
      ]
    },
    {
      "candidate_id": "ic-iea",
      "seed_id": "7",
      "suggested_layer": "L0",
      "target": "edge raw_material->processing (refining-share)",
      "scale_family": "mineral_refining_share",
      "metrics": [
        "m-iea-refining-share"
      ],
      "evidence_status": "blocked",
      "note": "Needs IEA account; methodology only. Hold until key.",
      "targets": {
        "nodes": [
          "ac-fab"
        ],
        "companies": [],
        "chokepoints": [],
        "countries": []
      },
      "gate_type": "material_monopoly",
      "object": "Mineral refining/processing share",
      "why_low_fame_high_control": "Refining-share concentration (e.g. one country dominating processing) is the real chokepoint vs raw extraction.",
      "facts": [],
      "gaps": [
        {
          "gap_id": "g-iea-refining",
          "seed_id": "7",
          "seed_family": "IEA critical minerals",
          "gap_type": "needs-api-key",
          "what_is_missing": "Per-mineral refining/processing share (e.g. China share of refining) as structured data.",
          "blocker": "IEA Data Explorer full export behind account/terms gate",
          "status": "blocked",
          "next_action": "operator decision: register free IEA account or license. Methodology (CC BY 4.0) on disk meanwhile."
        }
      ],
      "lags": [],
      "metric_definitions": [
        {
          "metric_id": "m-iea-refining-share",
          "seed_id": "7",
          "seed_family": "IEA critical minerals",
          "metric_type": "share",
          "scale_family": "mineral_refining_share",
          "unit": "pct",
          "scope": "country share of refining/processing",
          "time_period": "scenario",
          "source_id": "iea-cmde-methodology",
          "source_role": "primary",
          "evidence_status": "blocked",
          "extraction_state": "gated",
          "notes": "Full dataset behind IEA account/terms; methodology only on disk."
        }
      ]
    },
    {
      "candidate_id": "ic-subcable",
      "seed_id": "8",
      "suggested_layer": "L0 reachability",
      "target": "existing re-cable",
      "scale_family": "cable_route_count",
      "metrics": [
        "m-subcable-geometry"
      ],
      "evidence_status": "verified",
      "note": "Geometry/count only; do NOT encode as capacity (commercial).",
      "targets": {
        "nodes": [
          "re-cable"
        ],
        "companies": [],
        "chokepoints": [
          "malacca",
          "suez",
          "babelmandeb"
        ],
        "countries": [
          "SG",
          "US",
          "JP"
        ]
      },
      "gate_type": "physical_chokepoint",
      "object": "Submarine cable routes + landing points",
      "why_low_fame_high_control": "712 routes / 1,917 landing points carry intercontinental reachability; landing points are concentrated control points.",
      "facts": [
        {
          "ledger_id": "lg-subcable-routes",
          "seed_id": "8",
          "seed_family": "Submarine cables",
          "metric_id": "m-subcable-geometry",
          "scale_family": "cable_route_count",
          "value": "712",
          "unit": "routes",
          "scope": "submarine cable routes in TeleGeography public map",
          "time_period": "2026-06",
          "source_id": "telegeography-submarinecablemap",
          "organization": "TeleGeography",
          "local_file": "downloads/submarine-cables/submarinecablemap_cable-geo.json",
          "original_caption": "GeoJSON FeatureCollection of cable routes (public map tier)",
          "evidence_status": "verified",
          "reproduce_method": "len(features) of submarinecablemap_cable-geo.json",
          "notes": "GEOMETRY/COUNT ONLY (CC BY-NC-SA). Design-capacity-per-cable is commercial -> cannot-infer."
        },
        {
          "ledger_id": "lg-subcable-landing",
          "seed_id": "8",
          "seed_family": "Submarine cables",
          "metric_id": "m-subcable-geometry",
          "scale_family": "cable_route_count",
          "value": "1917",
          "unit": "landing_points",
          "scope": "submarine cable landing points",
          "time_period": "2026-06",
          "source_id": "telegeography-submarinecablemap",
          "organization": "TeleGeography",
          "local_file": "downloads/submarine-cables/submarinecablemap_landing-point-geo.json",
          "original_caption": "GeoJSON FeatureCollection of landing points (public map tier)",
          "evidence_status": "verified",
          "reproduce_method": "len(features) of submarinecablemap_landing-point-geo.json",
          "notes": "count only; NC+SA license."
        }
      ],
      "gaps": [
        {
          "gap_id": "g-subcable-capacity",
          "seed_id": "8",
          "seed_family": "Submarine cables",
          "gap_type": "license_restricted",
          "what_is_missing": "Design-capacity-per-cable, ownership consortia, RFS dates.",
          "blocker": "commercial TeleGeography licensed dataset (sales@telegeography.com)",
          "status": "blocked",
          "next_action": "Public feed gives geometry/counts only. Do NOT encode capacity. License if needed."
        }
      ],
      "lags": [],
      "metric_definitions": [
        {
          "metric_id": "m-subcable-geometry",
          "seed_id": "8",
          "seed_family": "Submarine cables",
          "metric_type": "capacity",
          "scale_family": "cable_route_count",
          "unit": "count",
          "scope": "submarine cable routes + landing points (geometry)",
          "time_period": "2026-06",
          "source_id": "telegeography-submarinecablemap",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "extracted",
          "notes": "Counts only; design-capacity-per-cable is commercial -> cannot-infer."
        }
      ]
    },
    {
      "candidate_id": "ic-peeringdb",
      "seed_id": "9",
      "suggested_layer": "reachability",
      "target": "existing re-bgp/re-cloud",
      "scale_family": "internet_facility_inventory",
      "metrics": [
        "m-peeringdb-facility"
      ],
      "evidence_status": "blocked",
      "note": "Schema sample only; bulk needs API key.",
      "targets": {
        "nodes": [
          "re-bgp",
          "re-cloud"
        ],
        "companies": [
          "hyperscalers"
        ],
        "chokepoints": [],
        "countries": [
          "US"
        ]
      },
      "gate_type": "gate_ratio",
      "object": "IXP / network facilities",
      "why_low_fame_high_control": "Internet-facility/ASN reachability inventory; concentration of facilities = reachability chokepoint.",
      "facts": [],
      "gaps": [
        {
          "gap_id": "g-peeringdb-bulk",
          "seed_id": "9",
          "seed_family": "PeeringDB",
          "gap_type": "needs-api-key",
          "what_is_missing": "Full relational dump of ix/fac/net/ixlan/netfac at scale.",
          "blocker": "bulk/auth needs free account + API key",
          "status": "blocked",
          "next_action": "operator decision: create free PeeringDB account + read-only API key. Schema samples on disk meanwhile."
        }
      ],
      "lags": [],
      "metric_definitions": [
        {
          "metric_id": "m-peeringdb-facility",
          "seed_id": "9",
          "seed_family": "PeeringDB",
          "metric_type": "gate_ratio",
          "scale_family": "internet_facility_inventory",
          "unit": "count",
          "scope": "IXP/facility/ASN inventory",
          "time_period": "sample",
          "source_id": "peeringdb-api",
          "source_role": "primary",
          "evidence_status": "blocked",
          "extraction_state": "sample_only",
          "notes": "Only schema samples; bulk needs API key (boundary)."
        }
      ]
    },
    {
      "candidate_id": "ic-hormuz",
      "seed_id": "10",
      "suggested_layer": "L0 energy",
      "target": "existing hormuz / ca-hormuz / en-crude",
      "scale_family": "seaborne_oil_flow / oil_chokepoint_share",
      "metrics": [
        "m-eia-hormuz-flow",
        "m-eia-hormuz-globalshare"
      ],
      "evidence_status": "verified",
      "note": "Flow re-derived from xlsx; shares EIA-published. Other chokepoints (Malacca/Suez/Bab-el-Mandeb/Panama) open but not pulled this round.",
      "targets": {
        "nodes": [
          "en-crude",
          "en-lng",
          "en-tanker"
        ],
        "companies": [
          "aramco",
          "qatargas",
          "adnoc"
        ],
        "chokepoints": [
          "hormuz"
        ],
        "countries": [
          "SA",
          "QA",
          "AE",
          "JP",
          "KR",
          "IN",
          "CN"
        ]
      },
      "gate_type": "physical_chokepoint",
      "object": "Strait of Hormuz",
      "why_low_fame_high_control": "~20% of world petroleum liquids + >25% of seaborne oil through one strait; bypass only ~2.6 Mb/d.",
      "facts": [
        {
          "ledger_id": "lg-eia-hormuz-2024-total",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "metric_id": "m-eia-hormuz-flow",
          "scale_family": "seaborne_oil_flow",
          "value": "20.262",
          "unit": "million_bpd",
          "scope": "total oil through Strait of Hormuz",
          "time_period": "2024",
          "source_id": "eia-hormuz-2025",
          "organization": "US EIA",
          "local_file": "downloads/eia-energy-chokepoints/EIA_Hormuz_2025-06-16_fig1_data.xlsx",
          "original_caption": "Volume of crude oil, condensate, and petroleum products transported through the Strait of Hormuz (million b/d)",
          "evidence_status": "verified",
          "reproduce_method": "parsed xl/worksheets from EIA_Hormuz_2025-06-16_fig1_data.xlsx (zip+regex); values = million b/d by year; series 'Total oil flows through Strait of Hormuz' year 2024",
          "notes": "underlying data EIA-published, sourced from Vortexa (commercial); EIA figure is citable"
        },
        {
          "ledger_id": "lg-eia-hormuz-petroleum-share",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "metric_id": "m-eia-hormuz-globalshare",
          "scale_family": "oil_chokepoint_share",
          "value": "~20",
          "unit": "pct",
          "scope": "Hormuz oil flow as % of worldwide petroleum liquids consumption",
          "time_period": "2024",
          "source_id": "eia-hormuz-2025",
          "organization": "US EIA",
          "local_file": "snapshots/eia-energy-chokepoints/EIA_Hormuz_2025-06-16_article_snapshot.md",
          "original_caption": "~20 million b/d in 2024 = ~20% of worldwide petroleum liquids consumption",
          "evidence_status": "verified",
          "reproduce_method": "EIA-published figure transcribed verbatim from EIA Today-in-Energy article snapshot",
          "notes": "EIA publication (public domain); underlying transit data Vortexa"
        },
        {
          "ledger_id": "lg-eia-hormuz-seaborne-share",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "metric_id": "m-eia-hormuz-globalshare",
          "scale_family": "oil_chokepoint_share",
          "value": ">25",
          "unit": "pct",
          "scope": "Hormuz as % of total global seaborne oil trade",
          "time_period": "2024",
          "source_id": "eia-hormuz-2025",
          "organization": "US EIA",
          "local_file": "snapshots/eia-energy-chokepoints/EIA_Hormuz_2025-06-16_article_snapshot.md",
          "original_caption": "more than one-quarter of total global seaborne oil trade (2024+1Q25)",
          "evidence_status": "verified",
          "reproduce_method": "EIA-published figure transcribed verbatim from EIA Today-in-Energy article snapshot",
          "notes": "EIA publication (public domain); underlying transit data Vortexa"
        },
        {
          "ledger_id": "lg-eia-hormuz-lng-share",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "metric_id": "m-eia-hormuz-globalshare",
          "scale_family": "oil_chokepoint_share",
          "value": "~20",
          "unit": "pct",
          "scope": "Hormuz as % of global LNG trade",
          "time_period": "2024",
          "source_id": "eia-hormuz-2025",
          "organization": "US EIA",
          "local_file": "snapshots/eia-energy-chokepoints/EIA_Hormuz_2025-06-16_article_snapshot.md",
          "original_caption": "~one-fifth of global LNG trade transited Hormuz in 2024",
          "evidence_status": "verified",
          "reproduce_method": "EIA-published figure transcribed verbatim from EIA Today-in-Energy article snapshot",
          "notes": "EIA publication (public domain); underlying transit data Vortexa"
        },
        {
          "ledger_id": "lg-eia-hormuz-bypass",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "metric_id": "m-eia-hormuz-globalshare",
          "scale_family": "oil_chokepoint_share",
          "value": "~2.6",
          "unit": "million_bpd",
          "scope": "effective pipeline bypass capacity around Hormuz",
          "time_period": "2024",
          "source_id": "eia-hormuz-2025",
          "organization": "US EIA",
          "local_file": "snapshots/eia-energy-chokepoints/EIA_Hormuz_2025-06-16_article_snapshot.md",
          "original_caption": "bypass pipeline capacity ~2.6 million b/d effective",
          "evidence_status": "verified",
          "reproduce_method": "EIA-published figure transcribed verbatim from EIA Today-in-Energy article snapshot",
          "notes": "EIA publication (public domain); underlying transit data Vortexa"
        }
      ],
      "gaps": [
        {
          "gap_id": "g-other-chokepoints",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "gap_type": "coverage_partial",
          "what_is_missing": "Malacca / Suez / Bab-el-Mandeb / Panama transit flows.",
          "blocker": "open (each has Today-in-Energy article + xlsx) but not pulled this round",
          "status": "needs-acquisition",
          "next_action": "Pull per-chokepoint Today-in-Energy xlsx in next version; same evidence discipline."
        }
      ],
      "lags": [
        {
          "candidate_id": "sl-hormuz-bypass",
          "seed_id": "10",
          "object": "Hormuz pipeline bypass",
          "lag_type": "alternative_route_capacity",
          "value": "2.6",
          "unit": "million_bpd",
          "source_id": "eia-hormuz-2025",
          "evidence_status": "verified",
          "notes": "Effective bypass ~2.6 Mb/d vs ~20 Mb/d transit = ~13% substitutable (EIA-published)."
        }
      ],
      "metric_definitions": [
        {
          "metric_id": "m-eia-hormuz-flow",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "metric_type": "flow",
          "scale_family": "seaborne_oil_flow",
          "unit": "million_bpd",
          "scope": "oil transiting Strait of Hormuz",
          "time_period": "2020-1Q2025",
          "source_id": "eia-hormuz-2025",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "extracted",
          "notes": "Total + crude/condensate + products series re-derived from fig1.xlsx."
        },
        {
          "metric_id": "m-eia-hormuz-globalshare",
          "seed_id": "10",
          "seed_family": "Energy chokepoints",
          "metric_type": "gate_ratio",
          "scale_family": "oil_chokepoint_share",
          "unit": "pct",
          "scope": "Hormuz flow as % of global petroleum liquids / seaborne oil / LNG",
          "time_period": "2024",
          "source_id": "eia-hormuz-2025",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "article_text",
          "notes": "EIA-published shares (~20%/>25%/~20%); underlying Vortexa."
        }
      ]
    },
    {
      "candidate_id": "ic-bis",
      "seed_id": "11",
      "suggested_layer": "L3",
      "target": "existing ac-export / en-sanction",
      "scale_family": "export_control_listings",
      "metrics": [
        "m-csl-entity",
        "m-bis-fdpr-eccn"
      ],
      "evidence_status": "verified",
      "note": "Listing counts re-derived; FDPR ECCN scope source-linked.",
      "targets": {
        "nodes": [
          "ac-export",
          "en-sanction"
        ],
        "companies": [],
        "chokepoints": [],
        "countries": [
          "US",
          "CN"
        ]
      },
      "gate_type": "permission_gate",
      "object": "BIS Entity List / FDPR scope",
      "why_low_fame_high_control": "Export-control listings are the explicit permission gate over advanced compute/SME; 3,420 Entity List entries.",
      "facts": [
        {
          "ledger_id": "lg-csl-total",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_id": "m-csl-entity",
          "scale_family": "regulatory_listing_count",
          "value": "25757",
          "unit": "entities",
          "scope": "entities on US Consolidated Screening List",
          "time_period": "2026-06 snapshot",
          "source_id": "csl-consolidated-screening-list",
          "organization": "BIS/ITA",
          "local_file": "downloads/bis-export-controls/CSL_consolidated_screening_list.csv",
          "original_caption": "Consolidated Screening List total rows",
          "evidence_status": "verified",
          "reproduce_method": "csv.DictReader rows of CSL_consolidated_screening_list.csv grouped by 'source' column",
          "notes": ""
        },
        {
          "ledger_id": "lg-csl-entity-list",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_id": "m-csl-entity",
          "scale_family": "regulatory_listing_count",
          "value": "3420",
          "unit": "entities",
          "scope": "entities on BIS Entity List",
          "time_period": "2026-06 snapshot",
          "source_id": "csl-consolidated-screening-list",
          "organization": "BIS/ITA",
          "local_file": "downloads/bis-export-controls/CSL_consolidated_screening_list.csv",
          "original_caption": "Entity List (EL) rows within CSL",
          "evidence_status": "verified",
          "reproduce_method": "csv.DictReader rows of CSL_consolidated_screening_list.csv grouped by 'source' column; source contains 'Entity List (EL)' -> 'Entity List (EL) - Bureau of Industry and Security'",
          "notes": ""
        },
        {
          "ledger_id": "lg-csl-dpl",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_id": "m-csl-entity",
          "scale_family": "regulatory_listing_count",
          "value": "1596",
          "unit": "entities",
          "scope": "entities on BIS Denied Persons List",
          "time_period": "2026-06 snapshot",
          "source_id": "csl-consolidated-screening-list",
          "organization": "BIS/ITA",
          "local_file": "downloads/bis-export-controls/CSL_consolidated_screening_list.csv",
          "original_caption": "Denied Persons List rows within CSL",
          "evidence_status": "verified",
          "reproduce_method": "csv.DictReader rows of CSL_consolidated_screening_list.csv grouped by 'source' column",
          "notes": ""
        },
        {
          "ledger_id": "lg-csl-meu",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_id": "m-csl-entity",
          "scale_family": "regulatory_listing_count",
          "value": "70",
          "unit": "entities",
          "scope": "entities on BIS Military End User list",
          "time_period": "2026-06 snapshot",
          "source_id": "csl-consolidated-screening-list",
          "organization": "BIS/ITA",
          "local_file": "downloads/bis-export-controls/CSL_consolidated_screening_list.csv",
          "original_caption": "Military End User (MEU) rows within CSL",
          "evidence_status": "verified",
          "reproduce_method": "csv.DictReader rows of CSL_consolidated_screening_list.csv grouped by 'source' column",
          "notes": ""
        },
        {
          "ledger_id": "lg-csl-cmic",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_id": "m-csl-entity",
          "scale_family": "regulatory_listing_count",
          "value": "68",
          "unit": "entities",
          "scope": "entities on Non-SDN CMIC list",
          "time_period": "2026-06 snapshot",
          "source_id": "csl-consolidated-screening-list",
          "organization": "BIS/ITA",
          "local_file": "downloads/bis-export-controls/CSL_consolidated_screening_list.csv",
          "original_caption": "Chinese Military-Industrial Complex Companies rows within CSL",
          "evidence_status": "verified",
          "reproduce_method": "csv.DictReader rows of CSL_consolidated_screening_list.csv grouped by 'source' column",
          "notes": ""
        }
      ],
      "gaps": [
        {
          "gap_id": "g-fdpr-parse",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "gap_type": "extraction_pending",
          "what_is_missing": "Exact ECCN list / controlled-item scope from the FDPR rule as structured data.",
          "blocker": "full-text XML on disk, not parsed this round",
          "status": "needs-extraction",
          "next_action": "Parse FR-2024-12-05_2024-28270_full_text.xml for ECCN additions/revisions."
        }
      ],
      "lags": [],
      "metric_definitions": [
        {
          "metric_id": "m-csl-entity",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_type": "gate_ratio",
          "scale_family": "export_control_listings",
          "unit": "entity_count",
          "scope": "entities on a US screening list",
          "time_period": "2026-06 snapshot",
          "source_id": "csl-consolidated-screening-list",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "extracted",
          "notes": "Counts per list re-derived (Entity List, DPL, MEU, CMIC, UVL...)."
        },
        {
          "metric_id": "m-bis-fdpr-eccn",
          "seed_id": "11",
          "seed_family": "BIS export controls",
          "metric_type": "gate_ratio",
          "scale_family": "controlled_item_scope",
          "unit": "eccn_count",
          "scope": "ECCNs added/revised by Dec 2024 FDPR rule",
          "time_period": "2024-12",
          "source_id": "bis-fdpr-2024-28270",
          "source_role": "primary",
          "evidence_status": "source-linked",
          "extraction_state": "manifest_text",
          "notes": "8 new + 8 revised per rule; XML on disk, not parsed this round."
        }
      ]
    },
    {
      "candidate_id": "ic-ofac",
      "seed_id": "12",
      "suggested_layer": "L3",
      "target": "existing en-sanction",
      "scale_family": "financial_sanctions_listings",
      "metrics": [
        "m-ofac-sdn",
        "m-eu-fsf"
      ],
      "evidence_status": "verified",
      "note": "OFAC SDN + EU FSF counts re-derived; EU count discrepancy flagged.",
      "targets": {
        "nodes": [
          "en-sanction",
          "re-filter"
        ],
        "companies": [],
        "chokepoints": [],
        "countries": [
          "US",
          "DE",
          "NL"
        ]
      },
      "gate_type": "service_availability_gate",
      "object": "OFAC SDN + EU FSF",
      "why_low_fame_high_control": "Financial/service-availability gate; tens of thousands of listed entities cut off from settlement.",
      "facts": [
        {
          "ledger_id": "lg-ofac-sdn",
          "seed_id": "12",
          "seed_family": "OFAC / EU sanctions",
          "metric_id": "m-ofac-sdn",
          "scale_family": "regulatory_listing_count",
          "value": "19056",
          "unit": "entities",
          "scope": "entries on OFAC SDN list",
          "time_period": "2026-06 snapshot",
          "source_id": "ofac-sdn",
          "organization": "US Treasury OFAC",
          "local_file": "downloads/ofac-eu-sanctions/OFAC_SDN.xml",
          "original_caption": "OFAC SDN sdnEntry nodes",
          "evidence_status": "verified",
          "reproduce_method": "count of '<sdnEntry>' tags in OFAC_SDN.xml",
          "notes": ""
        },
        {
          "ledger_id": "lg-ofac-nonsdn",
          "seed_id": "12",
          "seed_family": "OFAC / EU sanctions",
          "metric_id": "m-ofac-sdn",
          "scale_family": "regulatory_listing_count",
          "value": "442",
          "unit": "entities",
          "scope": "entries on OFAC Consolidated (non-SDN) list",
          "time_period": "2026-06 snapshot",
          "source_id": "ofac-sdn",
          "organization": "US Treasury OFAC",
          "local_file": "downloads/ofac-eu-sanctions/OFAC_Consolidated_nonSDN.xml",
          "original_caption": "OFAC Consolidated non-SDN sdnEntry nodes",
          "evidence_status": "verified",
          "reproduce_method": "count of '<sdnEntry>' tags in OFAC_Consolidated_nonSDN.xml",
          "notes": ""
        },
        {
          "ledger_id": "lg-eu-fsf",
          "seed_id": "12",
          "seed_family": "OFAC / EU sanctions",
          "metric_id": "m-eu-fsf",
          "scale_family": "regulatory_listing_count",
          "value": "5994",
          "unit": "entities",
          "scope": "entities on EU consolidated financial sanctions list",
          "time_period": "2026-06 snapshot",
          "source_id": "eu-consolidated-fsf",
          "organization": "EC DG FISMA/EEAS",
          "local_file": "downloads/ofac-eu-sanctions/EU_consolidated_financial_sanctions_FULL.xml",
          "original_caption": "EU sanctionEntity nodes (generated 2026-06-05)",
          "evidence_status": "verified",
          "reproduce_method": "count of '<sanctionEntity ' opening tags in EU_consolidated_financial_sanctions_FULL.xml",
          "notes": "DISCREPANCY: 典藏 manifest states 2200; build re-extraction counts this value. Flagged in gaps g-eu-count."
        }
      ],
      "gaps": [
        {
          "gap_id": "g-eu-count",
          "seed_id": "12",
          "seed_family": "OFAC / EU sanctions",
          "gap_type": "data_discrepancy",
          "what_is_missing": "典藏 manifest states EU FSF '2200 sanctionEntity nodes'; build re-extraction counts 5994.",
          "blocker": "manifest figure vs re-extracted count differ",
          "status": "needs-review",
          "next_action": "Use re-extracted count as the verified value; ask source pack maintainer whether manifest 2200 counted a different node level (e.g. distinct persons)."
        }
      ],
      "lags": [],
      "metric_definitions": [
        {
          "metric_id": "m-ofac-sdn",
          "seed_id": "12",
          "seed_family": "OFAC / EU sanctions",
          "metric_type": "gate_ratio",
          "scale_family": "financial_sanctions_listings",
          "unit": "entity_count",
          "scope": "entries on OFAC SDN list",
          "time_period": "2026-06 snapshot",
          "source_id": "ofac-sdn",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "extracted",
          "notes": "sdnEntry count re-derived."
        },
        {
          "metric_id": "m-eu-fsf",
          "seed_id": "12",
          "seed_family": "OFAC / EU sanctions",
          "metric_type": "gate_ratio",
          "scale_family": "financial_sanctions_listings",
          "unit": "entity_count",
          "scope": "entities on EU consolidated financial sanctions list",
          "time_period": "2026-06-05",
          "source_id": "eu-consolidated-fsf",
          "source_role": "primary",
          "evidence_status": "verified",
          "extraction_state": "extracted",
          "notes": "sanctionEntity count re-derived; DISCREPANCY vs manifest 2200."
        }
      ]
    }
  ],
  "lookup": {
    "byNode": {
      "ac-fab": [
        "ic-abf",
        "ic-substrate",
        "ic-usgs",
        "ic-iea"
      ],
      "ac-gpu": [
        "ic-abf",
        "ic-substrate",
        "ic-usgs"
      ],
      "ac-hbm": [
        "ic-substrate",
        "ic-hbm"
      ],
      "ac-euv": [
        "ic-euv"
      ],
      "ac-eda": [
        "ic-eda"
      ],
      "ac-export": [
        "ic-eda",
        "ic-bis"
      ],
      "re-cable": [
        "ic-subcable"
      ],
      "re-bgp": [
        "ic-peeringdb"
      ],
      "re-cloud": [
        "ic-peeringdb"
      ],
      "en-crude": [
        "ic-hormuz"
      ],
      "en-lng": [
        "ic-hormuz"
      ],
      "en-tanker": [
        "ic-hormuz"
      ],
      "en-sanction": [
        "ic-bis",
        "ic-ofac"
      ],
      "re-filter": [
        "ic-ofac"
      ]
    },
    "byCountry": {
      "TW": [
        "ic-substrate"
      ],
      "KR": [
        "ic-substrate",
        "ic-hbm",
        "ic-hormuz"
      ],
      "NL": [
        "ic-euv",
        "ic-ofac"
      ],
      "US": [
        "ic-hbm",
        "ic-eda",
        "ic-usgs",
        "ic-subcable",
        "ic-peeringdb",
        "ic-bis",
        "ic-ofac"
      ],
      "CN": [
        "ic-usgs",
        "ic-hormuz",
        "ic-bis"
      ],
      "SG": [
        "ic-subcable"
      ],
      "JP": [
        "ic-subcable",
        "ic-hormuz"
      ],
      "SA": [
        "ic-hormuz"
      ],
      "QA": [
        "ic-hormuz"
      ],
      "AE": [
        "ic-hormuz"
      ],
      "IN": [
        "ic-hormuz"
      ],
      "DE": [
        "ic-ofac"
      ]
    },
    "byCompany": {
      "asml": [
        "ic-euv"
      ],
      "skhynix": [
        "ic-hbm"
      ],
      "samsung": [
        "ic-hbm"
      ],
      "synopsys": [
        "ic-eda"
      ],
      "cadence": [
        "ic-eda"
      ],
      "hyperscalers": [
        "ic-peeringdb"
      ],
      "aramco": [
        "ic-hormuz"
      ],
      "qatargas": [
        "ic-hormuz"
      ],
      "adnoc": [
        "ic-hormuz"
      ]
    },
    "byChokepoint": {
      "malacca": [
        "ic-subcable"
      ],
      "suez": [
        "ic-subcable"
      ],
      "babelmandeb": [
        "ic-subcable"
      ],
      "hormuz": [
        "ic-hormuz"
      ]
    },
    "byEvidence": {
      "source-linked": [
        "ic-abf",
        "ic-substrate",
        "ic-euv",
        "ic-hbm",
        "ic-eda"
      ],
      "verified": [
        "ic-usgs",
        "ic-subcable",
        "ic-hormuz",
        "ic-bis",
        "ic-ofac"
      ],
      "blocked": [
        "ic-iea",
        "ic-peeringdb"
      ]
    },
    "byScaleFamily": {
      "material_global_share": [
        "ic-abf"
      ],
      "ic_substrate_capacity": [
        "ic-substrate"
      ],
      "euv_installed_base": [
        "ic-euv"
      ],
      "hbm_share_of_dram_revenue / memory_maker_revenue": [
        "ic-hbm"
      ],
      "export_control_exposure": [
        "ic-eda"
      ],
      "minerals_net_import_reliance / minerals_supplier_country_share": [
        "ic-usgs"
      ],
      "mineral_refining_share": [
        "ic-iea"
      ],
      "cable_route_count": [
        "ic-subcable"
      ],
      "internet_facility_inventory": [
        "ic-peeringdb"
      ],
      "seaborne_oil_flow / oil_chokepoint_share": [
        "ic-hormuz"
      ],
      "export_control_listings": [
        "ic-bis"
      ],
      "financial_sanctions_listings": [
        "ic-ofac"
      ]
    }
  }
};
