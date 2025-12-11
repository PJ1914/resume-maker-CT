# Minimalist Portfolio Template

A clean, minimal portfolio template with generous whitespace, monospace accents, and understated elegance. Perfect for professionals who prefer a refined, distraction-free presentation.

## ✨ Features

- ✅ Ultra-minimal design philosophy with maximum whitespace
- ✅ Monospace font (JetBrains Mono) for dates and technical elements
- ✅ 1100px fixed width layout (narrower than Modern template)
- ✅ Black, white, and gray color palette only
- ✅ Simple horizontal dividers between sections
- ✅ Clean Inter typography with light font weights
- ✅ Grid layouts for contact info and certifications
- ✅ Subtle underline hover effects on links
- ✅ Print-optimized styles included
- ✅ No JavaScript - pure HTML/CSS
- ✅ Lightweight and fast loading

## 📋 Technical Details

| Aspect | Details |
|--------|---------|
| **Framework** | Pure HTML5 |
| **Styling** | CSS3 |
| **Fonts** | Inter (primary), JetBrains Mono (accents) |
| **Layout Width** | 1100px fixed |
| **Responsive** | No (fixed width only) |
| **JavaScript** | None |
| **Animations** | None (subtle transitions only) |
| **Dark Mode** | No |
| **File Size** | ~15KB (HTML + CSS) |

## 🎨 Design Philosophy

This template follows a minimal design philosophy:

1. **Whitespace First**: Generous spacing (5rem between sections, 3rem between items)
2. **Typography Focused**: Clean Inter font with light weights (300-600)
3. **Monospace Accents**: JetBrains Mono for dates, labels, and technical elements
4. **Subtle Interactions**: Simple underline hover effects on links
5. **No Distractions**: No colors except black, white, and grays
6. **Visual Hierarchy**: Simple dividers separate sections

## 🎨 Customization

### Colors

The template uses a minimal grayscale palette. Update these in `styles.css`:

```css
/* Main text colors */
--primary-text: #1a1a1a;     /* Headings, dark text */
--secondary-text: #4a4a4a;   /* Body text */
--tertiary-text: #999999;    /* Meta information */
--background: #ffffff;       /* Page background */
--divider: #e0e0e0;         /* Section dividers */
```

### Fonts

Two fonts are used via Google Fonts CDN:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- **Inter**: Main content (300, 400, 600 weights)
- **JetBrains Mono**: Dates, labels, tech tags (400, 500 weights)

To change fonts, update the Google Fonts link and CSS:

```css
body {
    font-family: 'Your Font', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.contact-label, .job-date, .tech-item {
    font-family: 'Your Monospace Font', monospace;
}
```

### Layout Width

To adjust the container width (currently 1100px):

```css
.container {
    max-width: 1100px; /* Change this value */
    margin: 0 auto;
}
```

### Spacing

Adjust section and item spacing:

```css
.section {
    margin-bottom: 5rem; /* Space between sections */
}

.experience-item, .project-item {
    margin-bottom: 3rem; /* Space between items */
}
```

## 📁 File Structure

```
minimalist/
├── index.html          # Main Jinja2 template
├── styles.css          # Complete styling
├── metadata.json       # Template configuration
├── preview.html        # Demo with sample data
└── README.md          # This file
```

## 🔧 Template Variables

The template uses Jinja2 syntax for dynamic content:

### Personal Information
- `{{ personal.name }}` - Full name
- `{{ personal.title }}` or `{{ personal.headline }}` - Job title/tagline
- `{{ personal.email }}` - Email address
- `{{ personal.phone }}` - Phone number
- `{{ personal.location }}` - City, State/Country
- `{{ personal.linkedin }}` - LinkedIn profile URL
- `{{ personal.github }}` - GitHub profile URL
- `{{ personal.website }}` - Personal website URL

### Content Sections
- `{{ summary }}` - Professional summary text
- `{{ experience }}` - Array of job objects
- `{{ projects }}` - Array of project objects
- `{{ skills }}` - Array of skill strings/objects
- `{{ education }}` - Array of education objects
- `{{ certifications }}` - Array of certification objects

### Experience Object
```python
{
    "position": "Job Title",
    "company": "Company Name",
    "location": "City, State",
    "start_date": "Jan 2020",
    "end_date": "Present",
    "description": "Job description...",
    "achievements": ["Achievement 1", "Achievement 2"]
}
```

### Project Object
```python
{
    "name": "Project Name",
    "description": "Project description...",
    "url": "https://project.com",
    "technologies": ["React", "Node.js", "MongoDB"]
}
```

## 🚀 Deployment

This template works with:

- ✅ GitHub Pages (recommended)
- ✅ Vercel
- ✅ Netlify
- ✅ Any static file hosting

Simply upload the generated HTML and CSS files.

## 🎯 Best Practices

1. **Keep It Simple**: Don't overcrowd sections - less is more
2. **Consistent Spacing**: Maintain generous whitespace throughout
3. **Quality Over Quantity**: Focus on impactful achievements
4. **Professional Tone**: Let the minimal design speak for itself
5. **Readable Content**: Use clear, concise language
6. **Link Sparingly**: Only include essential external links

## 📱 Note on Responsiveness

This is a **fixed-width template (1100px)** designed for the BASIC tier. It does not include responsive breakpoints. For responsive templates, see the STANDARD tier and above.

## 🖨️ Print Optimization

The template includes print-optimized styles that:
- Reduce padding and margins
- Remove link underlines
- Adjust font sizes for print
- Ensure sections don't break across pages

---

**Template Tier**: BASIC (FREE)  
**Price**: ₹0  
**Generated with**: Resume Maker CT
