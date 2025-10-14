// 
// src/clients/publicData.client.js

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const csv = require('csv-parser');
const stream = require('stream');
const S3Restaurant = require('../models/s3Restaurant.model');
const Recipient = require('../models/recipient.model');
const Foodbank = require('../models/foodbank.model');

class PublicDataClient {
  //S3 클라이언트를 초기화
  constructor() {
    // .env 파일의 AWS_ 키들을 자동으로 인식하여 클라이언트를 설정합니다.
    this.s3Client = new S3Client({
      //.env 파일에 정의된 환경 변수(AWS_REGION, S3_BUCKET_NAME)를 사용하여 설정을 관리
      region: process.env.AWS_REGION,
    });
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  /**
   * S3에서 CSV 파일을 읽어 JSON 배열로 반환하는 공통 메서드
   * @param {string} fileName - S3 파일명
   * @returns {Promise<object[]>} CSV 데이터 배열
   */
  //핵심 유틸리티 메서드입니다.
  //S3에서 파일 객체를 가져오는 로직을 담당
  async getCsvDataFromS3(fileName) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      const { Body } = await this.s3Client.send(command);

      return new Promise((resolve, reject) => {
        const results = [];
        // Body는 스트림 형태이므로 csv-parser에 파이프로 연결합니다.
        //스트림의 data, end, error 이벤트를 처리하기 위해 Promise를 사용하여 async/await 구문과 자연스럽게 통합했습니다.
        Body.pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      console.error(`S3에서 ${fileName} 파일을 읽는 중 오류 발생:`, error);
      throw new Error(`Failed to retrieve ${fileName} from S3.`);
    }
  }

  /**
   * S3에서 레스토랑 CSV 파일을 읽어 Restaurant 객체 배열로 반환합니다.
   * @returns {Promise<Restaurant[]>} 레스토랑 데이터 배열
   */
  async getRestaurantsFromS3() {
    //getCsvDataFromS3를 호출하여 특정 CSV 파일의 데이터를 가져옵니다.
    const data = await this.getCsvDataFromS3('csv/Restaurants.csv');
    console.log('CSV 컬럼명들:', Object.keys(data[0] || {}));
    console.log('첫 번째 데이터 샘플:', data[0]);
    console.log('좌표 데이터 확인:');
    console.log('X:', data[0]['좌표정보(X)'], 'Type:', typeof data[0]['좌표정보(X)']);
    console.log('Y:', data[0]['좌표정보(Y)'], 'Type:', typeof data[0]['좌표정보(Y)']);
    //파싱된 순수 JSON 객체 배열을 각각의 모델 클래스(S3Restaurant, Recipient 등) 인스턴스 배열로 변환
    return data.map(item => new S3Restaurant(item));
  }

  /**
   * S3에서 수혜처 CSV 파일을 읽어 Recipient 객체 배열로 반환합니다.
   * @returns {Promise<Recipient[]>} 수혜처 데이터 배열
   */
  async getRecipientsFromS3() {
    const data = await this.getCsvDataFromS3('csv/Recipient.csv');
    return data.map(item => new Recipient(item));
  }

  /**
   * S3에서 푸드뱅크 CSV 파일을 읽어 Foodbank 객체 배열로 반환합니다.
   * @returns {Promise<Foodbank[]>} 푸드뱅크 데이터 배열
   */
  async getFoodbanksFromS3() {
    const data = await this.getCsvDataFromS3('csv/Foodbank.csv');
    return data.map(item => new Foodbank(item));
  }

  /**
   * 레스토랑 이름으로 검색
   * @param {string} searchTerm - 검색어
   * @returns {Promise<Restaurant[]>} 검색된 레스토랑 배열
   */
  async searchRestaurantsByName(searchTerm) {
    //get...FromS3()를 호출해 전체 데이터를 먼저 가져온 후, JavaScript의 filter 메서드를 사용해 메모리 상에서 검색을 수행
    const restaurants = await this.getRestaurantsFromS3();
    
    // 검색어가 없으면 모든 레스토랑 반환
    if (!searchTerm || searchTerm.trim() === '') {
      return restaurants;
    }
    
    const term = searchTerm.toLowerCase();
    
    return restaurants.filter(restaurant => {
      // 안전한 검색을 위해 각 필드가 존재하는지 확인
      const businessName = restaurant.businessName || '';
      const businessType = restaurant.businessType || '';
      const fullAddress = restaurant.fullAddress || '';
      const roadAddress = restaurant.roadAddress || '';
      
      return businessName.toLowerCase().includes(term) ||
             businessType.toLowerCase().includes(term) ||
             fullAddress.toLowerCase().includes(term) ||
             roadAddress.toLowerCase().includes(term);
    });
  }

  /**
   * 수혜처 이름으로 검색
   * @param {string} searchTerm - 검색어
   * @returns {Promise<Recipient[]>} 검색된 수혜처 배열
   */
  async searchRecipientsByName(searchTerm) {
    const recipients = await this.getRecipientsFromS3();
    
    // 검색어가 없으면 모든 수혜처 반환
    if (!searchTerm || searchTerm.trim() === '') {
      return recipients;
    }
    
    const term = searchTerm.toLowerCase();
    
    return recipients.filter(recipient => {
      const facilityName = recipient.facilityName || '';
      const facilityType = recipient.facilityType || '';
      const roadAddress = recipient.roadAddress || '';
      
      return facilityName.toLowerCase().includes(term) ||
             facilityType.toLowerCase().includes(term) ||
             roadAddress.toLowerCase().includes(term);
    });
  }

  /**
   * 푸드뱅크 이름으로 검색
   * @param {string} searchTerm - 검색어
   * @returns {Promise<Foodbank[]>} 검색된 푸드뱅크 배열
   */
  async searchFoodbanksByName(searchTerm) {
    const foodbanks = await this.getFoodbanksFromS3();
    
    // 검색어가 없으면 모든 푸드뱅크 반환
    if (!searchTerm || searchTerm.trim() === '') {
      return foodbanks;
    }
    
    const term = searchTerm.toLowerCase();
    
    return foodbanks.filter(foodbank => {
      const businessName = foodbank.businessName || '';
      const businessType = foodbank.businessType || '';
      const roadAddress = foodbank.roadAddress || '';
      
      return businessName.toLowerCase().includes(term) ||
             businessType.toLowerCase().includes(term) ||
             roadAddress.toLowerCase().includes(term);
    });
  }

  /**
   * 좌표 기반으로 가까운 레스토랑들을 거리순으로 정렬하여 반환
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} limit - 반환할 최대 개수 (기본값: 10)
   * @returns {Promise<Restaurant[]>} 거리순으로 정렬된 레스토랑 배열
   */
  async getNearbyRestaurants(x, y, limit = 10) {
    const restaurants = await this.getRestaurantsFromS3();
    
    return restaurants
      .map(restaurant => ({
        ...restaurant,
        distance: restaurant.calculateDistance(x, y)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(({ distance, ...restaurant }) => restaurant);
  }

  /**
   * 좌표 기반으로 가까운 수혜처들을 거리순으로 정렬하여 반환
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도
   * @param {number} limit - 반환할 최대 개수 (기본값: 10)
   * @returns {Promise<Recipient[]>} 거리순으로 정렬된 수혜처 배열
   */
  async getNearbyRecipients(latitude, longitude, limit = 10) {
    const recipients = await this.getRecipientsFromS3();
    
    return recipients
      .map(recipient => ({
        ...recipient,
        distance: recipient.calculateDistance(latitude, longitude)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(({ distance, ...recipient }) => recipient);
  }

  /**
   * 좌표 기반으로 가까운 푸드뱅크들을 거리순으로 정렬하여 반환
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도
   * @param {number} limit - 반환할 최대 개수 (기본값: 10)
   * @returns {Promise<Foodbank[]>} 거리순으로 정렬된 푸드뱅크 배열
   */
  async getNearbyFoodbanks(latitude, longitude, limit = 10) {
    const foodbanks = await this.getFoodbanksFromS3();
    
    return foodbanks
      .map(foodbank => ({
        ...foodbank,
        distance: foodbank.calculateDistance(latitude, longitude)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(({ distance, ...foodbank }) => foodbank);
  }
}

module.exports = new PublicDataClient();