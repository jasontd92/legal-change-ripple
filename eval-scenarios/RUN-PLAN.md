# Run plan

**Decided 2026-09-30.** This is the spend order for the focused gold in
`answer-keys/`. It replaces the sequence, repeat counts, and dollar figures
in `eval-design.md` §13. Stage definitions, levers, and invariants there
still hold. Sentinel ids are in `HANDOFF.md` §4. Which of those ids are
actually gold is in `answer-keys/PROGRESS.md`. The score table is `SCORES.md`.

Prices below are the gateway and API list rates recorded in `configs/`.
Costs are measured from the two GLM-5.3-Flash corpus runs on 2026-09-30
(`runs/TR-01-copper-section-232-1790748586041`, `runs/smoke-t5`), not from
the §13 estimates.

## What a repeat count means

A model call is one draw. k=1 shows that the harness and the scorer ran.
It does not show that a stage is reliable, and a single fail may not
reproduce.

k=3 is the smallest count that supports a decision:

- The same item fails the same way three times. That is a failure worth one change.
- One fail and two passes. That is variance. Leave the prompt alone.
- Three passes. It is not a consistent miss. That is not a rate.

k=5 is for the open-weight model that won a slice, after a change, to show
the result held. Luna stays at k=3 because the ChatGPT subscription is
rate-limited. Sonnet is one pass, and only if Luna also scores low on that
slice.

## Measured cost

| | GLM-5.3-Flash | DeepSeek V4.1 Flash | Luna (API list) | Sonnet 5 |
|---|---|---|---|---|
| Input / cache read / output, per 1M | $0.15 / $0.03 / $0.50 | $0.15 / $0.003 / $0.60 | $0.20 / $0.02 / $1.20 | $2 / $0.20 / $10 |
| One full corpus run, TR-01 token mix | ~$0.92 | ~$0.92 | ~$1.56 | ~$14 |

A Luna run through the ChatGPT subscription is about $0 marginal. The meter
still prints the API list. Jev has no public rate, so classifier calls stay
unpriced.

Stage 4 was about 93% of input tokens and about 13 of the 18 minutes. One
stack is about $0.02 on GLM. The gold slice below is about a dozen stacks,
so one pass is about $0.25 and k=3 is about $0.75. Stages 1, 3, and 5 are
one orchestrator call each. All of them, on the gold triggers, at k=3, stay
under $0.50.

Start on `configs/o1-glm.json` for the reading models. From step 5 the live labeler is `configs/j-jev.json`: GLM still reads and writes the finding, then Jev replaces the categorical labels. `o1-glm.json` stays the self-label arm. DeepSeek V4.1 Flash costs the same per full
run and is the comparison rung, not a cheaper start. Older DeepSeek V4 Flash
is cheaper on the price page and is aimed at short classification, so a miss
there would not say whether this pipeline or this eval is wrong.

## Rules

1. One lever per run. A prompt change, a model swap, and a tool change are
   three runs.
2. Teacher-forced until this slice is stable. `harness stage` with `--inject`
   feeds the gold change record or the gold findings. A miss then belongs to
   the stage under test.
3. `only_stacks` in the config caps fan-out. Omit it and every in-scope stack
   runs. The model's own scope decision is kept in the reason for stacks the
   slice drops.
4. Hill-climb the analyst prompt on its own. The orchestrator sends that
   prompt alone unless a custom instruction applies to one stack.
5. Re-run the items that failed at least twice, at the same k, then one pass
   over the whole slice to see what the change broke.
6. A full-corpus end-to-end run is the number you keep, on the gold version
   ids, after the slice has a before and after. The two runs already done
   were a wiring check. Their triggers were EO 14220 and SB 699 alone, not
   the gold inputs.
7. Every prompt change is pasted in full in the log for that step: the
   exact sentences inserted or deleted, in place, not a summary. Wording is
   drafted from dev misses only. Holdout findings are not read while
   drafting, and are scored only after a change is kept. Without that split
   it is easy to write the gold answer into the prompt. The stage-4 map
   already mixed the two: S4-GPC-02 and B11 are holdout and were scored on
   the same draws as the dev items.

