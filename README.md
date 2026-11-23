# Excel Shogbola, portfolio

Cinematic dark portfolio for Excel Shogbola (DaStrings). Next.js App Router, TypeScript and Tailwind CSS 4.

- Live GitHub repositories and contribution graph for `Next-ofkin`
- Contact form that emails `exceldistrings@gmail.com` through Resend
- Hero with six plucked strings that respond to the pointer or a tap
- Animated project scenes that play only while they are on screen
- Case-study pages at `/work/<slug>` with animated architecture diagrams
- A "Now building" ticker fed by live GitHub activity
- A Lab with a particle field you can push around, by pointer or with your hands through the webcam

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # production build
```

## Environment variables

Copy these into Vercel (Settings, Environment Variables) and into `.env.local` for local work.

| Name | Required | What it does |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Key from resend.com. Without it the contact form returns an error. |
| `CONTACT_TO` | No | Where messages go. Defaults to `exceldistrings@gmail.com`. |
| `CONTACT_FROM` | No | Sender address. Defaults to `Portfolio <onboarding@resend.dev>`. |
| `R2_ACCOUNT_ID` | For the signature wall | Cloudflare account ID. |
| `R2_ACCESS_KEY_ID` | For the signature wall | R2 API token access key (Object Read & Write on the bucket). |
| `R2_SECRET_ACCESS_KEY` | For the signature wall | R2 API token secret. |
| `R2_BUCKET` | For the signature wall | Bucket name, for example `portfolio-signatures`. |
| `SIGNATURE_SECRET` | No | Signs the review links in approval emails. Defaults to a key derived from `R2_SECRET_ACCESS_KEY`. |
| `SIGNATURE_PREFIX` | No | Folder inside the bucket. Defaults to `portfolio/signatures/`. |
| `GITHUB_TOKEN` | No | Read-only token. Lifts the GitHub API rate limit and gives the contribution graph an exact source. |

### Sender address

`onboarding@resend.dev` only delivers to the email address your Resend account was created with. Either create the Resend account with `exceldistrings@gmail.com`, or verify `dastrings.name.ng` in Resend (Domains) and set `CONTACT_FROM` to something like `Portfolio <hello@dastrings.name.ng>`.

## Deploy to portfolio.dastrings.name.ng

1. In Vercel, choose Add New, Project, and import `Next-ofkin/portfolio`. Use a separate project from DaStrings Studio.
2. Add the environment variables above, then deploy.
3. Open Settings, Domains, and add `portfolio.dastrings.name.ng`.
4. Vercel shows the DNS record to create, usually a CNAME named `portfolio` that points to `cname.vercel-dns.com`. Add exactly what Vercel shows, in the DNS settings for `dastrings.name.ng`.
5. Wait for the domain to show as valid. The HTTPS certificate is issued for you.

Send yourself a test message through the form once it is live.

## Edit the content

Every word and project on the page lives in `lib/content.ts`: profile links, About copy, the seven featured projects, skills and experience.

- Each project's `github` link currently points to the profile. Replace it with the repository URL, and add a `live` URL where there is one.
- Outcome lines are short paraphrases. Add real numbers (users, volume, time saved) once you are happy to publish them.

## Pages

Home (`/`), Work (`/work`), Lab (`/lab`), About (`/about`), Contact (`/contact`) and case studies (`/work/<slug>`).

## Signature wall

Visitors draw a signature on the Lab page. It is saved to R2 as pending and you get an email with a review link.
The link opens a page with Approve and Delete buttons (opening the link alone changes nothing, so email scanners can't
approve anything). Approved signatures float on the wall; the same link later lets you remove one. Without the R2
variables the wall shows "The wall opens soon."

## Case studies, ticker and Lab

- Case studies live in `lib/case-studies.ts`. A project gets a page when its entry in `lib/content.ts` has `caseStudy: true` and a matching slug in that file.
- The ticker mixes `nowBuilding` in `lib/content.ts` (keep those lines current) with live GitHub data. Only public repositories appear.
- The Lab's hand mode downloads MediaPipe from jsDelivr and its hand model from Google the first time a visitor presses "Use your hands". The video never leaves the browser.

## Where things are

- `components/Hero.tsx` and `components/Strings.tsx`: the hero and the string simulation. With reduced motion switched on the strings stay still.
- `components/ProjectVisual.tsx`: one animated SVG scene per project. `components/LiveSvg.tsx` runs a scene's clock only while it is on screen.
- `components/ParticleField.tsx` and `lib/hands.ts`: the Lab.
- `lib/github.ts` and `lib/github-parse.ts`: repository list and contribution data. Contributions try the GraphQL API (with a token), then a public mirror, then GitHub's own contributions page.
- `app/api/contact/route.ts`: validation, honeypot, time check, per-IP rate limit and the Resend call.
- `app/globals.css`: colors, fonts, grain and motion.
- `app/opengraph-image.tsx`: the preview image shown when the link is shared.

Data is cached for hours with `"use cache"`, so GitHub changes show up within a few hours without a redeploy.
