// src/controllers/match.controller.js

//service로 전달
const matchService = require('../services/match.service');

class MatchController {
    // getPendingMatches 메서드
    // 역할: 대기중인 매칭 목록을 가져오는 API 엔드포인트 처리
    // 로직: matchService.getPendingMatches()를 호출하여 대기 중 매칭 데이터를 가져오고,
    // 성공 시 HTTP 200과 함께 JSON 형태로 응답
    // 예외 처리: 에러 발생 시 HTTP 500과 에러 메시지 반환
    async getPendingMatches(req, res) {
        try {
            const result = await matchService.getPendingMatches();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    //2. getAcceptedMatches 메서드
    // 역할: 수락된 매칭 목록 조회 처리
    // 로직: matchService.getAcceptedMatches()를 호출해 수락된 매칭을 받아 HTTP 200과 JSON으로 응답
    // 예외 처리: 에러시 HTTP 500 반환
    async getAcceptedMatches(req, res) {
        try {
            const result = await matchService.getAcceptedMatches();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    //3. acceptMatch 메서드
    // 역할: 클라이언트가 요청한 매칭 수락 처리
    // 로직:
    //  요청 바디에서 match_id를 추출
    //  match_id가 없거나 숫자가 아니면 HTTP 400과 실패 메시지 반환
    //  적절하면 matchService.acceptMatch(match_id) 호출해 매칭 수락 실행
    //  성공 시 HTTP 200과 결과 JSON 반환
    // 예외 처리: 에러 발생 시 HTTP 500 반환
    async acceptMatch(req, res) {
        try {
            const { match_id } = req.body;
            const foodBankId = req.user.id;
            if (!match_id || typeof match_id !== 'number') {
                return res.status(400).json({ status: 'fail', message: 'Valid match_id is required.' });
            }
            // 서비스에 foodBankId 전달
            const result = await matchService.acceptMatch(match_id,foodBankId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    //4. rejectMatch 메서드
    // 역할: 매칭 거절 요청 처리
    // 로직:
    //  acceptMatch와 동일하게 match_id 유효성 검사
    //  matchService.rejectMatch(match_id) 호출해 거절 처리
    //  성공 시 HTTP 200과 결과 반환
    // 예외 처리: 에러 시 HTTP 500 반환
    async rejectMatch(req, res) {
        try {
            //보통 POST나 PUT 요청에서 데이터를 안전하게 전달하기 위해 body에 JSON, form-data 등으로 값을 담아 보냅니다
            //(예: 회원가입 정보, 매칭 요청 등)
            const { match_id } = req.body;
            if (!match_id || typeof match_id !== 'number') {
                return res.status(400).json({ status: 'fail', message: 'Valid match_id is required.' });
            }
            const result = await matchService.rejectMatch(match_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = new MatchController();