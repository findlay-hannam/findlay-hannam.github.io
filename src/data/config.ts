export type CategoryId = 'boys' | 'girls'

export type CategoryConfig = { first: string[]; middle: string[] }

export type Config = Record<CategoryId, CategoryConfig>

// Sample data: replace with your own names.
export const config: Config = {
  boys: {
    first: ['Oliver', 'Arthur', "Finn O'Brien"],
    middle: ['James', 'Edward'],
  },
  girls: {
    first: ['Ada', 'Zoë', 'Mary Ann'],
    middle: ['Rose', 'Grace'],
  },
}
