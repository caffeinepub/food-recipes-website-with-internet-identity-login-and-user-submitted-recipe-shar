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
export type Time = bigint;
export interface ExternalSupportLink {
    url: string;
    displayName: string;
    description?: string;
}
export interface Comment {
    content: string;
    author: Principal;
    timestamp: Time;
}
export type RecipeId = bigint;
export interface Ingredient {
    name: string;
    amount: string;
}
export interface Storefront {
    supportLinks: Array<ExternalSupportLink>;
    products: Array<Product>;
}
export interface Recipe {
    id: RecipeId;
    title: string;
    owner: Principal;
    createdAt: Time;
    description: string;
    likes: Array<Principal>;
    updatedAt: Time;
    steps: Array<string>;
    comments: Array<Comment>;
    photo?: ExternalBlob;
    ingredients: Array<Ingredient>;
}
export interface Product {
    title: string;
    description: string;
    priceDisplay: string;
    checkoutUrl: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(recipeId: RecipeId, content: string, timestamp: Time): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createRecipe(title: string, description: string, ingredients: Array<Ingredient>, steps: Array<string>, photo: ExternalBlob | null): Promise<RecipeId>;
    deleteRecipe(recipeId: RecipeId): Promise<void>;
    deleteStorefront(): Promise<void>;
    getAllRecipes(): Promise<Array<Recipe>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get recent recipes (newest first), optionally excluding recipes by the caller
     * / Public read access - visitors can view recent recipes
     * / When excludeOwn is true and caller is a guest, no filtering is applied
     */
    getRecentRecipes(excludeOwn: boolean): Promise<Array<Recipe>>;
    getRecipe(recipeId: RecipeId): Promise<Recipe>;
    getUserProducts(user: Principal): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRecipes(user: Principal): Promise<Array<Recipe>>;
    getUserStorefront(user: Principal): Promise<Storefront | null>;
    getUserSupportLinks(user: Principal): Promise<Array<ExternalSupportLink>>;
    hasUserLikedRecipe(recipeId: RecipeId): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    likeRecipe(recipeId: RecipeId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveOrUpdateStorefront(storefront: Storefront): Promise<void>;
    unlikeRecipe(recipeId: RecipeId): Promise<void>;
    updateRecipe(recipeId: RecipeId, title: string, description: string, ingredients: Array<Ingredient>, steps: Array<string>, photo: ExternalBlob | null): Promise<void>;
}
