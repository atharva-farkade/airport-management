import {airplanes} from "../constants.js"

export const getAirplanes = (req, res) => {
  return res.status(200).json({
    success: true,
    airplanes
  });
};
