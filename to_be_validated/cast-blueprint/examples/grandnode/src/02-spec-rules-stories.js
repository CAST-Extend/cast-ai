/* =====================================================================
   APPLICATION SPECIFICATION — Checkout & Orders
   ===================================================================== */
Object.assign(EV, {
  coTx:{ title:"Checkout entry points", call:"transactions(GrandNode, filters=name:contains:checkout)", rows:[["Checkout controller actions","26"],["Classic multi-step","Index → addresses → shipping → payment → Confirm → ConfirmOrder → Completed"],["One-page checkout","OnePageCheckout → OpcSaveBilling → OpcSaveShipping → OpcSaveShippingMethod → OpcSavePaymentMethod → OpcSavePaymentInfo → OpcConfirmOrder"],
    ["Largest call graphs","OpcSaveBilling 985 · OpcSaveShipping 974 · OnePageCheckout 763 · OpcSaveShippingMethod 542"],["Entry points reaching IOrderProcessingService.PlaceOrder","Checkout/ConfirmOrder · Checkout/OpcConfirmOrder · PaymentPayPalStandard/IPNHandler"]]},
  prepSrc:{ title:"Order validation — PreparePlaceOrderDetails", call:"object_details(OrderProcessingService.PreparePlaceOrderDetails, focus=code) · lines 442–707 · cyclomatic 40",
    code:`if (details.Customer.IsGuest() && !_orderSettings.AnonymousCheckoutAllowed)
    throw new GrandException("Anonymous checkout is not allowed");
if (details.Customer.BillingAddress == null)
    throw new GrandException("Billing address is not provided");
if (!CommonHelper.IsValidEmail(details.Customer.BillingAddress.Email))
    throw new GrandException("Email is not valid");
... if (!country.AllowsBilling) throw ... "is not allowed for billing"
details.Cart = details.Customer.ShoppingCartItems
    .Where(sci => sci.ShoppingCartType == ShoppingCartType.ShoppingCart || ... Auctions)
    .LimitPerStore(...CartsSharedBetweenStores, storeId).ToList();
if (!details.Cart.Any()) throw new GrandException("Cart is empty");
// cart warnings, item warnings → throw
if (!minOrderSubtotalAmountOk) throw ... "Checkout.MinOrderSubtotalAmount"
if (!minOrderTotalAmountOk)    throw ... "Checkout.MinOrderTotalAmount"
if (shoppingCartRequiresShipping) {
    var pickupPoint = ...SelectedPickupPoint;
    if (_shippingSettings.AllowPickUpInStore && pickupPoint != null) {
        details.PickUpInStore = true;
        details.PickupPoint = await _shippingService.GetPickupPointById(pickupPoint);
    } else {
        if (details.Customer.ShippingAddress == null) throw ... "Shipping address is not provided";
        if (!CommonHelper.IsValidEmail(details.Customer.ShippingAddress.Email)) throw ... "Email is not valid";
        ... if (!country.AllowsShipping) throw ...
    } }
if (!orderShippingTotalInclTax.HasValue || ...) throw ... "Shipping total couldn't be calculated"
var shoppingCartTotal = await _orderTotalCalculationService.GetShoppingCartTotal(details.Cart);
if (!orderTotal.HasValue) throw new GrandException("Order total couldn't be calculated");`,
    note:"When a pickup point is selected but no longer exists, PickupPoint is null and no address is required." },
  placeOrder:{ title:"Placing an order — PlaceOrder", call:"object_details(OrderProcessingService.PlaceOrder, focus=code) · lines 1610–1732",
    code:`try {
  var details = !processPaymentRequest.IsRecurringPayment ? await PreparePlaceOrderDetails(...) : await PreparePlaceOrderDetailsForRecurringPayment(...);
  ...
  var processPaymentResult = await PrepareProcessPaymentResult(processPaymentRequest, details);   // payment
  if (processPaymentResult.Success) {
      var order = await PrepareOrder(...);
      result.PlacedOrder = await SaveOrderDetails(details, order);                              // order saved after payment
      if (details.IsRecurringShoppingCart && ...) await CreateRecurringPayment(...);
      if (details.RedeemedRewardPointsAmount > decimal.Zero) { ... AddRewardPointsHistory(... -points ...) }
      await SendNotification(order);
      await CheckOrderStatus(order);
      await UpdateCustomer(order);
      await _mediator.Publish(new OrderPlacedEvent(order));
      if (order.PaymentStatus == PaymentStatus.Paid) await ProcessOrderPaid(order);
  } else { ... "Checkout.PaymentError" }
}
catch (Exception exc) {
  _logger.Error(exc.Message, exc);
  result.AddError(exc.Message);             // no void / refund of a successful payment
}`,
    note:"Errors raised after a successful payment and a saved order are returned as checkout errors." },
  statusSrc:{ title:"Order status rules — CheckOrderStatus", call:"object_details(OrderProcessingService.CheckOrderStatus, focus=code) · lines 1547–1608 · 12 callers",
    code:`if (order.PaymentStatus == PaymentStatus.Paid && !order.PaidDateUtc.HasValue) order.PaidDateUtc = DateTime.UtcNow;
if (order.OrderStatus == OrderStatus.Pending) {
  if (PaymentStatus is Authorized or Paid) SetOrderStatus(order, OrderStatus.Processing ...);
  if (ShippingStatus is PartiallyShipped, Shipped or Delivered) SetOrderStatus(order, OrderStatus.Processing ...);
}
if (order.OrderStatus != Cancelled && != Complete && order.PaymentStatus == Paid) {
  completed = ShippingNotRequired
           || (_orderSettings.CompleteOrderWhenDelivered ? Delivered : Shipped or Delivered);
  if (completed) SetOrderStatus(order, OrderStatus.Complete ...);
}` },
  cancelSrc:{ title:"Cancelling an order — CancelOrder", call:"object_details(OrderProcessingService.CancelOrder, focus=code) · lines 2127–2194",
    code:`if (!CanCancelOrder(order)) throw new GrandException("Cannot do cancel for order.");
await SetOrderStatus(order, OrderStatus.Cancelled, ...);
await ReturnBackRedeemedRewardPoints(order);
foreach (var rp in recurringPayments) {
    var errors = CancelRecurringPayment(rp);      // not awaited
    //use "errors" variable?
}
// Adjust inventory for already shipped shipments
foreach (shipment ...) foreach (shipmentItem ...) await _productService.ReverseBookedInventory(product, shipmentItem);
// Adjust inventory
foreach (var orderItem in order.OrderItems) await _productService.AdjustInventory(product, orderItem.Quantity, ...);
await _productReservationService.CancelReservationsByOrderId(order.Id);
await _auctionService.CancelBidByOrder(order.Id);
await _discountService.CancelDiscount(order.Id);`,
    note:"The recurring-payment cancellation is neither awaited nor checked. No payment refund or void is triggered." },
  recurSrc:{ title:"Recurring payments — PreparePlaceOrderDetailsForRecurringPayment", call:"object_details(…, focus=code) · lines 187–278",
    code:`details.InitialOrder = await _orderService.GetOrderById(processPaymentRequest.InitialOrderId);
details.OrderSubTotalInclTax = details.InitialOrder.OrderSubtotalInclTax;
details.OrderDiscountAmount  = details.InitialOrder.OrderDiscount;
details.OrderTotal           = details.InitialOrder.OrderTotal;
details.OrderShippingTotalInclTax = details.InitialOrder.OrderShippingInclTax;
details.OrderTaxTotal        = details.InitialOrder.OrderTax;` },
  di:{ title:"Calls through service interfaces", call:"run_cypher_query — callers and IS_IN_TRANSACTION for OrderProcessingService.PlaceOrder vs IOrderProcessingService.PlaceOrder", rows:[["Implementation PlaceOrder","1 entry point (PayPal IPN)"],["Interface IOrderProcessingService.PlaceOrder","3 entry points (ConfirmOrder, OpcConfirmOrder, PayPal IPN)"]],
    note:"Controllers depend on interfaces resolved by dependency injection; impact analysis has to start from the interface method to see every caller." },
});
const CAPS = [["Start & finish","Begin checkout, change checkout attributes, completion page",4],["Addresses","Choose or add billing and shipping addresses",7],["Shipping","Choose shipping method or pickup",4],["Payment","Choose method, enter payment info",5],["Confirm & place","Confirm the order, place it, payment callbacks",4],["One-page shell","One-page checkout and redirect payments",2]];
/* [entry point, purpose, flow, call graph, capability] */
const CONTRACTS = [
  ["ShoppingCart/StartCheckout","Leave the cart for checkout","Cart",108,"Start & finish"],["ShoppingCart/CheckoutAttributeChange","Recalculate after a checkout attribute changes","Cart",276,"Start & finish"],
  ["Checkout/Index","Start the checkout","Classic",65,"Start & finish"],["Checkout/Completed","Order confirmation page","Classic",65,"Start & finish"],
  ["Checkout/BillingAddress","Billing address step","Classic",471,"Addresses"],["Checkout/SelectBillingAddress","Use a saved billing address","Classic",55,"Addresses"],["Checkout/NewBillingAddress","Add a billing address","Classic",465,"Addresses"],
  ["Checkout/ShippingAddress","Shipping address step","Classic",451,"Addresses"],["Checkout/SelectShippingAddress","Use a saved shipping address","Classic",37,"Addresses"],["Checkout/NewShippingAddress","Add a shipping address","Classic",519,"Addresses"],["Checkout/OpcSaveBilling","Save billing (one page)","One-page",985,"Addresses"],
  ["Checkout/ShippingMethod","Shipping method step","Classic",142,"Shipping"],["Checkout/SelectShippingMethod","Choose a shipping method","Classic",172,"Shipping"],["Checkout/OpcSaveShipping","Save shipping address (one page)","One-page",974,"Shipping"],["Checkout/OpcSaveShippingMethod","Save shipping method (one page)","One-page",542,"Shipping"],
  ["Checkout/PaymentMethod","Payment method step","Classic",424,"Payment"],["Checkout/SelectPaymentMethod","Choose a payment method","Classic",451,"Payment"],["Checkout/PaymentInfo","Payment info step","Classic",96,"Payment"],["Checkout/EnterPaymentInfo","Submit payment info","Classic",102,"Payment"],["Checkout/OpcSavePaymentInfo","Save payment info (one page)","One-page",242,"Payment"],
  ["Checkout/Confirm","Review the order","Classic",80,"Confirm & place"],["Checkout/ConfirmOrder","Place the order","Classic",244,"Confirm & place"],["Checkout/OpcConfirmOrder","Place the order (one page)","One-page",257,"Confirm & place"],["PaymentPayPalStandard/IPNHandler","PayPal payment notification","Callback",null,"Confirm & place"],
  ["Checkout/OnePageCheckout","One-page checkout shell","One-page",763,"One-page shell"],["Checkout/OpcCompleteRedirectionPayment","Return from a redirect payment","One-page",156,"One-page shell"],
];
const SPEC = {
  stories:[
    { t:"Place an order", p:"P1", ev:["placeOrder","prepSrc","coTx"], d:"A shopper confirms the order; the system validates the cart and addresses, calculates the totals, takes the payment through the selected payment plugin, saves the order and notifies the customer and the store.",
      why:"The revenue path — and the step with the riskiest error handling (C-01, C-07).", test:"Confirm an order with a valid cart and a test payment method; verify the order, payment status and notifications.",
      ac:[["a valid cart, billing and shipping address and a successful payment","the shopper confirms","an order is saved, the customer is notified and the order status is checked"],["a payment that is declined","the shopper confirms","no order is saved and “Checkout.PaymentError” is shown"],["an empty cart","the shopper confirms","checkout fails with “Cart is empty”"]] },
    { t:"Provide addresses and choose delivery", p:"P1", ev:["prepSrc","coTx"], d:"The shopper gives a billing address, then a shipping address or a store pickup point, and picks a shipping method; countries must allow billing or shipping.",
      why:"Every physical order needs it; one-page checkout steps are the largest call graphs (985 and 974 objects).", test:"Check out with an address in a country that disallows shipping, then with a pickup point.",
      ac:[["a billing address in a country that does not allow billing","the order is placed","checkout fails with “Country … is not allowed for billing”"],["store pickup allowed and a pickup point chosen","the order is placed","no shipping address is required"],["no shipping address and no pickup point","the order is placed","checkout fails with “Shipping address is not provided”"]] },
    { t:"Respect minimums, warnings and totals", p:"P2", ev:["prepSrc"], d:"Before payment, the cart is re-validated and the minimum subtotal and total are enforced; shipping and order totals must be calculable.",
      why:"Protects margins and prevents orders the store cannot fulfil.", test:"Place an order below the minimum subtotal; then with a cart item that has a warning.",
      ac:[["a cart below the minimum order subtotal","the order is placed","checkout fails with the minimum-subtotal message"],["a cart item with a warning (e.g. stock)","the order is placed","checkout fails with that warning"]] },
    { t:"Move an order through its statuses", p:"P2", ev:["statusSrc"], d:"Orders start Pending, become Processing once paid, authorized or shipped, and Complete once paid and shipped or delivered.",
      why:"Drives fulfilment, customer notifications and reporting.", test:"Mark a pending order paid, then shipped; check the status after each step.",
      ac:[["a pending order","its payment is marked paid","it becomes Processing"],["a paid order that needs shipping, with CompleteOrderWhenDelivered off","it is shipped","it becomes Complete"]] },
    { t:"Cancel an order", p:"P3", ev:["cancelSrc"], d:"Staff cancel an order: status becomes Cancelled, reward points come back, inventory, reservations, bids and discount usage are reversed, and recurring payments are stopped.",
      why:"Reverses commercial side effects — but not the payment (C-04).", test:"Cancel a paid recurring order with a shipped item; verify inventory, points and recurring payments.",
      ac:[["an order that cannot be cancelled","staff cancel it","“Cannot do cancel for order.” is shown"],["a cancellable order with redeemed reward points","staff cancel it","the points are returned"]] },
  ],
  edge:[
    ["What if saving the order fails after the payment succeeded?","The error is logged and shown as a checkout error; the payment is not voided (C-01).","placeOrder"],
    ["What if the selected pickup point was deleted?","PickUpInStore is set but the pickup point is empty and no address is required (C-05).","prepSrc"],
    ["What if prices change after a recurring order starts?","Later cycles reuse the first order's totals (C-06).","recurSrc"],
    ["What happens to recurring payments when an order is cancelled?","Their cancellation is started but neither awaited nor checked (C-02).","cancelSrc"],
  ],
  frs:[
    ["FR-001","System MUST refuse checkout for guests unless anonymous checkout is allowed.","PreparePlaceOrderDetails",["prepSrc"]],
    ["FR-002","System MUST require a billing address with a valid email, in a country that allows billing.","PreparePlaceOrderDetails",["prepSrc"]],
    ["FR-003","System MUST place only the shopping-cart and auction items of the current store (unless carts are shared between stores) and refuse an empty cart.","PreparePlaceOrderDetails",["prepSrc"]],
    ["FR-004","System MUST refuse an order with cart-level or item-level warnings.","GetShoppingCartWarnings · GetShoppingCartItemWarnings",["prepSrc"]],
    ["FR-005","System MUST enforce the minimum order subtotal and minimum order total.","ValidateMinOrderSubtotalAmount · ValidateMinOrderTotalAmount",["prepSrc"]],
    ["FR-006","System MUST require a shipping address (valid email, country allowing shipping) unless store pickup is allowed and selected. [NEEDS CLARIFICATION: deleted pickup points and shipping-address emails — C-05, C-08]","PreparePlaceOrderDetails",["prepSrc"]],
    ["FR-007","System MUST calculate subtotal, shipping, payment fee, tax and order total — including discounts, gift cards and reward points — and refuse the order if any cannot be calculated.","OrderTotalCalculationService",["prepSrc"]],
    ["FR-008","System MUST take payment through the selected payment method and save the order only when the payment succeeds. [NEEDS CLARIFICATION: no compensation when later steps fail — C-01, C-07]","PlaceOrder",["placeOrder"]],
    ["FR-009","System MUST deduct redeemed reward points, notify, check the order status, update the customer and publish OrderPlacedEvent after saving the order.","PlaceOrder",["placeOrder"]],
    ["FR-010","System MUST reuse the initial order's details for each recurring payment. [NEEDS CLARIFICATION: totals never change — C-06]","PreparePlaceOrderDetailsForRecurringPayment",["recurSrc"]],
    ["FR-011","System MUST move a Pending order to Processing when paid, authorized or shipped, and to Complete when paid and fulfilled.","CheckOrderStatus",["statusSrc"]],
    ["FR-012","System MUST, on cancellation, return reward points and reverse inventory, reservations, bids and discount usage. [NEEDS CLARIFICATION: inventory, recurring payments and refunds — C-02, C-03, C-04]","CancelOrder",["cancelSrc"]],
  ],
  entities:[["Order","IRepository<Order>","The placed order: customer, addresses, totals, statuses (order, payment, shipping), items, applied discounts and gift cards."],["Customer","IRepository<Customer>","Holds the shopping-cart items, addresses and generic attributes such as selected shipping option and pickup point."],
    ["Product","IRepository<Product>","Inventory and reservations adjusted on order and cancellation."],["RecurringPayment","IRepository<RecurringPayment>","Cycles created from an initial order."],["GiftCard · RewardPointsHistory","IRepository<GiftCard> · <RewardPointsHistory>","Redeemed during checkout, returned on cancellation."],["OrderNote","IRepository<OrderNote>","Audit notes on an order."]],
  sc:[["SC-001","A shopper is never charged without a saved order, and never told checkout failed when an order exists."],["SC-002","Totals shown at Confirm equal the totals saved on the order."],["SC-003","All 26 checkout entry points keep their behaviour through any modernization."],["SC-004","Cancelling an order reverses every commercial side effect exactly once."]],
  assumptions:["Payment plugins (PayPal, Braintree and others) implement the payment step; their internals are out of scope here.","MongoDB is accessed through IRepository<T>; collections are named after entities.","This is an as-is baseline: it describes observed behaviour, including behaviour that may be unintended."],
  clar:[
    { id:"C-01", t:"Payment is taken before the order is saved", impact:"high", ev:["placeOrder"], fr:"FR-008", found:"PlaceOrder processes the payment first. If building or saving the order fails, the exception is logged and returned as an error; the successful payment is neither voided nor refunded.", ask:"Should the order be saved first (as pending), or the payment voided automatically when anything after it fails?" },
    { id:"C-02", t:"Recurring payments may keep running after cancellation", impact:"high", ev:["cancelSrc"], fr:"FR-012", found:"CancelOrder calls CancelRecurringPayment for each recurring payment without awaiting it and ignores the result — the code itself asks “use errors variable?”.", ask:"Must cancellation fail, or alert staff, when a recurring payment cannot be stopped?" },
    { id:"C-03", t:"Shipped items may be restocked twice", impact:"medium", ev:["cancelSrc"], fr:"FR-012", found:"Cancellation reverses booked inventory for shipped items and then adjusts inventory for every order item, shipped or not.", ask:"Confirm with a test: does cancelling a shipped order overstate stock?" },
    { id:"C-04", t:"Cancelling does not refund", impact:"medium", ev:["cancelSrc"], fr:"FR-012", found:"Cancellation reverses points, stock and discounts but never calls refund or void.", ask:"Is a separate refund step the intended process for cancelled paid orders?" },
    { id:"C-05", t:"A deleted pickup point leaves an order without any address", impact:"medium", ev:["prepSrc"], fr:"FR-006", found:"If pickup is allowed and a pickup-point id is stored, the order is marked pickup even when the point no longer exists, and no shipping address is required.", ask:"Should checkout fail when the selected pickup point cannot be found?" },
    { id:"C-06", t:"Recurring orders keep the first order's prices", impact:"medium", ev:["recurSrc"], fr:"FR-010", found:"Each recurring payment copies subtotal, discount, shipping, tax and total from the initial order.", ask:"Should recurring cycles pick up current prices and tax rates?" },
    { id:"C-07", t:"A placed order can be reported as a failed checkout", impact:"high", ev:["placeOrder"], fr:"FR-008", found:"Reward-point deduction, notifications, status check and events run inside the same try block after the order is saved; any error there is shown to the shopper as a checkout failure.", ask:"Should post-order steps be retried in the background instead of failing the checkout response?" },
    { id:"C-08", t:"Shipping addresses must carry a valid email", impact:"low", ev:["prepSrc"], fr:"FR-006", found:"A shipping address without a valid email fails the order with “Email is not valid”.", ask:"Is an email required on every shipping address?" },
  ],
};
const NC_COUNT = SPEC.clar.length;
let specTab = "overview";
const SPEC_TABS = [["overview","Overview",false],["spec","spec.md",true],["plan","plan.md",true],["data","data-model.md",true],["contracts","contracts/",true],["clar","Clarifications",false],["delta","To-be delta",false]];
function setSpecTab(t){ specTab = t; STMTS = []; document.getElementById("doc").innerHTML = appSpec(); paintGrounding(); }
function ncMark(text){ return esc(text).replace(/\[NEEDS CLARIFICATION: ([^\]]+)\]/g, '<mark class="nc">[NEEDS CLARIFICATION: $1]</mark>'); }
function appSpec(){
  STMTS = []; const tabs = SPEC_TABS.map(([id,label,file])=>`<button class="tab ${file?"file":""} ${specTab===id?"on":""}" onclick="setSpecTab('${id}')">${label}${id==="clar"?`<span class="cnt">${NC_COUNT}</span>`:""}</button>`).join("");
  const fns = { overview:specOverview, spec:specMain, plan:specPlan, data:specData, contracts:specContracts, clar:specClar, delta:specDelta };
  const body = fns[specTab](); const all = []; for (const k in fns) { if (k==="delta") continue; STMTS = []; fns[k](); all.push(...STMTS); } STMTS = all;
  return `<div class="doc-head"><div><div class="eyebrow">Application Specification · as-is</div><h1>${SHOW_H}</h1><div class="meta">GrandNode 4.60 · 26 entry points · Grand.Services.Orders · GitHub Spec Kit format · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport()">Export for agents</button></div></div>${domainBar("specification")}<div class="grounding" id="grounding"></div><div class="tabs">${tabs}</div>${body}`;
}
function fileHead(path, note){ return `<div class="filehead"><span><code>specs/001-checkout-orders/${path}</code></span><span>${note}</span></div>`; }
function specOverview(){
  const flow = ["Cart","Addresses","Shipping","Payment method","Confirm","Validate","Pay","Save order"], w = 118, gap = 10;
  const svg = `<svg viewBox="0 0 ${flow.length*(w+gap)} 92"><g font-family="Inter,sans-serif">${flow.map((f,i)=>{ const x=i*(w+gap), hot = i>=5;
    return `<path d="M${x},14 h${w-12} l12,24 l-12,24 h-${w-12} l${i?12:0},-24 z" fill="${hot?"#624ABB":"#fff"}" stroke="${hot?"#624ABB":"#C7C9E0"}"/><text x="${x+w/2+(i?4:-2)}" y="42" text-anchor="middle" font-size="12" font-weight="600" fill="${hot?"#fff":"#0C0613"}">${f}</text>`}).join("")}
    <text x="${5*(w+gap)}" y="84" font-size="11" fill="#463589" font-weight="600">PlaceOrder: payment before save (C-01)</text></g></svg>`;
  return `<h2>In plain language</h2>
  <p>${X("Checkout &amp; Orders turns a GrandNode shopping cart into a paid order. Shoppers use either a classic multi-step checkout or a one-page checkout; both end in the same order-placement service.","coTx","placeOrder")}
     ${X("Placing an order re-validates the cart, addresses and minimums, calculates totals with discounts, gift cards and reward points, takes the payment through a payment plugin and saves the order.","prepSrc","placeOrder")}
     ${X("Afterwards, order status follows payment and shipping, and staff can cancel orders from the admin console.","statusSrc","cancelSrc")}</p>
  <div class="flowfig">${svg}</div><h2>Capabilities</h2><div class="caps">${CAPS.map(c=>`<div class="cap"><span class="n">${c[2]}</span><b>${c[0]}</b><span>${c[1]}</span></div>`).join("")}</div>
  <h2>Who uses it</h2><ul class="plain"><li><b>Shopper</b> — ${X("guest (if allowed) or registered, through 24 storefront checkout and cart actions.","coTx","prepSrc")}</li><li><b>Store staff</b> — ${X("manage, cancel and refund orders from the admin console.","cancelSrc","tx")}</li><li><b>Payment provider</b> — ${X("calls back, e.g. PayPal's IPN handler, which can also place orders.","coTx")}</li></ul>
  <h2>What needs a decision</h2><p>${I(`Reading the order code surfaced ${NC_COUNT} behaviours to confirm — most importantly that payment is taken before the order is saved.`,"Each clarification quotes the code that raised it.","placeOrder","cancelSrc")}</p>
  <button class="btn btn-ghost btn-sm" onclick="setSpecTab('clar')">Review ${NC_COUNT} clarifications →</button>`;
}
function specMain(){
  const s = SPEC;
  return `${fileHead("spec.md","What the system does and why")}
  <div class="specmeta"><b>Feature Specification:</b> Checkout &amp; Orders (as-is baseline) · <b>Branch:</b> <code>001-checkout-orders</code> · <b>Input:</b> CAST Imaging analysis of GrandNode, snapshot ${SYSTEM.snapshot}</div>
  <h2>User Scenarios &amp; Testing</h2>${s.stories.map((st,i)=>`<div class="story"><h3>User Story ${i+1} — ${st.t} <span class="prio">Priority: ${st.p}</span></h3><p style="margin:0">${X(st.d,...st.ev)}</p>
    <div class="k">Why this priority</div><p style="margin:0;font-size:14.5px">${I(st.why,"Priority reflects revenue impact and call-graph breadth.","coTx")}</p><div class="k">Independent test</div><p style="margin:0;font-size:14.5px">${st.test}</p>
    <div class="k">Acceptance scenarios</div><ol>${st.ac.map(a=>`<li class="gwt"><b>Given</b> ${a[0]}, <b>When</b> ${a[1]}, <b>Then</b> ${a[2]}.</li>`).join("")}</ol></div>`).join("")}
  <h2>Edge Cases</h2><ul class="plain">${s.edge.map(e=>`<li><b>${e[0]}</b> ${X(e[1],e[2])}</li>`).join("")}</ul>
  <h2>Functional Requirements</h2><div class="reqs">${s.frs.map(f=>`<div class="req"><span class="id">${f[0]}</span><div>${X(ncMark(f[1]),...f[3])}<span class="trace">↳ ${esc(f[2])}</span></div></div>`).join("")}</div>
  <h2>Key Entities</h2><ul class="plain">${s.entities.map(e=>`<li><b>${e[0]}</b> <code style="color:var(--muted)">${esc(e[1])}</code> — ${e[2]}</li>`).join("")}</ul>
  <h2>Success Criteria</h2><div class="reqs">${s.sc.map(c=>`<div class="req"><span class="id">${c[0]}</span><div>${I(c[1],"Regression guarantees derived from the requirements.","placeOrder")}</div></div>`).join("")}</div>
  <h2>Assumptions</h2><ul class="plain">${s.assumptions.map(a=>`<li>${a}</li>`).join("")}</ul>`;
}
function specPlan(){
  const row = (k,v) => `<tr><td style="width:190px;font-weight:600;color:var(--ink)">${k}</td><td>${v}</td></tr>`;
  return `${fileHead("plan.md","How it is built today")}<h2>Technical Context</h2><div class="tblwrap"><table class="tbl"><tbody>
    ${row("Language/Version", X("C# on ASP.NET Core (GrandNode 4.60)","stats"))}${row("Primary Dependencies", X("ASP.NET Core MVC, MediatR, MongoDB driver, Redis, payment/shipping/tax plugins","stats"))}
    ${row("Storage", X("MongoDB through IRepository&lt;T&gt; — Order, Customer, Product, RecurringPayment, GiftCard, RewardPointsHistory","repos"))}${row("Testing", `<mark class="nc">[NEEDS CLARIFICATION: test projects were not part of the analysis]</mark>`)}
    ${row("Constraints", X("PreparePlaceOrderDetails has cyclomatic complexity 40 and 187 callees; controllers reach services through interfaces","prepSrc","di"))}${row("Scale/Scope", X("26 checkout entry points; one-page steps reach up to 985 objects","coTx"))}</tbody></table></div>
  <h2>Project Structure</h2><div class="ev"><div class="evh"><b>Source (as-is)</b><code class="call">object_details(…).filePath</code></div><pre>grandnode-4.60/
├── Grand.Web/Controllers/CheckoutController.cs        # 26 checkout actions
├── Grand.Web/Controllers/ShoppingCartController.cs    # StartCheckout, CheckoutAttributeChange
└── Grand.Services/Orders/
    ├── OrderProcessingService.cs                      # PlaceOrder, CheckOrderStatus, CancelOrder (3,125 lines)
    ├── OrderTotalCalculationService.cs                # totals, discounts, reward points
    └── ShoppingCartService.cs                         # cart warnings</pre></div>`;
}
function specData(){
  return `${fileHead("data-model.md","Entities — from repository dependencies")}<h2>Entities</h2><ul class="plain">${SPEC.entities.map(e=>`<li><b>${e[0]}</b> — ${X(e[2],"repos")}</li>`).join("")}</ul>
  <p style="font-size:13px;color:var(--muted)">${I("Field-level schemas come from the domain classes under Grand.Core.Domain in the full export; MongoDB has no schema of its own.","Document databases carry the schema in code.","repos")}</p>`;
}
function specContracts(){
  return `${fileHead("contracts/checkout.md","26 entry points + 1 payment callback")}<p style="margin-top:16px">${X("Every row is an entry point in CAST Imaging; “Call graph” is the number of objects it reaches.","coTx")}</p>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>Entry point</th><th>Purpose</th><th>Flow</th><th style="text-align:right">Call graph</th></tr></thead><tbody>
  ${CONTRACTS.map(c=>`<tr><td class="m">${c[0]}</td><td>${c[1]}</td><td>${c[2]}</td><td style="text-align:right;font-weight:600">${c[3]==null?"—":fmt(c[3])}</td></tr>`).join("")}</tbody></table></div>`;
}
function specClar(){
  const col = { high:"background:var(--crit-bg);color:var(--crit)", medium:"background:var(--med-bg);color:var(--med)", low:"background:#F2F0F5;color:#4B4652" };
  return `<p style="margin-top:22px">${I(`${NC_COUNT} behaviours in the order code are ambiguous or likely unintended. Each is a question for the application team.`,"The source is extracted; calling it a question is a judgment.","placeOrder","cancelSrc")}</p>
  ${SPEC.clar.map(c=>`<div class="clar"><div class="h"><code>${c.id}</code><h4>${c.t}</h4><span class="impact" style="${col[c.impact]}">${c.impact} impact</span><span style="font-size:12px;color:var(--muted)">affects ${c.fr}</span></div>
    <p>${I(c.found,"Interpretation of the quoted source.",...c.ev)}</p><div class="ask"><b>Question for the team:</b> ${c.ask}</div></div>`).join("")}`;
}
function specDelta(){
  return `<div style="margin-top:22px"><span class="preview-ribbon">Preview</span></div><h2 style="margin-top:12px">From as-is to to-be</h2>
  <div class="delta-in"><input value="Make order placement safe and idempotent" aria-label="Change intent"><button class="btn btn-primary" onclick="toast('Delta spec generation is the next phase of the prototype')">Generate delta</button></div>
  <div class="delta-grid" style="margin-top:12px"><div class="dcol"><h4 style="color:var(--good)">Preserved · 9</h4><ul><li>FR-001 – FR-007 — validation and totals</li><li>FR-011 — status rules</li></ul></div>
    <div class="dcol"><h4 style="color:var(--med)">Changed · 3</h4><ul><li>FR-008 — order saved as pending before payment; payment voided on failure (C-01)</li><li>FR-009 — post-order steps retried in the background (C-07)</li><li>FR-012 — cancellation awaits recurring-payment cancellation (C-02)</li></ul></div>
    <div class="dcol"><h4 style="color:var(--purple)">New · 2</h4><ul><li>FR-N01 — one order per cart, enforced by an idempotency key</li><li>FR-N02 — reconciliation job for payments without orders</li></ul></div></div>`;
}
function mdSpec(){ const s = SPEC, L = ["# Feature Specification: Checkout & Orders (as-is baseline)","","**Branch**: `001-checkout-orders` · **Input**: CAST Imaging analysis of GrandNode 4.60",""];
  s.stories.forEach((st,i)=>{ L.push(`### User Story ${i+1} - ${st.t} (Priority: ${st.p})`,"",st.d,"","**Acceptance Scenarios**:",""); st.ac.forEach((a,j)=>L.push(`${j+1}. **Given** ${a[0]}, **When** ${a[1]}, **Then** ${a[2]}`)); L.push(""); });
  L.push("## Functional Requirements",""); s.frs.forEach(f=>L.push(`- **${f[0]}**: ${f[1]}  `,`  ↳ \`${f[2]}\``)); L.push("","## Clarifications",""); s.clar.forEach(c=>L.push(`- **${c.id} — ${c.t}**: ${c.found} [NEEDS CLARIFICATION: ${c.ask}]`)); return L.join("\n"); }
