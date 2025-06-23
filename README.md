## 🧪 JEE/NEET Test Platform – Project Description

**Overview:**
The JEE/NEET Test Platform is a full-stack web application designed to simulate real-time competitive exams (like JEE and NEET), providing students with an intuitive and performance-focused test-taking experience. It features a realistic interface, robust analytics, bookmarking tools, and administrative controls, making it ideal for both students and test administrators.

---

### 🔑 Key Features

#### 🧩 **Realistic Test Interface**

* Color-coded question palette (Attempted, Not Attempted, Marked for Review).
* Subject-switching enabled during the test.
* Auto-calculated timer synced with test duration.
* Keyboard navigation using arrow keys (←/→).

#### 📊 **Detailed Performance Analysis**

* Subject-wise and question-wise score breakdown.
* Time spent per question and difficulty-level insights.
* Pie and bar charts for performance visualization.
* Filters by correctness (Correct, Incorrect, Unattempted).

#### 🕘 **Test History and Bookmarks**

* View previously completed tests with full answer keys.
* Bookmark questions after a test with custom tags like "Revise", "Unsolved", etc.
* Dedicated bookmark manager with tag-based filtering.

#### 📅 **Upcoming Test Calendar**

* Admin can schedule tests with future dates.
* Students can see all upcoming exams in a separate section.

#### ⚙️ **Admin Tools**

* Upload questions categorized by subject, difficulty, and marks.
* Create and schedule full-length tests.
* View test results and user performance analytics.

---

### 💻 Tech Stack

**Frontend:**

* React.js
* Tailwind CSS
* Chart.js (for performance graphs)
* Axios for API requests
* React Router DOM for page navigation

**Backend:**

* Node.js
* Express.js
* MongoDB with Mongoose
* Authentication via cookies
* RESTful APIs

---

### 📁 Repository Structure

* `/frontend` – Frontend (React)
* `/backend` – Backend (Express, MongoDB)

---

### 🔐 Authentication

* Users are authenticated with cookies for secure test sessions.
* Admin panel protected for content management.

---