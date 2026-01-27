/**
 * Form Showcase - Extended form components
 * 
 * Components: RadioGroup, SegmentGroup, NumberInput, SelectField, TextareaField, Fieldset
 */

import { useState } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import {
    Stack,
    Label,
    Separator,

    // Radio Group
    RadioGroup,
    RadioItem,
    OptionsRadioGroup,

    // Segment Group
    SegmentGroup,
    SegmentItem,

    // Number Input
    NumberField,

    // Select Field
    SelectField,
    createListCollection,

    // Textarea
    TextareaField,
    Textarea,

    // Fieldset
    Fieldset,
    FieldsetRoot,
    FieldsetContent,
    FieldsetLegend,
} from '@/shared/ui';

// Showcase section wrapper (reused pattern)
function ShowcaseSection({
    title,
    description,
    children
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <Box
            p="5"
            bg="bg.subtle"
            borderRadius="xl"
            border="1px solid"
            borderColor="border.subtle"
        >
            <Flex justify="space-between" align="flex-start" mb="4">
                <Box>
                    <Text fontSize="md" fontWeight="bold" color="text.primary">
                        {title}
                    </Text>
                    {description && (
                        <Text fontSize="sm" color="text.muted" mt="1">
                            {description}
                        </Text>
                    )}
                </Box>
            </Flex>
            {children}
        </Box>
    );
}

// Select collection
const categoryCollection = createListCollection({
    items: [
        { label: 'Electrónica', value: 'electronics' },
        { label: 'Ropa', value: 'clothing' },
        { label: 'Hogar', value: 'home' },
        { label: 'Deportes', value: 'sports' },
        { label: 'Libros', value: 'books' },
    ],
});

const statusCollection = createListCollection({
    items: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'Pendiente', value: 'pending' },
    ],
});

// Options for RadioGroup
const paymentOptions = [
    { value: 'cash', label: 'Efectivo', description: 'Pago en efectivo al momento' },
    { value: 'card', label: 'Tarjeta', description: 'Débito o crédito' },
    { value: 'transfer', label: 'Transferencia', description: 'Transferencia bancaria' },
];

export function FormShowcase() {
    const [radioValue, setRadioValue] = useState('option1');
    const [segmentValue, setSegmentValue] = useState('list');
    const [numberValue, setNumberValue] = useState(10);
    const [selectValue, setSelectValue] = useState<string[]>(['electronics']);
    const [textareaValue, setTextareaValue] = useState('');

    return (
        <ShowcaseSection
            title="Extended Form Components"
            description="RadioGroup, SegmentGroup, NumberInput, SelectField, TextareaField, Fieldset"
        >
            <Stack gap="6">
                {/* Radio Group */}
                <Box>
                    <Label mb="2">RadioGroup</Label>
                    <Stack gap="4">
                        <RadioGroup
                            value={radioValue}
                            onValueChange={(value) => setRadioValue(value)}
                            orientation="vertical"
                        >
                            <RadioItem value="option1">Option 1</RadioItem>
                            <RadioItem value="option2">Option 2</RadioItem>
                            <RadioItem value="option3" disabled>Option 3 (disabled)</RadioItem>
                        </RadioGroup>

                        <Box>
                            <Label mb="2" fontSize="xs" color="text.muted">Horizontal</Label>
                            <RadioGroup
                                value={radioValue}
                                onValueChange={(value) => setRadioValue(value)}
                                orientation="horizontal"
                            >
                                <RadioItem value="option1">Option 1</RadioItem>
                                <RadioItem value="option2">Option 2</RadioItem>
                            </RadioGroup>
                        </Box>
                    </Stack>
                </Box>

                <Separator />

                {/* Options Radio Group (Business variant) */}
                <Box>
                    <Label mb="2">OptionsRadioGroup (with descriptions)</Label>
                    <OptionsRadioGroup
                        options={paymentOptions}
                        label="Método de pago"
                        defaultValue="cash"
                    />
                </Box>

                <Separator />

                {/* Segment Group */}
                <Box>
                    <Label mb="2">SegmentGroup</Label>
                    <Stack gap="3">
                        <SegmentGroup
                            value={segmentValue}
                            onValueChange={(details) => setSegmentValue(details.value || 'list')}
                            colorPalette="blue"
                        >
                            <SegmentItem value="list">Lista</SegmentItem>
                            <SegmentItem value="grid">Cuadrícula</SegmentItem>
                            <SegmentItem value="timeline">Timeline</SegmentItem>
                        </SegmentGroup>

                        <SegmentGroup
                            defaultValue="alerts"
                            size="sm"
                        >
                            <SegmentItem value="alerts">Alertas</SegmentItem>
                            <SegmentItem value="setup">Setup</SegmentItem>
                            <SegmentItem value="analytics">Analytics</SegmentItem>
                        </SegmentGroup>
                    </Stack>
                </Box>

                <Separator />

                {/* Number Input */}
                <Box>
                    <Label mb="2">NumberField</Label>
                    <Stack gap="3" maxW="300px">
                        <NumberField
                            label="Cantidad"
                            value={numberValue}
                            onValueChange={(e) => setNumberValue(e.valueAsNumber)}
                            min={0}
                            max={100}
                        />
                        <NumberField
                            label="Precio"
                            value={25.50}
                            formatOptions={{ style: 'currency', currency: 'USD' }}
                            min={0}
                        />
                    </Stack>
                </Box>

                <Separator />

                {/* Select Field */}
                <Box>
                    <Label mb="2">SelectField</Label>
                    <Stack gap="3" maxW="300px">
                        <SelectField
                            label="Categoría"
                            placeholder="Selecciona una categoría"
                            collection={categoryCollection}
                            value={selectValue}
                            onValueChange={(e) => setSelectValue(e.value)}
                        />
                        <SelectField
                            label="Estado"
                            placeholder="Selecciona un estado"
                            collection={statusCollection}
                            size="sm"
                        />
                    </Stack>
                </Box>

                <Separator />

                {/* Textarea Field */}
                <Box>
                    <Label mb="2">TextareaField</Label>
                    <Stack gap="3" maxW="400px">
                        <TextareaField
                            label="Descripción"
                            placeholder="Escribe una descripción..."
                            value={textareaValue}
                            onChange={(e) => setTextareaValue(e.target.value)}
                        />
                        <Textarea
                            placeholder="Textarea simple sin label..."
                            rows={3}
                        />
                    </Stack>
                </Box>

                <Separator />

                {/* Fieldset */}
                <Box>
                    <Label mb="2">Fieldset</Label>
                    <FieldsetRoot>
                        <FieldsetLegend>Información de contacto</FieldsetLegend>
                        <FieldsetContent>
                            <Stack gap="3">
                                <Text fontSize="sm" color="text.muted">
                                    Fieldset agrupa campos relacionados con un legend descriptivo.
                                </Text>
                                <Flex gap="3">
                                    <Box flex="1" p="3" bg="bg.panel" borderRadius="md">
                                        <Text fontSize="sm">Campo 1</Text>
                                    </Box>
                                    <Box flex="1" p="3" bg="bg.panel" borderRadius="md">
                                        <Text fontSize="sm">Campo 2</Text>
                                    </Box>
                                </Flex>
                            </Stack>
                        </FieldsetContent>
                    </FieldsetRoot>
                </Box>
            </Stack>
        </ShowcaseSection>
    );
}
