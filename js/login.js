document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
        // TODO: Replace with your Firebase project configuration
        // You can find these values in your Firebase Console:
        // 1. Go to Project Settings (⚙️)
        // 2. Scroll to "Your apps" section
        // 3. Click on the web app (</>)
        // 4. Copy the configuration object
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    firebase.initializeApp(firebaseConfig);

    // Get references to DOM elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const googleButton = document.getElementById('google-button');
    const facebookButton = document.getElementById('facebook-button');
    const togglePassword = document.getElementById('togglePassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const rememberMe = document.getElementById('rememberMe');
    const trustDevice = document.getElementById('trustDevice');
    const captchaContainer = document.getElementById('captchaContainer');
    const loginAttempts = document.getElementById('loginAttempts');
    const forgotPassword = document.getElementById('forgotPassword');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Initialize reCAPTCHA
    let recaptchaVerifier;
    function initializeRecaptcha() {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('captchaContainer', {
            'size': 'normal',
            'callback': (response) => {
                // reCAPTCHA verified
                console.log('reCAPTCHA verified');
            },
            'expired-callback': () => {
                // reCAPTCHA expired
                console.log('reCAPTCHA expired');
            }
        });
        recaptchaVerifier.render();
    }

    // Password strength indicator
    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[^a-zA-Z0-9]+/)) strength++;

        passwordStrength.className = 'password-strength';
        if (strength <= 2) {
            passwordStrength.classList.add('strength-weak');
        } else if (strength === 3) {
            passwordStrength.classList.add('strength-medium');
        } else if (strength === 4) {
            passwordStrength.classList.add('strength-strong');
        } else {
            passwordStrength.classList.add('strength-very-strong');
        }
    }

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Password strength check
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

    // Show loading overlay
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    // Hide loading overlay
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // Handle email/password login
    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        try {
            showLoading();
            
            // Check if device is trusted
            if (trustDevice.checked) {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            } else {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
            }

            // Sign in with email and password
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Store login information
            if (rememberMe.checked) {
                localStorage.setItem('lastLoginEmail', email);
            }
            
            // Update login attempts display
            updateLoginAttempts(userCredential.user);
            
            window.location.href = 'index.html';
        } catch (error) {
            hideLoading();
            handleLoginError(error);
        }
    });

    // Handle Google login
    googleButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            await firebase.auth().signInWithPopup(provider);
            window.location.href = 'index.html';
        } catch (error) {
            hideLoading();
            handleLoginError(error);
        }
    });

    // Handle Facebook login
    facebookButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const provider = new firebase.auth.FacebookAuthProvider();
            provider.setCustomParameters({
                display: 'popup'
            });
            await firebase.auth().signInWithPopup(provider);
            window.location.href = 'index.html';
        } catch (error) {
            hideLoading();
            handleLoginError(error);
        }
    });

    // Handle forgot password
    forgotPassword.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }

        try {
            showLoading();
            await firebase.auth().sendPasswordResetEmail(email);
            alert('Password reset email sent. Please check your inbox.');
        } catch (error) {
            hideLoading();
            alert(error.message);
        }
    });

    // Update login attempts display
    function updateLoginAttempts(user) {
        const lastLogin = new Date().toLocaleString();
        const loginInfo = {
            email: user.email,
            lastLogin: lastLogin,
            device: navigator.userAgent
        };
        
        // Store login history
        let loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        loginHistory.unshift(loginInfo);
        loginHistory = loginHistory.slice(0, 5); // Keep only last 5 logins
        localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
        
        // Update display
        loginAttempts.innerHTML = `Last login: ${lastLogin}`;
    }

    // Handle login errors
    function handleLoginError(error) {
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Invalid email or password';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/account-exists-with-different-credential':
                errorMessage = 'An account already exists with this email using a different sign-in method.';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Popup blocked. Please allow popups for this site.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in popup was closed before completing the sign-in.';
                break;
        }
        
        alert(errorMessage);
    }

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.location.href = 'index.html';
        } else {
            // Initialize reCAPTCHA when user is not logged in
            initializeRecaptcha();
            
            // Load last used email if remember me was checked
            const lastLoginEmail = localStorage.getItem('lastLoginEmail');
            if (lastLoginEmail) {
                emailInput.value = lastLoginEmail;
                rememberMe.checked = true;
            }
        }
    });

    // Helper functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(message) {
        // Create error message element if it doesn't exist
        let errorElement = document.querySelector('.error-message.global');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message global';
            document.querySelector('.login-container').insertBefore(errorElement, loginButton);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}); 