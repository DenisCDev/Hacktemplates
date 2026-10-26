# Hero templates

Free, self-contained, zero-build landing page heroes with motion backgrounds — shaders, WebGL, CSS motion.
Open `index.html` for the gallery.

## Use one

Every template lives in `templates/<slug>/`:

| file | what it is |
| --- | --- |
| `index.html` | full typographic hero (nav, headline, CTAs) — copy, change the words, ship |
| `bg.html` | the motion background only, no text |
| `bg.js` | the background itself — drop it into any project |

Background only, in your own page:

```html
<section style="position:relative; min-height:100vh">
  <canvas data-bg style="position:absolute; inset:0; width:100%; height:100%"></canvas>
  <!-- your content -->
</section>
<script src="bg.js"></script>
```

No `<canvas data-bg>` on the page? `bg.js` creates a fixed full-screen one behind everything.
Backgrounds pause when off-screen, respect `prefers-reduced-motion`, and fall back to a CSS gradient without WebGL.

## Run locally

Templates that load image textures need a server (browsers block textures from `file://`):

```bash
python -m http.server 5173
```

## Templates

- [x] Aurora Horizon — teal/coral drifting horizon
- [x] Ultraviolet — grainy violet diagonal band
- [x] Eclipse — dark disc, bone halo, orbit rings
- [x] Ember — warm-to-ice flowing gradient, event hero
- [x] Bokeh — drifting light blobs, AI prompt hero
- [x] Prism — neon RGB swirl, agency hero
- [x] Nimbus — wind-blown clouds, devtool hero
- [x] Daybreak — sunrise dome, waitlist hero
- [x] Abyss — underwater ripples, data hero
- [x] Dusk — evening sky, portfolio hero
- [ ] Orbit — astronaut over Earth
- [ ] Nightwalk — stars, billowing clouds, lone walker
- [ ] Commute — anime train window, passing fields
- [ ] Phantom — red face dissolving into particles
- [x] Grotto — cave waterfall, light shafts
- [x] Meadow — handheld console in a flower field
- [x] Pocket — 3D retro handheld
- [x] Ukiyo — pagoda light pillars, water reflection
- [x] Aura — soft orange orb, light theme
- [x] Solstice — giant sun, tiny figure
- [x] Beam — red light beam, lone figure
- [x] Fluted — reeded glass refraction
- [x] Glitch — chromatic visor glitch
- [x] Ruins — fantasy ruins above the clouds
- [x] Red Dragon — fire dragon
- [x] Desert Dragon — dragon against the sun
- [x] Ink Dragon — ink-wash dragon
- [x] Smoke Dragon — dragon dissolving into smoke
- [x] Pixel Sword — pixel-art sword in the forest
- [x] Ash King — crowned king, storm sky
- [x] Redwood — sunlit redwoods, drifting mist (D1)
- [x] Silk — sculpted white ribbon, orange glow (D2)
- [x] Stratosphere — night blue to dawn horizon (D3)
- [x] Spectrum — rainbow wash, smoked glass waves (D4)
- [x] Thermal — flowing heat bands (D5)
- [x] Canyon Violet — layered violet ridges (D6)
- [ ] Glacier — cracked blue ice (D7) — source is a watermarked stock preview; needs a free/licensed ice photo
- [x] Fuji — mountain, cloud band, night lake (D8)
- [x] Canyon Magenta — layered magenta ridges (D9)
- [x] Static — grainy orange/teal gradient (D10)
- [x] Tidewave — bold red/blue/gold waves (D11)
- [x] Reed Rose — pink/lavender reeded glass (D12)
- [x] Reed Crimson — red reeded glass (D13)
- [x] Sandstorm — swept amber smoke (D14)
- [x] Reed Ember — orange band behind reeded glass (D15)
- [x] Riptide — grainy navy wave (D16)
- [x] Canyon Blue — layered blue ridges (D17)
- [x] Evergreen — misty pine forest (D18)
- [x] Twilight — violet to peach sky (D19)
- [x] Reed Spectrum — teal/red/orange reeded glass (D20)
- [x] Reed Flame — red/orange crossing light, reeded (D21)
- [x] Sunset Ridge — orange sun behind dark peaks (D22)
- [x] Aurora — northern lights over a mirror lake (D23)
- [x] Stipple — dithered neon hills (D24)

### Batch 3 — full-motion heroes (each built to its own effect)
- [x] Currents — chrome sphere in op-art streamlines (real potential flow, ray-traced reflections; after Robert Beatty's cover for Tame Impala)
- [x] Furnace — molten fluted bars (orange light through reeded glass)
- [ ] Starmind — hand in a beam of dust (poster by Dogan Ural)
- [ ] Signal — glitch-glyph portrait (style ref: "One Flair Design", watermarked AI image, so the effect is rebuilt, not the image)
- [ ] Savanna — acacia sunset illustration
- [ ] Sentinel — spartan against the sun, poppy field
- [ ] Fold — orange/violet silk folds on white (from the motion clip)
