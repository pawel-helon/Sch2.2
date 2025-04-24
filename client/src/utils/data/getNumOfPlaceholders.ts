export const getNumOfPlaceholders = (weekLength: number) => {
  const placeholders: number[] = []
  let i: number = 0
  for (i = 1; i <= 7 - weekLength; i++) {
    placeholders.push(i)
  }
  return placeholders
}