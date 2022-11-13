interface ISitResponse {
  availableBetOptions: number[];
  sessionId: string;
}

interface IResponse {
  currentBalance: number;
  dealerCards: {
    rank: string | number;
    suite: string;
  }[];
  playerCards: {
    rank: string | number;
    suite: string;
  }[];
  roundEnded: boolean;
  winAmount: number;
}

interface ICards {
  rank: string | number;
  suite: string;
}

export class SitResponse implements ISitResponse {
  availableBetOptions = [];
  sessionId = "";
}

export class Response implements IResponse {
  currentBalance = 0;
  dealerCards = [];
  playerCards = [];
  roundEnded = true;
  winAmount = 0;
}

export class Cards implements ICards {
  rank = 0;
  suite = "";
}
