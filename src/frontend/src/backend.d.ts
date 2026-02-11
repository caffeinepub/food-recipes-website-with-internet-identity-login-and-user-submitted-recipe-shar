import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type RecipeId = bigint;
export type Time = bigint;
export interface Recipe {
    id: RecipeId;
    title: string;
    owner: Principal;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    steps: Array<string>;
    ingredients: Array<Ingredient>;
}
export interface Ingredient {
    name: string;
    amount: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createRecipe(title: string, description: string, ingredients: Array<Ingredient>, steps: Array<string>): Promise<RecipeId>;
    deleteRecipe(recipeId: RecipeId): Promise<void>;
    getAllRecipes(): Promise<Array<Recipe>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRecipe(recipeId: RecipeId): Promise<Recipe>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRecipes(user: Principal): Promise<Array<Recipe>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateRecipe(recipeId: RecipeId, title: string, description: string, ingredients: Array<Ingredient>, steps: Array<string>): Promise<void>;
}
