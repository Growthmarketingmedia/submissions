# Integration Steps for Your Websites

Your centralized submissions dashboard is live at:
**https://submissions-lovat.vercel.app/**

API Endpoint:
**https://submissions-lovat.vercel.app/api/submit**

---

## Step-by-Step Integration

### For Optima Spray Foam (and each other site)

#### Step 1: Add Environment Variables

In your Optima Spray Foam project, edit `.env.local`:

```env
NEXT_PUBLIC_SUBMISSIONS_API=https://submissions-lovat.vercel.app/api/submit
NEXT_PUBLIC_WEBSITE_NAME=Optima Spray Foam
NEXT_PUBLIC_WEBSITE_URL=https://www.optimasprayfoam.com
```

**Important:** Also add these to your Vercel environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all three variables above
3. Redeploy

#### Step 2: Find Your Contact Form

Locate your contact form component. It's likely in:
- `app/contact/page.tsx` or
- `components/ContactForm.tsx` or
- Similar location

#### Step 3: Update the Form Submit Handler

Replace or update your current form submission code with this:

```typescript
'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SUBMISSIONS_API!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteName: process.env.NEXT_PUBLIC_WEBSITE_NAME!,
          websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL!,
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
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Thank you for your message!</h3>
        <p>We'll get back to you shortly.</p>
        <button onClick={() => setSubmitted(false)}>Send Another Message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <select
        value={formData.service}
        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
        required
      >
        <option value="">Select a service</option>
        <option value="Residential Insulation">Residential Insulation</option>
        <option value="Commercial Insulation">Commercial Insulation</option>
        <option value="New Construction">New Construction</option>
      </select>
      <textarea
        placeholder="Tell us about your project..."
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        rows={5}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

#### Step 4: Deploy to Vercel

```bash
git add .
git commit -m "Integrate with centralized submissions system"
git push
```

Vercel will automatically deploy the changes.

#### Step 5: Test It

1. Go to your Optima Spray Foam website
2. Fill out the contact form
3. Submit it
4. Go to **https://submissions-lovat.vercel.app/**
5. You should see "Optima Spray Foam" in the dashboard
6. Click on it to see your test submission

---

## For Each Additional Website

Repeat the same steps for each website:

1. Add the three environment variables (API URL, website name, website URL)
2. Add them to both `.env.local` AND Vercel environment variables
3. Update the contact form to use `process.env.NEXT_PUBLIC_WEBSITE_NAME` and `process.env.NEXT_PUBLIC_WEBSITE_URL`
4. Deploy
5. Test

### Example Environment Variables for Another Site:

```env
NEXT_PUBLIC_SUBMISSIONS_API=https://submissions-lovat.vercel.app/api/submit
NEXT_PUBLIC_WEBSITE_NAME=J&M Construction
NEXT_PUBLIC_WEBSITE_URL=https://www.jmconstruction.com
```

**No code changes needed between sites!** Just update the environment variables.

---

## Important Notes

### ✅ What Gets Saved

All form data you send in the `formData` object will be saved and visible in the dashboard.

### ✅ Flexible Form Fields

You can send ANY form fields - the system will save whatever you send:

```typescript
formData: {
  name: 'John',
  email: 'john@example.com',
  phone: '555-1234',
  service: 'Residential',
  message: 'I need help',
  address: '123 Main St',           // Extra field
  preferredDate: '2026-02-10',      // Extra field
  budget: '$5000',                   // Extra field
  // Add any fields you want!
}
```

### ✅ Keep Existing Email Functionality

If you want to ALSO send emails from your site (in addition to saving to the centralized system), you can do both:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Save to centralized submissions
    await fetch(process.env.NEXT_PUBLIC_SUBMISSIONS_API!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteName: 'Optima Spray Foam',
        websiteUrl: 'https://www.optimasprayfoam.com',
        formData: formData,
      }),
    });

    // 2. Also send email via your existing API (if you have one)
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setSubmitted(true);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## Testing Checklist

For each site you integrate:

- [ ] Added `NEXT_PUBLIC_SUBMISSIONS_API` environment variable
- [ ] Updated form submit handler
- [ ] Deployed to production
- [ ] Submitted a test form
- [ ] Verified submission appears in dashboard at https://submissions-lovat.vercel.app/
- [ ] Tested filtering and search
- [ ] Tested CSV export

---

## Dashboard Features

Once integrated, you can:

### View All Submissions
- See all websites in one place
- Click any website to view its submissions

### Filter & Search
- Search across all form fields
- Filter by date range
- Clear filters

### Export Data
- Export to CSV
- Download filtered results

### View Details
- Click any submission row
- See all form fields
- Copy submission data

---

## Need Help?

If you run into issues:

1. Check browser console for errors
2. Verify the API URL is correct
3. Make sure environment variable is set in Vercel
4. Test the API endpoint directly:

```bash
curl -X POST https://submissions-lovat.vercel.app/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "websiteName": "Test Site",
    "websiteUrl": "https://test.com",
    "formData": {"name": "Test", "email": "test@test.com"}
  }'
```

---

## Summary

**Your Centralized Submissions System:**
- 📊 Dashboard: https://submissions-lovat.vercel.app/
- 🔌 API Endpoint: https://submissions-lovat.vercel.app/api/submit
- 💾 All submissions saved as JSON files
- 🔍 Searchable and filterable
- 📥 Exportable to CSV

**Next Action:**
Start with Optima Spray Foam, follow the steps above, and test it out!
