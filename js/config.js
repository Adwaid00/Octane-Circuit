// OAuth Configuration
const config = {
    google: {
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google OAuth client ID
        redirect_uri: window.location.origin + '/login.html',
        scope: 'email profile'
    },
    facebook: {
        app_id: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
        redirect_uri: window.location.origin + '/login.html',
        scope: 'email,public_profile'
    }
};

export default config; 