// export abstract class Store {
//   abstract get(key: string): Promise<any>;
//   abstract set(key: string, value: string, expire?: number): Promise<any>;
// }

export interface Store {
  get(key: string):Promise<any>
  set(key: string, value: string, expire?: number): Promise<any>;
}
