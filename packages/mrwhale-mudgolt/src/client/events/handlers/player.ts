import { Handler } from "./handler";
import { Payload } from "../../../types/payload";
import { Player } from "../../../types/player";
import { PLAYER_EVENT, USERNAME_CHANGE_EVENT } from "../../../constants";

export default class PlayerHandler extends Handler {
  handle(data: Payload<Player>): void {
    this.client.player = data.payload;

    if (this.client.firstTimeAuth) {
      this.client.sendEvent(USERNAME_CHANGE_EVENT, this.client.username);
    }
    this.client.emit(PLAYER_EVENT, data.payload);
  }
}
