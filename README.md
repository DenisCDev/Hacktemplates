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
- [ ] Grotto — cave waterfall, light shafts
- [ ] Meadow — handheld console in a flower field
- [ ] Pocket — 3D retro handheld
- [ ] Ukiyo — pagoda light pillars, water reflection
- [x] Aura — soft orange orb, light theme
- [x] Solstice — giant sun, tiny figure
- [x] Beam — red light beam, lone figure
- [ ] Fluted — reeded glass refraction
- [ ] Glitch — chromatic visor glitch
- [ ] Ruins — fantasy ruins above the clouds
- [ ] Red Dragon — fire dragon
- [ ] Desert Dragon — dragon against the sun
- [ ] Ink Dragon — ink-wash dragon
- [ ] Smoke Dragon — dragon dissolving into smoke
- [ ] Pixel Sword — pixel-art sword in the forest
- [ ] Ash King — crowned king, storm sky
- [ ] Redwood — sunlit redwoods, drifting mist (D1)
- [ ] Silk — sculpted white ribbon, orange glow (D2)
- [ ] Stratosphere — night blue to dawn horizon (D3)
- [ ] Spectrum — rainbow wash, smoked glass waves (D4)
- [ ] Thermal — flowing heat bands (D5)
- [ ] Canyon Violet — layered violet ridges (D6)
- [ ] Glacier — cracked blue ice (D7)
- [ ] Fuji — mountain, cloud band, night lake (D8)
- [ ] Canyon Magenta — layered magenta ridges (D9)
- [ ] Static — grainy orange/teal gradient (D10)
- [ ] Tidewave — bold red/blue/gold waves (D11)
- [ ] Reed Rose — pink/lavender reeded glass (D12)
- [ ] Reed Crimson — red reeded glass (D13)
- [ ] Sandstorm — swept amber smoke (D14)
- [ ] Reed Ember — orange band behind reeded glass (D15)
- [ ] Riptide — grainy navy wave (D16)
- [ ] Canyon Blue — layered blue ridges (D17)
- [ ] Evergreen — misty pine forest (D18)
- [ ] Twilight — violet to peach sky (D19)
- [ ] Reed Spectrum — teal/red/orange reeded glass (D20)
- [ ] Reed Flame — red/orange crossing light, reeded (D21)
- [ ] Sunset Ridge — orange sun behind dark peaks (D22)
- [ ] Aurora — northern lights over a mirror lake (D23)
- [ ] Stipple — dithered neon hills (D24)
