const formatPrice = (val) => `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export const formatCurrency = (amount, currency = 'NGN') => {
    if (typeof amount !== 'number') return '₦0.00';
    return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

export const formatDateTime = (dateString, timeString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        return timeString ? `${dateStr} at ${timeString}` : dateStr;
    } catch {
        return dateString;
    }
};

export const formatGroupDate = (groupKey, groupBy) => {
    try {
        let date;

        // Handle different groupKey formats
        if (groupBy === 'month' && groupKey.includes('-') && !groupKey.includes('-01')) {
            // Handle yyyy-MM format for months
            date = new Date(groupKey + '-01');
        } else {
            date = new Date(groupKey);
        }

        if (isNaN(date.getTime())) return groupKey;

        switch (groupBy) {
            case 'day':
                return date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'week':
                const weekEnd = new Date(date);
                weekEnd.setDate(date.getDate() + 6);
                return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            case 'month':
            default:
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        }
    } catch {
        return groupKey;
    }
};

export default formatPrice;