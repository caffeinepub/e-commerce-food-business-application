import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Order {
    id: bigint;
    customerInfo: string;
    status: OrderStatus;
    orderType: OrderType;
    customerId: Principal;
    items: Array<OrderItem>;
}
export interface OrderItem {
    quantity: bigint;
    product: Product;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    description: string;
    category: ProductCategory;
    image?: ExternalBlob;
    price: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum OrderType {
    bulk = "bulk",
    regular = "regular"
}
export enum ProductCategory {
    dryFruits = "dryFruits",
    snacks = "snacks",
    chocolates = "chocolates"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(productInput: Product): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getOrderById(id: bigint): Promise<Order | null>;
    getOrdersByCustomer(customerInfo: string): Promise<Array<Order>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getProductByID(id: bigint): Promise<Product | null>;
    getProductsByCategory(category: ProductCategory): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>, orderType: OrderType, customerInfo: string): Promise<bigint>;
    removeProduct(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(id: bigint, updatedProduct: Product): Promise<void>;
}
