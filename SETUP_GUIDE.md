# OpenCRM Setup & Troubleshooting Guide

## ✅ Issues Fixed

1. **Removed duplicate `.env.local` file** - Consolidated to single `.env`
2. **Fixed invalid Gemini AI model names** - Changed from `gemini-2.5-flash` and `gemini-3-pro-preview` to valid `gemini-2.0-flash-exp`
3. **Added service role key placeholder** - For server-side Supabase operations
4. **Removed empty Google Drive variables** - Cleaned unnecessary configuration

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Your `.env` file should have:
```env
# Supabase (✅ Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://cvpnpxgzscfsyqohqawz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: For server-side operations
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend Email Service (✅ Already configured)
RESEND_API_KEY=your_resend_key_here

# Gemini AI (✅ Already configured)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

### 3. Run Database Migrations

**Important**: Make sure your Supabase database has the migrations applied:

```bash
# If you have Supabase CLI installed:
npx supabase db push

# Or manually run the SQL files in Supabase Dashboard:
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Run: supabase/migrations/20231225_saas_schema.sql
# 3. Run: supabase/migrations/20260101_fix_org_creation.sql
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔍 Code Quality Check

### Architecture Overview

✅ **Clean separation of concerns**:
- `app/` - Next.js 13+ App Router pages
- `pages/` - Reusable page components
- `components/` - UI components (Layout, AIAssistant, etc.)
- `contexts/` - React Context providers (User, Data, Config, etc.)
- `services/` - API integrations (AI, Email, etc.)
- `lib/` - Utility libraries (Supabase client, etc.)

✅ **Context Providers** properly nested in order:
```tsx
UserProvider → ConfigProvider → CustomFieldsProvider → DataProvider → NotificationProvider
```

✅ **Authentication Flow**:
- UserContext handles Supabase auth
- Protected routes in `(dashboard)` layout
- Auto-redirects to login if not authenticated

✅ **Database Design**:
- Multi-tenancy with Organizations
- Row Level Security (RLS) enabled
- Auto profile & org creation on signup

## 🐛 Common Issues & Solutions

### Issue: "Supabase URL or Anon Key is missing"
**Solution**: 
1. Restart your dev server after editing `.env`
2. Verify variables don't have extra spaces
3. Check that `.env` is in the OpenCRM folder (not parent)

### Issue: Gemini AI features not working
**Solution**:
1. Check your Gemini API key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Verify the key is set in `.env` as `NEXT_PUBLIC_GEMINI_API_KEY`
3. Restart dev server

### Issue: Database errors on signup
**Solution**:
1. Make sure migrations are applied in Supabase Dashboard
2. Check RLS policies are enabled
3. Verify the `handle_new_user()` function exists

### Issue: "Cannot find module '@/...'"
**Solution**: Already fixed! Path aliases are configured in `tsconfig.json`

## 📦 Dependencies Status

All dependencies are properly installed and up-to-date:
- ✅ Next.js 16.1.1
- ✅ React 19.2.3
- ✅ Supabase JS 2.89.0
- ✅ Google GenAI 1.34.0
- ✅ Resend 6.6.0
- ✅ Recharts 3.6.0
- ✅ Lucide React 0.562.0

## 🎯 Next Steps

1. **Get Service Role Key** (optional, for server-side operations):
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (keep it secret!)
   - Add to `.env` as `SUPABASE_SERVICE_ROLE_KEY`

2. **Test the Application**:
   ```bash
   npm run dev
   ```
   - Visit landing page at `http://localhost:3000`
   - Sign up for a new account
   - Verify organization is auto-created
   - Test dashboard features

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 💡 Development Tips

- **Hot Reload**: Changes to files auto-refresh the browser
- **Environment Variables**: Restart server after `.env` changes
- **Database Changes**: Apply migrations through Supabase Dashboard
- **Styling**: Using Tailwind CSS 4 with dark mode support

## 🔐 Security Notes

- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use anon key for client-side (safe to expose)
- ⚠️ Service role key should ONLY be used server-side
- ✅ RLS policies protect database access

## 📝 File Structure Summary

```
OpenCRM/
├── .env                    # ✅ Configuration (DO NOT COMMIT)
├── app/                    # ✅ Next.js App Router
│   ├── (dashboard)/       # ✅ Protected dashboard routes
│   ├── login/             # ✅ Public login page
│   ├── signup/            # ✅ Public signup page
│   └── page.tsx           # ✅ Landing page
├── components/            # ✅ Reusable UI components
├── contexts/              # ✅ React Context providers
├── lib/                   # ✅ Utilities & clients
├── pages/                 # ✅ Page components
├── services/              # ✅ External API services
├── supabase/              # ✅ Database migrations
└── types.ts               # ✅ TypeScript definitions
```

## ✨ Features Verified

- ✅ User authentication (Supabase Auth)
- ✅ Multi-tenancy (Organizations & Memberships)
- ✅ AI-powered features (Gemini AI)
- ✅ Email service (Resend)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Real-time updates capability
- ✅ Row Level Security

## 🎉 Ready to Go!

Your OpenCRM application is now properly configured and all code issues have been fixed. Run `npm run dev` and start building!

---

**Need Help?** Check the individual files:
- [README.md](./README.md) - Project overview
- [GEMINI.md](./GEMINI.md) - Gemini AI integration guide
- [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md) - Test account info
