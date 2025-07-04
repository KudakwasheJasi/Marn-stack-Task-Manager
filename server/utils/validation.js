/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
    if (!email) return false;
    
    // Remove whitespace and convert to lowercase
    email = email.trim().toLowerCase();
    
    // Basic email format check
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
        console.log('Email failed basic validation:', email);
        return false;
    }

    // Check for common email providers
    const commonProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = email.split('@')[1];
    if (commonProviders.includes(domain)) {
        return true;
    }

    // For other domains, do basic validation
    return re.test(email);
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {boolean} - True if password meets requirements
 */
export const validatePassword = (password) => {
    // Password must be at least 6 characters and contain at least one letter and one number
    const minLength = password.length >= 6;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return minLength && hasLetter && hasNumber;
};

/**
 * Validates name format
 * @param {string} name - The name to validate
 * @returns {boolean} - True if name is valid
 */
export const validateName = (name) => {
    // Name must be at least 2 characters and contain only letters and spaces
    return name.length >= 2 && /^[A-Za-z\s]*$/.test(name);
};

/**
 * Sanitizes input by trimming and converting to lowercase if specified
 * @param {string} input - The input to sanitize
 * @param {boolean} toLowerCase - Whether to convert to lowercase
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input, toLowerCase = false) => {
    if (!input) return '';
    let sanitized = input.trim();
    return toLowerCase ? sanitized.toLowerCase() : sanitized;
};