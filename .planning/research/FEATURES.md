# Feature Landscape: Non-Resident Tax Filing Platform (Modelo 210)

**Domain:** Tax filing platform for non-resident property owners in Spain
**Target Users:** Elderly foreigners (primarily EU/EEA) requiring extreme simplicity
**Key Differentiator:** Zero data re-entry year over year
**Researched:** 2026-01-17
**Confidence:** HIGH (based on competitor analysis, AEAT requirements, and domain research)

---

## Table Stakes

Features users expect. Missing any of these = product feels incomplete or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Imputed Income Declaration** | Core Modelo 210 use case - even vacant properties must declare | Medium | Calculate from valor catastral (1.1% or 2% based on revision date) |
| **Rental Income Declaration** | Second major use case for property owners who rent | Medium | Must handle EU/EEA deductible expenses vs non-EU gross income |
| **Capital Gains Declaration** | Third major use case - property sales with 3% retention refund | High | Complex: requires purchase/sale deed data, expense deductions, 4-month deadline |
| **Multi-owner Support** | Each co-owner MUST file separate Modelo 210 per Spanish law | High | Core differentiator - generate multiple declarations from single data entry |
| **Multiple Properties** | Users often own 2+ properties (apartment + garage, etc.) | Medium | IberianTax handles up to 8 co-owners per property |
| **Tax Rate Differentiation** | 19% EU/EEA vs 24% non-EU is legally required | Low | Simple conditional based on tax residency |
| **Expense Deduction Calculator** | EU/EEA residents can deduct utilities, maintenance, IBI, insurance | Medium | Only for EU/EEA rental income; non-EU cannot deduct |
| **Multilingual Interface** | Users are foreigners who don't speak Spanish | Low | Minimum: English, German, French, Spanish (IberianTax languages) |
| **Deadline Reminders** | Users miss deadlines and face penalties (100-200 EUR minimum) | Low | Email reminders for Dec 31 (imputed), Jan 20 (rental), 4-month (capital gains) |
| **Tax Receipt Storage** | AEAT requires 4-year retention; users need proof of filing | Low | PDF download of submitted declarations and receipts |
| **NIE/NIF Validation** | Invalid tax IDs cause AEAT rejection | Low | Format validation before submission |
| **Cadastral Reference Lookup** | Required for all filings; users often don't know format | Medium | Validate against Catastro; pre-fill from prior year |
| **Clear Pricing Display** | Competitors show transparent per-filing pricing | Low | IberianTax: 34.95 EUR imputed, 79.95 EUR rental, 149.95 EUR capital gains |
| **AEAT-Compliant Submission** | Filings must be accepted by Spanish Tax Agency | High | Must be AEAT collaborator or use fiscal representative |
| **Direct Debit Setup** | Standard Spanish payment method for tax | Medium | SEPA direct debit from Spanish bank account |

### Dependencies
```
NIE/NIF Validation --> All Declarations
Cadastral Reference --> All Property-Based Calculations
Tax Residency Status --> Tax Rate + Expense Deduction Eligibility
Multi-owner Support --> Multiple Declarations (1 per owner per property)
```

---

## Differentiators

