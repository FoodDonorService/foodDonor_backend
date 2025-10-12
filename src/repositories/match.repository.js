// src/repositories/match.repository.js

const Match = require('../models/match.model');
const database = require('../config/database');

class MatchRepository {
  /**
   * 매치 생성
   * @param {object} matchData - 매치 데이터
   * @returns {Promise<Match>} 생성된 매치 객체
   */
  async createMatch(matchData) {
    try {
      const pool = await database.createPool();
      
      const query = `
        INSERT INTO Matches (donation_id, recipient_id, food_bank_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        matchData.donation_id,
        matchData.recipient_id,
        matchData.food_bank_id,
        matchData.status || 'PENDING'
      ];
      
      const [result] = await pool.execute(query, values);
      
      // 생성된 매치 정보 조회
      const match = await this.findById(result.insertId);
      await pool.end();
      
      return match;
    } catch (error) {
      console.error('매치 생성 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 매치 조회
   * @param {number} id - 매치 ID
   * @returns {Promise<Match|null>} 매치 객체 또는 null
   */
  async findById(id) {
    try {
      const pool = await database.createPool();
      
      const query = `
        SELECT * FROM Matches WHERE id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      await pool.end();
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return new Match({
        id: row.id,
        donation_id: row.donation_id,
        recipient_id: row.recipient_id,
        food_bank_id: row.food_bank_id,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    } catch (error) {
      console.error('매치 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 기부 ID로 매치 조회
   * @param {number} donationId - 기부 ID
   * @returns {Promise<Match|null>} 매치 객체 또는 null
   */
  async findByDonationId(donationId) {
    try {
      const pool = await database.createPool();
      
      const query = `
        SELECT * FROM Matches WHERE donation_id = ?
      `;
      
      const [rows] = await pool.execute(query, [donationId]);
      await pool.end();
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return new Match({
        id: row.id,
        donation_id: row.donation_id,
        recipient_id: row.recipient_id,
        food_bank_id: row.food_bank_id,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    } catch (error) {
      console.error('기부 ID로 매치 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 기부 ID로 레스토랑 정보 조회
   * @param {number} donationId - 기부 ID
   * @returns {Promise<object|null>} 레스토랑 정보 또는 null
   */
  async findRestaurantByDonationId(donationId) {
    try {
      const pool = await database.createPool();
      
      const query = `
        SELECT r.latitude, r.longitude 
        FROM Restaurants r
        JOIN Donations d ON r.id = d.restaurant_id
        WHERE d.id = ?
      `;
      
      const [rows] = await pool.execute(query, [donationId]);
      await pool.end();
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('기부 ID로 레스토랑 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 거리 기반으로 가장 가까운 푸드뱅크 사용자 조회
   * @param {number} latitude - 레스토랑 위도
   * @param {number} longitude - 레스토랑 경도
   * @returns {Promise<number|null>} 푸드뱅크 사용자 ID 또는 null
   */
  async findNearestFoodBankUser(latitude, longitude) {
    try {
      const pool = await database.createPool();
      
      const query = `
        SELECT id, latitude, longitude,
               (6371 * acos(
                 cos(radians(?)) * cos(radians(latitude)) *
                 cos(radians(longitude) - radians(?)) +
                 sin(radians(?)) * sin(radians(latitude))
               )) AS distance
        FROM Users 
        WHERE role = 'food_bank' 
          AND latitude IS NOT NULL 
          AND longitude IS NOT NULL
        ORDER BY distance ASC 
        LIMIT 1
      `;
      
      const [rows] = await pool.execute(query, [latitude, longitude, latitude]);
      await pool.end();
      
      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      console.error('가장 가까운 푸드뱅크 사용자 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 푸드뱅크 사용자 조회 (기본 방식 - 폴백용)
   * @returns {Promise<number|null>} 푸드뱅크 사용자 ID 또는 null
   */
  async findFoodBankUser() {
    try {
      const pool = await database.createPool();
      
      const query = `
        SELECT id FROM Users WHERE role = 'food_bank' LIMIT 1
      `;
      
      const [rows] = await pool.execute(query);
      await pool.end();
      
      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      console.error('푸드뱅크 사용자 조회 실패:', error);
      throw error;
    }
  }
}

module.exports = new MatchRepository();