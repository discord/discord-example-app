import { Book } from "./book.js";

export type BookClubState = {
    shortlist: {
        books: Book[],
    },
};