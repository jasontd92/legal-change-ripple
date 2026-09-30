# Package D — Consumer triggers, controls, distractors, S0/S1b pairs

Scope per `PLAN.md`: TR-20 (CA AB 2863), TR-21 (FTC negative option ANPRM);
TR-14 (CA SB 699 / AB 1076 — positive, reclassified 2026-09-29) and TR-90
controls (WY SF 107, TX SB 1318); distractor trigger versions across
groups; S0 diff-pair candidates; S1b profile-pair candidates. One-liners
only, per the shared brief. Company profile:
`corpus/company/profile.yaml` (Meridian Mechanical Group, Inc. — residential
plumbing/HVAC, CA/WA/IL/TX, direct importer of record for ~6% of material
spend).

Format follows `PLAN.md`'s scenario entry template. Eval ids: S0, S1a, S1b,
S3, S4, LBL-<set>, S5-link, S5-R1/R2/R3, V#, M#, I6.

---

## 1. TR-20 — CA AB 2863 (Automatic Renewal Law amendments)


Trigger: `corpus/triggers/TR-20-ca-automatic-renewal-ab-2863/2024-09-24_ab-2863-chaptered.txt`
(status: effective; effective 2025-07-01). Applies only to contracts
"entered into, amended, or extended" under the CA Automatic Renewal Law on or
after that date (§17601(b), §17602(j)).

### S1a — change items

- **D-TR20-S1a-01** · S1a · Effective-date / legal-status item: AB 2863 applies
  only to contracts entered, amended or extended on/after 2025-07-01.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17601(b), §17602(j)
  - Docs: none (trigger-side only)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: change item captured; effective date `2025-07-01` VERIFY; legal
    status `in force`
  - Verify: chaptered 2024-09-24, no later amendment/repeal in corpus

- **D-TR20-S1a-02** · S1a · New "free-to-pay conversion" definition folded into
  "automatic renewal" / "continuous service" (§17601(a)(1),(5),(6)) — a paid
  conversion after a free/discounted intro period is now itself
  auto-renewal.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17601(a)(1),(6)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: change item found; applies-to field: any consumer offer with a
    free/discounted period that converts to a paid recurring charge

- **D-TR20-S1a-03** · S1a · Express affirmative consent to the offer terms
  specifically, plus a new prohibition on contract language that undermines a
  consumer's ability to give that consent (§17602(a)(4)-(5)).
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17602(a)(4), (a)(5)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: change item found; distinct from the pre-existing "clear and
    conspicuous disclosure" duty in §17602(a)(1)

- **D-TR20-S1a-04** · S1a · New annual-reminder requirement for annual
  auto-renewal/continuous-service agreements: product/service, frequency and
  amount of charges, and cancellation method (§17602(h)).
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17602(h)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: change item found; urgency category: obligation clock
    (recurring, annual) once a stack is found to have an annual plan

- **D-TR20-S1a-05** · S1a · New online "click to cancel" / same-medium
  cancellation mechanics (§17602(c)-(f)); conditional — subdivision (d) only
  binds a business that "allows a consumer to accept ... online."
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17602(c), (d), (f)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: change item found with the conditional scope noted; a
    paper/in-home-signed enrollment should not trigger subdivision (d)
  - Verify: whether any Comfort Club enrollment happens online for Meridian
    (not stated in the corpus — treat as undeterminable if asked)

- **D-TR20-S1a-06** · S1a · Noise: legislative history / vote and procedural
  boilerplate ("Approved by Governor", chamber amendment dates, Digest Key
  vote tallies) at the top of the bill text.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — header block before
    "LEGISLATIVE COUNSEL'S DIGEST"
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: dismissed as noise, logged not dropped

### S4 — findings in auto_renewal / consumer documents

- **D-TR20-S4-01** · S4 (2+4) · Real finding: the CA residential installation
  agreement bundles a "Comfort Club" free-to-pay conversion (free
  "Complimentary Year" → $19.95/month) inside an omnibus signed contract;
  §6.5's own compliance claim ("the Customer has affirmatively consented ...
  by signing this Agreement") may not satisfy the new express-consent /
  anti-undermining test.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17602(a)(4)-(5)
  - Docs: `corpus/documents/customers/residential-terms/meridian_residential-installation-agreement-form_california_2025-07-01.md` — §6.1-6.5 "Comfort Club Membership" (consumer, auto_renewal)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: affected; materiality: material (compliance/breach-risk exposure
    per §6 test); direction: exposure
  - Verify: agreement signed 2025-07-01 — exactly AB 2863's effective date, so
    in scope by one day; confirm no distinct, separately-presented consent
    screen/acknowledgment for §6 beyond the general signature block

- **D-TR20-S4-02** · S4 (2+4) · Absence finding on the same document: no
  annual-reminder mechanism (product/service, charge frequency/amount,
  cancellation method) is described anywhere for the $19.95/month renewal
  period created by §6.2, though §17602(h) now requires one annually.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17602(h)
  - Docs: `corpus/documents/customers/residential-terms/meridian_residential-installation-agreement-form_california_2025-07-01.md` — §6 (searched), §14 Entire Agreement (searched)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: absence finding; clause type "annual reminder disclosure";
    searched sections listed (V7)

- **D-TR20-S4-03** · S4 (2+4) · **Replaced 2026-09-29** (see `CHANGES-2026-09-29.md`
  §A4 — the old SMS-consent pages are gone; both files at these same paths
  now hold a generated, substantively different auto-renewal pair): real
  finding / should-not-flag by version — the **August 2026 CA membership
  terms are the operative, AB-2863-compliant document**, and the **June 2024
  CA membership terms are superseded** and materially non-compliant by the
  standard the current version now meets. An agent must resolve to the
  current version rather than citing the older text as live.
  - **June 2024 (`CUS-RES-CA-TERMS-2024-06-01`, superseded 2026-08-01, plant
    `CA_RENEW_2024`):** §7 "Automatic Renewal" — monthly auto-renewal at
    $19.95, cancel only "by calling Member Services... or by writing"; no
    online cancellation mechanic, no annual reminder, no separate
    price-change notice window, and consent is bundled into general
    enrollment rather than a distinct express-consent step. If this version
    were still the operative one, it would not meet §17602(a)(4)-(5),
    (c)-(f), or (h) — but it predates AB 2863's 2025-07-01 effective date by
    over a year, so the "would it have been non-compliant" question is
    academic: it is not the live document.
  - **August 2026 (`CUS-RES-CA-TERMS-2026-08-01`, active, plant
    `CA_RENEW_2026`):** header states "Applies to all memberships entered
    into, amended, or extended on or after July 1, 2025" — the document
    itself tracks AB 2863's cutoff. §4 "Automatic Renewal" adds an express
    checkbox ("I agree to automatic renewal") tied to the specific offer
    terms (§17602(a)(4)-(5)), an online "Cancel Membership" button at
    www.meridianpha.com/ca/cancel with no rep-contact requirement
    (§17602(c)-(f)), an explicit annual reminder commitment (§17602(h)), and
    a 7-to-30-day advance notice window for fee increases (a further
    §17602(a) anti-undermining/consent element). This reads as a
    **compliant** implementation — should-not-flag / not affected, in
    deliberate contrast to `D-TR20-S4-01`'s installation-agreement finding.
  - Docs: `corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_california_2024-06-01.md` §7 (superseded); `corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_california_2026-08-01.md` §4 (active)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: current version (Aug 2026) = not affected / compliant; superseded version (June 2024) = not the operative text, cite only for contrast/history, not as a live finding
  - Plants: `CA_RENEW_2024`, `CA_RENEW_2026`
  - Verify: confirm no member is still being billed under June-2024-vintage
    terms without having received the August 2026 update (an operational
    fact outside the corpus — treat as undeterminable if asked)
  - Realism: this used to be a should-not-flag decoy built on an SMS/TCPA
    mismatch between the manifest tags and the text; the content has since
    been replaced so the tags now match. See `D-S0-05`/`D-TR20-S4-07` below
    for the version-resolution (V5) angle this pair now supports, which is
    the more interesting eval value than the old decoy was.

