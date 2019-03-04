import Vue from "vue";

export type EventCallback = (data?: any, event?: string) => void;
export interface Subscription {
  dispose(): void;
}
export interface IEventAggregatorMixin {
  subscribe: (event: string, callback: EventCallback) => Subscription;
  subscribeOnce: (event: string, callback: EventCallback) => Subscription;
  publish: (event: string, data?: any) => void;
}

class Handler {
  constructor(private messageType: any, private callback: EventCallback) {
    this.messageType = messageType;
    this.callback = callback;
  }

  handle(message: any) {
    if (message instanceof this.messageType) {
      this.callback.call(null, message);
    }
  }
}

const invokeCallback = (callback: EventCallback, data: any, event: string) => {
  try {
    callback(data, event);
  } catch (e) {
    console.error(e);
  }
};

const invokeHandler = (handler: Handler, data: any) => {
  try {
    handler.handle(data);
  } catch (e) {
    console.error(e);
  }
};

/**
 * Enables loosely coupled publish/subscribe messaging.
 */
class EventAggregatorSingleton {
  private eventLookup: any;
  private messageHandlers: any[];
  /**
   * Creates an instance of the EventAggregator class.
   */
  constructor() {
    this.eventLookup = {};
    this.messageHandlers = [];
  }

  /**
   * Publishes a message.
   * @param event The event or channel to publish to.
   * @param data The data to publish on the channel.
   */
  publish(event: string, data: any) {
    let subscribers;
    let i;

    if (!event) {
      throw new Error("Event was invalid.");
    }

    if (typeof event === "string") {
      subscribers = this.eventLookup[event];
      if (subscribers) {
        subscribers = subscribers.slice();
        i = subscribers.length;

        while (i--) {
          invokeCallback(subscribers[i], data, event);
        }
      }
    } else {
      subscribers = this.messageHandlers.slice();
      i = subscribers.length;

      while (i--) {
        invokeHandler(subscribers[i], event);
      }
    }
  }

  /**
   * Subscribes to a message channel or message type.
   * @param event The event channel or event data type.
   * @param callback The callback to be invoked when when the specified message is published.
   */
  subscribe(event: string, callback: (a: any, b: any) => any) {
    let handler: any;
    let subscribers: Subscription[];

    if (!event) {
      throw new Error("Event channel/type was invalid.");
    }

    if (typeof event === "string") {
      handler = callback;
      subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);
    } else {
      handler = new Handler(event, callback);
      subscribers = this.messageHandlers;
    }

    subscribers.push(handler);

    return {
      dispose() {
        let idx = subscribers.indexOf(handler);
        if (idx !== -1) {
          subscribers.splice(idx, 1);
        }
      }
    };
  }

  /**
   * Subscribes to a message channel or message type, then disposes the subscription automatically after the first message is received.
   * @param event The event channel or event data type.
   * @param callback The callback to be invoked when when the specified message is published.
   */
  subscribeOnce(event: string, callback: (a: any, b: any) => any) {
    let sub = this.subscribe(event, (a, b) => {
      sub.dispose();
      return callback(a, b);
    });

    return sub;
  }
}

const eventAggregator = new EventAggregatorSingleton();
/* Includes EA functionality into an object instance.
 * @param obj The object to mix Event Aggregator functionality into.
 */
const includeEventsIn = (obj: any) => {
  let ea = eventAggregator;

  obj.subscribeOnce = function(event: string, callback: () => any) {
    return ea.subscribeOnce(event, callback);
  };

  obj.subscribe = function(event: string, callback: () => any) {
    return ea.subscribe(event, callback);
  };

  obj.publish = function(event: string, data: any) {
    ea.publish(event, data);
  };

  return ea;
};
export const subscribe = eventAggregator.subscribe.bind(eventAggregator);
export const subscribeOnce = eventAggregator.subscribeOnce.bind(eventAggregator);
export const publish = eventAggregator.publish.bind(eventAggregator);

import { Mixin } from "vue-mixin-decorator";
import { VueClass } from "vue-class-component/lib/declarations";
// @Mixin
// export default class EventAggregatorMixin extends Vue implements IEventAggregatorMixin {
//   private subscriptions: Subscription[] = [];
//   subscribe(event: string, callback: EventCallback): Subscription {
//     let subscription = eventAggregator.subscribe(event, callback);
//     this.subscriptions.push(subscription);
//     return subscription;
//   }
//   subscribeOnce(event: string, callback: EventCallback): Subscription {
//     let subscription = eventAggregator.subscribeOnce(event, callback);
//     this.subscriptions.push(subscription);
//     return subscription;
//   }
//   publish(event: string, data: any) {
//     eventAggregator.publish(event, data);
//   }
//   destroyed() {
//     this.subscriptions.forEach(s => s.dispose());
//   }
// }

export declare type MixinFunction<
  T1 extends VueClass<any> = VueClass<any>,
  T2 extends VueClass<Vue> = VueClass<Vue>
> = (superClass: T2) => VueClass<T1 & T2>;

export interface IEventAggregatorMixin extends VueClass<Vue> {
  new (): IEventAggregatorMixin & VueClass<Vue>;
}
export interface EventAggregatorMixin extends VueClass<Vue> {}
export interface EventAggregatorConstructor extends VueClass<Vue> {
  new (...args: any[]): EventAggregatorMixin & VueClass<Vue>;
}
export type EventAggregatorFunction = MixinFunction<EventAggregatorConstructor>;

export const EventAggregatorMixin: EventAggregatorFunction = (superClass: VueClass<Vue>) => {
  @Mixin
  class EventAggregatorMixinClass extends superClass {
    private subscriptions: Subscription[] = [];
    subscribe(event: string, callback: EventCallback): Subscription {
      let subscription = eventAggregator.subscribe(event, callback);
      this.subscriptions.push(subscription);
      return subscription;
    }
    subscribeOnce(event: string, callback: EventCallback): Subscription {
      let subscription = eventAggregator.subscribeOnce(event, callback);
      this.subscriptions.push(subscription);
      return subscription;
    }
    publish(event: string, data: any) {
      eventAggregator.publish(event, data);
    }
    destroyed() {
      this.subscriptions.forEach(s => s.dispose());
    }
  }
  return <any>EventAggregatorMixinClass;
};

export const EventAggregator: EventAggregatorFunction = EventAggregatorMixin;
