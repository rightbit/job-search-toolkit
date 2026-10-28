# ATS Targets

Curated list of companies mapped to their ATS platform, for direct API querying via `Scripts/query-ats.mjs`. This bypasses WebSearch/WebFetch scraping entirely, no JS rendering, no bot-detection risk, always-fresh data straight from the source.

**Supported platforms:** `greenhouse`, `ashby`, `workable`, `lever`. Rippling's ATS does not appear to expose an equivalent public endpoint; leave companies on Rippling out of this file or mark platform as `?` so the query script skips them.

**How to add a company:** Whenever `/find-jobs` or `/customize-for-job` discovers what ATS platform a company uses (visible in the job posting URL, e.g. `job-boards.greenhouse.io/{slug}`, `jobs.ashbyhq.com/{slug}`, `apply.workable.com` company page, or `jobs.lever.co/{slug}`), add a row here. The `slug` is the company identifier in that URL.

**Usage:**
```
node Scripts/query-ats.mjs --targets Inputs/ats-targets.md
node Scripts/query-ats.mjs --targets Inputs/ats-targets.md --title-keywords "VP,CTO,Head of Engineering,SVP"
```

| Company | Platform | Slug | Notes |
|---------|----------|------|-------|
| Podium | greenhouse | podium81 | Lehi UT, AI customer-communication SaaS |
| Entrata | lever | entrata | Lehi UT, property management SaaS and payments |
| Pattern | lever | pattern | Lehi UT, e-commerce acceleration |
| Collective Health | greenhouse | collectivehealth | Lehi UT office, health benefits platform |
| Automattic | greenhouse | automatticcareers | WordPress/WooCommerce (PHP ecosystem), remote |
| Acquia | greenhouse | acquia | Drupal (PHP) platform |
| Pantheon | greenhouse | pantheon | Drupal/WordPress hosting (PHP) |
| Wikimedia Foundation | greenhouse | wikimedia | MediaWiki (PHP) |
| Squarespace | greenhouse | squarespace | NYC; Acuity Scheduling |
| DigiCert | greenhouse | digicert | Lehi UT, Ryan's former employer (PHP) |
| Partnerize | greenhouse | partnerize | Partner marketing platform, PHP/Python |
| Shapeways | workable | shapeways-25 | Eindhoven NL, PHP/Symfony |
| Insomnia Cookies | lever | insomniacookies | Had a PHP/Laravel Director of Engineering role |
| Life.Church | lever | life | Edmond OK, digital product engineering |
| Prompt | ashby | Prompt | Healthcare SaaS for rehab therapy |
| GameChanger | ashby | gamechanger | NYC/remote youth sports app (DICK'S); TypeScript/Node.js |
| Feathr | ashby | feathr | Nonprofit marketing SaaS, ~117 employees, fully remote |
| Sailor Health | ashby | sailorhealth | Seed-stage AI + behavioral health for older adults, NYC onsite |
| Opal Security | ashby | Opal | Series B identity security, 11-50 employees, SF/NYC |
| Help Scout | ashby | helpscout | Remote customer support SaaS; PHP shop (had EM, PHP role) |
| Engine | greenhouse | engine | Business travel booking platform, remote US |
| Federato | greenhouse | federato | AI insurance underwriting SaaS, remote |
| NetBox Labs | ashby | netboxlabs | Open-source network automation, US remote |
| Spark Advisors | greenhouse | sparkadvisors | Medicare advisory platform, remote |
| GitLab | greenhouse | gitlab | All-remote DevSecOps platform (Ruby/Go) |
| Headway | ashby | headway | Mental health care network; remote PM roles, NYC engineering |
| Givebutter | ashby | givebutter | Nonprofit fundraising platform; Laravel/PHP + React/TypeScript, remote |
| Horizon3.ai | ashby | horizon3ai | Autonomous pentesting/security SaaS; many remote US EM roles |
| Affirm | greenhouse | affirm | Consumer fintech (BNPL); remote US engineering managers |
| Mural | ashby | mural | Visual collaboration SaaS; remote US |
| Qualtrics | greenhouse | qualtrics | Provo/SLC experience-management SaaS (Utah roles plus global) |
| Lucid Software | greenhouse | lucidsoftware | SLC/South Jordan visual collaboration SaaS |
| Filevine | lever | filevine | SLC legal-tech SaaS; many Utah roles |
| Canopy | greenhouse | canopytax | Draper UT accounting practice-management SaaS |
| BILL (Divvy) | greenhouse | billcom | Divvy spend management (Utah), BILL fintech |
| Recursion | greenhouse | recursionpharmaceuticals | SLC AI drug discovery |
| Route | greenhouse | route | Lehi e-commerce package protection and tracking |
| Neighbor | lever | neighbor | Lehi storage marketplace |
| MasterControl | greenhouse | mastercontrol | SLC quality-management SaaS (life sciences) |
| Awardco | greenhouse | awardco | Lindon UT employee recognition SaaS |
| SoFi | greenhouse | sofi | Fintech with Utah presence (consumer lending, check fit) |
| Brex | greenhouse | brex | Fintech with SLC hub |
