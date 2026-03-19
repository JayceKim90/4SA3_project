// Repository Pattern - Abstract base for data access
// This pattern abstracts database operations and can be swapped for different implementations

export interface IRepository<T> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

export abstract class BaseRepository<T> implements IRepository<T> {
  abstract findById(id: string): Promise<T | null>
  abstract findAll(): Promise<T[]>
  abstract create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T>
  abstract delete(id: string): Promise<void>
}
