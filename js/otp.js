document.addEventListener('DOMContentLoaded', () => {
    const otpForm = document.getElementById('otpForm');
    const otpInput = document.getElementById('otpInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendBtn = document.getElementById('resendBtn');
    const timerSpan = document.getElementById('timer');
    const messageDiv = document.getElementById('message');

    let timeLeft = 30;
    let timerInterval;

    // Start timer on page load
    startTimer();

    // Input validation
    otpInput.addEventListener('input', (e) => {
        // Allow only numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // Enable/disable verify button based on input length
        verifyBtn.disabled = e.target.value.length !== 6;
    });

    // Form submission
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otp = otpInput.value;
        
        // Simulate OTP verification
        verifyOTP(otp);
    });

    // Resend OTP
    resendBtn.addEventListener('click', () => {
        if (!resendBtn.disabled) {
            // Simulate resending OTP
            resendOTP();
            startTimer();
            showMessage('OTP resent successfully!', 'success');
        }
    });

    function startTimer() {
        timeLeft = 30;
        resendBtn.disabled = true;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = `in ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                resendBtn.disabled = false;
                timerSpan.textContent = '';
            }
        }, 1000);
    }

    function verifyOTP(otp) {
        // Simulate API call
        setTimeout(() => {
            // For demo: consider 123456 as valid OTP
            if (otp === '123456') {
                showMessage('OTP verified successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage('Invalid OTP. Please try again.', 'error');
                otpInput.value = '';
                verifyBtn.disabled = true;
            }
        }, 1000);
    }

    function resendOTP() {
        // Simulate API call to resend OTP
        otpInput.value = '';
        verifyBtn.disabled = true;
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 3000);
    }
});