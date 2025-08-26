import User from '../mongoDB/models/User.js';
import Campaign from '../mongoDB/models/Campaign.js';

class CampaignTargetingService {
    /**
     * Check if a user matches campaign targeting criteria
     */
    async checkUserTargeting(campaignId, userId) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const user = await User.findById(userId);
            if (!user) {
                return false; // Guest users
            }

            const targeting = campaign.targeting;
            if (!targeting) {
                return true; // No targeting restrictions
            }

            // Check each targeting criterion
            if (!this.checkUserRoleTargeting(targeting, user)) return false;
            if (!this.checkUserBehaviorTargeting(targeting, user)) return false;
            if (!this.checkUserAccountTargeting(targeting, user)) return false;
            if (!this.checkGeographicTargeting(targeting, user)) return false;
            if (!this.checkDeviceTargeting(targeting, user)) return false;
            if (!this.checkBehavioralTargeting(targeting, user)) return false;
            if (!this.checkFrequencyTargeting(targeting, user)) return false;
            if (!this.checkTimingTargeting(targeting, user)) return false;
            if (!this.checkCustomAttributeTargeting(targeting, user)) return false;

            return true;
        } catch (error) {
            console.error('Error checking user targeting:', error);
            return false;
        }
    }

    /**
     * Check user role targeting
     */
    checkUserRoleTargeting(targeting, user) {
        // Check included roles
        if (targeting.userRoles && targeting.userRoles.length > 0) {
            if (!targeting.userRoles.includes(user.role)) {
                return false;
            }
        }

        // Check excluded roles
        if (targeting.excludeUserRoles && targeting.excludeUserRoles.length > 0) {
            if (targeting.excludeUserRoles.includes(user.role)) {
                return false;
            }
        }

        // Check role groups
        if (targeting.userRoleGroups && targeting.userRoleGroups.length > 0) {
            const userRoleGroup = this.getUserRoleGroup(user.role);
            if (!targeting.userRoleGroups.includes(userRoleGroup)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check user behavior targeting (new vs returning users)
     */
    checkUserBehaviorTargeting(targeting, user) {
        // Check new vs returning user targeting
        if (targeting.newUsers !== undefined || targeting.returningUsers !== undefined) {
            const isNewUser = this.isNewUser(user);

            if (targeting.newUsers === true && !isNewUser) {
                return false;
            }

            if (targeting.returningUsers === true && isNewUser) {
                return false;
            }
        }

        // Check user activity level
        if (targeting.userActivityLevel) {
            const userActivityLevel = this.getUserActivityLevel(user);
            if (userActivityLevel !== targeting.userActivityLevel) {
                return false;
            }
        }

        // Check user engagement score
        if (targeting.userEngagementScore) {
            const userEngagementScore = this.getUserEngagementScore(user);
            if (userEngagementScore !== targeting.userEngagementScore) {
                return false;
            }
        }

        // Check user lifetime value
        if (targeting.userLifetimeValue) {
            const userLifetimeValue = this.getUserLifetimeValue(user);
            if (userLifetimeValue !== targeting.userLifetimeValue) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check user account targeting
     */
    checkUserAccountTargeting(targeting, user) {
        // Check account age
        if (targeting.accountAge) {
            const accountAge = this.getAccountAge(user);
            if (accountAge !== targeting.accountAge) {
                return false;
            }
        }

        // Check subscription status
        if (targeting.subscriptionStatus && targeting.subscriptionStatus.length > 0) {
            if (!targeting.subscriptionStatus.includes(user.subscriptionStatus)) {
                return false;
            }
        }

        // Check verification status
        if (targeting.accountVerificationStatus && targeting.accountVerificationStatus.length > 0) {
            const verificationStatus = this.getVerificationStatus(user);
            if (!targeting.accountVerificationStatus.includes(verificationStatus)) {
                return false;
            }
        }

        // Check verified users
        if (targeting.verifiedUsers !== undefined) {
            if (targeting.verifiedUsers && !user.isVerified) {
                return false;
            }
            if (!targeting.verifiedUsers && user.isVerified) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check geographic targeting
     */
    checkGeographicTargeting(targeting, user) {
        if (!user.location) {
            return true; // No location data, allow targeting
        }

        // Check countries
        if (targeting.countries && targeting.countries.length > 0) {
            if (!targeting.countries.includes(user.location.country)) {
                return false;
            }
        }

        // Check cities
        if (targeting.cities && targeting.cities.length > 0) {
            if (!targeting.cities.includes(user.location.city)) {
                return false;
            }
        }

        // Check regions
        if (targeting.regions && targeting.regions.length > 0) {
            if (!targeting.regions.includes(user.location.region)) {
                return false;
            }
        }

        // Check postal codes
        if (targeting.postalCodes && targeting.postalCodes.length > 0) {
            if (!targeting.postalCodes.includes(user.location.postalCode)) {
                return false;
            }
        }

        // Check radius-based targeting
        if (targeting.radius && user.location.latitude && user.location.longitude) {
            // TODO: Implement radius-based location checking
            // This would require the campaign to have a specific location point
        }

        return true;
    }

    /**
     * Check device targeting
     */
    checkDeviceTargeting(targeting, user) {
        if (!user.deviceInfo) {
            return true; // No device data, allow targeting
        }

        // Check device type
        if (targeting.deviceType && targeting.deviceType.length > 0) {
            if (!targeting.deviceType.includes(user.deviceInfo.type)) {
                return false;
            }
        }

        // Check browser
        if (targeting.browser && targeting.browser.length > 0) {
            if (!targeting.browser.includes(user.deviceInfo.browser)) {
                return false;
            }
        }

        // Check operating system
        if (targeting.operatingSystem && targeting.operatingSystem.length > 0) {
            if (!targeting.operatingSystem.includes(user.deviceInfo.os)) {
                return false;
            }
        }

        // Check screen resolution
        if (targeting.screenResolution && targeting.screenResolution.length > 0) {
            const userResolution = `${user.deviceInfo.screenWidth}x${user.deviceInfo.screenHeight}`;
            if (!targeting.screenResolution.includes(userResolution)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check behavioral targeting
     */
    checkBehavioralTargeting(targeting, user) {
        // Check user interests
        if (targeting.userInterests && targeting.userInterests.length > 0) {
            const hasMatchingInterest = user.interests &&
                user.interests.some(interest => targeting.userInterests.includes(interest));
            if (!hasMatchingInterest) {
                return false;
            }
        }

        // Check purchase history
        if (targeting.purchaseHistory && targeting.purchaseHistory.length > 0) {
            const hasMatchingPurchase = user.purchaseHistory &&
                user.purchaseHistory.some(purchase => targeting.purchaseHistory.includes(purchase.category));
            if (!hasMatchingPurchase) {
                return false;
            }
        }

        // Check browsing behavior
        if (targeting.browsingBehavior && targeting.browsingBehavior.length > 0) {
            const userBrowsingBehavior = this.getBrowsingBehavior(user);
            if (!targeting.browsingBehavior.includes(userBrowsingBehavior)) {
                return false;
            }
        }

        // Check last activity
        if (targeting.lastActivity) {
            const userLastActivity = this.getLastActivity(user);
            if (userLastActivity !== targeting.lastActivity) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check frequency targeting
     */
    checkFrequencyTargeting(targeting, user) {
        // Check max frequency
        if (targeting.maxFrequency) {
            const userImpressions = this.getUserCampaignImpressions(user.id, targeting.campaignId);
            if (userImpressions >= targeting.maxFrequency) {
                return false;
            }
        }

        // Check minimum time between views
        if (targeting.minTimeBetweenViews) {
            const lastViewTime = this.getLastCampaignView(user.id, targeting.campaignId);
            if (lastViewTime) {
                const timeSinceLastView = Date.now() - lastViewTime;
                const minTimeMs = targeting.minTimeBetweenViews * 60 * 1000; // Convert minutes to milliseconds
                if (timeSinceLastView < minTimeMs) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check timing targeting
     */
    checkTimingTargeting(targeting, user) {
        const now = new Date();

        // Check time of day
        if (targeting.timeOfDay && targeting.timeOfDay.length > 0) {
            const currentTimeOfDay = this.getTimeOfDay(now);
            if (!targeting.timeOfDay.includes(currentTimeOfDay)) {
                return false;
            }
        }

        // Check day of week
        if (targeting.dayOfWeek && targeting.dayOfWeek.length > 0) {
            const currentDayOfWeek = this.getDayOfWeek(now);
            if (!targeting.dayOfWeek.includes(currentDayOfWeek)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check custom attribute targeting
     */
    checkCustomAttributeTargeting(targeting, user) {
        if (!targeting.customAttributes || targeting.customAttributes.length === 0) {
            return true;
        }

        for (const attribute of targeting.customAttributes) {
            const userValue = user.customAttributes?.[attribute.key];
            if (!this.evaluateCustomAttribute(attribute, userValue)) {
                return false;
            }
        }

        return true;
    }

    // ===== HELPER METHODS =====

    /**
     * Get user role group based on role
     */
    getUserRoleGroup(userRole) {
        const roleGroups = {
            guest: 'visitor',
            user: 'standard',
            premium_user: 'premium',
            admin: 'administrative',
            moderator: 'administrative',
            content_creator: 'creator',
            business_owner: 'business',
            enterprise_user: 'enterprise'
        };
        return roleGroups[userRole] || 'standard';
    }

    /**
     * Check if user is new (less than 30 days old)
     */
    isNewUser(user) {
        const userAge = Date.now() - new Date(user.createdAt).getTime();
        const daysOld = userAge / (1000 * 60 * 60 * 24);
        return daysOld <= 30;
    }

    /**
     * Get user activity level based on recent activity
     */
    getUserActivityLevel(user) {
        const lastActivity = user.lastActivity || user.updatedAt;
        const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceActivity <= 1) return 'active';
        if (daysSinceActivity <= 7) return 'moderate';
        if (daysSinceActivity <= 30) return 'inactive';
        return 'dormant';
    }

    /**
     * Get user engagement score based on various metrics
     */
    getUserEngagementScore(user) {
        const engagementMetrics = [
            user.loginCount || 0,
            user.pageViews || 0,
            user.timeOnSite || 0,
            user.interactions || 0
        ];

        const totalEngagement = engagementMetrics.reduce((sum, metric) => sum + metric, 0);

        if (totalEngagement >= 100) return 'premium';
        if (totalEngagement >= 50) return 'high';
        if (totalEngagement >= 20) return 'medium';
        return 'low';
    }

    /**
     * Get user lifetime value category
     */
    getUserLifetimeValue(user) {
        const totalSpent = user.totalSpent || 0;

        if (totalSpent >= 1000) return 'premium';
        if (totalSpent >= 500) return 'high';
        if (totalSpent >= 100) return 'medium';
        return 'low';
    }

    /**
     * Get account age category
     */
    getAccountAge(user) {
        const userAge = Date.now() - new Date(user.createdAt).getTime();
        const daysOld = userAge / (1000 * 60 * 60 * 24);

        if (daysOld <= 7) return 'new';
        if (daysOld <= 90) return 'young';
        if (daysOld <= 365) return 'established';
        return 'veteran';
    }

    /**
     * Get verification status
     */
    getVerificationStatus(user) {
        if (user.isPhoneVerified && user.isEmailVerified) return 'fully_verified';
        if (user.isPhoneVerified) return 'phone_verified';
        if (user.isEmailVerified) return 'email_verified';
        return 'unverified';
    }

    /**
     * Get browsing behavior category
     */
    getBrowsingBehavior(user) {
        const visitFrequency = user.visitFrequency || 0;
        const cartAbandonmentRate = user.cartAbandonmentRate || 0;
        const timeOnSite = user.avgTimeOnSite || 0;

        if (visitFrequency >= 10 && timeOnSite >= 300) return 'power_user';
        if (cartAbandonmentRate >= 0.7) return 'cart_abandoner';
        if (visitFrequency >= 5) return 'frequent_visitor';
        if (timeOnSite >= 180) return 'window_shopper';
        return 'casual_browser';
    }

    /**
     * Get last activity category
     */
    getLastActivity(user) {
        const lastActivity = user.lastActivity || user.updatedAt;
        const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceActivity <= 1) return 'recent';
        if (daysSinceActivity <= 7) return 'moderate';
        return 'inactive';
    }

    /**
     * Get time of day
     */
    getTimeOfDay(date) {
        const hour = date.getHours();

        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * Get day of week
     */
    getDayOfWeek(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    /**
     * Evaluate custom attribute comparison
     */
    evaluateCustomAttribute(attribute, userValue) {
        if (!userValue) return false;

        switch (attribute.operator) {
            case 'equals':
                return userValue === attribute.value;
            case 'not_equals':
                return userValue !== attribute.value;
            case 'contains':
                return userValue.includes(attribute.value);
            case 'not_contains':
                return !userValue.includes(attribute.value);
            case 'greater_than':
                return parseFloat(userValue) > parseFloat(attribute.value);
            case 'less_than':
                return parseFloat(userValue) < parseFloat(attribute.value);
            case 'greater_than_or_equal':
                return parseFloat(userValue) >= parseFloat(attribute.value);
            case 'less_than_or_equal':
                return parseFloat(userValue) <= parseFloat(attribute.value);
            case 'in':
                return attribute.value.split(',').includes(userValue);
            case 'not_in':
                return !attribute.value.split(',').includes(userValue);
            default:
                return false;
        }
    }

    /**
     * Get user campaign impressions (placeholder - would integrate with analytics)
     */
    getUserCampaignImpressions(userId, campaignId) {
        // TODO: Integrate with analytics service
        return 0;
    }

    /**
     * Get last campaign view time (placeholder - would integrate with analytics)
     */
    getLastCampaignView(userId, campaignId) {
        // TODO: Integrate with analytics service
        return null;
    }

    /**
     * Get targeted campaigns for a user
     */
    async getTargetedCampaignsForUser(userId, placement = null, type = null) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return [];
            }

            // Get active campaigns
            const query = { 'schedule.isActive': true };
            if (placement) query.placement = placement;
            if (type) query.type = type;

            const campaigns = await Campaign.find(query);
            const targetedCampaigns = [];

            for (const campaign of campaigns) {
                const isTargeted = await this.checkUserTargeting(campaign._id, userId);
                if (isTargeted) {
                    targetedCampaigns.push(campaign);
                }
            }

            // Sort by priority and return
            return targetedCampaigns.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        } catch (error) {
            console.error('Error getting targeted campaigns:', error);
            return [];
        }
    }
}

export default new CampaignTargetingService();
