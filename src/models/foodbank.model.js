// src/models/foodbank.model.js

/**
 * Foodbank model representing foodbank data from S3 CSV
 */
class Foodbank {
  constructor(data) {
    this.id = data['ID'] || data['id'] || null;
    this.businessName = data['사업장명'] || '';
    this.businessType = data['사업장유형'] || '';
    this.roadAddress = data['소재지도로명주소'] || '';
    this.phoneNumber = data['관리기관전화번호'] || '';
    this.website = data['홈페이지'] || '';
    this.latitude = parseFloat(data['위도']) || 0;
    this.longitude = parseFloat(data['경도']) || 0;
  }

  /**
   * Calculate distance from given coordinates using Haversine formula
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat, lng) {
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
   * Convert to JSON object
   * @returns {object} Foodbank data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      businessName: this.businessName,
      businessType: this.businessType,
      roadAddress: this.roadAddress,
      phoneNumber: this.phoneNumber,
      website: this.website,
      latitude: this.latitude,
      longitude: this.longitude
    };
  }
}

module.exports = Foodbank;
