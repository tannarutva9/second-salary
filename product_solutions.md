# PRODUCT SOLUTIONS DOCUMENT
## Second Salary: The Core Product — Eight Capabilities for the Burnt Starter

### WHAT THIS DOCUMENT IS
A senior-PM specification of the eight product capabilities that constitute the Second Salary MVP — what each does, why it exists (anchored to discovery), how it behaves, what could go wrong, and what is deliberately left out.
This is the bridge document between product discovery and the PRD. Every feature traces back to a named interview participant or a theme from the 26-interview discovery cycle.

#### Persona
* **The Burnt Starter** (priority #1)

#### Discovery base
* Persona v3 (26 interviews) + Competitive Analysis v2 + OST v2

#### Frameworks
* Torres OST · MoSCoW · RICE · Cagan four-risks

#### Scope
* 8 product capabilities · 5 Must-Have user stories served fully · 3 Should-Have served fully

#### Out of scope here
* Monetisation, pricing, payment infrastructure — deliberately set aside

#### Document version
* v1.0 — May 2026

---

### Executive Summary
Second Salary is a self-serve product that takes a Burnt Starter — a mid-career Indian professional who tried side-income once, failed, and stalled — from “burned and stalled” to their first ₹10,000 earned in 90 days. It does this by replacing the missing infrastructure of their last failed attempt: pricing decisions, positioning, contracts, accountability, and proof of viability.

The product is intentionally narrow. It does not teach freelancing as a body of knowledge — discovery showed content is not the gap. It does not pretend to be a marketplace — supply-and-demand matching is a two-sided problem out of scope for MVP. It does not employ humans in the loop — the design call is to validate whether AI plus structured community can carry the load that a coach would have carried.

Eight capabilities, when combined, form the product. Each capability traces to specific user pain backed by named interview participants. This document specifies each capability in the depth a senior product manager would write it: purpose, discovery anchor, behaviour, design decisions, edge cases, and what is deliberately deferred.

> [!NOTE]
> **KEY INSIGHT**
> Discovery did not point to a course, a coaching platform, or a marketplace. It pointed to a product that removes the specific frictions that broke the user's last attempt — and forces them into action before research becomes avoidance.

---

### The Eight Capabilities at a Glance

| # | Capability | One-line purpose |
|---|---|---|
| 1 | Intake & Personalisation | Capture deep user context that powers every downstream personalisation decision. |
| 2 | The Day-9 Plan | Translate intake into a personalised, day-by-day action plan to first proposal sent by Day 9. |
| 3 | AI Co-Pilot | Compress the pitch-price-contract friction into AI-assisted, channel-aware artifacts. |
| 4 | Peer Proof Gallery | Move the user from “is this real?” to “this works for people like me” at the moments of doubt. |
| 5 | ₹ Earned Dashboard | Be the single source of truth on whether the product is working — by tracking the only metric that matters. |
| 6 | Async Peer Cohorts | Carry the accountability and community load that a human coach would have carried, at near-zero marginal cost. |
| 7 | Self-Serve Crisis Flow | Make sure one bad client does not end the attempt — by handing the user the exact response when things go wrong. |
| 8 | Channel Targeter | Tell the user exactly which platform or channel to act on, ranked by fit and protected by our infrastructure. |

---

### 1. Product Foundation

#### 1.1 The Core Thesis
A self-serve product that takes a Burnt Starter from “burned and stalled” to first ₹10,000 earned in 90 days — by replacing every piece of infrastructure that was missing during their last failed attempt.

This is not a course. It is not a coaching service. It is not a freelance marketplace. It is a productised system that removes the specific decisions, frictions, and unknowns that broke the user's last attempt — and forces them into outbound action before research becomes avoidance.

#### 1.2 Who This is For
The Burnt Starter is the user we are building for. Discovery (Phase 1 → v3 persona doc, 26 interviews) defined them as:
* Mid-career Indian professional, typically 5–12 years of experience
* Has a monetisable skill: design, engineering, writing, tutoring, marketing, coaching, content
* Tried side income at least once before. Failed. Has been off it for 6+ months.
* Earns ₹8L–25L per year from primary employment
* Carries the emotional weight of past failure — not just lack of knowledge, but loss of confidence
* Time-constrained (typically 5–10 hours per week available), but not the binding constraint. Confidence and trust are.
* Has accumulated distrust of the category — “scammy” came up unprompted in 7 of 18 first-round interviews

Two other personas — the Skilled Doubter and the Invisible Earner — are intentionally out of scope for v1. Discovery prioritised the Burnt Starter as the clearest beachhead with the most defined pain. Focus or fail.

#### 1.3 Design Principles
Every product decision in this document traces back to one of these eight principles. Each principle comes from specific discovery evidence.

| Principle | Discovery source | Product implication |
|---|---|---|
| **Action before content** | P-21, P-24 (content as avoidance) | Content, community, and AI tools are locked until the Day-1 outbound action is taken. Behavioural enforcement of action-first. |
| **Personalisation or nothing** | P-21 (generic = immediate churn) | Every product surface uses intake data. Generic content was the explicit dropout trigger in discovery. |
| **₹ earned, not modules done** | P-24 explicit (“Good content doesn't pay my rent”) | Only ₹ earned shows prominently on the dashboard. No modules, no content consumed, no hours studied. |
| **Precision over volume** | P-20 (“Show me 3 people exactly like me”) | Peer proof gallery filters tightly. Three matched stories beat thirty vague ones. Volume itself is the anti-pattern. |
| **One decision at a time** | Theme: paralysis (multiple interviews) | Single next-action card. Hidden complexity. The product reveals only what the user needs to act on now. |
| **Day 9 is the moment** | P-22 (named Day-9 dropout pattern) | The product's central activation milestone is Day 9. Plan length, forcing functions, and milestone celebrations all anchor here. |
| **One bad client doesn't end the attempt** | P-23 (lost ₹8K, ended attempt) | Self-serve crisis flow exists as a first-class capability. Recovery is part of the product, not an edge case. |
| **Transparency over polish** | Theme 5 (“scammy” — 7/18 unprompted) | Public outcomes, honest copy, visible exclusion logic. The category's distrust is so high that polish reads as deception. |

---

### 2. The User Journey That Produces ₹
Every capability in this document exists to serve a specific moment in this journey. If a feature does not directly enable one of these moments, it is not in the MVP.

| Moment | What the user does | What the product must do |
|---|---|---|
| **Day 0 — Signup** | Shares context: skill, experience, time available, target ₹ amount, past attempt history. | Capture deep enough to personalise every downstream decision. 10 minutes, structured, no essays. |
| **Day 1 — First action** | Takes one specific outbound action before consuming any content or community. | Force action. Hand over the exact script. Remove all decisions. Lock the rest until done. |
| **Day 2–8 — Path** | Daily micro-actions building toward a real proposal: visibility, lead identification, outreach. | Adapt the path based on real-world responses. Generate next step. Catch stalls at Day 5. |
| **Day 9 — First proposal** | Sends a real proposal to a real prospect. | AI Co-Pilot drafts the proposal. User reviews and sends. Milestone celebrated. Peer story unlocked. |
| **Day 9–30 — Negotiate, contract, deliver** | Negotiates with prospect, signs contract, delivers work, invoices. | Provide contract templates with scope protection. Pricing anchors. Scope-change scripts. Crisis flow if things go wrong. |
| **Day ~30 — First ₹** | Receives first payment. Logs it in the product. | Track, celebrate prominently, surface peer outcomes from cohort, prime the next cycle. |
| **Day 30–90 — Compound** | Second client, third client. Refines pricing. Builds rhythm. | Repeat the loop with sharper inputs and faster cycle. Peer proof and confidence build. |

> [!IMPORTANT]
> **ACTIVATION MILESTONE**
> Day 9 — first real proposal sent. This is the central activation moment of the product. Everything in capabilities 1–8 is calibrated around getting the user here with confidence and the right artifacts in hand.

---

### 3. The Eight Capabilities — In Depth

#### CAPABILITY 1: Intake & Personalisation
**Purpose:** Capture deep user context that powers every downstream personalisation decision in the product.

* **Discovery Anchor:** P-21 named generic output as the immediate churn trigger. Theme 6 (“need someone in my corner”) showed re-entry safety is a binding constraint. P-23 and P-13 showed past-attempt history must shape downstream tone and channel selection — a user burned on Upwork should not be steered back to Upwork without context.
* **User Stories Served:** US-07 (personalised first action, SHOULD) is directly served. Foundational for US-01, US-02, US-03 — every personalisation downstream depends on intake.
* **Detailed Behaviour:**
  * *Sequence:* A 10-minute structured form. Mostly multiple-choice, with three short-answer fields. No free-form essays — discovery showed those have high abandonment and are hard to parse downstream.
  * *Required captures:*
    * Primary skill (taxonomy-mapped, approx. 40 options across design, engineering, writing, marketing, tutoring, coaching, content, advisory, ops, finance)
    * Sub-skills (multi-select within primary skill)
    * Years of professional experience (tiered: 0–2, 2–5, 5–10, 10+)
    * Time available per week (tiered: <5hr, 5–10hr, 10–20hr, 20+hr)
    * Target ₹ amount (free numeric input + radio for monthly / one-time / unsure)
    * Location (city, used for peer matching and platform availability tuning)
    * Past attempt story — multiple choice (never tried / tried platforms / tried freelance off-platform / tried products / tried courses) + short text: “what stopped you last time?”
    * Discovery channel (how did you hear about us?)
    * Risk tolerance (3-point scale: cautious / balanced / aggressive — directly drives Channel Targeter tier recommendations)
  * *Output:* A structured user profile object. This object is the personalisation key. It feeds the Day-9 plan generator, the peer-matching algorithm, the channel recommender, the cohort assigner, and every Co-Pilot output. Without this object, the rest of the product is generic.
* **Key Design Decisions:**
  * *Structured over open-ended:* Cut free-form story intake due to high abandonment and downstream parsing inconsistency.
  * *Past attempt question is mandatory:* Knowing what burned the user last time changes everything downstream (channels avoided, contract clauses highlighted, cohort assigned, plan tone).
  * *Risk tolerance is explicit:* Lets us personalise recommendations without false consent.
  * *No skill assessment or portfolio review yet:* Self-report is sufficient for MVP to reduce activation friction.
* **Edge Cases & Failure Modes:**
  * User abandons intake mid-form: Show progress bar, allow skipping 1-2 questions, save partial state.
  * User selects "I'm not sure" for skill: Clarification flow fallback to "Generalist" path.
  * Past attempt story is too vague: AI summarisation extracts signal.
  * User profile changes mid-journey: Allow re-intake after 30 days.
  * Adversarial input: Downstream verification (invoices, cohorts) catches this.
* **Out of MVP Scope:**
  * Skill assessment / aptitude tests
  * Portfolio or resume parsing (LinkedIn import, file upload)
  * Social login / OAuth (start with email/password)
  * Personality or psychometric profiling

---

#### CAPABILITY 2: The Day-9 Plan
**Purpose:** Translate intake into a personalised, day-by-day action plan that gets the user from signup to first proposal sent by Day 9.

* **Discovery Anchor:** P-22 named the Day-9 dropout pattern explicitly. P-21 ruled out generic output. P-24 ruled out modules/content as progress metrics.
* **User Stories Served:** US-07 (personalised first action assigned during onboarding — SHOULD) and US-03 (visible income-adjacent win before Day 9 — MUST) are both served directly.
* **Detailed Behaviour:**
  * *Generation:* Post-intake, combines user profile, skill-to-action playbook, channel recommendations, and AI synthesis.
  * *Plan structure:* 9 cards, each with: Day label, specific action, exact script/template, expected outcome, fallback action, time estimate.
  * *Progression rules:* All days visible in preview mode (opacity builds trust). Day 1 must be completed to unlock Day 2. Days 2-8 unlock progressively. Day 9 is proposal submission.
  * *Adaptation:* Plan branches at Day 5 based on response rate: (a) Got responses, (b) No responses but visibility growing, (c) Stalled.
  * *Plan as artifact:* Can be downloaded as PDF.
  * *Sample Plan:* (For Senior Product Designer, 5y exp, 6h/wk available, ₹50K target, Bangalore):
    * Day 1: Update LinkedIn profile. (20 min)
    * Day 2: Post about design process. (25 min)
    * Day 3: Identify 5 local hiring startups. (30 min)
    * Day 4: Send DMs to first 2 prospects. (20 min)
    * Day 5: Send DMs to remaining 3. BRANCH POINT. (25 min)
    * Day 6-8: Discovery calls & follow-up conversation. (30 min/day)
    * Day 9: Send proposal drafted by AI Co-Pilot. (30 min)
* **Key Design Decisions:**
  * *9 days, not 7 or 14:* Day 9 is the dropout cliff.
  * *All days visible, only one unlocked:* Visibility breeds trust, one-at-a-time breeds focus.
  * *Adaptive at Day 5, not Day 1:* Allows gathering 4 days of real-world signal first.
  * *Templates provided for every script:* Removes "what do I say" friction.
* **Edge Cases & Failure Modes:**
  * AI plan errors: Provide per-day feedback widget for flagging.
  * User finishes early: Option to skip ahead.
  * User stalls: Branch logic catches it, sends email nudge.
* **Out of MVP Scope:**
  * Video walkthroughs of each day
  * Personalised plan length
  * Voice-input actions
  * Calendar integration

---

#### CAPABILITY 3: AI Co-Pilot (Proposal · Contract · Pricing)
**Purpose:** Compress the pitch-price-contract friction into AI-assisted, channel-aware artifacts the user can review and send.

* **Discovery Anchor:** P-04 blank-page issue, P-13 contract issues, P-23 scope creep, P-01 & P-03 pricing uncertainty.
* **User Stories Served:** US-04 (contracts/scope-change scripts — SHOULD), US-02 (pricing benchmark — SHOULD), US-03 (Day-9 proposal sent — MUST).
* **Detailed Behaviour:**
  * *Proposal Generator:* Drafts custom proposals based on channel type (LinkedIn, Upwork, email, Fiverr, Topmate).
  * *Contract Builder:* Generates contracts with protective default clauses (scope-change, payment schedule, dispute, kill fees).
  * *Pricing Calculator:* Offers rate range and suggests an anchor based on skill, exp, location, and gig type.
  * *Interaction Model:* Chat-like interface with edit-in-line, tone switching, and "explain why" controls.
  * *Outcome Tracking:* Logs if a proposal was sent and if the outcome was positive/negative/ghosted to tune recommendations.
* **Key Design Decisions:**
  * *Co-Pilot, not Auto-Pilot:* User reviews and edits; retains professional identity.
  * *Channel-aware:* Formats adapt to distinct channels to avoid generic feel.
  * *Explain why:* Transports trust through reasoning.
  * *Default to protection:* Automatic scope and dispute terms.
* **Edge Cases & Failure Modes:**
  * User doesn't trust output: Tone adjustment & editing tools.
  * Legally questionable clauses: Clear disclaimer + conservative defaults.
  * Identified as AI-written: Randomised phrasing, rewrite suggestions.
* **Out of MVP Scope:**
  * Voice-input
  * Multi-language support (English only)
  * Real-time negotiation assistant
  * Invoicing

---

#### CAPABILITY 4: Peer Proof Gallery
**Purpose:** Move the user from “is this real?” to “this works for people like me” at the moments of doubt.

* **Discovery Anchor:** P-20 ("Show me 3 people exactly like me"), P-22 (Day-9 dropout prevention), P-26 (creator trust).
* **User Stories Served:** US-01 (verified success stories — MUST).
* **Detailed Behaviour:**
  * *Gallery construction:* Profile/avatar, skills, exp, availability, starting context, outcome, written story, screenshot uploads.
  * *Filtering:* Automatically matches viewing user's exact profile details. Shows 3-10 matches.
  * *Surfacing:* Placed contextually at key friction points (onboarding, dashboard sidebar, proposal sender, crisis flow).
  * *Submission flow:* Triggered at ₹10K milestone. Structured form submission.
* **Key Design Decisions:**
  * *Precision over volume:* Specific matching beats large lists.
  * *User-written & authentic:* Less polish, more credibility.
  * *Contextual integration:* No dedicated tab; discovered as needed.
  * *Verification badge:* Visible indicators for verified invoice/payment logs.
* **Edge Cases & Failure Modes:**
  * Cold start: Seed with launch cohort stories.
  * Demographics gap: Highlight empty spots to encourage first submissions.
  * Stale stories: Refresh/archive cycle (18-month max).
* **Out of MVP Scope:**
  * Video stories
  * Direct member-to-member DMs
  * Open search/filter UI

---

#### CAPABILITY 5: ₹ Earned Dashboard
**Purpose:** Become the single source of truth on whether the product is working — by tracking the only metric that matters.

* **Discovery Anchor:** P-24 ("milestones, not modules"), Theme 1 (worth).
* **User Stories Served:** US-05 (track ₹ earned — MUST).
* **Detailed Behaviour:**
  * *Interface:* Hero cumulative ₹ earned figure, Day-9 countdown, single next action card, confidence slider, recent activity feed.
  * *Logging:* Quick reporting form. Invoice upload unlocks "verified" status.
  * *Milestones:* Celebrations triggered at first ₹, ₹1,000, and ₹10,000.
* **Key Design Decisions:**
  * *Single metric focus:* No courses, lessons, or gamified streaks.
  * *Self-report first:* Logging has zero friction.
  * *Calibrated celebrations:* Massive emphasis on the psychological hurdle of the first ₹.
* **Edge Cases & Failure Modes:**
  * Overstated earnings: Verified vs. unverified indicators.
  * Quiet state: Prompt user every 30 days.
  * Multi-currency: Dynamic exchange rate conversion to INR.
* **Out of MVP Scope:**
  * Tax tracking
  * Invoice generation
  * Payment processor integration (Razorpay/Stripe)

---

#### CAPABILITY 6: Async Peer Cohorts
**Purpose:** Carry the accountability and community load that a human coach would have carried — at near-zero marginal cost.

* **Discovery Anchor:** Theme 6 ("need someone in my corner"), Hypothesis H8.
* **User Stories Served:** US-01, US-03, US-11. (US-08 Human-in-the-loop is explicitly WON'T HAVE).
* **Detailed Behaviour:**
  * *Cohort structure:* 5 users, auto-assigned by skill/exp. Placed on Slack/Discord. 30-day lifespan.
  * *Structured prompts:* Auto-posted prompts on Days 1, 5, 9, 14, 21, and 30.
  * *Moderation:* Automatic filter flags, light weekly admin sweep.
  * *Graduation:* Move to wider alumni community. High earners can volunteer as "Cohort Seniors."
* **Key Design Decisions:**
  * *5 people:* Optimal size for active participation.
  * *Async:* Fits time-poverty constraints.
  * *Auto-assigned:* Prevents self-segregation.
  * *Structured prompts:* Prevents channel decay.
* **Edge Cases & Failure Modes:**
  * Silent cohort: 7-day silent cohorts are merged/reshuffled.
  * Negative users: Swift removal protocol.
  * Cohort failure (no ₹ earned): Triggers retrospective interview.
* **Out of MVP Scope:**
  * Live calls/video sharing
  * Direct DM support inside product
  * Cohort progress dashboard

---

#### CAPABILITY 7: Self-Serve Crisis Flow
**Purpose:** Make sure one bad client does not end the attempt — by handing the user the exact response, script, or recovery move when things go wrong.

* **Discovery Anchor:** P-23 (lost ₹8K to scope creep), P-13 (ghosted without contract), Theme 6.
* **User Stories Served:** US-11 (recovery — MUST/promoted), US-04 (contracts/scripts), US-08 (Self-serve replacement for human coaching).
* **Detailed Behaviour:**
  * *Triggers:* Dashboard button, Co-Pilot context switch, or Cohort tag.
  * *Triage:* Short diagnosis questions (Issue type, timeline, stakes, channel).
  * *Playbook output:* Summarises situation, provides templates (Payment chaser, Scope renegotiation, Walk-away, Platform dispute).
  * *Peer routing:* Option to share anonymised details to cohort for advice.
  * *Path adaptation:* Post-crisis, system adjusts future contract guidelines and channel scoring.
* **Key Design Decisions:**
  * *Triage first:* Precludes incorrect advice generation.
  * *Firm defaults:* Protects users from over-softening.
  * *Anonymous cohort sharing:* Drives community learning and mitigates isolation.
  * *Legal disclaimer:* Explicit warning that output does not constitute legal counsel.
* **Edge Cases & Failure Modes:**
  * Real legal/harassment issues: Route to "consult a lawyer" escalation path.
  * User-caused crisis: Apology and restitution templates provided.
  * Repeat crises: Flag for intervention loop/re-intake.
* **Out of MVP Scope:**
  * In-app lawyer consultations/legal representation
  * Automated platform dispute filing
  * 24/7 crisis hotline

---

#### CAPABILITY 8: Channel Targeter
**Purpose:** Tell the user exactly which platform or channel to act on, ranked by fit and protected by our infrastructure.

* **Discovery Anchor:** P-23, P-13 platform experiences. Reintroduced Upwork/Fiverr with contract and crisis wrap protection.
* **Detailed Behaviour:**
  * *Inputs:* Drawn from the user profile object: primary skill, experience tier, location, time available, risk tolerance, past-burned channels.
  * *Outputs:* A ranked shortlist of 2–3 channels for each action type.
  *(Note: Remaining details truncated in source document)*
