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
    /*
    async create(matchData) {
        try {
            const connection = await this.db.connect();
            const sql = `
        INSERT INTO Matches (donation_id, recipient_id, food_bank_id, status)
        VALUES (?, ?, ?, ?)
      `;
            const values = [
                matchData.donationId,
                matchData.recipientId,
                matchData.foodBankId,
                matchData.status || 'PENDING'
            ];

            const [result] = await connection.execute(sql, values);
            await this.db.disconnect();

            return await this.findById(result.insertId);
        } catch (error) {
            console.error('매칭 생성 실패:', error);
            throw error;
        }
    }

     */

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
            console.error('ID로 매칭 조회 실패:', error);
            throw error;
        }
    }

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
            // API 명세서에 맞는 데이터를 위해 여러 테이블을 JOIN합니다.
            // 테이블과 컬럼명은 실제 DB 스키마에 맞게 조정이 필요할 수 있습니다.
            const sql = `
        SELECT
          m.id AS match_id,
          r.id AS recipient_id,
          r.name AS recipient_name,
          r.address AS recipient_address,
          u.id AS restaurant_id,
          u.name AS restaurant_name,
          u.address AS restaurant_address,
          d.id AS donation_id,
          d.item_name AS donation_item_name,
          d.category AS donation_category,
          d.quantity AS donation_quantity,
          d.expiration_date AS donation_expiration_date,
          m.status
        FROM Matches AS m
        JOIN Recipients AS r ON m.recipient_id = r.id
        JOIN Donations AS d ON m.donation_id = d.id
        JOIN Users AS u ON d.user_id = u.id
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

    /**
     * ACCEPTED 상태인 매칭 목록과 상세 정보 조회
     * @returns {Promise<object[]>} 수락된 매칭 목록
     */
    async findAcceptedWithDetails() {
        try {
            const connection = await this.db.connect();
            const sql = `
        SELECT
          m.id AS match_id,
          r.id AS recipient_id,
          r.name AS recipient_name,
          r.address AS recipient_address,
          r.phone_number AS recipient_phone_number,
          u.id AS restaurant_id,
          u.name AS restaurant_name,
          u.address AS restaurant_address,
          d.id AS donation_id,
          d.item_name AS donation_item_name,
          d.category AS donation_category,
          d.quantity AS donation_quantity,
          d.expiration_date AS donation_expiration_date
        FROM Matches AS m
        JOIN Recipients AS r ON m.recipient_id = r.id
        JOIN Donations AS d ON m.donation_id = d.id
        JOIN Users AS u ON d.user_id = u.id
        WHERE m.status = 'ACCEPTED'
        ORDER BY m.created_at DESC
      `;
            const [rows] = await connection.execute(sql);
            await this.db.disconnect();
            return rows;
        } catch (error) {
            console.error('수락된 매칭 목록 조회 실패:', error);
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
}

module.exports = new MatchRepository();