const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexFile, 'utf8');

// 1. Add background image to hero section
if (!content.includes('assets/home_bg.png')) {
    content = content.replace(
        '.hero {',
        `.hero {\n      background-image: url('assets/home_bg.png');\n      background-size: cover;\n      background-position: center;\n      background-blend-mode: overlay;`
    );
}

// 2. Add images to service cards (replacing SVGs)
// Helper to replace SVG in card with image
function replaceSvgWithImg(serviceName, imgName, altText) {
    // regex to find the icon container and SVG for a specific card
    const regex = new RegExp(`(<h3 class="service-title">${serviceName}</h3>[\\s\\S]*?<div class="icon-container">)[\\s\\S]*?(</div>)`);
    // actually, the SVG comes before the title.
    const regex2 = new RegExp(`(<div class="icon-container">)[\\s\\S]*?(</div>\\s*<h3 class="service-title">${serviceName}</h3>)`);
    if (regex2.test(content)) {
        content = content.replace(regex2, `$1<img src="assets/${imgName}" alt="${altText}" style="border-radius: var(--radius-sm); width: 100%; height: 100%; object-fit: cover;">$2`);
    }
}

replaceSvgWithImg('PF Registration & Monthly Compliance', 'pf_service.png', 'Professional PF Registration and Monthly Compliance Services');
replaceSvgWithImg('ESI Registration & Compliance', 'esi_service.png', 'Professional ESI Registration and Compliance Services');
replaceSvgWithImg('Factory License Consultancy', 'factory_service.png', 'Professional Factory License Consultancy');
replaceSvgWithImg('PoSH Compliance Framework', 'posh_service.png', 'Professional PoSH Compliance Framework Implementation');
replaceSvgWithImg('Digital Signature Certificates \\(DSC\\)', 'dsc_service.png', 'Professional Digital Signature Certificates (DSC) Provider');
// The rest couldn't be generated due to quota, keep SVGs or use placeholder. We will keep SVGs for the remaining ones.

// 3. Add About Section
const aboutSection = `
    <!-- ----------------------------------------------------
         ABOUT SECTION
         ---------------------------------------------------- -->
    <section id="about" class="authority section-padding" style="background-color: var(--color-white); color: var(--color-dark);">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">About Us</span>
          <h2 class="section-title">Your Trusted Compliance Partner</h2>
          <p class="section-desc">We are registered professionals providing zero-error corporate compliance and industrial licensing services. Download our legal registrations below.</p>
        </div>
        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
          <a href="Udyam Registration Certificate.pdf" target="_blank" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Udyam Registration
          </a>
          <a href="GST Registration Certificate.pdf" target="_blank" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--color-success) 0%, #059669 100%);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download GST Registration
          </a>
        </div>
      </div>
    </section>
`;

if (!content.includes('id="about"')) {
    content = content.replace(
        '<!-- ----------------------------------------------------\n         4. AUTHORITY STATEMENTS SECTION',
        aboutSection + '\n    <!-- ----------------------------------------------------\n         4. AUTHORITY STATEMENTS SECTION'
    );
}

// 4. Add Blog Section
const blogSection = `
    <!-- ----------------------------------------------------
         BLOG SECTION
         ---------------------------------------------------- -->
    <section id="blog" class="services section-padding" style="background-color: var(--color-bg-light);">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">Insights & Updates</span>
          <h2 class="section-title">Latest Compliance Blogs</h2>
          <p class="section-desc">Stay informed with our latest articles on corporate compliance, payroll updates, and industrial licensing.</p>
        </div>
        <div id="blog-container" class="services-grid">
           <!-- Blogs will be loaded here via Google Apps Script -->
           <p style="text-align: center; width: 100%; color: var(--color-dark-tint);">Loading latest insights...</p>
        </div>
      </div>
    </section>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        // Replace with your actual deployed GET URL for blogs
        const blogsUrl = 'YOUR_APPS_SCRIPT_GET_URL_HERE'; 
        
        fetch(blogsUrl)
          .then(res => res.json())
          .then(data => {
            const container = document.getElementById('blog-container');
            if(data.length === 0 || data.error) {
               container.innerHTML = '<p style="text-align: center; width: 100%;">No blogs published yet.</p>';
               return;
            }
            container.innerHTML = '';
            data.forEach(blog => {
              const card = document.createElement('div');
              card.className = 'service-card';
              card.innerHTML = \`
                <h3 class="service-title">\${blog.title || 'Untitled'}</h3>
                <p style="font-size: 0.85rem; color: var(--color-primary); margin-bottom: 10px;">\${new Date(blog.date).toLocaleDateString()} | \${blog.author || 'Admin'}</p>
                <p class="service-desc">\${(blog.content || '').substring(0, 150)}...</p>
                <div class="service-card-footer">
                  <span class="service-link" style="cursor:pointer;" onclick="alert('Full blog view coming soon!')">Read More &rarr;</span>
                </div>
              \`;
              container.appendChild(card);
            });
          })
          .catch(err => {
             document.getElementById('blog-container').innerHTML = '<p style="text-align: center; width: 100%;">Could not load blogs at this time.</p>';
          });
      });
    </script>
`;

if (!content.includes('id="blog"')) {
    content = content.replace(
        '<!-- ----------------------------------------------------\n         5. CONVERSION FORM SECTION',
        blogSection + '\n    <!-- ----------------------------------------------------\n         5. CONVERSION FORM SECTION'
    );
}

// Update Navigation Links to include About and Blog
if (!content.includes('href="#about"')) {
    content = content.replace(
        '<li><a href="#services" class="nav-link">Our Services</a></li>',
        '<li><a href="#about" class="nav-link">About Us</a></li>\n          <li><a href="#services" class="nav-link">Our Services</a></li>\n          <li><a href="#blog" class="nav-link">Blog</a></li>'
    );
}

fs.writeFileSync(indexFile, content, 'utf8');
console.log('index.html updated successfully.');
