// src/repositories/match.repository.js

const database = require('../config/database');
const Match = require('../models/match.model');

class MatchRepository {
  constructor() {
    this.db = database;
  }

  /**
   * 매칭 생성
   * @param {object} matchData - 매칭 데이터
   * @returns {Promise<Match>} 생성된 매칭
   */
  async create(matchData) {
    try {
      const connection = await this.db.connect();
      
      const sql = `
        INSERT INTO Matches (donation_id, recipient_id, food_bank_id, status)
        VALUES (?, ?, ?, ?)
      `;
      
      const values = [
        matchData.donation_id,
        matchData.recipient_id,
        matchData.food_bank_id,
        matchData.status
      ];

      const [result] = await connection.execute(sql, values);
      await this.db.disconnect();

      // 생성된 매칭 조회
      return await this.findById(result.insertId);
    } catch (error) {
      console.error('매칭 생성 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 매칭 조회
   * @param {number} id - 매칭 ID
   * @returns {Promise<Match|null>} 매칭 또는 null
   */
  async findById(id) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Matches WHERE id = ?';
      const [rows] = await connection.execute(sql, [id]);
      await this.db.disconnect();

      return rows.length > 0 ? new Match(rows[0]) : null;
    } catch (error) {
      console.error('매칭 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 기부 ID로 매칭 조회
   * @param {number} donationId - 기부 ID
   * @returns {Promise<Match|null>} 매칭 또는 null
   */
  async findByDonationId(donationId) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Matches WHERE donation_id = ?';
      const [rows] = await connection.execute(sql, [donationId]);
      await this.db.disconnect();

      return rows.length > 0 ? new Match(rows[0]) : null;
    } catch (error) {
      console.error('기부 ID로 매칭 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 수혜자 ID로 매칭 목록 조회
   * @param {number} recipientId - 수혜자 ID
   * @returns {Promise<Match[]>} 매칭 목록
   */
  async findByRecipientId(recipientId) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Matches WHERE recipient_id = ? ORDER BY created_at DESC';
      const [rows] = await connection.execute(sql, [recipientId]);
      await this.db.disconnect();

      return rows.map(row => new Match(row));
    } catch (error) {
      console.error('수혜자 ID로 매칭 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 푸드뱅크 ID로 매칭 목록 조회
   * @param {number} foodBankId - 푸드뱅크 ID
   * @returns {Promise<Match[]>} 매칭 목록
   */
  async findByFoodBankId(foodBankId) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Matches WHERE food_bank_id = ? ORDER BY created_at DESC';
      const [rows] = await connection.execute(sql, [foodBankId]);
      await this.db.disconnect();

      return rows.map(row => new Match(row));
    } catch (error) {
      console.error('푸드뱅크 ID로 매칭 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 매칭 상태 업데이트
   * @param {number} id - 매칭 ID
   * @param {string} status - 새로운 상태
   * @param {number} foodBankId - 푸드뱅크 ID (선택사항)
   * @returns {Promise<Match|null>} 업데이트된 매칭 또는 null
   */
  async updateStatus(id, status, foodBankId = null) {
    try {
      const connection = await this.db.connect();
      
      let sql = 'UPDATE Matches SET status = ?, updated_at = NOW()';
      let values = [status];

      if (foodBankId) {
        sql += ', food_bank_id = ?';
        values.push(foodBankId);
      }

      sql += ' WHERE id = ?';
      values.push(id);

      await connection.execute(sql, values);
      await this.db.disconnect();

      return await this.findById(id);
    } catch (error) {
      console.error('매칭 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 매칭 삭제
   * @param {number} id - 매칭 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(id) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'DELETE FROM Matches WHERE id = ?';
      const [result] = await connection.execute(sql, [id]);
      await this.db.disconnect();

      return result.affectedRows > 0;
    } catch (error) {
      console.error('매칭 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 기부 ID로 매칭 존재 여부 확인
   * @param {number} donationId - 기부 ID
   * @returns {Promise<boolean>} 매칭 존재 여부
   */
  async existsByDonationId(donationId) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT COUNT(*) as count FROM Matches WHERE donation_id = ?';
      const [rows] = await connection.execute(sql, [donationId]);
      await this.db.disconnect();

      return rows[0].count > 0;
    } catch (error) {
      console.error('기부 ID로 매칭 존재 확인 실패:', error);
      throw error;
    }
  }
}

module.exports = new MatchRepository();