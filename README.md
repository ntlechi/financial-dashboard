# The Freedom Compass App

A comprehensive React-based financial dashboard with Firebase backend and Vercel deployment support. Track your net worth, income, expenses, investments, and budget with a modern, responsive interface.

## Features

- **Dashboard Overview**: Net Worth, Income, Expenses, and Cash Flow tracking
- **Side Hustle Management**: Track business income/expenses with real-time calculations
- **Budget Calculator**: 50/30/20 rule and 6 Jars budgeting system
- **Investment Portfolio**: Holdings management and performance tracking
- **Transaction Management**: Complete transaction history and categorization
- **Responsive Design**: Mobile and desktop optimized
- **Firebase Integration**: Real-time data sync with Firestore
- **Anonymous Authentication**: Quick setup without account creation

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Backend**: Firebase Firestore, Firebase Auth
- **Visualization**: D3.js for charts and graphs
- **Deployment**: Vercel
- **Build Tools**: React Scripts, PostCSS, Autoprefixer

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd financial-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Firebase configuration to `.env`:
```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm start
```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication with Anonymous sign-in
4. Copy the configuration values to your `.env` file

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set environment variables in Vercel dashboard or CLI

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard view
│   ├── SideHustle.js    # Side hustle tracking
│   ├── BudgetCalculator.js # Budget management
│   ├── Portfolio.js     # Investment portfolio
│   └── Transactions.js  # Transaction management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── context/            # React context providers
├── firebase.js         # Firebase configuration
├── App.js              # Main App component
├── index.js            # App entry point
└── index.css           # Global styles
```

## Key Dependencies

- `react: ^18.2.0` - Core React library
- `firebase: ^12.1.0` - Firebase SDK
- `tailwindcss: ^3.4.17` - Utility-first CSS framework
- `d3: ^7.9.0` - Data visualization library
- `lucide-react: ^0.539.0` - Modern icon library

## Budget Calculator Layout

The Budget Calculator tab uses a specific container layout for proper full-width desktop display:

```jsx
<div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
  {/* Budget calculator content */}
</div>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.