import pool from '../config/database.js';

export class Country {
  static async getAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM countries ORDER BY name ASC'
      );
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des pays:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM countries WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche pays par ID:', error);
      throw error;
    }
  }

  static async findByCode(code) {
    try {
      const result = await pool.query(
        'SELECT * FROM countries WHERE LOWER(code) = LOWER($1)',
        [code]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche pays par code:', error);
      throw error;
    }
  }

  static async create(countryData) {
    try {
      const {
        name, code, flag, continent, capital, currency, language,
        image, description, visa_required, processing_time, average_cost, popular_season
      } = countryData;

      const result = await pool.query(
        `INSERT INTO countries (name, code, flag, continent, capital, currency, language, image, description, visa_required, processing_time, average_cost, popular_season) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING *`,
        [name, code, flag, continent, capital, currency, language, image, description, visa_required, processing_time, average_cost, popular_season]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la création du pays:', error);
      throw error;
    }
  }

  static async update(id, countryData) {
    try {
      const {
        name, code, flag, continent, capital, currency, language,
        image, description, visa_required, processing_time, average_cost, popular_season
      } = countryData;

      const result = await pool.query(
        `UPDATE countries SET 
         name = $1, code = $2, flag = $3, continent = $4, capital = $5, 
         currency = $6, language = $7, image = $8, description = $9, 
         visa_required = $10, processing_time = $11, average_cost = $12, 
         popular_season = $13, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $14 RETURNING *`,
        [name, code, flag, continent, capital, currency, language, image, description, visa_required, processing_time, average_cost, popular_season, id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pays:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM countries WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la suppression du pays:', error);
      throw error;
    }
  }
}