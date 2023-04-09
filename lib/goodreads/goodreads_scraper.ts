import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { Book } from '../types/book.js';

export async function scrapeBookFromUrl(url: string): Promise<Book> {
    let browser = null;

    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url);

        // Wait for book title to load
        const searchResultSelector = '.Text__title1';
        await page.waitForSelector(searchResultSelector);

        const content = await page.content();
        const $ = cheerio.load(content);

        const result = {
            id: url.split('show/')[1]?.split('-')[0],
            url: $('[hreflang="en"]')?.attr('href') || url,
            title: $('h1.Text__title1')?.text(),
            author: $('.ContributorLinksList .ContributorLink span.ContributorLink__name')?.text(),
            description: $('.DetailsLayoutRightParagraph__widthConstrained')?.text(),
            coverSmall: $('.BookCover__image>div>img')?.attr('src'),
            // isbn13: $('[itemprop="isbn"]')?.text(),
            // pages: $('.pagesFormat')?.text().toInt(),
            // rating: $('.RatingStatistics__rating')?.text().toFloat(),
            // ratingCount: $('[data-testid=ratingsCount]')?.text().toFloat(),
            // reviewsCount: $('[data-testid=reviewsCount]')?.text().toFloat(),
            // language: $('[itemprop="inLanguage"]')?.text(),
        };
        return result;
    } catch (error) {
        console.error('Error scraping book from URL', error);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}