## The slice

Use the focused gold only. Stacks that carry more than one finding are run
once per pass. The other findings on that stack are scored from the same
output.

| Stage | Gold | What a miss means |
|---|---|---|
| 0 | `unit/D-S0-05.yaml` | Code. Cosmetic pairs must exit. The substantive membership pair must survive. |
| 1a | T1, T3a/T3b, T5, C1 | Substantive item found, distractor dismissed, legal status exact. T5 keeps SB 699 and AB 1076 apart. |
| 1b | T1 and T3 proceed; C2 two exits; `unit/D-S1B-01.yaml` | False exit is the failure. Uncertain counts as proceed. |
| 3 | T1 include list and the pruned lease and insurance policies; C1 empty, including the Great Plains keyword trap; T5 include list | A gold stack left out is a miss. A pruned stack left in is the cost lever. |
| 4 | Great Plains hop and the Metals Adjustment decoy; Valley open clock; Cascade clock already run; Bridgewell absence; Sunpoint expired-but-surviving; Keystone 2019 pin (`unit/S4-KPS-03.yaml`); California technician template and Marchetti; Ellison abstain; utility-tariff decoy | Hop-incomplete is a miss. A decoy cited as the hit is a miss. A settled answer where gold says abstain is a miss. |
| Labels | The same stage-4 findings | Dangerous swaps, counted apart: material called not material, a live forfeitable clock called anything else. |
| 5 | T1 tiers; T3a against T3b, same findings, tiers move; Sunpoint–Northbrook link; the credit agreement absent on T3, T5, C1, and C2 | R1–R3. Gold tiers are the ones in the answer keys, not the output of the sort. |

Items in `HANDOFF.md` §4 that are not in `PROGRESS.md` are not on this slice.
That includes the Hai Phong hop, the Illinois band, and the Northaire pin.

## Order

Each step names the lever it is allowed to change. The next step waits until
this one has a k=3 reading.

1. **Score what already exists. $0.** Invariants on the two run directories:
   schema, surfaced quotes, conservation, change-item closure, scope
   completeness. Known from those runs, before any new call: scope kept 63
   and 44 stacks against gold lists of about a dozen and four; analysts
   spent 103 calls re-reading the trigger; `commit_finding` failed on bad
   `change_ref` values and citations outside the stack. The trigger-file fix
   is in the harness. Confirm it with one stack that made those calls, at
   k=3, not with another corpus run.
   Log 2026-09-30: V1/V2/V8/V10/V11 pass on both corpus runs (TR-01 63 in-scope, 146 findings conserved, 5/5 closed, 0 quote misses; T5 44, 107, 7/7, 0; scope complete on 131 stacks). Great Plains k=3 on the injected EO 14220 record, $0.10: trigger reads 0/3 (was 3), final commit_finding ok 3/3. First-commit change_ref mash (`C1+C2+C3 / SUP-GPC-01`) 1/3 and recovered on the allowed retry; verbatim-quote miss 1/3; 16-call budget exhausted 2/3, needs_review 2/3. No prompt or budget change kept — the repeated miss this step targeted is gone, and the budget hit waits for the stage-4 map.

2. **Stage 4, GLM, teacher-forced, k=3. About $0.75.** Inject the gold change
   record. `only_stacks` is the table above. This is the map: a hop miss, a
   decoy hit, and a wrong clock are three different next changes.
   Log 2026-09-30: eight stacks × k=3, gold change records, $0.41. Lease utility decoy not_affected 3/3. Keystone 2019 pin hop-complete 3/3 (T1 record injected; the unit has no trigger). Cascade spans complete 3/3 but the waived REA was still a live clock (undeterminable / clock_pending / forfeitable_clock_running). Bridgewell absence 2/3. Great Plains reads PO-2026-0204 and never quotes the HTS line, 0/3; invoice 0877 cited 1/3; Exhibit B not used as the surcharge. Valley quotes fixed price and sometimes the renewal, deadline 2026-11-01 on 1/3 (else 2026-12-02 or blank), never all four spans. Sunpoint quotes the MFN sentence and stays affected 3/3, misses the survival clause; Northbrook is the stage-5 link, not in this reading set. Template §6.1 cited 2/3; Marchetti's dates not quoted 0/3; Ellison settled as a violation rather than abstain on 2/3. §6.2 not cited as the hit.

