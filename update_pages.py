import os
import glob
import re
import shutil

# Copy images
artifacts_dir = r"C:\Users\DELL\.gemini\antigravity\brain\65e8901d-c412-42c2-bc51-38808fd9e7e9"
image_files = glob.glob(os.path.join(artifacts_dir, "*.png"))
assets_dir = "assets"
os.makedirs(assets_dir, exist_ok=True)
for img in image_files:
    shutil.copy(img, assets_dir)

html_files = glob.glob("*.html")

FORM_ADDITIONS = """
              <!-- Email ID Field -->
              <div class="form-group">
                <label for="email-id" class="form-label">Email ID</label>
                <div class="form-input-wrapper">
                  <input type="email" id="email-id" name="emailId" class="form-input" placeholder="john@example.com" required>
                  <svg class="form-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
              </div>

              <!-- Primary Service Selection Dropdown -->
              <div class="form-group">
                <label for="compliance-service" class="form-label">Required Compliance Service</label>
                <div class="form-input-wrapper">
                  <select id="compliance-service" name="complianceService" class="form-input form-select" required onchange="toggleOtherService()">
                    <option value="" disabled selected>Select Primary Service Needed</option>
                    <option value="PF Registration & Monthly Compliance">PF Registration & Monthly Compliance</option>
                    <option value="ESI Registration & Compliance">ESI Registration & Compliance</option>
                    <option value="Factory License Consultancy">Factory License Consultancy</option>
                    <option value="PoSH Compliance Framework">PoSH Compliance Framework</option>
                    <option value="Digital Signature Certificates (DSC)">Digital Signature Certificates (DSC)</option>
                    <option value="Pollution NOC (CTE & CTO)">Pollution NOC (CTE & CTO)</option>
                    <option value="BoCW Registration & Cess Compliance">BoCW Registration & Cess Compliance</option>
                    <option value="Payroll Processing & HR Compliance">Payroll Processing & HR Compliance</option>
                    <option value="Other service">Other service</option>
                  </select>
                  <svg class="form-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  <svg class="form-select-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              <!-- Other Service Field -->
              <div class="form-group" id="other-service-group" style="display: none;">
                <label for="other-service" class="form-label">Specify Other Service</label>
                <div class="form-input-wrapper">
                  <input type="text" id="other-service" name="otherService" class="form-input" placeholder="Please specify">
                </div>
              </div>

              <script>
                function toggleOtherService() {
                  const select = document.getElementById('compliance-service');
                  const otherGroup = document.getElementById('other-service-group');
                  const otherInput = document.getElementById('other-service');
                  if (select.value === 'Other service') {
                    otherGroup.style.display = 'block';
                    otherInput.required = true;
                  } else {
                    otherGroup.style.display = 'none';
                    otherInput.required = false;
                  }
                }
              </script>
"""

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update the form
    # We find the existing dropdown group and replace it + add email field
    # But wait, each file might have it slightly differently.
    # Let's use regex to replace the Primary Service Selection Dropdown group
    # AND add the email field right before it.
    
    # We will look for: <div class="form-group">\s*<label for="compliance-service" ... </div>\s*</div>
    # Actually, let's just replace the exact block if possible, or insert Email ID right before WhatsApp, etc.
    
    if "emailId" not in content:
        content = re.sub(
            r'(<!-- Primary Service Selection Dropdown -->[\s\S]*?</select>[\s\S]*?</div>\s*</div>)',
            FORM_ADDITIONS,
            content
        )
        
        # 2. Add validation for WhatsApp number to be 10 digits
        content = content.replace(
            '<input type="tel" id="whatsapp-number" name="whatsappNumber" class="form-input" placeholder="+1 (555) 000-0000" required>',
            '<input type="tel" id="whatsapp-number" name="whatsappNumber" class="form-input" placeholder="Enter 10 digit number" pattern="[0-9]{10}" title="Please enter exactly 10 digits" required>'
        )

        # 3. Update the form submission handler to include emailId and otherService
        content = content.replace(
            "whatsappNumber: formData.get('whatsappNumber'),",
            "whatsappNumber: formData.get('whatsappNumber'),\n          emailId: formData.get('emailId'),\n          otherService: formData.get('otherService'),"
        )
        
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Done updating HTML files.")
