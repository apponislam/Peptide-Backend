export declare function sendEmail(to: string | string[], subject: string, html: string): Promise<{
    success: boolean;
    data: import("resend").CreateEmailResponse;
    error?: never;
} | {
    success: boolean;
    error: any;
    data?: never;
}>;
export default sendEmail;
//# sourceMappingURL=sendEmail.d.ts.map