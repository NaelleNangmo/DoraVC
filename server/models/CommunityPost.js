import pool from '../config/database.js';

export class CommunityPost {
  static async getAll(status = null) {
    try {
      let query = `
        SELECT cp.*, u.name as user_name, u.avatar as user_avatar, c.name as country_name, c.flag as country_flag
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN countries c ON cp.country_id = c.id
      `;
      
      const params = [];
      if (status) {
        query += ' WHERE cp.status = $1';
        params.push(status);
      }
      
      query += ' ORDER BY cp.created_at DESC';
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT cp.*, u.name as user_name, u.avatar as user_avatar, c.name as country_name, c.flag as country_flag
         FROM community_posts cp
         LEFT JOIN users u ON cp.user_id = u.id
         LEFT JOIN countries c ON cp.country_id = c.id
         WHERE cp.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche du post:', error);
      throw error;
    }
  }

  static async create(postData) {
    try {
      const { user_id, country_id, title, content, image, rating, tags } = postData;
      
      const result = await pool.query(
        `INSERT INTO community_posts (user_id, country_id, title, content, image, rating, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [user_id, country_id, title, content, image, rating, JSON.stringify(tags || [])]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const result = await pool.query(
        `UPDATE community_posts SET 
         status = $1, 
         approved_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE approved_at END,
         updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 RETURNING *`,
        [status, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  static async updateLikes(id, likes, dislikes) {
    try {
      const result = await pool.query(
        'UPDATE community_posts SET likes = $1, dislikes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [likes, dislikes, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour des likes:', error);
      throw error;
    }
  }

  static async incrementViews(id) {
    try {
      const result = await pool.query(
        'UPDATE community_posts SET views = views + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM community_posts WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
      throw error;
    }
  }
}