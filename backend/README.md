# Park and Ride - Smart Parking & Last-Mile Connectivity Solution

A comprehensive Java Spring Boot application that provides smart parking booking and last-mile transportation integration near metro stations.

## 🚀 Features

### Core Functionality
- **JWT-based Authentication** with role-based access control (User/Admin)
- **Smart Parking Booking** with real-time availability and conflict resolution
- **Last-Mile Integration** supporting cabs, shuttles, e-rickshaws, and auto-rickshaws
- **Dynamic Pricing Engine** with peak-hour and demand-based pricing
- **QR Code & PIN Access** for offline parking entry
- **Ride Pooling** with route optimization for shared transportation
- **Admin Dashboard** with analytics and parking lot management

### Technical Features
- **RESTful APIs** with comprehensive Swagger documentation
- **JPA/Hibernate** for data persistence with H2 database
- **Spring Security** for authentication and authorization
- **Caching** with Spring Cache for improved performance
- **Global Exception Handling** with meaningful error responses
- **Input Validation** with Bean Validation
- **API Documentation** with OpenAPI 3.0 and Swagger UI

## 🏗️ Architecture

### Project Structure
```
com.parkandride/
├── controller/          # REST API controllers
├── model/              # JPA entities and enums
├── repository/         # Data access layer
├── service/            # Business logic layer
├── config/             # Security and configuration
├── dto/                # Data transfer objects
├── exception/          # Custom exceptions and global handler
└── util/               # Utility classes (JWT, QR Code)
```

### Database Schema
- **Users**: Authentication and user management
- **Parking Lots**: Parking facility information with metro integration
- **Parking Spots**: Individual parking space management
- **Parking Bookings**: Reservation and usage tracking
- **Ride Bookings**: Last-mile transportation requests

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.0, Spring Security, Spring Data JPA
- **Database**: H2 (in-memory)
- **Authentication**: JWT with bcrypt password encoding
- **API Documentation**: OpenAPI 3.0, Swagger UI
- **QR Code**: ZXing library for QR code generation
- **Build Tool**: Maven
- **Testing**: JUnit 5, Spring Boot Test

## 🚀 Quick Start

### Prerequisites

1. **Run the application:**

```bash
./mvnw spring-boot:run
```

2. **Access the application:**

- Application: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:parkride`
  - Username: `sa`
  - Password: `password`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login (returns JWT token)

### Parking Management
- `GET /api/parking/lots` - List available parking lots
- `GET /api/parking/lots/metro/{stationName}` - Find parking by metro station
- `GET /api/parking/lots/nearby` - Find nearby parking lots
- `POST /api/parking/bookings` - Create parking booking
- `GET /api/parking/bookings` - Get user bookings
- `PUT /api/parking/bookings/{id}/cancel` - Cancel booking
- `PUT /api/parking/bookings/{id}/start` - Start parking session
- `PUT /api/parking/bookings/{id}/end` - End parking session

### Ride Management
- `POST /api/rides/bookings` - Book last-mile ride
- `GET /api/rides/bookings` - Get user ride bookings
- `PUT /api/rides/bookings/{id}/cancel` - Cancel ride booking
- `PUT /api/rides/bookings/{id}/status` - Update ride status

### Admin APIs
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/parking-lots` - Manage parking lots
- `POST /api/admin/parking-lots` - Create new parking lot
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/analytics/usage` - Usage analytics

## 🔐 Authentication

The application uses JWT-based authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Sample Users (Development)
- **Admin**: username: `admin`, password: `password`
- **User**: username: `john_doe`, password: `password`

## 🎯 Key Features Deep Dive

### Dynamic Pricing Engine
- **Base Pricing**: Configurable hourly rates per parking lot
- **Peak Hour Multiplier**: 1.5x during 7-10 AM and 5-8 PM
- **Surge Pricing**: 2.0x during high demand periods
- **Booking Type Discounts**: 10% for daily, 20% for monthly bookings

### Conflict Resolution
- **Real-time Availability**: Prevents double booking through database constraints
- **Spot Assignment**: Automatic assignment of available spots
- **Grace Period**: 15-minute grace period for arrival
- **Auto-cancellation**: Automatic cancellation after 2 hours of no-show

### Offline Access
- **QR Code Generation**: Unique QR codes for each booking
- **PIN Access**: 4-digit access PIN as backup
- **Validation APIs**: Endpoints for offline validation

### Ride Pooling
- **Route Optimization**: Groups rides with similar routes
- **Distance-based Matching**: 1km radius for pickup/dropoff locations
- **Capacity Management**: Handles multiple passengers per ride
- **Dynamic Pricing**: Reduced fares for shared rides

## 🎨 Caching Strategy

- **Parking Lots**: Cached for faster retrieval
- **Pricing Calculations**: Cached for 5 minutes
- **User Sessions**: JWT-based stateless authentication

## 📊 Monitoring & Analytics

### Available Endpoints
- `/actuator/health` - Application health check
- `/actuator/metrics` - Application metrics
- `/actuator/info` - Application information

### Admin Analytics
- **Revenue Tracking**: Parking and ride revenue analytics
- **Usage Statistics**: User activity and popular locations
- **Occupancy Rates**: Real-time parking utilization
- **Performance Metrics**: Booking success rates and response times

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Service layer business logic
- **Integration Tests**: API endpoints and database operations
- **Security Tests**: Authentication and authorization
- **Performance Tests**: Load testing for high-traffic scenarios

### Running Tests
```bash
./mvnw test
```

## 🔧 Configuration

### Application Properties
Key configuration options in `application.yml`:

```yaml
app:
  jwt:
    secret: mySecretKey
    expiration: 86400000 # 24 hours
  pricing:
    base-rate: 50.0
    peak-multiplier: 1.5
    surge-multiplier: 2.0
  booking:
    grace-period-minutes: 15
    auto-cancel-hours: 2
```

## 🚀 Deployment

### Docker Support
```bash
# Build JAR
./mvnw clean package

# Run with Java
java -jar target/park-and-ride-backend-0.0.1-SNAPSHOT.jar
```

### Environment Variables
- `SPRING_PROFILES_ACTIVE`: Set to `prod` for production
- `DB_URL`: Database connection URL for production
- `JWT_SECRET`: JWT signing secret (change in production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@parkandride.com
- Documentation: [API Docs](http://localhost:8080/swagger-ui.html)
- Issues: GitHub Issues

## 🔄 Version History

- **v1.0.0**: Initial release with core parking and ride booking functionality
- **v1.1.0**: Added admin dashboard and analytics
- **v1.2.0**: Enhanced ride pooling and route optimization