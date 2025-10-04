// validateUser.js
const nameRegex = /^[A-Za-zÀ-ÿ' -]{3,50}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


function validateUser(user, { requireId = true, existingUsers = []  } = {}) {
  const errors = [];
    
  if (!user.id || typeof user.id !== 'number' || user.id <= 0) {
    errors.push('Invalid or missing user ID');
  }

  if (!user.name || typeof user.name !== 'string' || !nameRegex.test(user.name)) {
    errors.push('Invalid or missing user name');
  }

  if (!user.email || !emailRegex.test(user.email)) {
    errors.push('Invalid or missing user email');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
function validateUserIdAndUserEmailExistence(userId, userEmail, existingUsers) {
    const newErrors = [];
 if(existingUsers.some(user =>  user.id === userId)){
    newErrors.push('User with this ID already exists');
  }

   if(existingUsers.some(user =>  user.email === userEmail)) {
    newErrors.push('User with this email already exists');
}


return {
    isValidIdEmail: newErrors.length === 0,
    newErrors: newErrors,
  };
}


module.exports = {validateUser, validateUserIdAndUserEmailExistence}