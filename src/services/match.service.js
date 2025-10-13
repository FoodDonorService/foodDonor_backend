// src/services/match.service.js

const matchRepository = require('../repositories/match.repository');
const Match = require('../models/match.model');

class MatchService {
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

    async acceptMatch(matchId) {
        const matchData = await matchRepository.findById(matchId);
        if (!matchData) {
            throw new Error('Match not found');
        }

        const match = new Match(matchData);
        if (!match.isPending()) {
            throw new Error('Match is not in a pending state');
        }

        match.accept(1); // foodBankId는 예시로 1을 사용합니다.
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