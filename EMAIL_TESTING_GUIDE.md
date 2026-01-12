# 📧 Email System - Complete Testing Guide

## Overview
All 15 email triggers are implemented and working! This guide will help you test them in development and deploy to production.

## 📊 Email Triggers Status

| # | Email Type | Trigger Event | Status | Location |
|---|------------|---------------|--------|----------|
| 1 | **Welcome Email** | User signup | ✅ Working | `services/credits.py` |
| 2 | **Billing Receipt** | Payment success | ✅ Working | `routers/payments.py` |
| 3 | **Resume Ready** | Resume parsing complete | ✅ Working | `services/tasks.py` |
| 4 | **Interview Complete** | Interview session done | ✅ Working | `routers/interview.py` |
| 5 | **Portfolio Deployed** | Portfolio deployment success | ✅ Working | `routers/portfolio.py` |
| 6 | **Support Confirmation** | Support form submit | ✅ Working | `routers/contact.py` |
| 7 | **Security Alert** | Security events (NEW) | ✅ Working | `routers/auth.py` |
| 8 | **Contact Confirmation** | Contact form submit | ✅ Working | `routers/contact.py` |
| 9 | **Low Credit Warning** | Credits < 5 | ✅ Working | `services/credits.py` |
| 10 | **High ATS Score** | ATS score ≥ 80 | ✅ Working | `routers/scoring.py` |
| 11 | **Payment Failed** | Payment verification fails | ✅ Working | `routers/payments.py` |
| 12 | **PDF Export Success** | PDF export complete | ✅ Working | `routers/pdf_export.py` |
| 13 | **Monthly Credit Reset** | Monthly free credits reset | ✅ Working | `services/credits.py` |
| 14 | **Platform Connected** | GitHub/Vercel/Netlify linked | ✅ Working | `routers/auth.py` |
| 15 | **Template Unlock** | Premium template unlocked | ✅ Working | `routers/portfolio.py` |

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Development Configuration
ENVIRONMENT=development
EMAIL_DEV_MODE=True  # Logs emails to console only

# AWS SES Configuration (Required when EMAIL_DEV_MODE=False)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
EMAIL_API_URL=https://your-email-api-url.amazonaws.com/send
EMAIL_TEMPLATE_S3_BUCKET=your-s3-bucket-name
```

### Production Configuration

```bash
# Production Configuration
ENVIRONMENT=production
EMAIL_DEV_MODE=False  # Send real emails via AWS SES

# AWS SES Configuration
AWS_ACCESS_KEY_ID=prod_access_key
AWS_SECRET_ACCESS_KEY=prod_secret_key
AWS_REGION=us-east-1
EMAIL_API_URL=https://prod-email-api.amazonaws.com/send
EMAIL_TEMPLATE_S3_BUCKET=prod-email-templates
```

## 🧪 Testing in Development

### Method 1: Using the Test Script

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Get your Firebase ID token:**
   - Log in to your app in the browser
   - Open browser console (F12)
   - Run: `localStorage.getItem('idToken')`
   - Copy the token

3. **Update and run the test script:**
   ```bash
   # Edit backend/test_emails.py
   # Set AUTH_TOKEN = "your_token_here"
   
   cd backend
   python test_emails.py
   ```

4. **Check backend console for email previews** - You'll see all 15 email previews logged

### Method 2: Using API Endpoints

#### Test All Emails at Once
```bash
curl -X POST http://localhost:8000/api/test-emails/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test Single Email
```bash
# Test welcome email
curl -X POST http://localhost:8000/api/test-emails/single/welcome \
  -H "Authorization: Bearer YOUR_TOKEN"

# Available types:
# welcome, billing, resume_ready, interview_complete, portfolio_deployed,
# support, security, contact, low_credit, high_ats, payment_failed,
# pdf_export, monthly_credit, platform_connected, template_unlock
```

#### Health Check
```bash
# No authentication required
curl http://localhost:8000/api/test-emails/health
```

### Method 3: Trigger Real User Actions

You can also test by actually performing the actions that trigger emails:

1. **Welcome Email** - Sign up a new user
2. **Billing Receipt** - Complete a test payment
3. **Resume Ready** - Upload a resume
4. **Interview Complete** - Complete an interview session
5. **Portfolio Deployed** - Deploy a portfolio
6. **Low Credit Warning** - Spend credits until balance < 5
7. **High ATS Score** - Get a resume with score ≥ 80
8. **Platform Connected** - Connect GitHub/Vercel/Netlify
9. **Security Alert** - Disconnect GitHub/Vercel/Netlify
10. **Template Unlock** - Unlock a premium template

## 📬 Email Templates

Each email uses AWS SES templates stored in S3:

| Email Type | Template Name | Variables |
|------------|---------------|-----------|
| Welcome | `welcome` | name, app_name, login_url, support_email, date |
| Billing | `billing` | invoice_number, name, amount, currency_symbol, transaction_id, date |
| Resume Ready | `noreply` | name, resume_name, ats_score, message, dashboard_url, date |
| Interview | `noreply` | name, role, question_count, message, dashboard_url, date |
| Portfolio | `noreply` | name, portfolio_url, template, message, date |
| Support | `support` | name, ticket_id, message, support_url, date |
| Security | `security` | name, alert_type, message, date, support_email |
| Contact | `support` | name, subject, message, response_time, support_email, date |
| Low Credit | `noreply` | name, remaining_credits, message, purchase_url, date |
| High ATS | `noreply` | name, resume_name, ats_score, rating, message, share_url, date |
| Payment Failed | `billing` | name, amount, reason, order_id, message, retry_url, date |
| PDF Export | `noreply` | name, resume_name, template, message, download_url, date |
| Monthly Credit | `noreply` | name, new_credits, total_balance, message, dashboard_url, date |
| Platform Connected | `security` | name, platform, message, connected_at, security_url, date |
| Template Unlock | `noreply` | name, template_name, tier, message, portfolio_url, date |

