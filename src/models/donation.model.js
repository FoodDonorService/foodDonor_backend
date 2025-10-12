// src/models/donation.model.js

/**
 * Donation model representing food items being offered by restaurants
 */
class Donation {
  constructor(data) {
    this.id = data.id || null;
    this.restaurantId = data.restaurant_id || null;
    this.itemName = data.item_name || '';
    this.category = data.category || '';
    this.quantity = data.quantity || 0;
    this.expirationDate = data.expiration_date || null;
    this.status = data.status || 'AVAILABLE';
    this.createdAt = data.created_at || null;
    this.updatedAt = data.updated_at || null;
  }

  /**
   * Validate donation status
   * @returns {boolean} True if status is valid
   */
  isValidStatus() {
    const validStatuses = ['AVAILABLE', 'REQUESTED', 'CONFIRMED'];
    return validStatuses.includes(this.status);
  }

  /**
   * Check if donation is available
   * @returns {boolean} True if donation is available
   */
  isAvailable() {
    return this.status === 'AVAILABLE';
  }

  /**
   * Check if donation is requested
   * @returns {boolean} True if donation is requested
   */
  isRequested() {
    return this.status === 'REQUESTED';
  }

  /**
   * Check if donation is confirmed
   * @returns {boolean} True if donation is confirmed
   */
  isConfirmed() {
    return this.status === 'CONFIRMED';
  }

  /**
   * Check if donation is expired
   * @returns {boolean} True if donation is expired
   */
  isExpired() {
    if (!this.expirationDate) return false;
    const today = new Date();
    const expiration = new Date(this.expirationDate);
    return today > expiration;
  }

  /**
   * Update donation status
   * @param {string} newStatus - New status
   * @param {Date} updatedAt - Update timestamp
   */
  updateStatus(newStatus, updatedAt = new Date()) {
    if (this.isValidStatus()) {
      this.status = newStatus;
      this.updatedAt = updatedAt;
    }
  }

  /**
   * Convert to JSON object
   * @returns {object} Donation data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      restaurantId: this.restaurantId,
      itemName: this.itemName,
      category: this.category,
      quantity: this.quantity,
      expirationDate: this.expirationDate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isExpired: this.isExpired()
    };
  }

  /**
   * Convert to JSON object for database insertion
   * @returns {object} Donation data for database
   */
  toDBObject() {
    return {
      restaurant_id: this.restaurantId,
      item_name: this.itemName,
      category: this.category,
      quantity: this.quantity,
      expiration_date: this.expirationDate,
      status: this.status
    };
  }
}

module.exports = Donation;