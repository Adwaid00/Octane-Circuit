import config from './config.js';
import { userManager } from './userManager.js';

// Password visibility toggle
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// Password strength checker
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        // Calculate password strength
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        // Update UI
        const colors = ['#ff4444', '#ffbb33', '#00C851', '#33b5e5', '#2BBBAD'];
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        
        strengthBar.style.background = `linear-gradient(to right, ${colors[strength - 1]} ${strength * 20}%, #ddd ${strength * 20}%)`;
        strengthText.textContent = `Password strength: ${texts[strength - 1] || 'Very Weak'}`;
    });
}

// Form submission handling
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = this.email.value;
        const password = this.password.value;
        const remember = this.remember.checked;

        try {
            const user = await userManager.login(email, password);
            userManager.updateHeaderUI();
            window.location.href = '/';
        } catch (error) {
            showError(error.message);
        }
    });
}

if (signupForm) {
    let verificationStep = 'details'; // details -> otp -> complete
    let pendingUser = null;

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (verificationStep === 'details') {
            const fullname = this.fullname.value;
            const email = this.email.value;
            const phone = this.phone.value;
            const password = this.password.value;
            const confirmPassword = this['confirm-password'].value;

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            try {
                pendingUser = {
                    fullname,
                    email,
                    phone,
                    password
                };

                // Generate and send OTP
                const otp = userManager.generateOTP();
                userManager.storeOTP(phone, otp);

                // In a real application, you would send this OTP via SMS
                // For demo purposes, we'll show it in the console
                console.log('OTP:', otp);

                // Show OTP verification form
                showOTPForm();
                verificationStep = 'otp';
            } catch (error) {
                showError(error.message);
            }
        } else if (verificationStep === 'otp') {
            const otp = document.getElementById('otp').value;
            
            if (userManager.verifyOTP(pendingUser.phone, otp)) {
                try {
                    // Create verified user
                    const user = userManager.createUser({
                        ...pendingUser,
                        isPhoneVerified: true
                    });

                    userManager.updateHeaderUI();
                    window.location.href = '/';
                } catch (error) {
                    showError(error.message);
                }
            } else {
                showError('Invalid OTP. Please try again.');
            }
        }
    });
}

// Social authentication
class SocialAuth {
    constructor() {
        this.initializeSDKs();
        this.addEventListeners();
    }

    initializeSDKs() {
        // Initialize Google Sign-In
        this.loadScript('https://apis.google.com/js/platform.js', () => {
            gapi.load('auth2', () => {
                gapi.auth2.init({
                    client_id: config.google.client_id
                });
            });
        });

        // Initialize Facebook SDK
        this.loadScript('https://connect.facebook.net/en_US/sdk.js', () => {
            FB.init({
                appId: config.facebook.app_id,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        });
    }

    loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = callback;
        document.head.appendChild(script);
    }

    addEventListeners() {
        document.querySelector('.btn.google').addEventListener('click', (e) => {
            e.preventDefault();
            this.signInWithGoogle();
        });

        document.querySelector('.btn.facebook').addEventListener('click', (e) => {
            e.preventDefault();
            this.signInWithFacebook();
        });
    }

    async signInWithGoogle() {
        try {
            const auth2 = gapi.auth2.getAuthInstance();
            const googleUser = await auth2.signIn();
            const profile = googleUser.getBasicProfile();

            const user = await userManager.loginWithSocial({
                fullname: profile.getName(),
                email: profile.getEmail(),
                picture: profile.getImageUrl(),
                provider: 'google'
            });

            userManager.updateHeaderUI();
            window.location.href = '/';
        } catch (error) {
            showError('Google Sign-In failed. Please try again.');
            console.error('Google Sign-In Error:', error);
        }
    }

    async signInWithFacebook() {
        try {
            const response = await new Promise((resolve, reject) => {
                FB.login((response) => {
                    if (response.authResponse) {
                        resolve(response);
                    } else {
                        reject(new Error('Facebook login failed'));
                    }
                }, { scope: config.facebook.scope });
            });

            const userInfo = await new Promise((resolve) => {
                FB.api('/me', { fields: 'name,email,picture' }, (response) => {
                    resolve(response);
                });
            });

            const user = await userManager.loginWithSocial({
                fullname: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture?.data?.url,
                provider: 'facebook'
            });

            userManager.updateHeaderUI();
            window.location.href = '/';
        } catch (error) {
            showError('Facebook Sign-In failed. Please try again.');
            console.error('Facebook Sign-In Error:', error);
        }
    }
}

// Initialize social authentication
document.addEventListener('DOMContentLoaded', () => {
    new SocialAuth();
    userManager.updateHeaderUI();
});

// Helper functions
function showError(message) {
    let errorDiv = document.querySelector('.auth-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        document.querySelector('.auth-form form').prepend(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showOTPForm() {
    const form = document.getElementById('signupForm');
    form.innerHTML = `
        <div class="form-group">
            <h3>Phone Verification</h3>
            <p>Please enter the 6-digit code sent to your phone</p>
            <input type="text" id="otp" name="otp" maxlength="6" pattern="[0-9]{6}" required>
        </div>
        <button type="submit" class="btn primary full-width">Verify OTP</button>
        <p class="resend-otp">
            Didn't receive the code? <a href="#" id="resendOTP">Resend OTP</a>
        </p>
    `;

    // Add resend OTP functionality
    document.getElementById('resendOTP').addEventListener('click', (e) => {
        e.preventDefault();
        const otp = userManager.generateOTP();
        userManager.storeOTP(pendingUser.phone, otp);
        console.log('New OTP:', otp);
        showError('New OTP has been sent to your phone');
    });
} 