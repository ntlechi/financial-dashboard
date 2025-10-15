/**
 * Firebase Cloud Function: Export User Data
 * 
 * Purpose: Generate a comprehensive .zip archive of all user financial data
 * Returns: Secure download URL for Freedom-Compass-Export-[Date].zip
 * 
 * Contents:
 * - transactions.csv
 * - goals.csv
 * - supply_crates.csv
 * - net_worth_history.csv
 * - my_logbook.csv
 * - travel_plans.csv
 * - side_hustle_entries.csv
 * - investment_holdings.csv
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const archiver = require('archiver');
const { Parser } = require('json2csv');
const { Readable } = require('stream');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Main export function
 * Called from frontend with authentication
 */
exports.exportUserData = functions.https.onCall(async (data, context) => {
  // 🔐 Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to export data'
    );
  }

  const userId = context.auth.uid;
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const zipFileName = `Freedom-Compass-Export-${timestamp}.zip`;

  try {
    console.log(`🚀 Starting export for user: ${userId}`);

    // 📦 Fetch all user data from Firestore
    const userData = await fetchUserData(userId);

    // 📝 Generate CSV files
    const csvFiles = await generateCSVFiles(userData);

    // 🗜️ Create .zip archive
    const downloadURL = await createZipArchive(userId, zipFileName, csvFiles);

    console.log(`✅ Export complete for user: ${userId}`);
    console.log(`📥 Download URL: ${downloadURL}`);

    return {
      success: true,
      downloadURL,
      fileName: zipFileName,
      filesCount: csvFiles.length,
      timestamp
    };

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Export failed: ${error.message}`
    );
  }
});

/**
 * Fetch all user data from multiple Firestore collections
 */
async function fetchUserData(userId) {
  console.log('📊 Fetching user data from Firestore...');

  const userData = {};

  try {
    // 1. Financial data (transactions, goals, net worth, etc.)
    const financialDoc = await db.doc(`users/${userId}/financials/data`).get();
    if (financialDoc.exists()) {
      const financialData = financialDoc.data();
      
      userData.transactions = financialData.transactions || [];
      userData.goals = financialData.goals || [];
      userData.supplyCrates = financialData.supplyCrates || [];
      userData.netWorthHistory = financialData.netWorth?.history || [];
      userData.travelPlans = financialData.travel?.trips || [];
      userData.businesses = financialData.businesses || [];
      userData.investments = financialData.investments?.holdings || [];
      userData.cashFlowHistory = financialData.cashflow?.history || [];
      userData.expenseHistory = financialData.expenses?.history || [];
      userData.incomeHistory = financialData.income?.history || [];
      userData.recurringExpenses = financialData.recurringExpenses || [];
      userData.monthlyHistory = financialData.monthlyHistory || [];
    }

    // 2. Field Notes (My Logbook)
    const fieldNotesDoc = await db.doc(`users/${userId}/financials/data`).get();
    if (fieldNotesDoc.exists()) {
      const notesData = fieldNotesDoc.data();
      userData.fieldNotes = notesData.fieldNotes || [];
      userData.journalEntries = notesData.journalEntries || [];
    }

    // 3. Moments (if exists)
    const momentsSnapshot = await db.collection(`users/${userId}/moments`).get();
    userData.moments = momentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 4. User Profile (gamification data)
    const profileDoc = await db.doc(`userProfiles/${userId}`).get();
    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      userData.profile = {
        rank: profileData.rank || 'Recruit',
        rankLevel: profileData.rankLevel || 1,
        xpPoints: profileData.xpPoints || 0,
        badges: profileData.badges || [],
        completedMissions: profileData.completedMissions || []
      };
    }

    console.log('✅ User data fetched successfully');
    return userData;

  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    throw error;
  }
}

/**
 * Generate CSV files from user data
 */
async function generateCSVFiles(userData) {
  console.log('📝 Generating CSV files...');

  const csvFiles = [];

  try {
    // 1. TRANSACTIONS.CSV
    if (userData.transactions && userData.transactions.length > 0) {
      const transactionsCSV = new Parser({
        fields: [
          { label: 'Date', value: 'date' },
          { label: 'Amount', value: 'amount' },
          { label: 'Type', value: 'type' },
          { label: 'Category', value: 'category' },
          { label: 'Subcategory', value: 'subcategory' },
          { label: 'Description', value: 'description' },
          { label: 'Is Recurring', value: 'isRecurring' },
          { label: 'Tags', value: (row) => (row.tags || []).join('; ') }
        ]
      }).parse(userData.transactions);

      csvFiles.push({ name: 'transactions.csv', content: transactionsCSV });
    }

    // 2. GOALS.CSV
    if (userData.goals && userData.goals.length > 0) {
      const goalsCSV = new Parser({
        fields: [
          { label: 'Goal Name', value: 'name' },
          { label: 'Target Amount', value: 'targetAmount' },
          { label: 'Current Amount', value: 'currentAmount' },
          { label: 'Target Date', value: 'targetDate' },
          { label: 'Progress %', value: (row) => ((row.currentAmount / row.targetAmount) * 100).toFixed(2) }
        ]
      }).parse(userData.goals);

      csvFiles.push({ name: 'goals.csv', content: goalsCSV });
    }

    // 3. SUPPLY_CRATES.CSV (Budget Categories)
    if (userData.supplyCrates && userData.supplyCrates.length > 0) {
      const cratesCSV = new Parser({
        fields: [
          { label: 'Crate Name', value: 'name' },
          { label: 'Icon', value: 'icon' },
          { label: 'Allocated Amount', value: 'allocated' },
          { label: 'Spent Amount', value: 'spent' },
          { label: 'Remaining', value: (row) => (row.allocated - row.spent).toFixed(2) },
          { label: 'Category', value: 'category' },
          { label: 'Month', value: 'month' }
        ]
      }).parse(userData.supplyCrates);

      csvFiles.push({ name: 'supply_crates.csv', content: cratesCSV });
    }

    // 4. NET_WORTH_HISTORY.CSV
    if (userData.netWorthHistory && userData.netWorthHistory.length > 0) {
      const netWorthCSV = new Parser({
        fields: [
          { label: 'Date', value: 'date' },
          { label: 'Net Worth', value: 'total' }
        ]
      }).parse(userData.netWorthHistory);

      csvFiles.push({ name: 'net_worth_history.csv', content: netWorthCSV });
    }

    // 5. MY_LOGBOOK.CSV (Field Notes)
    if (userData.fieldNotes && userData.fieldNotes.length > 0) {
      const logbookCSV = new Parser({
        fields: [
          { label: 'Date Created', value: 'createdAt' },
          { label: 'Note Title', value: 'title' },
          { label: 'Note Content', value: 'content' },
          { label: 'Tags', value: (row) => (row.tags || []).join('; ') }
        ]
      }).parse(userData.fieldNotes);

      csvFiles.push({ name: 'my_logbook.csv', content: logbookCSV });
    }

    // 6. TRAVEL_PLANS.CSV
    if (userData.travelPlans && userData.travelPlans.length > 0) {
      const travelCSV = new Parser({
        fields: [
          { label: 'Trip Name', value: 'name' },
          { label: 'Destination', value: (row) => (row.countries || []).join(', ') },
          { label: 'Start Date', value: 'startDate' },
          { label: 'End Date', value: 'endDate' },
          { label: 'Budget', value: 'budget' },
          { label: 'Total Expenses', value: (row) => (row.expenses || []).reduce((sum, e) => sum + e.amount, 0).toFixed(2) },
          { label: 'Currency', value: 'currency' }
        ]
      }).parse(userData.travelPlans);

      csvFiles.push({ name: 'travel_plans.csv', content: travelCSV });
    }

    // 7. SIDE_HUSTLE_ENTRIES.CSV
    if (userData.businesses && userData.businesses.length > 0) {
      const hustleData = [];
      
      userData.businesses.forEach(business => {
        (business.items || []).forEach(item => {
          hustleData.push({
            businessName: business.name,
            businessCategory: business.category,
            date: item.date,
            description: item.description,
            amount: item.amount,
            type: item.type,
            category: item.category
          });
        });
      });

      if (hustleData.length > 0) {
        const hustleCSV = new Parser({
          fields: [
            { label: 'Business Name', value: 'businessName' },
            { label: 'Business Category', value: 'businessCategory' },
            { label: 'Date', value: 'date' },
            { label: 'Description', value: 'description' },
            { label: 'Amount', value: 'amount' },
            { label: 'Type', value: 'type' },
            { label: 'Category', value: 'category' }
          ]
        }).parse(hustleData);

        csvFiles.push({ name: 'side_hustle_entries.csv', content: hustleCSV });
      }
    }

    // 8. INVESTMENT_HOLDINGS.CSV
    if (userData.investments && userData.investments.length > 0) {
      const investmentsCSV = new Parser({
        fields: [
          { label: 'Asset Name', value: 'name' },
          { label: 'Ticker Symbol', value: 'ticker' },
          { label: 'Shares', value: 'shares' },
          { label: 'Average Cost', value: 'averageCost' },
          { label: 'Current Price', value: 'currentPrice' },
          { label: 'Total Value', value: (row) => (row.shares * row.currentPrice).toFixed(2) },
          { label: 'Gain/Loss', value: (row) => ((row.currentPrice - row.averageCost) * row.shares).toFixed(2) },
          { label: 'DRIP Enabled', value: 'dripEnabled' },
          { label: 'Category', value: 'category' }
        ]
      }).parse(userData.investments);

      csvFiles.push({ name: 'investment_holdings.csv', content: investmentsCSV });
    }

    // 9. MONTHLY_HISTORY.CSV
    if (userData.monthlyHistory && userData.monthlyHistory.length > 0) {
      const monthlyCSV = new Parser({
        fields: [
          { label: 'Month', value: 'month' },
          { label: 'Net Worth', value: 'netWorth' },
          { label: 'Income', value: 'income' },
          { label: 'Expenses', value: 'expenses' },
          { label: 'Cash Flow', value: 'cashflow' },
          { label: 'Savings Rate %', value: 'savingsRate' },
          { label: 'Business Income', value: 'businessIncome' },
          { label: 'Investment Value', value: 'investmentValue' }
        ]
      }).parse(userData.monthlyHistory);

      csvFiles.push({ name: 'monthly_history.csv', content: monthlyCSV });
    }

    // 10. RECURRING_EXPENSES.CSV
    if (userData.recurringExpenses && userData.recurringExpenses.length > 0) {
      const recurringCSV = new Parser({
        fields: [
          { label: 'Description', value: 'description' },
          { label: 'Amount', value: 'amount' },
          { label: 'Frequency', value: 'frequency' },
          { label: 'Next Due Date', value: 'nextDueDate' },
          { label: 'Category', value: 'category' },
          { label: 'Is Active', value: 'isActive' }
        ]
      }).parse(userData.recurringExpenses);

      csvFiles.push({ name: 'recurring_expenses.csv', content: recurringCSV });
    }

    // 11. PROFILE_STATS.CSV (Gamification Summary)
    if (userData.profile) {
      const profileCSV = new Parser({
        fields: [
          { label: 'Rank', value: 'rank' },
          { label: 'Level', value: 'rankLevel' },
          { label: 'Total XP', value: 'xpPoints' },
          { label: 'Badges Earned', value: (row) => row.badges.length },
          { label: 'Missions Completed', value: (row) => Object.keys(row.completedMissions || {}).filter(k => row.completedMissions[k]).length }
        ]
      }).parse([userData.profile]);

      csvFiles.push({ name: 'profile_stats.csv', content: profileCSV });
    }

    console.log(`✅ Generated ${csvFiles.length} CSV files`);
    return csvFiles;

  } catch (error) {
    console.error('❌ Error generating CSV files:', error);
    throw error;
  }
}

/**
 * Create .zip archive and upload to Firebase Storage
 */
async function createZipArchive(userId, zipFileName, csvFiles) {
  console.log('🗜️ Creating .zip archive...');

  return new Promise((resolve, reject) => {
    const bucket = storage.bucket();
    const file = bucket.file(`exports/${userId}/${zipFileName}`);
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: 'application/zip',
        metadata: {
          userId,
          exportDate: new Date().toISOString(),
          filesCount: csvFiles.length
        }
      }
    });

    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle errors
    archive.on('error', (error) => {
      console.error('❌ Archive error:', error);
      reject(error);
    });

    archive.on('warning', (warning) => {
      console.warn('⚠️ Archive warning:', warning);
    });

    // Pipe archive to writeStream
    archive.pipe(writeStream);

    // Add each CSV file to archive
    csvFiles.forEach(({ name, content }) => {
      archive.append(content, { name });
      console.log(`  ✅ Added: ${name}`);
    });

    // Finalize archive
    archive.finalize();

    // Wait for upload to complete
    writeStream.on('finish', async () => {
      console.log('✅ .zip archive created and uploaded to Firebase Storage');

      // Generate signed URL (valid for 7 days)
      const [downloadURL] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      console.log('🔗 Signed URL generated');
      resolve(downloadURL);
    });

    writeStream.on('error', (error) => {
      console.error('❌ WriteStream error:', error);
      reject(error);
    });
  });
}
