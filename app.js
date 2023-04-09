import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getBookData, searchBooks } from './lib/goodreads_search.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Some in-memory state for the time being
const bookClubState = {
  shortlist: {
    books: [],
  },
};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data, token } = req.body;

  console.log(type, id, data, token);

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    } else if (name === 'booksearch') {
      try {
        const searchQuery = data.options[0].value;
        const searchResults = await searchBooks(searchQuery);
        const books = [];
        if (searchResults.books) {
          books.push(...searchResults.books.slice(0, 3).map((book, i) => {
            return `${i+1}) ${book.title} by ${book.author} can be found at: ${book.url}`;
          }));
        }
        
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `You searched for "${searchQuery}". The top results I got:\n` 
            + (books.length > 0 ? books.join('\n') : 'No results!'),
          }
        });
      } catch (error) {
        console.error('error', error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Ugh, my creator failed and some error happened...',
          }
        });
      }
    } else if (name === 'shortlist') {
      const subCommand = data.options[0].name;
      if (subCommand === 'list') {
        const books = bookClubState.shortlist.books.map((book, i) => {
          return `${i+1}) ${book.title} by ${book.author} (${book.url}).`;
        });

        const booksList = books.length > 0 
          ? books.join('\n') 
          : 'No books in the shortlist yet! Add some with "/shortlist add <Goodreads url>"';

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'This is the current shortlist:\n' + booksList,
          }
        });
      } else if (subCommand === 'add') {
        const url = data.options[0].options[0].value;
        
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Request to add the book to the shortlist received! Let me find some more data..'
            }
        })

        const book = await getBookData(url);

        if (book !== null) {
          bookClubState.shortlist.books.push({
            title: book.title,
            author: book.author,
            url: book.url,
          });

          const resultStr = 'The following book was added to the shortlist:\n' + 
                `${book.title} by ${book.author} (${book.url}).`

          const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;

          try {
            // Update ephemeral message
            await DiscordRequest(endpoint, {
              method: 'PATCH',
              body: {
                content: resultStr,
                components: [],
              },
            });
          } catch (err) {
            console.error('Error sending message:', err);
          }
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Mehhh.. I couldn\'t find the book.',
            }
          });
        }
      } else if (subCommand === 'remove') {
        const removeIndex = data.options[0].options[0].value - 1;
        if (removeIndex >= 0 && removeIndex < bookClubState.shortlist.books.length) {
          const [book] = bookClubState.shortlist.books.splice(removeIndex, 1);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Removed this book from the shortlist:\n' + 
                `${book.title} by ${book.author} (${book.url}).`
            }
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Uh, we don\'t have a book with that number on our shortlist!',
            }
          });
        }
      }

    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
