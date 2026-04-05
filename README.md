# 💰 FinanceHub — Finance Dashboard UI

## 📌 Overview

FinanceHub is a frontend-only finance dashboard built using **React, TypeScript, and Tailwind CSS**.
It allows users to track financial activity, explore transactions, and understand spending patterns through a clean and intuitive interface.

This project focuses on **UI design, component structure, and state management**, rather than backend complexity.

---

## 🧠 Approach

The application was designed with a **product-first mindset**, prioritizing usability and clarity over unnecessary complexity.

### Key Design Decisions

* **Single-page layout (no sidebar)**
  → Improves flow and keeps the interface simple and focused.

* **Insight-driven UI (minimal charts)**
  → Instead of heavy graphs, the dashboard highlights meaningful financial insights.

* **Custom components using Tailwind CSS only**
  → No prebuilt UI libraries were used to demonstrate core frontend skills.

* **Zustand for state management**
  → Chosen for simplicity and scalability without overengineering.

* **Mock API simulation**
  → Mimics real-world data fetching using asynchronous logic.

---

## ✨ Features

### 📊 Dashboard Overview

* Displays:

  * Total Balance
  * Total Income
  * Total Expenses
* Clean layout with minimal visual clutter
* Small, non-dominant charts for context

---

### 📋 Transactions Section

* Transaction table with:

  * Date
  * Amount
  * Category
  * Type (income/expense)

#### Functionality:

* Search by category/description
* Filter by:

  * Category
  * Type
  * Date range
* Sorting (date, amount, category)
* Pagination with page navigation
* Export data (CSV & JSON)

---

### 🔍 Advanced Filtering

* Multiple filters can be combined
* Active filters are displayed and removable
* Reset filters functionality

---

### 🧠 Insights Section

* Highest spending category
* Monthly comparison (increase/decrease)
* Savings calculation
* Context-aware messages (e.g., spending trends)

---

### 🔐 Role-Based UI

* **Viewer**

  * Can only view data
* **Admin**

  * Can add, edit, and delete transactions

---

### ➕ Add Transaction

* Modal-based form
* Input validation
* Smooth user interaction

---

## ⚡ Additional Features

* 🌙 Dark / Light mode (with persistence)
* 💾 Local storage data persistence
* 🔄 Mock API simulation with loading states
* 📤 Export functionality (CSV / JSON)
* ✨ Smooth animations and transitions
* 📱 Fully responsive design
* 🧾 Empty state handling (no data / no results)

---

## 🛠️ Tech Stack

* React (Vite)
* TypeScript
* Tailwind CSS
* Zustand (state management)
* Lucide React (icons)

---

## 📂 Project Structure

```bash
src/
  components/     # UI components
  store/          # Zustand store
  types/          # Type definitions
  hooks/          # Custom hooks
  App.tsx
  main.tsx
```

---

## ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/Devang1/Finance-Dashboard-UI

# Navigate into the project
cd finance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📦 Build for Production

```bash
npm run build
```

---


## 📄 Notes

* This project uses mock data and does not include backend integration.
* Designed specifically for evaluation of frontend development skills.

---

## 👨‍💻 Author

Devang Kishore Shukla
# Finance-Dashboard-UI
