# EduFlow LMS - Frontend

Modern Learning Management System built with **Next.js 15**, **TypeScript**, and **Glassmorphism UI**.

## 🎨 Design Features

- **Unique Glassmorphism Design** - Dark theme with frosted glass effects
- **Fixed Sidebar Navigation** - Role-based navigation with smooth transitions
- **Responsive Tables & Cards** - Clean data presentation
- **Modal Dialogs** - Inline editing and detailed views
- **Real-time Alerts** - Success/error feedback
- **Custom Scrollbars** - Styled for dark theme

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Default Login

- **Admin**: `admin@lms.com` / `admin123`

## 📁 Project Structure

```
app/
├── admin/          # Admin dashboard & management
│   ├── students/   # Student CRUD with detail view
│   ├── teachers/   # Teacher CRUD with detail view
│   ├── courses/    # Course overview
│   ├── users/      # All users list with filters
│   └── create-user/# Create student/teacher/admin
├── teacher/        # Teacher portal
│   ├── courses/    # Course CRUD + student grading
│   ├── assignments/# Assignment CRUD + submission grading
│   └── profile/    # Profile & password management
├── student/        # Student portal
│   ├── courses/    # Browse & enroll/drop courses
│   ├── my-courses/ # View enrolled courses only
│   ├── assignments/# View & submit assignments
│   ├── submissions/# View all submissions & grades
│   ├── grades/     # GPA & course grades
│   └── profile/    # Profile & password management
└── login/          # Authentication page

components/
├── DashboardLayout.tsx  # Sidebar + main layout
├── ProtectedRoute.tsx   # Auth guard wrapper
└── ui.tsx              # Reusable UI components

context/
└── AuthContext.tsx     # JWT auth state management

lib/
└── api.ts             # Axios instance with auth interceptor
```

## 🎯 Features Implemented

### Admin
- ✅ Dashboard with 8 stat cards + recent activities
- ✅ All users list with role/search filters
- ✅ Student management (list, search, view details, edit, delete)
- ✅ Teacher management (list, search, view details, edit, delete)
- ✅ Course overview with enrollment stats
- ✅ Create user form (student/teacher/admin with role-specific fields)

### Teacher
- ✅ Dashboard with profile info + account activation/deactivation
- ✅ Course CRUD (create, edit, delete)
- ✅ View enrolled students per course
- ✅ Grade students (A/B/C/D/F)
- ✅ Assignment CRUD with due dates
- ✅ View submissions per assignment
- ✅ Grade submissions (0-100 + feedback)
- ✅ Profile & password management

### Student
- ✅ Dashboard with GPA + course stats
- ✅ Browse all available courses
- ✅ Enroll/drop courses
- ✅ View enrolled courses only
- ✅ View assignments with due dates
- ✅ Submit assignments (text)
- ✅ View all submissions with grades & feedback
- ✅ View grades per course + GPA calculation
- ✅ Profile & password management

## 🔌 API Integration

All backend endpoints are fully integrated:

**Auth**: `/auth/login`, `/auth/me`, `/auth/change-password`, `/auth/update-profile`

**Admin**: `/admin/dashboard`, `/admin/users`, `/admin/students`, `/admin/students/:id`, `/admin/teachers`, `/admin/teachers/:id`, `/admin/courses`, `/admin/users/create`

**Teacher**: `/teacher/dashboard`, `/teacher/activate`, `/teacher/deactivate`, `/teacher/profile`, `/teacher/courses`, `/teacher/courses/:id/students`, `/teacher/courses/:id/students/:sid/grade`, `/teacher/assignments`, `/teacher/courses/:id/assignments`, `/teacher/assignments/:id/submissions`, `/teacher/submissions/:id/grade`

**Student**: `/student/dashboard`, `/student/courses`, `/student/my-courses`, `/student/courses/enroll/:id`, `/student/courses/drop/:id`, `/student/assignments`, `/student/assignments/:id/submit`, `/student/submissions`, `/student/grades`

## 🎨 UI Components

All components are in `components/ui.tsx`:

- `PageHeader` - Page title + subtitle + action button
- `Card` - Glassmorphic container
- `StatCard` - Dashboard metric card with icon
- `Table` / `Td` - Data table with dark theme
- `Badge` - Colored status badge
- `Input` / `Select` / `Textarea` - Form inputs with focus states
- `Btn` - Button with variants (primary, danger, warning, ghost, success)
- `Alert` - Success/error message banner
- `Modal` - Overlay dialog
- `SearchBar` - Search input + button combo

## 🌈 Color Palette

- **Background**: `#0f1117` (deep dark)
- **Glass**: `rgba(255,255,255,0.03)` with backdrop blur
- **Borders**: `rgba(255,255,255,0.07)`
- **Primary**: `#6366f1` (indigo)
- **Success**: `#10b981` (green)
- **Warning**: `#f59e0b` (amber)
- **Danger**: `#ef4444` (red)
- **Purple**: `#8b5cf6` (violet)

## 📦 Dependencies

- `next` - React framework
- `react` / `react-dom` - UI library
- `axios` - HTTP client
- `typescript` - Type safety

## 🔧 Configuration

- `next.config.js` - Next.js config (no proxy needed)
- `tsconfig.json` - TypeScript config
- `lib/api.ts` - Base URL: `http://localhost:5000/api`

## 🚨 Notes

- Backend must be running on `http://localhost:5000`
- JWT token stored in `localStorage`
- All routes are protected with role-based guards
- Sidebar navigation adapts to user role
