# Font Organization Guide

## Recommended Folder Structure

Organize your fonts by font family for better maintainability:

```
src/assets/fonts/
├── README.md (this file)
├── [FontFamilyName]/
│   ├── [FontFamilyName]-Regular.woff2
│   ├── [FontFamilyName]-Regular.woff
│   ├── [FontFamilyName]-Medium.woff2
│   ├── [FontFamilyName]-Medium.woff
│   ├── [FontFamilyName]-SemiBold.woff2
│   ├── [FontFamilyName]-SemiBold.woff
│   ├── [FontFamilyName]-Bold.woff2
│   ├── [FontFamilyName]-Bold.woff
│   └── ...
└── [AnotherFontFamily]/
    └── ...
```

## Example Structure

```
src/assets/fonts/
├── Inter/
│   ├── Inter-Regular.woff2
│   ├── Inter-Medium.woff2
│   ├── Inter-SemiBold.woff2
│   └── Inter-Bold.woff2
├── Poppins/
│   ├── Poppins-Regular.woff2
│   ├── Poppins-Medium.woff2
│   └── Poppins-Bold.woff2
└── CustomDisplay/
    ├── CustomDisplay-Regular.woff2
    └── CustomDisplay-Bold.woff2
```

## Font File Formats

**Recommended formats (in order of preference):**
1. **woff2** - Best compression, modern browsers (use this first)
2. **woff** - Good compression, wider browser support (fallback)
3. **ttf/otf** - Larger files, use only if woff2/woff not available

## Naming Convention

Use consistent naming:
- `[FontFamily]-[Weight].woff2`
- Examples: `Inter-Regular.woff2`, `Poppins-Bold.woff2`

## Font Weights

Common weights:
- **300** - Light
- **400** - Regular (normal)
- **500** - Medium
- **600** - SemiBold
- **700** - Bold
- **800** - ExtraBold
- **900** - Black

## Usage

After adding fonts, they will be automatically available via Tailwind classes:
- `font-[FontFamilyName]` (e.g., `font-inter`, `font-poppins`)

See `src/index.css` for font family definitions.

