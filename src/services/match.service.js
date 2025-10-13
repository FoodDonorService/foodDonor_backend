// src/services/match.service.js

const matchRepository = require('../repositories/match.repository');

/**
 * Match Service - handles business logic for matches
 */
class MatchService {
  /**
   * Get accepted matches for a food bank
   * @param {number} foodBankId - ID of the food bank
   * @returns {Promise<Object>} Service response with match data
   */
  async getAcceptedMatches(foodBankId) {
    try {
      // Validate input
      if (!foodBankId || typeof foodBankId !== 'number') {
        throw new Error('Invalid food bank ID');
      }

      // Get matches from repository
      const matches = await matchRepository.getAcceptedMatches(foodBankId);

      return {
        success: true,
        data: {
          list: matches
        }
      };
    } catch (error) {
      console.error('Error in MatchService.getAcceptedMatches:', error);
      throw error;
    }
  }
}

module.exports = new MatchService();