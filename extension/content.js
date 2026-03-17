console.log("Balance script is running!");

// Configuration
const CONFIG = {
    API_URL: 'http://127.0.0.1:5000',
    CACHE_DURATION: 3600000, // 1 hour in milliseconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
};

// Cache implementation
const cache = {
    storage: new Map(),
    
    set(key, value) {
        this.storage.set(key, {
            value,
            timestamp: Date.now()
        });
    },
    
    get(key) {
        const item = this.storage.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > CONFIG.CACHE_DURATION) {
            this.storage.delete(key);
            return null;
        }
        
        return item.value;
    }
};

// Text extraction with improved efficiency
function extractTextContent() {
    const textNodes = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        }
    );

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode.textContent.trim());
    }

    return textNodes.join('\n');
}

// Show loading state
function showLoadingState() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'balance-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        text-align: center;
        padding: 10px;
        z-index: 999999;
        font-family: sans-serif;
    `;
    loadingDiv.textContent = 'Analyzing content...';
    document.body.appendChild(loadingDiv);
}

// Remove loading state
function removeLoadingState() {
    const loadingDiv = document.getElementById('balance-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 999999;
        font-family: sans-serif;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Block content with improved UI and animations
function blockContent() {
    document.body.innerHTML = `
        <div class="balance-blocked" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            color: #343a40;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            text-align: center;
            padding: 20px;
            animation: fadeIn 0.5s ease-out;
        ">
            <div class="blocked-icon" style="
                width: 80px;
                height: 80px;
                background-color: #dc3545;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 24px;
                animation: scaleIn 0.5s ease-out;
            ">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>

            <h1 style="
                color: #dc3545;
                margin-bottom: 20px;
                font-size: 32px;
                font-weight: 600;
                animation: slideUp 0.5s ease-out 0.2s both;
            ">Content Blocked</h1>

            <div class="blocked-message" style="
                max-width: 500px;
                margin-bottom: 30px;
                animation: slideUp 0.5s ease-out 0.4s both;
            ">
                <p style="
                    font-size: 18px;
                    margin-bottom: 15px;
                    line-height: 1.5;
                ">This page has been blocked by Balance.</p>
                <p style="
                    color: #6c757d;
                    font-size: 16px;
                    line-height: 1.5;
                ">Reason: Content classified as inappropriate.</p>
            </div>

            <div class="blocked-actions" style="
                display: flex;
                gap: 16px;
                animation: slideUp 0.5s ease-out 0.6s both;
            ">
                <button onclick="window.history.back()" style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">Go Back</button>
                <button onclick="window.location.href='https://www.google.com'" style="
                    background-color: #e9ecef;
                    color: #343a40;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">Go to Google</button>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleIn {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }

                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .blocked-icon {
                    position: relative;
                }

                .blocked-icon::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: #dc3545;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
            </style>
        </div>
    `;
}

// Main content checking function with retry logic
async function checkContent() {
    const currentURL = window.location.href;
    const pageText = extractTextContent();
    
    // Check cache first
    const cachedResult = cache.get(currentURL);
    if (cachedResult) {
        console.log('Using cached result');
        if (cachedResult.classification === 'pornographic') {
            blockContent();
        }
        return;
    }

    showLoadingState();
    
    let retries = 0;
    while (retries < CONFIG.MAX_RETRIES) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/check_content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: currentURL, text: pageText })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response from server:', data);

            // Cache the result
            cache.set(currentURL, data);

            if (data.classification === 'pornographic') {
                blockContent();
            }

            break;
        } catch (error) {
            console.error(`Attempt ${retries + 1} failed:`, error);
            retries++;
            
            if (retries === CONFIG.MAX_RETRIES) {
                showError('Failed to analyze content. Please try again later.');
            } else {
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            }
        }
    }

    removeLoadingState();
}

// Initialize content checking
console.log('Balance script is running!');
checkContent();

