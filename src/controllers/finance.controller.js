import asyncHandler from '../utils/asyncHandlers.js';

//  Check the user role to give access
const checkFinanceRole = asyncHandler(async (req, res) => res.send("Finance route accessed successfully"));
console.log("Finance route accessed by user");

export { checkFinanceRole};
