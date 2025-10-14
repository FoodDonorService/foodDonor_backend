// src/repositories/user.repository.js

const database = require('../config/database');
const User = require('../models/user.model');

class UserRepository {
  constructor() {
    this.db = database;
  }

  /**
   * 사용자 생성
   * @param {object} userData - 사용자 데이터
   * @returns {Promise<User>} 생성된 사용자
   */
  async create(userData) {
    try {
      const connection = await this.db.connect();
      
      const sql = `
        INSERT INTO Users (username, id, password_hash, name, role, address, latitude, longitude, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        userData.username,
        userData.id,
        userData.passwordHash,
        userData.name,
        userData.role,
        userData.address,
        userData.latitude,
        userData.longitude,
        userData.phoneNumber
      ];

      const [result] = await connection.execute(sql, values);
      await this.db.disconnect();

      // 생성된 사용자 조회
      return await this.findByUsername(userData.username);
    } catch (error) {
      console.error('사용자 생성 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 사용자 조회
   * @param {number} id - 사용자 ID
   * @returns {Promise<User|null>} 사용자 또는 null
   */
  async findById(id) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Users WHERE id = ?';
      const [rows] = await connection.execute(sql, [id]);
      await this.db.disconnect();

      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자명으로 사용자 조회
   * @param {string} username - 사용자명
   * @returns {Promise<User|null>} 사용자 또는 null
   */
  async findByUsername(username) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Users WHERE username = ?';
      const [rows] = await connection.execute(sql, [username]);
      await this.db.disconnect();

      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 역할별 사용자 검색
   * @param {string} role - 사용자 역할
   * @param {string} searchTerm - 검색어
   * @returns {Promise<User[]>} 사용자 목록
   */
  async findByRoleAndSearch(role, searchTerm = '') {
    try {
      const connection = await this.db.connect();
      
      let sql = 'SELECT * FROM Users WHERE role = ?';
      let values = [role];

      if (searchTerm) {
        sql += ' AND (name LIKE ? OR address LIKE ? OR phone_number LIKE ?)';
        const searchPattern = `%${searchTerm}%`;
        values.push(searchPattern, searchPattern, searchPattern);
      }

      sql += ' ORDER BY created_at DESC';

      const [rows] = await connection.execute(sql, values);
      await this.db.disconnect();

      return rows.map(row => new User(row));
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 사용자 조회
   * @returns {Promise<User[]>} 사용자 목록
   */
  async findAll() {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT * FROM Users ORDER BY created_at DESC';
      const [rows] = await connection.execute(sql);
      await this.db.disconnect();

      return rows.map(row => new User(row));
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 업데이트
   * @param {number} id - 사용자 ID
   * @param {object} updateData - 업데이트할 데이터
   * @returns {Promise<User|null>} 업데이트된 사용자 또는 null
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
      if (updateData.phoneNumber !== undefined) {
        fields.push('phone_number = ?');
        values.push(updateData.phoneNumber);
      }

      if (fields.length === 0) {
        await this.db.disconnect();
        return await this.findById(id);
      }

      values.push(id);
      const sql = `UPDATE Users SET ${fields.join(', ')} WHERE id = ?`;
      
      await connection.execute(sql, values);
      await this.db.disconnect();

      return await this.findById(id);
    } catch (error) {
      console.error('사용자 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 삭제
   * @param {number} id - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(id) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'DELETE FROM Users WHERE id = ?';
      const [result] = await connection.execute(sql, [id]);
      await this.db.disconnect();

      return result.affectedRows > 0;
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자명 중복 확인
   * @param {string} username - 사용자명
   * @returns {Promise<boolean>} 중복 여부 (true: 중복됨)
   */
  async isUsernameExists(username) {
    try {
      const connection = await this.db.connect();
      
      const sql = 'SELECT COUNT(*) as count FROM Users WHERE username = ?';
      const [rows] = await connection.execute(sql, [username]);
      await this.db.disconnect();

      return rows[0].count > 0;
    } catch (error) {
      console.error('사용자명 중복 확인 실패:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();