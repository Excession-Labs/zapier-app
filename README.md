# Excession Labs Security for Zapier

A Zapier integration built with the Zapier Platform CLI (version 19.3.0). It gives a Zap three actions from the public APIs of [Excession Labs](https://excessionlabs.ai), a security lab.

| Action | Type | Key needed | Data source |
|---|---|---|---|
| Check Security Headers | Action | No | `GET https://penetrationtestservices.com/api/check-headers?url=...` |
| Find Pentest Providers | Search | No | `GET https://pentestcompare.com/data/providers.json` |
| Request a Penetration Test | Action | Agent key | `POST https://penetrationtestservices.com/api/agent/request` |

## Connect an account

Zapier asks for one connection per integration, so the connection form has one field, "Agent key". The field is optional.

- Leave it empty to use Check Security Headers and Find Pentest Providers.
- Enter an agent key to use Request a Penetration Test.

Register a free agent key with a POST request to `https://penetrationtestservices.com/agent/auth` and the body `{"agent_name": "your name"}`. The key starts with `exl_agent_`. Revoke it with `DELETE https://penetrationtestservices.com/agent/auth` and the same bearer key.

## Check Security Headers

Reads the HTTP response headers of a public page and returns a pass, warn or fail result for each check, plus the counts and the names of the failed checks. The service allows 12 checks per minute per IP address. Check only sites you own or may test. The action reads headers and is not a penetration test.

## Find Pentest Providers

Searches the sourced provider list that pentestcompare.com publishes as open data (CC BY 4.0).

Filters:

- Delivery: automated, human-led or hybrid.
- Scope: web_app, api, cloud, network, mobile or ai_apps. Only providers whose value is "yes" match.
- Published price only: keeps providers that publish at least one price.
- Maximum results: 1 to 100, default 10.

Every result has `last_checked` (the date the provider's facts were checked) and `checked_date` (the latest check date in the data). Excession Labs publishes the data and has one row in it. That row has `publisher_owned` set to `true` and a `publisher_note`. The list is not ranked. Results keep the order of the source file.

## Request a Penetration Test

Sends a test request to Excession Labs for a person who asked for it. Excession Labs replies to that person by email. Testing starts only after a written scope and written authorization from the system owner.

The action needs two inputs set to Yes by you:

- `person_consent`: the person asked you to send the request and agreed that Excession Labs may email them.
- `authorized`: the person owns the targets or is allowed to arrange a test of them.

If either input is not true, the action stops before it sends anything. The service allows 5 requests a day per key and 3 a day per email address. Do not put passwords, keys or tokens in the notes or targets.

## Develop and test

```sh
npm install
npm test            # zapier-platform test (runs jest, then validates the app)
npm run jest        # jest only
LIVE_REQUEST=1 npm run jest   # also sends one real test request (counts against the daily limits)
```

The tests call the live public services. Each run registers a temporary agent key and revokes it at the end. The success path of the request action uses a recorded answer, so a normal run creates no request. The live request test uses an `@example.com` address, which the service stores as test data.

## Publish

```sh
npx zapier-platform login
npx zapier-platform register "Excession Labs Security"
npx zapier-platform push
```

`LISTING.md` has the text for the listing fields.

## License

MIT. See `LICENSE`.
