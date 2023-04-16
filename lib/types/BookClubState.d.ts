import { Book } from './Book.js';

export type BookClubState = {
    shortlist: {
        books: Book[];
    };
    vote: {
        books: Book[];
        votes: VoteEntry[];
    };
};

export type VoteEntry = {
    book: Book;
    user: string;
};
