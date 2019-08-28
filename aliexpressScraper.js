const puppeteer = require("puppeteer");
const dayjs = require("dayjs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const _ = require("lodash");

const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();

/**
 *
 *
 * @param {String} url = ali-express url to scrape
 * @param {Object} csvWriter = csv-writer instance
 * @param {Object} options = {translate, englishOnly, reviewType}
 */

const getAliExpressReviews = async (url, csvWriter, options) => {
  // Open the browser and go to the given url
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  if (options.translate) {
    // Uncheck on the "translate" button, which automatically translates non-english reviews
    await page.waitFor("#cb-translate");
    await page.click("#cb-translate");
  }

  // Grab only the reviews for the given reviewType
  await page.waitFor(".fb-star-list-href");
  const reviewButtons = await page.$$(".fb-star-list-href");
  const reviewsButton = reviewButtons[5 - options.reviewType];

  await reviewsButton.click();

  // Keep track of how many pages of reviews for the given reviewType
  await page.waitFor(".fb-star-selector");
  const reviewCount = Number(
    (await page.evaluate(
      () => document.querySelector(".fb-star-selector").innerText
    ))
      .split(" ")[2]
      .slice(1)
      .slice(0, -1)
  );
  const reviewPages = Math.floor(reviewCount / 10);

  // Scrape all the reviews on the first page
  const reviews = await page.evaluate(() =>
    [...document.querySelectorAll(".buyer-feedback:not(.r-time-new)")].map(
      el => ({
        review: el.querySelector("span").innerText.trim(),
        date: el.querySelectorAll("span")[1].innerText.trim()
      })
    )
  );

  // Get the reviews for the rest of the pages
  (async function() {
    for (let i = 2; i < reviewPages; i++) {
      // Navigate to the next page
      await page.waitFor("a.ui-pagination-next.ui-goto-page");
      const nextButtonData = await page.$$("a.ui-pagination-next.ui-goto-page");
      const nextButton = [...nextButtonData][1];

      await nextButton.click();
      await page.waitFor(".buyer-feedback");
      await page.waitFor(".buyer-feedback > span");

      // Scrape all the reviews on this page
      const reviewsFromPage = await page.evaluate(() =>
        [...document.querySelectorAll(".buyer-feedback")].map(el => ({
          review: el.querySelector("span").innerText.trim(),
          date: el.querySelectorAll("span")[1].innerText.trim()
        }))
      );

      // Push the scraped reviews into the original reviews array
      reviews.push(reviewsFromPage);
    }

    // All reviews for the given reviewType has been scraped...

    let formattedReviews;
    if (options.translate) {
      // Filter out the non-english reviews
      const englishReviews = _.flatten(reviews).filter(({ review }) => {
        const language = lngDetector.detect(review, 1);
        return !_.isEmpty(language) ? language[0][0] === "english" : false;
      });

      // Format the reviews for the CSV file
      formattedReviews = englishReviews.map(el => ({
        rating: reviewType,
        body: el.review,
        created_at: dayjs(el.date).format("YYYY-MM-DD")
      }));
    } else {
      formattedReviews = _.flatten(reviews).map(el => ({
        rating: reviewType,
        body: el.review,
        created_at: dayjs(el.date).format("YYYY-MM-DD")
      }));
    }

    // Write formatted reviews to the CSV file
    return csvWriter.writeRecords(formattedReviews).catch(e => console.log(e));
  })();
};

/**
 *
 *
 * @param {String} url = aliexpress url to scrape
 * @param {String} filename = csv file name to save reviews to
 * @param {Object} options = {translate, englishOnly, reviewTypes}
 */

const getAllAliExpressReviews = (
  url,
  filename = `results-${dayjs().format("YYYY-MM-DD")}`,
  options = {
    reviewTypes: [1, 2, 3, 4, 5],
    translate: false,
    englishOnly: true
  }
) => {
  const csvWriter = createCsvWriter({
    path: `${filename}.csv`,
    append: true,
    header: [
      { id: "rating", title: "rating" },
      { id: "body", title: "body" },
      { id: "created_at", title: "created_at" }
    ]
  });

  reviewTypes.forEach(reviewType =>
    getAliExpressReviews("https:" + url, csvWriter, { ...options, reviewType })
  );
};

module.exports = getAllAliExpressReviews;