function mdContracts(){ return "# Contract: Checkout entry points\n\n| Entry point | Purpose | Flow | Call graph |\n|---|---|---|---|\n" + CONTRACTS.map(c=>`| \`${c[0]}\` | ${c[1]} | ${c[2]} | ${c[3]??"—"} |`).join("\n"); }
const EXPORT_FILES = [["specs/001-checkout-orders/spec.md", mdSpec],["specs/001-checkout-orders/contracts/checkout.md", mdContracts]];

/* =====================================================================
   BUSINESS RULES
   ===================================================================== */
const R_CATS = ["Who can check out","Cart & minimums","Addresses & delivery","Totals","Placing the order","Order status","Cancellation"];
const R_TYPES = { calc:"Calculation", val:"Validation", con:"Constraint", trig:"Trigger", def:"Default" };
const R_STAT = { ok:["ok","Enforced"], inc:["inc","Inconsistent"], ne:["ne","Not enforced"], off:["off","Disabled"] };
const RP = "BR-CO-";
const RULES = [
  [RP+"001","Who can check out","val","ok","Customer must exist","An order can only be prepared for an existing customer.","PreparePlaceOrderDetails",["prepSrc"],"FR-001",null,null],
  [RP+"002","Who can check out","val","ok","Guest checkout is a setting","Guests can check out only when AnonymousCheckoutAllowed is on; otherwise “Anonymous checkout is not allowed”.","PreparePlaceOrderDetails",["prepSrc"],"FR-001",null,["anonymous checkout switched off and a guest shopper","the guest places an order","checkout fails with “Anonymous checkout is not allowed”"]],
  [RP+"003","Cart & minimums","def","ok","Which items are ordered","Only shopping-cart and auction items are ordered, limited to the current store unless carts are shared between stores.","PreparePlaceOrderDetails",["prepSrc"],"FR-003",null,null],
  [RP+"004","Cart & minimums","val","ok","No empty carts","An order with no cart items fails with “Cart is empty”.","PreparePlaceOrderDetails",["prepSrc"],"FR-003",null,["an empty cart","the shopper places the order","checkout fails with “Cart is empty”"]],
  [RP+"005","Cart & minimums","val","ok","Warnings block the order","Any cart-level or item-level warning stops the order; the warnings are joined and shown.","GetShoppingCartWarnings · GetShoppingCartItemWarnings",["prepSrc"],"FR-004",null,null],
  [RP+"006","Cart & minimums","val","ok","Minimum subtotal","An order below MinOrderSubtotalAmount (converted to the customer's currency) is refused.","ValidateMinOrderSubtotalAmount",["prepSrc"],"FR-005",null,["a minimum subtotal of 50.00 and a cart of 30.00","the shopper places the order","checkout fails with the minimum-subtotal message"]],
  [RP+"007","Cart & minimums","val","ok","Minimum total","An order below MinOrderTotalAmount is refused.","ValidateMinOrderTotalAmount",["prepSrc"],"FR-005",null,null],
  [RP+"008","Addresses & delivery","val","ok","Billing address required","A billing address with a valid email is required.","PreparePlaceOrderDetails",["prepSrc"],"FR-002",null,["no billing address","the shopper places the order","checkout fails with “Billing address is not provided”"]],
  [RP+"009","Addresses & delivery","val","ok","Billing country allowed","The billing country must allow billing.","PreparePlaceOrderDetails",["prepSrc"],"FR-002",null,null],
  [RP+"010","Addresses & delivery","def","inc","Pickup instead of shipping","When store pickup is allowed and a pickup point is selected, no shipping address is needed — even if the pickup point no longer exists.","PreparePlaceOrderDetails",["prepSrc"],"FR-006","C-05",["a selected pickup point that has been deleted","the shopper places the order","checkout asks for a valid pickup point or address (fails today)"]],
  [RP+"011","Addresses & delivery","val","inc","Shipping address required","Otherwise a shipping address is required, with a valid email and a country that allows shipping.","PreparePlaceOrderDetails",["prepSrc"],"FR-006","C-08",null],
  [RP+"012","Addresses & delivery","def","ok","Shipping status at order time","Orders that need shipping start as NotYetShipped; others as ShippingNotRequired.","PreparePlaceOrderDetails",["prepSrc"],"FR-006",null,null],
  [RP+"013","Totals","calc","ok","Totals must be calculable","Shipping total and order total must both be calculable or the order fails.","PreparePlaceOrderDetails",["prepSrc"],"FR-007",null,null],
  [RP+"014","Totals","calc","ok","What the total includes","The order total includes subtotal and shipping discounts, the payment-method fee, tax, gift cards and redeemed reward points.","GetShoppingCartTotal",["prepSrc"],"FR-007",null,null],
  [RP+"015","Totals","def","ok","Tax display type","The customer's tax display choice applies when customers may choose; otherwise the store setting.","PreparePlaceOrderDetails",["prepSrc"],"FR-007",null,null],
  [RP+"016","Totals","calc","inc","Recurring cycles reuse totals","Each recurring payment copies the initial order's subtotal, discount, shipping, tax and total.","PreparePlaceOrderDetailsForRecurringPayment",["recurSrc"],"FR-010","C-06",null],
  [RP+"017","Placing the order","con","inc","Pay, then save","The payment is processed before the order is saved; a failure afterwards does not void it.","PlaceOrder",["placeOrder"],"FR-008","C-01",["a successful payment and an order save that fails","the shopper places the order","the payment is voided (fails today)"]],
  [RP+"018","Placing the order","trig","ok","After the order is saved","Reward points are deducted, notifications sent, status checked, customer updated, OrderPlacedEvent published; paid orders are processed as paid.","PlaceOrder",["placeOrder"],"FR-009",null,null],
  [RP+"019","Placing the order","con","inc","One outcome per checkout","Errors after the order is saved are returned as a failed checkout.","PlaceOrder",["placeOrder"],"FR-008","C-07",["an order saved and a notification that fails","the response returns","the shopper sees a successful order (fails today)"]],
  [RP+"020","Placing the order","val","ok","Declined payments","A declined payment produces “Checkout.PaymentError” messages and no order.","PlaceOrder",["placeOrder"],"FR-008",null,["a declined payment","the shopper places the order","no order is saved and the payment error is shown"]],
  [RP+"021","Order status","trig","ok","Pending → Processing","A pending order becomes Processing once its payment is authorized or paid, or any of it ships.","CheckOrderStatus",["statusSrc"],"FR-011",null,["a pending order","its payment becomes Paid","the order becomes Processing"]],
  [RP+"022","Order status","trig","ok","→ Complete","A paid order completes when no shipping is needed, or when shipped — or only when delivered if CompleteOrderWhenDelivered is on.","CheckOrderStatus",["statusSrc"],"FR-011",null,null],
  [RP+"023","Order status","def","ok","Paid date","A paid order without a paid date gets the current time.","CheckOrderStatus",["statusSrc"],"FR-011",null,null],
  [RP+"024","Cancellation","val","ok","Only cancellable orders","Orders that fail CanCancelOrder cannot be cancelled.","CancelOrder",["cancelSrc"],"FR-012",null,null],
  [RP+"025","Cancellation","trig","ok","Side effects reversed","Cancelling returns redeemed reward points and cancels reservations, bids and discount usage.","CancelOrder",["cancelSrc"],"FR-012",null,["a cancellable order with 100 redeemed points","staff cancel it","the 100 points are returned"]],
  [RP+"026","Cancellation","calc","inc","Inventory restored once","Cancelling should restore stock once per item; shipped items are reversed and then adjusted again.","CancelOrder",["cancelSrc"],"FR-012","C-03",null],
  [RP+"027","Cancellation","trig","inc","Recurring payments stopped","Cancelling should stop recurring payments; the cancellation is started without being awaited or checked.","CancelOrder",["cancelSrc"],"FR-012","C-02",null],
  [RP+"028","Cancellation","con","ne","Paid orders refunded","Cancelling a paid order does not refund or void the payment.","CancelOrder",["cancelSrc"],"FR-012","C-04",null],
];
const R_FLAGGED = RULES.filter(r=>r[3]!=="ok").length;
let rulesView = "catalog", rulesFilter = "All";
function setRules(v,f){ if(v) rulesView=v; if(f!==undefined) rulesFilter=f; document.getElementById("doc").innerHTML = bizRules(); paintGrounding(); }
function goClar(){ specTab="clar"; go("#/ws/spec"); }
function goSpec(){ specTab="spec"; go("#/ws/spec"); }
function bizRules(){
  STMTS = []; RULES.forEach(ruleCard); rulesTables(); const all = STMTS; STMTS = []; const body = rulesView==="catalog" ? rulesCatalog() : rulesTables(); STMTS = all;
  return `<div class="doc-head"><div><div class="eyebrow">Business Rules · as-is</div><h1>${SHOW_H}</h1><div class="meta">From the order-processing code returned by CAST Imaging · ${RULES.length} rules · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(RULE_FILES,'Business rules bundle','Markdown, Gherkin and JSON.')">Export for agents</button></div></div>${domainBar("business rules")}
  <div class="rkpis"><div class="kpi"><div class="v">${RULES.length}</div><div class="l">Rules extracted</div></div><div class="kpi"><div class="v">${R_CATS.length}</div><div class="l">Categories</div></div>
    <div class="kpi" onclick="setRules('catalog','flag')"><div class="v">${R_FLAGGED}</div><div class="l">Need a decision</div></div><div class="kpi"><div class="v">${RULES.filter(r=>r[10]).length}</div><div class="l">Test scenarios</div></div></div>
  <div class="grounding" id="grounding"></div><div class="tabs"><button class="tab ${rulesView==="catalog"?"on":""}" onclick="setRules('catalog')">Rule catalog</button><button class="tab ${rulesView==="tables"?"on":""}" onclick="setRules('tables')">Decision tables</button></div>${body}`;
}
function rulesTables(){
  return `<div class="dtable" style="margin-top:22px"><h3>Which order status?</h3><p class="sub">${RP}021 – 022</p><div class="tblwrap"><table class="tbl"><thead><tr><th>Payment</th><th>Shipping</th><th>CompleteOrderWhenDelivered</th><th>Status</th></tr></thead><tbody>
    <tr><td>Pending</td><td>not shipped</td><td>any</td><td class="out">${X("Pending","statusSrc")}</td></tr><tr><td>Authorized</td><td>not shipped</td><td>any</td><td class="out">${X("Processing","statusSrc")}</td></tr>
    <tr><td>Paid</td><td>shipping not required</td><td>any</td><td class="out">${X("Complete","statusSrc")}</td></tr><tr><td>Paid</td><td>Shipped</td><td>Off</td><td class="out">${X("Complete","statusSrc")}</td></tr>
    <tr><td>Paid</td><td>Shipped</td><td>On</td><td class="out">${X("Processing — until delivered","statusSrc")}</td></tr><tr><td>Pending</td><td>Shipped</td><td>any</td><td class="out">${X("Processing","statusSrc")}</td></tr></tbody></table></div></div>
  <div class="dtable"><h3>Where does the order ship?</h3><p class="sub">${RP}010 – 012</p><div class="tblwrap"><table class="tbl"><thead><tr><th>Needs shipping</th><th>Pickup allowed & selected</th><th>Pickup point exists</th><th>Outcome</th></tr></thead><tbody>
    <tr><td>No</td><td>—</td><td>—</td><td class="out">${X("ShippingNotRequired, no address","prepSrc")}</td></tr><tr><td>Yes</td><td>Yes</td><td>Yes</td><td class="out">${X("Pickup in store","prepSrc")}</td></tr>
    <tr class="hl"><td>Yes</td><td>Yes</td><td>No</td><td class="out">${X("Pickup flagged, no point, no address (C-05)","prepSrc")}</td></tr><tr><td>Yes</td><td>No</td><td>—</td><td class="out">${X("Shipping address required (valid email, allowed country)","prepSrc")}</td></tr></tbody></table></div></div>`;
}
function mdRules(){ const L = [`# Business Rules: ${SHOW} (as-is)`,""]; R_CATS.forEach(c=>{ L.push(`## ${c}`,""); RULES.filter(r=>r[1]===c).forEach(r=>L.push(`### ${r[0]} — ${r[4]}`,"",r[5],"",`- Status: ${R_STAT[r[3]][1]} · Enforced in \`${r[6]}\`${r[9]?` · ${r[9]}`:""}`,"")); }); return L.join("\n"); }
function featureRules(){ const L = [`Feature: ${SHOW} business rules (${APP}, as-is)`,""]; RULES.filter(r=>r[10]).forEach(r=>{ const [g,w,t]=r[10]; L.push(`  @${r[0]}${r[3]!=="ok"?" @fails-today":""}`,`  Scenario: ${r[4]}`,`    Given ${g}`,`    When ${w}`,`    Then ${t.replace(/ \(fails today[^)]*\)/,"")}`,""); }); return L.join("\n"); }
function jsonRules(){ return JSON.stringify({ domain:"checkout-orders", rules: RULES.map(r=>({id:r[0],category:r[1],status:R_STAT[r[3]][1],title:r[4],statement:r[5],enforcedIn:r[6]})) }, null, 2); }
const RULE_FILES = [["rules/checkout-orders/business-rules.md", mdRules],["rules/checkout-orders/checkout-orders.feature", featureRules],["rules/checkout-orders/business-rules.json", jsonRules]];

