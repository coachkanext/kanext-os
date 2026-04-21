# Data Rights, Privacy, and Compliance Framework

**KaNeXT LLC | Confidential**

---

## Purpose

KaNeXT processes data across every institutional function: student records, athlete evaluations, financial transactions, medical information, video footage, community member data, and AI-generated intelligence. This document outlines the data rights framework, privacy obligations, and compliance architecture that govern how data is collected, stored, processed, shared, and protected across the platform.

This is a framework document, not a legal policy. Final privacy policies, terms of service, and compliance procedures will be developed with legal counsel and reviewed against applicable federal, state, and international regulations before deployment.

---

## Data Categories and Ownership

### Student Data

Student educational records (grades, enrollment, financial aid, disciplinary records, academic progress) are governed by FERPA (Family Educational Rights and Privacy Act). Under FERPA, the University is the custodian of educational records. KaNeXT, as the operational service provider under the IOA, processes student data as a "school official" with a legitimate educational interest - the same designation that allows any institutional technology vendor (Ellucian, Canvas, Blackboard) to handle student records.

The University retains ownership of academic records. KaNeXT processes them through the OS to deliver institutional services (enrollment, advising, financial aid, scheduling). Student data is never sold to third parties. Student data is not used to train AI foundation models. Student data access is RBAC-governed: a dean sees institutional-level data, a faculty member sees their students' data, a student sees their own data, a parent sees their child's data (with appropriate FERPA consent).

### Athlete Data

Athlete evaluations (KR ratings, component scores, archetype classifications, system fit analysis, development projections) are intelligence outputs produced by the KaNeXT system. This data is KaNeXT intellectual property, not student educational records. The distinction matters: KR ratings are produced by KaNeXT's proprietary intelligence architecture, not by the University's academic processes.

Game film captured by KVision cameras at mandate institutions, network schools, and the partner institution is processed and stored by KaNeXT. Schools consent to video capture and platform upload through the mandate agreement or IOA. Athletes consent through institutional enrollment agreements and athletic participation agreements.

Athlete medical and injury data is handled separately with heightened protections. Access is restricted to authorized medical personnel, coaching staff with legitimate need, and the athlete themselves. Medical data is never included in intelligence outputs shared beyond the authorized care and coaching team.

### Financial Data

All financial transactions through KPay are governed by applicable financial regulations including GLBA (Gramm-Leach-Bliley Act) for financial privacy, PCI-DSS for payment card data, and BSA/AML (Bank Secrecy Act / Anti-Money Laundering) for banking operations post-charter.

Financial data is processed through the governed settlement chain (Event, Rules, Authorization, Payment, Settlement, Audit). Every transaction is logged with full audit trail. Financial data is never sold to third parties. User financial behavior data (transaction patterns, spending, balance history) is used internally for platform features (wallet management, financial insights, lending underwriting) but is not shared externally without user consent.

### Community and Faith Organization Data

Churches, community organizations, and businesses operating on the platform in Community and Business modes generate member data, giving records, event attendance, and communication history. This data belongs to the organization. KaNeXT processes it through the OS to deliver platform services. RBAC ensures that only authorized roles within each organization can access member data.

Giving and donation records are particularly sensitive. A church member's giving history is visible only to authorized financial roles within that organization (typically senior pastor and finance team). It is not visible to other members, to KaNeXT staff, or to any other entity on the platform.

### Video and Content Data

Video captured through KVision cameras is processed for two purposes: streaming (KTV) and intelligence (structured data extraction). The raw video is stored on KaNeXT infrastructure. Schools and organizations retain the right to use their own game footage for their own purposes. KaNeXT retains the right to process, store, distribute, and monetize the video through the platform as defined in the mandate agreement or IOA.

The 48-hour upload requirement in the mandate ensures content availability. The mandate agreement specifies that broadcast rights are respected through a replay window structure that does not conflict with existing media agreements.

---

## AI-Specific Data Governance

### What AI Sees

