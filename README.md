# Sound Supply Portal

User dashboard and account management for Sound Supply marketplace. Built with Supabase for authentication and database.

## Features

- **User Authentication**: Signup/login with Supabase
- **Dashboard Overview**: Stats cards, recent orders preview
- **Order History**: Full order tracking with status badges
- **Account Management**: Profile updates, password changes, account deletion
- **Responsive Design**: Mobile-optimized dark theme with Sound Supply branding

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS
- **Auth & Database**: Supabase
- **Design**: Sound Supply brand colors (indigo/cyan gradients), Orbitron/Inter/Space Grotesk fonts
- **Deployment**: Cloudflare Pages

## Structure

```
sound-supply-portal/
├── index.html        # Main HTML structure (auth + dashboard)
├── app.js           # Supabase client, auth handlers, dashboard logic
├── styles.css       # Dark theme styling, responsive layout
└── README.md        # This file
```

## Setup

1. Clone repository
2. Supabase credentials embedded in `app.js` (client-only anon key)
3. Deploy to Cloudflare Pages or serve locally

## Deployment

### Cloudflare Pages

1. Connect GitHub repo to Cloudflare Pages
2. Set build command: (none - static site)
3. Set publish directory: `/`
4. Auto-deploys on push to master

### Local Development

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Features Implemented

- ✅ Supabase auth (login/signup with email/password)
- ✅ Protected dashboard (redirect to login if not authenticated)
- ✅ Tab navigation (Overview, Orders, Account)
- ✅ Mock order data (ready for real DB integration)
- ✅ Profile management (name, phone, company)
- ✅ Password change
- ✅ Account deletion
- ✅ Responsive mobile layout
- ✅ Sound Supply design theme

## Next Steps

- Set up Supabase tables (users, orders, etc.)
- Replace mock orders with real database queries
- Add payment integration
- Email verification flow
- Order tracking with real status updates
- Admin dashboard for Sound Supply team

## Support

Contact: support@soundsupply.com
