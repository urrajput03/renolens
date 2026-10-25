# Idea Refiner Prompt

## 1. Core Idea
**Idea Title:** Netherlands House Renovation Cost Estimator
**One-sentence description:** A tool that generates indicative cost estimates for house renovations in the Netherlands under different contracting setups (full-service vendor, separate labour + material contracts, or labour-only with owner-supplied materials).
**Target users:** Homeowners in the Netherlands who are planning renovations and want realistic cost indications before contacting contractors.
**Primary problem it solves:** Uncertainty about renovation costs and the difficulty of comparing different ways of contracting (full package vs. split labour/material vs. self-sourced materials).

## 2. Current Status
**Stage:** Just an idea
**What I already have:** 
- Clear knowledge of the three main contracting setups I want to support
- Understanding that the tool should give indicative (not fully accurate) estimates
**What is still fuzzy or missing:**
- Exact data sources for Dutch labour rates, material prices, and regional differences
- How the tool should find and compare “value for money” materials + transport + optional insurance
- User interface / input method (web app, spreadsheet, AI chat, etc.)
- How detailed the renovation scope input should be
- Whether the tool should also help generate RFQs or just give numbers

## 3. Desired Outcome
**Success looks like:** A practical tool that, after the user describes the renovation scope, produces clear cost ranges for each of the three contracting models, with transparent assumptions, so the user can decide which route is most attractive and prepare better conversations with local vendors.
**Must-have capabilities:**
1. Support the three contracting setups:
   - Full-service (labour + material from one local vendor)
   - Separate contracts (labour from one vendor, material from another)
   - Labour-only (user buys materials; tool helps find good value materials + transport + optional transport insurance)
2. Produce indicative cost estimates (ranges) rather than exact quotes
3. Allow the user to describe the renovation scope in a structured or semi-structured way
**Nice-to-have capabilities:**
1. Regional price adjustments within the Netherlands
2. Simple comparison view of the three options side-by-side
3. Ability to export a summary or generate a basic RFQ text
4. Suggestions for common pitfalls or typical extra costs

## 4. Constraints & Preferences
**Tech stack / tools I want to use:** [Not yet decided – open to recommendations. I use VS Code + GitHub Copilot]
**Hard constraints:** 
- Must be useful for the Netherlands (Dutch prices, local vendors, local regulations/context)
- Estimates are indicative only – this must be clearly communicated
- Should help the user make better decisions, not replace professional quotes
**Style / quality bar:** Practical, transparent, easy to understand, and trustworthy enough to be used for real decision-making.

## 5. What I need from you now
Please refine this idea by:
1. Clarifying and restructuring the concept into a clean architecture.
2. Breaking it into concrete components (data sources, calculation logic, user input, comparison views, material-sourcing helper, etc.).
3. Identifying gaps, risks, and missing pieces.
4. Proposing a practical next-step plan (what to build first, second, third).
5. Writing improved prompt(s) or templates I can use with GitHub Copilot / other AIs.
6. Asking me any clarifying questions that would significantly improve the refinement.

Output format:
- Refined Vision (1–2 paragraphs)
- Recommended Architecture (high-level + key components)
- Priority Order of Work
- Concrete Next Actions (with example prompts if useful)
- Open Questions for me