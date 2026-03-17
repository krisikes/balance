// State management
const state = {
    isEnabled: true,
    stats: {
        pagesChecked: 0,
        contentBlocked: 0
    }
};

// DOM Elements
const toggleButton = document.getElementById('toggleExtension');
const openOptionsButton = document.getElementById('openOptions');
const reportIssueLink = document.getElementById('reportIssue');
const pagesCheckedElement = document.getElementById('pagesChecked');
const contentBlockedElement = document.getElementById('contentBlocked');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');

// Load state from storage
chrome.storage.local.get(['isEnabled', 'stats'], (result) => {
    if (result.isEnabled !== undefined) {
        state.isEnabled = result.isEnabled;
    }
    if (result.stats) {
        state.stats = result.stats;
    }
    updateUI();
});

// Update UI based on state
function updateUI() {
    // Update toggle button
    toggleButton.querySelector('.button-text').textContent = state.isEnabled ? 'Disable' : 'Enable';
    toggleButton.classList.toggle('secondary', !state.isEnabled);
    
    // Update status indicator
    statusDot.classList.toggle('active', state.isEnabled);
    statusText.textContent = state.isEnabled ? 'Active' : 'Disabled';
    
    // Update statistics
    pagesCheckedElement.textContent = state.stats.pagesChecked;
    contentBlockedElement.textContent = state.stats.contentBlocked;
}

// Toggle extension state
toggleButton.addEventListener('click', () => {
    state.isEnabled = !state.isEnabled;
    chrome.storage.local.set({ isEnabled: state.isEnabled });
    updateUI();
    
    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleExtension',
                isEnabled: state.isEnabled
            });
        }
    });
});

// Open options page
openOptionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

// Report issue
reportIssueLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
        url: 'https://github.com/yourusername/balance/issues/new'
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStats') {
        state.stats = message.stats;
        chrome.storage.local.set({ stats: state.stats });
        updateUI();
    }
});