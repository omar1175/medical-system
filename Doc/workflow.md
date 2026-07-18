# MediSys — Testing Workflow

## 1. Start the Backend

```bash
cd backend
python3 manage.py runserver
```

Django starts on `http://localhost:8000`.

## 2. Seed the Database

In another terminal:

```bash
cd backend
python3 manage.py seed_data --flush
```

This wipes existing data and creates the following accounts:

| Role     | Username                        | Password     |
| -------- | ------------------------------- | ------------ |
| Admin    | *(create via command below)*    | —            |
| Doctor   | `dr_smith`, `dr_johnson`, …     | `doctor123`  |
| Patient  | `alice_w`, `bob_j`, `carlos_r`… | `patient123` |

## 3. Create Admin User

```bash
cd backend
python3 manage.py createsuperuser
```

Use `admin` / `admin123` (or any credentials you prefer).

## 4. Start the Frontend

```bash
cd frontend
npm run dev
```

Vite starts on `http://localhost:5173` — it proxies `/api` requests to the backend automatically.

---

## Testing Flows

### A. Register a new patient (full cycle)

1. Go to `http://localhost:5173/register`
2. Fill in: Username `testpatient`, Email `test@example.com`, Role **Patient**, Password and Confirm
3. Submit — you see **"Registration successful. Please check your email to confirm your account."**
4. Check the backend terminal — the confirmation email is printed there (console email backend)
5. Copy the confirmation URL from the terminal and paste it in the browser (or use `GET /api/v1/auth/confirm-email/?uid=...&token=...`)
6. Go to `/login` and sign in as `testpatient` / your password
7. You land on the **Patient Dashboard**

### B. Patient flow — browse & book

1. Click **"Find Doctors"** in the sidebar — list of 10 doctors loads from the API
2. Use the search bar to type a name — observe `?search=...` being sent to the backend
3. Use the specialty filter — observe `?specialty=cardiology` being sent
4. Click **"View & Book"** on any doctor — see their profile with availability slots and fee
5. Click **"Book Appointment"** — pick a date/time and duration, submit
6. Success message appears, auto-redirects to **"My Appointments"** page
7. The new appointment shows in **Upcoming** as PENDING

### C. Doctor flow — manage appointments

1. Logout, then login as `dr_smith` / `doctor123`
2. Doctor Dashboard shows today's appointments + pending count
3. Click **"Appointments"** — see all appointments grouped by Today / Upcoming / Past
4. Find a PENDING appointment — click the green checkmark — a dialog opens prompting for **notes** — type something and confirm
5. The status changes to CONFIRMED
6. Go to **"Availability"** — add or remove weekly time slots from the UI
7. Go to **"Profile"** — edit your bio, phone, and consultation fee

### D. Admin flow — full oversight

1. Logout, login as `admin` / `admin123`
2. **Dashboard** shows platform-wide counts
3. **"Users"** — toggle the **Active** switch to block/unblock any user; toggle the **Approved** switch for doctors
4. **"Specialties"** — add, edit, or delete specialties
5. **"Appointments"** — see ALL appointments across the system, filter by status

### E. Patient — cancel & reschedule

1. Login as `alice_w` / `patient123`
2. Go to **"My Appointments"** — see upcoming appointments with cancel/reschedule buttons
3. Click cancel — confirm — status changes to CANCELLED
4. For a PENDING/CONFIRMED appointment — click the calendar icon — pick a new date/time — confirm reschedule

### F. Patient — profile edit

1. Go to **"Profile"** — edit first/last name, change password
2. Save changes — confirmation snackbar appears

---

## Key URLs

| Page                 | URL                                |
| -------------------- | ---------------------------------- |
| Login                | `http://localhost:5173/login`      |
| Register             | `http://localhost:5173/register`   |
| Patient Dashboard    | `http://localhost:5173/patient/dashboard` |
| Find Doctors         | `http://localhost:5173/patient/doctors` |
| Patient Appointments | `http://localhost:5173/patient/appointments` |
| Doctor Dashboard     | `http://localhost:5173/doctor/dashboard` |
| Doctor Appointments  | `http://localhost:5173/doctor/appointments` |
| Doctor Availability  | `http://localhost:5173/doctor/availability` |
| Admin Dashboard      | `http://localhost:5173/admin/dashboard` |
| Admin Users          | `http://localhost:5173/admin/users` |
| Admin Specialties    | `http://localhost:5173/admin/specialties` |
| Admin Appointments   | `http://localhost:5173/admin/appointments` |
| Django Admin         | `http://localhost:8000/admin`      |
| DRF Browsable API    | `http://localhost:8000/api/v1/`    |
