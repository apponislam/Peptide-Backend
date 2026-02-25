import { prisma } from "../../lib/prisma";

const PRODUCTS = [
    {
        id: 17,
        name: "BAC Water 10mL",
        sizes: [{ mg: 10, price: 12, quantity: 397 }],
        desc: "Sterile bacteriostatic water for research.",
        details: "Bacteriostatic Water (10mL) is sterile water containing 0.9% benzyl alcohol used for reconstituting multiple research peptide vials.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/", title: "PubMed Research Database" }],
        coa: {
            url: "/uploads/coa/coa-249933-3493.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-937078-8430.webp",
    },
    {
        id: 16,
        name: "BAC Water 3mL",
        sizes: [{ mg: 3, price: 6, quantity: 497 }],
        desc: "Sterile bacteriostatic water for research.",
        details: "Bacteriostatic Water (3mL) is sterile water containing 0.9% benzyl alcohol used for reconstituting research peptides.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/", title: "PubMed Research Database" }],
        coa: null,
        image: "/uploads/product-images/product-018535-5860.webp",
    },
    {
        id: 15,
        name: "PT-141",
        sizes: [{ mg: 10, price: 46, quantity: 63 }],
        desc: "Melanocortin receptor agonist for research.",
        details: "PT-141 is a synthetic research peptide used in laboratory settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/16839319/", title: "Effect on subjective sexual response in premenopausal women with sexual arousal disorder by bremelanotide" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-994399-38.webp",
    },
    {
        id: 14,
        name: "Glutathione",
        sizes: [{ mg: 1500, price: 89, quantity: 146 }],
        desc: "Antioxidant tripeptide for research.",
        details: "Glutathione is a synthetic tripeptide compound used in laboratory research.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/36707132/", title: "The antioxidant glutathione" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-028160-1131.webp",
    },
    {
        id: 13,
        name: "Epithalon",
        sizes: [{ mg: 10, price: 45, quantity: 91 }],
        desc: "Pineal tetrapeptide for research.",
        details: "Epithalon is a synthetic tetrapeptide (4 amino acids) used in laboratory research applications.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/40141333/", title: "Overview of Epitalon-Highly Bioactive Pineal Tetrapeptide with Promising Properties" }],
        coa: {
            url: "/uploads/coa/coa-431947-51.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-983010-4836.webp",
    },
    {
        id: 12,
        name: "SLU-PP-322",
        sizes: [{ mg: 5, price: 89, quantity: 40 }],
        desc: "ERR agonist for metabolic research.",
        details: "SLU-PP-322 is a synthetic research peptide used in laboratory settings for academic investigation.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/37739806/", title: "A Synthetic ERR Agonist Alleviates Metabolic Syndrome" }],
        coa: {
            url: "/uploads/coa/coa-899237-77.webp",
            size: 7005604,
            filename: "1547 S 2120 E-5.jpg",
            mimetype: "image/webp",
        },
        image: "/uploads/product-images/product-899134-3614.webp",
    },
    {
        id: 11,
        name: "Semax",
        sizes: [{ mg: 11, price: 43, quantity: 85 }],
        desc: "ACTH-derived heptapeptide for research.",
        details: "Semax is a synthetic heptapeptide (7 amino acids) used in laboratory research settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/32580520/", title: "Novel insights into protective properties of ACTH(4-7)PGP semax peptide at transcriptome level following cerebral ischemia-reperfusion" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-065284-6742.webp",
    },
    {
        id: 10,
        name: "MOTS-c",
        sizes: [{ mg: 10, price: 49, quantity: 68 }],
        desc: "Mitochondrial peptide for metabolism research.",
        details: "MOTS-c is a synthetic research peptide used in laboratory settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/25738459/", title: "The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis and reduces obesity and insulin resistance" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-076926-9142.webp",
    },
    {
        id: 9,
        name: "TB-500",
        sizes: [{ mg: 10, price: 69, quantity: 55 }],
        desc: "Thymosin beta-4 analog for research.",
        details: "TB-500 (Thymosin Beta-4 analog) is a synthetic peptide composed of 43 amino acids used in laboratory research settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/23050815/", title: "The regenerative peptide thymosin β4 accelerates the rate of dermal healing in preclinical animal models and in patients" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-094420-1541.webp",
    },
    {
        id: 8,
        name: "Melanotan I",
        sizes: [{ mg: 10, price: 39, quantity: 88 }],
        desc: "Alpha-MSH analog for research.",
        details: "Melanotan I is a synthetic research peptide analog used in laboratory settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/16293341/", title: "Effect of Melanotan on melanin synthesis in humans with MC1R variant alleles" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-105632-867.webp",
    },
    {
        id: 7,
        name: "GHK-Cu",
        sizes: [{ mg: 100, price: 67, quantity: 78 }],
        desc: "Copper peptide complex for research.",
        details: "GHK-Cu is a synthetic copper tripeptide complex used in laboratory research.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/3169264/", title: "Stimulation of collagen synthesis in fibroblast cultures by tripeptide-copper complex" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-125801-6447.webp",
    },
    {
        id: 6,
        name: "NAD+",
        sizes: [{ mg: 100, price: 29, quantity: 198 }],
        desc: "Energy metabolism coenzyme for research.",
        details: "NAD+ (Nicotinamide Adenine Dinucleotide) is a synthetic coenzyme used extensively in laboratory research settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/33353981/", title: "NAD+ metabolism and its roles in cellular processes during ageing" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-143490-3750.webp",
    },
    {
        id: 5,
        name: "Tesamorelin",
        sizes: [{ mg: 10, price: 69, quantity: 45 }],
        desc: "GHRH analog for laboratory research.",
        details: "Tesamorelin is a synthetic research peptide analog used in laboratory settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/20101189/", title: "Effects of tesamorelin in HIV-infected patients with excess abdominal fat" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-161095-5395.webp", // Need correct image for Tesamorelin
    },
    {
        id: 4,
        name: "Ipamorelin",
        sizes: [{ mg: 10, price: 57, quantity: 60 }],
        desc: "Growth hormone secretagogue for research.",
        details: "Ipamorelin is a synthetic pentapeptide used in laboratory research settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/9849822/", title: "Ipamorelin, the first selective growth hormone secretagogue" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-173678-3741.webp",
    },
    {
        id: 3,
        name: "KPV",
        sizes: [{ mg: 10, price: 49, quantity: 100 }],
        desc: "Tripeptide for cellular research.",
        details: "KPV is a synthetic tripeptide used in laboratory research applications.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/18061177/", title: "PepT1-mediated tripeptide KPV uptake reduces intestinal inflammation" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-186453-9174.webp",
    },
    {
        id: 2,
        name: "BPC-157",
        sizes: [{ mg: 10, price: 65, quantity: 75 }],
        desc: "Pentadecapeptide for tissue research.",
        details: "BPC-157 is a synthetic peptide composed of 15 amino acids used in laboratory research settings.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/40131143/", title: "Safety of Intravenous Infusion of BPC157 in Humans" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-197735-4391.webp",
    },
    {
        id: 1,
        name: "Retatrutide",
        sizes: [{ mg: 10, price: 129, quantity: 50 }],
        desc: "Triple receptor agonist for laboratory research.",
        details: "Retatrutide (LY3437943) is a synthetic research peptide used in laboratory settings only.",
        references: [{ url: "https://pubmed.ncbi.nlm.nih.gov/37366315/", title: "Triple-Hormone-Receptor Agonist Retatrutide for Obesity" }],
        coa: {
            url: "/uploads/coa/coa-766060-4142.pdf",
            size: 18810,
            filename: "sample.pdf",
            mimetype: "application/pdf",
        },
        image: "/uploads/product-images/product-212288-2117.webp",
    },
];

