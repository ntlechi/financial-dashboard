# 🚀 **QUICK WORKFLOW REFERENCE**

**Daily Development Commands for The Freedom Compass**

---

## 🎯 **START NEW FEATURE**

```bash
# 1. Switch to develop and update
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Work on your feature
# ... make changes ...

# 4. Commit your work
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

---

## 🎯 **MERGE FEATURE TO DEVELOP**

```bash
# 1. Switch to develop
git checkout develop
git pull origin develop

# 2. Merge your feature
git merge feature/your-feature-name

# 3. Push to develop (triggers staging deployment)
git push origin develop

# 4. Test on staging environment
# URL: financial-dashboard-git-develop-koadevs-projects-bf36f028.vercel.app
```

---

## 🎯 **DEPLOY TO PRODUCTION**

```bash
# 1. Switch to main
git checkout main
git pull origin main

# 2. Merge develop to main
git merge develop

# 3. Push to main (triggers production deployment)
git push origin main

# 4. Monitor production
# URL: app.survivebackpacking.com
```

---

## 🎯 **EMERGENCY HOTFIX**

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix-name

# 2. Fix the issue
# ... make minimal changes ...

# 3. Commit and deploy
git add .
git commit -m "fix: critical issue description"
git checkout main
git merge hotfix/critical-fix-name
git push origin main

# 4. Merge back to develop
git checkout develop
git merge hotfix/critical-fix-name
git push origin develop
```

---

## 🎯 **BRANCH STATUS CHECK**

```bash
# See all branches
git branch -a

# See current branch
git branch

# See recent commits
git log --oneline -10

# See what's changed
git status
```

---

## 🎯 **ENVIRONMENT URLS**

- **Production:** app.survivebackpacking.com (main branch)
- **Staging:** financial-dashboard-git-develop-koadevs-projects-bf36f028.vercel.app (develop branch)
- **Local:** localhost:3000

---

## 🎯 **COMMIT MESSAGE FORMAT**

```bash
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

---

## 🎯 **QUICK TROUBLESHOOTING**

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (lose changes)
git reset --hard HEAD~1

# Stash current changes
git stash

# Apply stashed changes
git stash pop

# See what's in stash
git stash list
```

---

## 🎯 **DAILY WORKFLOW SUMMARY**

1. **Start:** `git checkout develop && git pull origin develop`
2. **Feature:** `git checkout -b feature/name`
3. **Work:** Make changes, commit frequently
4. **Test:** `git checkout develop && git merge feature/name && git push origin develop`
5. **Deploy:** `git checkout main && git merge develop && git push origin main`

**That's it! You're now a Git Flow master!** 🚀
