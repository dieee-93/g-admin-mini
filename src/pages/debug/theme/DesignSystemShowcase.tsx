/**
 * Design System Component Showcase
 * 
 * Complete visual reference of all UI components in the G-Admin Mini design system.
 * Organized by category with interactive examples.
 */

import { useState } from 'react';
import { Box, Text, SimpleGrid, Flex, Grid, Button as ChakraButton } from '@chakra-ui/react';
import { useDisclosure } from '@/shared/hooks';
import {
    // Layout
    Stack,
    HStack,
    Center,
    Card,
    CardBody,
    CardHeader,
    CardFooter,

    // Typography
    Heading,
    Title,
    Body,
    Caption,
    Label,
    Code,
    Kbd,

    // Buttons
    Button,
    IconButton,
    ActionButton,

    // Form Components
    Input,
    InputField,
    Checkbox,
    Switch,
    SliderRoot,
    SliderControl,
    SliderTrack,
    SliderRange,
    SliderThumb,

    // Feedback
    Alert,
    Spinner,
    Skeleton,
    SkeletonText,
    ProgressRoot,
    ProgressTrack,
    ProgressRange,
    CircularProgress,

    // Data Display
    Badge,
    StatusBadge,
    Avatar,
    AvatarGroup,
    Separator,

    // Overlays
    Tabs,
    AccordionRoot,
    AccordionItem,
    AccordionItemTrigger,
    AccordionItemContent,
    MenuRoot,
    MenuTrigger,
    MenuContent,
    MenuItem,
    PopoverRoot,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    DialogRoot,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    DialogTitle,
    DialogCloseTrigger,
    DialogBackdrop,
    DrawerRoot,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerTitle,
    DrawerCloseTrigger,
    DrawerBackdrop,
    CollapsibleRoot,
    CollapsibleTrigger,
    CollapsibleContent,

    // Quick Components
    QuickStatus,
    EmptyState,

    // Business
    MetricCard,
    Icon,
    toaster
} from '@/shared/ui';

