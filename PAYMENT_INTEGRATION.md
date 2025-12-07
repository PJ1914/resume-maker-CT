# Payment Integration Guide

This document explains the payment system integration with Razorpay and AWS Lambda.

## Architecture

```
Frontend (React) → Backend (FastAPI) → Lambda (Payment Processing) → Razorpay → DynamoDB
                                     ↓
                                  Email Service (SES)
```

## Flow

### 1. Create Order
- User selects a credit package
- Frontend calls `POST /api/payments/create-order`
- Backend forwards request to Lambda
- Lambda creates Razorpay order and stores in DynamoDB
- Order details returned to frontend

### 2. Payment
- Frontend opens Razorpay checkout modal
- User completes payment
- Razorpay returns payment details (order_id, payment_id, signature)

### 3. Verify Payment
- Frontend calls `POST /api/payments/verify` with payment details
- Backend verifies signature locally
- Backend calls Lambda to verify and process payment
- Lambda:
  - Verifies payment with Razorpay API
  - Adds credits to user's Firestore account
  - Sends confirmation email via SES
  - Updates DynamoDB with transaction details
- Credits are synced in backend

## Setup

### Backend Environment Variables

Add to `backend/.env`:

```env
PAYMENT_LAMBDA_ENDPOINT=https://bm9kndx62m.execute-api.us-east-1.amazonaws.com/dev
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

### Frontend Environment Variables

Add to `frontend/.env.development`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

For production, use `frontend/.env.production`:

```env
VITE_API_URL=https://your-api-domain.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

## API Endpoints

### Create Order

**POST** `/api/payments/create-order`

Request:
```json
{
  "plan_id": "PLAN#Resume",
  "quantity": 100
}
```

Response:
```json
{
  "order_id": "order_xxxxx",
  "amount": 49900,
  "currency": "INR",
  "receipt": "receipt_xxxxx"
}
```

### Verify Payment

**POST** `/api/payments/verify`

Request:
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "credits_added": 100,
  "user_id": "user_xxxxx"
}
```

### Get Plans

**GET** `/api/payments/plans`

Response:
```json
{
  "PK": "PLAN#Resume",
  "SK": "METADATA",
  "plan_name": "Resume Credits",
  "plans": [
    {
      "price": 499,
      "quantity": 100
    },
    {
      "price": 1999,
      "quantity": 500
    }
  ]
}
```

## Lambda Integration

### Lambda Endpoints

#### Create Order
**POST** `/payments/create-order`

```json
{
  "plan_id": "PLAN#Resume",
  "quantity": 100,
  "user_id": "firebase_user_id"
}
```

#### Verify Payment
**POST** `/payments/verify`

```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "user_id": "firebase_user_id"
}
```

#### Get Plans
**GET** `/payments/plans/{plan_id}`

## Testing

### Test Mode

Use Razorpay test credentials:
- Key ID: `rzp_test_xxxxx`
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

### Test Flow

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Navigate to `/credits/purchase`
4. Select a package
5. Use test card: `4111 1111 1111 1111`
6. Complete payment
7. Verify credits are added

## Security

- Payment signature is verified on backend before processing
- All API calls require authentication
- Razorpay secret key is never exposed to frontend
- Lambda handles sensitive payment processing
- Transaction logs stored in DynamoDB

## Email Notifications

Lambda sends email notifications for:
- Successful payment
- Payment failure
- Credit addition confirmation

Emails are sent via AWS SES.

## Troubleshooting

### Payment Not Verified
- Check Lambda logs in CloudWatch
- Verify Razorpay credentials
- Ensure signature verification is working
- Check DynamoDB for transaction record

### Credits Not Added
- Check Firestore credits collection
- Verify Lambda has access to Firestore
- Check Lambda execution logs

### Email Not Sent
- Verify SES configuration
- Check email is verified in SES
- Review Lambda CloudWatch logs

## Production Checklist

- [ ] Update Razorpay keys to live mode
- [ ] Configure production Lambda endpoint
- [ ] Set up SES for production emails
- [ ] Configure DynamoDB with proper indexes
- [ ] Enable CloudWatch alarms for payment failures
- [ ] Test payment flow end-to-end
- [ ] Set up webhook for payment status
- [ ] Configure proper error handling and retries
