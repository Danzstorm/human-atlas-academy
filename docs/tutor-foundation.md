# Anatomy tutor: first learning session

The general anatomy explorer now includes a local OpenAI tutor, with server-side credentials, cited web retrieval, confirmed visual actions, and optional learner-provided PDFs. See [tutor-integration.md](tutor-integration.md) for the implemented boundary and verification. The historical source catalog below remains reference research, not ingested content.

## First slice

Start with the whole body. A student chooses any structure or asks a question; the tutor searches actual atlas concepts, requests a visual selection, explains anatomical relationships, and can ask recall questions. Heart anatomy remains an optional guided route.

Success requires:

- The explanation cites an identifiable source section.
- Tool arguments resolve to real atlas concept IDs.
- Visual actions report success before the tutor claims a structure was selected.
- A student can interrupt the lesson with a question or return to exploration.
- Identification answers are checked against the target concept and its mesh membership.
- Results record evidence such as an attempt and its outcome, without inventing a mastery percentage.

## Proposed boundaries

| Boundary | Responsibility |
| --- | --- |
| Atlas adapter | Search concepts, select structures, expose current visual context. Reuse `app/agent-tools.ts` and `SceneState` in `app/anatomy.ts`. |
| Learning session | Track the current objective and the explain, identify, feedback, and complete stages. |
| Tutor backend | Keep the provider API key on the server, assemble context, and coordinate tool calls. |
| Source catalog | Track source URL, edition, section, authorship, license, and ingestion eligibility. |
| Tutor interface | Present conversation, citations, current task, and confirmed visual actions. |

Keep the model choice configurable and start with one model. Introduce model routing only after measuring explanation quality, tool accuracy, latency, and cost.

## Routing decisions

Page navigation and the learning session are separate concerns. A page route identifies a workspace or session; learning state identifies the student's current task.

Explicit UI actions can execute locally. Free-form requests require interpretation: a message may contain both a visual command and an educational question.

The backend should expose only tools appropriate for the current learning stage. The application validates tool names, arguments, and atlas IDs before execution and sends the execution result back to the tutor. Changing the selected structure while a response is pending must not silently change what that response refers to.

## Initial source catalog

Sources were checked on 2026-10-12. Public access does not by itself grant permission to ingest or redistribute a work.

| Source | Intended use | Reuse status |
| --- | --- | --- |
| [OpenStax Anatomy and Physiology 2e](https://openstax.org/books/anatomy-and-physiology-2e/pages/preface) | Foundational reading, available in web and PDF formats. Supplement with material appropriate to the student's medical curriculum. | Preface states CC BY-NC-SA 4.0. Do not assume this covers a commercial service. |
| [OpenStax 2e, 19.1 Heart Anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy) | Candidate section for the first heart lesson. | Same edition restrictions; store exact section provenance. |
| [OpenStax Anatomy and Physiology, first edition](https://openstax.org/books/anatomy-and-physiology/pages/preface) | Alternative foundational source. | The preface states CC BY 4.0, but the current page footer mentions NC-SA. Verify the license of the exact downloadable edition before ingestion. |
| [NCBI Bookshelf: Anatomy, Thorax, Heart and Pericardial Cavity](https://www.ncbi.nlm.nih.gov/books/NBK482452/) | Candidate supplementary medical reference. | Search result reports CC BY-NC-ND; direct access returned a CAPTCHA. Reference candidate only, not approved for ingestion. |

No source text or PDF has been downloaded, embedded, or bundled with this repository. The catalog contains reference links and verified access or license observations.

## Optional PDF input and future ingestion

The chat accepts one validated PDF up to 5 MB per conversation. Before submission, the learner is told it will be sent to OpenAI and can remove it. The server retains the attachment only in the bounded local session and sends it as native `input_file`; no PDF is written to disk or made publicly accessible. Follow-up questions retain that material until the conversation is reset or expires. This is not a searchable repository of course books.

For each permitted document, retain the source URL, exact edition, license, document hash, page or section, and original text alongside searchable chunks. Citations must link to the retrieved section rather than a generic book homepage. User course material remains scoped to that user.

Anatomical entity matching must distinguish a named concept from an individual mesh. Unmatched or ambiguous names require a visible fallback; the tutor must not invent an atlas structure.

## Integration prerequisite

The Vite development server exposes the implemented local tutor endpoint. Set a nonempty `OPENAI_API_KEY` and the desired `OPENAI_MODEL` in repository-root `.env.local`; the model defaults to `gpt-4.1-mini`. Credentials never enter Vite client variables. Authentication, persistent progress, voice, and production hosting remain outside this local prototype. A static production build does not include the tutor backend.

## Local preview

Run `npm ci` once, then `npm run dev -- --host 127.0.0.1`. The default development port is 3016. The existing atlas runs independently of tutor credentials.
