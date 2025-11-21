## Font System Overview

This project uses a centralized font system so you can evaluate different font combinations from a single source of truth.

### Key Concepts

- Global CSS variables define the primary fonts for body text and headings.
- Utility classes (`font-body`, `font-heading`) apply those variables in React components.
- By updating one place (`src/index.css`), you can switch fonts across the entire UI.

### File Structure

```
src/
  assets/
    fonts/
      fonts.css        # @font-face declarations
  index.css            # Global font variables and utilities
```

### Adding Fonts

1. Place your `.woff`/`.woff2` files in `src/assets/fonts/`.
2. Declare them in `src/assets/fonts/fonts.css` using `@font-face`.
3. Update the variables in `src/index.css`:
   ```css
   :root {
     --app-font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
     --app-font-heading: "Poppins", ui-sans-serif, system-ui, sans-serif;
   }
   ```

### Using Fonts in Components

- Body text: `<div className="font-body">...</div>`
- Headings: `<h1 className="font-heading">...</h1>`
- Defaults: `body` uses `var(--app-font-body)` automatically, so most text inherits it without extra classes.

### Switching Fonts

- Edit the values of `--app-font-body` and `--app-font-heading` in `src/index.css`.
- Save and reload: the entire app updates instantly.

### Falling Back to System Fonts

To quickly revert to the original system fonts:

1. Open `src/index.css`
2. Comment out the custom font lines:
   ```css
   /* --app-font-body: "YouBlockhead", var(--app-font-system); */
   /* --app-font-heading: "YouBlockheadOpen", var(--app-font-system); */
   ```
3. Uncomment the system font lines:
   ```css
   --app-font-body: var(--app-font-system);
   --app-font-heading: var(--app-font-system);
   ```
4. Save and reload - the entire app will use system fonts.

**Note:** The system font stack (`--app-font-system`) is already defined and includes proper fallbacks for all platforms.

### Tips

- Keep fallbacks (e.g., `ui-sans-serif`) in the variable value to avoid flash-of-unstyled-text.
- If you need more variations (e.g., `font-display`, `font-accent`), add additional variables and utility classes in `index.css`.

