// src/models/restaurant.model.js

/**
 * Restaurant model representing restaurants managed by DONOR users
 */
class Restaurant {
  constructor(data) {
    // DB 데이터용 필드
    this.id = data.id || null;
    this.managerId = data.manager_id || null;
    this.name = data.name || '';
    this.address = data.address || '';
    this.latitude = data.latitude || null;
    this.longitude = data.longitude || null;
    this.createdAt = data.created_at || null;
    
    // S3 CSV 데이터용 필드 (따옴표 제거)
    this.businessName = this.cleanString(data['사업장명']) || data.businessName || '';
    this.businessStatus = this.cleanString(data['영업상태명']) || data.businessStatus || '';
    this.businessType = this.cleanString(data['업태구분명']) || data.businessType || '';
    this.fullAddress = this.cleanString(data['소재지전체주소']) || data.fullAddress || '';
    this.roadAddress = this.cleanString(data['도로명전체주소']) || data.roadAddress || '';
    
    // 좌표 데이터 정리 및 변환
    const rawX = this.cleanString(data['좌표정보(X)']);
    const rawY = this.cleanString(data['좌표정보(Y)']);
    
    this.coordinatesX = rawX ? parseFloat(rawX) : null;
    this.coordinatesY = rawY ? parseFloat(rawY) : null;
    
    // 좌표 변환 (TM 좌표계를 WGS84로 변환하는 간단한 근사치)
    if (this.coordinatesX && this.coordinatesY && !isNaN(this.coordinatesX) && !isNaN(this.coordinatesY)) {
      this.latitude = this.convertTMToLat(this.coordinatesX, this.coordinatesY);
      this.longitude = this.convertTMToLng(this.coordinatesX, this.coordinatesY);
    }
  }

  /**
   * Clean string by removing quotes and extra spaces
   * @param {string} str - String to clean
   * @returns {string} Cleaned string
   */
  cleanString(str) {
    if (!str) return '';
    return str.toString().replace(/^["\s]+|["\s]+$/g, '').trim();
  }

  /**
   * Calculate distance from given coordinates using Haversine formula
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat, lng) {
    if (!this.latitude || !this.longitude) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat - this.latitude);
    const dLng = this.toRadians(lng - this.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert TM coordinates to WGS84 latitude
   * @param {number} x - TM X coordinate
   * @param {number} y - TM Y coordinate
   * @returns {number} Latitude in WGS84
   */
  convertTMToLat(x, y) {
    // 간단한 TM to WGS84 변환 (정확하지 않지만 근사치)
    const lat0 = 38.0; // 기준 위도
    const lon0 = 127.0; // 기준 경도
    const k0 = 1.0; // 축척계수
    
    const dx = (x - 200000) / k0;
    const dy = (y - 500000) / k0;
    
    // 간단한 역변환 공식 (정확하지 않음)
    const lat = lat0 + (dy / 111320.0);
    return lat;
  }

  /**
   * Convert TM coordinates to WGS84 longitude
   * @param {number} x - TM X coordinate
   * @param {number} y - TM Y coordinate
   * @returns {number} Longitude in WGS84
   */
  convertTMToLng(x, y) {
    // 간단한 TM to WGS84 변환 (정확하지 않지만 근사치)
    const lat0 = 38.0; // 기준 위도
    const lon0 = 127.0; // 기준 경도
    const k0 = 1.0; // 축척계수
    
    const dx = (x - 200000) / k0;
    const dy = (y - 500000) / k0;
    
    // 간단한 역변환 공식 (정확하지 않음)
    const lng = lon0 + (dx / (111320.0 * Math.cos(this.toRadians(lat0))));
    return lng;
  }

  /**
   * Convert to JSON object
   * @returns {object} Restaurant data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      managerId: this.managerId,
      name: this.name,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude,
      createdAt: this.createdAt,
      // S3 데이터 필드
      businessName: this.businessName,
      businessStatus: this.businessStatus,
      businessType: this.businessType,
      fullAddress: this.fullAddress,
      roadAddress: this.roadAddress,
      coordinatesX: this.coordinatesX,
      coordinatesY: this.coordinatesY
    };
  }

  /**
   * Convert to JSON object for database insertion
   * @returns {object} Restaurant data for database
   */
  toDBObject() {
    return {
      manager_id: this.managerId,
      name: this.name,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude
    };
  }
}

module.exports = Restaurant;