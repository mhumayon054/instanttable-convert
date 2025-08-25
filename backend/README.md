# InstantTable Convert - Backend API

A professional Node.js + Express backend for converting HTML tables to CSV format with Stripe payment integration.

## Features

- 🔄 HTML Table to CSV conversion
- 💳 Stripe payment processing
- 📊 MongoDB data storage
- 🔒 Input validation and sanitization
- 📈 Rate limiting and security
- 🚀 Production-ready deployment

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Payment**: Stripe
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Cheerio, Custom validators

## Quick Start

### Prerequisites

- Node.js 16+ 
- MongoDB (local or Atlas)
- Stripe account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/mhumayon054/instanttable-convert
cd instanttable-convert/backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start the server:
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

## Environment Variables

Create a `.env` file in the backend directory:

\`\`\`env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/instanttable-convert

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Optional: JWT Secret for future authentication
JWT_SECRET=your_jwt_secret_here
\`\`\`

## API Endpoints

### Health Check
\`\`\`
GET /api/health
\`\`\`

### Payment Routes
\`\`\`
POST /api/payment/create          # Create payment intent
POST /api/payment/verify          # Verify payment status
GET  /api/payment/history/:email  # Get payment history
\`\`\`

### Table Conversion Routes
\`\`\`
POST /api/table/convert           # Convert HTML table to CSV
GET  /api/table/history/:email    # Get conversion history
GET  /api/table/download/:id      # Download CSV file
\`\`\`

## API Usage Examples

### Convert Table to CSV

\`\`\`javascript
const response = await fetch('/api/table/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tableHTML: '<table><tr><th>Name</th><th>Age</th></tr><tr><td>John</td><td>30</td></tr></table>',
    userEmail: 'user@example.com',
    fileName: 'my_table.csv'
  })
});

const result = await response.json();
console.log(result.csvData); // CSV string
\`\`\`

### Create Payment Intent

\`\`\`javascript
const response = await fetch('/api/payment/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 500, // $5.00 in cents
    email: 'user@example.com',
    currency: 'usd'
  })
});

const result = await response.json();
console.log(result.clientSecret); // Use with Stripe frontend
\`\`\`

## Deployment

### Heroku Deployment

1. Install Heroku CLI
2. Create Heroku app:
\`\`\`bash
heroku create your-app-name
\`\`\`

3. Set environment variables:
\`\`\`bash
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set STRIPE_SECRET_KEY=your_stripe_key
heroku config:set NODE_ENV=production
\`\`\`

4. Deploy:
\`\`\`bash
git push heroku main
\`\`\`

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Docker Deployment

\`\`\`bash
# Build image
docker build -t instanttable-backend .

# Run container
docker run -p 5000:5000 --env-file .env instanttable-backend
\`\`\`

## Security Features

- **Input Sanitization**: HTML content is sanitized to prevent XSS
- **Rate Limiting**: API endpoints are rate-limited
- **CORS Protection**: Configured for specific frontend domains
- **Helmet Security**: Security headers enabled
- **Data Validation**: All inputs are validated before processing

## Database Schema

### UserPayment Collection
\`\`\`javascript
{
  email: String,
  amount: Number,
  paymentId: String,
  currency: String,
  status: String,
  date: Date
}
\`\`\`

### TableConversion Collection
\`\`\`javascript
{
  userEmail: String,
  tableHTML: String,
  csvData: String,
  fileName: String,
  rowCount: Number,
  columnCount: Number,
  conversionDate: Date,
  conversionStatus: String
}
\`\`\`

## Development

### Scripts
\`\`\`bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
\`\`\`

### Project Structure
\`\`\`
backend/
├── controllers/     # Business logic
├── models/         # MongoDB schemas
├── routes/         # API routes
├── utils/          # Utility functions
├── server.js       # Main server file
└── package.json    # Dependencies
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
