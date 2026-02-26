import Principal "mo:core/Principal";
import Map "mo:core/Map";
module {
  // Type definitions (copied from actor file)
  type ProductCategory = {
    #dryFruits;
    #snacks;
    #chocolates;
  };

  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    image : ?Text;
    category : ProductCategory;
    inStock : Bool;
  };

  type OrderType = {
    #regular;
    #bulk;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
  };

  type OrderItem = {
    product : Product;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    customerId : Principal;
    items : [OrderItem];
    orderType : OrderType;
    status : OrderStatus;
    customerInfo : Text;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  // Old actor type
  type OldActor = {
    productIdCounter : Nat;
    products : Map.Map<Nat, Product>;
    orderIdCounter : Nat;
    orders : Map.Map<Nat, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  // New actor type (same as old)
  type NewActor = OldActor;

  // Migration function
  public func run(old : OldActor) : NewActor {
    old;
  };
};
