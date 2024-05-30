import { CategoryInfo } from '../../../typings/Category'
import {
  categoryTreeName,
  transformCategoryTree,
} from '../../resolvers/categoryTreeName'

const mockGetCategoryTree = jest.fn()

const createContext = (): Context =>
  ({
    clients: {
      catalog: {
        getCategoryTree: mockGetCategoryTree,
      },
    },
  } as unknown as Context)

describe('transformCategoryTree', () => {
  it('should return an empty array for an empty category tree', () => {
    const categoryTree: CategoryTree[] = []
    const result = transformCategoryTree(categoryTree)
    expect(result).toEqual([])
  })

  it('should transform category tree into flattened array of CategoryInfo objects', () => {
    const categoryTree: CategoryTree[] = [
      {
        id: '1',
        name: 'Category 1',
        hasChildren: true,
        children: [
          {
            id: '2',
            name: 'Subcategory 1.1',
            hasChildren: false,
            children: [],
          },
        ],
      },
      {
        id: '3',
        name: 'Category 2',
        hasChildren: false,
        children: [],
      },
    ]
    const expected: CategoryInfo[] = [
      { id: '2', name: 'Category 1 > Subcategory 1.1' },
      { id: '1', name: 'Category 1' },
      { id: '3', name: 'Category 2' },
    ]
    const result = transformCategoryTree(categoryTree)
    expect(result).toEqual(expected)
  })
})

// Test suite for categoryTreeName resolver function
describe('categoryTreeName', () => {
  it('should return transformed category tree', async () => {
    const ctx = createContext()
    const categoryTree: CategoryTree[] = [
      {
        id: '1',
        name: 'Category 1',
        hasChildren: false,
        children: [],
      },
    ]
    mockGetCategoryTree.mockResolvedValue(categoryTree)
    const expected: CategoryInfo[] = [{ id: '1', name: 'Category 1' }]
    const result = await categoryTreeName({}, {}, ctx)
    expect(result).toEqual(expected)
  })

  it('should handle empty category tree', async () => {
    const ctx = createContext()
    const categoryTree: CategoryTree[] = []
    mockGetCategoryTree.mockResolvedValue(categoryTree)
    const result = await categoryTreeName({}, {}, ctx)
    expect(result).toEqual([])
  })
})
