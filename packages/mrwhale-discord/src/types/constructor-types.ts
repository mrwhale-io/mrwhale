/**
 * Represents a concrete class constructor.
 * This type is used to define constructors that instantiate instances of a class.
 *
 * @template T The type of the instance that the constructor creates.
 */
export type ConcreteConstructor<T> = new (...args: any[]) => T;

/**
 * Represents an abstract class constructor.
 * This type is used to define constructors that can be used as base classes for other classes.
 *
 * @template T The type of the instance that the abstract constructor would create if it were instantiable.
 */
export type AbstractConstructor<T> = abstract new (...args: any[]) => T;

/**
 * Represents a constructor that can be either an abstract or a concrete class.
 * This type is used to define constructors that can instantiate instances of a class
 * or be used as a base class for other classes.
 *
 * @template T The type of the instance that the constructor creates.
 */
export type AbstractOrConcreteConstructor<T> = ConcreteConstructor<T> | AbstractConstructor<T>;
