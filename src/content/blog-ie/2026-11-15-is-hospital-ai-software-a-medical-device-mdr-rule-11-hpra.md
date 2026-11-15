---
title: "Is our hospital AI software a medical device? MDR rule 11 explained"
description: "A vendor says its AI is “not a medical device”. How the MDR defines software, how rule 11 sets the class, and what HPRA does and does not do in Ireland."
pubDate: 2026-11-15
category: "AI Tools"
draft: false
series: "data-devices-incidents"
---

“It’s just software, not a medical device.” Hospitals hear this often. Whether it is true depends on what the manufacturer intends the software to do, not on whether it sits in a box. The Medical Device Regulation (MDR, Regulation (EU) 2017/745) sets the test. We read the text as published in the Official Journal in 2017; consolidated versions may differ.

## The definition names software

Article 2(1) defines a medical device as any instrument, apparatus, appliance, **software**, implant, reagent, material or other article intended by the manufacturer to be used for human beings for specific medical purposes. The list of purposes includes diagnosis, prevention, monitoring, prediction, prognosis, treatment or alleviation of disease. So the question for your vendor is: what is the intended purpose, in writing, and does our planned use match it?

## Rule 11 sets the class of software

Annex VIII, rule 11, says:

- Software that provides information used to take decisions with diagnosis or therapeutic purposes is **class IIa**, except where the decisions could cause death or irreversible deterioration (**class III**) or serious deterioration of health or a surgical intervention (**class IIb**).
- Software that monitors physiological processes is class IIa, or IIb where it monitors vital parameters whose variations could result in immediate danger.
- All other software is class I.

The class also matters for the AI Act: under Article 6(1), an AI system in a product covered by the MDR that must undergo third-party conformity assessment is high-risk, from 2 August 2027 as published.

## What HPRA does

HPRA says it is Ireland’s National Competent Authority for the MDR and the IVDR. It monitors devices and IVDs on the Irish market and says it does not play a role in the authorisation or approval of devices. For a hospital that means the evidence of conformity comes from the manufacturer; ask for the CE-marking details.

## If you build it in-house

Article 5(5) lets devices made and used only within health institutions escape most MDR requirements if conditions are met, including a justification that the target patient group’s needs cannot be met by an equivalent device on the market, a public declaration, documentation for the competent authority, and review of clinical experience. HPRA lists in-house manufacturing among the routes hospitals should understand. HIQA’s draft guidance also warns that a hospital building AI-based device software takes on provider and manufacturer obligations.

## Key takeaways

- The MDR names software in its definition of a medical device; intended purpose decides.
- Rule 11 puts decision-support software in class IIa or higher; a vendor’s class should be explained in writing.
- HPRA monitors but does not approve; ask for conformity evidence. In-house devices have their own conditions. This is general information, not legal advice.

*Sources: [Regulation (EU) 2017/745 (MDR), Official Journal](https://eur-lex.europa.eu/eli/reg/2017/745/oj) (Articles 2(1) and 5(5), Annex VIII rule 11); [HPRA, Overview of medical device & IVD regulation for hospitals](https://www.hpra.ie/regulation/medical-devices/health-institutions-and-healthcare-professionals/overview-of-medical-device---ivd-regulation-for-hospitals); [Regulation (EU) 2024/1689, Article 6(1)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj). Read on 15 November 2026.*
