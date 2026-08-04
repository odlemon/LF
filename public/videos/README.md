# Hero video assets

Optimized bundle for the landing hero background.

| File | Purpose | Spec |
|---|---|---|
| `golden-hour-poster.jpg` | Instant first paint | First frame, ~1200px |
| `golden-hour-mobile.webm` | Mobile | 1280×720 VP9 |
| `golden-hour-desktop.webm` | Desktop WebM | 1920×1080 VP9 |
| `golden-hour-desktop.mp4` | Desktop MP4 (Safari HW decode) | 1920×1080 H.264, faststart |
| `golden-hour-retina.webm` | Retina / 2x displays | 2560×1440 VP9 |

Source: `GOLDEN HOUR.webm`

All variants are trimmed to **50.65 s** to remove the ~1.8 s black tail at the end of the source file (seamless loop).

The hero autoplays muted, uses dual-buffer playback in `HeroVideo.tsx` (no native `loop` — avoids decoder flash), and responsive `<source media="...">` selection.

## Re-encode (ffmpeg)

```bash
ffmpeg -i "GOLDEN HOUR.webm" -ss 0 -vframes 1 -q:v 2 public/videos/golden-hour-poster.jpg
ffmpeg -i "GOLDEN HOUR.webm" -vf scale=1280:-2 -c:v libvpx-vp9 -crf 32 -b:v 0 -an public/videos/golden-hour-mobile.webm
ffmpeg -i "GOLDEN HOUR.webm" -c:v libvpx-vp9 -crf 28 -b:v 0 -an public/videos/golden-hour-desktop.webm
ffmpeg -i "GOLDEN HOUR.webm" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -an public/videos/golden-hour-desktop.mp4
ffmpeg -i "GOLDEN HOUR.webm" -vf scale=2560:-2 -c:v libvpx-vp9 -crf 26 -b:v 0 -an public/videos/golden-hour-retina.webm
```