import {
    HomeIcon,
    UserIcon,
    CogIcon,
    BellIcon,
    StarIcon,
    HeartIcon,
    TrashIcon,
    PencilIcon,
    PlusIcon,
    CheckIcon,
    XMarkIcon,
    ChevronDownIcon,
    ArrowRightIcon,
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentIcon,
    FolderIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

// Showcase Subcomponents
import {
    FormShowcase,
    TableShowcase,
    StatsShowcase,
    BusinessBadgesShowcase,
    QuickComponentsShowcase,
    SectionLayoutShowcase,
    AlertStackShowcase,
} from './showcases';


// ============================================
// SECTION WRAPPER COMPONENT
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================
export function DesignSystemShowcase() {
    const drawer = useDisclosure();
    const [sliderValue, setSliderValue] = useState([50]);
    const [checkboxValue, setCheckboxValue] = useState(true);
    const [switchValue, setSwitchValue] = useState(false);

    return (
        <Stack gap="6">
            {/* ============================================ */}
            {/* TYPOGRAPHY */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Typography"
                description="Text components for headings, body text, labels, and code"
            >
                <Stack gap="4">
                    {/* Headings */}
                    <Box>
                        <Label mb="2">Headings</Label>
                        <Stack gap="2">
                            <Heading size="2xl">Heading 2xl</Heading>
                            <Heading size="xl">Heading xl</Heading>
                            <Heading size="lg">Heading lg</Heading>
                            <Heading size="md">Heading md</Heading>
                            <Heading size="sm">Heading sm</Heading>
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Typography Component */}
                    <Box>
                        <Label mb="2">Typography Variants</Label>
                        <Stack gap="2">
                            <Title>Title - For page headers</Title>
                            <Body>Body - For paragraph text content</Body>
                            <Caption>Caption - For small descriptive text</Caption>
                            <Label>Label - For form labels</Label>
                            <Code>Code - For inline code snippets</Code>
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Text Colors */}
                    <Box>
                        <Label mb="2">Text Colors</Label>
                        <Stack gap="1">
                            <Text color="text.primary">text.primary - Primary content</Text>
                            <Text color="text.secondary">text.secondary - Secondary content</Text>
                            <Text color="text.muted">text.muted - Muted/disabled</Text>
                            <Text color="fg">fg - Foreground default</Text>
                            <Text color="fg.muted">fg.muted - Foreground muted</Text>
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Keyboard Keys */}
                    <Box>
                        <Label mb="2">Keyboard Keys</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <Kbd>⌘</Kbd>
                            <Kbd>⇧</Kbd>
                            <Kbd>⌥</Kbd>
                            <Kbd>Ctrl</Kbd>
                            <Kbd>Enter</Kbd>
                            <Kbd>Esc</Kbd>
                        </Flex>
                    </Box>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* BUTTONS */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Buttons"
                description="Primary actions, icons, and button groups"
            >
                <Stack gap="4">
                    {/* Variants */}
                    <Box>
                        <Label mb="2">Variants</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <Button variant="solid">Solid</Button>
                            <Button variant="subtle">Subtle</Button>
                            <Button variant="surface">Surface</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="plain">Plain</Button>
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Color Palettes × Variants Matrix */}
                    <Box>
                        <Label mb="2">Color Palettes (all variants) - Our Wrapper</Label>
                        <Stack gap="2">
                            {(['gray', 'red', 'green', 'blue', 'teal', 'purple', 'orange'] as const).map((color) => (
                                <Flex key={color} align="center" gap="2">
                                    <Text minW="60px" fontSize="sm" color="text.muted">{color}</Text>
                                    <Button colorPalette={color} variant="solid" size="sm">Button</Button>
                                    <Button colorPalette={color} variant="outline" size="sm">Button</Button>
                                    <Button colorPalette={color} variant="surface" size="sm">Button</Button>
                                    <Button colorPalette={color} variant="subtle" size="sm">Button</Button>
                                </Flex>
                            ))}
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Direct Chakra Button Comparison */}
                    <Box>
                        <Label mb="2">Direct Chakra Button (sin wrapper) - Comparación</Label>
                        <Stack gap="2">
                            {(['gray', 'red', 'green', 'blue', 'teal', 'purple', 'orange'] as const).map((color) => (
                                <Flex key={`chakra-${color}`} align="center" gap="2">
                                    <Text minW="60px" fontSize="sm" color="text.muted">{color}</Text>
                                    <ChakraButton colorPalette={color} variant="solid" size="sm">Button</ChakraButton>
                                    <ChakraButton colorPalette={color} variant="outline" size="sm">Button</ChakraButton>
                                    <ChakraButton colorPalette={color} variant="surface" size="sm">Button</ChakraButton>
                                    <ChakraButton colorPalette={color} variant="subtle" size="sm">Button</ChakraButton>
                                </Flex>
                            ))}
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Sizes */}
                    <Box>
                        <Label mb="2">Sizes</Label>
                        <Flex gap="2" flexWrap="wrap" align="center">
                            <Button size="xs">XSmall</Button>
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Icon Buttons */}
                    <Box>
                        <Label mb="2">Icon Buttons</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <IconButton aria-label="Home" variant="outline">
                                <Icon icon={HomeIcon} />
                            </IconButton>
                            <IconButton aria-label="Settings" variant="outline">
                                <Icon icon={CogIcon} />
                            </IconButton>
                            <IconButton aria-label="Notifications" variant="outline">
                                <Icon icon={BellIcon} />
                            </IconButton>
                            <IconButton aria-label="Star" variant="solid" colorPalette="purple">
                                <Icon icon={StarIcon} />
                            </IconButton>
                            <IconButton aria-label="Delete" variant="ghost" colorPalette="red">
                                <Icon icon={TrashIcon} />
                            </IconButton>
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Action Buttons */}
                    <Box>
                        <Label mb="2">Action Buttons</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <ActionButton icon={PlusIcon}>Crear</ActionButton>
                            <ActionButton icon={PencilIcon} variant="outline">Editar</ActionButton>
                            <ActionButton icon={TrashIcon} variant="ghost" colorPalette="red">Eliminar</ActionButton>
                        </Flex>
                    </Box>

                    <Separator />

                    {/* States */}
                    <Box>
                        <Label mb="2">States</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <Button>Default</Button>
                            <Button disabled>Disabled</Button>
                            <Button loading>Loading</Button>
                        </Flex>
                    </Box>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* FORM COMPONENTS */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Form Components"
                description="Inputs, checkboxes, switches, sliders, and more"
            >
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
                    {/* Input */}
                    <Box>
                        <Label mb="2">Input</Label>
                        <Stack gap="2">
                            <Input placeholder="Default input" />
                            <Input placeholder="Disabled" disabled />
                            <InputField label="With Label" placeholder="Enter value..." />
                        </Stack>
                    </Box>

                    {/* Checkbox */}
                    <Box>
                        <Label mb="2">Checkbox</Label>
                        <Stack gap="2">
                            <Checkbox
                                checked={checkboxValue}
                                onCheckedChange={(e) => setCheckboxValue(!!e.checked)}
                            >
                                Accept terms
                            </Checkbox>
                            <Checkbox defaultChecked>Pre-checked</Checkbox>
                            <Checkbox disabled>Disabled</Checkbox>
                        </Stack>
                    </Box>

                    {/* Switch */}
                    <Box>
                        <Label mb="2">Switch</Label>
                        <Stack gap="2">
                            <Switch
                                checked={switchValue}
                                onCheckedChange={(e) => setSwitchValue(!!e.checked)}
                            >
                                Toggle Feature
                            </Switch>
                            <Switch defaultChecked>Enabled by default</Switch>
                            <Switch disabled>Disabled</Switch>
                        </Stack>
                    </Box>

                    {/* Slider */}
                    <Box>
                        <Label mb="2">Slider: {sliderValue[0]}%</Label>
                        <SliderRoot
                            value={sliderValue}
                            onValueChange={(e) => setSliderValue(e.value)}
                            max={100}
                        >
                            <SliderControl>
                                <SliderTrack>
                                    <SliderRange />
                                </SliderTrack>
                                <SliderThumb index={0} />
                            </SliderControl>
                        </SliderRoot>
                    </Box>
                </SimpleGrid>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* FEEDBACK */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Feedback"
                description="Alerts, progress indicators, spinners, and skeletons"
            >
                <Stack gap="4">
                    {/* Alerts */}
                    <Box>
                        <Label mb="2">Alerts</Label>
                        <Stack gap="2">
                            <Alert status="info">Info: This is an informational message</Alert>
                            <Alert status="success">Success: Operation completed successfully</Alert>
                            <Alert status="warning">Warning: Please review before continuing</Alert>
                            <Alert status="error">Error: Something went wrong</Alert>
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Semantic Feedback Colors Test */}
                    <Box>
                        <Label mb="2">⚠️ Semantic Feedback vs Theme Colors</Label>
                        <Text fontSize="sm" color="fg.muted" mb="3">
                            En temas como "Nature" (verde) o "Sunset" (rojo/naranja), estos colores pueden confundirse con el tema.
                            Verifica que success/error se distingan visualmente del tema.
                        </Text>
                        <Stack gap="3">
                            <Flex gap="4" align="center" wrap="wrap">
                                <Box>
                                    <Text fontSize="xs" color="fg.muted" mb="1">Success (green)</Text>
                                    <Flex gap="2">
                                        <Badge colorPalette="green" variant="solid">Activo</Badge>
                                        <Badge colorPalette="green" variant="outline">Completado</Badge>
                                        <Button colorPalette="green" size="xs">Confirmar</Button>
                                    </Flex>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="fg.muted" mb="1">Error (red)</Text>
                                    <Flex gap="2">
                                        <Badge colorPalette="red" variant="solid">Error</Badge>
                                        <Badge colorPalette="red" variant="outline">Rechazado</Badge>
                                        <Button colorPalette="red" size="xs">Eliminar</Button>
                                    </Flex>
                                </Box>
                            </Flex>
                            <Text fontSize="xs" fontStyle="italic" color="fg.muted">
                                Compara con: colorPalette del tema actual (gray.500/600):
                            </Text>
                            <Flex gap="2">
                                <Badge colorPalette="gray" variant="solid">Tema (gray)</Badge>
                                <Button size="xs">Default</Button>
                            </Flex>
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Progress */}
                    <Box>
                        <Label mb="2">Progress Bars</Label>
                        <Stack gap="3">
                            <ProgressRoot value={25}>
                                <ProgressTrack>
                                    <ProgressRange />
                                </ProgressTrack>
                            </ProgressRoot>
                            <ProgressRoot value={50} colorPalette="green">
                                <ProgressTrack>
                                    <ProgressRange />
                                </ProgressTrack>
                            </ProgressRoot>
                            <ProgressRoot value={75} colorPalette="purple">
                                <ProgressTrack>
                                    <ProgressRange />
                                </ProgressTrack>
                            </ProgressRoot>
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Spinners */}
                    <Box>
                        <Label mb="2">Spinners</Label>
                        <Flex gap="4" align="center">
                            <Spinner size="sm" />
                            <Spinner size="md" />
                            <Spinner size="lg" />
                            <Spinner size="xl" colorPalette="purple" />
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Circular Progress */}
                    <Box>
                        <Label mb="2">Circular Progress</Label>
                        <Flex gap="4" align="center">
                            <CircularProgress value={25} size="sm" />
                            <CircularProgress value={50} size="md" />
                            <CircularProgress value={75} size="lg" colorPalette="green" />
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Skeletons */}
                    <Box>
                        <Label mb="2">Skeletons</Label>
                        <Stack gap="2">
                            <Skeleton height="20px" />
                            <Skeleton height="20px" width="80%" />
                            <SkeletonText noOfLines={3} gap="2" />
                        </Stack>
                    </Box>

                    <Separator />

                    {/* Toast */}
                    <Box>
                        <Label mb="2">Toast Notifications</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <Button
                                size="sm"
                                onClick={() => toaster.success({ title: 'Success!', description: 'Action completed' })}
                            >
                                Success Toast
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toaster.error({ title: 'Error', description: 'Something failed' })}
                            >
                                Error Toast
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toaster.info({ title: 'Info', description: 'Here is some info' })}
                            >
                                Info Toast
                            </Button>
                        </Flex>
                    </Box>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* DATA DISPLAY */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Data Display"
                description="Badges, avatars, cards, and data presentation components"
            >
                <Stack gap="4">
                    {/* Badges */}
                    <Box>
                        <Label mb="2">Badges</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <Badge>Default</Badge>
                            <Badge colorPalette="blue">Blue</Badge>
                            <Badge colorPalette="green">Green</Badge>
                            <Badge colorPalette="red">Red</Badge>
                            <Badge colorPalette="purple">Purple</Badge>
                            <Badge colorPalette="orange">Orange</Badge>
                            <Badge colorPalette="teal">Teal</Badge>
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Status Badges */}
                    <Box>
                        <Label mb="2">Status Badges</Label>
                        <Flex gap="2" flexWrap="wrap">
                            <StatusBadge status="active" />
                            <StatusBadge status="pending" />
                            <StatusBadge status="inactive" />
                            <StatusBadge status="approved" />
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Quick Status */}
                    <Box>
                        <Label mb="2">Quick Status</Label>
                        <Flex gap="3" flexWrap="wrap">
                            <QuickStatus status="active">Online</QuickStatus>
                            <QuickStatus status="pending">Away</QuickStatus>
                            <QuickStatus status="inactive">Offline</QuickStatus>
                            <QuickStatus status="error">Error</QuickStatus>
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Avatars */}
                    <Box>
                        <Label mb="2">Avatars</Label>
                        <Flex gap="4" align="center">
                            <Avatar size="sm" name="John Doe" />
                            <Avatar size="md" name="Jane Smith" />
                            <Avatar size="lg" name="Bob Johnson" />
                            <Avatar size="xl" name="Alice Brown" />
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Avatar Group */}
                    <Box>
                        <Label mb="2">Avatar Group</Label>
                        <AvatarGroup max={3}>
                            <Avatar name="User 1" />
                            <Avatar name="User 2" />
                            <Avatar name="User 3" />
                            <Avatar name="User 4" />
                            <Avatar name="User 5" />
                        </AvatarGroup>
                    </Box>

                    <Separator />

                    {/* Cards */}
                    <Box>
                        <Label mb="2">Cards</Label>
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                            <Card.Root>
                                <CardHeader>
                                    <Text fontWeight="bold">Basic Card</Text>
                                </CardHeader>
                                <CardBody>
                                    <Text color="text.muted">Card body content</Text>
                                </CardBody>
                            </Card.Root>

                            <Card.Root>
                                <CardBody>
                                    <Text fontWeight="bold" mb="2">Compact Card</Text>
                                    <Text color="text.muted" fontSize="sm">Without header</Text>
                                </CardBody>
                                <CardFooter>
                                    <Button size="sm">Action</Button>
                                </CardFooter>
                            </Card.Root>

                            <Box bg="bg.panel" p="4" borderRadius="lg" border="1px solid" borderColor="border.subtle">
                                <Text fontWeight="bold" mb="2">Panel Box</Text>
                                <Text color="text.muted" fontSize="sm">Using bg.panel token</Text>
                            </Box>
                        </SimpleGrid>
                    </Box>

                    <Separator />

                    {/* Metric Cards */}
                    <Box>
                        <Label mb="2">Metric Cards</Label>
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                            <MetricCard
                                title="Revenue"
                                value="$12,450"
                                change={12.5}
                                icon={CurrencyDollarIcon}
                            />
                            <MetricCard
                                title="Orders"
                                value="845"
                                change={-3.2}
                                icon={ShoppingCartIcon}
                            />
                            <MetricCard
                                title="Users"
                                value="2,340"
                                change={8.7}
                                icon={UserIcon}
                            />
                        </SimpleGrid>
                    </Box>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* OVERLAYS & MENUS */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Overlays & Menus"
                description="Modals, drawers, popovers, menus, and tooltips"
            >
                <Flex gap="3" flexWrap="wrap">
                    {/* Dialog */}
                    <DialogRoot>
                        <DialogTrigger asChild>
                            <Button variant="outline">Open Dialog</Button>
                        </DialogTrigger>
                        <DialogBackdrop />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Dialog Title</DialogTitle>
                            </DialogHeader>
                            <DialogBody>
                                <Text>This is a dialog modal with content inside.</Text>
                            </DialogBody>
                            <DialogFooter>
                                <DialogCloseTrigger asChild>
                                    <Button variant="ghost">Cancel</Button>
                                </DialogCloseTrigger>
                                <Button colorPalette="purple">Confirm</Button>
                            </DialogFooter>
                            <DialogCloseTrigger />
                        </DialogContent>
                    </DialogRoot>

                    {/* Drawer */}
                    <DrawerRoot open={isDrawerOpen} onOpenChange={(e) => setIsDrawerOpen(e.open)}>
                        <DrawerTrigger asChild>
                            <Button variant="outline">Open Drawer</Button>
                        </DrawerTrigger>
                        <DrawerBackdrop />
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>Drawer Title</DrawerTitle>
                            </DrawerHeader>
                            <DrawerBody>
                                <Text>This is a drawer that slides in from the side.</Text>
                            </DrawerBody>
                            <DrawerFooter>
                                <DrawerCloseTrigger asChild>
                                    <Button variant="ghost">Close</Button>
                                </DrawerCloseTrigger>
                            </DrawerFooter>
                            <DrawerCloseTrigger />
                        </DrawerContent>
                    </DrawerRoot>

                    {/* Popover */}
                    <PopoverRoot>
                        <PopoverTrigger asChild>
                            <Button variant="outline">Open Popover</Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverBody>
                                <Text fontWeight="bold" mb="2">Popover Content</Text>
                                <Text fontSize="sm" color="text.muted">
                                    This is a popover with some helpful information.
                                </Text>
                            </PopoverBody>
                        </PopoverContent>
                    </PopoverRoot>

                    {/* Menu */}
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <Button variant="outline">
                                Open Menu <Icon icon={ChevronDownIcon} size="sm" />
                            </Button>
                        </MenuTrigger>
                        <MenuContent>
                            <MenuItem value="edit">
                                <Icon icon={PencilIcon} size="sm" /> Edit
                            </MenuItem>
                            <MenuItem value="duplicate">
                                <Icon icon={DocumentIcon} size="sm" /> Duplicate
                            </MenuItem>
                            <MenuItem value="delete" color="red.500">
                                <Icon icon={TrashIcon} size="sm" /> Delete
                            </MenuItem>
                        </MenuContent>
                    </MenuRoot>
                </Flex>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* DISCLOSURE */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Disclosure"
                description="Accordion, tabs, and collapsible content"
            >
                <Stack gap="4">
                    {/* Accordion */}
                    <Box>
                        <Label mb="2">Accordion</Label>
                        <AccordionRoot collapsible>
                            <AccordionItem value="item-1">
                                <AccordionItemTrigger>
                                    Section 1: Getting Started
                                </AccordionItemTrigger>
                                <AccordionItemContent>
                                    <Text>Content for the first section goes here. This can include any content you need.</Text>
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionItemTrigger>
                                    Section 2: Configuration
                                </AccordionItemTrigger>
                                <AccordionItemContent>
                                    <Text>Content for the second section. Configure your settings here.</Text>
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionItemTrigger>
                                    Section 3: Advanced
                                </AccordionItemTrigger>
                                <AccordionItemContent>
                                    <Text>Advanced settings and options for power users.</Text>
                                </AccordionItemContent>
                            </AccordionItem>
                        </AccordionRoot>
                    </Box>

                    <Separator />

                    {/* Tabs */}
                    <Box>
                        <Label mb="2">Tabs</Label>
                        <Tabs.Root defaultValue="tab1" variant="line">
                            <Tabs.List>
                                <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>
                                <Tabs.Trigger value="tab2">Details</Tabs.Trigger>
                                <Tabs.Trigger value="tab3">Settings</Tabs.Trigger>
                            </Tabs.List>
                            <Box mt="3">
                                <Tabs.Content value="tab1">
                                    <Text>Overview content goes here.</Text>
                                </Tabs.Content>
                                <Tabs.Content value="tab2">
                                    <Text>Detailed information displayed here.</Text>
                                </Tabs.Content>
                                <Tabs.Content value="tab3">
                                    <Text>Settings and configuration options.</Text>
                                </Tabs.Content>
                            </Box>
                        </Tabs.Root>
                    </Box>

                    <Separator />

                    {/* Collapsible */}
                    <Box>
                        <Label mb="2">Collapsible</Label>
                        <CollapsibleRoot>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Toggle Content <Icon icon={ChevronDownIcon} size="sm" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <Box mt="3" p="4" bg="bg.subtle" borderRadius="md">
                                    <Text>This content can be toggled open and closed.</Text>
                                </Box>
                            </CollapsibleContent>
                        </CollapsibleRoot>
                    </Box>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* ICONS */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Icons"
                description="Heroicons integration with size variants"
            >
                <Stack gap="4">
                    {/* Sizes */}
                    <Box>
                        <Label mb="2">Sizes</Label>
                        <Flex gap="4" align="center">
                            <Icon icon={HomeIcon} size="xs" />
                            <Icon icon={HomeIcon} size="sm" />
                            <Icon icon={HomeIcon} size="md" />
                            <Icon icon={HomeIcon} size="lg" />
                            <Icon icon={HomeIcon} size="xl" />
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Common Icons */}
                    <Box>
                        <Label mb="2">Common Icons</Label>
                        <Flex gap="3" flexWrap="wrap">
                            <Icon icon={HomeIcon} />
                            <Icon icon={UserIcon} />
                            <Icon icon={CogIcon} />
                            <Icon icon={BellIcon} />
                            <Icon icon={StarIcon} />
                            <Icon icon={HeartIcon} />
                            <Icon icon={TrashIcon} />
                            <Icon icon={PencilIcon} />
                            <Icon icon={PlusIcon} />
                            <Icon icon={CheckIcon} />
                            <Icon icon={XMarkIcon} />
                            <Icon icon={MagnifyingGlassIcon} />
                            <Icon icon={ShoppingCartIcon} />
                            <Icon icon={CurrencyDollarIcon} />
                            <Icon icon={ChartBarIcon} />
                            <Icon icon={DocumentIcon} />
                            <Icon icon={FolderIcon} />
                            <Icon icon={CalendarIcon} />
                            <Icon icon={ArrowRightIcon} />
                            <Icon icon={ChevronDownIcon} />
                        </Flex>
                    </Box>

                    <Separator />

                    {/* Colored Icons */}
                    <Box>
                        <Label mb="2">Colored Icons</Label>
                        <Flex gap="3" flexWrap="wrap">
                            <Icon icon={StarIcon} color="yellow.500" />
                            <Icon icon={HeartIcon} color="red.500" />
                            <Icon icon={CheckIcon} color="green.500" />
                            <Icon icon={BellIcon} color="blue.500" />
                            <Icon icon={CogIcon} color="purple.500" />
                        </Flex>
                    </Box>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* LAYOUT */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Layout"
                description="Flex, Stack, Grid, and spacing utilities"
            >
                <Stack gap="4">
                    {/* Stack */}
                    <Box>
                        <Label mb="2">Stack (Vertical)</Label>
                        <Stack gap="2" maxW="200px">
                            <Box bg="purple.100" p="2" borderRadius="md"><Text fontSize="sm">Item 1</Text></Box>
                            <Box bg="purple.200" p="2" borderRadius="md"><Text fontSize="sm">Item 2</Text></Box>
                            <Box bg="purple.300" p="2" borderRadius="md"><Text fontSize="sm">Item 3</Text></Box>
                        </Stack>
                    </Box>

                    <Separator />

                    {/* HStack */}
                    <Box>
                        <Label mb="2">HStack (Horizontal)</Label>
                        <HStack gap="2">
                            <Box bg="blue.100" p="2" borderRadius="md"><Text fontSize="sm">Item 1</Text></Box>
                            <Box bg="blue.200" p="2" borderRadius="md"><Text fontSize="sm">Item 2</Text></Box>
                            <Box bg="blue.300" p="2" borderRadius="md"><Text fontSize="sm">Item 3</Text></Box>
                        </HStack>
                    </Box>

                    <Separator />

                    {/* Center */}
                    <Box>
                        <Label mb="2">Center</Label>
                        <Center bg="teal.100" h="80px" borderRadius="md">
                            <Text>Centered Content</Text>
                        </Center>
                    </Box>

                    <Separator />

                    {/* Grid */}
                    <Box>
                        <Label mb="2">Grid (3 columns)</Label>
                        <Grid templateColumns="repeat(3, 1fr)" gap="2">
                            <Box bg="green.100" p="3" borderRadius="md"><Text fontSize="sm">1</Text></Box>
                            <Box bg="green.200" p="3" borderRadius="md"><Text fontSize="sm">2</Text></Box>
                            <Box bg="green.300" p="3" borderRadius="md"><Text fontSize="sm">3</Text></Box>
                            <Box bg="green.400" p="3" borderRadius="md"><Text fontSize="sm">4</Text></Box>
                            <Box bg="green.500" p="3" borderRadius="md"><Text fontSize="sm">5</Text></Box>
                            <Box bg="green.600" p="3" borderRadius="md"><Text fontSize="sm">6</Text></Box>
                        </Grid>
                    </Box>

                    <Separator />

                    {/* SimpleGrid */}
                    <Box>
                        <Label mb="2">SimpleGrid (Responsive)</Label>
                        <SimpleGrid columns={{ base: 2, md: 4 }} gap="2">
                            <Box bg="orange.100" p="3" borderRadius="md"><Text fontSize="sm">A</Text></Box>
                            <Box bg="orange.200" p="3" borderRadius="md"><Text fontSize="sm">B</Text></Box>
                            <Box bg="orange.300" p="3" borderRadius="md"><Text fontSize="sm">C</Text></Box>
                            <Box bg="orange.400" p="3" borderRadius="md"><Text fontSize="sm">D</Text></Box>
                        </SimpleGrid>
                    </Box>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* EMPTY STATE */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Empty State"
                description="Placeholder for empty views"
            >
                <EmptyState
                    icon={FolderIcon}
                    title="No items found"
                    description="Get started by creating your first item."
                >
                    <Button colorPalette="purple">
                        <Icon icon={PlusIcon} size="sm" /> Create Item
                    </Button>
                </EmptyState>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* SEPARATOR */}
            {/* ============================================ */}
            <ShowcaseSection
                title="Separator"
                description="Visual dividers for content sections"
            >
                <Stack gap="4">
                    <Text color="text.muted">Content above separator</Text>
                    <Separator />
                    <Text color="text.muted">Content below separator</Text>
                </Stack>
            </ShowcaseSection>

            {/* ============================================ */}
            {/* EXTENDED FORM COMPONENTS */}
            {/* ============================================ */}
            <FormShowcase />

            {/* ============================================ */}
            {/* TABLE */}
            {/* ============================================ */}
            <TableShowcase />

            {/* ============================================ */}
            {/* STATS */}
            {/* ============================================ */}
            <StatsShowcase />

            {/* ============================================ */}
            {/* BUSINESS BADGES */}
            {/* ============================================ */}
            <BusinessBadgesShowcase />

            {/* ============================================ */}
            {/* QUICK COMPONENTS */}
            {/* ============================================ */}
            <QuickComponentsShowcase />

            {/* ============================================ */}
            {/* SECTION LAYOUT */}
            {/* ============================================ */}
            <SectionLayoutShowcase />

            {/* ============================================ */}
            {/* ALERT STACKS */}
            {/* ============================================ */}
            <AlertStackShowcase />
        </Stack>
    );
}
