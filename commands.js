import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const BOOK_SEARCH = {
  name: 'booksearch',
  description: 'Search Goodreads for a book',
  options: [
    {
      type: 3,
      name: 'query',
      description: 'Search query',
      required: true,
    }
  ]
}

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
      description: 'Remove book at the given entry number from to the shortlist',
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

const ALL_COMMANDS = [
  BOOK_SEARCH,
  BOOK_SHORTLIST,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);