// src/data/testData.ts

import { FormData } from '../pages/BugFormPage';

// --- Valid Data for Positive Testing ---
export const VALID_USER: FormData = {
    firstName: 'Hemashree',
    lastName: 'Tester',
    phoneNumber: '0412345678', // Exactly 10 digits (boundary check)
    country: 'Australia', 
    email: 'valid.user@datacom.com',
    password: 'Pswd123!', // 8 characters, within [6, 20] range
    agreeTerms: true,
};

// --- Invalid/Edge Data for Negative Testing ---
export const INVALID_USER = {
    // Boundary Values
    shortPhone: { ...VALID_USER, phoneNumber: '123456789' }, // 9 digits (Below minimum)
    longPassword: { ...VALID_USER, password: 'a'.repeat(21) }, // 21 chars (Above maximum)
    
    // Type/Format Validation
    badEmail: { ...VALID_USER, email: 'bad.email' }, 
    nonNumericPhone: { ...VALID_USER, phoneNumber: '041-ABC-789' },

    // Mandatory Missing 
    requiredMissing: { 
        firstName: '', 
        lastName: '', 
        phoneNumber: '', 
        email: '', 
        password: '', 
        country: VALID_USER.country,
        agreeTerms: false 
    },
};