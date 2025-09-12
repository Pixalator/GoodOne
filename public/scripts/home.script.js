// Firebase Configuration - Replace with your project's configuration
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-rental-app';

// Import statements
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');

let userId = null;
let isAuthReady = false;

// --- AUTHENTICATION ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        document.getElementById('userIdDisplay').textContent = userId;
        isAuthReady = true;
        initializeAppData();
    } else {
        try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    }
});

// --- APP INITIALIZATION ---
function initializeAppData() {
    if (!isAuthReady) return;
    setupEventListeners();
    setupNavigation();
    loadPayments();
    loadMaintenanceRequests();
    loadDocuments();
    loadChatMessages();
}

// --- UI & NAVIGATION ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const activeLinkClass = 'active-link';
    const activeSectionClass = 'active';

    // Set initial active state
    document.querySelector('.nav-link[href="#dashboard"]').classList.add(activeLinkClass);
    document.getElementById('dashboard').classList.add(activeSectionClass);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            navLinks.forEach(l => l.classList.remove(activeLinkClass));
            link.classList.add(activeLinkClass);

            sections.forEach(section => {
                section.classList.remove(activeSectionClass);
                if (section.id === targetId) {
                    section.classList.add(activeSectionClass);
                }
            });
        });
    });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Pay Rent
    document.getElementById('payRentBtn').addEventListener('click', addPayment);
    
    // Maintenance Form
    document.getElementById('maintenance-form').addEventListener('submit', addMaintenanceRequest);

    // Document Upload
    document.getElementById('file-upload-input').addEventListener('change', addDocument);
    
    // Chat Form
    document.getElementById('chat-form').addEventListener('submit', sendChatMessage);
}

// --- PAYMENTS ---
const paymentsCollection = collection(db, `artifacts/${appId}/public/data/payments`);

async function addPayment() {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    try {
        await addDoc(paymentsCollection, {
            month: month,
            amount: 1200.00,
            date: serverTimestamp(),
            status: 'Paid',
            userId: userId
        });
    } catch (error) {
        console.error("Error adding payment: ", error);
    }
}

function loadPayments() {
    onSnapshot(query(paymentsCollection), (snapshot) => {
        const paymentHistoryBody = document.getElementById('payment-history-body');
        paymentHistoryBody.innerHTML = '';
        let activities = [];
        snapshot.docs.forEach(doc => {
            const payment = doc.data();
            const date = payment.date?.toDate ? payment.date.toDate().toLocaleDateString() : 'N/A';
            const row = `
                <tr class="border-b">
                    <td class="py-2">${payment.month}</td>
                    <td class="py-2">$${payment.amount.toFixed(2)}</td>
                    <td class="py-2">${date}</td>
                    <td class="py-2"><span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">${payment.status}</span></td>
                </tr>`;
            paymentHistoryBody.innerHTML += row;
            if(payment.date) activities.push({ text: `Rent paid for ${payment.month}`, date: payment.date.toDate() });
        });
        updateRecentActivity(activities);
    });
}

// --- MAINTENANCE ---
const maintenanceCollection = collection(db, `artifacts/${appId}/public/data/maintenance`);

async function addMaintenanceRequest(e) {
    e.preventDefault();
    const title = document.getElementById('issue-title').value;
    const description = document.getElementById('issue-description').value;
    try {
        await addDoc(maintenanceCollection, {
            title,
            description,
            status: 'Open',
            requestedAt: serverTimestamp(),
            userId: userId
        });
        document.getElementById('maintenance-form').reset();
    } catch (error) {
        console.error("Error adding maintenance request: ", error);
    }
}

