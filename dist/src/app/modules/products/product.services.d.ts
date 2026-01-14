import { Prisma } from "../../../generated/prisma/client";
interface GetProductsQuery {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export declare const productServices: {
    getAllProducts: (query: GetProductsQuery) => Promise<{
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            desc: string;
            sizes: import("@prisma/client/runtime/client").JsonValue;
            details: string;
            references: import("@prisma/client/runtime/client").JsonValue;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getSingleProduct: (id: number) => Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
    }>;
    createProduct: (data: Prisma.ProductCreateInput) => Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
    }>;
    updateProduct: (id: number, data: Prisma.ProductUpdateInput) => Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
    }>;
    deleteProduct: (id: number) => Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
    }>;
};
export {};
//# sourceMappingURL=product.services.d.ts.map