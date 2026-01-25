export declare const UserRole: {
    readonly USER: "USER";
    readonly ADMIN: "ADMIN";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const UserTier: {
    readonly Member: "Member";
    readonly Founder: "Founder";
    readonly VIP: "VIP";
};
export type UserTier = (typeof UserTier)[keyof typeof UserTier];
export declare const OrderStatus: {
    readonly PENDING: "PENDING";
    readonly PAID: "PAID";
    readonly SHIPPED: "SHIPPED";
    readonly CANCELLED: "CANCELLED";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const StripePaymentStatus: {
    readonly PENDING: "PENDING";
    readonly PAID: "PAID";
    readonly FAILED: "FAILED";
};
export type StripePaymentStatus = (typeof StripePaymentStatus)[keyof typeof StripePaymentStatus];
export declare const CommissionStatus: {
    readonly PENDING: "PENDING";
    readonly PAID: "PAID";
    readonly FAILED: "FAILED";
};
export type CommissionStatus = (typeof CommissionStatus)[keyof typeof CommissionStatus];
//# sourceMappingURL=enums.d.ts.map