3. **One analyst-prompt change.** Only if step 2 has an item at 2/3 or 3/3
   on the same failure. Re-run those items at k=3, then the whole stage-4
   slice once at k=3.
   Log 2026-09-30: one sentence inserted into the analyst hop paragraph, after "The hop chain cites the clause that names the target." and before "Version pins are binding": `Do not stop at the operative clause. If this family also has the purchase order, invoice, notice, or signed copy that identifies the goods, the person, the date, or the charge, quote that line in the hop chain too.` Nothing else in the prompt changed. Re-ran Great Plains, Valley, Sunpoint, and the California template at k=3, $0.17. PO line still 0/3, Valley date still 1/3, survival clause and Marchetti dates unchanged. Reverted, so the live paragraph is again: `When the change can bear on the stack, follow hops inside the family (parent and cluster members) and follow each incorporates row one hop to that target. Do not open the target's other documents. Do not open a second family. The hop chain cites the clause that names the target. Version pins are binding: "as published October 2019" is that version, not the current page.` No whole-slice rerun. The sentence was drafted after reading the whole slice, including holdout items S4-GPC-02 and B11.

4. **Stage 1 and stage 3, GLM, k=3.** Gold triggers: Proclamation 11021, the
   T3 pair, T5 with both California instruments, TR-03, TR-90. Stage 0 is the
   unit test on `D-S0-05` and costs nothing. Tighten the scope prompt only
   if a gold stack was dropped or a pruned stack was kept for a bad reason.
   Default-in stays until a real miss says otherwise.
   Log 2026-09-30: stage 0, then stage 1 and stage 3 at k=3, $0.21. Membership cosmetic pair did not exit (only `a)`/`b)`/`c)` renumbered to `1.`/`2.`/`3.`); the substantive pair survived and the Wyoming cosmetic pair exited. Kept a fold of line-leading `a)` and `1.` markers inside `cosmetic()` before the whitespace collapse. Retest: cosmetic exits, substantive survives, unit tests pass. Stage 1: T1 proceed and the full-customs-value quote `in_force` 3/3. T3a `enacted_future_effective` on 2/3 commits (k3 no locatable quote); T3b `in_force` on 2/3 (k1 no quote); both proceed. SB 699 quotes C1 and C2 `in_force` 3/3 and not C3; AB 1076 quotes C3 `in_force` 3/3 and not the SB sentences. Wyoming exit 3/3. Texas exit 3/3, reason names physicians. TR-03 committed 0/3: every draw cited `preliminary_results` instead of `preliminary-results`, so legal status was never scored. Drop-WA committed 0/3 on non-verbatim quotes, so the gate was not measured. Stage 3: no gold harness stack dropped (purchase orders, invoices, the Harborview notice, Whitcombe, Marchetti, and Ellison are not stack ids). T1 lease kept on purpose 1/3; insurance policies out. TR-03 scope is the miss: Great Plains explicit keep 3/3 for a copper-product match, Hai Phong explicit keep 3/3, about 63 stacks still in. One sentence inserted after "An exclusion with an empty reason will be put back in scope." and before "If the instructions clearly name a family to ignore": `When the change is limited to one origin, profession, or jurisdiction, a matching product word, an import role, or a tariff clause is not enough: exclude the stack unless it shows that origin, profession, or jurisdiction, and say what is missing.` Re-ran T1, T3a, T5, and TR-03 scope at k=3, $0.11. Great Plains still in 3/3. Hai Phong in 1/3. T1 gold stacks still in. T3a in-scope fell to 21 and T5 to 11–13 with no gold drop. Reverted. The live paragraph is again: `Call commit_scope. List stacks you exclude, with the reason, and stacks you include for a specific reason. Omit a stack to leave it in scope ("Default in"). An exclusion with an empty reason will be put back in scope. If the instructions clearly name a family to ignore, exclude it and quote the instruction. Add instruction_extras only for stacks whose analyst needs a slice of those instructions.`

