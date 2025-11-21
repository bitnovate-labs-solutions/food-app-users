# Font Usage Guide

## Quick Start

1. **Add your font files** to `src/assets/fonts/[FontFamilyName]/`
2. **Uncomment and update** the `@font-face` declarations in `src/assets/fonts/fonts.css`
3. **Add the font family** to `src/index.css` in the `@theme` section
4. **Use in components** with Tailwind classes

## Step-by-Step Example

### Step 1: Organize Font Files

```
src/assets/fonts/
└── Inter/
    ├── Inter-Regular.woff2
    ├── Inter-Medium.woff2
    ├── Inter-SemiBold.woff2
    └── Inter-Bold.woff2
```

### Step 2: Define @font-face in fonts.css

```css
@font-face {
  font-family: 'Inter';
  src: url('./Inter/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('./Inter/Inter-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('./Inter/Inter-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('./Inter/Inter-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### Step 3: Add to Tailwind Theme (index.css)

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  /* Or create a custom font family */
  --font-display: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
```

### Step 4: Use in Components

#### Option A: Use as Default Sans Font
```jsx
// Automatically applied to all text (if set as --font-sans)
<div className="text-lg">This uses Inter font</div>
```

#### Option B: Use Custom Font Family (if defined)
```jsx
// If you defined --font-display
<div className="font-display text-2xl">Display text</div>
```

#### Option C: Direct Font Family (Tailwind v4)
```jsx
// Using arbitrary values
<div className="font-['Inter'] text-xl">Custom font</div>
```

## Font Weight Classes

Use Tailwind's font-weight utilities:

```jsx
<div className="font-normal">Regular (400)</div>
<div className="font-medium">Medium (500)</div>
<div className="font-semibold">SemiBold (600)</div>
<div className="font-bold">Bold (700)</div>
```

## Multiple Font Families

If you have multiple font families (e.g., one for body, one for headings):

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Poppins', ui-sans-serif, system-ui, sans-serif;
}
```

Then use:
```jsx
<body className="font-sans">  {/* Uses Inter */}
<h1 className="font-display">  {/* Uses Poppins */}
```

## Troubleshooting

### Fonts not loading?
- Check file paths in `@font-face` declarations
- Ensure font files are in the correct folder
- Check browser console for 404 errors

### Fonts not applying?
- Verify the font family name matches in `@font-face` and `@theme`
- Clear browser cache
- Check that `fonts.css` is imported in `index.css`

### Font weights not working?
- Ensure you've defined `@font-face` for each weight you want to use
- Check that the `font-weight` value in `@font-face` matches the weight you're trying to use

