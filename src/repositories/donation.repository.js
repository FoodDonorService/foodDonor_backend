// src/repositories/donation.repository.js

const database = require('../config/database'); // 데이터베이스 설정 파일 import
const Donation = require('../models/donation.model'); // Donation 모델 import

class DonationRepository {
  constructor() {
    this.db = database;
  }

  /**
   * 기부 등록
   * @param {Object} donationData - 기부 데이터
   * @returns {Promise<Donation>} 생성된 기부 정보
   */
  async createDonation(donationData) {
    try {
      const connection = await this.db.connect();
      
      const query = `
        INSERT INTO donations (
          restaurant_id, item_name, category, quantity, expiration_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        donationData.restaurant_id,
        donationData.item_name,
        donationData.category,
        donationData.quantity,
        donationData.expiration_date,
        donationData.status
      ];

      const [result] = await connection.execute(query, values);
      await this.db.disconnect();

      // 생성된 기부 정보를 다시 조회하여 반환
      return await this.findById(result.insertId);
    } catch (error) {
      console.error('기부 등록 쿼리 오류:', error);
      throw error;
    }
  }

  /**
   * ID로 기부 정보 조회
   * @param {number} id - 기부 ID
   * @returns {Promise<Donation|null>} 기부 정보 또는 null
   */
  async findById(id) {
    try {
      const connection = await this.db.connect();
      
      const query = 'SELECT * FROM donations WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      await this.db.disconnect();

      return rows.length > 0 ? new Donation(rows[0]) : null;
    } catch (error) {
      console.error('ID로 기부 조회 쿼리 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자 ID로 레스토랑 정보 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object|null>} 레스토랑 정보
   */
  async getRestaurantByUserId(userId) {
    try {
      const connection = await this.db.connect();
      
      const query = `
        SELECT * FROM restaurants 
        WHERE manager_id = ?
        LIMIT 1
      `;
      const [rows] = await connection.execute(query, [userId]);
      await this.db.disconnect();

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('사용자 레스토랑 조회 쿼리 오류:', error);
      throw error;
    }
  }
}

module.exports = new DonationRepository();