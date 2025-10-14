// src/repositories/match.repository.js

const db = require('../config/database');

/**
 * Match Repository - handles database operations for matches
 */
class MatchRepository {
  /**
   * Get accepted matches for a specific food bank with donation and restaurant info only
   * @param {number} foodBankId - ID of the food bank
   * @returns {Promise<Array>} Array of accepted matches with donation and restaurant info
   */
  async getAcceptedMatches(foodBankId) {
    const query = `
      SELECT 
        m.id as match_id,
        m.recipient_id,
        rest.id as restaurant_id,
        rest.name as restaurant_name,
        rest.address as restaurant_address,
        d.id as donation_id,
        d.item_name as donation_item_name,
        d.category as donation_category,
        d.quantity as donation_quantity,
        d.expiration_date as donation_expiration_date
      FROM matches m
      INNER JOIN donations d ON m.donation_id = d.id
      INNER JOIN restaurants rest ON d.restaurant_id = rest.id
      WHERE m.food_bank_id = ? AND m.status = 'ACCEPTED'
      ORDER BY m.created_at DESC
    `;

    try {
      const [rows] = await db.execute(query, [foodBankId]);
      return rows;
    } catch (error) {
      console.error('Error fetching accepted matches:', error);
      throw new Error('Failed to fetch accepted matches');
    }
  }
}

module.exports = new MatchRepository();