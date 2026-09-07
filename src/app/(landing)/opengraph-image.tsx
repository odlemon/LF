import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The card that represents Lysp everywhere a link to it is pasted — Slack, LinkedIn, iMessage,
 * a partner forwarding it to a colleague. It is often the only thing someone sees before
 * deciding whether to click, so it is built rather than left to whatever the crawler scrapes
 * off the page.
 *
 * Generated from the same Empire State Building frame the site's hero video opens on, so the
 * card and the page a visitor lands on are visibly the same product. Reusing that asset also
 * means no new licence and no second image to keep in sync.
 */
export const alt = "Lysp — pricing intelligence for elite law firms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TITLE = "Pricing intelligence for elite law firms";
const BODY =
  "The firms that win the most work price it better than anyone else. Lysp is how they do it.";

/**
 * Quicksand is the site's typeface, so the card should use it too.
 *
 * Google's font CSS serves woff2 to a modern browser, which Satori cannot parse — hence the
 * deliberately ancient user agent, which makes it hand back TrueType instead. Wrapped in a
 * try/catch because a social card is not worth failing a deploy over: if the network is
 * unavailable at build time, the card renders in the bundled fallback face instead.
 */
async function quicksand(weight: 500 | 700) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Quicksand:wght@${weight}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:2.0) Gecko/20100101" } },
    ).then((r) => r.text());

    const url = css.match(/src:\s*url\((.+?)\)\s*format\('truetype'\)/)?.[1];
    if (!url) return null;

    return {
      name: "Quicksand",
      data: await fetch(url).then((r) => r.arrayBuffer()),
      weight,
      style: "normal" as const,
    };
  } catch {
    return null;
  }
}

export default async function Image() {
  const [photo, medium, bold] = await Promise.all([
    readFile(path.join(process.cwd(), "public/videos/golden-hour-poster.jpg")),
    quicksand(500),
    quicksand(700),
  ]);

  // Satori has no Buffer; a data URI is the reliable way to hand it a local image.
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const fonts = [bold, medium].filter((f) => f !== null);
  const face = fonts.length ? "Quicksand" : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          ...(face ? { fontFamily: face } : {}),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />

        {/*
          Darkened from the left only. The tower sits right of centre in this frame, so a flat
          scrim would bury the one thing that makes the card recognisable at thumbnail size.
          Written as explicit top/left/width/height rather than `inset: 0` — Satori implements
          a subset of CSS and silently skips the shorthand, which renders the scrim as nothing
          at all and leaves white text sitting on a bright orange sky.
        */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            backgroundImage:
              "linear-gradient(105deg, rgba(3,6,14,0.94) 0%, rgba(3,6,14,0.90) 30%," +
              " rgba(3,6,14,0.74) 46%, rgba(3,6,14,0.34) 62%, rgba(3,6,14,0.10) 80%," +
              " rgba(3,6,14,0.30) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            padding: "62px 68px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                fontSize: 27,
                fontWeight: 700,
                letterSpacing: 7,
                color: "#ffffff",
              }}
            >
              LYSP
            </div>
            <div
              style={{
                width: 46,
                height: 2,
                marginLeft: 20,
                backgroundColor: "rgba(255,255,255,0.42)",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 566 }}>
            <div
              style={{
                fontSize: 54,
                fontWeight: 700,
                lineHeight: 1.10,
                letterSpacing: -0.9,
                color: "#ffffff",
              }}
            >
              {TITLE}
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 25,
                fontWeight: 500,
                lineHeight: 1.48,
                color: "rgba(255,255,255,0.80)",
              }}
            >
              {BODY}
            </div>
            <div
              style={{
                marginTop: 34,
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: 1.4,
                color: "rgba(255,255,255,0.56)",
              }}
            >
              lysp.ai
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
