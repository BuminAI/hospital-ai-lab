---
title: "AI vendor business associate agreements: what to write down"
description: "HIPAA requires a written agreement before patient data goes to an AI vendor that is a business associate. A plain reading of the rule."
pubDate: 2026-11-06
category: "Column"
draft: false
series: "data-and-security"
---

Many AI projects begin with a pilot: send a sample of records to the vendor and see what comes back. Before that first file leaves the building, HIPAA asks one question that is easy to skip: is the vendor a business associate, and is there a written agreement?

## Who is a business associate

The definition in 45 CFR 160.103 covers a person who, on behalf of a covered entity and other than as a member of its workforce, creates, receives, maintains or transmits protected health information for a regulated function. It also covers a person who provides services such as legal, actuarial, accounting, consulting or data aggregation to or for the covered entity where providing the service involves disclosure of that information. Read it against what the vendor actually does with your data, not against how the vendor describes itself.

## The agreement comes first

Under 45 CFR 164.502(e), a covered entity may disclose protected health information to a business associate, and let it create, receive, maintain or transmit it, only if the covered entity obtains satisfactory assurance that the business associate will appropriately safeguard it. Those assurances must be documented in a written contract or other written agreement that meets the requirements of § 164.504(e).

## What the contract must contain

Section 164.504(e)(2) lists the terms. The contract must establish the permitted uses and disclosures. It may not authorize uses that would violate the Privacy Rule if the hospital did them, apart from two exceptions: the business associate's own proper management and administration, and data aggregation services for the hospital's operations. It must also provide that the business associate will:

- not use or further disclose the information other than as the contract permits or the law requires;
- use appropriate safeguards and comply with the Security Rule for electronic information;
- report uses or disclosures the contract does not allow, including breaches under § 164.410;
- make sure subcontractors agree to the same restrictions;
- make information available for access, amendment and an accounting of disclosures;
- make its books and records available to HHS; and
- at termination, if feasible, return or destroy the information.

The contract must also let the hospital terminate if the business associate violates a material term.

## Three places AI contracts need extra attention

1. **Use of your data to improve the vendor's own product.** The contract may not authorize uses that would violate the Privacy Rule if the hospital did them, with the two exceptions above. Ask counsel to read the vendor's clause against that text.
2. **Subcontractors.** Cloud and model providers are often subcontractors. The agreement must require the vendor to bind them to the same terms.
3. **Return or destruction.** Ask how the vendor will do this for data embedded in logs, backups or derived datasets.

## Key takeaways

- A vendor that handles PHI on your behalf, or provides listed services involving PHI, is a business associate (45 CFR 160.103).
- PHI may be disclosed only after documented satisfactory assurance in a written agreement meeting § 164.504(e) (§ 164.502(e)).
- The contract must cover permitted uses, safeguards, breach reporting, subcontractors, patient rights support, return or destruction, and termination rights.
- Check the vendor's use of your data and its subcontractors with counsel before the pilot starts.

*Sources: [eCFR, 45 CFR 160.103](https://www.ecfr.gov/current/title-45/section-160.103), [164.502](https://www.ecfr.gov/current/title-45/section-164.502), [164.504](https://www.ecfr.gov/current/title-45/section-164.504)*
