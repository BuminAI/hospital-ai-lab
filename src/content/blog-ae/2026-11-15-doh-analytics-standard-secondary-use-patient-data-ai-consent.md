---
title: "Using patient records to train AI: what Abu Dhabi’s standard requires"
description: "Before a vendor or research team trains a model on your hospital’s records, read this. Abu Dhabi’s 2026 analytics standard sets consent, anonymisation and re-identification rules."
pubDate: 2026-11-15
category: "Column"
draft: false
series: "data-devices-incidents"
---

“We only use your data to improve the model.” Vendors say it often. In Abu Dhabi, the Department of Health’s Analytics and Reporting Standard (published April 2026, effective May 2026) gives hospital teams a rulebook for exactly that situation, which it calls secondary use: using patient data for a purpose other than the care it was collected for.

## The default: anonymised or de-identified

Patient data used for secondary purposes must be anonymised or de-identified unless the patient explicitly permits otherwise or the law requires it. That puts the burden on the project, not on the patient. If a vendor wants identifiable data, ask on what basis: explicit permission or a legal requirement.

## Consent that means something

The standard requires explicit informed consent before secondary use. Patients may withdraw consent at any time without any effect on their care. For a hospital, that means the consent process and the withdrawal route need an owner, and staff at registration should know what to say when a patient asks.

## Things that are prohibited

- Using secondary use to deny or limit insurance, employment or other essential services.
- Using personally identifiable data for commercial gain without explicit consent.
- Trying to re-identify anonymised data.

The standard also asks data science and AI teams to embed ethical data use at every stage of the AI system lifecycle.

## Questions for a vendor or research partner

1. Is the data anonymised or de-identified before it leaves our systems? By whom and how?
2. If it is not, what explicit permission or legal requirement do you rely on?
3. Will our data be used to train or improve a model that you also sell to others?
4. How do we honour a patient’s withdrawal?
5. What stops anyone from re-identifying the data?

Where the data is stored matters too: see our post on the Data Access Standard.

## Key takeaways

- Secondary use of patient data: anonymised or de-identified by default; explicit informed consent required.
- Withdrawal at any time, with no effect on care; re-identification and use to deny essential services are prohibited.
- Put a named owner on consent and withdrawal. This is general information, not legal advice; the federal laws were not read for this post.

*Sources: [Abu Dhabi Department of Health, Analytics and Reporting Standard, DoH/ST/DDGO/AR/V1/2026](https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/070426Analytics-and-Reporting-Standard.ashx) (sections 3.2.6.2 and 3.2.6.3). Read on 15 November 2026.*
