// src/models/matchLog.model.js

/**
 * MatchLog model representing the history of all status changes for a match
 */
class MatchLog {
  constructor(data) {
    this.id = data.id || null;
    this.matchId = data.match_id || null;
    this.actorId = data.actor_id || null;
    this.previousStatus = data.previous_status || null;
    this.newStatus = data.new_status || '';
    this.notes = data.notes || '';
    this.createdAt = data.created_at || null;
  }

  /**
   * Validate match log status
   * @returns {boolean} True if status is valid
   */
  isValidStatus() {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
    return validStatuses.includes(this.newStatus);
  }

  /**
   * Convert to JSON object
   * @returns {object} MatchLog data as JSON
   */
  toJSON() {
    return {
      id: this.id,
      matchId: this.matchId,
      actorId: this.actorId,
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
      notes: this.notes,
      createdAt: this.createdAt
    };
  }

  /**
   * Convert to JSON object for database insertion
   * @returns {object} MatchLog data for database
   */
  toDBObject() {
    return {
      match_id: this.matchId,
      actor_id: this.actorId,
      previous_status: this.previousStatus,
      new_status: this.newStatus,
      notes: this.notes
    };
  }

  /**
   * Create a new match log entry
   * @param {number} matchId - Match ID
   * @param {number} actorId - Actor ID (user who performed the action)
   * @param {string} previousStatus - Previous status
   * @param {string} newStatus - New status
   * @param {string} notes - Optional notes
   * @returns {MatchLog} New MatchLog instance
   */
  static create(matchId, actorId, previousStatus, newStatus, notes = '') {
    return new MatchLog({
      match_id: matchId,
      actor_id: actorId,
      previous_status: previousStatus,
      new_status: newStatus,
      notes: notes,
      created_at: new Date()
    });
  }
}

module.exports = MatchLog;
