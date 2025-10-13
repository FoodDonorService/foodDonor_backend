// src/repositories/match.repository.js

const db = require('../config/database');

/**
 * Match Repository - handles database operations for matches
 */
class MatchRepository {
  /**
   * Get accepted matches for a specific food bank with detailed information
   * @param {number} foodBankId - ID of the food bank
   * @returns {Promise<Array>} Array of accepted matches with detailed information
   */
  async getAcceptedMatches(foodBankId) {
    const query = `
      SELECT 
        m.id as match_id,
        r.id as recipient_id,
        r.facility_name as recipient_name,
        r.road_address as recipient_address,
        r.phone_number as recipient_phone_number,
        rest.id as restaurant_id,
        rest.name as restaurant_name,
        rest.address as restaurant_address,
        d.id as donation_id,
        d.item_name as donation_item_name,
        d.category as donation_category,
        d.quantity as donation_quantity,
        d.expiration_date as donation_expiration_date
      FROM matches m
      INNER JOIN recipients r ON m.recipient_id = r.id
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