import asyncHandler from '../utils/asyncHandlers.js';

//  Check the user role to give access
const checkUserRole = asyncHandler(async (req, res) => res.send("Admin route accessed successfully"));
console.log("Admin route accessed by user");

export { checkUserRole};

const grantPermission = asyncHandler(async (req, res) => res.send("Staff route accessed successfully"));
export { grantPermission};

