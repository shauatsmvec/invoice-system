# FlowBill Frontend (React SPA)

A premium, animated user interface built with React 19, Tailwind CSS 4, and Framer Motion.

## 🚀 Setup Instructions

1. **Installation**:
   ```powershell
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in this folder:
   ```text
   VITE_SUPABASE_URL=https://[REF].supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=http://localhost:8000/api/v1
   ```

3. **Development Server**:
   ```powershell
   npm run dev
   ```

## 💎 Design Highlights
- **Framer Motion**: Smooth page transitions and interactive lists.
- **Recharts**: High-performance cash flow data visualization.
- **Lucide React**: Consistent, high-quality iconography.
- **Tailwind 4**: Utility-first styling with modern CSS features.

## 📁 Page Structure
- `/Dashboard`: Metrics and Cash Flow chart.
- `/Invoices`: List and management actions (PDF, Email, Void).
- `/Clients`: Customer CRM and details.
- `/Recurring`: Automated billing schedules.
- `/Settings`: Business branding and profile.
