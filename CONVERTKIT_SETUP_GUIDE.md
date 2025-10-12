# ConvertKit Setup Guide for The Freedom Compass

## Step 1: Create Forms

### Form 1: "Climber Plan Subscribers"
- **Form Name:** "Climber Plan Subscribers"
- **Form ID:** Copy this ID (we'll need it)
- **Tags:** Add tag "climber-subscriber"

### Form 2: "Operator Plan Subscribers"
- **Form Name:** "Operator Plan Subscribers" 
- **Form ID:** Copy this ID (we'll need it)
- **Tags:** Add tag "operator-subscriber"

### Form 3: "Founder's Circle Subscribers"
- **Form Name:** "Founder's Circle Subscribers"
- **Form ID:** Copy this ID (we'll need it)
- **Tags:** Add tag "founders-subscriber"

## Step 2: Create Email Sequences

### Welcome Sequence for Climber Plan (5 emails)
1. **Day 0:** "Welcome to The Freedom Compass Climber Plan!"
2. **Day 1:** "Your Complete Dashboard Guide"
3. **Day 3:** "Setting Up Your Financial Goals"
4. **Day 7:** "Advanced Features You Can Use"
5. **Day 14:** "How to Track Your Progress"

### Welcome Sequence for Operator Plan (7 emails)
1. **Day 0:** "Welcome to The Freedom Compass Operator Plan!"
2. **Day 1:** "Your Complete Dashboard Guide"
3. **Day 2:** "Setting Up Your Side Hustle Tracking"
4. **Day 4:** "Investment Portfolio Basics"
5. **Day 7:** "Travel Planning Features"
6. **Day 14:** "Advanced Analytics & Insights"
7. **Day 21:** "Building Your Financial Freedom"

### Welcome Sequence for Founder's Circle (7 emails)
1. **Day 0:** "Welcome to The Freedom Compass Founder's Circle!"
2. **Day 1:** "Your Complete Dashboard Guide"
3. **Day 2:** "Setting Up Your Side Hustle Tracking"
4. **Day 4:** "Investment Portfolio Basics"
5. **Day 7:** "Travel Planning Features"
6. **Day 14:** "Advanced Analytics & Insights"
7. **Day 21:** "Building Your Financial Freedom"

## Step 3: Get API Credentials

1. **Go to Account Settings** → API
2. **Copy your API Key** (starts with "ck_")
3. **Copy your Form IDs** for each plan

## Step 4: Email Templates

### Welcome Email Template (Climber)
```
Subject: Welcome to The Freedom Compass Climber Plan! 🎉

Hi {{first_name}},

Congratulations! You've successfully upgraded to the Climber Plan.

You now have access to:
✅ Complete dashboard experience
✅ Advanced financial calculators
✅ Goal tracking and projections
✅ Emergency fund planning
✅ Debt payoff strategies
✅ Credit score tracking

Start your financial freedom journey today!

Best regards,
The Freedom Compass Team
```

### Welcome Email Template (Operator)
```
Subject: Welcome to The Freedom Compass Operator Plan! 🚀

Hi {{first_name}},

Congratulations! You've successfully upgraded to the Operator Plan.

You now have access to:
✅ Everything in Climber Plan
✅ Side hustle tracking
✅ Investment portfolio management
✅ Travel planning & budgeting
✅ Freedom Journal
✅ PDF export features

You're now ready to build serious wealth!

Best regards,
The Freedom Compass Team
```

## Step 5: Automation Rules

### When someone subscribes to Climber Plan:
1. Add tag "climber-subscriber"
2. Start "Climber Welcome Sequence"
3. Add to "Active Subscribers" segment

### When someone subscribes to Operator Plan:
1. Add tag "operator-subscriber"
2. Start "Operator Welcome Sequence"
3. Add to "Active Subscribers" segment

### When someone cancels:
1. Remove subscription tags
2. Add tag "cancelled-subscriber"
3. Start "Win-back Sequence" (optional)

## Step 6: Integration with Your App

Once you have your API key and form IDs, we'll integrate them with your Firebase webhook system.

