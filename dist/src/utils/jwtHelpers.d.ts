import { JwtPayload, Secret } from "jsonwebtoken";
type ExpiresIn = string | number;
export declare const jwtHelper: {
    generateToken: (payload: string | object | Buffer, secret: Secret, expiresIn: ExpiresIn) => string;
    verifyToken: (token: string, secret: Secret) => JwtPayload;
};
export {};
//# sourceMappingURL=jwtHelpers.d.ts.map