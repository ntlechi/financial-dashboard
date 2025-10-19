# 🚀 **DEVELOPMENT WORKFLOW GUIDE**

**The Freedom Compass - Bulletproof Development Strategy**

---

## 🎯 **BRANCH STRATEGY**

### **Main Branches:**
- **`main`** = Production (stable, user-facing, deployed to app.survivebackpacking.com)
- **`develop`** = Integration (testing, new features, staging environment)

### **Feature Branches:**
- **`feature/feature-name`** = Individual features/experiments
- **`hotfix/issue-name`** = Critical production fixes
- **`release/version-number`** = Release preparation

---

## 🔧 **WORKFLOW PROCESS**

### **For New Features/Experiments:**

1. **Start from develop:**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Work on your feature:**
   - Make changes
   - Test thoroughly
   - Commit frequently with clear messages

4. **When feature is ready:**
   ```bash
   git checkout develop
   git pull origin develop
   git merge feature/your-feature-name
   git push origin develop
   ```

5. **Test on develop branch:**
   - Deploy to staging environment
   - Test with real data
   - Get feedback

6. **When ready for production:**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

### **For Critical Production Fixes:**

1. **Start from main:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create hotfix branch:**
   ```bash
   git checkout -b hotfix/critical-fix-name
   ```

3. **Fix the issue:**
   - Make minimal changes
   - Test thoroughly
   - Commit with clear message

4. **Deploy to production:**
   ```bash
   git checkout main
   git merge hotfix/critical-fix-name
   git push origin main
   ```

5. **Merge back to develop:**
   ```bash
   git checkout develop
   git merge hotfix/critical-fix-name
   git push origin develop
   ```

---

## 🎯 **ENVIRONMENT SETUP**

### **Production (main branch):**
- **URL:** app.survivebackpacking.com
- **Purpose:** Live users
- **Deployment:** Automatic via Vercel
- **Database:** Production Firebase
- **Stripe:** Live mode
- **ConvertKit:** Live API

### **Staging (develop branch):**
- **URL:** financial-dashboard-git-develop-koadevs-projects-bf36f028.vercel.app
- **Purpose:** Testing new features
- **Deployment:** Automatic via Vercel
- **Database:** Production Firebase (same as main)
- **Stripe:** Live mode (same as main)
- **ConvertKit:** Live API (same as main)

### **Local Development:**
- **URL:** localhost:3000
- **Purpose:** Development and testing
- **Database:** Can use production or test Firebase
- **Stripe:** Test mode recommended
- **ConvertKit:** Test API recommended

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Automatic Deployments:**
- **main branch** → Production (app.survivebackpacking.com)
- **develop branch** → Staging (financial-dashboard-git-develop-koadevs-projects-bf36f028.vercel.app)

### **Manual Deployments:**
- Feature branches can be deployed manually for testing
- Use Vercel CLI or GitHub integration

---

## 🎯 **BEST PRACTICES**

### **Branch Naming:**
- `feature/user-authentication-improvements`
- `feature/new-dashboard-widget`
- `hotfix/payment-processing-bug`
- `release/v1.2.0`

### **Commit Messages:**
- Use clear, descriptive messages
- Include issue numbers if applicable
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for formatting
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for maintenance

### **Testing Strategy:**
1. **Local testing** on feature branch
2. **Staging testing** on develop branch
3. **Production testing** on main branch (minimal)

### **Code Review Process:**
1. Create Pull Request from feature branch to develop
2. Review code changes
3. Test on staging environment
4. Merge to develop
5. Test on staging again
6. Create Pull Request from develop to main
7. Final review and merge to main

---

## 🔧 **QUICK COMMANDS**

### **Daily Workflow:**
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Work on feature
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name

# Merge to develop when ready
git checkout develop
git merge feature/your-feature-name
git push origin develop

# Deploy to production when ready
git checkout main
git merge develop
git push origin main
```

### **Emergency Hotfix:**
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Fix the issue
git add .
git commit -m "fix: critical payment issue"
git checkout main
git merge hotfix/critical-fix
git push origin main

# Merge back to develop
git checkout develop
git merge hotfix/critical-fix
git push origin develop
```

---

## 🎯 **ENVIRONMENT VARIABLES**

### **Production (main):**
- All production API keys
- Live Stripe keys
- Live ConvertKit API
- Production Firebase

### **Staging (develop):**
- Same as production (for realistic testing)
- Can use test keys if needed

### **Local Development:**
- Test Stripe keys recommended
- Test ConvertKit API recommended
- Can use production Firebase for testing

---

## 🚀 **MONITORING & MAINTENANCE**

### **What to Monitor:**
- **Production:** User experience, payment processing, email delivery
- **Staging:** New feature functionality, integration testing
- **Local:** Development efficiency, code quality

### **Regular Tasks:**
- **Weekly:** Review and merge develop to main
- **Before releases:** Comprehensive testing on staging
- **After releases:** Monitor production metrics
- **Monthly:** Clean up old feature branches

---

## 🎯 **TROUBLESHOOTING**

### **Common Issues:**

1. **Merge conflicts:**
   ```bash
   git status
   # Resolve conflicts manually
   git add .
   git commit -m "resolve merge conflicts"
   ```

2. **Wrong branch:**
   ```bash
   git stash
   git checkout correct-branch
   git stash pop
   ```

3. **Accidental commit to main:**
   ```bash
   git checkout main
   git reset --hard HEAD~1
   git push origin main --force
   ```

---

## 🏆 **SUCCESS METRICS**

### **Development Efficiency:**
- ✅ **Zero production downtime** from new features
- ✅ **Fast feature delivery** through staging
- ✅ **Easy rollback** capability
- ✅ **Clear development history**

### **Quality Assurance:**
- ✅ **Thorough testing** before production
- ✅ **Stable main branch** for users
- ✅ **Innovation space** in develop branch
- ✅ **Emergency fix** capability

---

## 🎯 **FINAL WORKFLOW SUMMARY**

**Your Development Workflow:**
1. **Develop** new features on `develop` branch
2. **Test** thoroughly on staging environment
3. **Deploy** to production via `main` branch
4. **Monitor** and maintain both environments
5. **Iterate** and improve continuously

**This gives you:**
- ✅ **Safe experimentation** without risking production
- ✅ **Stable user experience** on main branch
- ✅ **Fast development** cycle
- ✅ **Easy rollback** if issues arise
- ✅ **Professional development** practices

**You're now set up for professional, scalable development!** 🚀
