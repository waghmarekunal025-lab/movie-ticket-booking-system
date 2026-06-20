document.addEventListener("DOMContentLoaded", () => {
    
    // --- SYSTEM MEMORY DATABASES MODELS ---
    const MOVIES_DATABASE = [
        { id: "mov-01", title: "Interstellar", rating: "9.1", genre: "Sci-Fi, Action, Drama", languages: "English, Hindi, Telugu", duration: "2h 49m", certificate: "UA", release: "26 Oct, 2014", votes: "182K", poster: "https://images.jpegmini.com/user_guide/images/sample_images_scaled.jpg", backdrop: "https://images.jpegmini.com/user_guide/images/sample_images_scaled.jpg", synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Faced with dwindling resources on Earth, a group of brave astronauts venture into the unknown deep cosmic horizon to discover viability across alternate target worlds." },
        { id: "mov-02", title: "The Dark Knight", rating: "9.3", genre: "Action, Crime, Drama", languages: "English, Hindi", duration: "2h 32m", certificate: "UA", release: "18 Jul, 2008", votes: "245K", poster: "https://images.jpegmini.com/user_guide/images/sample_images_scaled.jpg", backdrop: "https://images.jpegmini.com/user_guide/images/sample_images_scaled.jpg", synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice and safeguard the urban landscape." },
        { id: "mov-03", title: "Inception", rating: "8.8", genre: "Sci-Fi, Action, Thriller", languages: "English", duration: "2h 28m", certificate: "UA", release: "16 Jul, 2010", votes: "139K", poster: "https://images.jpegmini.com/user_guide/images/sample_images_scaled.jpg", backdrop: "https://images.jpegmini.com/user_guide/images/sample_images_scaled.jpg", synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C-suite target executive asset." }
    ];

    const VENUES_DATABASE = [
        { id: "ven-01", name: "Inox: Insignia Atrium Mall", slots: ["10:15 AM", "01:30 PM", "04:45 PM", "07:45 PM", "10:45 PM"], audi: "AUDI 3" },
        { id: "ven-02", name: "PVR: Director's Cut Nexus", slots: ["11:00 AM", "02:15 PM", "05:30 PM", "08:30 PM"], audi: "AUDI 1" },
        { id: "ven-03", name: "Cinepolis: VIP Grand Mall", slots: ["12:00 PM", "03:15 PM", "06:45 PM", "09:45 PM"], audi: "VIP LOUNGE" }
    ];

    const SEATING_LAYOUT_SCHEMA = [
        { tierName: "VIP Recliner • Rs. 350.00", price: 350, rows: [{ label: "H", columns: [1, 2, "A", 3, 4, 5, 6, 7, 8, "A", 9, 10] }, { label: "G", columns: [1, 2, "A", 3, 4, 5, 6, 7, 8, "A", 9, 10] }] },
        { tierName: "Executive Prime • Rs. 240.00", price: 240, rows: [{ label: "F", columns: [1, 2, "A", 3, 4, 5, 6, 7, 8, "A", 9, 10] }, { label: "E", columns: [1, 2, "A", 3, 4, 5, 6, 7, 8, "A", 9, 10] }, { label: "D", columns: [1, 2, "A", 3, 4, 5, 6, 7, 8, "A", 9, 10] }] },
        { tierName: "Cinema Classic • Rs. 160.00", price: 160, rows: [{ label: "B", columns: [1, 2, "A", 3, 4, 5, 6, 7, 8, "A", 9, 10] }, { label: "A", columns: [1, 2, "A", 3, 4, 5, 6, 7, 8, "A", 9, 10] }] }
    ];

    // --- LIVE FLOW STATE MACHINE CACHE ---
    let appState = {
        currentScreen: "city-modal",
        historyStack: [],
        selectedCity: "",
        selectedMovie: null,
        selectedVenue: null,
        selectedShowtime: "",
        selectedSeats: new Map() 
    };

    // --- HTML DOM ELEMENT POINTER TARGETS ---
    const domViews = {
        "city-modal": document.getElementById("screen-city-modal"),
        "movies-hub": document.getElementById("screen-movies-hub"),
        "movie-detail": document.getElementById("screen-movie-detail"),
        "showtimes": document.getElementById("screen-showtimes"),
        "seating-grid": document.getElementById("screen-seating-grid"),
        "checkout": document.getElementById("screen-checkout"),
        "ticket-receipt": document.getElementById("screen-ticket-receipt")
    };

    const backBtn = document.getElementById("app-back-router");
    const activeCityLabel = document.getElementById("active-city-label");
    const globalFooter = document.getElementById("global-action-footer-panel");
    const footerSeats = document.getElementById("footer-seats-list-summary");
    const footerTotal = document.getElementById("footer-total-cost-summary");
    const footerForwardBtn = document.getElementById("footer-forward-step-trigger-btn");

    // --- 1. CORE APPLICATION VIEW MANAGER ROUTER ---
    function switchView(targetScreen, saveToHistory = true) {
        Object.values(domViews).forEach(viewNode => {
            if (viewNode) viewNode.classList.remove("active");
        });
        if (globalFooter) globalFooter.style.display = "none";

        if (saveToHistory && appState.currentScreen !== targetScreen) {
            appState.historyStack.push(appState.currentScreen);
        }

        appState.currentScreen = targetScreen;
        if (domViews[targetScreen]) domViews[targetScreen].classList.add("active");

        if (backBtn) {
            backBtn.style.visibility = appState.historyStack.length > 0 && targetScreen !== "city-modal" ? "visible" : "hidden";
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        executeScreenLoadRoutines(targetScreen);
    }

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (appState.historyStack.length > 0) {
                const previousScreen = appState.historyStack.pop();
                switchView(previousScreen, false);
            }
        });
    }

    const homeTrigger = document.getElementById("logo-home-trigger");
    if (homeTrigger) {
        homeTrigger.addEventListener("click", () => {
            if (appState.selectedCity) {
                appState.historyStack = [];
                switchView("movies-hub");
            }
        });
    }

    const cityDropdown = document.getElementById("city-dropdown-trigger");
    if (cityDropdown) {
        cityDropdown.addEventListener("click", () => {
            switchView("city-modal");
        });
    }

    // --- 2. VIEW-SPECIFIC LIFE CYCLE HANDLER EXECUTION LOOPS ---
    function executeScreenLoadRoutines(screenName) {
        if (screenName === "movies-hub") {
            renderMoviesCatalogue();
        } else if (screenName === "showtimes") {
            renderVenuesSchedule();
        } else if (screenName === "seating-grid") {
            renderPersistentSeatingMatrix(); // Loads saved layout locks dynamically
            syncFooterDrawerState();
        } else if (screenName === "checkout") {
            compileCheckoutInvoice();
        } else if (screenName === "ticket-receipt") {
            generateFinalReceiptScreen();
        }
    }

    // --- STAGE 1 ROUTINES: CITY REGION VALIDATION ---
    document.querySelectorAll(".city-card-unit").forEach(card => {
        card.addEventListener("click", (e) => {
            const selectedUnit = e.currentTarget;
            appState.selectedCity = selectedUnit.dataset.city;
            if (activeCityLabel) activeCityLabel.innerText = appState.selectedCity;
            appState.historyStack = [];
            switchView("movies-hub");
        });
    });

    // --- STAGE 2 ROUTINES: HOMEPAGE CATALOG CATALOG BUILDER ---
    function renderMoviesCatalogue() {
        const target = document.getElementById("movies-render-target");
        if (!target) return;
        target.innerHTML = "";

        MOVIES_DATABASE.forEach(movie => {
            const frame = document.createElement("div");
            frame.classList.add("movie-poster-card-frame");
            frame.innerHTML = `
                <div class="poster-img-container">
                    <img src="${movie.poster}" alt="${movie.title}">
                    <div class="movie-card-metrics-overlay-strip">
                        <span><i class="fas fa-star star-accent"></i> ${movie.rating}/10</span>
                        <span>${movie.votes}</span>
                    </div>
                </div>
                <h4>${movie.title}</h4>
                <p>${movie.genre}</p>
            `;
            frame.addEventListener("click", () => {
                appState.selectedMovie = movie;
                loadMovieDetailsPage();
            });
            target.appendChild(frame);
        });
    }

    // --- STAGE 3 ROUTINES: MOVIE DETAIL SYNCHRONIZATION ---
    function loadMovieDetailsPage() {
        const m = appState.selectedMovie;
        document.getElementById("detail-backdrop-target").style.backgroundImage = `url('${m.backdrop}')`;
        document.getElementById("detail-poster").src = m.poster;
        document.getElementById("detail-title").innerText = m.title;
        document.getElementById("detail-rating").innerText = `${m.rating}/10`;
        document.getElementById("detail-languages").innerText = m.languages;
        document.getElementById("detail-meta-line").innerText = `${m.duration} • ${m.genre} • ${m.certificate} • ${m.release}`;
        document.getElementById("detail-synopsis").innerText = m.synopsis;

        switchView("movie-detail");
    }

    const bookTicketsBtn = document.getElementById("detail-book-tickets-btn");
    if (bookTicketsBtn) {
        bookTicketsBtn.addEventListener("click", () => {
            switchView("showtimes");
        });
    }

    // --- STAGE 4 ROUTINES: CINEMA SHOWTIMES PARSING ---
    function renderVenuesSchedule() {
        const heading = document.getElementById("showtime-movie-heading");
        if (heading) heading.innerText = appState.selectedMovie.title;
        
        const target = document.getElementById("venues-render-target");
        if (!target) return;
        target.innerHTML = "";

        VENUES_DATABASE.forEach(venue => {
            const card = document.createElement("div");
            card.classList.add("venue-row-card-unit");
            
            let slotsHTML = "";
            venue.slots.forEach(slot => {
                slotsHTML += `<button class="showtime-pill-btn" data-slot="${slot}">${slot}</button>`;
            });

            card.innerHTML = `
                <div class="venue-left-identity-meta">
                    <h4><i class="far fa-heart"></i> ${venue.name}</h4>
                    <span class="venue-m-ticket-tag"><i class="fas fa-mobile-alt"></i> M-Ticket Available</span>
                </div>
                <div class="venue-right-time-slots-flex-grid">
                    ${slotsHTML}
                </div>
            `;

            card.querySelectorAll(".showtime-pill-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    appState.selectedVenue = venue;
                    appState.selectedShowtime = e.target.dataset.slot;
                    appState.selectedSeats.clear(); 
                    switchView("seating-grid");
                });
            });

            target.appendChild(card);
        });
    }

    // --- STAGE 5 ROUTINES: INTERACTIVE STRUCTURE LAYER MATRIX WITH STORAGEHANDSHAKE ---
    const matrixContainer = document.getElementById("seats-matrix-render-vector");
    if (matrixContainer) {
        matrixContainer.addEventListener("click", (e) => {
            const cell = e.target;
            if (cell.classList.contains("seat-unit") && !cell.classList.contains("sold")) {
                const key = cell.dataset.seatKey;
                const cost = parseInt(cell.dataset.price);

                if (cell.classList.contains("selected")) {
                    cell.classList.remove("selected");
                    appState.selectedSeats.delete(key);
                } else {
                    cell.classList.add("selected");
                    appState.selectedSeats.set(key, cost);
                }
                syncFooterDrawerState();
            }
        });
    }

    function syncFooterDrawerState() {
        if (appState.currentScreen !== "seating-grid") return;

        if (appState.selectedSeats.size > 0) {
            let total = 0;
            let list = [];
            appState.selectedSeats.forEach((price, id) => { total += price; list.push(id.replace("-","")); });
            
            if (footerSeats) footerSeats.innerText = `Selected Seats: ${list.join(", ")}`;
            if (footerTotal) footerTotal.innerText = `Rs. ${total}.00`;
            if (footerForwardBtn) footerForwardBtn.innerText = "Proceed to Review Summary";
            if (globalFooter) globalFooter.style.display = "block";
        } else {
            if (globalFooter) globalFooter.style.display = "none";
        }
    }

    if (footerForwardBtn) {
        footerForwardBtn.addEventListener("click", () => {
            if (appState.currentScreen === "seating-grid") switchView("checkout");
        });
    }

    // --- STAGE 6 ROUTINES: ORDER COMPILATION INVOICE GATEWAY ---
    function compileCheckoutInvoice() {
        let totalBase = 0;
        let list = [];
        appState.selectedSeats.forEach((price, id) => { totalBase += price; list.push(id.replace("-","")); });

        const taxes = parseFloat((totalBase * 0.18).toFixed(2));
        const absolutePayable = totalBase + taxes;

        document.getElementById("invoice-movie-name").innerText = appState.selectedMovie.title;
        document.getElementById("invoice-venue-line").innerText = `${appState.selectedVenue.name} | ${appState.selectedShowtime}, Today`;
        document.getElementById("invoice-tickets-count-label").innerText = `${appState.selectedSeats.size} Ticket(s) Selected`;
        document.getElementById("invoice-seats-list-values").innerText = list.join(", ");
        document.getElementById("invoice-tax-charges").innerText = `Rs. ${taxes.toFixed(2)}`;
        document.getElementById("invoice-final-total-cost-value").innerText = `Rs. ${absolutePayable.toFixed(2)}`;
    }

    // 💾 LOCAL STORAGE WRITER: COMMITS PERMANENT SEAT RECORD ARRAYS
    const payTriggerBtn = document.getElementById("gateway-payment-trigger-btn");
    if (payTriggerBtn) {
        payTriggerBtn.addEventListener("click", () => {
            // Unique tracking key combination template syntax: "mov-01_ven-01_0745PM"
            const storageKey = `BMS_LOCK_${appState.selectedMovie.id}_${appState.selectedVenue.id}_${appState.selectedShowtime.replace(/[: ]/g, "")}`;
            
            // Extract previously saved tickets from localStorage cache arrays
            let persistentSoldSeats = JSON.parse(localStorage.getItem(storageKey)) || [];

            // Merge current screen selections into structural storage arrays
            appState.selectedSeats.forEach((price, seatKey) => {
                if (!persistentSoldSeats.includes(seatKey)) {
                    persistentSoldSeats.push(seatKey);
                }
            });

            // Push updated values natively into browser memory
            localStorage.setItem(storageKey, JSON.stringify(persistentSoldSeats));
            console.log(`Saved successfully! Permanent localStorage lock array committed for key: ${storageKey}`);
            
            switchView("ticket-receipt");
        });
    }

    // --- STAGE 7 ROUTINES: FINAL CONFIRMATION M-TICKET PASS ---
    function generateFinalReceiptScreen() {
        let list = [];
        appState.selectedSeats.forEach((price, id) => list.push(id.replace("-","")));

        document.getElementById("ticket-movie-title").innerText = appState.selectedMovie.title;
        document.getElementById("ticket-venue-name").innerText = appState.selectedVenue.name;
        document.getElementById("ticket-datetime-line").innerText = `Today, 18 Jun | ${appState.selectedShowtime}`;
        document.getElementById("ticket-audi-num").innerText = appState.selectedVenue.audi;
        document.getElementById("ticket-seats-list").innerText = list.join(", ");
    }

    const homeReturnBtn = document.getElementById("receipt-home-return-btn");
    if (homeReturnBtn) {
        homeReturnBtn.addEventListener("click", () => {
            appState.historyStack = [];
            appState.selectedSeats.clear();
            switchView("movies-hub");
        });
    }

    // --- PERSISTENT STORAGE SYNC READING ROUTINES ENGINE ---
    function renderPersistentSeatingMatrix() {
        const target = document.getElementById("seats-matrix-render-vector");
        if (!target) return;
        target.innerHTML = "";

        // Build composite retrieval key dynamically matching movie, cinema hall, and targeted time slot
        const storageKey = `BMS_LOCK_${appState.selectedMovie.id}_${appState.selectedVenue.id}_${appState.selectedShowtime.replace(/[: ]/g, "")}`;
        const savedSoldSeatsArray = JSON.parse(localStorage.getItem(storageKey)) || [];
        const soldSeatsSet = new Set(savedSoldSeatsArray);

        SEATING_LAYOUT_SCHEMA.forEach(tier => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("tier-wrapper");
            wrapper.innerHTML = `<h4 class="tier-header-label">${tier.tierName}</h4>`;

            tier.rows.forEach(row => {
                const line = document.createElement("div");
                line.classList.add("row-matrix-line");
                line.innerHTML = `<div class="flank-row-id">${row.label}</div>`;

                const cellsContainer = document.createElement("div");
                cellsContainer.classList.add("row-cells-container");

                row.columns.forEach(col => {
                    if (col === "A") {
                        const gap = document.createElement("div");
                        gap.classList.add("aisle-gap-cell");
                        cellsContainer.appendChild(gap);
                    } else {
                        const seat = document.createElement("div");
                        seat.classList.add("seat-unit");
                        seat.innerText = col;
                        
                        const seatKey = `${row.label}-${col}`;
                        seat.dataset.seatKey = seatKey;
                        seat.dataset.price = tier.price;

                        // Layout State Prioritization Engine Check loop
                        if (soldSeatsSet.has(seatKey)) {
                            seat.classList.add("sold"); // Saved permanent database locks
                        } else if (appState.selectedSeats.has(seatKey)) {
                            seat.classList.add("selected"); // Currently clicked targets
                        } else if (!localStorage.getItem(storageKey) && Math.random() < 0.15) {
                            // Only generate secondary mock filler seats if the specific layout has never been booked before
                            seat.classList.add("sold");
                        }

                        cellsContainer.appendChild(seat);
                    }
                });

                line.appendChild(cellsContainer);
                line.innerHTML += `<div class="flank-row-id right">${row.label}</div>`;
                wrapper.appendChild(line);
            });
            target.appendChild(wrapper);
        });
    }
});