- **D-TR20-S4-07** · S4 (2+4) / V5 · Version-resolution test built on the same
  pair as D-TR20-S4-03: `meridian-comfort-club_membership-terms_california_2026-08-01.md`
  has `parent_id: CUS-RES-CA-TERMS-2024-06-01` in the manifest, and
  `status_at_as_of` marks the 2024 file `superseded` / the 2026 file `active`
  at the default as-of date. A correct agent asked "are Meridian's CA Comfort
  Club membership terms AB-2863-compliant?" must answer using the **August
  2026** text and must not blend in or cite the June 2024 cancellation
  mechanics (phone/mail only) as if they were still current.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — whole trigger (version-resolution is a stage-0/stage-4 concern, not clause-specific)
  - Docs: `corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_california_2024-06-01.md` (superseded); `.../meridian-comfort-club_membership-terms_california_2026-08-01.md` (active, parent_id points to the 2024 file)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: operative-text finding cites only the August 2026 version; citing the June 2024 version as current is a V5 violation
  - Plants: `CA_RENEW_2024` → `CA_RENEW_2026` (version family `meridian-comfort-club_membership-terms_california`)

- **D-TR20-S4-08** · S4 (2+4) · Two-silo decoy: Meridian in fact runs **two
  separate CA Comfort Club price/renewal regimes** with different numbers —
  the standalone membership-terms document (D-TR20-S4-03/07, current fee
  $21.95/month) and the residential installation agreement's bundled §6
  Comfort Club clause (D-TR20-S4-01, $19.95/month, matching the *old* June
  2024 figure, not the current $21.95 one). These are not the same
  enrollment path (installation-driven "Complimentary Year" conversion vs.
  standalone membership signup), so the differing price is not itself a
  contract inconsistency — but an agent should not conflate the two
  documents' compliance postures: the installation agreement's §6.5
  self-serving consent claim (D-TR20-S4-01) remains a real exposure
  regardless of the separately-compliant membership-terms document.
  - Docs: `corpus/documents/customers/residential-terms/meridian_residential-installation-agreement-form_california_2025-07-01.md` §6.2, §6.5; `corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_california_2026-08-01.md` §3, §4
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: two independent findings, not merged into one "Comfort Club" conclusion — one compliant document and one exposed document, both real
  - Realism: a plausible corpus artifact (two products priced/drafted independently) rather than a manufactured trap; worth flagging if a later pass decides these should reconcile to a single price

- **D-TR20-S4-04** · S4 (2+4) · Should-not-flag / wrong jurisdiction: the WA
  Comfort Club membership terms are a genuine continuous-service, auto-renewing
  program ("Upon renewal, a new membership term commences"), but AB 2863
  amends only CA Bus. & Prof. Code §§17601-17602, which protects a "consumer
  in this state" (California).
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17602(a) ("consumer in this state")
  - Docs: `corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_washington_2026-09-01.md` — §5 "Membership Duration and Anniversary Date"
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: not affected (jurisdiction fails); logged, not silently dropped

- **D-TR20-S4-05** · S4 (2+4) · Should-not-flag / wrong jurisdiction, same
  reasoning: TX Comfort Club maintenance agreement is a perpetual auto-charging
  membership with an automatic-termination-on-payment-failure clause, but TX
  has no AB-2863 equivalent in this corpus.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17602(a)
  - Docs: `corpus/documents/customers/residential-terms/meridian-comfort-club_maintenance-agreement_texas_2026-08-01.md` — §I, §III.A-C
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: not affected (jurisdiction fails)

