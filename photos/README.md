# Site photos: how to swap one

Every photo on the website lives in this folder. To change a photo, upload a new file with **exactly the same name**. Nothing else needs to change.

| File | Where it shows | Best shape / size |
|---|---|---|
| `hero-desktop.jpg` | Big top photo on computers, sideways tablets and sideways phones | Landscape, about 3:2, 2000 × 1300 px. The left side fades behind the headline, so keep the person **right of center**. |
| `hero-mobile.jpg` | Big top photo on phones and upright tablets | Portrait, 3:4, about 1200 × 1600 px. Keep the face in the **upper third**; the bottom fades out. |
| `about.jpg` | "Hi, I'm Stephanie" (arched frame) | Portrait, 4:5, about 1400 × 1750 px |
| `extras.jpg` | "Going above and beyond" (soft oval) | Landscape, 4:3, about 2000 × 1500 px. The edges fade, so center the subject. |
| `home.jpg` | "Care that feels like family" | Square, about 1000 × 1000 px |
| `policies.jpg` | Next to "Policies" (hidden on phones) | Portrait, 4:5, about 1200 × 1500 px |
| `contact.jpg` | Next to the contact form (hidden on phones) | Portrait, 4:5, about 1200 × 1500 px |
| `share-image.jpg` | Preview picture when the link is shared in texts and social media | Exactly 1200 × 630 px |

**Tips**
- Use JPEG, sRGB, with the long edge around 2000 px. Keep files under about 500 KB (export quality around 80).
- The soft fades and warm overlay come from the site's CSS, so they apply to new photos automatically. The current photos also have a light warm edit baked in (slightly warmer, a bit less saturated). Give new photos a similar edit so they match.
- Only use photos of children with a signed release from their parents.

## Replacing a photo on GitHub (in the browser)

1. Open the repository on github.com and click the **photos** folder.
2. Click **Add file → Upload files**.
3. Drag in your new photo, **renamed to the same name** as the one you're replacing (for example `about.jpg`).
4. Click **Commit changes**. GitHub replaces the old file.
5. Wait a minute or two for the site to update. If you still see the old photo, hard-refresh the page (Ctrl+Shift+R or Cmd+Shift+R).

## If a new photo crops badly (a head is cut off, etc.)

Open `assets/css/styles.css`. Near the top is a block named **PHOTO FOCAL POINTS**:

```css
--focus-about: 50% 30%;
```

The two numbers are left-to-right and top-to-bottom: `50% 0%` keeps the top of the photo, `50% 100%` keeps the bottom, and `0% 50%` keeps the left side.
Click the pencil icon to edit the file on GitHub, change the number, and commit.
For the desktop hero, `--zoom-hero-desktop` controls how wide the photo is drawn: `100%` is no zoom, and the current `118%` pushes the person further right.
`--focus-hero-stacked` sets the crop of `hero-desktop.jpg` on small phones turned sideways, where the photo sits above the text. `--focus-hero-short` sets its crop on bigger phones turned sideways (short, wide screens); a lower second number leaves more room above her head so it clears the header.
