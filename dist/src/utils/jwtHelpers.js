import jwt from "jsonwebtoken";
const generateToken = (payload, secret, expiresIn) => {
    const options = {
        algorithm: "HS256",
        expiresIn: expiresIn,
    };
    return jwt.sign(payload, secret, options);
};
const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};
export const jwtHelper = {
    generateToken,
    verifyToken,
};
//# sourceMappingURL=jwtHelpers.js.map