## 🚀 Deployment to Production

### Pre-Deployment Checklist

- [ ] AWS SES is set up and verified
- [ ] Email templates are uploaded to S3
- [ ] EMAIL_API_URL Lambda function is deployed
- [ ] Production .env has EMAIL_DEV_MODE=False
- [ ] AWS credentials are configured in production environment

### Production .env Example

```bash
# Production Environment
ENVIRONMENT=production
EMAIL_DEV_MODE=False

# AWS SES Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
EMAIL_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod/send
EMAIL_TEMPLATE_S3_BUCKET=prativeda-email-templates

# Firebase
CODETAPASYA_SERVICE_ACCOUNT_PATH=/path/to/codetapasya-service-account.json
RESUME_MAKER_SERVICE_ACCOUNT_PATH=/path/to/resume-maker-service-account.json
STORAGE_BUCKET_NAME=resume-maker-ct.firebasestorage.app

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp

# Security
CORS_ORIGINS=https://prativeda.com,https://www.prativeda.com
```

### Deployment Steps

1. **Update production .env:**
   ```bash
   EMAIL_DEV_MODE=False
   ENVIRONMENT=production
   ```

2. **Deploy backend:**
   ```bash
   # Your deployment method (Docker, Cloud Run, etc.)
   docker build -t resume-maker-backend .
   docker push your-registry/resume-maker-backend
   ```

3. **Verify production emails:**
   - Monitor logs for email sending
   - Check AWS SES sending statistics
   - Test with real user actions

## 📝 Monitoring & Debugging

### Development Mode (EMAIL_DEV_MODE=True)

Emails are logged to console with this format:
```
================================================================================
📧 [DEV MODE] Email Preview:
   Type: welcome
   To: user@example.com
   Metadata: {'name': 'John Doe', 'app_name': 'Prativeda Resume Maker', ...}
================================================================================
⚠️  EMAIL_DEV_MODE is ON - Email not actually sent!
   Set EMAIL_DEV_MODE=False in .env to send real emails
================================================================================
```

### Production Mode (EMAIL_DEV_MODE=False)

Emails are sent via AWS SES with logging:
```
✅ Email sent: welcome to user@example.com
   SES Response: {'MessageId': '0100...-1234-5678-...'}
   Message ID: 0100...-1234-5678-...
```

### Error Handling

All email functions are wrapped in try-catch blocks to prevent email failures from breaking the application:

```python
try:
    await EmailService.send_welcome_email(user_email, user_name)
except Exception as e:
    logger.error(f"Email failed: {e}")
    # Application continues normally
```

## 🔒 Security Notes

1. **Never commit .env files** - Already in .gitignore
2. **Use environment variables** - All sensitive data via env vars
3. **AWS IAM permissions** - Use least-privilege SES permissions
4. **Rate limiting** - AWS SES has sending limits (sandbox vs production)
5. **Validation** - Email addresses validated before sending

## 📊 Testing Results

After running `python test_emails.py`, you should see:

```
📊 Summary:
   Total Tests: 15
   Successful: 15
   Failed: 0
   Email Dev Mode: True

📋 Individual Results:
   ✅ 1 Welcome Email: ✅ Sent
   ✅ 2 Billing Receipt: ✅ Sent
   ✅ 3 Resume Ready: ✅ Sent
   ✅ 4 Interview Complete: ✅ Sent
   ✅ 5 Portfolio Deployed: ✅ Sent
   ✅ 6 Support Confirmation: ✅ Sent
   ✅ 7 Security Alert: ✅ Sent
   ✅ 8 Contact Confirmation: ✅ Sent
   ✅ 9 Low Credit Warning: ✅ Sent
   ✅ 10 High Ats Score: ✅ Sent
   ✅ 11 Payment Failed: ✅ Sent
   ✅ 12 Pdf Export Success: ✅ Sent
   ✅ 13 Monthly Credit Reset: ✅ Sent
   ✅ 14 Platform Connected: ✅ Sent
   ✅ 15 Template Unlock: ✅ Sent

✅ EMAIL TESTING COMPLETE
```

## 🎯 Next Steps

1. ✅ Test all emails in development mode
2. ✅ Verify email previews in console logs
3. ✅ Ensure all 15 triggers are working
4. ⏳ Deploy to production with EMAIL_DEV_MODE=False
5. ⏳ Monitor AWS SES sending statistics
6. ⏳ Set up SES production access (remove sandbox restrictions)

## 🆘 Troubleshooting

### Issue: Emails not appearing in logs

**Solution:** Check that EMAIL_DEV_MODE=True in .env and server is reloaded

### Issue: Authentication failed in test script

**Solution:** Get fresh Firebase ID token from browser localStorage

### Issue: Server not starting

**Solution:** Check for import errors in `routers/__init__.py` - ensure email_test is imported

### Issue: Production emails not sending

**Solution:** 
1. Verify EMAIL_DEV_MODE=False
2. Check AWS credentials
3. Verify SES production access (not in sandbox)
4. Check EMAIL_API_URL is correct
5. Monitor AWS SES console for bounces/complaints

---

**Created:** January 11, 2026  
**Last Updated:** January 11, 2026  
**Status:** ✅ All 15 email triggers implemented and tested
