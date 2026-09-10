/**
 * Matter learnings arrive in two shapes and the screen has to read both.
 *
 * A person recording one writes a paragraph. The negotiation advisor, capturing one when a
 * negotiation closes, writes a short report under known headings — what happened, how the client
 * behaved, what to remember next time. Rendered as one undifferentiated block the second kind is
 * a wall of text, and the section a partner actually wants ("what to remember") is buried in the
 * middle of a fee narrative.
 *
 * So: split on the headings when they are there, and treat the whole thing as one unlabelled
 * section when they are not.
 */

export interface LessonSection {
  /** Null for prose that arrived without a heading. */
  heading: string | null;
  body: string;
}

/**
 * The headings the negotiation advisor writes. Matched case-insensitively on a line of its own,
 * which is what keeps a sentence that happens to mention an outcome from being read as a heading.
 */
const KNOWN_HEADINGS = [
  "what happened",
  "client behaviour",
  "client behavior",
  "outcome",
  "what to remember",
  "recommended opening for next matter",
  "recommended opening",
];

/** The section worth showing first in a list: the lesson, not the narrative around it. */
const PREFERRED_PREVIEW = ["what to remember", "outcome"];

function headingOf(line: string): string | null {
  const cleaned = line.trim().replace(/[:*#]+$/g, "").replace(/^[*#\s]+/, "").trim();
  if (!cleaned || cleaned.length > 60) return null;
  const match = KNOWN_HEADINGS.find((h) => h === cleaned.toLowerCase());
  return match ? cleaned : null;
}

export function parseLesson(text: string | null | undefined): LessonSection[] {
  const raw = (text ?? "").trim();
  if (!raw) return [];

  const sections: LessonSection[] = [];
  let current: LessonSection = { heading: null, body: "" };

  for (const line of raw.split("\n")) {
    const heading = headingOf(line);
    if (heading) {
      if (current.body.trim()) sections.push({ ...current, body: current.body.trim() });
      current = { heading, body: "" };
    } else {
      current.body += line + "\n";
    }
  }
  if (current.body.trim()) sections.push({ ...current, body: current.body.trim() });

  return sections.length ? sections : [{ heading: null, body: raw }];
}

/**
 * One line for the list. Prefers the section that states the lesson over the one that recounts
 * the deal, because a list of fee narratives all look the same at a glance.
 */
export function lessonPreview(text: string | null | undefined): string {
  const sections = parseLesson(text);
  if (!sections.length) return "";

  for (const wanted of PREFERRED_PREVIEW) {
    const found = sections.find((s) => s.heading?.toLowerCase() === wanted);
    if (found) return found.body.replace(/\s+/g, " ").trim();
  }
  return sections[0].body.replace(/\s+/g, " ").trim();
}

/** True when the body carries the advisor's headings, so the card can say where it came from. */
export function isStructured(text: string | null | undefined): boolean {
  return parseLesson(text).some((s) => s.heading !== null);
}

/** Everything a search box should look inside. */
export function searchableText(learning: {
  title?: string | null;
  learningText?: string | null;
  matterReference?: string | null;
}): string {
  return [learning.title, learning.learningText, learning.matterReference]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
