# SafeScribe 📝🔒

A secure, feature-rich note-taking application with multi-layered authentication, AI integration, and comprehensive audit logging.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0-brightgreen)
![React](https://img.shields.io/badge/React-18.0-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![JWT](https://img.shields.io/badge/JWT-Security-red)

## 🚀 Features

### 🔐 Security Features
- **Multi-layered Authentication**: JWT, OAuth2 (Google & GitHub), and 2FA
- **Google Authenticator Integration**: Time-based OTP for enhanced security
- **Role-based Access Control**: User and Admin roles
- **Account Management**: Account locking, expiry dates, and credential management
- **Comprehensive Audit Logging**: Track all user activities
- **Password Reset**: Secure email-based password recovery

### 📝 Note Management
- **CRUD Operations**: Create, read, update, and delete notes
- **User Isolation**: Users can only access their own notes
- **Secure API Endpoints**: All operations protected with authentication

### 🤖 AI Integration
- **Contextual Suggestions**: AI-powered writing assistance
- **Note Summarization**: Automatically summarize long notes
- **Multi-language Translation**: Translate notes to different languages
- **Text-to-Speech**: Read aloud functionality

### 👨‍💼 Admin Features
- **User Management**: View, update, and manage user accounts
- **Role Assignment**: Assign and modify user roles
- **Account Control**: Lock/unlock accounts and set expiry dates
- **System Monitoring**: View audit logs and user activities
- **Message Management**: Handle user feedback and support requests

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.0**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **MySQL** - Primary database
- **JWT** - Stateless authentication
- **OAuth2** - Social login integration
- **Google Authenticator** - 2FA implementation
- **Gemini AI API** - AI features

### Frontend
- **React 18**
- **Axios** - HTTP client
- **React Router** - Navigation
- **CSS3** - Styling

## 📋 Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Gmail account (for OAuth2 and email features)
- Gemini AI API key

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/safescribe.git
cd safescribe
```

### 2. Backend Setup

#### Configure Database
```sql
CREATE DATABASE safescribe;
```

#### Update Application Properties
Create `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/safescribe
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
app.jwtSecret=your_jwt_secret_key
app.jwtExpirationMs=86400000

# OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=your_google_client_id
spring.security.oauth2.client.registration.google.client-secret=your_google_client_secret
spring.security.oauth2.client.registration.github.client-id=your_github_client_id
spring.security.oauth2.client.registration.github.client-secret=your_github_client_secret

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# AI Configuration
gemini.api.key=your_gemini_api_key
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent

# Server Configuration
server.port=8080
```

#### Run Backend
```bash
./mvnw spring-boot:run
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`

## 🏗️ Project Structure

```
safescribe/
├── src/main/java/com/safescribe/
│   ├── config/          # Security, OAuth2, and other configurations
│   ├── controller/      # REST API controllers
│   ├── model/          # Entity classes
│   ├── repository/     # Data access layer
│   ├── service/        # Business logic
│   ├── dto/            # Data transfer objects
│   ├── util/           # Utility classes
│   └── SafeScribeApplication.java
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service calls
│   │   ├── utils/      # Utility functions
│   │   └── App.js
│   └── public/
└── README.md
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/user` - Get current user details
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/enable-2fa` - Enable two-factor authentication
- `POST /api/auth/verify-2fa` - Verify 2FA code

### Notes
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/notes/{id}` - Get specific note

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/role` - Update user role
- `PUT /api/admin/users/{id}/lock-status` - Lock/unlock user account
- `GET /api/admin/audit-logs` - Get system audit logs

### AI Features
- `POST /api/ai/suggestions` - Get writing suggestions
- `POST /api/ai/summarize` - Summarize note content
- `POST /api/ai/translate` - Translate note content

## 🔒 Security Features

### Authentication Methods
1. **Email/Password**: Traditional login with encrypted passwords
2. **OAuth2**: Login with Google or GitHub accounts
3. **Two-Factor Authentication**: Google Authenticator integration

### Security Measures
- JWT-based stateless authentication
- BCrypt password encryption
- HTTPS enforcement
- CORS configuration
- SQL injection prevention
- XSS protection
- Account lockout mechanisms

## 🤖 AI Features

### Powered by Google Gemini AI
- **Smart Suggestions**: Get topic ideas and writing prompts
- **Content Summarization**: Automatically summarize lengthy notes
- **Language Translation**: Translate notes to multiple languages
- **Text-to-Speech**: Convert notes to audio

## 📊 Database Schema

### Users Table
- `id`, `username`, `email`, `password`
- `account_non_locked`, `account_non_expired`
- `credentials_non_expired`, `enabled`
- `two_factor_secret`, `is_two_factor_enabled`
- `signup_method`, `role`, `created_date`, `updated_date`

### Notes Table
- `id`, `content`, `owner_username`
- `created_date`, `updated_date`

### Audit Logs Table
- `id`, `action`, `username`, `note_id`
- `note_content`, `timestamp`

### Contact Messages Table
- `id`, `name`, `email`, `message`
- `timestamp`, `status`

## 🎯 Usage

### For Regular Users
1. **Sign Up**: Create account with email or use OAuth2
2. **Enable 2FA**: Optional extra security layer
3. **Create Notes**: Write and organize your thoughts
4. **AI Assistance**: Get suggestions, summaries, and translations
5. **Manage Account**: Update profile and security settings

### For Administrators
1. **User Management**: View and manage user accounts
2. **System Monitoring**: Track user activities through audit logs
3. **Role Assignment**: Assign admin roles to trusted users
4. **Account Control**: Lock suspicious accounts when needed

## 🚦 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] OAuth2 login (Google & GitHub)
- [ ] Two-factor authentication setup and verification
- [ ] Note CRUD operations
- [ ] AI features (suggestions, summarization, translation)
- [ ] Password reset functionality
- [ ] Admin operations
- [ ] Account lockout scenarios
- [ ] JWT token expiration handling

### API Testing
Use Postman or similar tools to test API endpoints:
```bash
# Example: Login request
POST http://localhost:8080/api/auth/signin
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

## 🔧 Configuration

### OAuth2 Setup
1. **Google OAuth2**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth2 credentials
   - Add authorized redirect URIs

2. **GitHub OAuth2**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL

### Email Configuration
1. Enable 2-step verification in Gmail
2. Generate an App Password
3. Use the App Password in configuration

### Gemini AI Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add the key to your configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Project Maintainer**: [Your Name]
- Email: your.email@example.com
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- React team for the amazing frontend framework
- Google for Gemini AI API and OAuth2 services
- GitHub for OAuth2 integration
- MySQL team for the reliable database system

## 📋 Future Enhancements

- [ ] Real-time collaborative editing
- [ ] Note categories and tags
- [ ] File attachments support
- [ ] Mobile application (React Native)
- [ ] Advanced search functionality
- [ ] Note templates
- [ ] Export functionality (PDF, Word)
- [ ] Dark mode support
- [ ] Notification system
- [ ] Note sharing capabilities

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by [Your Name]
