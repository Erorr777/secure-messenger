// app.js

// --- 0. Dark Mode Logic (Run immediately to prevent flicker) ---
(function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
})();
// --- End Dark Mode Logic ---


/**
 * Simple hash function.
 */
function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get DOM Elements ---
    const textInput = document.getElementById('text-input');
    const textOutput = document.getElementById('text-output');
    const keyInput = document.getElementById('key-input');
    const pinInput = document.getElementById('pin-input');
    
    const encryptBtn = document.getElementById('encrypt-btn');
    const decryptBtn = document.getElementById('decrypt-btn');
    const autoDecryptBtn = document.getElementById('auto-decrypt-btn');
    
    const copyBtn = document.getElementById('copy-btn');
    const qrBtn = document.getElementById('qr-btn');
    const logBtn = document.getElementById('log-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn'); 
    const qrCodeContainer = document.getElementById('qr-code-container');
    
    // New Element for Dark Mode
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- 2. Caesar Cipher Function ---
    function caesarCipher(text, shift, mode) {
        if (typeof shift !== 'number' || shift < 1 || shift > 25) {
            shift = 3;
        }
        if (mode === 'decrypt') {
            shift = (26 - shift) % 26;
        }
        return text.replace(/[a-zA-Z]/g, (char) => {
            const charCode = char.charCodeAt(0);
            let base;
            if (char >= 'a' && char <= 'z') base = 'a'.charCodeAt(0);
            else if (char >= 'A' && char <= 'Z') base = 'A'.charCodeAt(0);
            else return char;
            return String.fromCharCode(((charCode - base + shift) % 26) + base);
        });
    }
    
    // --- 3. Hash Extraction Function ---
    function extractHashAndText(fullText) {
        const hashRegex = /^\[HASH:([^\]]+)\]/; 
        const match = fullText.match(hashRegex);
        if (match) {
            const hash = match[1];
            const text = fullText.substring(match[0].length);
            return { hash, text };
        } else {
            return { hash: null, text: fullText };
        }
    }

    // --- 4. Sharable Link Generation Function ---
    function generateShareableUrl() {
        const plaintext = textInput.value;
        const key = parseInt(keyInput.value);
        const pin = pinInput.value.trim();

        if (!plaintext) {
            alert('Please enter the original message in the "Input" box first.');
            return null;
        }
        if (!key || key < 1 || key > 25) {
            alert('Please enter a valid key (1-25).');
            return null;
        }
        if (!pin) {
            alert('Please enter a PIN to secure the link.');
            return null;
        }

        const ciphertext = caesarCipher(plaintext, key, 'encrypt');
        const hashedPin = simpleHash(pin);
        const encodedCipher = btoa(ciphertext);
        const urlHash = `receiver.html#c=${encodedCipher}&k=${key}&h=${hashedPin}`;
        const fullUrl = new URL(urlHash, window.location.href).href;
        
        return fullUrl;
    }

    // --- 5. Button Event Listeners ---

    // Encrypt Button
    encryptBtn.addEventListener('click', () => {
        const plaintext = textInput.value;
        const key = parseInt(keyInput.value);
        const pin = pinInput.value.trim();
        if (!plaintext) return alert('Please enter text to encrypt.');
        if (!key || key < 1 || key > 25) return alert('Please enter a valid key (1-25).');
        
        const ciphertext = caesarCipher(plaintext, key, 'encrypt');
        
        if (pin) {
            const hashedPin = simpleHash(pin); 
            textOutput.value = `[HASH:${hashedPin}]${ciphertext}`; 
        } else {
            textOutput.value = ciphertext;
        }
        clearQr();
    });

    // Manual Decrypt Button
    decryptBtn.addEventListener('click', () => {
        const fullCiphertext = textInput.value;
        const key = parseInt(keyInput.value);
        if (!fullCiphertext) return alert('Please enter text to decrypt.');
        if (!key || key < 1 || key > 25) return alert('Please enter a valid key (1-25).');
        
        const { text } = extractHashAndText(fullCiphertext);
        const plaintext = caesarCipher(text, key, 'decrypt');
        textOutput.value = plaintext;
        clearQr();
    });

    // Auto-Decrypt (Attack) Button
    autoDecryptBtn.addEventListener('click', () => {
        const fullCiphertext = textInput.value;
        if (!fullCiphertext) return alert('Please enter text to brute-force.');
        
        let logData = [];
        logData.push('Attempting brute-force (word search strategy)...');
        
        const { hash: correctHash, text: ciphertext } = extractHashAndText(fullCiphertext);
        
        if (correctHash) {
            const userPin = prompt('This message is PIN protected. Please enter the PIN to continue:');
            if (!userPin) return textOutput.value = 'Operation cancelled.';
            
            const userHash = simpleHash(userPin);
            if (userHash.toString() !== correctHash) {
                alert('Incorrect PIN! Operation cancelled.');
                return textOutput.value = 'PIN verification failed.';
            }
            logData.push('PIN verified successfully. Starting attack...');
        }
        
        textOutput.value = 'Processing...'; 
        const encryptedWords = ciphertext.split(/[\s,.!?]+/).slice(0, 10);
        let keyFound = false, foundKey = 0, foundWord = "";

        for (let i = 0; i < encryptedWords.length; i++) {
            const wordToTest = encryptedWords[i];
            if (!wordToTest) continue; 
            logData.push(`\n--- Checking encrypted word: "${wordToTest}" (Word #${i + 1}) ---`);
            for (let testKey = 1; testKey <= 25; testKey++) {
                const decryptedWord = caesarCipher(wordToTest, testKey, 'decrypt').toLowerCase();
                let logLine = `  Attempting Key ${testKey}: "${decryptedWord}"... `;
                
                if (typeof DICTIONARY === 'undefined') {
                    alert('FATAL ERROR: DICTIONARY is not defined. Make sure dictionary.js is loaded first.');
                    return;
                }
                
                if (DICTIONARY.includes(decryptedWord)) {
                    logLine += `Match found!`;
                    logData.push(logLine); 
                    keyFound = true; foundKey = testKey; foundWord = decryptedWord;
                    break; 
                } else {
                    logLine += `(No match)`;
                    logData.push(logLine); 
                }
            }
            if (keyFound) break;
            else logData.push(`--- No match found for word "${wordToTest}" ---`);
        }
        if (keyFound) {
            logData.push(`\n--- Key is likely: ${foundKey} (based on word: ${foundWord}) ---`);
            const fullPlaintext = caesarCipher(ciphertext, foundKey, 'decrypt');
            logData.push('\nFull decrypted message:\n' + fullPlaintext);
            textOutput.value = fullPlaintext;
        } else {
            logData.push('\nAttack failed. No matching word found in dictionary.');
            textOutput.value = 'Attack failed. No valid key found.';
        }
        localStorage.setItem('bruteForceLog', logData.join('\n'));
        clearQr();
    });
    
    // --- 6. Helper Tools Buttons ---

    // Copy Output Button
    copyBtn.addEventListener('click', () => {
        if (!textOutput.value) return;
        navigator.clipboard.writeText(textOutput.value)
            .then(() => alert('Output copied to clipboard!'))
            .catch(err => alert('Copy failed: ' + err));
    });

    // Generate QR Button
    qrBtn.addEventListener('click', () => {
        const fullUrl = generateShareableUrl();
        if (fullUrl) {
            clearQr();
            new QRCode(qrCodeContainer, {
                text: fullUrl,
                width: 256,
                height: 256
            });
        }
    });

    // View Log Button
    logBtn.addEventListener('click', () => {
        window.open('log.html', '_blank');
    });
    
    // Copy Share Link Button
    copyLinkBtn.addEventListener('click', () => {
        const fullUrl = generateShareableUrl();
        if (fullUrl) {
            navigator.clipboard.writeText(fullUrl)
                .then(() => {
                    alert('Secure share link copied to clipboard!');
                })
                .catch(err => {
                    alert('Failed to copy link: ' + err);
                });
        }
    });

    function clearQr() {
        qrCodeContainer.innerHTML = '';
    }

    // --- 7. Dark Mode Toggle Logic ---
    
    // Set initial icon on load
    if (localStorage.getItem('theme') === 'dark') {
        darkModeToggle.textContent = '☀️';
    } else {
        darkModeToggle.textContent = '🌙';
    }

    // Add click listener
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Save preference to localStorage and update icon
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            darkModeToggle.textContent = '☀️'; // Sun icon
        } else {
            localStorage.setItem('theme', 'light');
            darkModeToggle.textContent = '🌙'; // Moon icon
        }
    });

}); // End of DOMContentLoaded