/* =====================================================================
   USER STORIES
   ===================================================================== */
const EPICS = [["EP-01","Place an order","User Story 1"],["EP-02","Addresses and delivery","User Story 2"],["EP-03","Minimums, warnings and totals","User Story 3"],["EP-04","Order lifecycle","User Story 4"],["EP-05","Cancel an order","User Story 5"]];
const STORIES = [
  ["CO-US-01","EP-01","Place an order with the classic checkout","shopper","to confirm my order after reviewing it","I get what I chose at the price shown","Checkout/Confirm","Checkout/ConfirmOrder",244,[RP+"018",RP+"020"],[],"FR-008",null,"ok",["placeOrder","coTx"]],
  ["CO-US-02","EP-01","Place an order with one-page checkout","shopper","to do the whole checkout on one page","checking out is quick","OnePageCheckout","Checkout/OpcConfirmOrder",257,[RP+"018"],[],"FR-008",null,"ok",["placeOrder","coTx"]],
  ["CO-US-03","EP-01","Never be charged without an order","shopper","an order every time I am charged","I don't pay twice or lose my money","— server side","IOrderProcessingService.PlaceOrder",244,[RP+"017",RP+"019"],[],"FR-008","C-01","issue",["placeOrder"]],
  ["CO-US-04","EP-01","Check out as a guest","guest shopper","to buy without an account when the store allows it","I can buy quickly","Checkout/Index","Checkout/Index",65,[RP+"002"],[],"FR-001",null,"ok",["prepSrc"]],
  ["CO-US-05","EP-02","Give my billing address","shopper","to use a saved billing address or add one","my invoice is right","BillingAddress","Checkout/OpcSaveBilling",985,[RP+"008",RP+"009"],[],"FR-002",null,"ok",["prepSrc","coTx"]],
  ["CO-US-06","EP-02","Ship to my address","shopper","to choose where my order is delivered","it arrives at the right place","ShippingAddress","Checkout/OpcSaveShipping",974,[RP+"011",RP+"012"],[],"FR-006","C-08","issue",["prepSrc","coTx"]],
  ["CO-US-07","EP-02","Pick up in store","shopper","to collect my order at a pickup point","I save on shipping","ShippingMethod","Checkout/OpcSaveShippingMethod",542,[RP+"010"],[],"FR-006","C-05","issue",["prepSrc"]],
  ["CO-US-08","EP-03","Respect minimum order amounts","store owner","orders below my minimums refused","small orders don't cost me money","— server side","Checkout/ConfirmOrder",244,[RP+"006",RP+"007"],[],"FR-005",null,"ok",["prepSrc"]],
  ["CO-US-09","EP-03","See the right total","shopper","a total that includes my discounts, gift cards and points","I pay exactly what I expect","Confirm","Checkout/Confirm",80,[RP+"013",RP+"014",RP+"015"],[],"FR-007",null,"ok",["prepSrc"]],
  ["CO-US-10","EP-03","Recurring orders at current prices","subscriber","each cycle charged at the current price and tax","my invoices are correct","— recurring task","PlaceOrder (recurring)",null,[RP+"016"],[],"FR-010","C-06","issue",["recurSrc"]],
  ["CO-US-11","EP-04","Track my order's status","shopper","my order's status to follow payment and shipping","I know where it is","Order details","IOrderProcessingService.CheckOrderStatus",null,[RP+"021",RP+"022",RP+"023"],[],"FR-011",null,"ok",["statusSrc"]],
  ["CO-US-12","EP-05","Cancel an order","store staff","to cancel an order and undo its effects","stock, points and discounts are right again","Admin · Order/CancelOrder","Order/CancelOrder",null,[RP+"024",RP+"025",RP+"026"],[],"FR-012","C-03","issue",["cancelSrc"]],
  ["CO-US-13","EP-05","Stop subscriptions on cancellation","subscriber","recurring payments stopped when the order is cancelled","I'm not charged again","Admin · Order/CancelOrder","Order/CancelOrder",null,[RP+"027"],[],"FR-012","C-02","issue",["cancelSrc"]],
  ["CO-US-14","EP-05","Refund a cancelled paid order","shopper","my money back when a paid order is cancelled","I'm not out of pocket","Admin · Order/CancelOrder","Order/CancelOrder",null,[RP+"028"],[],"FR-012","C-04","idle",["cancelSrc"]],
];
const S_STAT = { ok:["ok","Works as described"], issue:["issue","Known issue"], idle:["idle","Not implemented"] };
function userStories(){
  STMTS = []; const list = EPICS.map(([eid,et,src])=>{ const ss = STORIES.filter(s=>s[1]===eid); return `<div class="epichead" id="ep-${eid}"><code>${eid}</code><h3>${et}</h3><span style="font-size:13px;color:var(--muted)">${ss.length} stories · expands ${src}</span></div>` + ss.map(storyCard).join(""); }).join("");
  const map = EPICS.map(([eid,et])=>`<div><div class="epic"><small>${eid}</small>${et}</div>${STORIES.filter(s=>s[1]===eid).map(s=>`<div class="scard ${s[13]==="ok"?"":s[13]}" onclick="focusStory('${s[0]}')"><code>${s[0]}</code>${s[2]}</div>`).join("")}</div>`).join("");
  return `<div class="doc-head"><div><div class="eyebrow">User Stories · as-is</div><h1>${SHOW_H}</h1><div class="meta">${STORIES.length} stories in ${EPICS.length} epics · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(STORY_FILES,'User stories bundle','Jira CSV and Markdown.')">Export for agents</button></div></div>${domainBar("user stories")}
  <div class="rkpis"><div class="kpi"><div class="v">${STORIES.length}</div><div class="l">Stories</div></div><div class="kpi"><div class="v">${EPICS.length}</div><div class="l">Epics</div></div><div class="kpi"><div class="v">${STORIES.filter(s=>s[13]==="issue").length}</div><div class="l">With a known issue</div></div><div class="kpi"><div class="v">${STORIES.filter(s=>s[13]==="idle").length}</div><div class="l">Not implemented</div></div></div>
  <div class="grounding" id="grounding"></div><h2>Story map</h2><div class="smap">${map}</div>${list}`;
}
function mdStories(){ const L = [`# User Stories: ${SHOW} (as-is)`,""]; STORIES.forEach(s=>{ L.push(`### ${s[0]} — ${s[2]}`,"",`**As a** ${s[3]}, **I want** ${s[4]}, **so that** ${s[5]}.`,"",...acText(s).map((a,i)=>`${i+1}. ${a}`),""); }); return L.join("\n"); }
function csvStories(){ const q = v => `"${String(v).replace(/"/g,'""')}"`; return [["Issue Type","Issue key","Summary","Epic Link","Description"],...STORIES.map(s=>["Story",s[0],s[2],s[1],`As a ${s[3]}, I want ${s[4]}, so that ${s[5]}.`])].map(r=>r.map(q).join(",")).join("\n"); }
const STORY_FILES = [["stories/checkout-orders/user-stories.md", mdStories],["stories/checkout-orders/jira-import.csv", csvStories]];
