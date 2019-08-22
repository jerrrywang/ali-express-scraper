const puppeteer = require("puppeteer");
const random = require("random-name");
const dayjs = require("dayjs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const _ = require("lodash");
const getRandomLocation = require("./cities");
const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();

const getAliExpressFiveStarReviews = async (url, csvWriter) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // await page.setViewport({
  //   width: 1920,
  //   height: 1080
  // });
  await page.goto(url);

  await page.waitFor("#cb-translate");
  await page.click("#cb-translate");

  await page.waitFor(".fb-star-list-href");
  const reviewButtons = await page.$$(".fb-star-list-href");
  const fiveStarReviews = reviewButtons[0];

  console.log("Now grabbing the five star reviews...");

  await fiveStarReviews.click();

  await page.waitFor(".fb-star-selector");
  const reviewCount = Number(
    (await page.evaluate(
      () => document.querySelector(".fb-star-selector").innerText
    ))
      .split(" ")[2]
      .slice(1)
      .slice(0, -1)
  );
  const fiveStarReviewPages = Math.floor(reviewCount / 10);

  const reviews = await page.evaluate(() =>
    [...document.querySelectorAll(".buyer-feedback:not(.r-time-new)")].map(
      el => ({
        review: el.querySelector("span").innerText.trim(),
        date: el.querySelectorAll("span")[1].innerText.trim()
      })
    )
  );

  (async function() {
    console.log(
      `Scraping the other ${fiveStarReviewPages - 1} five star review pages...`
    );

    for (let i = 2; i < fiveStarReviewPages; i++) {
      await page.waitFor("a.ui-pagination-next.ui-goto-page");
      const nextButtonData = await page.$$("a.ui-pagination-next.ui-goto-page");
      const nextButton = [...nextButtonData][1];

      await nextButton.click();
      await page.waitFor(".buyer-feedback");
      await page.waitFor(".buyer-feedback > span");

      const reviewsFromPage = await page.evaluate(() =>
        [...document.querySelectorAll(".buyer-feedback")].map(el => ({
          review: el.querySelector("span").innerText.trim(),
          date: el.querySelectorAll("span")[1].innerText.trim()
        }))
      );

      reviews.push(reviewsFromPage);
    }

    console.log(
      `Got all ${
        reviews.length
      } five star reviews. Now filtering out the non-english ones...`
    );
    const englishReviews = _.flatten(reviews).filter(({ review }) => {
      const language = lngDetector.detect(review, 1);
      return !_.isEmpty(language) ? language[0][0] === "english" : false;
    });

    console.log(
      `${
        englishReviews.length
      } five star reviews left. Now formatting for CSV...`
    );
    const formattedReviews = englishReviews.map(el => {
      const first = random.first();
      const last = random.last();

      return {
        product_handle: null,
        state: "published",
        rating: 5,
        title: null,
        author: `${first} ${last.charAt(0)}.`,
        email: `${_.lowerFirst(first)}${_.lowerFirst(last)}${Math.floor(
          Math.random() * 121
        )}@gmail.com`,
        location: getRandomLocation(),
        body: el.review,
        reply: null,
        created_at: dayjs(el.date).format("YYYY-MM-DD"),
        replied_at: null
      };
    });

    // console.log(formattedReviews);
    // console.log(formattedReviews.length);

    console.log("Writing five star reviews to file...");
    await csvWriter.writeRecords(formattedReviews).catch(e => console.log(e));

    console.log("Finished!");
  })();
};

const getAliExpressFourStarReviews = async (url, csvWriter) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // await page.setViewport({
  //   width: 1920,
  //   height: 1080
  // });
  await page.goto(url);

  await page.waitFor("#cb-translate");
  await page.click("#cb-translate");

  await page.waitFor(".fb-star-list-href");
  const reviewButtons = await page.$$(".fb-star-list-href");
  const fourStarReviews = reviewButtons[1];

  console.log("Now grabbing the four star reviews...");

  await fourStarReviews.click();

  await page.waitFor(".fb-star-selector");
  const reviewCount = Number(
    (await page.evaluate(
      () => document.querySelector(".fb-star-selector").innerText
    ))
      .split(" ")[2]
      .slice(1)
      .slice(0, -1)
  );
  const fourStarReviewPages = Math.floor(reviewCount / 10);

  const reviews = await page.evaluate(() =>
    [...document.querySelectorAll(".buyer-feedback:not(.r-time-new)")].map(
      el => ({
        review: el.querySelector("span").innerText.trim(),
        date: el.querySelectorAll("span")[1].innerText.trim()
      })
    )
  );

  (async function() {
    console.log(`Scraping the other ${fourStarReviewPages - 1} pages...`);
    for (let i = 2; i < fourStarReviewPages; i++) {
      await page.waitFor("a.ui-pagination-next.ui-goto-page");
      const nextButtonData = await page.$$("a.ui-pagination-next.ui-goto-page");
      const nextButton = [...nextButtonData][1];

      await nextButton.click();
      await page.waitFor(".buyer-feedback");
      await page.waitFor(".buyer-feedback > span");

      const reviewsFromPage = await page.evaluate(() =>
        [...document.querySelectorAll(".buyer-feedback")].map(el => ({
          review: el.querySelector("span").innerText.trim(),
          date: el.querySelectorAll("span")[1].innerText.trim()
        }))
      );

      reviews.push(reviewsFromPage);
    }

    console.log(
      `Got all ${
        reviews.length
      } reviews. Now filtering out the non-english ones...`
    );
    const englishReviews = _.flatten(reviews).filter(({ review }) => {
      const language = lngDetector.detect(review, 1);
      return !_.isEmpty(language) ? language[0][0] === "english" : false;
    });

    console.log(
      `${englishReviews.length} reviews left. Now formatting for CSV...`
    );
    const formattedReviews = englishReviews.map(el => {
      const first = random.first();
      const last = random.last();

      return {
        product_handle: null,
        state: "published",
        rating: 5,
        title: null,
        author: `${first} ${last.charAt(0)}.`,
        email: `${_.lowerFirst(first)}${_.lowerFirst(last)}${Math.floor(
          Math.random() * 121
        )}@gmail.com`,
        location: getRandomLocation(),
        body: el.review,
        reply: null,
        created_at: dayjs(el.date).format("YYYY-MM-DD"),
        replied_at: null
      };
    });

    // console.log(formattedReviews);
    // console.log(formattedReviews.length);

    console.log("Writing four star reviews to file...");

    await csvWriter.writeRecords(formattedReviews).catch(e => console.log(e));

    console.log("Finished!");
  })();
};

const getAliExpressReviews = (
  url,
  filename = `results-${dayjs().format("YYYY-MM-DD")}`
) => {
  const csvWriter = createCsvWriter({
    path: `${filename}.csv`,
    append: true,
    header: [
      { id: "product_handle", title: "product_handle" },
      { id: "state", title: "state" },
      { id: "rating", title: "rating" },
      { id: "title", title: "title" },
      { id: "author", title: "author" },
      { id: "email", title: "email" },
      { id: "location", title: "location" },
      { id: "body", title: "body" },
      { id: "reply", title: "reply" },
      { id: "created_at", title: "created_at" },
      { id: "replied_at", title: "replied_at" }
    ]
  });
  getAliExpressFiveStarReviews("https:" + url, csvWriter);
  getAliExpressFourStarReviews("https:" + url, csvWriter);
};

module.export = getAliExpressReviews;
