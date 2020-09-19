import "reflect-metadata";
import { EventEmitter } from "events";

type ListenerMetaData = {
  event: string;
  method: string;
  once: boolean;
  args: any[];
  attached?: boolean;
};

export class ListenerDecorators {
  /**
   * Register a new event listener
   * @param emitter The event listener to register.
   * @param [listenerSrc] Listener source.
   */
  static registerListeners(emitter: EventEmitter, listenerSrc?: object): void {
    const listenerTarget: object = listenerSrc ? listenerSrc : emitter;

    for (const listener of <ListenerMetaData[]>(
      Reflect.getMetadata("listeners", listenerTarget.constructor.prototype)
    )) {
      if (!(<any>listenerTarget)[listener.method]) {
        continue;
      }

      if (listener.attached) {
        continue;
      }

      emitter[listener.once ? "once" : "on"](
        listener.event,
        (...eventArgs: any[]) =>
          (<any>listenerTarget)[listener.method](...eventArgs, ...listener.args)
      );
    }
  }

  /**
   * On event method decorator.
   * @param event The event name.
   * @param args The event arguments.
   */
  static on(event: string, ...args: any[]): MethodDecorator {
    return ListenerDecorators._setListenerMetadata(event, false, ...args);
  }

  /**
   * Once event method decorator.
   * @param event The event name.
   * @param args The event arguments.
   */
  static once(event: string, ...args: any[]): MethodDecorator {
    return ListenerDecorators._setListenerMetadata(event, true, ...args);
  }

  private static _setListenerMetadata(
    event: string,
    once: boolean,
    ...args: any[]
  ): MethodDecorator {
    return function <T extends EventEmitter>(
      target: T,
      key: string,
      descriptor: PropertyDescriptor
    ): PropertyDescriptor {
      const listeners: ListenerMetaData[] =
        Reflect.getMetadata("listeners", target) || [];
      listeners.push({ event, method: key, once, args });
      Reflect.defineMetadata("listeners", listeners, target);

      return descriptor;
    };
  }
}
