---
layout: session
title: "Mountains Break Maps: Smartphone Ground Truth + AI QA for Himalayan Trails in OSM"
code: "LE3NKZ"
speaker_names: ["Niruta Neupane", "Pragya Joshi"]
affiliations: None
room: "La Réunion"
length: "20"
time: "Sunday, 15:40"
time_iso: "2026-08-30T13:40:00Z"
resources: []
recording: True
prerecorded: False
language: en
---

In mountain regions, OpenStreetMap quality problems rarely look dramatic from aerial imagery, but on the ground they matter: disconnected trails at crossings, inconsistent trail classification, missing surface/track details, and unclear junctions can make a “complete-looking” map fail real navigation. This talk presents a smartphone‑only field workflow I applied during a mapping trip in Manang, Nepal: collecting GPX tracks on foot and street‑level imagery (Mapillary), then converting that evidence into targeted, human‑reviewed OSM improvements.

I will share a repeatable method designed for areas where teams do not have access to specialist equipment (no UAV, no LiDAR). The workflow is structured as capture → annotate → edit → validate → measure. To keep the approach scalable, I will also demonstrate “AI-assisted QA” that helps triage my own field evidence (e.g., flagging likely trail junction issues or missing attributes for later manual review), while keeping all edits community‑aligned and mapper‑verified.

I will show before/after map excerpts from Manang, a small set of impact metrics (coverage, connectivity fixes, tagging completeness), and practical lessons about privacy, safety, and transparency so others can replicate the approach in the Himalayas and other high‑relief regions.

<hr>

**Context**
Trail mapping in high‑relief terrain has a specific failure mode: an area may look “mapped” at a glance, but be unreliable on the ground because small details are missing, where the trail truly crosses a river, whether a connection is passable, whether a segment is a path or track, or whether key wayfinding cues exist at junctions. These issues are hard to resolve from aerial imagery alone.

**What I will present**
Using Manang, Nepal as a case study, I will present a smartphone‑only workflow to turn on‑foot GPX tracks and street‑level imagery (Mapillary) into verifiable OpenStreetMap improvements without UAV/LiDAR and without automated mass edits. The workflow is built to be replicable for mappers who only have a phone and limited connectivity.

**Workflow (phone-only, evidence-first)**
Capture: record GPX tracks on foot; collect short, steady street‑level imagery sequences for junctions, crossings, surfaces, and trailheads.
Annotate: same‑day “mapping decisions” notes while memory is fresh (what is ambiguous, what matters for tagging).
Edit: add/fix geometry and essential POIs; apply consistent tagging; document sources in changeset comments (GPX/imagery/field notes).
Validate: check connectivity and obvious tag/geometry errors; ensure edits are explainable from evidence.
Measure: produce “before/after” visuals and simple metrics: km captured, number of edits, junction/crossing fixes, and a small tag‑completeness summary.
Optional AI component (kept responsible)
I will demonstrate AI-assisted QA used only to triage my own collected evidence (e.g., suggesting candidates for missing tags or junction review), while keeping final mapping decisions human‑verified and compliant with community expectations for automation and imports.

**Learning outcomes**
Attendees will leave with:
A practical checklist for smartphone-only field mapping in remote terrain (offline-first habits included).
An evidence → edit method that keeps OSM as the main subject (not generic GIS).
A lightweight approach to measuring impact with metrics and screenshots.
Privacy/safety practices for street‑level imagery and GPS traces.
Audience level
Intermediate. Assumes basic familiarity with OSM editing (iD or JOSM) and common path/trail tagging. Beginners can still follow, but the main value is for mappers who want to improve field evidence and demonstrate measurable results.

