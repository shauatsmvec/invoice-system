# FlowBill Backend (Django API)

This is the central engine of FlowBill, handling authentication, business logic, financial calculations, and integrations.

## 🛠 Setup Instructions

1. **Virtual Environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   Create a `.env` file in this folder with the following:
   ```text
   DEBUG=True
   SECRET_KEY=any-random-long-string
   DATABASE_URL=postgres://postgres.[REF]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
   SUPABASE_URL=https://[REF].supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   RAZORPAY_KEY_ID=your-razorpay-id
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-gmail-app-password
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

4. **Initialize**:
   ```powershell
   python manage.py migrate
   python manage.py runserver
   ```

## ⚙️ Background Tasks
To enable **Auto-Reminders** and **Recurring Invoices**, run this in a separate terminal:
```powershell
python manage.py qcluster
```

## 🚀 Deployment (Render)

1. Create a **Web Service** on Render.
2. Connect your GitHub repository.
3. **Build Command**: `./build.sh`
4. **Start Command**: `gunicorn flowbill_api.wsgi`
5. **Environment Variables**: Add all keys from your `.env` to the Render Dashboard.
   - Set `DEBUG` to `False`.
   - Add `ALLOWED_HOSTS` (e.g., `your-app.onrender.com`).
   - Add `CSRF_TRUSTED_ORIGINS` (e.g., `https://your-frontend.onrender.com`).