Dipson accesses data through RBAC-governed queries. The AI does not have unrestricted access to all platform data. It sees only what the user's role authorizes. A fan asking Dipson about a player receives public information only. A coach asking Dipson about the same player receives the full evaluation. The AI's access is a function of the user's identity, not the AI's capability.

### What AI Learns

The institutional learning loop (described in the Dipson Technical Architecture doc) allows Dipson to absorb answers provided by authorized institutional personnel. This learning is institution-specific. Knowledge learned at the partner institution does not transfer to another institution on the platform. Each institution's Dipson learns independently within its own institutional boundary.

### What AI Does Not Do

KaNeXT does not use institutional data to train third-party AI foundation models. Student records, athlete evaluations, financial transactions, and community data are not provided to AI model providers as training data. The AI models used by Dipson are accessed through API, and the data processed through those APIs is governed by data processing agreements with the model provider that prohibit training on customer data.

KaNeXT does not use AI to make autonomous institutional decisions. The GII architecture is human-final: intelligence can be generated automatically, but institutional actions and authority-bound decisions require human confirmation. Dipson recommends. Humans decide.

---

## Regulatory Compliance

### FERPA (Student Privacy)

Applies to all student educational records at Title IV institutions. KaNeXT operates as a school official under the IOA with legitimate educational interest. Student data is processed only for institutional purposes. Directory information may be shared as permitted under FERPA. Parents and eligible students retain rights to access and request amendment of records.

### GLBA (Financial Privacy)

Applies to financial data processed through KPay and the bank. Privacy notices are provided to users. Opt-out rights are honored for information sharing with non-affiliated third parties. Safeguards are implemented to protect the security and confidentiality of customer financial information.

### PCI-DSS (Payment Card Data)

Applies to all card-based transactions through KPay. Card data is handled through PCI-compliant payment processing infrastructure. KaNeXT does not store raw card numbers on its own servers. Card processing is handled through certified payment processors (Stripe or equivalent) with PCI-DSS Level 1 compliance.

### COPPA (Children's Privacy)

Applies if the platform serves users under 13 (possible in prep academy or youth sports contexts). Parental consent is required before collecting personal information from children under 13. Age-gating and parental consent workflows are built into the onboarding process for youth-serving programs.

### State Privacy Laws

California (CCPA/CPRA), Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), and other state privacy laws impose varying requirements on data collection, user rights (access, deletion, opt-out), and data processing transparency. KaNeXT's privacy framework is designed to comply with the most restrictive applicable state law, which provides a compliance floor that satisfies less restrictive jurisdictions.

### HIPAA (If Applicable)

If KaNeXT processes protected health information through athletic training, student health services, or wellness programs, HIPAA compliance obligations apply. Medical data is segregated, access-controlled, and handled through HIPAA-compliant infrastructure. Business Associate Agreements are executed with any third-party processors handling PHI.

---

## Data Security

Data at rest is encrypted. Data in transit is encrypted (TLS). Access to production systems requires multi-factor authentication. Infrastructure is hosted on enterprise-grade cloud platforms with SOC 2 compliance. Regular security audits and penetration testing are conducted. Incident response procedures are documented and tested. Data backup and disaster recovery procedures maintain business continuity.

---

## User Rights

Users on the platform have the right to: access their personal data, request correction of inaccurate data, request deletion of their data (subject to legal and institutional retention requirements), understand how their data is used (privacy policy and disclosures), opt out of non-essential data processing where applicable, and receive notification of material data breaches affecting their information.

These rights are administered through the platform's privacy settings and through Dipson, which can answer user questions about their data and route data requests to the appropriate institutional authority.

---

## Disclaimer

This document is a compliance framework outline, not a legal policy. Final privacy policies, terms of service, data processing agreements, and compliance procedures will be developed with qualified legal counsel and reviewed against all applicable federal, state, and international regulations before platform deployment. Regulatory requirements may change and the framework will be updated accordingly.
