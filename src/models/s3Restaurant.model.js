// src/models/s3Restaurant.model.js

/**
 * S3 CSV 데이터용 Restaurant 모델
 */
class S3Restaurant {
  constructor(data) {
    this.id = data['ID'] || data['id'] || null;
    // 모든 필드에서 따옴표 제거
    this.businessName = this.cleanString(data['사업장명']);
    this.businessStatus = this.cleanString(data['영업상태명']);
    this.businessType = this.cleanString(data['업태구분명']);
    this.fullAddress = this.cleanString(data['소재지전체주소']);
    this.roadAddress = this.cleanString(data['도로명전체주소']);
    
    // 좌표 파싱
    const rawX = data['좌표정보(X)'];
    const rawY = data['좌표정보(Y)'];
    
    // 따옴표 제거 및 파싱
    const cleanX = rawX ? rawX.toString().replace(/['"]/g, '').trim() : '';
    const cleanY = rawY ? rawY.toString().replace(/['"]/g, '').trim() : '';
    
    this.coordinateX = parseFloat(cleanX) || 0;
    this.coordinateY = parseFloat(cleanY) || 0;
    
    // 위경도 변환 (한국 좌표계를 WGS84로 변환하는 간단한 공식)
    this.latitude = this.coordinateY / 1000000; // 대략적인 변환
    this.longitude = this.coordinateX / 1000000; // 대략적인 변환
  }

  /**
   * 문자열에서 따옴표 제거
   * @param {string} str - 원본 문자열
   * @returns {string} 정리된 문자열
   */
  cleanString(str) {
    if (!str) return '';
    return str.toString().replace(/['"]/g, '').trim();
  }

  /**
   * Calculate distance from given coordinates using Euclidean distance
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Distance in coordinate units
   */
  calculateDistance(x, y) {
    const dx = this.coordinateX - x;
    const dy = this.coordinateY - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Convert to JSON object
   * @returns {object} Restaurant data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      businessName: this.businessName,
      businessStatus: this.businessStatus,
      businessType: this.businessType,
      fullAddress: this.fullAddress,
      roadAddress: this.roadAddress,
      coordinateX: this.coordinateX,
      coordinateY: this.coordinateY,
      latitude: this.latitude,
      longitude: this.longitude
    };
  }
}

module.exports = S3Restaurant;