Features that set product apart. Your stated key differentiator is **zero data re-entry year over year**.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Zero Re-entry Year Over Year** | IberianTax pain point: users must re-enter data annually despite "automatic renewal" | Medium | Persist property, owner, cadastral data; pre-populate next year |
| **Single Entry, Multiple Declarations** | Families with 2-4 co-owners enter data ONCE; system generates all required Modelo 210s | High | **Critical differentiator** - IberianTax requires separate filing per owner |
| **Elderly-Optimized UX** | Target users are elderly; competitors have standard web UX | Medium | Large fonts (16px+ base), high contrast, minimal steps, no jargon |
| **Fiscal Representative Integration** | Client acts as fiscal representative; bypass user's need for digital certificate | Medium | Streamlines submission; removes AEAT portal complexity |
| **Smart Valor Catastral Extraction** | Auto-extract from IBI receipt upload (OCR) or Catastro lookup | High | Reduces manual data entry; validates revision date for 1.1%/2% rate |
| **Prorated Imputed/Rental Calculator** | Property rented part-year requires both declarations with correct proration | Medium | Common scenario; IberianTax handles but not prominently |
| **Family Dashboard** | View all family members' filings in one place | Medium | Parents helping elderly parents; couples managing together |
| **3% Retention Refund Wizard** | Walk through capital gains refund claim step-by-step | High | Complex process; significant user value (often thousands of EUR) |
| **Document Checklist** | Show exactly what documents needed before starting | Low | Reduces abandonment; builds confidence |
| **Progress Persistence** | Save mid-flow; return later without data loss | Low | Essential for elderly users who may need breaks |
| **Status Tracking** | Show filing status (draft, submitted, accepted, refund pending) | Medium | Reduces support inquiries; builds trust |
| **Expense Categories with Examples** | Help EU/EEA users identify deductible expenses | Low | IBI, community fees, insurance, utilities, repairs - with examples |
| **Double Taxation Guidance** | Inform users about treaty implications | Low | Taxadora offers this; adds perceived value |

### Differentiator Priority for MVP

**Must Have (Core Differentiator):**
1. Single Entry, Multiple Declarations - This is THE feature that beats IberianTax
2. Zero Re-entry Year Over Year - Stored property/owner profiles
3. Elderly-Optimized UX - Large text, simple flow, clear language

**Should Have (Phase 2):**
4. Family Dashboard
5. Status Tracking
6. Document Checklist

**Nice to Have (Phase 3+):**
7. Smart Valor Catastral Extraction (OCR)
8. 3% Retention Refund Wizard
9. Double Taxation Guidance

---

## Anti-Features

Features to explicitly NOT build. These are common mistakes in tax software.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **DIY AEAT Portal Integration** | Requires users to have digital certificate, Cl@ve PIN, or NIE with AEAT access; elderly users cannot manage this | Use fiscal representative model - client submits on behalf of users |
| **Real-time AEAT API Integration** | AEAT Verifactu/SII APIs are for VAT businesses, not individual property taxes; massive compliance overhead | Batch submission via fiscal representative |
| **Complex Tax Optimization Engine** | Non-resident property tax is straightforward; "optimization" suggests compliance risk | Present facts clearly; let user/fiscal rep make decisions |
| **Chatbot/AI Tax Advice** | Regulatory risk; elderly users want human support, not AI | Offer human support via email/phone; clear FAQ |
| **Account Linking to Spanish Banks** | Complex, regulatory burden (PSD2), often unnecessary | Manual bank account entry for direct debit |
| **Automatic Form Pre-filling from AEAT** | Would require user's digital certificate delegation; complex and risky | Pre-fill from OWN prior year data stored in platform |
| **In-App Payment Processing** | Adds PCI compliance; Spanish taxes paid via direct debit to AEAT | Set up SEPA direct debit; AEAT collects directly |
| **Mobile App** | Elderly users prefer desktop; app maintenance overhead; web works on tablets | Responsive web design that works on tablets |
| **Social Login** | Elderly users often don't have social accounts; password recovery confusion | Email/password with simple password reset |
| **Gamification/Progress Badges** | Inappropriate for tax context; elderly users find it patronizing | Simple progress bar showing completion |
| **Multi-currency Support** | All Spanish taxes are in EUR; adds complexity | EUR only |
| **Tax Calendar Sync** | Over-engineering; simple email reminders suffice | Email deadline reminders |
| **Document Scanning Requirement** | Elderly users struggle with scanning; fiscal rep has source docs | Optional document upload; not required |
| **Quarterly Filing Automation** | Rental income is now annual (since 2024), not quarterly | Support annual rental income filing only |

### Why These Matter

**Competitor IberianTax has 15k+ users but is "tedious for renewals"** - this is the opening. They over-engineered features (expense tracker, glossary, calculators) but failed at the core use case: returning users re-entering the same data.

