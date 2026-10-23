# Explore human anatomy before choosing a study route

The local atlas is a general anatomy explorer for medical students. Users choose what to see, manipulate the model, and consult a structure. Heart anatomy remains an optional study route, not the default product or initial selection. Spanish is the interface language; original atlas names and identifiers remain unchanged.

## Quick path

1. Search for a body part or choose a common part or anatomical group.
2. Inspect it in the viewer; use **Ver alrededor** for context and **Mostrar todo** to start again.
3. Select a structure, choose **Explicación completa**, or use **Preguntar al tutor** for explanations, visual requests, and recall practice with source links.

**Cómo usar el atlas** reopens the three-step guide. **Opciones del modelo** contains camera views, automatic rotation, and separation controls.

## Interaction decisions

| Area | Decision |
| --- | --- |
| Initial state | All 14 internal atlas groups, no organ preselection, no isolation. The body surface is initially hidden so internal structures remain visible. All 15 source categories, including the surface, are available through system navigation. |
| Picker | Prominent Spanish search, common body parts spanning multiple systems, named system choices, and direct access to the tutor. Technical mesh counts are omitted from learner navigation. |
| Small screens | Native part and system selectors keep the model close to the main choice. Fragment links connect the picker, model, and structure reference. |
| Layout | A 280px desktop picker and a generous viewer. The reference follows the viewer; controls occupy normal document flow rather than overlays. Smaller screens use one column. |
| Selection | Choose a part to inspect it alone, inspect surrounding anatomy, clear the selection, or restore the initial body view. Choosing a system clears selection and isolation from the previous group. |
| Complexity | Advanced rendering options, attribution, limitations, and the optional course use native disclosures. Technical source identifiers are omitted from the primary learning experience. |
| Search | Reviewed Spanish results are filtered before the 80-result cap. Accent-insensitive aliases, original names, and source IDs remain searchable. Unreviewed English names require an explicit catalog opt-in. |
| Translation | Curated names cover common choices and the existing heart route. Unsupported picked structures use an honest untranslated-label notice; their original names are available in source metadata. |
| Study | Existing four-step heart lessons and deterministic practice are accessible only through **Recorridos de estudio**. No unavailable course buttons or invented mastery scores. |
| Agent tools | Preserve original WebMCP tools and IDs. The local Responses backend validates catalog searches and visual actions; the browser acknowledges actual execution before the tutor continues. Cancellation and manual changes guard against late actions. |

## Content boundaries

A structure can have a specific existing explanation or a general system description. General descriptions are explicitly labeled as system context; they are not presented as detailed teaching material for every individual mesh.

The model represents one adult male body from BodyParts3D and omits structures and normal variation. BodyParts3D geometry is attributed under CC BY 4.0. A cavity mesh, wall, or group of parts must not be confused with a complete organ.

The optional heart route contains brief original summaries linked to OpenStax, Rice University, Anatomy and Physiology 2e: [19.1 Heart Anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy) and [19.3 Cardiac Cycle](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-3-cardiac-cycle), CC BY-NC-SA 4.0. This remains a noncommercial local prototype without curricular validation. No PDFs or figures have been ingested. Practice responses are session-only observations, not medical competence assessments.

## Verification

- Initial explorer state does not preselect or isolate the heart.
- System navigation clears stale isolated selections without mutating the previous state.
- Common brain, lung, liver, kidney, skull, and femur choices resolve to original atlas concepts and real geometry.
- Reviewed search cannot lose a valid result behind unreviewed results before the cap.
- Existing heart labels, lesson references, practice behavior, Spanish/source search, and camera-fit regressions remain covered.
- TypeScript, all Node tests, interaction/data validators, and production build are checked.
- Browser review evaluates common-part selection, system navigation, contextual display, restoration, Spanish search, and narrow viewport layout.

## Next boundary

Broader reviewed translations and curriculum review can build on the general explorer. The connected tutor uses validated concepts, scoped web search, real citation annotations, and optional native PDF input. Provider responses require a configured server credential; failures remain visible and are never replaced with simulated answers. See [tutor-integration.md](tutor-integration.md).
