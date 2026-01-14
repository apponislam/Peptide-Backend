import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly Product: "Product";
    readonly CheckoutSession: "CheckoutSession";
    readonly Order: "Order";
    readonly Commission: "Commission";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly name: "name";
    readonly password: "password";
    readonly referralCode: "referralCode";
    readonly tier: "tier";
    readonly role: "role";
    readonly storeCredit: "storeCredit";
    readonly referralCount: "referralCount";
    readonly referrerId: "referrerId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const ProductScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly sizes: "sizes";
    readonly desc: "desc";
    readonly details: "details";
    readonly references: "references";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum];
export declare const CheckoutSessionScalarFieldEnum: {
    readonly id: "id";
    readonly sessionId: "sessionId";
    readonly userId: "userId";
    readonly items: "items";
    readonly originalSubtotal: "originalSubtotal";
    readonly discountedSubtotal: "discountedSubtotal";
    readonly discount: "discount";
    readonly shipping: "shipping";
    readonly storeCreditsApplied: "storeCreditsApplied";
    readonly total: "total";
    readonly shippingName: "shippingName";
    readonly shippingAddress: "shippingAddress";
    readonly status: "status";
    readonly orderId: "orderId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CheckoutSessionScalarFieldEnum = (typeof CheckoutSessionScalarFieldEnum)[keyof typeof CheckoutSessionScalarFieldEnum];
export declare const OrderScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly items: "items";
    readonly originalSubtotal: "originalSubtotal";
    readonly subtotal: "subtotal";
    readonly discount: "discount";
    readonly shipping: "shipping";
    readonly storeCreditsApplied: "storeCreditsApplied";
    readonly total: "total";
    readonly shippingName: "shippingName";
    readonly shippingAddress: "shippingAddress";
    readonly stripeSessionId: "stripeSessionId";
    readonly stripePaymentIntentId: "stripePaymentIntentId";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum];
export declare const CommissionScalarFieldEnum: {
    readonly id: "id";
    readonly referrerId: "referrerId";
    readonly buyerId: "buyerId";
    readonly orderId: "orderId";
    readonly amount: "amount";
    readonly createdAt: "createdAt";
};
export type CommissionScalarFieldEnum = (typeof CommissionScalarFieldEnum)[keyof typeof CommissionScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: "JsonNull";
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: "DbNull";
    readonly JsonNull: "JsonNull";
    readonly AnyNull: "AnyNull";
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map