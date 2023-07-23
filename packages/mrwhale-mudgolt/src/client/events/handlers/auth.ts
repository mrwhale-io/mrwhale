import * as crypto from "crypto";

import { Handler } from "./handler";
import { AUTH_EVENT } from "../../../constants";
import { ALGORITHM_IDENTIFIER, ab2str } from "../../../crypto";
import { Payload } from "../../../types/payload";

const encoder = new TextEncoder();

export default class AuthHandler extends Handler {
  async handle(data: Payload<string>): Promise<void> {
    const signature = btoa(
      ab2str(
        await crypto.subtle.sign(
          ALGORITHM_IDENTIFIER,
          this.client.keys.privateKey,
          encoder.encode(data.payload)
        )
      )
    );
    this.client.sendEvent(AUTH_EVENT, signature);
    this.client.emit(AUTH_EVENT, signature);
  }
}
