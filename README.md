# Excel Shogbola, portfolio

Cinematic dark portfolio for Excel Shogbola (DaStrings). Next.js App Router, TypeScript and Tailwind CSS 4.

- Live GitHub repositories and contribution graph for `Next-ofkin`
- Contact form that emails `exceldistrings@gmail.com` through Resend
- Hero with six plucked strings that respond to the pointer or a tap

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

## Where things are

- `components/Hero.tsx` and `components/Strings.tsx`: the hero and the string simulation. With reduced motion switched on the strings stay still.
- `components/ProjectVisual.tsx`: one SVG scene per project.
- `lib/github.ts` and `lib/github-parse.ts`: repository list and contribution data. Contributions try the GraphQL API (with a token), then a public mirror, then GitHub's own contributions page.
- `app/api/contact/route.ts`: validation, honeypot, time check, per-IP rate limit and the Resend call.
- `app/globals.css`: colors, fonts, grain and motion.
- `app/opengraph-image.tsx`: the preview image shown when the link is shared.

Data is cached for hours with `"use cache"`, so GitHub changes show up within a few hours without a redeploy.
