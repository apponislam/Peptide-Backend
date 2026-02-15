interface ProductSize {
    mg: number;
    price: number;
    quantity: number;
}
interface ProductReference {
    url: string;
    title: string;
}
interface ProductCOA {
    batchNumber: string;
    purity: string;
    testedDate: string;
    testedBy: string;
}
interface CreateProductData {
    name: string;
    sizes: ProductSize[];
    desc: string;
    details: string;
    references: ProductReference[];
    coa?: ProductCOA;
}
interface UpdateProductData {
    name?: string;
    sizes?: ProductSize[];
    desc?: string;
    details?: string;
    references?: ProductReference[];
    coa?: ProductCOA;
    isDeleted?: boolean;
}
interface GetAllProductsOptions {
    search?: string;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export declare const productServices: {
    createProduct: (data: CreateProductData) => Promise<{
        id: number;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
        coa: import("@prisma/client/runtime/client").JsonValue | null;
        image: string | null;
        inStock: boolean;
        isDeleted: boolean;
    }>;
    getAllProducts: (options?: GetAllProductsOptions) => Promise<{
        products: {
            id: number;
            name: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            desc: string;
            sizes: import("@prisma/client/runtime/client").JsonValue;
            details: string;
            references: import("@prisma/client/runtime/client").JsonValue;
            coa: import("@prisma/client/runtime/client").JsonValue | null;
            image: string | null;
            inStock: boolean;
            isDeleted: boolean;
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
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
        coa: import("@prisma/client/runtime/client").JsonValue | null;
        image: string | null;
        inStock: boolean;
        isDeleted: boolean;
    }>;
    updateProduct: (id: number, data: UpdateProductData) => Promise<{
        id: number;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
        coa: import("@prisma/client/runtime/client").JsonValue | null;
        image: string | null;
        inStock: boolean;
        isDeleted: boolean;
    }>;
    deleteProduct: (id: number) => Promise<{
        id: number;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
        coa: import("@prisma/client/runtime/client").JsonValue | null;
        image: string | null;
        inStock: boolean;
        isDeleted: boolean;
    }>;
    getDeletedProducts: () => Promise<{
        id: number;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
        coa: import("@prisma/client/runtime/client").JsonValue | null;
        image: string | null;
        inStock: boolean;
        isDeleted: boolean;
    }[]>;
    restoreProduct: (id: number) => Promise<{
        id: number;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        desc: string;
        sizes: import("@prisma/client/runtime/client").JsonValue;
        details: string;
        references: import("@prisma/client/runtime/client").JsonValue;
        coa: import("@prisma/client/runtime/client").JsonValue | null;
        image: string | null;
        inStock: boolean;
        isDeleted: boolean;
    }>;
};
export {};
//# sourceMappingURL=product.services.d.ts.map