- **D-TR20-S4-06** · S4 (2+4) · Should-not-flag / direction reversal: vendor
  SaaS and services auto-renewals where Meridian is the paying customer, not
  the consumer-facing seller — AB 2863 only regulates a "business" making
  offers to a "consumer" (an individual acquiring for "personal, family, or
  household purposes," §17601(a)(4)). A corporate B2B customer is not that
  protected party.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — §17601(a)(4)
  - Docs: `corpus/documents/vendors/cintrella-uniform-services_rental-service-agreement_2021-05-03.md` — §3.2 "Automatic Renewal" (60-month evergreen term); similarly `fieldflow-software_terms-of-service_2026-01-15.md`, `roadiq-telematics_platform-terms-of-service_2025-07-01.md`, `paystream-technologies_services-agreement_2026-03-01.md`, `promatch-networks_terms-of-use_2026-02-01.md` (vendor, auto_renewal/distractor)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: not affected for all — treat as one slice (B2B direction
    reversal), not five separate findings

### S3 — relevant-stack set

- **D-TR20-S3-01** · S3 · Expected in-scope stack: `customers/residential-terms`
  (the whole cluster — CA installation agreement, CA/WA/TX/IL Comfort Club
  terms) stays in scope even though most member docs resolve "not affected" at
  stack level; the company-level gate is lenient (any residential consumer
  contract proceeds). Expected excluded: `documents/vendors/*` (Meridian is
  the customer, not the consumer), `documents/employment`, `documents/acquisitions`,
  `documents/supply`, `documents/subcontracts`, `documents/corporate`.
  - Trigger: TR-20 2024-09-24_ab-2863-chaptered.txt — whole trigger
  - Docs: `corpus/documents/customers/residential-terms/` (all files)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: scope-in = residential-terms; scope-out = all vendor/B2B stacks,
    with reason "not a consumer offer"

---

## 2. TR-21 — FTC negative-option request for comment

Trigger: `corpus/triggers/TR-21-ftc-negative-option/2026-03-13_negative-option-request-for-comment.txt`
(status: **proposed** — ANPRM, request for public comment; comments closed
2026-04-13; no final rule as of the as-of date). Distinct from the pre-2024
prenotification-only Negative Option Rule (16 CFR 425), which remains in
force but is narrow (periodic-shipment merchandise plans), and from the 2024
amended Rule, which the Eighth Circuit vacated in July 2025 (*Custom
Commc'ns, Inc. v. FTC*) and is therefore **not** in force.

### S1a — change items

- **D-TR21-S1a-01** · S1a · Legal-status item: this is an advance notice of
  proposed rulemaking, not a rule — no compliance obligation attaches yet.
  - Trigger: TR-21 2026-03-13_negative-option-request-for-comment.txt — "ACTION" / "DATES" (lines ~27-39)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: legal status `proposed`; comment period closed 2026-04-13 VERIFY
    but that only closes comments, it doesn't create a rule
  - Realism: a GC monitoring for *obligations* should see this as a
    watch-only item; a GC monitoring for *regulatory direction* would want it
    surfaced anyway — worth a labeling note for stage 5 (direction: neutral)

- **D-TR21-S1a-02** · S1a · Background fact, not itself a rule change: the
  2024 amended Negative Option Rule was vacated by the Eighth Circuit
  (7/2025) for failure to do the §22 preliminary regulatory analysis; the
  pre-2024 rule is what's actually in force today.
  - Trigger: TR-21 2026-03-13_negative-option-request-for-comment.txt — Section I "Overview" (¶2)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: captured as background/legal-status context, not as an
    independent actionable change item; a later agent must not conflate "the
    vacated 2024 amendments' requirements" with "current law"
  - Verify: confirm no petition for rehearing/cert or re-adoption since
    vacatur (not stated in this corpus — treat as undeterminable)

- **D-TR21-S1a-03** · S1a · Noise: enumerated past FTC enforcement actions
  (Vonage, Amazon, Adobe, Uber, LA Fitness, Instacart) cited as background
  motivation, not rule text.
  - Trigger: TR-21 2026-03-13_negative-option-request-for-comment.txt — footnote 2
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: dismissed as noise/context, logged not dropped

### S4 — findings

- **D-TR21-S4-01** · S4 (2+4) · Should-not-flag / direction: the operative
  (pre-2024) 16 CFR 425 Rule only reaches "prenotification negative option
  plans" — periodic (e.g., monthly) merchandise shipments absent an
  affirmative "no" (classic book/record-club structure). Meridian's Comfort
  Club is an affirmatively-enrolled service membership with a stated auto-
  renewal price, not a periodic-shipment negative-option plan.
  - Trigger: TR-21 2026-03-13_negative-option-request-for-comment.txt — Section I "Overview"
  - Docs: `corpus/documents/customers/residential-terms/meridian_residential-installation-agreement-form_california_2025-07-01.md` — §6
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: not affected under the current, narrow Rule
  - Verify: the operative 16 CFR 425 definitional text is not in this
    corpus — see Gaps; this scenario's "not affected" call rests on the
    ANPRM's own description of the Rule's scope, not the CFR text itself

- **D-TR21-S4-02** · S4 (2+4) · Should-not-flag / direction reversal, same
  logic as D-TR20-S4-06: the FTC's negative-option regime protects
  "consumers," not corporate B2B customers, so Meridian's vendor/SaaS
  auto-renewal contracts (Cintrella, FieldFlow, RoadIQ, Paystream, ProMatch)
  are out of scope regardless of the ANPRM's eventual amendments.
  - Trigger: TR-21 2026-03-13_negative-option-request-for-comment.txt — Section I
  - Docs: `corpus/documents/vendors/cintrella-uniform-services_rental-service-agreement_2021-05-03.md` §3.2; sibling SaaS ToS files
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: not affected for all, one slice

- **D-TR21-S4-03** · S4 (2+4) · Watch / monitor: the CA Comfort Club
  free-to-pay conversion (same clause as D-TR20-S4-01) is exactly the kind of
  continuity/negative-option structure the ANPRM asks about for possible
  future amendments — no present obligation, but worth a logged "watch" item
  tying the two triggers together for stage 5's cross-reference.
  - Trigger: TR-21 2026-03-13_negative-option-request-for-comment.txt — Section VIII "Objectives, Regulatory Alternatives, and Request for Comments"
  - Docs: `corpus/documents/customers/residential-terms/meridian_residential-installation-agreement-form_california_2025-07-01.md` — §6
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: urgency `no clock`; direction `neutral`; response_type `monitor`
  - Plants: cross_reference to D-TR20-S4-01's finding

### S3 — relevant-stack set

- **D-TR21-S3-01** · S3 · Same in-scope/out-of-scope stack set as
  D-TR20-S3-01 and for the same reason (consumer vs. B2B direction).
  - Trigger: TR-21 2026-03-13_negative-option-request-for-comment.txt — whole trigger
  - Docs: `corpus/documents/customers/residential-terms/` (all files)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: scope-in = residential-terms; scope-out = vendor/B2B stacks

---

## 3. TR-14 — CA SB 699 / AB 1076 (positive) and TR-90 — controls (WY SF 107, TX SB 1318)

**Round 2 rework (2026-09-29):** per `CHANGES-2026-09-29.md` §E, CA SB 699
and CA AB 1076 were moved out of `corpus/triggers/TR-90-controls/` into a
new group, `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/` (files
`2023-09-01_ca-sb-699.txt`, `2023-10-13_ca-ab-1076.txt`), with a positive
`expected_relevance` in that group's own `meta.yaml`. `TR-90-controls` now
holds only **WY SF 107** and **TX SB 1318**, both still marked
`role: control`, and its `meta.yaml` has been corrected accordingly (see
Gaps — this closes the prior "meta.yaml overclaims control status" gap).
This section covers both groups together since they share the same
scenario history: TR-14 is the **positive** half (real findings), TR-90 is
the **control** half (should-not-flag). The legacy scenario IDs
`D-TR90-S1b-01`, `D-TR90-S1b-02` and `D-TR90-S3-01` are kept stable per the
ID-stability rule even though they now reference TR-14, not TR-90 — see
each entry's updated `Trigger:` line.

`meta.yaml` originally billed the whole four-item group as "real changes
that should produce no action for this company (passed deadline, wrong
profession, wrong state)." **Updated 2026-09-29:** `legal-questions.md` Q2
resolves the CA SB 699 item definitively by reading Nadia Castellano's
offer letter/PIIA clause by clause (see Package C's `TR13-S4-03` for the
full three-clause table). That resolution changes SB 699 from "messier
than the label suggests" to **not a control at all** — it produces one
real, named finding. **Updated further, Round 2 (2026-09-29), per
`legal-questions.md` Q7:** AB 1076 is *also* not a clean control — the CA
technician template and all six signed CA instances carry their own §6.1
employee non-solicit, and five of the six instances were signed before
AB 1076's 2024-02-14 notice deadline (see the new `D-TR14-S4-*` scenarios
below). WY SF 107 and TX SB 1318 are unaffected by any of this and still
resolve cleanly as TR-90 controls.

- **D-TR90-S1b-01** · S1b · **Reclassified 2026-09-29: CA SB 699 is a
  positive trigger, not a control.** Per `legal-questions.md` Q2, Castellano's
  §10 ("Efforts; Duty Not to Compete") is an in-term restraint and a decoy —
  §16600 doesn't reach it (*Techno Lite, Inc. v. Emcod, LLC* (2020)). But the
  **same document's §12** ("Non-Solicitation of Employees/Consultants," a
  one-year **post-employment** employee non-solicit) is likely void under
  §16600 per *AMN Healthcare v. Aya* (2018), and was entered into 2024-05-06 —
  after SB 699's 2024-01-01 effective date — so it falls squarely within
  §16600.5's private-right-of-action exposure. The company-level gate should
  not exit to "no action"; it should proceed, and the stack-level result is a
  **material finding**, not just an unresolved ambiguity.
  - Trigger: **TR-14** `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/2023-09-01_ca-sb-699.txt` — §16600.5(a)-(c) (legacy scenario ID `D-TR90-S1b-01` kept per the ID-stability rule; the group moved from `TR-90-controls` to `TR-14-ca-noncompete-sb699-ab1076` per `CHANGES-2026-09-29.md` §E)
  - Docs: `corpus/documents/employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md` — §12 "Non-Solicitation of Employees/Consultants" (the real finding); §10 "Efforts; Duty Not to Compete" (decoy, cite only to show it was correctly excluded)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: company gate proceeds (not a clean exit); stack-level result =
    **affected, material, direction exposure** (§12 likely void and
    enforceable-against risk under SB 699's private right of action);
    §10 remains not affected in isolation
  - Verify: whether §10's during-employment duty is itself reachable by
    §16600 is now moot for the *company-level* materiality call, since §12
    alone already defeats a clean-control conclusion — but still worth
    resolving for completeness at the clause level (Package C tracks this)
  - Realism: `TR-90-controls`'s old `meta.yaml` framing ("should produce no
    action") no longer holds for SB 699 once the document is read clause by
    clause; **resolved 2026-09-29** — SB 699 now lives in its own
    `TR-14-ca-noncompete-sb699-ab1076` group with a positive
    `expected_relevance` stating this exact finding, so no further
    `meta.yaml` correction is outstanding (see Gaps)

- **D-TR90-S1b-02** · S1b · **CA AB 1076 has no notice duty for Castellano
  specifically — narrower claim than before.** **Round 2 note (2026-09-29,
  `legal-questions.md` Q7): this scenario's clean result is specific to the
  Castellano document only — AB 1076 is no longer a clean control for the
  company as a whole (see the new `D-TR14-S4-02` below, the CA technician
  template's five pre-deadline instances).** For Castellano's own document,
  the reasoning is unchanged: the non-clean-exit reasoning from the old
  SB 699 framing (built on the §10 ambiguity) no longer applies now that §10
  is confirmed a decoy; AB 1076 has no notice duty for this document on its
  own, narrower ground — its written-individualized-notice deadline (by
  2024-02-14) had already passed *before* Castellano's agreement was even
  signed (2024-05-06), so AB 1076's notice obligation likely never attached
  to this document in the first place (it applied to contracts existing
  before the deadline), and no notice clock is running today regardless. The
  real exposure in the same document (§12) is SB 699's, not AB 1076's — AB
  1076 and SB 699 should not be merged into one "CA noncompete control"
  conclusion now that they resolve differently, and this document-level
  result should not be over-generalized to "AB 1076 is a clean control."
  - Trigger: **TR-14** `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/2023-10-13_ca-ab-1076.txt` — §16600.1(b)(1) (notice deadline); §16600(b) (broad construction) (legacy scenario ID `D-TR90-S1b-02` kept; group moved from `TR-90-controls` to `TR-14-ca-noncompete-sb699-ab1076` per `CHANGES-2026-09-29.md` §E)
  - Docs: `corpus/documents/employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md` (signed 2024-05-06, after the notice deadline; §12 is the live SB 699 issue, not an AB 1076 notice issue)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: for this document specifically, company gate exits cleanly for
    AB 1076 (notice deadline point, unaffected by the SB 699 reclassification)
    — but the stage-5 write-up must still surface the §12/SB 699 finding
    under its own trigger, not silently under AB 1076's "no action" label,
    and must not generalize this document's clean AB 1076 result to the
    template/six-instance stack covered by `D-TR14-S4-02`
  - Verify: whether an employee non-solicit like §12 counts as a "noncompete
    clause" for AB 1076 notice purposes is unsettled per practitioner
    commentary (`legal-questions.md` Q2/Q7) — moot here only because the
    notice deadline predates the signing date regardless of that question;
    this same unsettled-scope point is *not* moot for `D-TR14-S4-02`'s
    pre-deadline instances, which is why those resolve to needs-review
    rather than not-affected
  - Realism: the risk this scenario guards against is a synthesis step that
    sees "AB 1076 = control" and "SB 699 = control" as a matched pair and
    drops both, when only one of the two is actually clean even for this one
    document — and a second risk, newly relevant in Round 2: generalizing
    Castellano's clean AB 1076 result company-wide when the technician
    template stack shows otherwise

- **D-TR90-S1b-03** · S1b · Should-not-flag, clean: WY SF 107 voids
  noncompetes in Wyoming, but `states_of_operation` is `[CA, WA, IL, TX]` —
  no WY branches, subsidiaries, or acquisitions anywhere in the profile.
  - Trigger: TR-90 `corpus/triggers/TR-90-controls/2025-03-_wy-sf-107.txt` — §1(a) 1-23-108
  - Docs: none (company profile only)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: company gate exits — out-of-footprint, clean control

- **D-TR90-S1b-04** · S1b · Should-not-flag, clean but a good decoy: TX
  SB 1318 restricts noncompetes only against persons "licensed as a
  physician by the Texas Medical Board." Meridian operates in TX
  (HOU/SAT/DAL) so the *state* matches — the control only holds because of
  *profession*, testing whether the agent checks both dimensions rather than
  short-circuiting on the state match.
  - Trigger: TR-90 `corpus/triggers/TR-90-controls/2025-06-20_tx-sb-1318-physicians.txt` — §1, Sec. 15.50(b)
  - Docs: none (company profile: `industry` = plumbing/HVAC, no physicians in `workforce`)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: company gate exits — wrong profession, clean control

- **D-TR90-S3-01** · S3 · Scope trace for the group, **updated, and now
  spanning two trigger groups** (legacy scenario ID kept; SB 699/AB 1076 are
  now TR-14, not TR-90 — see `CHANGES-2026-09-29.md` §E): SB 699's gate
  proceeds and its in-scope stack resolves to a specific document and clause
  — `employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md`
  §12 — rather than a generic "CA-tagged noncompete docs" set. **Round 2
  addition:** SB 699's full in-scope stack also includes the CA technician
  template (`form_technician-employment-agreement_california_rev-2017.md`
  §6.1) and its six signed instances (`D-TR14-S4-01`) — Castellano's §12 is
  not the only SB 699 hit in the corpus. AB 1076's gate still proceeds for
  scoping purposes; for Castellano's document specifically it cleanly
  resolves not-affected once the notice-deadline timing is checked
  (D-TR90-S1b-02), but for the CA technician template's five pre-deadline
  instances it resolves to needs-review, not not-affected (`D-TR14-S4-02`).
  For WY SF 107 and TX SB 1318 (still TR-90), scope is still correctly empty
  (all-out is valid and logged per system-design §Stage 3).
  - Trigger: TR-14 `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/` (both versions, SB 699 + AB 1076); TR-90 `corpus/triggers/TR-90-controls/` (both versions, WY SF 107 + TX SB 1318)
  - Docs: `corpus/documents/employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md` §12 (SB 699's Castellano finding); `employment/templates/form_technician-employment-agreement_california_rev-2017.md` §6.1 + the 6 signed CA technician instances (SB 699's template-level finding; AB 1076 needs-review for 5 of the 6) — Package C owns the full employment-stack sweep, this file owns the trigger-group-level scope trace
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: SB699 scope-in = CA employment/acquisitions stacks, with
    confirmed material hits at both Castellano §12 and the technician
    template §6.1/6 instances; AB1076 scope-in = same stacks, resolves
    not-affected for Castellano, needs-review for the 5 pre-deadline
    technician instances; WY/TX scope = empty, reason "out of footprint" /
    "wrong profession"

### New S4 scenarios (TR-14, Round 2 2026-09-29)

- **D-TR14-S4-01** · S4 · CA technician employment template §6.1
  (Non-Solicitation of Employees: "During the Employee's employment … and
  for a period of one (1) year immediately following termination of
  employment for any reason, the Employee agrees not to solicit, recruit,
  encourage, or attempt to hire or engage any employee") + all 6 signed CA
  instances — **affected** under SB 699 for the same reason as Castellano
  §12: a post-employment employee non-solicit is likely void under §16600
  per *AMN Healthcare v. Aya*, and SB 699 (effective 2024-01-01) makes it
  independently unlawful to enter into or attempt to enforce such a clause.
  The **2024-04-07 Sabrina Marchetti** instance is the clearest hit (entered
  into after SB 699's effective date, so both the void-clause theory and
  SB 699's own "enter into" prohibition apply directly); the other 5
  instances (Alan Ellison 2017-12-10, Uma Kilgore 2019-02-09, Farah
  Abernathy 2020-06-15, Felix Delacroix 2021-08-28, Gemma Tallis 2023-01-04)
  are void under §16600 on general principles and independently exposed if
  Meridian ever attempts to enforce §6.1 against them post-2024-01-01 (SB
  699 reaches *attempted enforcement* of a pre-existing clause, not only
  clauses newly entered into).
  - Trigger: `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/2023-09-01_ca-sb-699.txt` — §16600.5(a)-(c)
  - Docs: `corpus/documents/employment/templates/form_technician-employment-agreement_california_rev-2017.md` §6.1; `corpus/documents/employment/signed-agreements/{alan-ellison_technician-employment-agreement_ca_2017-12-10,uma-kilgore_technician-employment-agreement_ca_2019-02-09,farah-abernathy_technician-employment-agreement_ca_2020-06-15,felix-delacroix_technician-employment-agreement_ca_2021-08-28,gemma-tallis_technician-employment-agreement_ca_2023-01-04,sabrina-marchetti_technician-employment-agreement_ca_2024-04-07}.md`
  - Inputs: as-of 2026-10-01; profile default
  - Expected: affected — template §6.1 and all 6 instances, direction =
    exposure (void clause / unlawful to attempt to enforce); Sabrina
    Marchetti (2024-04-07) is the clearest, highest-confidence hit
  - Verify: none outstanding — §6.1's text and all 6 instance dates are
    confirmed directly against the corpus documents
  - Realism: this is the corpus's largest single SB 699 exposure by document
    count (7 documents: 1 template + 6 instances), and pairs with
    Castellano §12 to show SB 699 is not a one-document finding

- **D-TR14-S4-02** · S4 · The **5 CA technician instances signed before**
  AB 1076's 2024-02-14 notice deadline — Alan Ellison (2017-12-10), Uma
  Kilgore (2019-02-09), Farah Abernathy (2020-06-15), Felix Delacroix
  (2021-08-28), Gemma Tallis (2023-01-04) — **needs review**, not a clean
  control and not a confident "affected." Reasons, per `legal-questions.md`
  Q7: (a) whether an employee non-solicit like §6.1 counts as a "noncompete
  clause" for AB 1076 notice purposes is unsettled among practitioners; (b)
  no notice document exists anywhere in the corpus for any of these 5
  employees, so whether Meridian actually sent the required notice by
  2024-02-14 cannot be determined either way from the documents on hand; (c)
  each employee's current/former status (whether they were still employed
  after 2022-01-01, which is when the notice duty attached under AB 1076)
  is not stated in the corpus. **"Not affected" is a fail here** (it
  resolves an unsettled scope question and an absent-evidence question both
  in the company's favor without support); **a confident "AB 1076 notice
  violation" is over-claiming** in the other direction (asserting the
  unsettled scope question resolves against the company, and that notice
  was in fact not sent, neither of which the corpus confirms). Needs-review
  is the only defensible gold direction.
  - Trigger: `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/2023-10-13_ca-ab-1076.txt` — §16600.1(b)(1) (notice deadline); §16600(b) (broad construction)
  - Docs: `corpus/documents/employment/signed-agreements/{alan-ellison_technician-employment-agreement_ca_2017-12-10,uma-kilgore_technician-employment-agreement_ca_2019-02-09,farah-abernathy_technician-employment-agreement_ca_2020-06-15,felix-delacroix_technician-employment-agreement_ca_2021-08-28,gemma-tallis_technician-employment-agreement_ca_2023-01-04}.md` §6.1; template `form_technician-employment-agreement_california_rev-2017.md` §6.1
  - Inputs: as-of 2026-10-01; profile default
  - Expected: needs review for all 5 instances — do not resolve to "not
    affected" (fails) or to a settled void-notice violation (over-claims)
  - Verify: whether §6.1 counts as a "noncompete clause" for AB 1076 notice
    purposes — genuinely unsettled per practitioner commentary, not
    resolvable from the corpus alone; whether notice was sent — absent from
    the corpus by construction, not merely unread; each employee's
    employment status after 2022-01-01 — not stated in these agreements
  - Realism: this is Round 2's headline "AB 1076 is not a clean control"
    case — contrasts directly with `D-TR90-S1b-02`, where AB 1076 cleanly
    does not attach to Castellano's document because her signing date
    (2024-05-06) is *after* the notice deadline; these 5 technician
    instances sit on the other side of that deadline, where the scope
    question actually matters and can't be waved away

- **D-TR14-S4-03** · S4 · CA technician template §6.2 (Non-Solicitation of
  Customers Through Use of Trade Secrets: "Employee shall not … use the
  Company's trade secrets … to solicit any Company customer. Nothing in
  this Agreement prohibits Employee from engaging in any lawful profession,
  trade or business after employment ends, consistent with California
  Business and Professions Code Section 16600") — **decoy / should-not-flag**
  for both SB 699 and AB 1076: it is a trade-secret-limited customer
  non-solicit, the recognized §16600 carve-out, and expressly says so in its
  own text. Contrast with §6.1 (`D-TR14-S4-01`), the same template's
  employee non-solicit, which is the real finding.
  - Docs: `corpus/documents/employment/templates/form_technician-employment-agreement_california_rev-2017.md` §6.2; same 6 signed CA instances as §6.1
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected — decoy, for both SB 699 and AB 1076
  - Verify: none outstanding — §6.2's text is confirmed directly against the corpus template
  - Realism: same-document, same-template contrast pair with §6.1 — tests
    whether an agent distinguishes clause-by-clause within a single
    "NON-SOLICITATION" section rather than treating §6 as one undifferentiated
    finding or one undifferentiated decoy

---

## 4. Distractor trigger versions (cross-group S1a noise / S1b exits)

- **D-DIST-01** · S1a · TR-01's own aluminum distractor: Proclamation 11045
  (2026-07-20) is a separate Section 232 action scoped to aluminum HTS
  headings, filed inside the TR-01 folder alongside the real copper
  proclamations. The *real* 11021/11032 proclamations are themselves titled
  "Strengthening Actions ... Aluminum, Steel, and Copper," so conflating "the
  aluminum-only distractor" with "the copper-relevant slice of a combined
  aluminum/steel/copper proclamation" is a realistic failure mode, not a
  strawman.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-07-20_proclamation-11045-aluminum-DISTRACTOR.txt`
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: dismissed as out-of-group; no copper rate/scope change item
    should cite this file
  - Note: distractors live inside the TR-01 folder, so this is purely a
    stage-1a synthesis test, not a stage-3 scope test — an eval harness that
    fetches "the TR-01 group" must include this file to exercise it at all

- **D-DIST-02** · S1a · TR-01's DPA critical-minerals distractor
  (2026-07-30): a Defense Production Act §101 supply-chain determination, not
  a Section 232 tariff action — no duty rate, no HTS scope.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-07-30_dpa-critical-minerals-DISTRACTOR.txt`
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: dismissed as out of scope (different statutory authority); at
    most logged as background watch, never as a copper duty change

- **D-DIST-04** · S1a/S5-link · WY SF 107's own physician carve-out
  (§1(b), void noncompetes for physicians) is textually similar to TX SB
  1318 — both void physician noncompetes — which could tempt a merged or
  duplicate finding across two different trigger versions/states.
  - Trigger: `corpus/triggers/TR-90-controls/2025-03-_wy-sf-107.txt` §1(b) vs `.../2025-06-20_tx-sb-1318-physicians.txt` §1
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: two separate change items/records, not merged (V8/V9-adjacent);
    both independently exit the company gate for this company

---

## 5. S0 diff pairs (versioned triggers)

Candidate substantive old/new pairs, one-liners; each cosmetic-only variant
should be built by re-formatting a real file's whitespace/markup/anchors
without touching any operative word, then re-run through stage 0 to confirm
it exits.

- **D-S0-01** · S0 · TR-01: `2025-07-30_proclamation-10962.txt` (flat 50%
  ad valorem, HTS 7406-7419 incl. 7411/7412/7418.20 per meta annex note) →
  `2026-04-02_proclamation-11021.txt` (tiers to 50%/25%/10% by copper
  content, UK carve-out) — substantive (rate-structure change). Cosmetic
  variant: re-wrap the Federal Register HTML's line lengths, normalize
  `&nbsp;`/`&amp;` entities, renumber footnote markers (`\1\` → `[1]`) —
  same words, must still exit.

- **D-S0-02** · S0 · TR-01: `2026-04-02_proclamation-11021.txt` →
  `2026-06-01_proclamation-11032.txt` (copper-content threshold tightened
  95%→85%; extends the temporarily-reduced 15% rate) — substantive. Cosmetic
  variant: strip `[[Page NNNN]]` pagination markers and collapse paragraph
  indentation only.

- **D-S0-03** · S0 · TR-10: `2026-09-_rcw-49-62-current-text.txt`
  (in-force-until-2027-06-30 codification) → `2026-03-23_eshb-1155-session-law.txt`
  (enacted, effective 2027-06-30: voids ALL noncompetes, notice by
  2027-10-01, treats forfeiture/repayment as noncompetes) — substantive, and
  also a strong M1 (as-of-date-shift) candidate. Cosmetic variant: rebuild the
  bill's own `((strikeout))`/underline drafting markup into plain prose
  *without* changing any operative word.
  - Realism: this cosmetic rebuild is riskier than the others — WA session
    laws use `((...))` to mark deleted text; naively stripping the markup
    could silently delete or restore operative text instead of just
    reformatting it. Whoever builds the stage-0 normalizer for this pair
    should diff word-for-word against the enrolled PDF, not just visually.

- **D-S0-04** · S0 · TR-11: `2023-03_820-ilcs-90-prior-text.txt` (superseded,
  pre-construction-carveout) → `2024-08-09_public-act-103-0921.txt` (adds
  construction-employee void rule, earnings thresholds stepping up
  2027-01-01) — substantive. Cosmetic variant: the corpus already stores both
  a live ILGA URL and a web.archive.org fetch for the same text in
  `meta.yaml` — a byte-diff of those two fetches (if available) may already
  be a naturally-occurring cosmetic-only pair; otherwise construct one from
  whitespace/anchor-tag differences only.

- **D-S0-05** · S0 / V5 · **New 2026-09-29** (see `CHANGES-2026-09-29.md` §A4):
  the CA Comfort Club membership-terms document family is now a genuine
  substantive old/new pair rather than two independent SMS-consent pages —
  `meridian-comfort-club_membership-terms_california_2024-06-01.md` (auto-renewal,
  cancel by phone only) → `meridian-comfort-club_membership-terms_california_2026-08-01.md`
  (express consent checkbox, online "Cancel Membership" button, annual
  reminder, 7-30 day price-change notice; `parent_id` links the two in the
  manifest). This is a document-side pair, not a trigger-side one, so it
  exercises stage-0/version-resolution logic on `documents/**` rather than
  `triggers/**` — useful as a contrast case since most of this file's S0
  entries are trigger versions. See `D-TR20-S4-07` for the resulting V5
  scenario. Cosmetic variant: reformat either file's numbered-list markup
  (a/b/c vs 1/2/3) without changing wording.

---

## 6. S1b profile pairs (company-gate flips)

- **D-S1B-01** · S1b · M2 · Remove `WA` from `company.states_of_operation` →
  TR-10 (WA noncompete) exits at the company gate. Dependent edits for
  internal consistency: drop the `Meridian Mechanical of Washington, LLC`
  entry from `company.subsidiaries` and the `TAC`/`SPO` entries from
  `company.branches`.
  - Field: `corpus/company/profile.yaml` → `company.states_of_operation`
  - Expected: TR-10 gate flips proceed→exit

- **D-S1B-02** · S1b · M2 · Remove `IL` from `company.states_of_operation` →
  TR-11 (IL construction noncompete) exits at the company gate.
  - Field: `corpus/company/profile.yaml` → `company.states_of_operation`
  - Expected: TR-11 gate flips proceed→exit

- **D-S1B-03** · S1b · M2 · Remove `CA` from `company.states_of_operation` →
  TR-20 (CA AB 2863) and **TR-14's CA SB 699/AB 1076** (moved out of
  `TR-90-controls` per `CHANGES-2026-09-29.md` §E — see §3 above) all flip
  proceed→exit (no CA consumers, no CA employees). **Round 2 note:** because
  SB 699 is no longer a clean control (it now produces real findings —
  Castellano §12, the CA technician template §6.1/6 instances), this pair is
  no longer just "a control gate flips off"; it's now also a genuine M2 test
  that removing CA correctly suppresses a real, material finding, not only a
  no-op control. Bonus cross-reference: also flips TR-12 (CA AB 692, Package
  C scope).
  - Field: `corpus/company/profile.yaml` → `company.states_of_operation`
  - Expected: TR-20 and TR-14 (SB699, AB1076) gates flip proceed→exit

- **D-S1B-04** · S1b · M2 · Flip `company.purchasing.imports_directly` to
  `false` and `direct_import_share` to `0` → TR-02 (IEEPA tariffs; Package
  A/B scope) gate changes: Meridian is no longer importer of record for any
  direct entry, so importer-specific items (refund claims, entry-type
  obligations) drop at the gate even though supplier-pass-through items may
  still proceed. Cross-package note for A/B, recorded here because it's a
  company-gate field, not a stack finding.
  - Field: `corpus/company/profile.yaml` → `company.purchasing.imports_directly`, `direct_import_share`
  - Expected: TR-02 importer-specific items flip proceed→exit

- **D-S1B-05** · S1b · M2 (negative case) · Remove `copper tube and pipe` /
  `copper and brass fittings` from `purchasing.main_inputs` and zero
  `copper_share_of_material_spend` → tests that TR-01's lenient gate does
  **not** flip to exit, since HVAC equipment (condensers, water heaters) still
  plausibly contains copper components even when copper isn't a named "main
  input." A false exit here would be a gate-leniency failure.
  - Field: `corpus/company/profile.yaml` → `company.purchasing.main_inputs`, `copper_share_of_material_spend`
  - Expected: TR-01 gate stays proceed (should NOT flip to exit)

- **D-S1B-06** · S1b · M6-adjacent (negative control) · **Updated 2026-09-29:**
  per `CHANGES-2026-09-29.md` §A3, Riverside, Clearpath and FleetCard have
  already been removed from `counterparties.other` in the live profile (they
  had no documents) — confirmed in `corpus/company/profile.yaml`, which now
  lists only `FR-TPG`, `SAAS-FSM` (FieldFlow), `SAAS-PAY` (Paystream),
  `SAAS-TEL` (RoadIQ), `SAAS-LG1` (HomeHero Leads), `SAAS-LG2` (ProMatch
  Networks) under `other`. The scenario itself still works as a negative
  control, just on the current, shorter list: remove the remaining SaaS
  entries (FieldFlow, Paystream, RoadIQ, HomeHero Leads, ProMatch Networks)
  entirely → should still produce no change in TR-20/TR-21 determinations,
  since those stacks were already out of scope for direction reasons (B2B,
  not consumer), not because they were named in the profile.
  - Field: `corpus/company/profile.yaml` → `counterparties.other`
  - Expected: TR-20/TR-21 findings unchanged
  - Verify: the profile's `customers` list separately gained `CUS-NBC`
    (Northbrook Commons Condominium Association, IL) and `CUS-RES`
    (residential customers) per §A3 — neither is a `counterparties.other`
    SaaS entry, so this addition doesn't affect this scenario's mechanics,
    but see `D-S1B-09` below for the one new profile-pair case it does create

- **D-S1B-07** · S1b · M2 · Set `company.revenue_mix.residential_service_and_install`
  to `0` (no residential consumer business at all) → TR-20/TR-21 gate flips
  proceed→exit on a cleaner, more direct basis than D-S1B-03 (removing the
  consumer relationship itself, independent of which state it's in).
  - Field: `corpus/company/profile.yaml` → `company.revenue_mix.residential_service_and_install`
  - Expected: TR-20 and TR-21 gates flip proceed→exit

- **D-S1B-09** · S1b · M6-adjacent · **New 2026-09-29**, enabled by
  `CHANGES-2026-09-29.md` §A3's addition of `CUS-RES` ("Residential
  customers (Meridian Comfort Club members)") to `counterparties.customers`:
  remove only the `CUS-RES` entry (leaving `revenue_mix.residential_service_and_install`
  at its current nonzero value) → tests whether the company-gate logic for
  TR-20/TR-21 actually keys on the structured `revenue_mix` field (as
  `D-S1B-07` assumes) or on the presence of a named consumer counterparty. A
  correct implementation should still proceed (the revenue-mix fact is the
  real driver; the counterparty list is descriptive, not load-bearing) — a
  gate that flips to exit here instead would reveal it's reading the wrong
  field.
  - Field: `corpus/company/profile.yaml` → `counterparties.customers` (remove `CUS-RES` only)
  - Expected: TR-20/TR-21 gates unchanged (still proceed), contrasted with `D-S1B-07`'s revenue_mix edit which does flip them
  - Realism: a genuine implementation-fidelity check rather than a legal-substance one — worth keeping distinct from D-S1B-07 rather than merging them

- **D-S1B-08** · S1b · M2 · Add `WY` to `company.states_of_operation` →
  TR-90's WY SF 107 flips from a clean out-of-footprint exit
  (D-TR90-S1b-03) to a live company-level question (does any WY employee
  have a noncompete?) — the inverse pairing, useful for a before/after
  metamorphic run.
  - Field: `corpus/company/profile.yaml` → `company.states_of_operation`
  - Expected: WY SF 107 gate flips exit→proceed

---

## Gaps

- **16 CFR 425 text absent.** The corpus has the 2026 ANPRM (TR-21) but not
  the operative pre-2024 Negative Option Rule text itself, nor the vacated
  2024 amendments. D-TR21-S4-01's "not affected" call rests on the ANPRM's
  own description of the Rule's scope (periodic-shipment merchandise plans),
  not a direct citation to 16 CFR 425. Adding the current CFR text (or at
  least its definitions section) would let that finding cite the actual rule
  instead of a secondary description.
- **No CA-equivalent-or-analog auto-renewal statute for WA/IL/TX in the
  corpus.** D-TR20-S4-04/05 rely on "no equivalent trigger exists in this
  corpus" as the reason WA/TX Comfort Club terms aren't affected. That's
  correct for AB 2863 specifically, but a real GC monitor would also want
  general state consumer-protection/UDAP auto-renewal statutes for WA, IL
  and TX in scope; none are modeled here. Worth flagging as a corpus-breadth
  gap rather than a scenario defect.
- ~~CA "membership-terms" files' content/manifest-tag mismatch.~~ **Resolved
  2026-09-29** per `CHANGES-2026-09-29.md` §A4: the SMS-consent pages were
  replaced with a genuine June 2024 / August 2026 auto-renewal pair at the
  same paths, so the manifest's `auto_renewal`/`consumer` roles now match the
  text. See `D-TR20-S4-03/07/08` and `D-S0-05`.
- ~~§10 "Duty Not to Compete" (nadia-castellano) is genuinely ambiguous.~~
  **Resolved 2026-09-29** by `legal-questions.md` Q2, which reads the whole
  document clause by clause: §10 is a decoy (in-term restraint, outside
  §16600 per *Techno Lite*), and the real §16600 problem is §12 (post-
  employment employee non-solicit, likely void per *AMN Healthcare*). This
  is what moved D-TR90-S1b-01 (now referencing TR-14, see §3 above) from
  "gate proceeds, stack-level uncertain" to "gate proceeds, stack-level
  affected/material." §13 (trade-secret-limited customer non-solicit) is
  also a decoy, confirmed enforceable under the recognized carve-out.
- **No WY presence anywhere in the corpus** (documents or profile) beyond the
  trigger text itself, so D-S1B-08 (add WY to states_of_operation) can only
  be exercised at the company-gate level — there is no WY-jurisdiction
  employment document to hand a subagent even if the gate proceeds. A full
  metamorphic run of that pair would need at least one planted WY employment
  document to have somewhere to land.
- ~~TR-90's own framing ("should produce no action") is stated as fact in
  `meta.yaml`, and this is now confirmed inaccurate for one of the four
  items.~~ **Fixed 2026-09-29** (Round 2), per `CHANGES-2026-09-29.md` §E:
  CA SB 699 and CA AB 1076 have been moved into their own group,
  `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/`, whose `meta.yaml` now
  states a positive `expected_relevance` naming Castellano §12 and the CA
  technician template §6.1/6 instances directly (SB 699: affected; AB 1076:
  needs review for the 5 pre-deadline instances). `TR-90-controls`'s own
  `meta.yaml` now correctly names only WY SF 107 and TX SB 1318 and keeps
  its "should produce no action" framing, which is now accurate for both
  remaining items. No corpus action remains outstanding.
- **No amended/re-signed employment or acquisition document tied to the
  counterparty edits.** `CHANGES-2026-09-29.md` §A3 removed Riverside,
  Clearpath, and FleetCard (no documents existed for them, so no scenario
  was lost) and added Northbrook Commons and residential customers as named
  counterparties. Northbrook Commons is a commercial IL customer relevant to
  the Sunpoint MFN chain (Package C/B's scope, not this package's consumer
  triggers); residential customers (`CUS-RES`) is the counterparty already
  implicit in every `customers/residential-terms/*` document this file
  scores. Neither addition required new TR-20/TR-21 scenarios beyond
  `D-S1B-09`.

## Revision 2026-09-29

Applied `CHANGES-2026-09-29.md` and `legal-questions.md` Q2. No scenario IDs were removed.

- **Replaced — D-TR20-S4-03:** the two CA "membership-terms" files no longer
  contain SMS/TCPA-only text; both now hold a real June 2024 / August 2026
  auto-renewal pair (`CA_RENEW_2024` / `CA_RENEW_2026`). Rewrote the scenario
  around the actual §7 (2024) and §4 (2026) automatic-renewal clauses instead
  of the old SMS-consent decoy.
- **Added — D-TR20-S4-07:** version-resolution (V5) scenario for the same
  pair — must cite the active August 2026 text, not the superseded June 2024
  text.
- **Added — D-TR20-S4-08:** two-silo decoy noting the standalone membership
  terms ($21.95/month, compliant) and the residential installation
  agreement's bundled §6 Comfort Club clause ($19.95/month, still exposed
  per D-TR20-S4-01) are separate documents that must not be merged into one
  compliance conclusion.
- **Added — D-S0-05:** the CA membership-terms pair as a document-side stage-0
  substantive diff, contrasting with this file's trigger-version S0 pairs.
- **Changed — D-TR90-S1b-01:** CA SB 699 reclassified from "not a clean
  control" to a **positive trigger** — Castellano §12 (post-employment
  employee non-solicit) is the real, material finding; §10 is confirmed a
  decoy. Resolves the prior open VERIFY on §10's reach.
- **Changed — D-TR90-S1b-02:** CA AB 1076 stays a control, restated on its
  own ground (notice deadline predates the one CA agreement with an exposed
  clause) rather than inheriting the old SB 699 ambiguity; flags that AB 1076
  and SB 699 must not be merged into one "CA noncompete control" outcome.
- **Changed — D-TR90-S3-01:** scope trace updated to name the specific
  document/clause (§12) carrying SB 699's real finding, rather than a
  generic CA-tagged-noncompete-docs set.
- **Changed — D-S1B-06:** updated to reflect that Riverside, Clearpath, and
  FleetCard are already removed from the live profile; the scenario now
  operates on the current five-entry `counterparties.other` list.
- **Added — D-S1B-09:** new profile-pair scenario testing whether the
  TR-20/TR-21 gate keys on `revenue_mix` (as D-S1B-07 assumes) or on the
  newly added `CUS-RES` counterparty entry — an implementation-fidelity
  check enabled by the §A3 counterparty edits.
- **Gaps:** resolved the CA membership-terms tag-mismatch gap and the §10
  ambiguity gap (both superseded by the corpus/legal-question changes);
  updated the TR-90 `meta.yaml` framing recommendation to name SB 699
  specifically; added a note on the counterparty-edit fallout (Northbrook
  Commons and residential customers) and why neither needed further new
  scenarios beyond D-S1B-09.

**Round 2 (2026-09-29): applied `README.md` §5(b) and `legal-questions.md` Q7 —
the TR-14/TR-90 rework.**

- **Reworked — Section 3:** renamed from "TR-90 — controls (CA SB 699, CA
  AB 1076, WY SF 107, TX SB 1318)" to "TR-14 — CA SB 699/AB 1076 (positive)
  and TR-90 — controls (WY SF 107, TX SB 1318)," reflecting the corpus split
  in `CHANGES-2026-09-29.md` §E: SB 699 and AB 1076 moved to a new trigger
  group, `corpus/triggers/TR-14-ca-noncompete-sb699-ab1076/`; `TR-90-controls`
  now holds only WY SF 107 and TX SB 1318.
- **Changed — D-TR90-S1b-01, D-TR90-S1b-02, D-TR90-S3-01:** kept their
  legacy scenario IDs (per the ID-stability rule) but updated every trigger
  path/heading to reference TR-14 instead of TR-90 for the SB 699/AB 1076
  content. D-TR90-S1b-02's finding is now scoped explicitly as
  Castellano-document-specific, not a company-wide "AB 1076 is a clean
  control" claim. D-TR90-S3-01's scope trace now spans both groups (TR-14
  for SB 699/AB 1076, TR-90 for WY SF 107/TX SB 1318) and adds the CA
  technician template stack to SB 699's in-scope set.
- **Changed — D-TR90-S1b-03, D-TR90-S1b-04:** trigger paths corrected to
  the explicit `TR-90-controls/` directory (unchanged substance — these stay
  clean controls under TR-90).
- **New finding — AB 1076 is not a clean control.** The CA technician
  template (`form_technician-employment-agreement_california_rev-2017.md`)
  and all 6 signed CA instances contain §6.1, a one-year post-employment
  employee non-solicit (the same clause type as Castellano §12); §6.2 is a
  trade-secret-limited customer non-solicit and remains a decoy.
- **Added — D-TR14-S4-01:** new S4 scenario — SB 699, template §6.1 + all 6
  signed instances — affected; the 2024-04-07 Sabrina Marchetti instance
  (entered after 2024-01-01) is the clearest hit.
- **Added — D-TR14-S4-02:** new S4 scenario — AB 1076, the 5 instances
  signed before the 2024-02-14 notice deadline (2017-12-10, 2019-02-09,
  2020-06-15, 2021-08-28, 2023-01-04) — needs review (unsettled non-solicit
  scope; no notice document in the corpus; employment status after
  2022-01-01 unknown). "Not affected" fails; a confident violation
  over-claims.
- **Added — D-TR14-S4-03:** new S4 scenario — §6.2 — decoy (trade-secret-
  limited, §16600-compliant on its face).
- **Changed — D-S1B-03:** relabeled the SB 699/AB 1076 reference from
  "TR-90" to "TR-14"; noted that this profile pair now also tests
  suppression of a genuine finding, not only a control-gate flip, since SB
  699 is no longer clean.
- **Changed — top-of-file scope line:** updated to list TR-14 (positive)
  separately from TR-90 (controls, now WY SF 107/TX SB 1318 only).
- **Gaps:** marked the "TR-90's own framing … stated as fact in `meta.yaml`"
  gap resolved — both `TR-14-ca-noncompete-sb699-ab1076/meta.yaml` and
  `TR-90-controls/meta.yaml` now correctly state `expected_relevance` for
  their own (now-split) groups; no corpus action remains outstanding.

STATUS: complete
