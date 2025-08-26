import Campaign from '../mongoDB/models/Campaign.js';

class CampaignSchedulingService {
  /**
   * Schedule a campaign with advanced options
   */
  async scheduleCampaign(campaignId, scheduleData) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update schedule
      campaign.schedule = {
        ...campaign.schedule,
        ...scheduleData,
        isScheduled: true,
        isActive: false
      };

      // Calculate next occurrence for recurring campaigns
      if (scheduleData.isRecurring && scheduleData.recurrenceDetails) {
        campaign.schedule.nextOccurrence = this.calculateNextOccurrence(
          scheduleData.startDate,
          scheduleData.recurrenceDetails
        );
      }

      // Handle queuing if needed
      if (scheduleData.isQueued) {
        await this.addToQueue(campaignId, scheduleData.priority || 'normal');
      }

      // Auto-activation logic
      if (scheduleData.autoActivate) {
        await this.scheduleAutoActivation(campaignId, scheduleData);
      }

      await campaign.save();
      return campaign;
    } catch (error) {
      throw new Error(`Failed to schedule campaign: ${error.message}`);
    }
  }

  /**
   * Add campaign to queue
   */
  async addToQueue(campaignId, priority = 'normal') {
    try {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityValue = priorityOrder[priority] || 2;

      // Get current queue length
      const queueLength = await Campaign.countDocuments({
        'schedule.isQueued': true
      });

      // Add to queue with position
      await Campaign.findByIdAndUpdate(campaignId, {
        'schedule.isQueued': true,
        'schedule.queuePosition': queueLength + 1,
        'schedule.priority': priority
      });

      // Reorder queue based on priority
      await this.reorderQueue();
    } catch (error) {
      throw new Error(`Failed to add campaign to queue: ${error.message}`);
    }
  }

  /**
   * Remove campaign from queue
   */
  async removeFromQueue(campaignId) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign || !campaign.schedule.isQueued) {
        return;
      }

      const queuePosition = campaign.schedule.queuePosition;

      // Remove from queue
      await Campaign.findByIdAndUpdate(campaignId, {
        'schedule.isQueued': false,
        'schedule.queuePosition': null
      });

      // Shift other campaigns in queue
      await Campaign.updateMany(
        {
          'schedule.isQueued': true,
          'schedule.queuePosition': { $gt: queuePosition }
        },
        {
          $inc: { 'schedule.queuePosition': -1 }
        }
      );
    } catch (error) {
      throw new Error(`Failed to remove campaign from queue: ${error.message}`);
    }
  }

  /**
   * Reorder queue based on priority
   */
  async reorderQueue() {
    try {
      const queuedCampaigns = await Campaign.find({
        'schedule.isQueued': true
      }).sort({
        'schedule.priority': -1,
        'schedule.queuePosition': 1
      });

      // Update queue positions
      for (let i = 0; i < queuedCampaigns.length; i++) {
        await Campaign.findByIdAndUpdate(queuedCampaigns[i]._id, {
          'schedule.queuePosition': i + 1
        });
      }
    } catch (error) {
      throw new Error(`Failed to reorder queue: ${error.message}`);
    }
  }

  /**
   * Move campaign in queue
   */
  async moveInQueue(campaignId, newPosition) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign || !campaign.schedule.isQueued) {
        throw new Error('Campaign is not in queue');
      }

      const currentPosition = campaign.schedule.queuePosition;
      const maxPosition = await Campaign.countDocuments({
        'schedule.isQueued': true
      });

      if (newPosition < 1 || newPosition > maxPosition) {
        throw new Error('Invalid queue position');
      }

      if (newPosition === currentPosition) {
        return campaign;
      }

      // Move other campaigns
      if (newPosition > currentPosition) {
        // Moving down: shift campaigns up
        await Campaign.updateMany(
          {
            'schedule.isQueued': true,
            'schedule.queuePosition': { $gt: currentPosition, $lte: newPosition }
          },
          {
            $inc: { 'schedule.queuePosition': -1 }
          }
        );
      } else {
        // Moving up: shift campaigns down
        await Campaign.updateMany(
          {
            'schedule.isQueued': true,
            'schedule.queuePosition': { $gte: newPosition, $lt: currentPosition }
          },
          {
            $inc: { 'schedule.queuePosition': 1 }
          }
        );
      }

      // Update campaign position
      await Campaign.findByIdAndUpdate(campaignId, {
        'schedule.queuePosition': newPosition
      });

      return await Campaign.findById(campaignId);
    } catch (error) {
      throw new Error(`Failed to move campaign in queue: ${error.message}`);
    }
  }

  /**
   * Calculate next occurrence for recurring campaigns
   */
  calculateNextOccurrence(startDate, recurrenceDetails) {
    const start = new Date(startDate);
    const now = new Date();
    let nextDate = new Date(start);

    while (nextDate <= now) {
      switch (recurrenceDetails.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + (recurrenceDetails.frequency || 1));
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (7 * (recurrenceDetails.frequency || 1)));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + (recurrenceDetails.frequency || 1));
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + (recurrenceDetails.frequency || 1));
          break;
        default:
          nextDate.setDate(nextDate.getDate() + 1);
      }

      // Check if we've exceeded max occurrences
      if (recurrenceDetails.endAfterOccurrences && 
          this.getOccurrenceCount(start, nextDate, recurrenceDetails) >= recurrenceDetails.endAfterOccurrences) {
        return null;
      }

      // Check if we've passed the end date
      if (recurrenceDetails.endOnDate && nextDate > new Date(recurrenceDetails.endOnDate)) {
        return null;
      }
    }

    return nextDate;
  }

  /**
   * Get occurrence count between two dates
   */
  getOccurrenceCount(startDate, endDate, recurrenceDetails) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    let current = new Date(start);

    while (current <= end) {
      count++;
      
      switch (recurrenceDetails.frequency) {
        case 'daily':
          current.setDate(current.getDate() + (recurrenceDetails.frequency || 1));
          break;
        case 'weekly':
          current.setDate(current.getDate() + (7 * (recurrenceDetails.frequency || 1)));
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + (recurrenceDetails.frequency || 1));
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + (recurrenceDetails.frequency || 1));
          break;
        default:
          current.setDate(current.getDate() + 1);
      }
    }

    return count;
  }

  /**
   * Schedule auto-activation for a campaign
   */
  async scheduleAutoActivation(campaignId, scheduleData) {
    try {
      const activationTime = new Date(scheduleData.startDate);
      if (scheduleData.activationDelay) {
        activationTime.setMinutes(activationTime.getMinutes() + scheduleData.activationDelay);
      }

      // Schedule activation
      setTimeout(async () => {
        try {
          await this.autoActivateCampaign(campaignId);
        } catch (error) {
          console.error(`Auto-activation failed for campaign ${campaignId}:`, error);
        }
      }, activationTime.getTime() - Date.now());

      // Schedule deactivation if specified
      if (scheduleData.autoDeactivate && scheduleData.endDate) {
        const deactivationTime = new Date(scheduleData.endDate);
        if (scheduleData.deactivationDelay) {
          deactivationTime.setMinutes(deactivationTime.getMinutes() + scheduleData.deactivationDelay);
        }

        setTimeout(async () => {
          try {
            await this.autoDeactivateCampaign(campaignId);
          } catch (error) {
            console.error(`Auto-deactivation failed for campaign ${campaignId}:`, error);
          }
        }, deactivationTime.getTime() - Date.now());
      }
    } catch (error) {
      throw new Error(`Failed to schedule auto-activation: ${error.message}`);
    }
  }

  /**
   * Auto-activate campaign
   */
  async autoActivateCampaign(campaignId) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Check for conflicts
      const conflicts = await this.checkForConflicts(campaign);
      if (conflicts.length > 0) {
        await this.resolveConflicts(campaign, conflicts);
      }

      // Activate campaign
      campaign.schedule.isActive = true;
      campaign.schedule.isScheduled = false;
      campaign.schedule.isQueued = false;
      campaign.schedule.queuePosition = null;

      // Update occurrence count for recurring campaigns
      if (campaign.schedule.isRecurring) {
        campaign.schedule.currentOccurrences = (campaign.schedule.currentOccurrences || 0) + 1;
        campaign.schedule.lastOccurrence = new Date().toISOString();
        
        // Calculate next occurrence
        if (campaign.schedule.recurrenceDetails) {
          campaign.schedule.nextOccurrence = this.calculateNextOccurrence(
            campaign.schedule.startDate,
            campaign.schedule.recurrenceDetails
          );
        }
      }

      await campaign.save();
      return campaign;
    } catch (error) {
      throw new Error(`Failed to auto-activate campaign: ${error.message}`);
    }
  }

  /**
   * Auto-deactivate campaign
   */
  async autoDeactivateCampaign(campaignId) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.schedule.isActive = false;
      campaign.schedule.isScheduled = false;

      await campaign.save();
      return campaign;
    } catch (error) {
      throw new Error(`Failed to auto-deactivate campaign: ${error.message}`);
    }
  }

  /**
   * Check for scheduling conflicts
   */
  async checkForConflicts(campaign) {
    try {
      const conflicts = await Campaign.find({
        _id: { $ne: campaign._id },
        'schedule.isActive': true,
        'schedule.placement': campaign.schedule.placement,
        $or: [
          {
            'schedule.startDate': { $lte: campaign.schedule.endDate },
            'schedule.endDate': { $gte: campaign.schedule.startDate }
          },
          {
            'schedule.startDate': { $lte: campaign.schedule.startDate },
            'schedule.endDate': { $gte: campaign.schedule.startDate }
          }
        ]
      });

      return conflicts;
    } catch (error) {
      throw new Error(`Failed to check for conflicts: ${error.message}`);
    }
  }

  /**
   * Resolve scheduling conflicts
   */
  async resolveConflicts(campaign, conflicts) {
    try {
      for (const conflict of conflicts) {
        switch (campaign.schedule.conflictResolution) {
          case 'skip':
            // Skip this campaign activation
            return false;
          case 'replace':
            // Deactivate conflicting campaign
            await this.autoDeactivateCampaign(conflict._id);
            break;
          case 'queue':
            // Queue this campaign
            await this.addToQueue(campaign._id, campaign.schedule.priority);
            return false;
          case 'overlap':
            // Allow overlap (no action needed)
            break;
          default:
            // Default to queuing
            await this.addToQueue(campaign._id, campaign.schedule.priority);
            return false;
        }
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to resolve conflicts: ${error.message}`);
    }
  }

  /**
   * Get queued campaigns
   */
  async getQueuedCampaigns() {
    try {
      return await Campaign.find({
        'schedule.isQueued': true
      }).sort({
        'schedule.queuePosition': 1
      });
    } catch (error) {
      throw new Error(`Failed to get queued campaigns: ${error.message}`);
    }
  }

  /**
   * Get scheduled campaigns by date range
   */
  async getScheduledCampaignsByDate(startDate, endDate) {
    try {
      return await Campaign.find({
        'schedule.isScheduled': true,
        $or: [
          {
            'schedule.startDate': { $lte: endDate },
            'schedule.endDate': { $gte: startDate }
          },
          {
            'schedule.startDate': { $gte: startDate, $lte: endDate }
          }
        ]
      }).sort({
        'schedule.startDate': 1
      });
    } catch (error) {
      throw new Error(`Failed to get scheduled campaigns: ${error.message}`);
    }
  }

  /**
   * Get campaigns with conflicts
   */
  async getCampaignsWithConflicts() {
    try {
      const campaigns = await Campaign.find({
        'schedule.isScheduled': true
      });

      const campaignsWithConflicts = [];
      for (const campaign of campaigns) {
        const conflicts = await this.checkForConflicts(campaign);
        if (conflicts.length > 0) {
          campaignsWithConflicts.push({
            campaign,
            conflicts
          });
        }
      }

      return campaignsWithConflicts;
    } catch (error) {
      throw new Error(`Failed to get campaigns with conflicts: ${error.message}`);
    }
  }

  /**
   * Process campaign queue
   */
  async processQueue() {
    try {
      const queuedCampaigns = await this.getQueuedCampaigns();
      
      for (const campaign of queuedCampaigns) {
        // Check if it's time to activate
        if (new Date() >= new Date(campaign.schedule.startDate)) {
          await this.autoActivateCampaign(campaign._id);
        }
      }
    } catch (error) {
      throw new Error(`Failed to process queue: ${error.message}`);
    }
  }
}

export default new CampaignSchedulingService();
