const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const formEmailAddition = `
              <!-- Email ID Field -->
              <div class="form-group">
                <label for="email-id" class="form-label">Email ID</label>
                <div class="form-input-wrapper">
                  <input type="email" id="email-id" name="emailId" class="form-input" placeholder="john@example.com" required>
                  <svg class="form-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
              </div>`;

const formOtherServiceAddition = `
              <!-- Other Service Field -->
              <div class="form-group" id="other-service-group" style="display: none;">
                <label for="other-service" class="form-label">Specify Other Service</label>
                <div class="form-input-wrapper">
                  <input type="text" id="other-service" name="otherService" class="form-input" placeholder="Please specify">
                </div>
              </div>
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // 1. Add Email Field right before the select dropdown
    if (!content.includes('name="emailId"')) {
        content = content.replace(
            '<!-- Primary Service Selection Dropdown -->',
            formEmailAddition + '\n\n              <!-- Primary Service Selection Dropdown -->'
        );
    }

    // 2. Add "Other service" to select dropdown options
    if (!content.includes('value="Other service"')) {
        content = content.replace(
            '</select>',
            '  <option value="Other service">Other service</option>\n                  </select>'
        );
    }

    // 3. Add onchange to select
    if (!content.includes('onchange="toggleOtherService()"')) {
        content = content.replace(
            'class="form-input form-select" required>',
            'class="form-input form-select" required onchange="toggleOtherService()">'
        );
    }

    // 4. Add Other Service Field after the dropdown group
    if (!content.includes('id="other-service-group"')) {
        content = content.replace(
            '<!-- Custom Dropdown Down Chevron -->\n                  <svg class="form-select-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\n                </div>\n              </div>',
            '<!-- Custom Dropdown Down Chevron -->\n                  <svg class="form-select-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>\n                </div>\n              </div>\n' + formOtherServiceAddition
        );
    }

    // 5. Add Script for toggling Other service field
    if (!content.includes('function toggleOtherService()')) {
        content = content.replace(
            '</form>',
            `</form>\n              <script>\n                function toggleOtherService() {\n                  const select = document.getElementById('compliance-service');\n                  const otherGroup = document.getElementById('other-service-group');\n                  const otherInput = document.getElementById('other-service');\n                  if (select && select.value === 'Other service') {\n                    otherGroup.style.display = 'block';\n                    otherInput.required = true;\n                  } else {\n                    if (otherGroup) otherGroup.style.display = 'none';\n                    if (otherInput) otherInput.required = false;\n                  }\n                }\n              </script>`
        );
    }

    // 6. WhatsApp validation
    content = content.replace(
        '<input type="tel" id="whatsapp-number" name="whatsappNumber" class="form-input" placeholder="+1 (555) 000-0000" required>',
        '<input type="tel" id="whatsapp-number" name="whatsappNumber" class="form-input" placeholder="Enter 10 digit mobile number" pattern="[0-9]{10}" title="Please enter exactly 10 digits" required>'
    );

    // 7. Update FormData JS parsing
    if (!content.includes('emailId: formData.get(\'emailId\')')) {
        content = content.replace(
            "whatsappNumber: formData.get('whatsappNumber'),",
            "whatsappNumber: formData.get('whatsappNumber'),\n          emailId: formData.get('emailId'),\n          otherService: formData.get('otherService'),"
        );
    }

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log('Update Complete.');
