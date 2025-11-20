// ========================================================
// Global JavaScript for the website
// --------------------------------------------------------
// 1. Handles mobile navigation toggle
// 2. Sets the current year in the footer automatically
// 3. Simple admin login and marks management using localStorage
// 4. Fills scrolling latest notification ticker on the home page
//    with pause on hover/touch, speed control, and click to open
//    detailed notifications page.
// 5. Handles Study Materials subject tab switching
// ========================================================

const STORAGE_KEYS = {
    marks: 'mechhub_marks_v1'
};

// Speed control for ticker (lower = faster, higher = slower)
const TICKER_SPEED_SECONDS = 20; // Change this value (e.g., 15, 25, 30)

// Sample marks used when there is no data yet in localStorage
const defaultMarksData = [
    { name: 'Arun Kumar', roll: 'ME2301', subject: 'Thermodynamics', internal: 24, exam: 62 },
    { name: 'Sneha R', roll: 'ME2302', subject: 'Strength of Materials', internal: 27, exam: 64 },
    { name: 'Vignesh P', roll: 'ME2303', subject: 'Manufacturing Technology', internal: 22, exam: 58 },
    { name: 'Priya S', roll: 'ME2304', subject: 'Fluid Mechanics', internal: 25, exam: 60 },
    { name: 'Karthik M', roll: 'ME2305', subject: 'Machine Design', internal: 23, exam: 59 }
];

// -------------------------------------------------------------------
// Latest notifications for ticker (HOME PAGE)
// HOW TO CHANGE TEXT:
// 1. Edit the messages in this array.
// -------------------------------------------------------------------
const latestNotifications = [
    'Internal Assessment Test - II from 25 Nov 2025 to 28 Nov 2025.',
    'Thermal Engineering Lab record submission due on 22 Nov 2025.',
    'Guest lecture on Industry 4.0 next week – attendance compulsory.'
];

// -------- LocalStorage helpers for marks data --------

function getMarksData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.marks);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (err) {
        console.warn('Could not read marks from localStorage:', err);
    }
    // Fallback to sample data
    return defaultMarksData.slice();
}

function saveMarksData(data) {
    try {
        localStorage.setItem(STORAGE_KEYS.marks, JSON.stringify(data));
    } catch (err) {
        console.error('Could not save marks to localStorage:', err);
        alert('Unable to save marks (localStorage error). Please check your browser settings.');
    }
}

// -------- Rendering functions --------

