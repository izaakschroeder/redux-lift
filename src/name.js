
/**
 * Create a enhancer to add an name property to the store lifted by an enhancer.
 * @param {string} name The name to apply to the store.
 * @returns {Function} An enhancer capable of lifting an enhancer.
 */
export function name(name) {
  return enhancer => next => (reducer, initialState) => {
    return {
      ...enhancer(next)(reducer, initialState),
      name,
    };
  };
}

/**
 * Create a enhancer to add an name property to the store lifted by an enhancer.
 * The base store will always be available under the `default` property.
 * @param {Object} store A redux store.
 * @returns {Object} An object mapping stores to their name properites.
 */
export function normalize(store) {
  const stores = {};
  for (let current = store; current; current = current.parent) {
    stores[current.name || 'default'] = current;
  }
  return stores;
}
