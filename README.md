# Ground Truth

One topic. Five perspectives. No algorithm.

## What it does

You type a news topic — anything current. You get five substantive editorial takes on it, each written from a distinct ideological lens: Left, Center-Left, Center, Center-Right, and Right.

No accounts. No feed. No history. No ads. Just the topic and the perspectives.

## How it works

Each perspective includes:
- **Headline** — written from that ideology's point of view
- **Tagline** — one sentence capturing the core framing
- **Body** — 3–4 sentences that read like a real editorial, not a caricature
- **Key values** — what that ideology prioritizes on this specific topic

Perspectives are generated live by the [xAI Grok API](https://x.ai). They are AI-generated framings, not news summaries or citations.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [xAI Grok API](https://x.ai)
- Deployed on [Vercel](https://vercel.com)

## Running locally

```bash
npm install
```

Create a `.env.local` file:

```
XAI_API_KEY=your_xai_api_key_here
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

MIT