// export async function seedProducts() {
//     try {
//         console.log("🔄 Syncing products...");

//         // Clear existing products
//         await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;`;

//         // Create products with the updated structure
//         for (const product of PRODUCTS) {
//             await prisma.product.create({
//                 data: {
//                     name: product.name,
//                     desc: product.desc,
//                     details: product.details,
//                     references: product.references as any,
//                     sizes: product.sizes as any,
//                     coa: (product.coa as any) || null,
//                     inStock: true,
//                 },
//             });
//         }

//         console.log(`✅ ${PRODUCTS.length} products seeded successfully`);

//         // Log sample to verify
//         const sample = await prisma.product.findFirst({
//             where: { name: PRODUCTS[0]?.name },
//         });
//         console.log("📦 Sample product:", {
//             name: sample?.name,
//             sizes: sample?.sizes,
//             hasCOA: !!sample?.coa,
//         });
//     } catch (error) {
//         console.error("❌ Product seeding failed:", error);
//         throw error;
//     }
// }

export async function seedProducts() {
    try {
        console.log("🔄 Syncing products...");

        // Check if products already exist
        const existingCount = await prisma.product.count();

        if (existingCount > 0) {
            console.log(`⚠️ ${existingCount} products already exist, skipping seed...`);
            return;
        }

        // Create products
        for (const product of PRODUCTS) {
            await prisma.product.create({
                data: {
                    name: product.name,
                    desc: product.desc,
                    details: product.details,
                    references: product.references as any,
                    sizes: product.sizes as any,
                    coa: (product.coa as any) || null,
                    inStock: true,
                },
            });
        }

        console.log(`✅ ${PRODUCTS.length} products seeded successfully`);
    } catch (error) {
        console.error("❌ Product seeding failed:", error);
        throw error;
    }
}

export default seedProducts;
