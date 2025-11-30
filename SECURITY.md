# Security Best Practices

## Environment Variables

### ✅ What We Fixed
1. **Removed hardcoded CORS origins** - Now MUST be set via `.env` file
2. **Added validation** - CORS_ORIGINS cannot be empty
3. **Case-sensitive config** - Prevents accidental misconfigurations
4. **Production warnings** - Alerts if critical settings are missing

### 🔒 Critical Settings (REQUIRED)

#### CORS_ORIGINS
- **Purpose**: Controls which domains can access your API
- **Security**: NEVER commit actual values to git
- **Format**: Comma-separated list of full URLs
- **Example**: `CORS_ORIGINS=https://prativeda.codetapasya.com`
- **⚠️ DO NOT** use wildcards (`*`) in production

#### Firebase Service Accounts
- **Files**: Keep `.json` files outside the repository
- **Permissions**: Set file permissions to `600` (read/write for owner only)
- **Never commit**: Add to `.gitignore`

#### GEMINI_API_KEY
- **Obtain from**: https://makersuite.google.com/app/apikey
- **Rotate regularly**: Change keys every 90 days
- **Monitor usage**: Track API calls to detect abuse

## File Upload Security

### Implemented Protections
1. **File size limit**: Configurable via `MAX_UPLOAD_SIZE_MB` (default: 10MB)
2. **File type validation**: Only PDF, DOC, DOCX allowed
3. **Content-type checking**: Validates MIME types
4. **Filename sanitization**: Removes dangerous characters

### Additional Recommendations
1. **Virus scanning**: Consider integrating ClamAV or similar
2. **Content validation**: Verify files are actually PDFs (not renamed executables)
3. **Storage quotas**: Implement per-user storage limits

## Rate Limiting

### Current Limits
- **API requests**: 60 per minute (configurable)
- **Gemini AI calls**: 50 per user per day (configurable)

### Recommendations
- Monitor for abuse patterns
- Implement IP-based rate limiting for unauthenticated endpoints
- Add exponential backoff for failed requests

## Authentication & Authorization

### Current Implementation
- Firebase Authentication tokens
- User ID validation on all protected endpoints
- Owner-only access to resume data

### Recommendations
1. **Token expiration**: Enforce session timeouts
2. **Refresh tokens**: Implement token rotation
3. **Audit logging**: Track all data access and modifications

## Data Protection

### Implemented
- User-scoped data access (users can only access their own resumes)
- Secure file storage in Firebase Storage
- Metadata separation from file content

### Recommendations
1. **Encryption at rest**: Enable Firebase encryption
2. **Encryption in transit**: Enforce HTTPS only
3. **Data retention**: Implement automatic deletion of old resumes
4. **PII handling**: Ensure GDPR/privacy compliance

## Production Deployment Checklist

- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Configure production CORS origins (no localhost)
- [ ] Use strong, unique API keys
- [ ] Enable Firebase security rules
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Enable access logs
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Review and test all security settings
- [ ] Document incident response procedures

## Security Headers

### Recommended Headers (add to main.py)
```python
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

## Monitoring

### What to Monitor
1. Failed authentication attempts
2. Unusual API usage patterns
3. Large file uploads
4. Excessive AI API calls
5. Error rates and types

### Tools
- Application logs
- Firebase Analytics
- Custom metrics dashboard
- Alert thresholds

## Incident Response

### If API Keys Are Compromised
1. Immediately rotate all affected keys
2. Review access logs for unauthorized usage
3. Notify affected users if data was accessed
4. Update security documentation

### If Data Breach Occurs
1. Isolate affected systems
2. Preserve evidence
3. Notify stakeholders
4. Follow legal requirements (GDPR, etc.)
5. Conduct post-mortem analysis

## Regular Security Tasks

### Weekly
- Review error logs
- Check for unusual activity

### Monthly
- Review and update dependencies
- Check for security advisories
- Test backup restoration

### Quarterly
- Rotate API keys
- Security audit
- Update security documentation
- Review access controls

## Contact

For security issues, contact: [your-security-email@domain.com]
