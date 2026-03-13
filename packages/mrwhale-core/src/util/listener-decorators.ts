import "reflect-metadata";
import { EventEmitter } from "events";

type ListenerMetaData = {
  event: string;
  method: string;
  once: boolean;
  args: unknown[];
  attached?: boolean;
};

/**
 * A utility class that provides decorators and methods for managing event listeners
 * using reflection metadata. This class enables declarative event handling by allowing
 * methods to be decorated with event listener metadata that can be automatically
 * registered with event emitters.
 * 
 * @example
 * ```typescript
 * class MyClass {
 *   @ListenerDecorators.on('data')
 *   handleData(data: any) {
 *     console.log('Received data:', data);
 *   }
 * 
 *   @ListenerDecorators.once('ready')
 *   handleReady() {
 *     console.log('Ready event fired once');
 *   }
 * }
 * 
 * const instance = new MyClass();
 * const emitter = new EventEmitter();
 * ListenerDecorators.registerListeners(emitter, instance);
 * ```
 */
export class ListenerDecorators {

  /**
   * Registers event listeners on an emitter based on metadata attached to the listener target.
   * 
   * This method uses reflection to retrieve listener metadata from the constructor prototype
   * and automatically attaches the corresponding methods as event handlers to the emitter.
   * 
   * @param emitter - The event emitter to register listeners on
   * @param listenerSrc - Optional source object containing the listener methods. 
   *                      If not provided, the emitter itself is used as the listener target
   * 
   * @remarks
   * - Skips listeners that don't have corresponding methods on the target object
   * - Skips listeners that are already attached
   * - Supports both regular listeners (`on`) and one-time listeners (`once`)
   * - Additional arguments from metadata are passed to the listener method along with event arguments
   */
  static registerListeners(emitter: unknown, listenerSrc?: unknown): void {
    const listenerTarget = listenerSrc ? listenerSrc : emitter;

    for (const listener of <ListenerMetaData[]>(
      Reflect.getMetadata("listeners", listenerTarget.constructor.prototype)
    )) {
      if (!(<unknown>listenerTarget)[listener.method]) {
        continue;
      }

      if (listener.attached) {
        continue;
      }

      emitter[listener.once ? "once" : "on"](
        listener.event,
        (...eventArgs: unknown[]) =>
          listenerTarget[listener.method](...eventArgs, ...listener.args)
      );
    }
  }

  /**
   * Decorator that registers a method as an event listener for the specified event.
   * The decorated method will be called when the event is emitted.
   * 
   * @param event - The name of the event to listen for
   * @param args - Additional arguments to pass to the listener metadata
   * @returns A method decorator that sets up the event listener
   * 
   * @example
   * ```typescript
   * class MyClass {
   *   @ListenerDecorators.on('message')
   *   handleMessage(data: any) {
   *     // Handle the message event
   *   }
   * }
   * ```
   */
  static on(event: string, ...args: unknown[]): MethodDecorator {
    return ListenerDecorators._setListenerMetadata(event, false, ...args);
  }

  /**
   * Decorator that registers a method as a one-time event listener for the specified event.
   * The decorated method will be called only the next time the event is emitted, and then removed.
   * @param event - The name of the event to listen for
   * @param args - Additional arguments to pass to the listener metadata
   * @returns A method decorator that sets up the one-time event listener
   * 
   * @example
   * ```typescript
   * class MyClass {
   *   @ListenerDecorators.once('ready')
   *   handleReady() {
   *     // Handle the ready event once
   *   }
   * }
   * ```
   */
  static once(event: string, ...args: unknown[]): MethodDecorator {
    return ListenerDecorators._setListenerMetadata(event, true, ...args);
  }

  private static _setListenerMetadata(
    event: string,
    once: boolean,
    ...args: unknown[]
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
