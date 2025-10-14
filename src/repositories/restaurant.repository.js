// src/repositories/restaurant.repository.js

const database = require('../config/database');
const Restaurant = require('../models/restaurant.model');

class RestaurantRepository {
  constructor() {
    this.db = database;
  }

  /**
   * 레스토랑 생성
   * @param {object} restaurantData - 레스토랑 데이터
   * @returns {Promise<Restaurant>} 생성된 레스토랑
   */
  async create(restaurantData) {
    try {
      const connection = await this.db.connect();
      
      const sql = `
        INSERT INTO Restaurants (manager_id, name, address, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        restaurantData.manager_id,
        restaurantData.name,
        restaurantData.address,
        restaurantData.latitude,
        restaurantData.longitude
      ];

      const [result] = await connection.execute(sql, values);
      await this.db.disconnect();

      // 생성된 레스토랑 조회
      return await this.findById(result.insertId);
    } catch (error) {
      console.error('레스토랑 생성 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 레스토랑 조회
   * @param {number} id - 레스토랑 ID
   * @returns {Promise<Restaurant|null>} 레스토랑 또는 null
   */
  async findById(id) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Restaurants WHERE id = ?';
      const [rows] = await connection.execute(sql, [id]);
      await this.db.disconnect();

      return rows.length > 0 ? new Restaurant(rows[0]) : null;
    } catch (error) {
      console.error('레스토랑 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 매니저 ID로 레스토랑 조회
   * @param {number} managerId - 매니저 ID
   * @returns {Promise<Restaurant[]>} 레스토랑 목록
   */
  async findByManagerId(managerId) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Restaurants WHERE manager_id = ? ORDER BY created_at DESC';
      const [rows] = await connection.execute(sql, [managerId]);
      await this.db.disconnect();

      return rows.map(row => new Restaurant(row));
    } catch (error) {
      console.error('매니저별 레스토랑 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 레스토랑 조회
   * @returns {Promise<Restaurant[]>} 레스토랑 목록
   */
  async findAll() {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Restaurants ORDER BY created_at DESC';
      const [rows] = await connection.execute(sql);
      await this.db.disconnect();

      return rows.map(row => new Restaurant(row));
    } catch (error) {
      console.error('레스토랑 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 레스토랑 정보 업데이트
   * @param {number} id - 레스토랑 ID
   * @param {object} updateData - 업데이트할 데이터
   * @returns {Promise<Restaurant|null>} 업데이트된 레스토랑 또는 null
   */
  async update(id, updateData) {
    try {
      const connection = await this.db.connect();
      
      const fields = [];
      const values = [];

      // 업데이트할 필드들 추가
      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.address !== undefined) {
        fields.push('address = ?');
        values.push(updateData.address);
      }
      if (updateData.latitude !== undefined) {
        fields.push('latitude = ?');
        values.push(updateData.latitude);
      }
      if (updateData.longitude !== undefined) {
        fields.push('longitude = ?');
        values.push(updateData.longitude);
      }

      if (fields.length === 0) {
        await this.db.disconnect();
        return await this.findById(id);
      }

      values.push(id);
      const sql = `UPDATE Restaurants SET ${fields.join(', ')} WHERE id = ?`;
      
      await connection.execute(sql, values);
      await this.db.disconnect();

      return await this.findById(id);
    } catch (error) {
      console.error('레스토랑 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 레스토랑 삭제
   * @param {number} id - 레스토랑 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(id) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'DELETE FROM Restaurants WHERE id = ?';
      const [result] = await connection.execute(sql, [id]);
      await this.db.disconnect();

      return result.affectedRows > 0;
    } catch (error) {
      console.error('레스토랑 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 매니저별 레스토랑 존재 여부 확인
   * @param {number} managerId - 매니저 ID
   * @returns {Promise<boolean>} 레스토랑 존재 여부
   */
  async existsByManagerId(managerId) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT COUNT(*) as count FROM Restaurants WHERE manager_id = ?';
      const [rows] = await connection.execute(sql, [managerId]);
      await this.db.disconnect();

      return rows[0].count > 0;
    } catch (error) {
      console.error('매니저별 레스토랑 존재 확인 실패:', error);
      throw error;
    }
  }
}

module.exports = new RestaurantRepository();
