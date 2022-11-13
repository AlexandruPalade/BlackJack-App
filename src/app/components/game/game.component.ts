import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { catchError, throwError } from "rxjs";
import { RulesService } from "src/app/core/rules.service";
import { Cards, Response, SitResponse } from "src/app/models/responses";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"]
})
export class GameComponent implements OnChanges {
  balanceForm = new FormGroup({
    balance: new FormControl(null)
  });

  betForm = new FormGroup({
    bet: new FormControl(null)
  });

  sitResponse: SitResponse = {
    availableBetOptions: [],
    sessionId: ""
  };

  response: Response = {
    currentBalance: 0,
    dealerCards: [],
    playerCards: [],
    roundEnded: false,
    winAmount: 0
  };

  public playerBalance = 0;

  public buttonsStatus = true;

  public dealerCards: Cards[] = [];
  public playerCards: Cards[] = [];

  public dealerSum = 0;
  public playerSum = 0;

  public winAmount = 0;
  public roundsPlayed = 0;

  public endGame = false;

  constructor(private rulesService: RulesService) {}

  ngOnChanges(changes: SimpleChanges): void {}

  async onClickSit() {
    let { balance } = this.balanceForm.value;
    this.endGame = false;

    if (balance >= 10 && balance <= 1000) {
      this.rulesService.sit(balance).subscribe((data: any) => {
        this.sitResponse = data;
      });
      this.updateBalance(balance);
      this.buttonsStatus = false;
    } else {
      alert("you must have between 10$ and 1000$");
    }
  }

  onClickDeal() {
    const { bet } = this.betForm.value;
    const options = this.sitResponse.availableBetOptions;
    const userdId = this.sitResponse.sessionId;
    this.endGame = false;

    if (this.playerBalance === 0) alert("no money");

    const betExists = options.some(option => option === bet);

    if (betExists) {
      this.rulesService
        .deal(bet, userdId)
        .pipe(catchError(this.handleErrors))
        .subscribe((data: any) => {
          this.response = data;
          this.dealerCards = this.response.dealerCards;
          this.playerCards = this.response.playerCards;

          this.dealerSum = this.cardsSum(this.dealerCards, this.dealerSum);
          this.playerSum = this.cardsSum(this.playerCards, this.playerSum);

          if (data.roundEnded === true) {
            this.updateBalance(this.playerBalance + data.winAmount);
          }
        });
    } else {
      alert(`your bet should be ${options}`);
    }
  }

  async onHitClick() {
    const userdId = this.sitResponse.sessionId;
    const action = "hit";
    this.dealerSum = 0;
    this.playerSum = 0;

    this.rulesService
      .turn(action, userdId)
      .pipe(catchError(this.handleErrors))
      .subscribe((data: any) => {
        this.response = data;

        this.dealerCards = data.dealerCards.map((element: any) => {
          if (isNaN(element.rank)) {
            return element;
          }
          element.rank = +element.rank;
          return element;
        });
        this.dealerSum = this.cardsSum(this.dealerCards, this.dealerSum);

        if (isNaN(data.playerCard.rank)) {
          this.playerCards.push(data.playerCard);
        } else {
          data.playerCard.rank = +data.playerCard.rank;
          this.playerCards.push(data.playerCard);
        }
        this.playerSum = this.cardsSum(this.playerCards, this.playerSum);

        if (data.roundEnded) {
          this.updateBalance(this.playerBalance + data.winAmount);
        }

        if (this.playerBalance === 0) {
          this.endGame = true;
        }
      });
  }

  async onStayClick() {
    const userdId = this.sitResponse.sessionId;
    const action = "stay";
    this.dealerSum = 0;

    this.buttonsStatus = false;

    this.rulesService
      .turn(action, userdId)
      .pipe(catchError(this.handleErrors))
      .subscribe((data: any) => {
        this.response = data;
        this.dealerCards = data.dealerCards.map((element: any) => {
          if (isNaN(element.rank)) {
            return element;
          }
          element.rank = +element.rank;
          return element;
        });
        this.cardsSum(this.dealerCards, this.dealerSum);

        if (data.roundEnded) {
          this.updateBalance(this.playerBalance + data.winAmount);
        }
      });
  }

  onStandClick() {
    this.endGame = true;
    this.dealerSum = 0;
    this.playerSum = 0;
    this.dealerCards = [];
    this.playerCards = [];
    this.response.winAmount = 0;

    const userdId = this.sitResponse.sessionId;
    this.rulesService
      .stand(userdId)
      .pipe(catchError(this.handleErrors))
      .subscribe(data => {
        this.winAmount = data.winAmount;
        this.roundsPlayed = data.roundsPlayed;
      });
  }

  updateBalance(balance: number) {
    this.playerBalance = balance;
  }

  cardsSum(arr: Cards[], sum: number) {
    arr.map(card => {
      if (typeof card.rank === "number") {
        sum = sum + card.rank;
      } else if (card.rank === "A" && sum <= 10) {
        sum += 11;
      } else if (card.rank === "A" && sum > 20) {
        sum += 1;
      } else {
        sum += 10;
      }
    });
    return sum;
  }

  onRestartClick() {
    this.dealerCards = [];
    this.playerCards = [];
    this.betForm.reset();
    this.response.winAmount = 0;
    this.dealerSum = 0;
    this.playerSum = 0;
    this.endGame = false;
  }

  handleErrors(gameError: HttpErrorResponse) {
    const errorMessage = gameError.error;

    if (errorMessage.message.includes("stand")) {
      alert("You can't press stand in the middle of the");
    }

    if (errorMessage.message.includes("deal")) {
      alert("Please refresh the page");
    }

    if (
      errorMessage.message.includes("Cannot perform turn on current session")
    ) {
      alert("You can't press stay/hit before you deal");
    }

    return throwError({ errorMessage });
  }
}
