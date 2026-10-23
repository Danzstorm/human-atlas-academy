# Learn anatomy with the connected tutor

The local explorer remains the default full-body view. A server-side OpenAI Responses integration answers anatomy questions, retrieves educational references, and requests validated visual actions that the browser confirms before the model continues.

## Implementation tasks

- [x] Validate local requests, bounded sessions, PDFs, and catalog IDs with executable tests.
- [x] Implement server-owned conversation and the tool acknowledgement loop.
- [x] Connect readable Spanish chat, sources, cancellation, retry, and optional PDFs.
- [x] Verify tests, types, atlas validators, and build.
- [ ] Verify a public live-provider prompt after a nonempty API credential is configured.

## Boundaries

Credentials are loaded only by Vite server code. Conversations live in bounded process memory for 30 minutes; resetting deletes them. PDF input is optional (5 MB), sent to OpenAI only when the learner submits it, and retained only in the current conversation. Sources come from provider annotations, never invented static links. Search is restricted to OpenStax and NCBI. This local prototype provides anatomy education, not personal diagnosis; production deployment would need its own authenticated backend.

## Run and verify

Run `npm run dev`, then open `http://127.0.0.1:3016`. Configure repository-root `.env.local` with `OPENAI_API_KEY` and `OPENAI_MODEL`; the existing model choice is preserved, with `gpt-4.1-mini` as fallback. Reload the browser after saving the credential. `/api/tutor/status` reports only whether the credential is configured, not whether OpenAI accepted it.

`node --test scripts/*.test.mjs`, `npm run check`, both atlas/interaction validators, and `npm run build` verify local contracts. The public live smoke on 2026-10-12 stopped before provider access because the parsed API key was empty; no successful provider response is claimed. Static builds retain the explorer UI but require a separate backend to host the tutor.

The server retains the last 20 completed turns and one PDF per conversation, with up to 50 sessions, 10 new questions per minute per session, 3 active requests, and 6 tool rounds per turn. These bounds limit accidental usage for a private local prototype; they are not a production authentication or abuse prevention system.
