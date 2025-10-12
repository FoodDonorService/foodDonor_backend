// src/config/database.js

const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.connection = null;
    
    // AWS RDS Connection 설정 (단일 연결용) - 기존 .env 사용
    this.connectionConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    };
    
    // AWS RDS Pool 설정 (연결 풀용) - 기존 .env 사용
    this.poolConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };
  }

  /**
   * 데이터베이스 연결 생성
   * @returns {Promise<mysql.Connection>} 데이터베이스 연결
   */
  async connect() {
    try {
      console.log('🔗 AWS RDS MySQL 연결 시도 중...');
      console.log('Host:', this.connectionConfig.host);
      console.log('Port:', this.connectionConfig.port);
      console.log('Database:', this.connectionConfig.database);
      console.log('User:', this.connectionConfig.user);
      
      this.connection = await mysql.createConnection(this.connectionConfig);
      console.log('✅ AWS RDS MySQL 데이터베이스 연결 성공');
      return this.connection;
    } catch (error) {
      console.error('❌ AWS RDS MySQL 데이터베이스 연결 실패:', error.message);
      console.error('연결 설정:', {
        host: this.connectionConfig.host,
        port: this.connectionConfig.port,
        database: this.connectionConfig.database,
        user: this.connectionConfig.user
      });
      throw error;
    }
  }

  /**
   * 연결 풀 생성
   * @returns {Promise<mysql.Pool>} 연결 풀
   */
  async createPool() {
    try {
      const pool = mysql.createPool(this.poolConfig);
      console.log('✅ AWS RDS MySQL 연결 풀 생성 성공');
      return pool;
    } catch (error) {
      console.error('❌ AWS RDS MySQL 연결 풀 생성 실패:', error.message);
      throw error;
    }
  }

  /**
   * 데이터베이스 연결 종료
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ AWS RDS MySQL 데이터베이스 연결 종료');
    }
  }

  /**
   * 데이터베이스 존재 여부 확인
   * @returns {Promise<boolean>} 데이터베이스 존재 여부
   */
  async checkDatabaseExists() {
    try {
      const connection = await mysql.createConnection({
        host: this.connectionConfig.host,
        port: this.connectionConfig.port,
        user: this.connectionConfig.user,
        password: this.connectionConfig.password
      });

      const [rows] = await connection.execute(
        'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
        [this.connectionConfig.database]
      );

      await connection.end();
      return rows.length > 0;
    } catch (error) {
      console.error('데이터베이스 존재 여부 확인 실패:', error.message);
      return false;
    }
  }

  /**
   * 데이터베이스 생성
   */
  async createDatabase() {
    try {
      const connection = await mysql.createConnection({
        host: this.connectionConfig.host,
        port: this.connectionConfig.port,
        user: this.connectionConfig.user,
        password: this.connectionConfig.password
      });

      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.connectionConfig.database}\``);
      await connection.end();
      console.log(`✅ 데이터베이스 '${this.connectionConfig.database}' 생성 완료`);
    } catch (error) {
      console.error('데이터베이스 생성 실패:', error.message);
      throw error;
    }
  }

  /**
   * 테이블 존재 여부 확인
   * @param {string} tableName - 테이블명
   * @returns {Promise<boolean>} 테이블 존재 여부
   */
  async checkTableExists(tableName) {
    try {
      const connection = await this.connect();
      const [rows] = await connection.execute(
        'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
        [this.config.database, tableName]
      );
      await this.disconnect();
      return rows.length > 0;
    } catch (error) {
      console.error('테이블 존재 여부 확인 실패:', error.message);
      return false;
    }
  }
}

module.exports = new Database();
