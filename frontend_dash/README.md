# Frontend Setup Instructions

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to http://localhost:3000

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Analytics Dashboard` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |

## Available Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

## Project Structure

```
pages/
  ├── _app.js           # App wrapper with providers
  ├── index.js          # Landing page
  ├── login.js          # Login page
  ├── register.js       # Registration page
  └── dashboard/        # Dashboard pages

components/
  ├── Layout.js         # Main layout component
  ├── Navbar.js         # Navigation bar
  ├── charts/           # Chart components
  └── ui/               # UI components

context/
  └── AuthContext.js    # Authentication context

utils/
  ├── api.js            # API functions
  └── helpers.js        # Utility functions

styles/
  └── globals.css       # Global styles with Tailwind
```

## Features

- **Authentication**: JWT-based login/register
- **Dashboard**: Analytics visualization
- **Charts**: Interactive charts with Recharts
- **Responsive**: Mobile-friendly design
- **Real-time**: Live visitor tracking
- **Toast Notifications**: User feedback

## Development Notes

- Uses Next.js 14 with App Router
- Styled with TailwindCSS
- Charts powered by Recharts
- Authentication with JWT tokens
- API calls with Axios

## Building for Production

```bash
npm run build
npm start
```

## Deployment

Deploy to Vercel, Netlify, or any platform supporting Next.js:

1. Push to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=Analytics Dashboard
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```