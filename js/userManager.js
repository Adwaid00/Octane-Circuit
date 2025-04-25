class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    // Generate OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Store OTP for verification
    storeOTP(phone, otp) {
        localStorage.setItem(`otp_${phone}`, JSON.stringify({
            code: otp,
            timestamp: Date.now(),
            attempts: 0
        }));
    }

    // Verify OTP
    verifyOTP(phone, userOTP) {
        const otpData = JSON.parse(localStorage.getItem(`otp_${phone}`));
        if (!otpData) return false;

        // Check if OTP is expired (5 minutes validity)
        if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
            localStorage.removeItem(`otp_${phone}`);
            return false;
        }

        // Check if too many attempts
        if (otpData.attempts >= 3) {
            localStorage.removeItem(`otp_${phone}`);
            return false;
        }

        // Update attempts
        otpData.attempts++;
        localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));

        return otpData.code === userOTP;
    }

    // Create new user
    createUser(userData) {
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: Date.now().toString(),
            ...userData,
            isPhoneVerified: false,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    // Update user
    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex === -1) throw new Error('User not found');

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveUsers();

        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = this.users[userIndex];
            this.saveCurrentUser();
        }
    }

    // Login user
    login(email, password) {
        const user = this.users.find(user => user.email === email && user.password === password);
        if (!user) throw new Error('Invalid credentials');

        this.currentUser = user;
        this.saveCurrentUser();
        return user;
    }

    // Login with social
    loginWithSocial(socialData) {
        let user = this.users.find(user => user.email === socialData.email);
        
        if (!user) {
            user = this.createUser({
                ...socialData,
                password: null,
                isPhoneVerified: false
            });
        }

        this.currentUser = user;
        this.saveCurrentUser();
        return user;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Save current user to localStorage
    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    // Update header with user info
    updateHeaderUI() {
        const accountLink = document.querySelector('.header-actions .account');
        if (!accountLink) return;

        if (this.currentUser) {
            accountLink.innerHTML = `
                <i class="fas fa-user"></i>
                ${this.currentUser.fullname}
                <div class="user-dropdown">
                    <a href="profile.html">Profile</a>
                    <a href="orders.html">Orders</a>
                    <a href="#" class="logout-btn">Logout</a>
                </div>
            `;
            accountLink.classList.add('logged-in');
        } else {
            accountLink.innerHTML = '<i class="fas fa-user"></i> Login';
            accountLink.classList.remove('logged-in');
        }
    }
}

// Export singleton instance
export const userManager = new UserManager(); 