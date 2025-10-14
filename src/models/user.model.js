// src/models/user.model.js

/**
 * User model representing all participants: Donors, Recipients, and Food Banks
 */
class User {
  constructor(data) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.passwordHash = data.password_hash || '';
    this.name = data.name || '';
    this.role = data.role || '';
    this.address = data.address || '';
    this.latitude = data.latitude || null;
    this.longitude = data.longitude || null;
    this.phoneNumber = data.phone_number || '';
    this.createdAt = data.created_at || null;
  }

  /**
   * Validate user role
   * @returns {boolean} True if role is valid
   */
  isValidRole() {
    const validRoles = ['DONOR', 'RECIPIENT', 'FOOD_BANK'];
    return validRoles.includes(this.role);
  }

  /**
   * Check if user is a donor
   * @returns {boolean} True if user is a donor
   */
  isDonor() {
    return this.role === 'DONOR';
  }

  /**
   * Check if user is a recipient
   * @returns {boolean} True if user is a recipient
   */
  isRecipient() {
    return this.role === 'RECIPIENT';
  }

  /**
   * Check if user is a food bank
   * @returns {boolean} True if user is a food bank
   */
  isFoodBank() {
    return this.role === 'FOOD_BANK';
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
   * Convert to JSON object (excluding sensitive data)
   * @returns {object} User data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      role: this.role,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt
    };
  }

  /**
   * Convert to JSON object for database insertion
   * @returns {object} User data for database
   */
  toDBObject() {
    return {
      id: this.id,
      username: this.username,
      password_hash: this.passwordHash,
      name: this.name,
      role: this.role,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude,
      phone_number: this.phoneNumber
    };
  }
}

module.exports = User;