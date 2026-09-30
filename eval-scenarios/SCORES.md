# Scores

**2026-09-30.** One precision and one recall for the first measurement, and one
precision and one recall for the latest. GLM self-label. A case measured once
is in Current. Original is only the cases that were measured again later.

A trial is one gold finding, or one gold gate or scope decision. Precision is
true positives / (true positives + false positives). Recall is true positives /
(true positives + false negatives).

A positive trial is a gold finding whose pass rule is anything but
`not_affected`, or a gate or scope decision the gold says should happen.
`not_affected` marked `affected` or `needs_review` is a false positive.
`not_affected` cleared, or scoped out, is a true negative and is in neither
rate.

Pass rules are the answer keys. `affected` needs that determination, every
required span, and no decoy. `affected_or_needs_review` allows
`needs_review`. `abstain_only` needs `needs_review` or an undeterminable
label.

The headline pools those trials. Injected ranking is not in the pool: the
findings were supplied.

| | Precision | Recall | Cost |
|---|---|---|---|
| Original | 69% (11/16) | 37% (11/30) | $0.41 |
| Current | 76% (56/74) | 48% (56/116) | $5.82 |


## What is in the cells

| Case | Original precision | Original recall | Current precision | Current recall | Cost |
|---|---|---|---|---|---|
| Stage 4 slice, items run again after the date tool (Valley, Great Plains, Cascade, lease) | 100% (7/7) | 35% (7/20) | 100% (9/9) | 45% (9/20) | $0.28 then $0.20 |
| Keystone pin | 100% (4/4) | 80% (4/5) | 100% (2/2) | 67% (2/3) | $0.04 then $0.01 |
| California template, teacher-forced | 0% (0/5) | 0% (0/5) | 0% (0/5) | 0% (0/5) | $0.10 then $0.08 |
| Sunpoint and Bridgewell, teacher-forced | n/a | n/a | 100% (4/4) | 40% (4/10) | $0.18 |
| Washington gate, clean profile, gold exit | n/a | n/a | 100% (3/3) | 60% (3/5) | $0.04 |
| Ranking R1–R3, injected findings | n/a | n/a | 100% (9/9) | 100% (9/9) | $0.05 |
| E2E T1 copper, proclamation 11021, k=5 | n/a | n/a | 100% (21/21) | 47% (21/45) | $2.43 |
| E2E T3a, law not yet effective, k=2 | n/a | n/a | 60% (3/5) | 50% (3/6) | $0.76 |
| E2E C1 TR-03, gate and scope, k=5 | n/a | n/a | 33% (5/15) | 50% (5/10) | $1.42 |
| E2E C2 exits, Wyoming k=5, Texas k=4 | n/a | n/a | 100% (8/8) | 89% (8/9) | $0.23 |
| E2E T3b, law in force, k=1 | n/a | n/a | 50% (1/2) | 33% (1/3) | $0.47 |
| E2E T5 California | n/a | n/a | not run | not run | $0 |

Headline original is the three rows that have an original: the remeasured
slice, Keystone, and the California template. Headline current is those three
at their later measurement, plus Sunpoint and Bridgewell, the Washington gate,
T1, T3a, T3b, C1, and C2.

C1 trials, per draw: proceed (held 5/5), empty scope (held 0/5), and each of
the two negative controls left in scope (10 false positives). C2's positive is
exit. The Wyoming miss committed proceed after stating Wyoming is outside the
footprint.

T1's input is proclamation 11021 alone. The gold file also names the aluminum
and critical-minerals distractors. The harness accepts one snapshot or two.
T3b is the one draw that finished, 45 of 45 stacks. Gemma held. The technician
template and the seller noncompete were marked affected and still missed a
required span. The owner covenant, a negative, was marked affected.
