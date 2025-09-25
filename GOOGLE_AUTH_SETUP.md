# Google Authentication Setup Guide

## Overview
Your Google authentication now supports both token-based authentication (for mobile/SPA) and redirect-based OAuth flow (for web applications).

## Configuration Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set up OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`, `http://localhost:3001`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/redirect`

### 2. Environment Variables

Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/redirect
```

### 3. Dependencies

Make sure you have these packages installed:

```bash
npm install passport passport-google-oauth20 @nestjs/passport google-auth-library
```

## API Endpoints

### 1. Token-Based Authentication (Mobile/SPA)

**POST** `/api/auth/google-token`

```json
{
  "token": "google-id-token-from-client"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "picture": "profile-picture-url"
  },
  "authorization": {
    "token": "jwt-token",
    "type": "bearer"
  }
}
```

### 2. Redirect-Based Authentication (Web)

**GET** `/api/auth/google`
- Redirects to Google OAuth consent screen

**GET** `/api/auth/google/redirect`
- Google callback endpoint
- Returns user data and JWT token

## Frontend Integration Examples

### React/JavaScript (Token-based)

```javascript
// Using Google Sign-In JavaScript library
function handleGoogleSignIn(googleUser) {
  const idToken = googleUser.getAuthResponse().id_token;
  
  fetch('/api/auth/google-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: idToken }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Store JWT token
      localStorage.setItem('token', data.authorization.token);
      // Redirect or update UI
    }
  });
}
```

### React Native (Token-based)

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.idToken;
    
    const response = await fetch('your-api-url/api/auth/google-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: idToken }),
    });
    
    const data = await response.json();
    if (data.success) {
      // Store token and navigate
    }
  } catch (error) {
    console.error(error);
  }
}
```

### Web (Redirect-based)

```html
<!-- Simple redirect approach -->
<a href="/api/auth/google">Sign in with Google</a>
```

## Security Features

1. **Token Validation**: ID tokens are verified with Google's servers
2. **User Creation/Update**: Automatically creates or updates user profiles
3. **JWT Generation**: Returns secure JWT tokens for API access
4. **Admin Notifications**: Notifies admins of new user registrations
5. **Error Handling**: Comprehensive error handling and validation

## Database Schema

Make sure your user table has these fields:
- `google_id` (string, nullable)
- `email` (string, unique)
- `firstName` (string, nullable)
- `lastName` (string, nullable)
- `picture` (string, nullable)

## Testing

1. **Token-based**: Use Google's OAuth 2.0 Playground to get test tokens
2. **Redirect-based**: Navigate to `/api/auth/google` in your browser
3. **Postman**: Test the `/api/auth/google-token` endpoint with valid ID tokens

## Troubleshooting

### Common Issues:

1. **Invalid Client ID**: Check your environment variables
2. **Redirect URI Mismatch**: Ensure callback URL matches Google Console settings
3. **Token Expired**: ID tokens expire after 1 hour
4. **CORS Issues**: Configure CORS for your frontend domain

### Debug Mode:

Add logging to see what's happening:

```typescript
console.log('Google Config:', {
  clientId: appConfig().auth.google.client_id,
  callback: appConfig().auth.google.callback
});
```

## Production Considerations

1. Update callback URLs for production domain
2. Use HTTPS in production
3. Set up proper CORS policies
4. Monitor authentication logs
5. Implement rate limiting
6. Use environment-specific Google OAuth apps

## Support

If you encounter issues:
1. Check Google Cloud Console for API quotas
2. Verify OAuth consent screen is published
3. Ensure all required scopes are requested
4. Check server logs for detailed error messages