const getAllAliExpressReviews = require("./aliexpressScraper");

getAllAliExpressReviews(
  "INSERT URL HERE", // eg: "//feedback.aliexpress.com/display/productEvaluation"
  "INSERT FILE NAME HERE" // eg: transparent_glasses
);

/*
Example function call:
  getAllAliExpressReviews(
    "//feedback.aliexpress.com/display/productEvaluation.htm?v=2&productId=32851172873&ownerMemberId=201744755&companyId=214317891&memberType=seller&startValidDate=&i18n=true",
    "transparent_glasses"
  );
*/