**Elderly users need LESS, not MORE:**
- Fewer steps
- Fewer options
- Fewer decisions
- Clearer language
- Bigger text
- Human support available

---

## Feature Dependencies

```
                    +------------------+
                    |   User Account   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |  Property Profile |         |   Owner Profile   |
    |  (cadastral ref,  |         |   (NIE, tax       |
    |   valor catastral,|         |    residency,     |
    |   ownership %)    |         |    bank account)  |
    +---------+---------+         +---------+---------+
              |                             |
              +-------------+---------------+
                            |
              +-------------v--------------+
              |     Declaration Type       |
              |  (Imputed/Rental/Capital)  |
              +-------------+--------------+
                            |
         +------------------+------------------+
         |                  |                  |
+--------v-------+  +-------v--------+  +-----v---------+
| Imputed Income |  | Rental Income  |  | Capital Gains |
| Calculator     |  | Calculator     |  | Calculator    |
| (simple)       |  | (+ expenses)   |  | (complex)     |
+--------+-------+  +-------+--------+  +-----+---------+
         |                  |                  |
         +------------------+------------------+
                            |
              +-------------v--------------+
              |  Multi-Owner Declaration   |
              |  Generator (1 per owner)   |
              +-------------+--------------+
                            |
              +-------------v--------------+
              |   Fiscal Rep Submission    |
              +-------------+--------------+
                            |
              +-------------v--------------+
              |    Status Tracking &       |
              |    Receipt Storage         |
              +----------------------------+
```

---

## MVP Recommendation

Based on research, a viable MVP should include:

### Must Have (Launch Blockers)
1. **User accounts with persistent profiles** - Owner + property data stored
2. **Imputed income declaration** - Most common, simplest use case
3. **Multi-owner support** - Core differentiator; generate N declarations from 1 entry
4. **Elderly-friendly UX** - Large text, simple flow, clear language
5. **Tax residency handling** - EU/EEA vs non-EU rate selection
6. **Deadline reminders** - Email notifications
7. **Receipt/proof storage** - Download submitted declarations

### Defer to Phase 2
- Rental income declarations (more complex, expense deductions)
- Family dashboard
- Status tracking with AEAT

### Defer to Phase 3+
- Capital gains declarations (complex, 3% refund)
- OCR/smart extraction
- Document management

### Explicitly Out of Scope
- Mobile app
- AI/chatbot
- Bank account linking
- AEAT direct API integration
- Quarterly filings

---

## Sources

### Primary (HIGH confidence)
- [AEAT Modelo 210 Official](https://sede.agenciatributaria.gob.es/Sede/en_gb/procedimientoini/GF00.shtml)
- [IberianTax](https://www.iberiantax.com/) - Competitor analysis, pricing, features
- [IberianTax Joint Owners Guide](https://www.iberiantax.com/blog/understanding-non-resident-property-taxes-for-joint-owners-in-spain-a-comprehensive-guide)
- [Taxadora](https://taxadora.com/non-resident-tax-modelo-210-spain/) - Competitor features

### Secondary (MEDIUM confidence)
- [IberianTax Trustpilot Reviews](https://www.trustpilot.com/review/iberiantax.com) - User sentiment
- [PTI Returns Deemed Tax Guide](https://www.ptireturns.com/blog/non-resident-landlords-know-about-spains-deemed-annual-tax/)
- [SpainEasy IRNR Guide](https://spaineasy.com/blog/non-resident-tax-irnr-spain/)
- [NNGroup Usability for Seniors](https://www.nngroup.com/articles/usability-for-senior-citizens/) - UX research

### Supplementary (LOW confidence - inform only)
- [TurboTax UX Analysis](https://www.appcues.com/blog/how-turbotax-makes-a-dreadful-user-experience-a-delightful-one) - General tax UX patterns
- [TaxSlayer Year-over-Year](https://support.taxslayer.com/hc/en-us/articles/360015899211-How-do-I-pull-my-prior-year-information-to-the-current-year) - Data persistence patterns
