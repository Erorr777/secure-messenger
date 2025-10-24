Project Title: Secure Messenger (Lite)
Project Description
Secure Messenger (Lite) is an interactive web application designed for encrypting, decrypting, and analyzing text encoded with the Caesar cipher. It serves as both a practical encryption tool and an educational platform, demonstrating the fundamentals of classical cryptography and modern brute-force decryption techniques.

The application allows users to encrypt messages with a key, decrypt them manually, or use a powerful "Auto-Decrypt" feature to simulate a dictionary attack. To enhance security and shareability, it also includes a robust, two-tiered PIN-protection system.

Key Features
Standard Encryption/Decryption:

Encrypt: Encrypts plaintext using a specified shift key (1-25).

Manual Decrypt: Decrypts ciphertext when the correct key is known.

Advanced Auto-Decrypt (Brute-Force Attack):

An intelligent brute-force tool that attempts to find the correct key without prior knowledge.

Smart Strategy: Instead of only checking the first word, the tool implements a "word-search" strategy. It iterates through the first 10 words of the ciphertext, testing all 25 possible keys against each word.

Dictionary Check: The results are compared against a large, built-in dictionary of common English words to identify a successful match.

Attack Log:

A dedicated "View Attack Log" button opens a separate page detailing the entire brute-force process.

This log shows every word checked, every key attempted, and the final match that led to the successful decryption, making it an excellent educational tool.

Security Layer 1: PIN-Protected Encryption:

Users can add an optional PIN when encrypting.

The application calculates a secure hash (non-reversible) of the PIN and prepends it to the ciphertext (e.g., [HASH:-1234567]...).

The "Auto-Decrypt" function will detect this hash and prompt the user for the PIN before the attack can begin, protecting the message from unauthorized analysis.

Security Layer 2: Secure Shareable Links:

Generate Link/QR Code: Users can generate a unique, shareable URL (or a QR code for that URL) for a message. This link is secured with a PIN provided by the sender.

Receiver Page: This URL leads to a self-contained receiver page (receiver.html).

PIN Verification: The page prompts the recipient to enter the PIN.

If Correct: The message is decrypted in the browser and displayed.

If Incorrect: The page displays the original, unreadable ciphertext, keeping the message secure.

Utility Tools:

Copy Output: Instantly copies the decrypted (or encrypted) result to the clipboard.

Copy Share Link: Instantly copies the secure URL to the clipboard.

Generate Shareable QR: Creates a QR code for the secure link, perfect for mobile sharing.