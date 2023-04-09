import { Request, Response } from "express";
import { BookClubState } from "../types/book_club_state.js";
import { BookSearchCommand } from "./booksearch_command.js";
import { ShortlistCommand } from "./shortlist_command.js";
import { TestCommand } from "./test_command.js";

export interface ICommand {
    execute(req: Request, res: Response, state: BookClubState): Promise<Response>;
}

export abstract class CommandFactory { 
    static getCommand(command: string): ICommand {
        if (command === 'test') {
            return new TestCommand();
          } else if (command === 'booksearch') {
            return new BookSearchCommand();
          } else if (command === 'shortlist') {
            return new ShortlistCommand();
          } else {
            throw new Error(`Command ${command} not defined.`);
          }
    }
}