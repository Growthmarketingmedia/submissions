# Form Submissions Dashboard

A centralized Next.js application for managing form submissions from multiple websites with a beautiful dashboard, filtering capabilities, and email notifications.

## 🌟 Features

- **📊 Centralized Dashboard** - View all your website submissions in one place
- **🔍 Advanced Filtering** - Search, date range, and website filters
- **📧 Email Notifications** - Automatic email alerts via Resend API
- **💾 File-Based Storage** - All submissions stored as JSON files in Git
- **📱 Responsive Design** - Beautiful UI that works on all devices
- **📥 Export Functionality** - Download submissions as CSV
- **🎨 Modern UI** - Dark theme with glassmorphism and smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Resend API key ([get one here](https://resend.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Growthmarketingmedia/submissions.git
   cd submissions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   NOTIFICATION_EMAIL=your@email.com
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the dashboard**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Submit Form Data

**POST** `/api/submit`

Submit form data from your external websites.

**Request Body:**
```json
{
  "websiteName": "Optima Spray Foam",
  "websiteUrl": "https://www.optimasprayfoam.com",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "service": "Residential Insulation",
    "message": "I need a quote for my home"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission received successfully",
  "submissionId": "abc123xyz789"
}
```

### Get Submissions

**GET** `/api/submissions?website=YourWebsiteName&startDate=2026-01-01&endDate=2026-12-31&search=keyword`

Retrieve submissions with optional filters (used by dashboard).

### Get Websites

**GET** `/api/websites`

Get list of all websites with submission counts (used by dashboard).

## 🔗 Integrating with Your Existing Sites

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration instructions.

### Quick Example (Next.js)

```typescript
// In your form submission handler
const response = await fetch('https://your-submissions-app.vercel.app/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
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
  console.log('Submission saved:', result.submissionId);
}
```

## 📁 Project Structure

```
submissions/
├── app/
│   ├── api/
│   │   ├── submit/route.ts       # Receive form submissions
│   │   ├── submissions/route.ts  # Get submissions with filters
│   │   └── websites/route.ts     # Get website list
│   ├── submissions/
│   │   └── [website]/page.tsx    # Submissions table page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard homepage
├── components/
│   ├── WebsiteCard.tsx           # Website card component
│   └── SubmissionDetail.tsx      # Submission detail modal
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── storage.ts                # File storage utilities
│   └── email.ts                  # Resend email integration
├── data/
│   └── submissions/              # Stored submissions (Git tracked)
│       └── [website-name]/
│           └── [timestamp]-[id].json
└── package.json
```

## 🎨 Dashboard Features

### Homepage
- View all websites with submission counts
- See last submission date for each site
- Click any website to view its submissions

### Submissions Page
- **Search**: Find submissions by any field content
- **Date Range**: Filter by submission date
- **Export CSV**: Download filtered submissions
- **Detail View**: Click any row to see full submission details

## 🔒 Security Notes

- API endpoints use CORS headers for cross-origin requests
- All submissions are validated before storage
- Environment variables keep sensitive data secure
- File names are sanitized to prevent directory traversal

## 📧 Email Notifications

When a form is submitted, an email notification is automatically sent via Resend API containing:
- Website name and URL
- All form field data
- Submission ID and timestamp
- Formatted HTML email template

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `RESEND_API_KEY`
   - `NOTIFICATION_EMAIL`
   - `NEXT_PUBLIC_API_URL` (your Vercel deployment URL)
4. Deploy!

### Update Your Sites

After deployment, update the API URL in your existing sites to point to your Vercel deployment:

```typescript
const API_URL = 'https://your-submissions-app.vercel.app/api/submit';
```

## 📝 Data Storage

Submissions are stored as JSON files in `data/submissions/[website-name]/` directory. This approach provides:

- ✅ Version control via Git
- ✅ Easy backup and restore
- ✅ Human-readable format
- ✅ No database required
- ✅ Simple file-based queries

**Note**: For high-volume sites (>1000 submissions/month), consider migrating to a database.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

MIT

## 🤝 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, TypeScript, and Resend
