// Combined Apps Script backend for inquiries and blog publishing

const SHEET_ID = '1oA3eFkS9tGZNQeQmq63pnmvTRt2VGsG9MTsdQFn-nHY';
const BLOGS_SHEET_NAME = 'Blogs';
const PRIMARY_INQUIRIES_SHEET_NAME = 'Sheet1';
const FALLBACK_INQUIRIES_SHEET_NAME = 'Inquiries';

function doPost(e) {
  try {
    const data = parsePostData(e);

    if (data.title && data.content) {
      return publishBlogPost(data);
    }

    return handleInquirySubmission(data);
  } catch (error) {
    logScriptError(error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleInquirySubmission(data) {
  const fullName = data.fullName || 'Missing Name';
  const companyName = data.companyName || 'Missing Company';
  const whatsappNumber = data.whatsappNumber || 'Missing Phone';
  const emailId = data.emailId || '';
  const complianceService = data.complianceService || 'Missing Service';
  const otherService = data.otherService || '';
  const submittedAt = data.submittedAt || new Date().toISOString();

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getInquirySheet(ss);
  ensureInquiryHeaders(sheet);
  sheet.appendRow([submittedAt, fullName, companyName, whatsappNumber, emailId, complianceService, otherService]);

  sendAdminNotification(fullName, companyName, whatsappNumber, emailId, complianceService, otherService);
  sendTelegramAlert(fullName, companyName, whatsappNumber, emailId, complianceService);

  if (emailId) {
    sendThankYouEmail(emailId, fullName, complianceService, otherService);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function publishBlogPost(data) {
  const title = data.title || 'Untitled';
  const author = data.author || 'Admin';
  const date = data.date || new Date().toISOString().slice(0, 10);
  const content = data.content || '';
  const excerpt = data.excerpt || '';
  const imageUrl = data.imageUrl || '';
  const tags = data.tags || '';

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getOrCreateSheet(ss, BLOGS_SHEET_NAME, ['Title', 'Date', 'Author', 'Content', 'Excerpt', 'ImageUrl', 'Tags']);
  sheet.appendRow([title, date, author, content, excerpt, imageUrl, tags]);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', type: 'blog' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = getOrCreateSheet(ss, BLOGS_SHEET_NAME, ['Title', 'Date', 'Author', 'Content', 'Excerpt', 'ImageUrl', 'Tags']);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0].map((header) => String(header).toLowerCase());
    const blogs = data.slice(1).map((row) => {
      const blog = {};
      row.forEach((value, index) => {
        blog[headers[index]] = value;
      });
      return blog;
    });

    return ContentService.createTextOutput(JSON.stringify(blogs)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    logScriptError(error);
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parsePostData(e) {
  if (!e) return {};

  // 1. Try parsing JSON from postData.contents regardless of Content-Type header
  if (e.postData && e.postData.contents) {
    try {
      const parsed = JSON.parse(e.postData.contents);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (err) {
      // Content is not JSON, continue to other parsers
    }
  }

  // 2. Check e.parameter (standard form submit or url-encoded data)
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  // 3. Fallback: try parsing postData.contents as URL-encoded string
  if (e.postData && e.postData.contents && typeof e.postData.contents === 'string') {
    try {
      const params = {};
      const parts = e.postData.contents.split('&');
      for (let i = 0; i < parts.length; i++) {
        const pair = parts[i].split('=');
        if (pair[0]) {
          params[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent((pair[1] || '').replace(/\+/g, ' '));
        }
      }
      if (Object.keys(params).length > 0) {
        return params;
      }
    } catch (err) {}
  }

  return {};
}

function getInquirySheet(ss) {
  let sheet = ss.getSheetByName(PRIMARY_INQUIRIES_SHEET_NAME);
  if (sheet) {
    return sheet;
  }

  sheet = ss.getSheetByName(FALLBACK_INQUIRIES_SHEET_NAME);
  if (sheet) {
    return sheet;
  }

  sheet = ss.getSheetByName('Sheet1');
  if (!sheet) {
    sheet = ss.insertSheet(PRIMARY_INQUIRIES_SHEET_NAME);
  }
  return sheet;
}

function ensureInquiryHeaders(sheet) {
  const expectedHeaders = ['Date', 'Full Name', 'Company Name', 'WhatsApp Number', 'Email ID', 'Primary Service', 'Other Service'];
  const lastRow = sheet.getLastRow();

  if (lastRow === 0) {
    sheet.appendRow(expectedHeaders);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
  const normalizedCurrent = currentHeaders.map(String).map((value) => value.trim().toLowerCase());
  const normalizedExpected = expectedHeaders.map((value) => value.toLowerCase());

  if (normalizedCurrent.join('|') !== normalizedExpected.join('|')) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  }
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function sendAdminNotification(name, company, phone, emailId, service, otherService) {
  const myEmail = 'toomspayroll@gmail.com';
  const subject = `🚨 URGENT: New Lead from ${company}`;
  const body = `Hi Preet,

A new website inquiry has arrived:

` +
    `🔹 Client Name: ${name}
` +
    `🔹 Company: ${company}
` +
    `🔹 WhatsApp/Phone: ${phone}
` +
    `🔹 Email: ${emailId || 'Not provided'}
` +
    `🔹 Service Required: ${service}${service === 'Other service' ? ' (' + (otherService || 'Not specified') + ')' : ''}

Check your Google Sheet tracker for details.`;

  MailApp.sendEmail(myEmail, subject, body);
}

function sendThankYouEmail(emailId, fullName, primaryService, otherService) {
  const subject = 'Thank You for Contacting Tooms Payroll';
  const serviceText = primaryService === 'Other service' ? otherService || 'your selected service' : primaryService;
  const body = `Dear ${fullName},

Thank you for contacting Tooms Payroll & Staffing Co. We have received your inquiry regarding ${serviceText}.

A compliance consultant will reach out to you soon on WhatsApp or by phone.

If you need anything else, reply to this email or contact us at +91 99711 83483.

Best regards,
Tooms Payroll & Staffing Co.`;

  MailApp.sendEmail(emailId, subject, body);
}

function sendTelegramAlert(name, company, phone, emailId, service) {
  const botToken = '8896144264:AAH1ZeCvA2dtScK1gwAMVy1BLP0qTi8pokc';
  const chatId = '8765400407';
  const message = `🚨 *URGENT: New Compliance Lead* 🚨\n\n` +
    `👤 *Client Name:* ${name}\n` +
    `🏢 *Company:* ${company}\n` +
    `📞 *WhatsApp/Phone:* ${phone}\n` +
    `✉️ *Email:* ${emailId || 'Not provided'}\n` +
    `📋 *Service Required:* ${service}`;

  const url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
  const options = {
    method: 'post',
    payload: {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    }
  };

  UrlFetchApp.fetch(url, options);
}

function logScriptError(error) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const errorSheet = getOrCreateSheet(ss, 'ScriptErrors', ['Timestamp', 'Location', 'Message']);
    errorSheet.appendRow([new Date().toISOString(), 'Script', error.message || String(error)]);
  } catch (innerError) {
    Logger.log('Failed to log script error: ' + innerError.message);
  }
}

function forceTelegramAuth() {
  sendTelegramAlert('Auth Test', 'Company Test', '9999999999', 'test@example.com', 'Testing Permission');
}
