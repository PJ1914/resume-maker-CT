// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation highlighting
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections
sections.forEach(section => {
    observer.observe(section);
});

// Add subtle parallax effect to sidebar
const sidebar = document.querySelector('.sidebar');
if (sidebar && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.05;
        sidebar.style.transform = `translateY(-${parallax}px)`;
    });
}

// Typing effect for executive summary (optional)
const summaryText = document.querySelector('.summary-text');
if (summaryText && summaryText.textContent.length > 0) {
    const text = summaryText.textContent;
    summaryText.textContent = '';
    let index = 0;
    
    // Uncomment below to enable typing effect
    /*
    const typeWriter = () => {
        if (index < text.length) {
            summaryText.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 20);
        }
    };
    
    // Start typing when summary section is visible
    const summaryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeWriter();
                summaryObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    const summarySection = document.querySelector('.executive-summary');
    if (summarySection) {
        summaryObserver.observe(summarySection);
    } else {
        summaryText.textContent = text;
    }
    */
    
    // Default: just show text immediately
    summaryText.textContent = text;
}

// Add hover effect sound (optional - requires audio file)
const achievementCards = document.querySelectorAll('.achievement-card');
achievementCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        // Optional: play subtle hover sound
        // new Audio('hover.mp3').play();
    });
});

// Print preparation
window.addEventListener('beforeprint', () => {
    sections.forEach(section => {
        section.classList.add('visible');
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    });
});