function renderMarksTable() {
    const tbody = document.getElementById('marksTableBody');
    if (!tbody) return; // This page might not be the marks page

    const data = getMarksData();
    tbody.innerHTML = '';

    data.forEach((row, index) => {
        const total = Number(row.internal || 0) + Number(row.exam || 0);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.name}</td>
            <td>${row.roll}</td>
            <td>${row.subject}</td>
            <td>${row.internal}</td>
            <td>${row.exam}</td>
            <td>${total}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAdminMarksList() {
    const container = document.getElementById('adminMarksList');
    if (!container) return; // Only on admin page

    const data = getMarksData();
    if (!data.length) {
        container.innerHTML = '<p>No marks added yet.</p>';
        return;
    }

    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr>' +
        '<th>S.No</th><th>Name</th><th>Roll No</th><th>Subject</th><th>Internal</th><th>Exam</th><th>Total</th>' +
        '</tr></thead><tbody>';

    data.forEach((row, index) => {
        const total = Number(row.internal || 0) + Number(row.exam || 0);
        html += `<tr>
            <td>${index + 1}</td>
            <td>${row.name}</td>
            <td>${row.roll}</td>
            <td>${row.subject}</td>
            <td>${row.internal}</td>
            <td>${row.exam}</td>
            <td>${total}</td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// -------- Admin login and panel setup --------

function setupAdminPanel() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const marksForm = document.getElementById('marksEntryForm');
    const resetMarksBtn = document.getElementById('resetMarksBtn');

    // CHANGE PASSWORD HERE:
    const ADMIN_PASSWORD = 'mech123';

    if (loginForm && loginSection && adminPanel) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const passwordInput = document.getElementById('adminPassword');
            if (!passwordInput) return;

            if (passwordInput.value === ADMIN_PASSWORD) {
                loginSection.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                passwordInput.value = '';
                renderAdminMarksList();
            } else {
                alert('Incorrect password. Please try again.');
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }

    if (marksForm) {
        marksForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const nameInput = document.getElementById('markStudentName');
            const rollInput = document.getElementById('markRollNo');
            const subjectInput = document.getElementById('markSubject');
            const internalInput = document.getElementById('markInternal');
            const examInput = document.getElementById('markExam');

            if (!nameInput || !rollInput || !subjectInput || !internalInput || !examInput) return;

            const name = nameInput.value.trim();
            const roll = rollInput.value.trim();
            const subject = subjectInput.value.trim();
            const internal = Number(internalInput.value);
            const exam = Number(examInput.value);

            if (!name || !roll || !subject || isNaN(internal) || isNaN(exam)) {
                alert('Please fill in all fields with valid values.');
                return;
            }

            const data = getMarksData();
            data.push({ name, roll, subject, internal, exam });
            saveMarksData(data);

            // Update views
            renderMarksTable();
            renderAdminMarksList();

            // Clear the form
            marksForm.reset();
            nameInput.focus();

            alert('Marks saved successfully!');
        });
    }

    if (resetMarksBtn) {
        resetMarksBtn.addEventListener('click', () => {
            if (confirm('This will clear all saved marks and restore the sample data. Continue?')) {
                localStorage.removeItem(STORAGE_KEYS.marks);
                renderMarksTable();
                renderAdminMarksList();
            }
        });
    }
}

// -------- Materials subject tabs (Study Materials page) --------

function setupMaterialsTabs() {
    const buttons = document.querySelectorAll('.materials-subject-btn');
    const panels = document.querySelectorAll('.materials-panel');
    if (!buttons.length || !panels.length) return; // Only on materials page

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.subject;
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            panels.forEach(panel => {
                panel.classList.toggle('active', panel.dataset.subject === target);
            });
        });
    });
}

// -------- Ticker setup (home page) --------

function setupTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent) return; // Only on home page

    // Set text
    tickerContent.textContent = latestNotifications.join('   |   ');

    // Apply speed control (animation-duration from JS)
    tickerContent.style.animationDuration = TICKER_SPEED_SECONDS + 's';

    const ticker = document.querySelector('.ticker');
    if (!ticker) return;

    // Pause function
    const pause = () => {
        tickerContent.style.animationPlayState = 'paused';
    };

    // Resume function
    const resume = () => {
        tickerContent.style.animationPlayState = 'running';
    };

    // Desktop: pause on hover, resume on mouse leave
    ticker.addEventListener('mouseenter', pause);
    ticker.addEventListener('mouseleave', resume);

    // Mobile: pause on touch, resume on touch end/cancel
    ticker.addEventListener('touchstart', (e) => {
        pause();
    }, { passive: true });

    ticker.addEventListener('touchend', resume);
    ticker.addEventListener('touchcancel', resume);

    // Click ticker to open detailed notifications page
    ticker.addEventListener('click', () => {
        window.location.href = 'notifications.html';
    });
}

// -------- Common setup (navigation + footer year) --------

document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('show');
        });
    }

    // Set current year in footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        const now = new Date();
        yearSpan.textContent = now.getFullYear();
    }

    // Render marks table on marks page (or wherever the table exists)
    renderMarksTable();

    // Setup admin panel (only runs on admin page)
    setupAdminPanel();

    // Setup ticker on home page
    setupTicker();

    // Setup materials subject tabs
    setupMaterialsTabs();
});
