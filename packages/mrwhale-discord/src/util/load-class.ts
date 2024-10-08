import {
  AbstractOrConcreteConstructor,
  ConcreteConstructor,
} from "../types/constructor-types";

/**
 * Dynamically loads a class from a specified file location and ensures it extends the provided base class.
 *
 * @template T The type of the base class.
 * @param classLocation The file path to the class to be loaded.
 * @param baseClass The constructor of the base class to check against.
 * @returns The loaded class extending the base class.
 *
 * @throws Will throw an error if the class cannot be found or does not extend the base class.
 */
export function loadClass<T>(
  classLocation: string,
  baseClass: AbstractOrConcreteConstructor<T>
): ConcreteConstructor<T> {
  // Clear the require cache to ensure the latest version of the module is loaded
  delete require.cache[require.resolve(classLocation)];

  // Load the module from the specified location
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const module = require(classLocation);

  let loadedClass: ConcreteConstructor<T>;

  // Check if the loaded module directly extends the base class
  if (module && Object.getPrototypeOf(module).name !== baseClass.name) {
    // Iterate over the module's properties to find the class extending the base class
    for (const key of Object.keys(module)) {
      if (Object.getPrototypeOf(module[key]).name === baseClass.name) {
        loadedClass = module[key];
        break;
      }
    }
  } else {
    // Assign the loaded module directly if it extends the base class
    loadedClass = module;
  }

  // Return the loaded class
  return loadedClass;
}
