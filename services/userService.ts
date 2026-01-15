
import { User } from '../types';

const DB_KEY = 'phishguard_users_db';

interface UserRecord extends User {
  passwordHash: string; // Simplified for demo
}

export const userService = {
  getUsers: (): UserRecord[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: (name: string, email: string, password: string): User | null => {
    const users = userService.getUsers();
    if (users.find(u => u.email === email)) return null;

    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: password, // In a real app, use bcrypt/argon2
      role: 'Security Analyst',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(DB_KEY, JSON.stringify([...users, newUser]));
    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt };
  },

  login: (email: string, password: string): User | null => {
    const users = userService.getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === password);
    
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
};