5. **Labels on the step-2 evidence.** No new reading pass. If the spans were
   right and the labels were wrong, the next run is Jev: same findings,
   `configs/j-jev.json`, those items only. Sweep the abstention threshold
   only if a dangerous swap remains. If the spans were wrong, stay on the
   analyst prompt.
   Log 2026-09-30: Jev on the three frozen Cascade `deadline_bound_right` findings, 30 draws each, no analyst pass. Model `jev-1.13.0`, 289k input / 34k output, unpriced. Gold urgency is `no_clock`. k1 stayed `undeterminable` 30/30 (mean 0.97). k2 stayed `clock_pending` 30/30 (mean 0.97). k3 moved off `forfeitable_clock_running` to `undeterminable` 30/30 (mean 0.96). `no_clock` probability was 0 on all 90, so the 0.45 abstention threshold cannot select it and was not swept. Materiality was `undeterminable` 90/90, direction `both` 90/90, finding type `deadline_bound_right` 90/90, response `monitor` 90/90. No threshold or prompt change kept. Same three texts, GLM categorizer only, k=30, $0.04, existing label hidden: k1 `undeterminable` 21 / `clock_pending` 8 / `forfeitable_clock_running` 1; k2 `clock_pending` 29 / `undeterminable` 1; k3 `clock_pending` 22 / `undeterminable` 7 / `forfeitable_clock_running` 1. `no_clock` on 0/90. k3's original `forfeitable_clock_running` is not a stable read of that writeup: the text says the 21-day clock starts on a supplier notice that is still an open question, and `deadline_date` is null. Kept Jev as the labeler (`configs/j-jev.json`). The 0.45 abstention threshold stays. Self-label stays available on `o1-glm.json` and is not the live labeler.

6. **Stage 5 on injected gold findings, ranking approach A, k=3.** T1 once
   and the T3 pair once per repeat. Approach A is the deterministic sort.
   B (the model ranks freely) and C (reorder only inside ties) run only if
   A fails R1–R3. The summary-plus-`fetch_stack` handoff is the tool change
   if the Sunpoint–Northbrook link is what fails.
   Log 2026-09-30: injected gold findings, approach A (deterministic sort), GLM orchestrator, k=3, $0.05. T1, T3a, and T3b: R1, R2 (margin +2), and R3 pass 3/3. T3a stays `clock_pending` on F1–F3; T3b is `obligation_clock_running` on the same three. Credit agreement is on the T1 report and absent on both T3 dates. Sunpoint–Northbrook link found 2/3 (missing on k3). One redispatch on T1 k2; the order did not change. B and C not run. No handoff change: the missed link is 1/3.

7. **The same stage-4 slice on DeepSeek V4.1 Flash, k=3.** Same gold inputs.
   A mixed config, one model for the orchestrator and another for the stacks,
   is justified only if the two roles fail differently.
   Log 2026-09-30: DeepSeek V4.1 Flash, both roles, self-label, same eight stacks and gold change records, k=3, $0.33. One Cascade call aborted and was retried. Lease not_affected 3/3. Keystone pin hop-complete 3/3. Great Plains still misses the PO line 3/3; Amendment 2's tariff clause quoted 2/3. Valley deadline 2026-11-01 on 1/3. Sunpoint stays affected; the MFN sentence is quoted on 2/3 and the survival clause is not. Bridgewell records an absence 3/3 and does not quote the change-order sentence. Cascade spans complete 1/3 and a false not_affected 2/3. The California template is not_affected 3/3, on the ground that the stack has no noncompete. GLM remains the reader. No mixed-role config and no prompt change.

