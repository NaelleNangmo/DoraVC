import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche utilisateur:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, avatar, joined_date, preferences FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche utilisateur par ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { name, email, password, role = 'user', avatar } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        `INSERT INTO users (name, email, password, role, avatar) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, role, avatar, joined_date, preferences`,
        [name, email, hashedPassword, role, avatar]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la création utilisateur:', error);
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Erreur lors de la validation du mot de passe:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, avatar, joined_date, preferences FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  static async updatePreferences(userId, preferences) {
    try {
      const result = await pool.query(
        'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [JSON.stringify(preferences), userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }
}