// src/repositories/donation.repository.js

const Donation = require('../models/donation.model');
const database = require('../config/database');

class DonationRepository {
  /**
   * 기부 등록
   * @param {object} donationData - 기부 데이터
   * @returns {Promise<Donation>} 생성된 기부 객체
   */
  async createDonation(donationData) {
    try {
      const pool = await database.createPool();
      
      const query = `
        INSERT INTO Donations (restaurant_id, item_name, category, quantity, expiration_date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        donationData.restaurant_id,
        donationData.item_name,
        donationData.category,
        donationData.quantity,
        donationData.expiration_date,
        donationData.status || 'AVAILABLE'
      ];
      
      const [result] = await pool.execute(query, values);
      
      // 생성된 기부 정보 조회
      const donation = await this.findById(result.insertId);
      await pool.end();
      
      return donation;
    } catch (error) {
      console.error('기부 등록 실패:', error);
      throw error;
    }
  }


  /**
   * 사용 가능한 기부 목록 조회 (거리순 정렬)
   * @param {number} userLatitude - 사용자 위도
   * @param {number} userLongitude - 사용자 경도
   * @returns {Promise<Array<Donation>>} 기부 목록
   */
  async findAvailableDonations(userLatitude = null, userLongitude = null) {
    try {
      const pool = await database.createPool();
      
      let query = `
        SELECT d.*, r.name as restaurant_name, r.address as restaurant_address,
               r.latitude as restaurant_latitude, r.longitude as restaurant_longitude
        FROM Donations d
        LEFT JOIN Restaurants r ON d.restaurant_id = r.id
        WHERE d.status = 'AVAILABLE' AND d.expiration_date > CURDATE()
      `;
      
      // 거리순 정렬을 위한 계산 (위도, 경도가 제공된 경우)
      if (userLatitude && userLongitude) {
        query += `
          ORDER BY (
            6371 * acos(
              cos(radians(?)) * cos(radians(r.latitude)) * 
              cos(radians(r.longitude) - radians(?)) + 
              sin(radians(?)) * sin(radians(r.latitude))
            )
          ) ASC
        `;
      } else {
        query += ` ORDER BY d.created_at DESC`;
      }
      
      const values = userLatitude && userLongitude ? [userLatitude, userLongitude, userLatitude] : [];
      const [rows] = await pool.execute(query, values);
      await pool.end();
      
      return rows.map(row => new Donation({
        id: row.id,
        restaurant_id: row.restaurant_id,
        item_name: row.item_name,
        category: row.category,
        quantity: row.quantity,
        expiration_date: row.expiration_date,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        restaurant_name: row.restaurant_name,
        restaurant_address: row.restaurant_address,
        restaurant_latitude: row.restaurant_latitude,
        restaurant_longitude: row.restaurant_longitude
      }));
    } catch (error) {
      console.error('기부 목록 조회 실패:', error);
      throw error;
    }
  }


  /**
   * 사용자의 레스토랑 ID 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<number|null>} 레스토랑 ID 또는 null
   */
  async findRestaurantIdByUserId(userId) {
    try {
      const pool = await database.createPool();
      
      const query = `
        SELECT id FROM Restaurants WHERE manager_id = ?
      `;
      
      const [rows] = await pool.execute(query, [userId]);
      await pool.end();
      
      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      console.error('레스토랑 ID 조회 실패:', error);
      throw error;
    }
  }
}

module.exports = new DonationRepository();