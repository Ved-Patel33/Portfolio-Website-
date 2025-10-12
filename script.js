// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const contactForm = document.getElementById('contactForm');

// Smooth scroll to section
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu if open
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// Event listeners for navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        scrollToSection(sectionId);
        
        // Update URL without page refresh
        history.pushState(null, null, `#${sectionId}`);
    });
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (hash && sections.length > 0) {
        showSection(hash);
    } else {
        showSection('home');
    }
});

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        scrollToSection(hash);
    }
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize scroll spy for active navigation
    initializeScrollSpy();
});

// Contact form handling
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Smooth scroll for anchor links
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

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.project-card, .competition-card, .experience-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add typing animation to profile description
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation on home section
document.addEventListener('DOMContentLoaded', () => {
    const profileDescription = document.querySelector('.profile-description');
    if (profileDescription) {
        const originalText = profileDescription.textContent;
        
        // Only animate on first load
        if (!sessionStorage.getItem('animationPlayed')) {
            typeWriter(profileDescription, originalText, 30);
            sessionStorage.setItem('animationPlayed', 'true');
        }
    }
});

// Add hover effects to project cards
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Add click effect to social links
document.addEventListener('DOMContentLoaded', () => {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = link.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            link.style.position = 'relative';
            link.style.overflow = 'hidden';
            link.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

document.head.appendChild(loadingStyles);

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Add focus management for accessibility
navLinks.forEach(link => {
    link.addEventListener('focus', () => {
        link.style.outline = '2px solid #3b82f6';
        link.style.outlineOffset = '2px';
    });
    
    link.addEventListener('blur', () => {
        link.style.outline = 'none';
    });
});

// Add smooth transitions between sections
const style = document.createElement('style');
style.textContent = `
    .section {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .section:not(.active) {
        opacity: 0;
        transform: translateY(20px);
    }
    
    .section.active {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

/* GUI Functions */

// Photo upload functionality
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImg = document.getElementById('profile-img');
            profileImg.src = e.target.result;
            showNotification('Photo updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Project functions
function openProject(projectName) {
    // This would open the specific project demo
    const projectUrls = {
        'smart-home': 'https://smart-home-demo.vercel.app',
        'ecommerce': 'https://ecommerce-demo.vercel.app',
        'campus-nav': 'https://campus-nav-demo.vercel.app',
        'finance-tracker': 'https://finance-tracker-demo.vercel.app'
    };
    
    const url = projectUrls[projectName];
    if (url) {
        window.open(url, '_blank');
    }
}

// Google Drive functions
function openGoogleDrive(folderName) {
    // Replace with your actual Google Drive folder IDs
    const driveUrls = {
        'projects': 'https://drive.google.com/drive/folders/YOUR_PROJECTS_FOLDER_ID',
        'techcorp': 'https://drive.google.com/drive/folders/YOUR_TECHCORP_FOLDER_ID',
        'innovatelab': 'https://drive.google.com/drive/folders/YOUR_INNOVATELAB_FOLDER_ID',
        'startupxyz': 'https://drive.google.com/drive/folders/YOUR_STARTUPXYZ_FOLDER_ID',
        'hack-north': 'https://drive.google.com/drive/folders/YOUR_HACK_NORTH_FOLDER_ID',
        'design-challenge': 'https://drive.google.com/drive/folders/YOUR_DESIGN_CHALLENGE_FOLDER_ID',
        'codejam': 'https://drive.google.com/drive/folders/YOUR_CODEJAM_FOLDER_ID',
        'iot-challenge': 'https://drive.google.com/drive/folders/YOUR_IOT_CHALLENGE_FOLDER_ID'
    };
    
    const url = driveUrls[folderName];
    if (url) {
        window.open(url, '_blank');
    } else {
        showNotification('Google Drive folder not configured yet', 'info');
    }
}

// Contact functions
function openEmail() {
    function openEmail() {
        window.location.href = 'mailto:vedip@outlook.com';
}
}

function openLinkedIn() {
    window.open('https://linkedin.com/in/vedpatel', '_blank');
}

function openGitHub() {
    window.open('https://github.com/vedpatel', '_blank');
}

// Scroll spy for active navigation
function initializeScrollSpy() {
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}
