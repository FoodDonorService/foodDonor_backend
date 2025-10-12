// src/config/initDatabase.js

const database = require('./database');

/**
 * 데이터베이스 초기화 스크립트
 */
class DatabaseInitializer {
  constructor() {
    this.db = database;
  }

  /**
   * 모든 테이블 생성
   */
  async initializeTables() {
    try {
      console.log('🔄 데이터베이스 초기화 시작...');
      
      // 먼저 데이터베이스 생성 시도
      try {
        const dbExists = await this.db.checkDatabaseExists();
        if (!dbExists) {
          console.log('📊 데이터베이스가 존재하지 않습니다. 생성 중...');
          await this.db.createDatabase();
          console.log('✅ 데이터베이스 생성 완료');
        } else {
          console.log('✅ 데이터베이스가 이미 존재합니다.');
        }
      } catch (dbError) {
        console.log('⚠️ 데이터베이스 존재 확인 실패, 직접 연결 시도...');
      }

      // 연결 생성
      console.log('🔗 데이터베이스 연결 중...');
      const connection = await this.db.connect();
      console.log('✅ 데이터베이스 연결 성공');

      // Users 테이블 생성
      console.log('📋 Users 테이블 생성 중...');
      await this.createUsersTable(connection);
      
      // Restaurants 테이블 생성
      console.log('📋 Restaurants 테이블 생성 중...');
      await this.createRestaurantsTable(connection);
      
      // Donations 테이블 생성
      console.log('📋 Donations 테이블 생성 중...');
      await this.createDonationsTable(connection);
      
      // Matches 테이블 생성
      console.log('📋 Matches 테이블 생성 중...');
      await this.createMatchesTable(connection);
      
      // Match_Logs 테이블 생성
      console.log('📋 Match_Logs 테이블 생성 중...');
      await this.createMatchLogsTable(connection);

      await this.db.disconnect();
      console.log('✅ 모든 테이블 초기화 완료');
    } catch (error) {
      console.error('❌ 데이터베이스 초기화 실패:', error);
      console.error('오류 상세:', error.message);
      throw error;
    }
  }

  /**
   * Users 테이블 생성
   * @param {mysql.Connection} connection - 데이터베이스 연결
   */
  async createUsersTable(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL COMMENT 'Login ID or Email',
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL COMMENT 'Name of the person or organization',
        role VARCHAR(50) NOT NULL COMMENT "Enum: 'DONOR', 'RECIPIENT', 'FOOD_BANK'",
        address VARCHAR(255) COMMENT 'Used for distance calculations',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        phone_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(sql);
    console.log('✅ Users 테이블 생성 완료');
  }

  /**
   * Restaurants 테이블 생성
   * @param {mysql.Connection} connection - 데이터베이스 연결
   */
  async createRestaurantsTable(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS Restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manager_id INT NOT NULL COMMENT 'FK to the DONOR user who manages this restaurant',
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_manager_id (manager_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(sql);
    console.log('✅ Restaurants 테이블 생성 완료');
  }

  /**
   * Donations 테이블 생성
   * @param {mysql.Connection} connection - 데이터베이스 연결
   */
  async createDonationsTable(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS Donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        quantity INT NOT NULL,
        expiration_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' COMMENT "Enum: 'AVAILABLE', 'REQUESTED', 'CONFIRMED'",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id) ON DELETE CASCADE,
        INDEX idx_restaurant_id (restaurant_id),
        INDEX idx_status (status),
        INDEX idx_expiration_date (expiration_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(sql);
    console.log('✅ Donations 테이블 생성 완료');
  }

  /**
   * Matches 테이블 생성
   * @param {mysql.Connection} connection - 데이터베이스 연결
   */
  async createMatchesTable(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS Matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donation_id INT UNIQUE NOT NULL COMMENT 'A donation can only be part of one match',
        recipient_id INT NOT NULL COMMENT 'FK to the RECIPIENT user',
        food_bank_id INT COMMENT 'FK to the FOOD_BANK user who handled the match',
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT "Enum: 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of the initial request from the recipient',
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp of the last status update by the food bank',
        FOREIGN KEY (donation_id) REFERENCES Donations(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (food_bank_id) REFERENCES Users(id) ON DELETE SET NULL,
        INDEX idx_donation_id (donation_id),
        INDEX idx_recipient_id (recipient_id),
        INDEX idx_food_bank_id (food_bank_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(sql);
    console.log('✅ Matches 테이블 생성 완료');
  }

  /**
   * Match_Logs 테이블 생성
   * @param {mysql.Connection} connection - 데이터베이스 연결
   */
  async createMatchLogsTable(connection) {
    const sql = `
      CREATE TABLE IF NOT EXISTS Match_Logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        match_id INT NOT NULL,
        actor_id INT NOT NULL COMMENT 'User who performed the action (e.g., Recipient, Food Bank)',
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        notes TEXT COMMENT 'Optional notes about the status change',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE,
        FOREIGN KEY (actor_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_match_id (match_id),
        INDEX idx_actor_id (actor_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(sql);
    console.log('✅ Match_Logs 테이블 생성 완료');
  }

  /**
   * 샘플 데이터 삽입
   */
  async insertSampleData() {
    try {
      const connection = await this.db.connect();

      // 샘플 사용자 데이터
      const users = [
        {
          username: 'donor1@example.com',
          password_hash: '$2b$10$example_hash_1',
          name: '김기부',
          role: 'DONOR',
          address: '서울특별시 강남구 테헤란로 123',
          latitude: 37.5665,
          longitude: 126.9780,
          phone_number: '010-1234-5678'
        },
        {
          username: 'recipient1@example.com',
          password_hash: '$2b$10$example_hash_2',
          name: '강남구립 행복요양원',
          role: 'RECIPIENT',
          address: '서울특별시 강남구 광평로 195',
          latitude: 37.489123,
          longitude: 127.098456,
          phone_number: '02-3412-1234'
        },
        {
          username: 'foodbank1@example.com',
          password_hash: '$2b$10$example_hash_3',
          name: '강남구 푸드뱅크마켓센터',
          role: 'FOOD_BANK',
          address: '서울특별시 강남구 개포로 617-8',
          latitude: 37.491234,
          longitude: 127.076543,
          phone_number: '02-459-1377'
        }
      ];

      for (const user of users) {
        await connection.execute(
          'INSERT IGNORE INTO Users (username, password_hash, name, role, address, latitude, longitude, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [user.username, user.password_hash, user.name, user.role, user.address, user.latitude, user.longitude, user.phone_number]
        );
      }

      console.log('✅ 샘플 데이터 삽입 완료');
      await this.db.disconnect();
    } catch (error) {
      console.error('❌ 샘플 데이터 삽입 실패:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseInitializer();
