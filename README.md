# CareerGenie — Smart Resume Analyzer & Job Matcher

Full-stack MVC application: React + TailwindCSS frontend, Express + MongoDB
backend, JWT + Bcrypt auth, role-based dashboards (student / recruiter /
admin), and a Python (spaCy + scikit-learn) ML layer invoked via
`child_process.spawn()` for resume parsing and job-match scoring.

## Repository layout

```
careergenie/
├── server.js                    # Express app entry point
├── package.json                 # backend deps
├── .env.example
├── scripts/
│   └── createAdmin.js           # one-off CLI to create/promote an admin user
├── config/
│   └── db.js                    # Mongoose connection
├── middleware/
│   ├── auth.js                  # protect + checkRole (JWT + RBAC)
│   ├── uploadResumePdf.js       # multer (in-memory, PDF only, 5MB cap)
│   └── errorHandler.js
├── models/
│   ├── User.js                  # role: student | recruiter | admin
│   ├── Resume.js
│   ├── Job.js                   # status: pending | approved | rejected
│   └── Application.js
├── controllers/
│   ├── authController.js        # signup / login / me
│   ├── resumeController.js      # multer PDF -> pdf-parse -> spawns ml/analyzer.py
│   ├── jobController.js
│   ├── applicationController.js
│   └── adminController.js       # moderation, users, stats
├── routes/
│   ├── authRoutes.js
│   ├── resumeRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   └── adminRoutes.js
├── ml/
│   ├── analyzer.py              # spaCy PhraseMatcher + TF-IDF match scoring
│   └── requirements.txt
└── client/                      # Vite + React + TailwindCSS SPA
    ├── package.json              # frontend deps
    ├── tailwind.config.js
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               # all routes below
        ├── index.css
        ├── utils/api.js          # Axios instance + JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/           # Navbar, ProtectedRoute
        └── pages/
            ├── Landing.jsx                 /
            ├── Login.jsx, Signup.jsx       /login, /signup
            ├── StudentDashboard.jsx        /dashboard/student
            ├── RecruiterDashboard.jsx      /dashboard/recruiter
            ├── ResumeUpload.jsx            /resume
            ├── JobBoard.jsx                /jobs
            ├── JobDetails.jsx              /jobs/:id
            ├── CreateJob.jsx               /jobs/new
            ├── JobApplications.jsx         /jobs/:jobId/applications
            ├── MyApplications.jsx          /applications/mine
            └── AdminPanel.jsx              /admin
```

Every page in the project spec maps to a route above.

## Prerequisites

- Node.js 18+
- Python 3.9+
- A MongoDB instance (local `mongod`, or a free Atlas cluster)

## 1. Backend setup

```bash
cd careergenie
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, PYTHON_BIN (usually "python3")

npm install
npm run dev          # nodemon server.js on http://localhost:5000
```

Health check: `curl http://localhost:5000/api/health`

## 2. ML layer setup

```bash
cd careergenie/ml
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

`resumeController.js` spawns this per resume upload:

```
python3 ml/analyzer.py "<extracted resume text>" "<job description text>"
```

`stdout` must be exactly one line of JSON — enforced inside `analyzer.py`
by muting stdout during library imports. Everything else (warnings,
missing-model notices) goes to `stderr` and is never parsed.

## 3. Frontend setup

```bash
cd careergenie/client
npm install
npm run dev           # Vite dev server on http://localhost:5173
```

Optional `client/.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 4. Create the first admin account

There's no public "sign up as admin" — by design. Run once, from the
`careergenie` root (with `.env` already configured):

```bash
node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPass123"
```

Log in with that email/password at `/login`; the navbar will show an
**Admin** link to `/admin`.

## Auth flow

1. `POST /api/auth/signup` (`role: student | recruiter`) or `/api/auth/login`
   returns `{ token, user }`.
2. The client stores `token` in `localStorage` under `cg_token`.
3. `src/utils/api.js`'s Axios request interceptor attaches
   `Authorization: Bearer <token>` to every outgoing request automatically.
4. Protected backend routes run `protect` (verifies the JWT, loads
   `req.user`) then `checkRole([...])` for RBAC — e.g. only `recruiter`
   accounts can `POST /api/jobs`, only `admin` accounts can hit `/api/admin/*`.

## Job moderation workflow

Recruiters post jobs (`status: pending` by default). They are **not**
shown on the public `/jobs` board until an admin approves them from
`/admin`. Recruiters can still see their own pending/rejected jobs on
`/dashboard/recruiter`.

## Resume upload

Students upload an actual PDF (`multipart/form-data`, field name
`resume`) from `/resume`. `middleware/uploadResumePdf.js` (multer,
in-memory, 5MB cap, PDF-only) hands the buffer to `resumeController.js`,
which extracts text with `pdf-parse`, then runs it through
`ml/analyzer.py` for skills, experience-year estimation, a
resume/job-description match score, and structural feedback.

## What's intentionally out of scope here

- **Email/in-app notifications** — the spec calls for these but they
  depend on a provider choice (SMTP, SendGrid, etc.) I didn't want to
  guess for you. Happy to wire in whichever you pick.
- **Deployment configs** (Vercel/Render/Heroku) — no deployment
  target was specified; ask if you want a `vercel.json` /
  `render.yaml` for a specific host.
