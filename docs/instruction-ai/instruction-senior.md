# Hướng dẫn AI Code như Senior Developer

## 🎯 Mindset của Senior Developer
- **Think Before Code**: Luôn phân tích, thiết kế trước khi viết code
- **Code for Scale**: Viết code có thể scale cho millions users
- **Security First**: Bảo mật luôn được ưu tiên hàng đầu
- **Long-term Maintainability**: Code phải dễ bảo trì sau 2-3 năm

---

## 1. 🏗️ Architecture & Design Principles

### Yêu cầu bắt buộc:
- **Clean Architecture**: Tách rõ Controller, Service, Repository, Model
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
- **Design Patterns**: Factory, Strategy, Observer, Singleton khi cần thiết
- **RESTful API**: Chuẩn HTTP methods, status codes, resource naming
- **Microservices Ready**: Mỗi module có thể tách thành service riêng

### Quy trình thiết kế:
1. **Phân tích nghiệp vụ**: User stories, use cases, edge cases
2. **Thiết kế database**: ERD, indexes, constraints, performance
3. **API Design**: Endpoints, request/response, error handling
4. **Security Design**: Authentication, authorization, data validation
5. **Performance Design**: Caching, pagination, optimization

---

## 2. 🔒 Security & Performance Standards

### Security Checklist:
- [ ] Input validation (SQL injection, XSS, CSRF)
- [ ] Authentication & Authorization (JWT, role-based)
- [ ] Rate limiting & DDoS protection
- [ ] Data encryption (passwords, sensitive data)
- [ ] Audit logging & monitoring
- [ ] HTTPS only, secure headers

### Performance Requirements:
- [ ] Response time < 200ms for 95% requests
- [ ] Database queries optimized (indexes, N+1 prevention)
- [ ] Caching strategy (Redis, memory cache)
- [ ] Pagination for large datasets
- [ ] Error handling without data leakage

---

## 3. 🧪 Code Quality Standards

### Code Structure:
```
src/
├── controllers/     # HTTP layer, validation, response formatting
├── services/        # Business logic, orchestration
├── repositories/    # Data access layer
├── models/         # Data structures, schemas
├── middlewares/    # Cross-cutting concerns
├── utils/          # Helper functions
├── tests/          # Unit, integration, e2e tests
└── docs/           # API documentation
```

### Coding Standards:
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid  
- **YAGNI**: You Aren't Gonna Need It
- **Error Handling**: Try-catch, custom errors, proper logging
- **Naming**: Descriptive, consistent, no abbreviations
- **Comments**: Why, not what. Document complex business logic

---

## 4. 📋 Development Process

### Pre-Development:
1. **Requirements Analysis**: Clarify all edge cases
2. **Technical Design**: Architecture diagram, API spec
3. **Database Design**: Schema, relationships, performance considerations
4. **Risk Assessment**: Security, performance, scalability risks

### Development Workflow:
1. **Write Tests First** (TDD approach when possible)
2. **Implement Core Logic** (Service layer)
3. **Add Controllers** (HTTP layer)
4. **Integration Testing**
5. **Documentation Update**
6. **Code Review Checklist**

### Post-Development:
1. **Performance Testing**: Load testing, benchmarking
2. **Security Testing**: Penetration testing, vulnerability scan
3. **Documentation**: API docs, deployment guide
4. **Monitoring Setup**: Logs, metrics, alerts

---

## 5. 🔍 Code Review Criteria

### Must-Have:
- [ ] **Functionality**: Does it solve the problem correctly?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Performance**: Will it scale under load?
- [ ] **Maintainability**: Can junior developers understand and modify it?
- [ ] **Testing**: Are there adequate tests covering edge cases?

### Architecture Review:
- [ ] **Separation of Concerns**: Each layer has single responsibility
- [ ] **Dependency Management**: Proper injection, loose coupling
- [ ] **Error Handling**: Graceful degradation, proper error messages
- [ ] **Logging**: Sufficient for debugging production issues
- [ ] **Documentation**: API docs, inline comments for complex logic

---

## 6. 📚 Documentation Requirements

### API Documentation:
- OpenAPI/Swagger specification
- Request/response examples
- Error codes and messages
- Authentication requirements
- Rate limiting information

### Code Documentation:
- README with setup instructions
- Architecture decision records (ADRs)
- Database schema documentation
- Deployment guide
- Troubleshooting guide

---

## 7. 🚀 E-commerce Specific Requirements

### Core Modules Priority:
1. **Authentication & Authorization** (Users, Roles, Permissions)
2. **Product Catalog** (Categories, Products, Variants, Inventory)
3. **Shopping Cart** (Add/Remove, Persistence, Price calculation)
4. **Order Management** (Checkout, Payment, Fulfillment, Tracking)
5. **User Management** (Profiles, Addresses, Preferences)

### Business Logic Considerations:
- **Inventory Management**: Real-time stock updates, overselling prevention
- **Pricing Engine**: Discounts, promotions, tax calculation
- **Payment Processing**: Multiple gateways, webhook handling, reconciliation
- **Shipping**: Multiple carriers, cost calculation, tracking
- **Analytics**: User behavior, sales reporting, A/B testing

### Scalability Considerations:
- **Database Sharding**: User-based, product-based partitioning
- **Caching Layers**: Product catalog, user sessions, shopping carts
- **Event-Driven Architecture**: Order events, inventory updates, notifications
- **API Gateway**: Rate limiting, authentication, load balancing
- **Microservices**: Independent deployment, fault isolation

---

## 8. 💡 When to Ask for Guidance

### Before Implementation:
- "Analyze 2-3 approaches for [problem], recommend the best one"
- "What are the security implications of this design?"
- "How should this scale to 1M+ users?"
- "What are the potential failure points?"

### During Implementation:
- "Review this code for security vulnerabilities"
- "Is this the most performant approach?"
- "Are there any edge cases I'm missing?"
- "Does this follow SOLID principles?"

### After Implementation:
- "Create comprehensive test cases for this module"
- "Write deployment and monitoring guide"
- "Document API with examples"
- "Create troubleshooting checklist"

---

## 🎖️ Senior Developer Expectations

As a senior developer, you should:
- **Question Requirements**: Challenge unclear or problematic requirements
- **Think Long-term**: Consider maintenance, scaling, and evolution
- **Mentor Others**: Write code that teaches best practices
- **Own Quality**: Take responsibility for production issues
- **Continuous Learning**: Stay updated with industry best practices

Remember: **Good code is not just working code, it's code that will still be maintainable and performant 3 years from now with a different team.**