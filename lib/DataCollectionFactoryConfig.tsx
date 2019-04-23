/**
 * A DataCollectionFactoryConfig is used to configure the search paths for the {@link DataCollectionFactory}.
 * When using a configuration with tree-shaking and non dynamic requires you must provide a
 * path-source map in your custom DataCollectionFactory implementation in your code. (see our examples)
 * 
 * @interface DataCollectionFactoryConfig
 */
export interface DataCollectionFactoryConfig
{
  rootPath?:string
  configFolder?:string
  modelFolder?:string
}
