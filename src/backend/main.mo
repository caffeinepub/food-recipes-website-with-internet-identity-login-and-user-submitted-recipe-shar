import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  // Attach authorization (access control) module to backend
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Attach storage (blob storage) module to backend
  include MixinStorage();

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
      Runtime.trap("Unauthorized: You can only view your own profile");
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

  public type Comment = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Recipe = {
    id : RecipeId;
    owner : Principal;
    title : Text;
    description : Text;
    ingredients : [Ingredient];
    steps : [Text];
    createdAt : Time.Time;
    updatedAt : Time.Time;
    photo : ?Storage.ExternalBlob;
    likes : [Principal];
    comments : [Comment];
  };

  module Recipe {
    public func compare(r1 : Recipe, r2 : Recipe) : Order.Order {
      Int.compare(r2.createdAt, r1.createdAt); // Reverse order for recent first
    };
  };

  var nextRecipeId : RecipeId = 1;

  let recipes = Map.empty<RecipeId, Recipe>();

  public shared ({ caller }) func createRecipe(title : Text, description : Text, ingredients : [Ingredient], steps : [Text], photo : ?Storage.ExternalBlob) : async RecipeId {
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
      photo;
      likes = [];
      comments = [];
    };

    recipes.add(newRecipeId, newRecipe);
    newRecipeId;
  };

  public shared ({ caller }) func updateRecipe(recipeId : RecipeId, title : Text, description : Text, ingredients : [Ingredient], steps : [Text], photo : ?Storage.ExternalBlob) : async () {
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
          photo;
          likes = existingRecipe.likes;
          comments = existingRecipe.comments;
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

  // Public read access - visitors can view recipes
  public query ({ caller }) func getRecipe(recipeId : RecipeId) : async Recipe {
    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) { recipe };
    };
  };

  // Public read access - visitors can view all recipes
  public query ({ caller }) func getAllRecipes() : async [Recipe] {
    recipes.values().toArray().sort();
  };

  // Public read access - visitors can view user recipes
  public query ({ caller }) func getUserRecipes(user : Principal) : async [Recipe] {
    recipes.values().filter(func(recipe) { recipe.owner == user }).toArray();
  };

  /// Get recent recipes (newest first), optionally excluding recipes by the caller
  /// Public read access - visitors can view recent recipes
  /// When excludeOwn is true and caller is a guest, no filtering is applied
  public query ({ caller }) func getRecentRecipes(excludeOwn : Bool) : async [Recipe] {
    let isAuthenticatedUser = AccessControl.hasPermission(accessControlState, caller, #user);

    recipes.values().toArray().filter(
      func(recipe) {
        // Only exclude own recipes if caller is authenticated and excludeOwn is true
        not (excludeOwn and isAuthenticatedUser and recipe.owner == caller)
      }
    ).sort();
  };

  // Recipe Likes Management (Helper function to check if caller has liked)
  func hasLiked(recipe : Recipe, caller : Principal) : Bool {
    recipe.likes.any(func(author) { author == caller });
  };

  // Likes Management
  public shared ({ caller }) func likeRecipe(recipeId : RecipeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like recipes");
    };

    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) {
        if (hasLiked(recipe, caller)) {
          Runtime.trap("You have already liked this recipe");
        };
        let updatedRecipe = {
          recipe with
          likes = recipe.likes.concat([caller])
        };
        recipes.add(recipeId, updatedRecipe);
      };
    };
  };

  public shared ({ caller }) func unlikeRecipe(recipeId : RecipeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike recipes");
    };

    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) {
        let updatedLikes = recipe.likes.filter(func(author) { author != caller });
        if (updatedLikes.size() == recipe.likes.size()) {
          Runtime.trap("You have not liked this recipe");
        };
        let updatedRecipe = {
          recipe with
          likes = updatedLikes
        };
        recipes.add(recipeId, updatedRecipe);
      };
    };
  };

  // Check if the caller has liked a recipe
  // Returns false for non-authenticated users or non-existent recipes
  public query ({ caller }) func hasUserLikedRecipe(recipeId : RecipeId) : async Bool {
    // Only authenticated users can have liked a recipe
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };

    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) { recipe.likes.any(func(author) { author == caller }) };
    };
  };

  // Comments Management
  // Accept only content and timestamp, construct Comment with verified caller
  public shared ({ caller }) func addComment(recipeId : RecipeId, content : Text, timestamp : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment");
    };

    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?recipe) {
        let newComment : Comment = {
          author = caller; // Always use verified caller
          content = content;
          timestamp = timestamp;
        };
        let updatedRecipe = {
          recipe with
          comments = recipe.comments.concat([newComment])
        };
        recipes.add(recipeId, updatedRecipe);
      };
    };
  };

  // Monetization Features

  public type ExternalSupportLink = {
    displayName : Text;
    url : Text;
    description : ?Text;
  };

  public type Product = {
    title : Text;
    description : Text;
    priceDisplay : Text; // e.g. "$19.99" or just "Supporter Edition"
    checkoutUrl : Text;
  };

  public type Storefront = {
    supportLinks : [ExternalSupportLink];
    products : [Product];
  };

  let storefronts = Map.empty<Principal, Storefront>();

  // Write or update user's storefront
  // Authorization: Only authenticated users can manage their own storefront
  public shared ({ caller }) func saveOrUpdateStorefront(storefront : Storefront) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their storefront");
    };
    storefronts.add(caller, storefront);
  };

  // Get a user's storefront (products & links)
  // Authorization: Public read access (including guests) for recipe page display
  public query ({ caller }) func getUserStorefront(user : Principal) : async ?Storefront {
    storefronts.get(user);
  };

  // Get product catalog for a user
  // Authorization: Public read access (including guests) for recipe page display
  public query ({ caller }) func getUserProducts(user : Principal) : async [Product] {
    switch (storefronts.get(user)) {
      case (?storefront) { storefront.products };
      case (_) { [] }; // Return empty array if no storefront exists
    };
  };

  // Get user's support links
  // Authorization: Public read access (including guests) for recipe page display
  public query ({ caller }) func getUserSupportLinks(user : Principal) : async [ExternalSupportLink] {
    switch (storefronts.get(user)) {
      case (?storefront) { storefront.supportLinks };
      case (_) { [] }; // Return empty array if no storefront exists
    };
  };

  // Delete user's storefront (products & links)
  // Authorization: Only authenticated users can delete their own storefront
  public shared ({ caller }) func deleteStorefront() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete their storefront");
    };
    storefronts.remove(caller);
  };
};
