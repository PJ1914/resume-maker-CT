# Modern Portfolio Template

A clean, elegant portfolio design with beautiful typography and a fixed-width layout.

## Preview

![Modern Portfolio Preview](preview.png)

## Features

✅ **Pure HTML + CSS** - No JavaScript required  
✅ **Fixed Width** - 1200px centered layout  
✅ **Clean Typography** - Inter font family via Google Fonts  
✅ **Gradient Header** - Beautiful purple gradient background  
✅ **Elegant Hover Effects** - Smooth transitions on interactive elements  
✅ **Timeline Layout** - Professional experience timeline  
✅ **Grid Systems** - Modern grid layouts for projects and skills  
✅ **Print Friendly** - Optimized print styles included  
✅ **Fast Loading** - Minimal CSS, no external dependencies except fonts  

## Sections

The template includes the following sections:

1. **Header** - Name, title, contact info, social links
2. **About** - Professional summary
3. **Experience** - Work history with timeline layout
4. **Projects** - Project showcase with cards
5. **Skills** - Skills grid with hover effects
6. **Education** - Academic background
7. **Certifications** - Professional certifications
8. **Footer** - Copyright and credits

## Technical Details

- **Width:** 1200px fixed
- **Font:** Inter (Google Fonts)
- **Colors:** Purple gradient (#667eea to #764ba2)
- **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Responsive:** No (fixed width for desktop)
- **Dark Mode:** No

## Customization

### Changing Colors

Edit `styles.css` and modify the header gradient:

```css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Changing Font

Replace the Google Fonts link in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Then update the CSS:

```css
body {
    font-family: 'YourFont', sans-serif;
}
```

## File Structure

```
modern/
├── index.html       # Main HTML template
├── styles.css       # All styles
├── metadata.json    # Template metadata
├── README.md        # This file
└── preview.png      # Preview image (to be added)
```

## Usage

1. Replace template variables in `index.html` with your data
2. Open `index.html` in a web browser
3. Deploy to GitHub Pages, Vercel, or Netlify

## Template Variables

The template uses Jinja2 syntax for data injection:

- `{{ personal.name }}` - Your full name
- `{{ personal.title }}` - Your job title
- `{{ personal.email }}` - Email address
- `{{ summary }}` - Professional summary
- `{{ experience }}` - Array of work experiences
- `{{ projects }}` - Array of projects
- `{{ skills }}` - Array of skills
- `{{ education }}` - Array of education entries
- `{{ certifications }}` - Array of certifications

## Best Practices

- Keep your summary concise (2-3 sentences)
- Use bullet points for achievements
- Include relevant projects only
- List skills in order of proficiency
- Keep the design clean and professional

## License

© 2024 Resume Maker CT. This template is provided as-is for portfolio generation.
