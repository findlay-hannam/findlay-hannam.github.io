export type CategoryId = 'boys' | 'girls'

export type CategoryConfig = { first: string[]; middle: string[] }

export type Config = { surname: string } & Record<CategoryId, CategoryConfig>

// Sample data: replace with your own names.
export const config: Config = {
  surname: 'Hannam',
  boys: {
    first: ['Oliver', 'Arthur', "Finn O'Brien"],
    middle: ['James', 'Edward'],
  },
  girls: {
    first: ['Ada', 'Zoë', 'Mary Ann'],
    middle: ['Rose', 'Grace'],
  },
}