8. **Hold the winner.** k=5 on the open-weight model that won, slice only.
   Then Luna at k=3 on that slice (subscription, marginal cost about zero).
   Then Sonnet, one pass, only if Luna also scores low.
   Log 2026-09-30: GLM self-label, same eight stacks and gold change records, two more draws (k4, k5) on top of step 2, $0.19. Together with step 2 this is k=5. Lease not_affected 5/5. Keystone pin hop-complete 4/5 (k5 misses the PO file). Great Plains HTS line 0/5; on k4 the PO file is opened and the quoted line is "Pricing per Exhibit A; Metals Adjustment per Exhibit B," not the HTS row. Invoice 0877's gold span 2/5. Valley deadline 2026-11-01 on 2/5 (else 2026-12-02, 2026-12-01, or blank). Cascade spans 5/5; a no_clock finding dated 2025-04-02 appears on 2/5, and a live-clock finding is still present. Bridgewell absence 4/5. Sunpoint survival clause and the Northbrook file 0/5. California template form cited 3/5; Marchetti dates and Ellison spans 0/5; determination stays affected 5/5. Luna k=5 did not run: eve reports the ChatGPT subscription is not signed in, and there is no local Codex or eve session. Sonnet not run. No prompt change.

9. **Cheap metamorphics, reusing artifacts.** The T3 date pair (the same
   findings move together). The Washington profile swap (the gate flips).
   One clause deletion on a single stack (the finding flips). Corpus scale
   and file rename stay off this list.
   Log 2026-09-30: $0.05, no prompt change. T3 date pair reused from step 6 ($0): the same three findings are clock_pending on 2026-10-01 and obligation_clock_running on 2027-07-01. Washington profile swap, stage 1, k=3, drop-wa profile: k1 no locatable quote; k2 and k3 both proceed. Both reasons name the WA facts that profile still contains (ACQ-02 Northgate, ACQ-05 Pinecrest, the Washington DES customer, Cascade Ridge). Gold gate is exit. Valley clause deletion, corpus copy, the sixty-day non-renewal sentence removed, stage 4, k=3: 2026-11-01 is absent 3/3. forfeitable_clock_running is still emitted 3/3, with a null date on k1 and k2 and 2026-12-02 on k3, taken from the thirty-day fee-amendment sentence.

## Next

Steps 10–19 run with no approval gate. Trigger, run, investigate, log, and
continue. Jason rejoins for the final report of what stayed. Each step gets
one to three improvement experiments against the measured eval. Keep a change
when it wins on that eval and does not regress the controls. The date tool
(step 14) stays on evidence of no regression, even if its net win is smaller
than the bar for the other changes. Improvements stay generalized and
principle-based. A change that only restates a gold answer is reverted.

Ranked by hypothesized impact per dollar, from the k=5 reader comparison and
the step 9 metamorphics. One lever per run. Do not write a gold answer into a
prompt. Sonnet stays behind Luna.

10. **Enforce the clock rubric in code.** `forfeitable_clock_running` and
    `obligation_clock_running` require a `deadline_date`; a missing date
    becomes `undeterminable`. Score the findings already on disk (Cascade k3,
    Valley k2, the three Valley deletion draws). A dated clock stays as it is.
    No new model spend. This does not invent the right date.
    Log 2026-09-30: kept. `requireRunningClockDate` downgrades `forfeitable_clock_running` and `obligation_clock_running` when `deadline_date` is missing or not YYYY-MM-DD. Applied at finding commit, after Jev, and on a stage-5 relabel. On the frozen findings: Cascade k3 F1, Valley k2, and Valley-deletion k1 and k2 move to `undeterminable`. Valley k3 and k4 stay `forfeitable_clock_running` on 2026-11-01. Deletion k3 stays on 2026-12-02. `no_clock` is unchanged. Unit tests 36 pass. $0.

11. **Bind the Great Plains quote to the duty change.** The PO file is opened
    and the quoted line is the Exhibit B terms sentence, on GLM 5/5 and
    DeepSeek 3/3. One structural check: the clause quote has to be about the
    changed term in the change record. Draft it as "the cited line is a
    pre-existing price mechanism." Leave Exhibit B and the HTS code out of the
    prompt. GLM, self-label, k=5, Great Plains plus Keystone (the pin hop has
    to stay complete).
    Log 2026-09-30: both sentences reverted. $0.33. Experiment 1 added "The clause quote has to be the term this change bears on. A neighboring term the change does not alter is its own finding or a decoy, not the clause quote for this change." HTS line stayed 0/5. Lease stayed not_affected 5/5. Keystone pin hop fell from 4/5 to 1/5. Experiment 2 replaced it with "If the operative fact sits in a schedule, table, or line item, the clause quote is that row. A sentence that only points at another exhibit is not a substitute for the row." HTS line stayed 0/5. Lease 5/5. Keystone pin hop 4/5, matching the k=5 baseline. No third sentence: neither moved the target, and the broader one regressed the control. Analyst prompt restored.

