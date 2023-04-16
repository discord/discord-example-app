import { Request, Response } from 'express';
import { BookClubState } from '../types/BookClubState.js';
import BookSearchCommand from './BookSearchCommand.js';
import ShortlistCommand from './ShortlistCommand.js';
import TestCommand from './TestCommand.js';
import VoteCommand from './VoteCommand.js';
import BookEventCommand from './BookEventCommand.js';

export interface ICommand {
    execute(
        req: Request,
        res: Response,
        state: BookClubState,
    ): Promise<Response>;
}

export default abstract class CommandFactory {
    static getCommand(command: string): ICommand {
        if (command === 'test') {
            return new TestCommand();
        } else if (command === 'booksearch') {
            return new BookSearchCommand();
        } else if (command === 'shortlist') {
            return new ShortlistCommand();
        } else if (command === 'startvote') {
            return new VoteCommand();
        } else if (command === 'bookevent') {
            return new BookEventCommand();
        } else {
            throw new Error(`Command ${command} not defined.`);
        }
    }
}
