# Listing fields for the Zapier developer platform

App name: Excession Labs Security

Tagline (140 characters or fewer): Check security headers, find penetration test providers and send a penetration test request.

Description (Zapier lists the first lines first):

Excession Labs is a security lab. This app gives your Zaps three tools from its public APIs.

Check Security Headers reads the HTTP response headers of a public web page. It returns a pass, warn or fail result for HTTPS, HSTS, CSP, framing, nosniff, referrer policy and other header checks. It reads headers only and is not a penetration test. No key is needed.

Find Pentest Providers searches the sourced provider list on pentestcompare.com. Filter by delivery, scope and published price. Each result has the date its facts were checked. Excession Labs publishes the list and has one row in it, which the results mark as publisher-owned. The list is not ranked. No key is needed.

Request a Penetration Test sends a test request to Excession Labs for a person who asked for it. Excession Labs replies to that person by email. Testing starts only after a written scope and written authorization from the system owner. The action needs a free agent key from https://penetrationtestservices.com/agent/auth, and it needs you to set the person-consent and authorization inputs to true.

Intended audience: Everyone (a general-audience app)
Category: Developer Tools (second choice: IT Operations or Security, if listed)
Homepage URL: https://penetrationtestservices.com/
Source code: https://github.com/Excession-Labs/zapier-app
Contact email for support: support@excessionlabs.ai
Privacy policy URL: https://penetrationtestservices.com/privacy/
Terms URL: https://penetrationtestservices.com/terms/
Company: Excession Labs (https://excessionlabs.ai)
Logo: assets/logo-256.png (256 by 256 PNG; 512 by 512 copy in assets/logo-512.png)
Authentication: API key (custom). Field "Agent key" is optional. Help text is in `authentication.js`.
Test account for Zapier review: none needed. Register a key at https://penetrationtestservices.com/agent/auth. Tell the reviewer to leave the key empty for the first two actions.

Zap templates: leave blank.
Version notes for the first version: First release with three actions.
