# Quick Integration Guide - Using Environment Variables

## ✅ Simplified Approach - No Code Changes Between Sites!

### For Optima Spray Foam

**Step 1: Add to `.env.local`**
```env
NEXT_PUBLIC_SUBMISSIONS_API=https://submissions-lovat.vercel.app/api/submit
NEXT_PUBLIC_WEBSITE_NAME=Optima Spray Foam
NEXT_PUBLIC_WEBSITE_URL=https://www.optimasprayfoam.com
```

**Step 2: Add to Vercel Environment Variables**
1. Go to Vercel Dashboard → Optima Spray Foam Project
2. Settings → Environment Variables
3. Add all three variables above
4. Redeploy

**Step 3: Update Contact Form (ONE TIME)**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const response = await fetch(process.env.NEXT_PUBLIC_SUBMISSIONS_API!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      websiteName: process.env.NEXT_PUBLIC_WEBSITE_NAME!,
      websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL!,
      formData: formData,  // Your existing form data
    }),
  });

  const result = await response.json();
  if (result.success) {
    alert('Thank you! Message received.');
  }
};
```

---

## For Other Sites

**Just change the environment variables!**

### Example: J&M Construction
```env
NEXT_PUBLIC_SUBMISSIONS_API=https://submissions-lovat.vercel.app/api/submit
NEXT_PUBLIC_WEBSITE_NAME=J&M Construction
NEXT_PUBLIC_WEBSITE_URL=https://www.jmconstruction.com
```

**No code changes needed!** The same contact form code works for all sites.

---

## Benefits

✅ **Reusable Code** - Same form code works for all sites  
✅ **Easy Updates** - Change website info via environment variables  
✅ **Clean Code** - No hardcoded values  
✅ **Flexible** - Easy to add new sites

---

## Testing

1. Submit a form on your site
2. Go to https://submissions-lovat.vercel.app/
3. See your submission!
