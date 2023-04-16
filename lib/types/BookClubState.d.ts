import { Book } from './Book.js';

export type BookClubState = {
    shortlist: {
        books: Book[];
    };
    vote: {
        books: Book[];
        votes: VoteEntry[];
    };
    events: Event[];
};

export type VoteEntry = {
    book: Book;
    user: string;
};

export type Event = {
    date: Date;
    book: Book;
};
