# 🎬 Movie Booking System - Standalone Persistent Web Engine

A high-performance, responsive single-page web application (SPA) replicating an end-to-end movie ticket reservation pipeline reminiscent of BookMyShow. The system implements modular interface routing and dynamic client-side data synchronization.

🔗 **Live Production Deployment:** [Launch Live Web App](https://waghmarekunal025-lab.github.io/movie-ticket-booking-system/)

---

## 🚀 Key Features & Architectural Innovations

* **Dynamic Single-Page Router (SPA):** Seamlessly shifts viewports across 7 discrete application states (City Selection ➔ Movies Catalogue ➔ Movie Details ➔ Venues & Showtimes ➔ Interactive Seating Grid ➔ Invoice Checkout ➔ Final M-Ticket Receipt) without triggering expensive browser tab window refreshes.
* **Persistent Event Seating Matrix:** Automatically tracks, manages, and builds out custom configuration layouts. When a booking transaction completes via the billing gateway panel, the coordinates lock natively.
* **Sandbox State Isolation:** Utilizing the native browser `localStorage` engine API, seat mappings are isolated cleanly per device. This allows multiple interviewers or evaluators to interactively audit the reservation flow concurrently on separate devices without causing concurrency resource lock conflicts.
* **Fluid Responsive UX Matrix:** Engineered completely using modern CSS Flexbox and Grid specifications to ensure full interface parity across desktop monitors, tablets, and mobile smartphone display frames.
* **Zero-Dependency Deployment:** Designed to interact smoothly without backend server configurations, enabling lightweight, fast static page delivery via GitHub Pages.

---

## 🛠️ Tech Stack & Implementation Tools

* **Structure:** Semantic HTML5 Architecture Elements
* **Styling Engine:** CSS3 Custom Theme Modules & Media Layout Rules
* **Control Layer:** Vanilla JavaScript (ES6+ Runtime Specification Loop Controllers)
* **Data Layer:** Web Storage API Browser Client Native (`localStorage`)
* **Typography & Vector Graphic Assets:** Google Fonts Integration (Poppins Array) & FontAwesome V6 Icons CDN

---

## 📁 Repository Structure

```text
movie-ticket-booking-system/
│
├── index.html     # Core semantic markup viewport staging element
├── style.css      # Dark/Light theme style specifications & grid vectors
└── script.js     # State machine controller, database array models, and local storage pipeline
