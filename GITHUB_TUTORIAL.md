# Tutorial: Push Project to GitHub

This guide will walk you through the process of pushing your Restaurant POS System project to GitHub.

## Prerequisites

- Git is installed on your system
- A GitHub account (if you don't have one, create it at [github.com](https://github.com))
- Your project is already initialized with Git (✓ Already done!)

## Step-by-Step Instructions

### Step 1: Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `Restaurant-POS-System` (or any name you prefer)
   - **Description**: (Optional) Add a description like "Restaurant Point of Sale System built with Laravel and React"
   - **Visibility**: Choose **Public** or **Private**
   - **⚠️ IMPORTANT**: Do NOT initialize with README, .gitignore, or license (since your project already has these)
5. Click **"Create repository"**

### Step 2: Add GitHub Remote to Your Local Repository

After creating the repository, GitHub will show you a page with setup instructions. You'll need the repository URL (it looks like: `https://github.com/yourusername/Restaurant-POS-System.git` or `git@github.com:yourusername/Restaurant-POS-System.git`)

Run this command in your terminal (replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values):

```bash
cd /Users/kalingga/Dev/Telkom/SEM\ 03/TUBES/Restaurant-POS-System
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**Alternative (SSH):** If you have SSH keys set up with GitHub:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

**To verify the remote was added:**
```bash
git remote -v
```

You should see your remote URL listed.

### Step 3: Check Your Current Branch

Your project is currently on the `master` branch. Check with:
```bash
git branch
```

### Step 4: Push Your Code to GitHub

#### Option A: If your local branch is `master` and GitHub uses `main`:

Many GitHub repositories use `main` as the default branch. If your repository uses `main`, you can either:

**Rename your local branch to `main`:**
```bash
git branch -M main
git push -u origin main
```

**Or push to `master` and set it as upstream:**
```bash
git push -u origin master
```

#### Option B: If your repository uses `master`:

```bash
git push -u origin master
```

The `-u` flag sets up tracking so future pushes can be done with just `git push`.

### Step 5: Verify Your Push

1. Go back to your GitHub repository page in your browser
2. Refresh the page
3. You should see all your project files listed!

## Common Commands Reference

### Check Git Status
```bash
git status
```

### View Remote Repositories
```bash
git remote -v
```

### Remove a Remote (if you need to change it)
```bash
git remote remove origin
```

### Push Future Changes
After the initial push, you can push future changes with:
```bash
git add .
git commit -m "Your commit message"
git push
```

### Pull Latest Changes (if working from multiple machines)
```bash
git pull origin master
# or
git pull origin main
```

## Troubleshooting

### Error: "remote origin already exists"
If you get this error, you can either:
- Remove the existing remote: `git remote remove origin` then add it again
- Or update it: `git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`

### Error: "Authentication failed"
- Make sure you're logged into GitHub
- For HTTPS: You may need to use a Personal Access Token instead of your password
- For SSH: Make sure your SSH key is added to your GitHub account

### Error: "Permission denied"
- Check that you have write access to the repository
- Verify the repository URL is correct

## Next Steps

After pushing to GitHub, you might want to:
- Add a README.md file with project description
- Set up GitHub Actions for CI/CD
- Add collaborators to your repository
- Create branches for different features
- Set up deployment to a hosting service

## Quick Reference: Complete Workflow

```bash
# 1. Navigate to project directory
cd /Users/kalingga/Dev/Telkom/SEM\ 03/TUBES/Restaurant-POS-System

# 2. Add remote (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Check current branch
git branch

# 4. Push to GitHub
git push -u origin master
# OR if using main branch:
git branch -M main
git push -u origin main
```

---

**Note:** Make sure your `.env` file is in `.gitignore` (it already is!) so you don't accidentally push sensitive information like database credentials or API keys.

