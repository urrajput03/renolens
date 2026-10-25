export const renovationTypes = [
  {
    id: 'bathroom',
    label: 'Bathroom renovation',
    quantityLabel: 'Approximate area',
    unit: 'm²',
    unitHint: 'Enter an area from 1 to 500 m².',
    defaultQuantity: 8,
    maxQuantity: 500,
    step: 0.5,
  },
  {
    id: 'toilet',
    label: 'Toilet-room renovation',
    quantityLabel: 'Number of toilet rooms',
    unit: 'rooms',
    unitHint: 'Enter 1 to 10 toilet rooms.',
    defaultQuantity: 1,
    maxQuantity: 10,
    step: 1,
  },
  {
    id: 'kitchen',
    label: 'Kitchen renovation',
    quantityLabel: 'Approximate area',
    unit: 'm²',
    unitHint: 'Enter an area from 1 to 500 m².',
    defaultQuantity: 8,
    maxQuantity: 500,
    step: 0.5,
  },
  {
    id: 'flooring',
    label: 'Floor replacement',
    quantityLabel: 'Approximate area',
    unit: 'm²',
    unitHint: 'Enter an area from 1 to 500 m².',
    defaultQuantity: 8,
    maxQuantity: 500,
    step: 0.5,
  },
  {
    id: 'painting',
    label: 'Interior painting',
    quantityLabel: 'Approximate area',
    unit: 'm²',
    unitHint: 'Enter an area from 1 to 500 m².',
    defaultQuantity: 8,
    maxQuantity: 500,
    step: 0.5,
  },
] as const

export type RenovationType = (typeof renovationTypes)[number]['id']

export interface EstimateDraft {
  renovationType: RenovationType
  quantity: number
}

interface FlooringProduct {
  packageAreaM2: number
  packagePricePLN: number
  eurToPln: number
  fxDate: string
  observedDate: string
  sourceUrl: string
  labourLowPerM2EUR: number
  labourHighPerM2EUR: number
  labourSourceUrl: string
}

const flooringProduct: FlooringProduct = {
  packageAreaM2: 2.24,
  packagePricePLN: 156.76,
  eurToPln: 4.3945,
  fxDate: '2026-10-23',
  observedDate: '2026-10-25',
  sourceUrl:
    'https://www.castorama.pl/panel-winylowy-spc-dab-orzechowy-2-24-m2/5063022943248_CAPL.prd',
  labourLowPerM2EUR: 35,
  labourHighPerM2EUR: 75,
  labourSourceUrl:
    'https://click-pvc.com/blogs/kennisbank-click-pvc-vloeren/click-pvc-vloer-prijzen-2026',
}

export interface SourcedEstimate {
  areaM2: number
  packageCount: number
  purchasedAreaM2: number
  excessAreaM2: number
  materialCostPLN: number
  materialCostEUR: number
  materialCostPerM2PLN: number
  materialCostPerM2EUR: number
  comparisonMaterialLowEURPerM2: number
  comparisonMaterialHighEURPerM2: number
  labourCostLowEUR: number
  labourCostHighEUR: number
  totalLowEUR: number
  totalHighEUR: number
  packagePricePLN: number
  packageAreaM2: number
  eurToPln: number
  fxDate: string
  observedDate: string
  materialSourceUrl: string
  labourLowPerM2EUR: number
  labourHighPerM2EUR: number
  labourSourceUrl: string
}

function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function getRenovationTypeDefinition(renovationType: string) {
  const selectedType = renovationTypes.find(
    (type) => type.id === renovationType,
  )
  if (!selectedType) {
    throw new RangeError('Choose a supported renovation type.')
  }
  return selectedType
}

export function calculateEstimate(
  renovationType: RenovationType,
  quantity: number,
): SourcedEstimate | null {
  const selectedType = getRenovationTypeDefinition(renovationType)
  if (
    !Number.isFinite(quantity) ||
    quantity < 1 ||
    quantity > selectedType.maxQuantity
  ) {
    throw new RangeError(
      `Quantity must be between 1 and ${selectedType.maxQuantity} ${selectedType.unit}.`,
    )
  }

  if (renovationType !== 'flooring') return null

  const packageCount = Math.ceil(quantity / flooringProduct.packageAreaM2)
  const purchasedAreaM2 = packageCount * flooringProduct.packageAreaM2
  const materialCostPLN = packageCount * flooringProduct.packagePricePLN
  const materialCostEUR = roundMoney(
    materialCostPLN / flooringProduct.eurToPln,
  )
  const labourCostLowEUR = roundMoney(
    quantity * flooringProduct.labourLowPerM2EUR,
  )
  const labourCostHighEUR = roundMoney(
    quantity * flooringProduct.labourHighPerM2EUR,
  )

  return {
    areaM2: quantity,
    packageCount,
    purchasedAreaM2,
    excessAreaM2: roundMoney(purchasedAreaM2 - quantity),
    materialCostPLN: roundMoney(materialCostPLN),
    materialCostEUR,
    materialCostPerM2PLN: roundMoney(
      flooringProduct.packagePricePLN / flooringProduct.packageAreaM2,
    ),
    materialCostPerM2EUR: roundMoney(
      flooringProduct.packagePricePLN /
        flooringProduct.packageAreaM2 /
        flooringProduct.eurToPln,
    ),
    comparisonMaterialLowEURPerM2: 19.95,
    comparisonMaterialHighEURPerM2: 45,
    labourCostLowEUR,
    labourCostHighEUR,
    totalLowEUR: roundMoney(materialCostEUR + labourCostLowEUR),
    totalHighEUR: roundMoney(materialCostEUR + labourCostHighEUR),
    packagePricePLN: flooringProduct.packagePricePLN,
    packageAreaM2: flooringProduct.packageAreaM2,
    eurToPln: flooringProduct.eurToPln,
    fxDate: flooringProduct.fxDate,
    observedDate: flooringProduct.observedDate,
    materialSourceUrl: flooringProduct.sourceUrl,
    labourLowPerM2EUR: flooringProduct.labourLowPerM2EUR,
    labourHighPerM2EUR: flooringProduct.labourHighPerM2EUR,
    labourSourceUrl: flooringProduct.labourSourceUrl,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
