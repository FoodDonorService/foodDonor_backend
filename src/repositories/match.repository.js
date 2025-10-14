// src/repositories/match.repository.js

const database = require('../config/database');
const Match = require('../models/match.model');

class MatchRepository {
    constructor() {
        this.db = database;
    }

    // (중복 메서드 제거) findById는 아래에 단일 정의로 유지

    /**
     * 매칭 정보 업데이트
     * @param {number} id - 매칭 ID
     * @param {object} updateData - 업데이트할 데이터 (status, foodBankId 등)
     * @returns {Promise<Match|null>} 업데이트된 매칭
     */
    async update(id, updateData) {
        try {
            const connection = await this.db.connect();
            const fields = [];
            const values = [];

            if (updateData.status) {
                fields.push('status = ?');
                values.push(updateData.status);
            }
            if (updateData.foodBankId) {
                fields.push('food_bank_id = ?');
                values.push(updateData.foodBankId);
            }

            if (fields.length === 0) {
                await this.db.disconnect();
                return this.findById(id);
            }

            values.push(id);
            const sql = `UPDATE Matches SET ${fields.join(', ')} WHERE id = ?`;

            await connection.execute(sql, values);
            await this.db.disconnect();

            return await this.findById(id);
        } catch (error) {
            console.error('매칭 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * PENDING 상태인 매칭 목록과 상세 정보 조회
     * (여러 테이블을 JOIN하는 복잡한 쿼리)
     * @returns {Promise<object[]>} 대기중인 매칭 목록
     */
    async findPendingWithDetails() {
        try {
            const connection = await this.db.connect();
            const sql = `
        SELECT
          m.id AS match_id,
          m.recipient_id,
          u_rec.name AS recipient_name,
          u_rec.address AS recipient_address,
          r.id AS restaurant_id,
          r.name AS restaurant_name,
          r.address AS restaurant_address,
          d.id AS donation_id,
          d.item_name AS donation_item_name,
          d.category AS donation_category,
          d.quantity AS donation_quantity,
          d.expiration_date AS donation_expiration_date,
          m.status
        FROM Matches m
        JOIN Donations d ON m.donation_id = d.id
        JOIN Restaurants r ON d.restaurant_id = r.id
        JOIN Users u_rec ON m.recipient_id = u_rec.id
        WHERE m.status = 'PENDING'
        ORDER BY m.created_at DESC
      `;
            const [rows] = await connection.execute(sql);
            await this.db.disconnect();
            return rows;
        } catch (error) {
            console.error('대기중인 매칭 목록 조회 실패:', error);
            throw error;
        }
    }

  async getAcceptedMatches(foodBankId) {
    const query = `
      SELECT 
        m.id as match_id,
        m.recipient_id,
        r.id as restaurant_id,
        r.name as restaurant_name,
        r.address as restaurant_address,
        d.id as donation_id,
        d.item_name as donation_item_name,
        d.category as donation_category,
        d.quantity as donation_quantity,
        d.expiration_date as donation_expiration_date
      FROM Matches m
      INNER JOIN Donations d ON m.donation_id = d.id
      INNER JOIN Restaurants r ON d.restaurant_id = r.id
      WHERE m.food_bank_id = ? AND m.status = 'ACCEPTED'
      ORDER BY m.created_at DESC
    `;

    try {
      const connection = await this.db.connect();
      const [rows] = await connection.execute(query, [foodBankId]);
      await this.db.disconnect();
      return rows;
    } catch (error) {
      console.error('Error fetching accepted matches:', error);
      throw new Error('Failed to fetch accepted matches');
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