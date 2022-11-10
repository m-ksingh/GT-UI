/* Note : Calling Api Standard
* E.g : getListing Axios call accept params in following seq
* Url : service url
  payload : post data
  param : url parameter
  config : if config object
  config = {
    loader : '#container'  //loader will show for the div having id = 'container'
  }
  if any api fails or empty response comes then related messge will be shown

  Ex:
  getListing(payload,config) {
    var params ={
      viewType :'detail'
    };
    return AxiosService.post('/api/listing', payload,params,config);
  },

*
*/
import _ from "lodash";
import AxiosService from "./axios.service.js";

const ApiService =  {
  login(headers) {
    return AxiosService.post("/am/v1/login", {}, {}, headers);
  },
  logout(sid) {
    return AxiosService.get("/mp/v1/logout/" + sid);
  },
  sociallogin(payload) {
    return AxiosService.post("/am/v1/social/signup", payload);
  },
  register(payload) {
    return AxiosService.post("/am/v1/signup", payload);
  },
  verifyEmailId(sid) {
    return AxiosService.get("/am/v1/verify/email/" + sid);
  },
  requestEmailLink(recipientEmail) {
    return AxiosService.get("/am/v1/request/email/verification/" + recipientEmail);
  },
  getCategories() {
    return AxiosService.get("/mp/v1/categories");
  },
  getListByArg(arg) {
    return AxiosService.get("/mp/v1/get/" + arg);
  },
  getLocationByOrderid(arg) {
    return AxiosService.get("/mp/v1/find-chosen-meet-location-coordinates?sid="+arg);
  },
  getMyLists(userSid) {
    return AxiosService.get("/mp/v1/get/active/listings/" + userSid);
  },
  getMyUnOrderedLists(userSid) {
    return AxiosService.get("/mp/v1/get/listing/unordered/" + userSid);
  },
  getMyUnOrderedListsBySpecific(payload) {
    return AxiosService.post("/mp/v1/filter/listing/unordered", payload);
  },
  uploadMultiPart(formData) {
    return AxiosService.post("/am/v1/upload", formData);
  },
  getMyStoreList(userSid) {
    return AxiosService.get("/mp/v1/get/dealer/ffl/stores/" + userSid);
  },
  createListing(payload) {
    return AxiosService.post("/mp/v1/create/listing", payload);
  },
  validateEditListing(sid) {
    return AxiosService.get("/mp/v1/validate/edit/listing/" + sid);
  },
  clearAllViewedNotifications(sid) {
    return AxiosService.get("/mp/v1/clear/all/viewed/notifications/" + sid);
  },
  deleteListing(sid) {
    return AxiosService.delete("/mp/v1/delete/listing/" + sid);
  },
  deleteAdminList(sid) {
    return AxiosService.delete("/am/v1/remove/admin/from/ffl/" + sid);
  },
  createIncompleListing(payload) {
    return AxiosService.post("/mp/v1/create/listing/incomplete/info", payload);
  },
  getAllIncompleListings(sid) {
    return AxiosService.get("/mp/v1/find/all/incomplete/listings/" + sid);
  },
  deleteIncompleListing(sid) {
    return AxiosService.delete("/mp/v1/delete/incomplete/listing/" + sid);
  },
  getIncompleteListingDetails(sid) {
    return AxiosService.get("/mp/v1/find/incomplete/listing/" + sid);
  },
  validateActiveListing(sid) {
    return AxiosService.get("/mp/v1/validate/active/listing/" + sid);
  },
  manageQuantity(listingSid, quantity) {
    return AxiosService.get("/mp/v1/manage/quantity/" + listingSid + "/" + quantity)
  },
  getFflStoreList(payload) {
    return AxiosService.post("/mp/v1/find/all/ffl", payload);
  },
  createBulkListing(payload) {
    return AxiosService.post("/mp/v1/create/bundled/listings", payload);
  },
  getBulkListing(sid) {
    return AxiosService.get(`/mp/v1/get/bundled/listings/${sid}`);
  },
  getPlatformVariables() {
    return AxiosService.get("/am/v1/platform/variables");
  },
  searchProducts(payload) {
    let extnPath = (!_.isEmpty(payload) && !_.isEmpty(payload?.title) && "/title") || "";
    return AxiosService.post(`/mp/v1/filter/listing${extnPath}`, payload);
  },
  productDetail(payload) {
    return AxiosService.post("/mp/v1/get/listing/details", payload);
  },
  myCards(userSid) {
    return AxiosService.get("/am/v1/get/card/" + userSid);
  },
  postCarts(payload) {
    return AxiosService.post("/mp/v1/cart", payload);
  },
  updateWishList(payload) {
    return AxiosService.put("/am/v1/update/wishlist", payload);
  },
  addWishList(payload) {
    return AxiosService.post("/am/v1/add/wishlist", payload);
  },
  getWishList(userSid) {
    return AxiosService.get("/am/v1/wishlist/ausid/" + userSid);
  },
  deleteWishList(appuserSid) {
    return AxiosService.delete("/mp/v1/wishlist/ausid/" + appuserSid);
  },
  removeWishListByUser(appuserSid,listSid) {
    return AxiosService.delete(`/am/v1/wishlist/ausid/${appuserSid}/ldsid/` + listSid);
  },
  getMyTransactions(payload) {
    return AxiosService.post("/mp/v1/find/my/transactions/details", payload);
  },
  searchTransaction(payload) {
    return AxiosService.post("/mp/v1/search/orders", payload);
  },
  getAllTradeOffer(appuserSid, listingDetailsSid) {
    return AxiosService.get(`/mp/v1/find/trade/offers/received/` + appuserSid + "/" + listingDetailsSid);
  },
  getPriceDetails(orderDetailsSid) {
    return AxiosService.get(`/mp/v1/find/order/price/details/` + orderDetailsSid);
  },
  viewOtherTradeItems(orderHasListingDetailsSid, tradeOfferListingSid) {
    return AxiosService.get(`/mp/v1/find/all/other/trade/items/${orderHasListingDetailsSid}/${tradeOfferListingSid}`);
  },
  getAllPlaced(appuserSid) {
    return AxiosService.get(`/mp/v1/get/all/bid/` + appuserSid);
  },
  getAllReceived(appuserSid) {
    return AxiosService.get(`/mp/v1/get/all/listings/bid/` + appuserSid);
  },
  acceptRejectBidTrade(status, sid, userType) {
    return AxiosService.get(`/mp/v1/order/` + status + '/' + sid + '/' + userType);
  },
  rejectBid(payload) {
    return AxiosService.post(`/mp/v1/reject/bid`, payload);
  },
  rejectCounterTradeByBuyer(ohld, prevAmount) {
    return AxiosService.get("/mp/v1/reject/tradeCounter/by/" + ohld + "/" + prevAmount);
  },
  cancelOrder(orderDetailsSid, quantity) {
    return AxiosService.get(`/mp/v1/cancel/order/` + orderDetailsSid + "/" + quantity);
  },
  cancelBid(sid) {
    return AxiosService.get(`/mp/v1/cancel/bid/`+ sid);
  },
  getTradeOfferPlaced(appuserSid) {
    return AxiosService.get(`/mp/v1/get/active/trade/offer/posted/` + appuserSid);
  },
  getMyCarts(userSid) {
    return AxiosService.get('/mp/v1/cart/' + userSid)
  },
  placeOrder(payload) {
    return AxiosService.post("/mp/v1/place/order", payload);
  },
  getMyProfile(userSid) {
    return AxiosService.get('/am/v1/appuser/' + userSid)
  },
  saveMyProfile(payload) {
    return AxiosService.post("/am//v1/appuser", payload);
  },
  myOrders(userSid) {
    return AxiosService.get('/mp/v1/get/orders/' + userSid + '/details')
  },
  getAllOrders(userSid){
    return AxiosService.get('/mp/v1/get/orders/' + userSid)
  },
  getOrderHistory(sid) {
    return AxiosService.get('/mp/v1/get/order/history/' + sid)
  },
  getMyActiveSells(sid) {
    return AxiosService.get('/mp/v1/get/my/sales/order/' + sid + '/details')
  },
  getMyCompletedSells(sid) {
    return AxiosService.get('/mp/v1/get/my/sales/completed/order/' + sid + '/details')
  },
  myPastOrders(userSid) {
    return AxiosService.get('/mp/v1/get/completed/orders/' + userSid + '/details')
  },
  returnOrder(ohlSid) {
    return AxiosService.get('/mp/v1/return/order/' + ohlSid)
  },
  scheduleOrderReturn(payload) {
    return AxiosService.post('/mp/v1/schedule/order/return', payload)
  },
  rejectOrderReturn(orderDetailsSid) {
    return AxiosService.get('/mp/v1/reject/order/return/' + orderDetailsSid)
  },
  getReturnDateSlots(returnDetailsSid) {
    return AxiosService.get('/mp/v1/get/return/slots/' + returnDetailsSid)
  },
  confirmReturnDate(sid) {
    return AxiosService.get('/mp/v1/confirm/return/date/' + sid)
  },
  returnRequestCode(orderDetailsSid) {
    return AxiosService.get('/mp/v1/return/code/' + orderDetailsSid)
  },
  completeOrderReturn(orderDetailsSid, otp) {
    return AxiosService.get('/mp/v1/complete/return/' + orderDetailsSid + "/" + otp)
  },
  requestSecretCode(orderDetailsSid) {
    return AxiosService.get('/mp/v1/get/secret/code/' + orderDetailsSid)
  },
  completeTransaction(orderDetailsSid, otp) {
    return AxiosService.get('/mp/v1/complete/order/purchase/' + orderDetailsSid + "/" + otp)
  },
  myBids(userSid) {
    return AxiosService.get('/mp/v1/get/bids/' + userSid)
  },
  bidCount(productId) {
    return AxiosService.get('/mp/v1/get/listing/bid/count/' + productId)
  },
  getBidAmount(sid, appuserSid) {
    return AxiosService.get("/mp/v1/get/listing/bid/count/" + sid + "/appuser/" + appuserSid);
  },
  fifteenMinBidRule(sid) {
    return AxiosService.get("/mp/v1/trigger/fifteen/min/rule/" + sid);
  },
  getTradeOffer(userSid){
    return AxiosService.get('/mp/v1/get/trade/offers/' + userSid)
  },
  getTradeReceived(userSid){
    return AxiosService.get('/mp/v1/get/active/trade/offer/posted/' + userSid)
  },
  rejectTrade(payload) {
    return AxiosService.post(`/mp/v1/reject/trade`, payload);
  },
  acceptTrade(payload) {
    return AxiosService.post(`/mp/v1/accept/trade`, payload);
  },
  getAllNotificationsList(payload) {
    return AxiosService.post(`/mp/v1/get/notifications/list`, payload);
  },
  getAllAlarmNotificationsList(payload) {
    return AxiosService.post(`/mp/v1/get/alarm/notifications/list`, payload);
  },
  scheduledPickUpList(payload) {
    return AxiosService.post(`/mp/v1/schedule/pickup`, payload);
  },
  getPickUpDateList(ohlSid) {
    return AxiosService.get('/mp/v1/get/pickup/dates/' + ohlSid);
  },
  confirmPickUpDate(payload) {
    return AxiosService.post('/mp/v1/confirm/pickup/date', payload);
  },
  fflCheck(payload) {
    return AxiosService.post("/am/v1/fflcheck", payload);
  },
  fflStoreAvailability(lNumber) {
    return AxiosService.get("/mp/v1/find/" + lNumber);
  },
  addStore(userSid, payload) {
    return AxiosService.post("/am/v1/create/ffl_store/" + userSid, payload);
  },
  updateStore(userSid, payload) {
    return AxiosService.put("/am/v1/update/ffl_store/" + userSid, payload);
  },
  renewStoreLicense(payload) {
    return AxiosService.post("/am/v1/request/store/renewal", payload);
  },
  getMyStores(userSid) {
    return AxiosService.get("/am/v1/get/store/" + userSid);
  },
  storeDetails(storeSid) {
    return AxiosService.get("/am/v1/view/store/admin/" + storeSid);
  },
  getStoreListings(payload) {
    return AxiosService.post("/mp/v1/filter/listing", payload);
  },
  storeUpcomingOrders(storeSid) {
    return AxiosService.get("/mp/v1/get/orders/store/" + storeSid);
  },
  storePastOrders(storeSid) {
    return AxiosService.get("/mp/v1/get/orders/store/" + storeSid + "/completed");
  },
  dashboardSalesInfo(payload) {
    return AxiosService.post("/mp/v1/get/dealer/dashboard/counts", payload);
  },
  fflStoreListByZipCode(zipCode) {
    return AxiosService.get("/mp/v1/get/ffl/store/list/by/" + zipCode);
  },
  changePassword(password, newpassword, userSid) {
    return AxiosService.put("/am/v1/reset/password/" + password + "/newpass/" + newpassword + "/user/" + userSid);
  },
  forgotPassword(payload) {
    return AxiosService.post("/am/v1/forgot/password", {}, {}, payload);
  },
  getSheriffLocation(payload) {
    return AxiosService.post("/mp/v1/tomotom", payload);
  },
  getTomTomResultByZipcode(payload) {
    return AxiosService.post("/mp/v1/tomotom/zipcode", payload);
  },
  getStore(storeSid) {
    return AxiosService.get("/am/v1/get/store/by/" + storeSid);
  },
  resetStore(storeSid) {
    return AxiosService.get("/am/v1/fflstore/reset/" + storeSid);
  },
  populateApprovedStore(appUserSid) {
    return AxiosService.get("/am/v1/fflstore/" + appUserSid + "/approved");
  },
  populateUnSavedStore(appUserSid) {
    return AxiosService.get("/am/v1/fflstore/" + appUserSid + "/unreviewed");
  },
  getAdminsByStore(storeSid) {
    return AxiosService.get("/am/v1/view/store/admin/" + storeSid);
  },
  addAdmin(userSid, storeSid, payload) {
    return AxiosService.post("/am/v1/add/ffl_store/admin/" + userSid + '/' + storeSid,  payload);
  },
  counterTrade({amount, sid, orderHasListingSid, type} ) {
    return AxiosService.get("/mp/v1/counter/trade/" + amount + "/by/"+ sid +"/ohl/" + orderHasListingSid + '/' + type );
  },
  authenticateOtp(otp, ohl) {
    return AxiosService.get("/mp/v1/enter/" + otp + "/" + ohl);
  },
  arrivedSeller(ohl) {
    return AxiosService.get("/mp/v1/seller/" + ohl);
  },
  saveLocation(payload) {
    return AxiosService.post("/mp/v1/save/location", payload);
  },
  arrivedSellerWithLocation(ohl, payload) {
    return AxiosService.post("/mp/v1/seller/" + ohl, payload);
  },
  updateNotification(ohl) {
    return AxiosService.put("/mp/v1/update/notification/action/" + ohl);
  },
  changeNotifAlert(appUser) {
    return AxiosService.put("/mp/v1/update/all/status/" + appUser);
  },
  arrivedBuyer(ohl) {
    return AxiosService.get("/mp/v1/generate/buyer/otp/" + ohl);
  },
  arrivedBuyerWithLocation(ohl, payload) {
    return AxiosService.post("/mp/v1/generate/buyer/otp/" + ohl, payload);
  },
  resetPassword(password, token, userSid) {
    return AxiosService.put("/am/v1/update/password/token/" + token + '/user/' + userSid + '/pass/' + password,  {});
  },
  appUserByToken(token) {
    return AxiosService.post("/am/v1/forgot/" + token);
  },
  issueTypeList(type) {
    return AxiosService.get("/mp/v1/get/all/delivery/issues/" + type);
  },
  reportIssue(payload) {
    return AxiosService.post("/mp/v1/report/problem", payload);
  },
  shareExperiance(payload) {
    return AxiosService.post("/mp/v1/share/experience", payload);
  },
  getSellerRating(payload) {
    return AxiosService.get(`/mp/v1/get/reviews/by/seller/${payload.sid}/${payload.startPage}/${payload.noOfData}`);
  },
  getListingRating(payload) {
    return AxiosService.get(`/mp/v1/get/reviews/by/listing/${payload.sid}/${payload.startPage}/${payload.noOfData}`);
  },
  filterListingCount(payload) {
    let extnPathCount = (!_.isEmpty(payload) && !_.isEmpty(payload?.title) && "/title") || "";
    return AxiosService.post(`/mp/v1/filter/listing${extnPathCount}/count`, payload)
  },
  getLocationByPin(payload){
    return AxiosService.post("/mp/v1/tomotom/zipcode", payload)
  },
  isOfferedForTrade(payload) {
    return AxiosService.post("/mp/v1/toggle/listings", payload);
  },
  uploadCreateListing(appUserSid,fllSid,payload,header){
    return AxiosService.post("/mp/v1/upload/listings/"+ appUserSid + "/" + fllSid,payload,'',header)
  },
  getAllUser(){
    return AxiosService.get("/am/v1/find/all/users")
  },
  getManufacturer(){
    return AxiosService.get("/mp/v1/get/manufacturer")
  },
  createManufacturer(payload){
    return AxiosService.post("/mp/v1/create/manufacturer", payload)
  },
  getModel(){
    return AxiosService.get("/mp/v1/get/model")
  },
  createViewList(payload){
    return AxiosService.post("/mp/v1/create/view/listing", payload)
  },
  getViewListing(payload) {
    return AxiosService.post("/mp/v1/get/view/listing", payload)
  },
  completeDelivery(sid = "") {
    return AxiosService.put(`/mp/v1/complete/delivery/${sid}`, {})
  },
  listSearch(appuserSid,payload) {
    return AxiosService.post(`/mp/v1/past/searches/${appuserSid}`,payload)
  },
  isValidSerialNumber(sNumber) {
    return AxiosService.get("/mp/v1/verify/serial/" + sNumber)
  },
  getFflRequestList(payload, pageNumber, pageLimit) {
    return AxiosService.post("/am/v1/fflstores/" + pageNumber + "/" + pageLimit, payload);
  },
  getRenewFflRequestList(payload) {
    return AxiosService.get("/am/v1/get/ffl/store/renewal/requests");
  },
  updateFflStoreRequestStatus(payload) {
    return AxiosService.post("/am/v1/fflstores/review", payload);
  },
  fetchPlatformVariables(payload) {
    return AxiosService.get("/am/v1/platform/variables", payload);
  },
  savePlatformVariables(payload) {
    return AxiosService.post("/am/v1/platform/variables", payload);
  },
  getAllDisputes() {
    return AxiosService.get("/mp/v1/get/disputes")
  },
  resolveDispute(payload) {
    return AxiosService.post("/mp/v1/handle/dispute", payload)
  },
  getAllResolution() {
    return AxiosService.get("/mp/v1/get/all/resolutions")
  },
  createResolution(payload) {
    return AxiosService.post("/mp/v1/create/resolution", payload)
  },
  getService(payload){
    return AxiosService.post('/mp/v1/get/services',payload)
  },
  getCustomWishList(appuserSid) {
    return AxiosService.get(`/am/v1/custom/wishlist/${appuserSid}`);
  },
  createWishList(appuserSid,payload) {
    return AxiosService.put(`/am/v1/custom/wishlist/${appuserSid}`,payload);
  },
  updateCustomWishList(payload) {
    return AxiosService.post(`/am/v1/custom/wishlist`,payload);
  },
  deleteCustomWishList(wishListSid) {
    return AxiosService.delete(`/am/v1/custom/wishlist/${wishListSid}`);
  },
  provideShippingInfo(payload) {
    return AxiosService.post(`/mp/v1/provide/shipping/info`,payload);
  },
  
};

export default ApiService;
