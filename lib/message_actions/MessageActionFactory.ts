import { Request, Response } from 'express';
import { BookClubState } from '../types/BookClubState.js';
import BookVoteAction from './BookVoteAction.js';

export interface IAction {
    execute(
        req: Request,
        res: Response,
        state: BookClubState,
    ): Promise<Response>;
}

export default abstract class MessageActionFactory {
    static getAction(action_id: string): IAction {
        if (action_id === 'book_vote') {
            return new BookVoteAction();
        } else {
            throw new Error(`Action ${action_id} not defined.`);
        }
    }
}
