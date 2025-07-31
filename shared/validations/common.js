const isEmail = email => /.+@.+\..+/.test(email);
const isStrongPassword = pwd => pwd.length >= 8;
const isValidPhone = phone => /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
const isValidPrice = price => typeof price === 'number' && price >= 0;
const isValidRating = rating => Number.isInteger(rating) && rating >= 1 && rating <= 5;
const isValidUrl = url => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
const isValidDate = date => !isNaN(Date.parse(date));
const isValidObjectId = id => /^[0-9a-fA-F]{24}$/.test(id);

// Business-specific validations
const isValidCategory = (category, validCategories) => validCategories.includes(category);
const isValidBookingStatus = status => ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status);
const isValidPaymentMethod = method => ['cash', 'card', 'bank_transfer', 'online'].includes(method);

module.exports = {
    isEmail,
    isStrongPassword,
    isValidPhone,
    isValidPrice,
    isValidRating,
    isValidUrl,
    isValidDate,
    isValidObjectId,
    isValidCategory,
    isValidBookingStatus,
    isValidPaymentMethod
}; 