12. **Citation filename equivalence, then one verbatim retry.** Fold hyphen
    and underscore on a unique basename. On a quote miss, return the real path
    and ask once for a verbatim substring. Re-run the known stage-1 failures:
    TR-03 (`preliminary_results` vs `preliminary-results`, 0/3 on `proposed`)
    and the Washington gate draw that threw. Do not loosen the verbatim rule.
    Log 2026-09-30: kept the basename fold. A hyphen and an underscore are the same character, and a request resolves only when exactly one allowed file's basename equals it or ends with it. A quote miss now names that file and asks for a shorter substring; the existing one retry is unchanged. TR-03 stage 1, k=3: change records landed 3/3 on `2026-09-21_preliminary-results.txt` (was 0/3). `proposed` is on the preliminary-determination item in k1 and k2; k3 labels those items `in_force`. Washington gate, same confounded profile, k=3: records 2/3, both proceed, k1 still no locatable quote. Verbatim matching was not loosened.

13. **Rebuild the Washington profile, then remeasure the gate.** Gold exit
    assumes WA is gone from states, subsidiaries, and branches TAC and SPO.
    The file used in step 9 still lists ACQ-02, ACQ-05, the Washington DES
    customer, and Cascade Ridge, and both commits cited those and proceeded.
    Remove those facts, change no prompt, stage 1, k=5. Exit means the step 9
    miss was the fixture. Proceed means the gate prompt is the lever.
    Log 2026-09-30: the miss was the fixture. No prompt change. The cleaned profile drops ACQ-02, ACQ-05, the Washington DES customer, Cascade Ridge, and the ACQ-05 franchise note. Stage 1, k=5: k1 and k3 no locatable quote; k2, k4, and k5 exit. Each reason says the profile shows CA, IL, and TX only. $0.04 on the three commits.

14. **A date tool, with the deletion corpus as the negative control.** Valley's
    2026-11-01 lands 2/5. After the sixty-day sentence was removed, k3 computed
    2026-12-02 from the thirty-day fee-amendment sentence. The tool takes
    as-of, a term end, and a number of days. Score Valley at k=5 against
    2026-11-01, and score the deleted-clause corpus, where 2026-11-01 is a
    failure. Keep the day count out of the prompt.
    Log 2026-09-30: kept. `date_shift` adds or subtracts whole calendar days in UTC. The analyst prompt says to call it for a day-count deadline and to use the date it returns. Valley k=5: 2026-11-01 on 3/5 (was 2/5) and the four gold spans on 5/5. The other two draws are 2026-12-02, and `date_shift` was called on those too, so the miss is which day-count the model hands the tool. Deletion corpus, k=3: 2026-11-01 absent 3/3; each draw is 2026-12-02 from the thirty-day sentence that remains. Lease not_affected 3/3. Keystone pin hop 3/3; k2 is not_affected and did not call the tool. $0.08.

15. **Fix the sort key on the saved stage-5 reports.** A past date sorts ahead
    of a tier-1 item with no date, so T1 F6 (tier 2, deadline 2025-04-02) sits
    above F2 (tier 1, no date). Treat a null deadline as unknown, alongside
    `undeterminable`. Rescore `runs/step6`. No model call. R1–R3 already pass;
    this is the secondary order.
    Log 2026-09-30: kept. A missing date sorts after a future date and before a date already past, inside the same urgency band. Rescored the nine saved reports. T1 k1–k3 move from F1 F3 F6 F2 … to F1 F3 F2 F5 F8 F7 F4 F6 F9. F2 is above F6 on 3/3. R1 still passes. T3a and T3b order unchanged. F8 stays above F7 and F4; they share urgency, materiality, and no date, so stable order still decides that tie. $0.

