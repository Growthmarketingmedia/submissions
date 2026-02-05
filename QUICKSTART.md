# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

Open PowerShell or Command Prompt and run:

```powershell
cd "c:\Users\amirs\OneDrive\Documents\Submission"
npm install
```

> **Note:** If you get a PowerShell execution policy error, you can run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Step 2: Run the Development Server

```powershell
npm run dev
```

Wait for the server to start. You should see:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

### Step 3: Open the Dashboard

Open your browser and go to: **http://localhost:3000**

You'll see:
- ✅ Dashboard with "Optima Spray Foam" website
- ✅ 2 sample submissions
- ✅ Click on the website to view submissions table
- ✅ Test the search and date filters
- ✅ Click on a submission to see details
- ✅ Try exporting to CSV

---

## 📧 Update Email Notification Address

Edit `.env.local` and change:
```env
NOTIFICATION_EMAIL=your@email.com
```
to your actual email address.

---

## 🌐 Deploy to Vercel (Production)

### Option 1: GitHub + Vercel Dashboard

1. **Push to GitHub**
   ```bash
   cd "c:\Users\amirs\OneDrive\Documents\Submission"
   git init
   git add .
   git commit -m "Initial commit - Centralized submission system"
   git remote add origin https://github.com/Growthmarketingmedia/submissions.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     - `RESEND_API_KEY` = `re_fvcHiR15_4Z65GQT9MJZWi9QQguMLxQwJs`
     - `NOTIFICATION_EMAIL` = `your@email.com`
     - `NEXT_PUBLIC_API_URL` = (will be your Vercel URL)
   - Click "Deploy"

3. **Update API URL**
   After deployment, update `NEXT_PUBLIC_API_URL` in Vercel settings to your deployment URL (e.g., `https://submissions.vercel.app`)

---

## 🔗 Integrate with Optima Spray Foam

Once deployed, follow these steps:

### 1. Add Environment Variable to Optima Spray Foam

In your Optima Spray Foam project, add to `.env.local`:
```env
NEXT_PUBLIC_SUBMISSIONS_API=https://your-submissions-app.vercel.app/api/submit
```

### 2. Update Contact Form

Find your contact form component and update the submit handler:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const response = await fetch(process.env.NEXT_PUBLIC_SUBMISSIONS_API!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      websiteName: 'Optima Spray Foam',
      websiteUrl: 'https://www.optimasprayfoam.com',
      formData: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: formData.message,
      },
    }),
  });

  const result = await response.json();
  if (result.success) {
    // Show success message
  }
};
```

### 3. Test Integration

1. Submit a test form on Optima Spray Foam
2. Check the submissions dashboard
3. Verify email notification received
4. Confirm data appears correctly

---

## 📖 Full Documentation

- **README.md** - Complete project documentation
- **INTEGRATION.md** - Detailed integration guide with examples
- **walkthrough.md** - Full feature walkthrough

---

## ✅ What's Already Done

- ✅ Next.js project set up
- ✅ API endpoints created
- ✅ Dashboard UI built
- ✅ Email integration configured
- ✅ Sample data added
- ✅ Documentation written

## 🎯 What You Need to Do

1. Run `npm install`
2. Run `npm run dev`
3. Test locally
4. Deploy to Vercel
5. Integrate with Optima Spray Foam

---

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### PowerShell execution policy error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just install dependencies and run the dev server to see it in action!