function loadMaintenanceRequests() {
    onSnapshot(query(maintenanceCollection), (snapshot) => {
        const maintenanceList = document.getElementById('maintenance-list');
        maintenanceList.innerHTML = '';
        let openRequests = 0;
        let activities = [];
        snapshot.docs.forEach(doc => {
            const request = doc.data();
            if (request.status === 'Open') openRequests++;
            const date = request.requestedAt?.toDate ? request.requestedAt.toDate().toLocaleDateString() : 'N/A';
            const item = `
                <div class="border p-4 rounded-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold">${request.title}</h4>
                            <p class="text-sm text-gray-600">${request.description}</p>
                        </div>
                        <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">${request.status}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Requested on: ${date}</p>
                </div>`;
            maintenanceList.innerHTML += item;
            if(request.requestedAt) activities.push({ text: `Maintenance request: ${request.title}`, date: request.requestedAt.toDate() });
        });
        document.getElementById('dashboard-maintenance-count').textContent = openRequests;
        updateRecentActivity(activities);
    });
}

// --- DOCUMENTS ---
const documentsCollection = collection(db, `artifacts/${appId}/public/data/documents`);

async function addDocument(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
        await addDoc(documentsCollection, {
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: serverTimestamp(),
            userId: userId
        });
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

function loadDocuments() {
    onSnapshot(query(documentsCollection), (snapshot) => {
        const documentList = document.getElementById('document-list');
        documentList.innerHTML = '';
        let activities = [];
        snapshot.docs.forEach(doc => {
            const file = doc.data();
            const iconClass = getFileIcon(file.type);
            const item = `
                <div class="border p-4 rounded-lg flex flex-col items-center text-center">
                    <i class="${iconClass} text-4xl text-indigo-500 mb-2"></i>
                    <p class="font-medium text-sm break-all">${file.name}</p>
                    <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(2)} KB</p>
                </div>`;
            documentList.innerHTML += item;
            if(file.uploadedAt) activities.push({ text: `Document uploaded: ${file.name}`, date: file.uploadedAt.toDate() });
        });
        updateRecentActivity(activities);
    });
}

function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('word')) return 'fas fa-file-word';
    return 'fas fa-file';
}

// --- CHAT ---
const chatCollection = collection(db, `artifacts/${appId}/public/data/chat`);

async function sendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const messageText = input.value;
    if (messageText.trim() === '') return;

    try {
        await addDoc(chatCollection, {
            text: messageText,
            timestamp: serverTimestamp(),
            senderId: userId
        });
        input.value = '';
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

function loadChatMessages() {
    onSnapshot(query(chatCollection), (snapshot) => {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        snapshot.docs.sort((a, b) => a.data().timestamp - b.data().timestamp).forEach(doc => {
            const message = doc.data();
            const isSender = message.senderId === userId;
            const messageClass = isSender ? 'bg-indigo-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start';
            const time = message.timestamp?.toDate ? message.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

            const messageElement = `
                <div class="flex flex-col ${isSender ? 'items-end' : 'items-start'} mb-3">
                    <div class="max-w-xs lg:max-w-md p-3 rounded-lg ${messageClass}">
                        <p>${message.text}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${time}</p>
                </div>`;
            chatMessages.innerHTML += messageElement;
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// --- DASHBOARD ---
let allActivities = {};

function updateRecentActivity(newActivities) {
    newActivities.forEach(activity => {
        // Use a key to prevent duplicates
        const key = `${activity.date.getTime()}-${activity.text}`;
        allActivities[key] = activity;
    });

    const sortedActivities = Object.values(allActivities)
        .sort((a, b) => b.date - a.date)
        .slice(0, 5); // Limit to 5 recent activities

    const activityList = document.getElementById('recent-activity-list');
    activityList.innerHTML = '';
    sortedActivities.forEach(activity => {
        const item = `
            <li class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-700">${activity.text}</p>
                <p class="text-xs text-gray-500">${activity.date.toLocaleDateString()}</p>
            </li>`;
        activityList.innerHTML += item;
    });
}

// Initial call after auth is ready
window.onload = () => {
   // The onAuthStateChanged listener will trigger the app initialization.
};
