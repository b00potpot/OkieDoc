// /services/ConsultationService.js

/**
 * @description :: Server-side logic for managing consultation states and workflows.
 */

// Define the strict mapping of allowed state transitions
const VALID_TRANSITIONS = {
  'waiting': ['in progress', 'cancelled'],
  'pending': ['active', 'cancelled'],
  'active': ['completed', 'cancelled'],
  'in progress': ['completed', 'cancelled']
};

module.exports = {
  
  /**
   * Safely transitions a consultation to a new status.
   * * @param {string|number} consultationId - The ID of the consultation.
   * @param {string} targetStatus - The desired new status.
   * @param {string|number} performedBy - User ID requesting the change (for logging).
   * @returns {Object} The updated consultation record.
   */
  transitionStatus: async function(consultationId, targetStatus, performedBy = 'System') {
    if (!consultationId || !targetStatus) {
      throw new Error('Consultation ID and target status are required.');
    }

    // 1. Fetch the current consultation record
    // Note: Assuming your model is named 'ConsultationTicket' based on the OkieDoc schema
    const consultation = await ConsultationTicket.findOne({ id: consultationId });

    if (!consultation) {
      throw new Error('Consultation not found.');
    }

    // Normalize strings for safe comparison
    const currentStatus = (consultation.status || '').toLowerCase();
    const requestedStatus = targetStatus.toLowerCase();

    // 2. Validate the transition pathway
    const allowedNextStates = VALID_TRANSITIONS[currentStatus];

    if (!allowedNextStates || !allowedNextStates.includes(requestedStatus)) {
      throw new Error(
        `Invalid status transition. A consultation cannot move from '${consultation.status}' directly to '${targetStatus}'.`
      );
    }

    // 3. Execute the database update
    const updatedConsultation = await ConsultationTicket.updateOne({ id: consultationId }).set({
      status: targetStatus, // Store it in the exact casing provided by the request
      lastActivityDate: new Date().toISOString()
    });

    // 4. (Optional but recommended) Write to an Audit Log
    try {
      await AuditLog.create({
        action: `STATUS_CHANGED_TO_${targetStatus.toUpperCase().replace(/\s+/g, '_')}`,
        entityType: 'Consultation',
        entityId: consultationId,
        userName: performedBy,
        metadata: { previousStatus: consultation.status, newStatus: targetStatus }
      });
    } catch (logError) {
      sails.log.error('Failed to write audit log for status transition:', logError);
    }

    return updatedConsultation;
  }
};