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

## 🚀 Deployment (Render)

1. Create a **Static Site** on Render.
2. Connect your GitHub repository.
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`
5. **Environment Variables**: Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` (the URL of your deployed backend).
6. **Redirects**: Go to **Redirects/Rewrites** and add:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
