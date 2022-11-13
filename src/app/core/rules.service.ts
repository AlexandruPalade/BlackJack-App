import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class RulesService {
  private sitUrl = "sit";
  private dealUrl = "deal";
  private turnUrl = "turn";
  private standUrl = "stand";

  constructor(private httpClient: HttpClient) {}

  public sit(balance: number): Observable<any> {
    return this.httpClient.post(this.sitUrl, { balance });
  }

  public deal(bet: number, sessionId: string): Observable<any> {
    return this.httpClient.post(this.dealUrl, { bet, sessionId });
  }

  public turn(action: string, sessionId: string): Observable<any> {
    return this.httpClient.post(this.turnUrl, { action, sessionId });
  }

  public stand(sessionId: string): Observable<any> {
    return this.httpClient.post(this.standUrl, { sessionId });
  }
}
