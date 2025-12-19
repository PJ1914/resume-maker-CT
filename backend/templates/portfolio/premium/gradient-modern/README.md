# Gradient Modern Portfolio Template

## Overview
A premium portfolio template featuring stunning animated gradients, particle effects, and advanced GSAP scroll animations. This template supports profile photos and project image galleries, making it perfect for showcasing visual projects.

## Features

### 🎨 Visual Effects
- **Particles.js Background** - Animated particle system with interactive mouse effects
- **Gradient Animations** - Smooth color transitions and animated gradients
- **GSAP ScrollTrigger** - Professional scroll-based animations
- **Glass Morphism** - Modern frosted glass UI elements
- **Floating Animations** - Subtle floating effects on hero elements

### 📸 Image Support
- **Profile Photo** - Display your professional photo with animated gradient border
- **Project Images** - Showcase project screenshots with hover effects
- **Image Fallbacks** - Elegant gradient placeholders when images aren't provided
- **Optimized Loading** - Fast loading with proper image optimization

### 🎯 Sections
1. **Hero Section** - Large name display, tagline, profile photo, and CTA buttons
2. **About Section** - Professional summary with quick stats
3. **Experience Section** - Timeline-style work history with descriptions
4. **Projects Section** - Grid layout with images, descriptions, and tech stack
5. **Skills Section** - Animated progress bars for each skill
6. **Certifications Section** - Grid display of certifications
7. **Contact Section** - Contact information with social links

### 🎨 Customization
- Theme toggle (Dark/Light mode)
- Customizable color schemes
- Font style options
- Accent color configuration
- Responsive design for all devices

## Technical Stack

### Frontend Libraries
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Particles.js 2.0** - Interactive particle backgrounds
- **GSAP 3.12** - Professional animation library
- **ScrollTrigger** - Scroll-based animation plugin

### Typography
- **Inter** - Primary body font (300-800 weights)
- **Poppins** - Display font for headings (600-800 weights)

## Template Variables

### Personal Information
```jinja2
{{ personal.name }}           # Full name
{{ personal.email }}          # Email address
{{ personal.phone }}          # Phone number
{{ personal.location }}       # Location/City
{{ personal.tagline }}        # Professional tagline
{{ personal.title }}          # Job title
{{ profile_photo }}           # Profile photo URL
```

### Social Links
```jinja2
{{ social_links.linkedin }}   # LinkedIn profile
{{ social_links.github }}     # GitHub profile
{{ social_links.twitter }}    # Twitter/X profile
```

### Content Sections
```jinja2
{{ summary }}                 # Professional summary
{{ experience }}              # Work experience array
{{ projects }}                # Projects array with images
{{ skills }}                  # Skills array
{{ certifications }}          # Certifications array
{{ education }}               # Education array
```

### Project Image Support
```jinja2
{% if project.image %}
  <img src="{{ project.image }}" alt="{{ project.name }}" />
{% else %}
  <!-- Gradient placeholder -->
{% endif %}
```

## Image Requirements

### Profile Photo
- **Format**: PNG, JPG, WEBP
- **Recommended Size**: 500x500px (square)
- **Max File Size**: 5MB
- **Aspect Ratio**: 1:1 (will be displayed in circular frame)

### Project Images
- **Format**: PNG, JPG, WEBP
- **Recommended Size**: 1200x600px (landscape)
- **Max File Size**: 5MB per image
- **Aspect Ratio**: 2:1 or 16:9 recommended

## Animation Details

### Page Load Animations
- Hero text elements fade in with stagger (0.2s delay)
- Profile photo floats with continuous 6s animation
- Navbar appears with smooth transition

### Scroll Animations
- Section titles fade in from bottom (50px offset)
- Experience cards slide in from alternating sides
- Project cards appear with staggered timing
- Skill progress bars animate to their percentages

### Interactive Elements
- Particles respond to mouse movement
- Cards scale up on hover (1.05x)
- Project images zoom and rotate on hover
- Navigation links highlight on scroll

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

### Mobile Optimizations
- Hamburger menu for navigation
- Single column layouts
- Reduced animation complexity
- Optimized font sizes
- Touch-friendly interactions

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations
- Lazy loading for images
- Optimized particle count for mobile
- Hardware-accelerated animations (CSS transforms)
- Efficient GSAP ScrollTrigger batching
- Minimal DOM operations

## Color Scheme
- **Primary**: Purple (#8b5cf6)
- **Accent**: Pink (#ec4899)
- **Secondary**: Orange (#f59e0b)
- **Background**: Dark (#1a1a1a)
- **Text**: White/Gray scale

## Usage Instructions

### 1. Image Upload
When generating a portfolio with this template:
1. Upload a profile photo (optional but recommended)
2. Upload images for each project (optional)
3. System stores images in Firebase Storage
4. Template automatically displays images

### 2. Generation
```python
from app.services.portfolio_generator import PortfolioGeneratorService

generator = PortfolioGeneratorService()
result = await generator.generate(
    user_id="user123",
    resume_id="resume456",
    template_id="gradient-modern",
    theme="light",
    profile_photo="https://storage.../profile.jpg",
    project_images={
        "project-1": "https://storage.../project1.jpg",
        "project-2": "https://storage.../project2.jpg"
    }
)
```

### 3. Customization
Users can customize:
- Theme (light/dark)
- Accent colors
- Font styles
- Section visibility

## Deployment
The generated portfolio is:
- Static HTML file
- Self-contained (all CSS/JS via CDN)
- No build process required
- Ready for GitHub Pages, Vercel, Netlify

## License
Premium template - Requires credit purchase to unlock

## Credits
- Design: CodeTapasya Team
- Animations: GSAP & Particles.js
- Icons: Lucide Icons
- Fonts: Google Fonts

## Version History
- **1.0.0** (2025-12-15) - Initial release with image support
