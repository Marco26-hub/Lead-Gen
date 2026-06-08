# /public/assets

The site ships **asset-free**: the cinematic hero and the "Chaos → Order"
sequence are generated live in WebGL / canvas, so there are no large video or
image-sequence files to manage. If you'd rather use real footage, drop it here
and wire it in:

## 1. Cinematic hero video (optional)

Add a looping clip as `hero.mp4` (and ideally `hero.webm`), then in
`src/components/hero/Hero.tsx` place a `<video>` behind the content, in front of
— or instead of — `<CinematicBackground />`:

```tsx
<video
  className="absolute inset-0 h-full w-full object-cover"
  autoPlay
  muted
  loop
  playsInline
  poster="/assets/hero-poster.jpg"
>
  <source src="/assets/hero.webm" type="video/webm" />
  <source src="/assets/hero.mp4" type="video/mp4" />
</video>
```

Keep the gradient/`grain` overlays for legibility.

## 2. Real frame sequence for "Chaos → Order" (optional)

`ChaosToOrder` currently renders the sequence procedurally and scrubs it by
scroll progress (`progress → frame index`). To drive it from a real image
sequence instead, export your video to frames:

```bash
# 15 fps, padded filenames → /public/assets/frames/frame-0001.webp …
ffmpeg -i source.mov -vf fps=15 public/assets/frames/frame-%04d.webp
```

Then preload `frames[Math.round(progress * (frames.length - 1))]` and draw the
current frame to the canvas each tick — the scroll-to-index mapping is already
in place.

## 3. Open Graph image (optional)

Add `og.jpg` (1200×630) and reference it from `openGraph.images` /
`twitter.images` in `src/app/layout.tsx`.
