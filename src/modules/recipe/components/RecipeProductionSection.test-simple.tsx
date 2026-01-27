/**
 * TEST SIMPLE - Radio Group Debug
 */
import { useState } from 'react'
import { RadioGroup, RadioItem, Stack, Text } from '@/shared/ui'

export function TestRadioSimple() {
  const [value, setValue] = useState('option1')

  console.log('Current value:', value)

  return (
    <Stack gap="4">
      <Text>Valor actual: {value}</Text>
      
      <RadioGroup 
        value={value} 
        onValueChange={(newValue) => {
          console.log('onValueChange called with:', newValue)
          setValue(newValue)
        }}
      >
        <RadioItem value="option1">
          <Text>Opción 1</Text>
        </RadioItem>
        <RadioItem value="option2">
          <Text>Opción 2</Text>
        </RadioItem>
        <RadioItem value="option3">
          <Text>Opción 3</Text>
        </RadioItem>
      </RadioGroup>
    </Stack>
  )
}
