import asyncHandler from '../utils/asyncHandlers.js';

//  Check the user role to give access
const checkVendorRole = asyncHandler(async (req, res) => res.send("vendor route accessed successfully"));

export { checkVendorRole};


