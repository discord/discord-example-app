import config from './config.js';
import { InstallGlobalCommands } from './utils.js';

// booksearch <query>
const BOOK_SEARCH = {
    name: 'booksearch',
    description: 'Search Goodreads for a book',
    options: [
        {
            type: 3,
            name: 'query',
            description: 'Search query',
            required: true,
        },
    ],
};

// shortlist list
// shortlist add <url>
// shortlist remove <entry number>
const BOOK_SHORTLIST = {
    name: 'shortlist',
    description: 'Manage shortlist of books to be considered',
    options: [
        {
            name: 'list',
            description: 'Show the current shortlist!',
            type: 1, // sub command
        },
        {
            name: 'add',
            description: 'Add a book to the shortlist',
            type: 1, // sub command
            options: [
                {
                    type: 3,
                    name: 'book_url',
                    description: 'The Goodreads URL of the book',
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description:
                'Remove book at the given entry number from to the shortlist',
            type: 1, // sub command
            options: [
                {
                    type: 4,
                    name: 'entry_number',
                    description: 'The entry number in the shortlist',
                    required: true,
                },
            ],
        },
    ],
};

// startvote
const VOTE = {
    name: 'startvote',
    description:
        'Start a vote for the next book with the books on your shortlist',
    options: [],
};

// bookevent list
// bookevent add <date> <url>
// bookevent remove <entry number>
const BOOK_EVENT = {
    name: 'bookevent',
    description: 'Manage book discussion events',
    options: [
        {
            name: 'list',
            description: 'Show all planned book club events!',
            type: 1, // sub command
        },
        {
            name: 'add',
            description: 'Add a book club event',
            type: 1, // sub command
            options: [
                {
                    type: 3,
                    name: 'datetime',
                    description:
                        "A date and time (e.g. '05-24-2023 21:00' for 9pm on May 24th)",
                    required: true,
                },
                {
                    type: 3,
                    name: 'book_url',
                    description:
                        'The Goodreads URL of the book (check the shortlist!)',
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description:
                'Remove the event with the given entry number (use `/bookevent list` for the entry numbers)',
            type: 1, // sub command
            options: [
                {
                    type: 4,
                    name: 'entry_number',
                    description: 'The entry number in the book events list',
                    required: true,
                },
            ],
        },
    ],
};

const ALL_COMMANDS = [BOOK_SEARCH, BOOK_SHORTLIST, VOTE, BOOK_EVENT];

InstallGlobalCommands(config.APP_ID, ALL_COMMANDS);
