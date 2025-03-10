const db = require('./config/db-sim');
const { signup, login, logout, getProfile, verifyToken } = require('./routes/auth');
const { addCalculation, getCalculationHistory, deleteCalculation } = require('./routes/calculations');

class ApplicationSimulator {
  constructor() {
    this.state = { running: false, users: 0 };
    this.eventQueue = [];
  }

  // Simulyatsiya boshlanishi
  start() {
    this.state.running = true;
    console.log('Simulyatsiya boshlandi:', new Date().toISOString());
    this.processEvents();
  }

  // Hodisalarni navbatga qo‘shish
  enqueueEvent(event) {
    this.eventQueue.push({ event, timestamp: new Date().toISOString() });
    this.processEvents();
  }

  // Hodisalarni ishlatish
  processEvents() {
    while (this.eventQueue.length > 0 && this.state.running) {
      const { event, timestamp } = this.eventQueue.shift();
      console.log(`[EVENT ${timestamp}]`, event.type, event.data);
      this.handleEvent(event);
    }
  }

  // Hodisa handler
  handleEvent(event) {
    try {
      switch (event.type) {
        case 'signup':
          const signupResult = signup(event.data);
          return { success: true, ...signupResult };
        case 'login':
          const loginResult = login(event.data.email, event.data.password);
          return { success: true, ...loginResult };
        case 'logout':
          const logoutResult = logout(event.data.token);
          return { success: logoutResult };
        case 'getProfile':
          const profile = getProfile(event.data.token);
          return { success: true, profile };
        case 'addCalculation':
          const calcResult = addCalculation(event.data.token, event.data.calculation);
          return { success: true, ...calcResult };
        case 'getHistory':
          const history = getCalculationHistory(event.data.token, event.data.filters || {});
          return { success: true, ...history };
        case 'deleteCalculation':
          const deleteResult = deleteCalculation(event.data.token, event.data.transactionId);
          return { success: true, ...deleteResult };
        default:
          throw new Error('Noma’lum hodisa!');
      }
    } catch (error) {
      console.error('Event Error:', { message: error.message, stack: error.stack });
      return { success: false, error: error.message };
    }
  }

  // Simulyatsiya holatini ko‘rish
  getStatus() {
    return {
      ...this.state,
      dbStatus: db.getStatus(),
      eventQueueSize: this.eventQueue.length,
      lastEvent: this.eventQueue[this.eventQueue.length - 1],
    };
  }
}

const app = new ApplicationSimulator();

// Dastlabki simulyatsiya
(function init() {
  app.start();
  app.enqueueEvent({ type: 'signup', data: {
    profile: { firstName: 'Ali', lastName: 'Valiyev', birthDate: '1990-01-01', gender: 'male' },
    contact: { email: 'ali@example.com', phone: '+998901234567' },
    authentication: { password: 'SecurePass123!@#' },
    preferences: { theme: 'dark', language: 'uz' },
  }});
  app.enqueueEvent({ type: 'login', data: { email: 'ali@example.com', password: 'SecurePass123!@#' }});
  app.enqueueEvent({ type: 'addCalculation', data: { token: 'dummy-token', calculation: { type: 'income', amount: 1000000, month: 'Mart', year: 2025, category: 'salary' }}});
  console.log('Simulyatsiya holati:', app.getStatus());
})();

module.exports = app;