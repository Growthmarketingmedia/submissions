# Integration Guide

This guide shows you how to integrate the centralized form submission system with your existing Next.js websites.

## 🎯 Overview

The integration process involves updating your existing form submission handlers to send data to the centralized API endpoint while maintaining all existing functionality (like email notifications via Resend).

## 📋 Prerequisites

- Your centralized submissions app deployed (e.g., on Vercel)
- API endpoint URL (e.g., `https://submissions.vercel.app/api/submit`)

## 🔧 Integration Steps

### Step 1: Update Environment Variables

Add the submissions API URL to your existing site's `.env.local`:

```env
NEXT_PUBLIC_SUBMISSIONS_API=https://your-submissions-app.vercel.app/api/submit
```

### Step 2: Update Your Form Handler

#### Option A: Client-Side Form (Recommended for most cases)

If your form submits from the client side:

```typescript
// app/contact/page.tsx or components/ContactForm.tsx
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
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      // Send to centralized submissions API
      const response = await fetch(process.env.NEXT_PUBLIC_SUBMISSIONS_API!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteName: 'Optima Spray Foam', // Your website name
          websiteUrl: 'https://www.optimasprayfoam.com', // Your website URL
          formData: formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      {/* Add other fields */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'success' && <p>Thank you! We'll be in touch soon.</p>}
      {status === 'error' && <p>Something went wrong. Please try again.</p>}
    </form>
  );
}
```

#### Option B: Server-Side API Route

If you have an existing API route that handles form submissions:

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Send to centralized submissions API
    const submissionResponse = await fetch(process.env.NEXT_PUBLIC_SUBMISSIONS_API!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        websiteName: 'Optima Spray Foam',
        websiteUrl: 'https://www.optimasprayfoam.com',
        formData: formData,
      }),
    });

    const submissionResult = await submissionResponse.json();

    if (!submissionResult.success) {
      throw new Error('Failed to save submission');
    }

    // If you have additional logic (e.g., CRM integration), add it here

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
    });
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process form' },
      { status: 500 }
    );
  }
}
```

### Step 3: Test the Integration

1. **Submit a test form** on your website
2. **Check the dashboard** at your submissions app URL
3. **Verify email notification** was received
4. **Confirm data** appears correctly in the submissions table

## 🔄 Migration Checklist

Use this checklist when integrating each website:

- [ ] Deploy centralized submissions app
- [ ] Add `NEXT_PUBLIC_SUBMISSIONS_API` to site's environment variables
- [ ] Update form submission handler
- [ ] Test form submission locally
- [ ] Verify submission appears in dashboard
- [ ] Verify email notification is sent
- [ ] Deploy updated site
- [ ] Test production form submission
- [ ] Monitor for any errors

## 🎨 Example: Optima Spray Foam Integration

Based on your existing site structure, here's a complete example:

```typescript
// components/ContactForm.tsx
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
      const response = await fetch(process.env.NEXT_PUBLIC_SUBMISSIONS_API || 'https://submissions.vercel.app/api/submit', {
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
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      } else {
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Form error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f0fdf4', borderRadius: '8px' }}>
        <h3>Thank you for your message!</h3>
        <p>We'll get back to you shortly.</p>
        <button onClick={() => setSubmitted(false)}>Send Another Message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        <option value="Other">Other</option>
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

## 🚨 Important Notes

### Email Notifications

The centralized system will handle sending email notifications via Resend. If your existing site also sends emails:

**Option 1: Remove duplicate emails**
- Remove email sending from your site's form handler
- Let the centralized system handle all notifications

**Option 2: Keep both (not recommended)**
- Keep existing email logic in your site
- You'll receive two emails per submission

### Error Handling

Always implement proper error handling:

```typescript
try {
  const response = await fetch(API_URL, { /* ... */ });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Submission failed');
  }
  
  // Success!
} catch (error) {
  console.error('Submission error:', error);
  // Show user-friendly error message
}
```

### Testing Locally

To test locally before deployment:

1. Run the submissions app: `npm run dev` (port 3000)
2. Run your website: `npm run dev -p 3001` (different port)
3. Update `.env.local` in your site:
   ```env
   NEXT_PUBLIC_SUBMISSIONS_API=http://localhost:3000/api/submit
   ```

## 📊 Monitoring

After integration, monitor:

- Dashboard for new submissions
- Email notifications
- Browser console for any errors
- Network tab for API response times

## 🆘 Troubleshooting

### Submissions not appearing in dashboard

- Check browser console for errors
- Verify API URL is correct
- Check CORS headers (should be enabled)
- Verify environment variables are set

### Email notifications not sending

- Verify `RESEND_API_KEY` is set correctly
- Check `NOTIFICATION_EMAIL` is valid
- Look for errors in Vercel logs

### CORS errors

The API includes CORS headers by default. If you still see CORS errors:
- Ensure you're using HTTPS in production
- Check that the API URL is correct
- Verify the request includes proper headers

## 🎉 You're Done!

Your site is now integrated with the centralized submission system. All form submissions will:

1. ✅ Be saved to the centralized repository
2. ✅ Trigger email notifications
3. ✅ Appear in the dashboard
4. ✅ Be filterable and exportable

For questions or issues, refer to the main [README.md](./README.md) or open an issue on GitHub.
