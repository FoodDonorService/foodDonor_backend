// src/services/match.service.js

const matchRepository = require('../repositories/match.repository');
const Match = require('../models/match.model');
const publicDataClient = require('../clients/publicData.client');

class MatchService {
  
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
    async getPendingMatches() {
        const matches = await matchRepository.findPendingWithDetails();
        return {
            status: "success",
            message: "매치 요청 목록 조회 성공",
            data: {
                match_list: matches
            }
        };
    }

    async getAcceptedMatches() {
        const matches = await matchRepository.findAcceptedWithDetails();
        return {
            status: "success",
            message: "매치 상세정보 조회 성공",
            data: {
                list: matches
            }
        };
    }

    async acceptMatch(matchId,food_bank_id) {
        const matchData = await matchRepository.findById(matchId);
        if (!matchData) {
            throw new Error('Match not found');
        }

        const match = new Match(matchData);
        if (!match.isPending()) {
            throw new Error('Match is not in a pending state');
        }

        match.accept(food_bank_id);
        await matchRepository.update(match);

        return {
            status: "success",
            message: "매치 수락이 정상 처리.",
            data: {
                match_id: match.id
            }
        };
    }

    async rejectMatch(matchId) {
        const matchData = await matchRepository.findById(matchId);
        if (!matchData) {
            throw new Error('Match not found');
        }

        const match = new Match(matchData);
        if (!match.isPending()) {
            throw new Error('Match is not in a pending state');
        }

        match.reject();
        await matchRepository.update(match);

        return {
            status: "success",
            message: "매치 실패.", // 명세서에는 '실패'지만 '거절'이 더 적합해 보입니다.
            data: {
                match_id: match.id
            }
        };
    }
}

module.exports = new MatchService();