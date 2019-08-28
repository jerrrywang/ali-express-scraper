# aliexpress-scraper

I wanted to learn Google's Puppeteer, so I built an AliExpress scraper!

Given an AliExpress product feedback url (found in the reviews iframe of any AliExpress product page), getAllAliExpressReviews() will scrape all of the product's reviews and save the reviews to a CSV file.

getAllAliExpressReviews() takes an optional "options" parameter, where the scraper can be configured to translate all reviews to English, only return the English reviews, or only return a specific rating of reviews (eg: only five star reviews).

Starting:
```
npm start
```

Configure index.js with the desired url, file name, and options:
```
getAllAliExpressReviews(
  "INSERT URL HERE", // eg: "//feedback.aliexpress.com/display/productEvaluation"
  "INSERT FILE NAME HERE" // eg: transparent_glasses
  {
    reviewTypes: [1, 2, 3, 4, 5],
    translate: false,
    englishOnly: true
  }
);
```
I'm always looking to improve my code and my understanding of new technologies. If you have any questions or feedback, feel free to shoot me an email at wangjerr@usc.edu!
