# MaFi Works — Employee Management System

MaFi Works is a responsive, client-side Employee Management System (EMS) designed for HR Admins to view analytics, search, create, update, and remove employee directory records efficiently.

## 🚀 Live Demo
*You can insert your GitHub Pages deployment link here once enabled*

---

## ✨ Features

- **Secure Demo Authentication:** Includes a dedicated login screen featuring a password-visibility toggle to simulate an enterprise application flow.
- **Dynamic Analytics Dashboard:** Includes structured statistic metrics tracking absolute headcount numbers, registered organizational subdivisions, active onboarding, and tracking absent personnel.
- **Interactive Department Breakdown:** Features a clean, custom-rendered `<canvas>` donut chart visualization displaying overall distribution statistics.
- **Advanced Directory Operations:**
  - Full CRUD capabilities (Create, Read, Update, Delete) for handling employee files.
  - Multi-parameter live searching filtering records by Name, Role, or Department.
  - Quick Department filtering and interactive columnar table sorting.
- **Persistent Local Cache:** Built-in integration using browser `localStorage` ensuring your data changes persist safely across browser sessions with a built-in "Reset Demo Data" option.
- **Fully Responsive Layout:** Implements an adaptive sidebar-navigation and fluid CSS grids that transition perfectly from wide desktop monitors down to mobile viewports.

---

## 🛠️ Technology Stack

- **Markup:** Semantic HTML5
- **Styling:** Vanilla CSS3 (utilizing custom properties/CSS variables, CSS Grid, and Flexbox layouts)
- **Typography:** Hosted Google Fonts integration (*Sora*, *Inter*, *IBM Plex Mono*)
- **Scripting & Canvas:** Native Vanilla JavaScript (ES6+) for interactive DOM manipulation and state management

---

## 🔑 Demo Credentials

To enter the admin application suite from the simulated login interface, use the default seeded development keys:

- **Username:** `admin`
- **Password:** `mafi123`

---

## 📂 Project Directory Structure

```text
├── index.html       # Application markup structural layout & modal templates
├── style.css        # Modular CSS custom properties, system typography & responsive design
└── script.js       # App architecture, mock database management & state-rendering logic
