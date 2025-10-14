// src/services/match.service.js

const matchRepository = require('../repositories/match.repository');
const publicDataClient = require('../clients/publicData.client');

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

      // 1. Get matches with donation and restaurant info from DB
      const dbMatches = await matchRepository.getAcceptedMatches(foodBankId);

      // 2. Get all recipients from S3
      const recipientsFromS3 = await publicDataClient.getRecipientsFromS3();

      // 3. Merge data: DB matches + S3 recipient info
      const mergedMatches = dbMatches.map(match => {
        // Find recipient info from S3 data by ID
        const recipient = recipientsFromS3.find(r => r.id == match.recipient_id);
        
        return {
          match_id: match.match_id,
          recipient_id: match.recipient_id,
          recipient_name: recipient ? recipient.facilityName : '정보 없음',
          recipient_address: recipient ? recipient.roadAddress : '정보 없음',
          recipient_phone_number: recipient ? recipient.phoneNumber : '정보 없음',
          restaurant_id: match.restaurant_id,
          restaurant_name: match.restaurant_name,
          restaurant_address: match.restaurant_address,
          donation_id: match.donation_id,
          donation_item_name: match.donation_item_name,
          donation_category: match.donation_category,
          donation_quantity: match.donation_quantity,
          donation_expiration_date: match.donation_expiration_date
        };
      });

      return {
        success: true,
        data: {
          list: mergedMatches
        }
      };
    } catch (error) {
      console.error('Error in MatchService.getAcceptedMatches:', error);
      throw error;
    }
  }
}

module.exports = new MatchService();