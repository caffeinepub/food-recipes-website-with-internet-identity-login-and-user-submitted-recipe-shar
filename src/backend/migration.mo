import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
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

  public type NewRecipe = {
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

  public type NewActor = {
    recipes : Map.Map<RecipeId, NewRecipe>;
  };

  public type OldRecipe = {
    id : RecipeId;
    owner : Principal;
    title : Text;
    description : Text;
    ingredients : [Ingredient];
    steps : [Text];
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type OldActor = {
    recipes : Map.Map<RecipeId, OldRecipe>;
  };

  public func run(old : OldActor) : NewActor {
    let newRecipes = old.recipes.map<RecipeId, OldRecipe, NewRecipe>(
      func(_id, oldRecipe) {
        {
          oldRecipe with
          photo = null;
          likes = [];
          comments = [];
        };
      }
    );
    { recipes = newRecipes };
  };
};