16. **Luna at k=5 on the stage-4 slice, then Sonnet only if Luna is also low.**
    Same eight stacks, same gold change records, `configs/r1-luna.json`,
    classifier self. Codex is signed in with ChatGPT. If Luna also quotes the
    Exhibit B terms line instead of the HTS row, stop swapping readers.
    Sonnet (`configs/s-sonnet.json`) is one pass of the eight stacks, and only
    then.
    Smoke 2026-09-30: `chatgpt("gpt-5.6-luna")` reaches `api.openai.com`.
    `streamText` returned `pong`. `generateText` returns 400 `Stream must be
    set to true`. `runAgent` now uses `streamText` for the chatgpt provider
    and `generateText` for every other provider.
    Log 2026-09-30: Luna k=5, self-label, same eight stacks, list price $0.52. The first wave lost 26 calls to a Node stream error after the Codex session crowded; those stacks were retried one at a time and completed. HTS line 0/5, and Great Plains is needs_review on 5/5. Valley 2026-11-01 on 1/5. Lease not_affected on 2/5 and affected on 3/5. Keystone pin hop 5/5. Cascade spans complete 1/5. Bridgewell absence 5/5. Sunpoint survival clause and Northbrook file still missed. California template still misses Marchetti and Ellison. Luna is low on the same headline misses, and worse on the lease. GLM stays the reader. Sonnet one pass did not score: there is no Anthropic API key, and claude-sonnet-5 is sent to the Anthropic SDK. The eight runs finished in the same millisecond with zero tokens and an empty partial finding.

17. **Jev on the Cascade findings that already describe the closed window.**
    The k=30 study classified the future-notice text. k4 and k5 each contain a
    `no_clock` finding dated 2025-04-02, the $61,380 request. Classify those
    frozen texts, 30 draws, no analyst pass. `no_clock` means the labeler is
    doing this job and the remaining miss is the extra live-clock finding.
    Log 2026-09-30: no rubric change. Those two findings, 30 draws each. Jev says `forfeitable_clock_running` 60/60. The labeler is consistent and does not call the closed window `no_clock`. A help-text change that mapped every past date to `no_clock` would also relabel a missed deadline, so it was not made.

18. **k=10 on four stacks, plus two new cases, before the next prompt
    sentence.** k=5 moved Keystone to 4/5, Valley's correct date to 2/5, and
    Cascade's closed-window finding to 2/5. k=10 on Great Plains, Valley, the
    California template, and Cascade only. Add one more duty-versus-price-index
    contract and one more notice-period date, so a later prompt change has a
    second item to fail on. A second employment agreement belongs in that set
    before anyone writes a sentence about Marchetti.
    Log 2026-09-30: five more GLM draws (k6–k10) on Great Plains, Valley, Cascade, and the California template, on the kept date tool. $0.27. One California draw hit a stream error and was retried. Great Plains HTS line still missed 5/5, and k6 quotes the Exhibit B decoy. Valley 2026-11-01 on 4/5. Cascade spans 5/5; a 2025-04-02 date is forfeitable on 3/5 and no_clock on 1/5. Marchetti dates and Ellison spans still missed; the template file is cited. No second duty-versus-index contract and no second notice-period contract were added: a case written from those two misses would be the gold the next prompt is graded against.

19. **The cross-stack hop, after the in-stack one.** Sunpoint's survival
    clause and the Northbrook file are 0/5 at stage 4; the stage-5 link was
    2/3. Run this after the duty-binding check. The lever is "open the document
    named by the clause you already quoted," on Sunpoint, with the lease still
    required to stay out. Do not name the counterparty in the prompt.
    Log 2026-09-30: reverted. One sentence, on the current analyst prompt: open a named document when it is in this family's reading set; otherwise record_cross_reference and do not guess its terms. GLM, Sunpoint and the lease, k=3, $0.05. Sunpoint still hop 1/3, missing a contract span and the Northbrook file, and cross_references 0/3. Lease not_affected 3/3. No second wording.

## Later

Full-corpus end-to-end, k=3, on the gold version ids, is the baseline you
keep. It is not the next run. Also later: gold that is not written yet, and
any second lever on a run that has not yet shown what the first lever did.
