// Mock User Model - Replace with actual database implementation
const users = []; // In-memory storage for demo

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = new Date();
  }

  static async findById(id) {
    return users.find(u => u.id === id);
  }

  static async findByEmail(email) {
    return users.find(u => u.email === email);
  }

  static async create(email, hashedPassword) {
    const id = users.length + 1;
    const user = new User(id, email, hashedPassword);
    users.push(user);
    return user;
  }
}

module.exports = User;
