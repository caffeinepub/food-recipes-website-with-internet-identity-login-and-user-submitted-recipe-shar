import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Recipe Management
  public type Ingredient = {
    name : Text;
    amount : Text;
  };

  public type RecipeId = Nat;

  public type Recipe = {
    id : RecipeId;
    owner : Principal;
    title : Text;
    description : Text;
    ingredients : [Ingredient];
    steps : [Text];
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module Recipe {
    public func compare(r1 : Recipe, r2 : Recipe) : Order.Order {
      Text.compare(r1.title, r2.title);
    };
  };

  var nextRecipeId : RecipeId = 1;

  let recipes = Map.empty<RecipeId, Recipe>();

  public shared ({ caller }) func createRecipe(title : Text, description : Text, ingredients : [Ingredient], steps : [Text]) : async RecipeId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create recipes");
    };

    let newRecipeId = nextRecipeId;
    nextRecipeId += 1;

    let now = Time.now();
    let newRecipe : Recipe = {
      id = newRecipeId;
      owner = caller;
      title;
      description;
      ingredients;
      steps;
      createdAt = now;
      updatedAt = now;
    };

    recipes.add(newRecipeId, newRecipe);
    newRecipeId;
  };

  public shared ({ caller }) func updateRecipe(recipeId : RecipeId, title : Text, description : Text, ingredients : [Ingredient], steps : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update recipes");
    };

    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?existingRecipe) {
        if (existingRecipe.owner != caller) {
          Runtime.trap("Unauthorized: Only the recipe's author can update the recipe");
        };

        let updatedRecipe : Recipe = {
          id = recipeId;
          owner = existingRecipe.owner;
          title;
          description;
          ingredients;
          steps;
          createdAt = existingRecipe.createdAt;
          updatedAt = Time.now();
        };

        recipes.add(recipeId, updatedRecipe);
      };
    };
  };

  public shared ({ caller }) func deleteRecipe(recipeId : RecipeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete recipes");
    };

    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) {
        if (recipe.owner != caller) {
          Runtime.trap("Unauthorized: Only recipe owner can delete");
        };
        recipes.remove(recipeId);
      };
    };
  };

  public query ({ caller }) func getRecipe(recipeId : RecipeId) : async Recipe {
    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) { recipe };
    };
  };

  public query ({ caller }) func getAllRecipes() : async [Recipe] {
    recipes.values().toArray().sort();
  };

  public query ({ caller }) func getUserRecipes(user : Principal) : async [Recipe] {
    recipes.values().filter(func(recipe) { recipe.owner == user }).toArray();
  };
};
