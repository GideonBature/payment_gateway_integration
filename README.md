# Flutterwave Payment Gateway Integration

This project demonstrates how to integrate Flutterwave payment gateway with a React (Vite) frontend and Node.js (Express) backend.

## Project Structure

```
payment_gateway_integration/
├── backend/               # Express server
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env.example      # Environment variables example
└── frontend/             # React (Vite) application
    ├── src/              # Source files
    │   ├── components/   # React components
    │   └── App.jsx       # Main App component
    ├── package.json      # Frontend dependencies
    └── .env.example      # Environment variables example
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Flutterwave API keys to `.env`:
   ```
   FLW_PUBLIC_KEY=your_public_key
   FLW_SECRET_KEY=your_secret_key
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Flutterwave public key to `.env`:
   ```
   VITE_FLW_PUBLIC_KEY=your_public_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## How It Works

1. The frontend collects payment information (amount, email, name, phone) through a form.
2. When the form is submitted, it sends a request to the backend to initialize the payment.
3. The backend creates a payment transaction using Flutterwave's API.
4. Flutterwave's payment modal opens for the user to complete the payment.
5. After payment, Flutterwave redirects back to your application.
6. The backend verifies the payment using Flutterwave's verification endpoint.

## Testing

For testing, you can use Flutterwave's test cards available in their documentation:
- Test Card Number: 5531 8866 5214 2950
- CVV: 564
- Expiry: 09/32
- PIN: 3310
- OTP: 12345

## Important Notes

1. Always use test API keys during development.
2. Never commit your `.env` files to version control.
3. Implement proper error handling and validation in production.
4. Follow Flutterwave's security best practices.

## Learn More

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
