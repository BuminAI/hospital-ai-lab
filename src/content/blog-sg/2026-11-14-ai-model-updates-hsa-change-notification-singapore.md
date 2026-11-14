---
title: "AI model updates in Singapore: what HSA expects, what to ask the vendor"
description: "When a registered AI model is updated, HSA’s rules on change notification and its optional Change Management Program apply. What administrators can ask before an update reaches the wards."
pubDate: 2026-11-14
category: "News"
draft: false
series: "device-status"
---

An AI tool that was tested last year may not be the same tool next quarter. Vendors retrain models, change inputs and push updates. For a hospital, the practical question is who checks those changes, and when you hear about them. HSA’s guidelines give part of the answer for registered devices.

## Every change to a registered AI device is notified

HSA’s GL-04 (revision 4, effective 31 December 2025) says a change notification is required for any change made to a registered machine-learning-enabled medical device. The category of the change, technical, review or notification, follows HSA’s separate guidance on change notification. For software in general the guidelines list technical review for Class C and D devices, review for Class B, and notification for Class B, C and D, depending on the change.

GL-04 also describes devices that keep learning after deployment. The manufacturer must define the learning process and put controls in place. The items it lists include a built-in safety mechanism that can detect anomalies and roll back to a previous version, controls on the data used for learning, software version control, and traceability between real-world data, the software version and the output seen in clinical use.

## An optional fast lane: the Change Management Program

HSA’s GN-37 (revision 1, December 2024) introduces an optional pathway for SaMD, including machine-learning-enabled SaMD. A manufacturer can have anticipated “pre-specified changes” approved in advance and then implement them under its quality management system. The guidance says conformity with ISO 13485 and IEC 62304 is essential. Its scope note says it does not include continuous learning and generative AI.

For a hospital, this means a vendor may say “our updates are pre-approved”. That can be true only for the changes that were actually pre-specified and approved, for a registered device that is in the program.

## What hospitals can ask

1. Is the product registered, and does it use machine learning? (GL-04 says users must be told that the device contains ML.)
2. How will we hear about an update, and can we delay it?
3. Is any update covered by pre-specified changes under the Change Management Program, and which ones?
4. Does the model keep learning after deployment? If so, how do you detect problems and roll back?
5. How do you monitor real-world performance after deployment, and how does our feedback reach you? (GL-04 says companies must monitor the real-world performance of registered ML-enabled devices.)

The Ministry of Health’s AI guidelines add the hospital’s side: monitoring should check that performance is at least equivalent to current practice, with indicators such as model drift.

## Key takeaways

- Any change to a registered ML-enabled medical device needs a change notification to HSA.
- Continuous-learning devices must have defined learning, rollback and traceability controls.
- The Change Management Program is optional and covers only pre-specified changes; it excludes continuous learning and generative AI.
- Put the update process in the contract. This is general information, not legal advice.

*Sources: [HSA, GL-04-R4](https://isomer-user-content.by.gov.sg/409/26808a93-6a7a-4551-8c66-13046c6124c5/gl-04-r4-regulatory-guidelines-for-software-medical-devices---a-life-cycle-approach-(2025-dec)-pub.pdf), [HSA, GN-37-R1 Change Management Program](https://isomer-user-content.by.gov.sg/409/4e8620d9-267f-41f5-adc3-cc35456d3731/gn-37-r1-guidance-on-change-management-program-(cmp)-for-samd-including-machine-learning-enabled-samd.pdf), [Ministry of Health, AIHGle 2.0](https://isomer-user-content.by.gov.sg/3/6636a140-7986-43f6-9861-096333138d59/AIHGle_2.0.pdf). Read on 14 November 2026.*
