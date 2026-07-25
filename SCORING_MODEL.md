# The Public Confidence Score (PCS) — Mathematical Model v1.0

A composite, weighted, normalized index (0–100) for every Indian public servant.
Explainable, defensible, reproducible. Modeled on credit-rating methodology (FICO / sovereign ratings)
adapted for public accountability.

---

## Master Formula

```
PCS = 100 × ( wI·I + wL·L + wF·F + wD·D + wS·S )
```

Where each sub-index ∈ [0, 1], weights sum to 1.

| Sub-index | Symbol | Weight (Cabinet Minister) | Source |
|-----------|--------|---------------------------|--------|
| Integrity | I | 0.35 | ADR/MyNeta affidavits, eCourts |
| Legislative Performance | L | 0.20 | PRS India, Lok/Rajya Sabha |
| Financial Transparency | F | 0.15 | ADR asset/liability declarations |
| Delivery & Governance | D | 0.20 | CAG, budget utilization, ministry KPIs |
| Public Sentiment | S | 0.10 | Verified citizen reports, news NLP |

Weights differ by role (civil servants weight D higher, legislators weight L higher).

---

## 1. Integrity Index (I) — exponential decay on weighted cases

```
I = exp( −λ · W_cases ) · (1 − C_penalty)

W_cases = Σ (severity_weight_i × count_i)
  severity weights:
    convicted        = 5.0
    serious criminal = 3.0   (IPC 302/376/307/396 — murder, rape, dacoity)
    corruption       = 2.5   (PC Act, disproportionate assets)
    moderate         = 2.0   (153A hate speech, 420 cheating)
    minor            = 1.0   (defamation, unlawful assembly)

λ = 0.20   (decay constant — 1 serious case ≈ I drops to 0.55)
C_penalty = 0.5 if currently convicted, else 0
```

- 0 cases → I = 1.00
- 1 minor case → I = exp(−0.20) = 0.82
- 1 serious criminal → I = exp(−0.60) = 0.55
- 3 serious → I = exp(−1.80) = 0.17

## 2. Legislative Performance (L) — cohort-percentile blend

```
L = 0.35·att_norm + 0.30·q_pct + 0.20·debate_pct + 0.15·bill_pct

att_norm  = clamp(attendance% / 100, 0, 1)
q_pct     = percentile_rank(questions asked, within cohort)
debate_pct= percentile_rank(debates participated, within cohort)
bill_pct  = percentile_rank(private member bills, within cohort)
```

Percentile ranking normalizes against the actual 30-minister cohort so scores are relative and fair.
(Note: Cabinet ministers ask fewer questions by convention — for ministers we floor q_pct at 0.5.)

## 3. Financial Transparency (F) — disclosure quality, not wealth

Wealth is NOT penalized. We measure disclosure integrity + anomaly detection.

```
F = 0.4·disclosure_completeness + 0.35·(1 − anomaly_score) + 0.25·liability_ratio_health

anomaly_score = sigmoid( (asset_CAGR − expected_CAGR) / σ )
  expected_CAGR = 0.12 (12%/yr reasonable growth)
  flags unexplained asset explosions between election cycles

liability_ratio_health = 1 − clamp(liabilities / assets, 0, 1)
disclosure_completeness = fields_declared / fields_required  (from affidavit)
```

## 4. Delivery & Governance (D) — outcome-based

```
D = 0.40·budget_utilization + 0.30·(1 − cag_severity) + 0.30·scheme_delivery

budget_utilization = clamp(actual_spend / allocated, 0, 1)
cag_severity = clamp( Σ(flagged_amount) / ministry_budget , 0, 1)
scheme_delivery = verified_completed / total_flagship_schemes
```

## 5. Public Sentiment (S) — Laplace-smoothed, evidence-weighted

```
S = (pos + α) / (pos + neg + 2α)

pos = verified positive records (evidence-linked only)
neg = verified negative records (evidence-linked only)
α = 2.0  (Laplace smoothing — prevents small-sample extremes)
```

Only evidence-linked, verified records count. Raw social media noise is excluded.

---

## Confidence Level (separate from score)

Every PCS ships with a **Confidence Level** = how much data backs it:

```
Confidence = clamp( Σ data_points_available / data_points_expected , 0, 1 )

Bands:  ≥0.75 High  |  0.45–0.75 Medium  |  <0.45 Low
```

A minister with PCS 82 (High Confidence) ≠ PCS 82 (Low Confidence).
This is the legal shield: we never assert a verdict, only "score X at confidence Y."

---

## Output Bands

| PCS | Band | Meaning |
|-----|------|---------|
| 80–100 | Strong | Clean record, high delivery, transparent |
| 60–79 | Stable | Generally sound, minor concerns |
| 40–59 | Watch | Notable concerns requiring scrutiny |
| 20–39 | Elevated Risk | Serious documented issues |
| 0–19 | Critical | Multiple verified serious issues |

---

*No verdicts. No removals. Only transparent, explainable, evidence-weighted scores.*
