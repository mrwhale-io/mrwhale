import { Payload } from "../../../types/payload";
import { MudgoltClient } from "../../mudgolt-client";

export abstract class Handler {
  readonly client: MudgoltClient;

  constructor(client: MudgoltClient) {
    this.client = client;
  }

  abstract handle(data: Payload): void;
}
