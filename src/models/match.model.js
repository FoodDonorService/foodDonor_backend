// src/models/match.model.js

/**
 * Match model representing a request from a Recipient for a Donation, managed by a Food Bank
 */
class Match {
  constructor(data) {
    this.id = data.id || null;
    this.donationId = data.donation_id || null;
    this.recipientId = data.recipient_id || null;
    this.foodBankId = data.food_bank_id || null;
    this.status = data.status || 'PENDING';
    this.createdAt = data.created_at || null;
    this.updatedAt = data.updated_at || null;
  }

  /**
   * Validate match status
   * @returns {boolean} True if status is valid
   */
  isValidStatus() {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
    return validStatuses.includes(this.status);
  }

  /**
   * Check if match is pending
   * @returns {boolean} True if match is pending
   */
  isPending() {
    return this.status === 'PENDING';
  }

  /**
   * Check if match is accepted
   * @returns {boolean} True if match is accepted
   */
  isAccepted() {
    return this.status === 'ACCEPTED';
  }

  /**
   * Check if match is rejected
   * @returns {boolean} True if match is rejected
   */
  isRejected() {
    return this.status === 'REJECTED';
  }

  /**
   * Check if match is completed
   * @returns {boolean} True if match is completed
   */
  isCompleted() {
    return this.status === 'COMPLETED';
  }

  /**
   * Update match status
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
   * Accept the match
   * @param {number} foodBankId - ID of the food bank accepting the match
   */
  accept(foodBankId) {
    this.foodBankId = foodBankId;
    this.updateStatus('ACCEPTED');
  }

  /**
   * Reject the match
   */
  reject() {
    this.updateStatus('REJECTED');
  }

  /**
   * Complete the match
   */
  complete() {
    this.updateStatus('COMPLETED');
  }

  /**
   * Convert to JSON object
   * @returns {object} Match data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      donationId: this.donationId,
      recipientId: this.recipientId,
      foodBankId: this.foodBankId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convert to JSON object for database insertion
   * @returns {object} Match data for database
   */
  toDBObject() {
    return {
      donation_id: this.donationId,
      recipient_id: this.recipientId,
      food_bank_id: this.foodBankId,
      status: this.status
    };
  }
}

module.exports = Match;