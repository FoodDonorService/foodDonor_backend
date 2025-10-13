// src/models/recipient.model.js

/**
 * Recipient model representing social welfare facilities data from S3 CSV
 */
class Recipient {
  constructor(data) {
    this.id = data['ID'] || data['id'] || null;
    this.facilityName = data['사회복지시설명'] || '';
    this.facilityType = data['사회복지시설종류명'] || '';
    this.roadAddress = data['소재지도로명주소'] || '';
    this.phoneNumber = data['전화번호'] || '';
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
   * @returns {object} Recipient data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      facilityName: this.facilityName,
      facilityType: this.facilityType,
      roadAddress: this.roadAddress,
      phoneNumber: this.phoneNumber,
      latitude: this.latitude,
      longitude: this.longitude
    };
  }
}

module.exports = Recipient;
