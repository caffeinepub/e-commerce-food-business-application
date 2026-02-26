import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  include MixinStorage();

  // Product Category
  type ProductCategory = {
    #dryFruits;
    #snacks;
    #chocolates;
  };

  module ProductCategory {
    public func compare(cat1 : ProductCategory, cat2 : ProductCategory) : Order.Order {
      switch (cat1, cat2) {
        case (#dryFruits, #dryFruits) { #equal };
        case (#dryFruits, _) { #less };
        case (#snacks, #dryFruits) { #greater };
        case (#snacks, #snacks) { #equal };
        case (#snacks, #chocolates) { #less };
        case (#chocolates, #chocolates) { #equal };
        case (#chocolates, _) { #greater };
      };
    };
  };

  // Product Type
  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    image : ?Storage.ExternalBlob;
    category : ProductCategory;
    inStock : Bool;
  };

  module Product {
    public func toText(product : Product) : Text {
      product.name;
    };

    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  // Order Types
  type OrderType = {
    #regular;
    #bulk;
  };

  // Order Status
  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
  };

  module OrderStatus {
    public func compare(status1 : OrderStatus, status2 : OrderStatus) : Order.Order {
      switch (status1, status2) {
        case (#pending, #pending) { #equal };
        case (#pending, _) { #less };
        case (#processing, #pending) { #greater };
        case (#processing, #processing) { #equal };
        case (#processing, _) { #less };
        case (#shipped, #delivered) { #less };
        case (#shipped, #shipped) { #equal };
        case (#shipped, _) { #greater };
        case (#delivered, #delivered) { #equal };
        case (#delivered, _) { #greater };
      };
    };
  };

  // Order Item Type
  type OrderItem = {
    product : Product;
    quantity : Nat;
  };

  module OrderItem {
    public func compare(item1 : OrderItem, item2 : OrderItem) : Order.Order {
      switch (Text.compare(item1.product.name, item2.product.name)) {
        case (#equal) { Int.compare(item1.quantity, item2.quantity) };
        case (order) { order };
      };
    };
  };

  // Order Type
  type Order = {
    id : Nat;
    customerId : Principal;
    items : [OrderItem];
    orderType : OrderType;
    status : OrderStatus;
    customerInfo : Text;
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  // Product Catalog
  var productIdCounter = 0;
  let products = Map.empty<Nat, Product>();

  // Order Management
  var orderIdCounter = 0;
  let orders = Map.empty<Nat, Order>();

  // User Profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();

  // Initialize auth (first caller becomes admin, others become users)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Product Management (Admin functions)
  public shared ({ caller }) func addProduct(productInput : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    productIdCounter += 1;
    let newProduct = {
      productInput with
      id = productIdCounter;
    };
    products.add(productIdCounter, newProduct);
    productIdCounter;
  };

  public shared ({ caller }) func updateProduct(id : Nat, updatedProduct : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(id)) { Runtime.trap("Product not found") };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func removeProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };
    if (not products.containsKey(id)) { Runtime.trap("Product not found") };
    products.remove(id);
  };

  // Product Retrieval (Public - guests can browse)
  public query ({ caller }) func getProductByID(id : Nat) : async ?Product {
    products.get(id);
  };

  public query ({ caller }) func getProductsByCategory(category : ProductCategory) : async [Product] {
    let iter = products.values().filter(
      func(product) { product.category == category }
    );
    iter.toArray();
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Order Management (Admin functions)
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // Order Creation (User function - requires authentication)
  public shared ({ caller }) func placeOrder(items : [OrderItem], orderType : OrderType, customerInfo : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    orderIdCounter += 1;
    let newOrder = {
      id = orderIdCounter;
      customerId = caller;
      items;
      orderType;
      status = #pending;
      customerInfo;
    };
    orders.add(orderIdCounter, newOrder);
    orderIdCounter;
  };

  // Order Retrieval (Protected)
  public query ({ caller }) func getOrderById(id : Nat) : async ?Order {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        // Only the order owner or admin can view the order
        if (order.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByCustomer(customerInfo : Text) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can search orders by customer");
    };
    let iter = orders.values().filter(
      func(order) { order.customerInfo == customerInfo }
    );
    iter.toArray();
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can filter orders by status");
    };
    let iter = orders.values().filter(
      func(order) { order.status == status }
    );
    iter.toArray();
  };

  // Get caller's own orders (User function)
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    let iter = orders.values().filter(
      func(order) { order.customerId == caller }
    );
    iter.toArray();
  };
};
