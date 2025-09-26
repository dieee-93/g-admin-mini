/**
 * Component Library Debug Tool - Interactive showcase of all UI components
 * Provides testing playground for design system components
 */

import React, { useState } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Badge,
  SimpleGrid,
  Icon,
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputField,
  TextareaField,
  SelectField,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  Slider,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Progress,
  Spinner,
  Skeleton,
  MetricCard,
  CardGrid,
  FormSection,
  Box,
  CardWrapper
} from '@/shared/ui';

// Import Heroicons for proper Icon usage
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  HomeIcon,
  StarIcon,
  HeartIcon,
  CheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ComponentExample {
  id: string;
  name: string;
  category: 'layout' | 'forms' | 'feedback' | 'navigation' | 'data' | 'business';
  component: React.ReactNode;
  code: string;
  description: string;
}

const componentExamples: ComponentExample[] = [
  // Layout Components
  {
    id: 'stack',
    name: 'Stack',
    category: 'layout',
    component: (
      <Stack spacing="sm">
        <Box p="2" bg="gray.200" borderRadius="sm">Item 1</Box>
        <Box p="2" bg="gray.200" borderRadius="sm">Item 2</Box>
        <Box p="2" bg="gray.200" borderRadius="sm">Item 3</Box>
      </Stack>
    ),
    code: `<Stack spacing="sm">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>`,
    description: 'Flexible layout component for vertical/horizontal stacking'
  },
  {
    id: 'section',
    name: 'Section',
    category: 'layout',
    component: (
      <Section variant="elevated" title="Example Section">
        <Typography>This is content inside a section component</Typography>
      </Section>
    ),
    code: `<Section variant="elevated" title="Example Section">
  <Typography>Content here</Typography>
</Section>`,
    description: 'Semantic section wrapper with title and variants'
  },

  // Form Components
  {
    id: 'button',
    name: 'Button',
    category: 'forms',
    component: (
      <Stack direction="row" spacing="sm">
        <Button variant="solid" colorPalette="blue">Primary</Button>
        <Button variant="outline" colorPalette="blue">Secondary</Button>
        <Button variant="ghost" colorPalette="blue">Ghost</Button>
        <Button variant="solid" colorPalette="red" size="sm">Small</Button>
      </Stack>
    ),
    code: `<Button variant="solid" colorPalette="blue">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Ghost</Button>`,
    description: 'Interactive button with multiple variants and sizes'
  },
  {
    id: 'input',
    name: 'InputField',
    category: 'forms',
    component: (
      <Stack spacing="sm">
        <InputField placeholder="Standard input" />
        <InputField placeholder="Error state" invalid />
        <InputField placeholder="Disabled state" disabled />
      </Stack>
    ),
    code: `<InputField placeholder="Standard input" />
<InputField placeholder="Error state" invalid />
<InputField placeholder="Disabled" disabled />`,
    description: 'Text input field with validation states'
  },

  // Feedback Components
  {
    id: 'alert',
    name: 'Alert',
    category: 'feedback',
    component: (
      <Stack spacing="sm">
        <Alert status="info" title="Information">This is an info alert</Alert>
        <Alert status="success" title="Success">Operation completed successfully</Alert>
        <Alert status="warning" title="Warning">Please check your input</Alert>
        <Alert status="error" title="Error">Something went wrong</Alert>
      </Stack>
    ),
    code: `<Alert status="info" title="Information">
  This is an info alert
</Alert>`,
    description: 'Status alerts with different severity levels'
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'feedback',
    component: (
      <Stack direction="row" spacing="sm" align="center">
        <Badge colorPalette="blue">Default</Badge>
        <Badge colorPalette="green">Success</Badge>
        <Badge colorPalette="yellow">Warning</Badge>
        <Badge colorPalette="red">Error</Badge>
        <Badge size="lg">Large</Badge>
      </Stack>
    ),
    code: `<Badge colorPalette="blue">Default</Badge>
<Badge colorPalette="green">Success</Badge>
<Badge size="lg">Large</Badge>`,
    description: 'Small status indicators and labels'
  },

  // Data Display
  {
    id: 'card',
    name: 'CardWrapper',
    category: 'data',
    component: (
      <CardWrapper variant="elevated" maxW="300px">
        <CardWrapper.Header>
          <Typography variant="h6">Card Title</Typography>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Typography>This is the card content area where you can put any information.</Typography>
        </CardWrapper.Body>
      </CardWrapper>
    ),
    code: `<CardWrapper variant="elevated">
  <CardWrapper.Header>
    <Typography variant="h6">Card Title</Typography>
  </CardWrapper.Header>
  <CardWrapper.Body>
    <Typography>Card content</Typography>
  </CardWrapper.Body>
</CardWrapper>`,
    description: 'Container for grouping related content'
  },
  {
    id: 'progress',
    name: 'Progress',
    category: 'feedback',
    component: (
      <Stack spacing="sm">
        <Progress value={30} colorPalette="blue" />
        <Progress value={65} colorPalette="green" />
        <Progress value={90} colorPalette="orange" />
      </Stack>
    ),
    code: `<Progress value={65} colorPalette="green" />`,
    description: 'Visual progress indicator'
  },

  // Business Components
  {
    id: 'metric-card',
    name: 'MetricCard',
    category: 'business',
    component: (
      <MetricCard
        title="Total Sales"
        value="$12,450"
        change="+12.5%"
        trend="up"
        colorPalette="green"
        icon={CurrencyDollarIcon}
      />
    ),
    code: `<MetricCard
  title="Total Sales"
  value="$12,450"
  change="+12.5%"
  trend="up"
  colorPalette="green"
  icon={CurrencyDollarIcon}
/>`,
    description: 'Business metric display with trend indicators'
  },

  // Form Controls - New Components
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'forms',
    component: (
      <Stack spacing="sm">
        <Checkbox defaultChecked>Default checked</Checkbox>
        <Checkbox>Unchecked option</Checkbox>
        <Checkbox disabled>Disabled option</Checkbox>
        <Checkbox colorPalette="green">Green checkbox</Checkbox>
      </Stack>
    ),
    code: `<Checkbox defaultChecked>Default checked</Checkbox>
<Checkbox>Unchecked option</Checkbox>
<Checkbox disabled>Disabled option</Checkbox>
<Checkbox colorPalette="green">Green checkbox</Checkbox>`,
    description: 'Checkbox input with multiple states and colors'
  },
  {
    id: 'radiogroup',
    name: 'RadioGroup',
    category: 'forms',
    component: (
      <RadioGroup defaultValue="option1">
        <Radio value="option1">First option</Radio>
        <Radio value="option2">Second option</Radio>
        <Radio value="option3" disabled>Disabled option</Radio>
      </RadioGroup>
    ),
    code: `<RadioGroup defaultValue="option1">
  <Radio value="option1">First option</Radio>
  <Radio value="option2">Second option</Radio>
  <Radio value="option3" disabled>Disabled option</Radio>
</RadioGroup>`,
    description: 'Radio button group for single selection'
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'forms',
    component: (
      <Stack spacing="md">
        <Slider defaultValue={[50]} label="Volume" showValueText />
        <Slider defaultValue={[25, 75]} label="Range" showValueText colorPalette="green" />
        <Slider defaultValue={[30]} size="sm" colorPalette="blue" />
      </Stack>
    ),
    code: `<Slider defaultValue={[50]} label="Volume" showValueText />
<Slider defaultValue={[25, 75]} label="Range" showValueText colorPalette="green" />
<Slider defaultValue={[30]} size="sm" colorPalette="blue" />`,
    description: 'Slider input for numerical values and ranges'
  },

  // Feedback Components - Missing ones
  {
    id: 'spinner',
    name: 'Spinner',
    category: 'feedback',
    component: (
      <Stack direction="row" spacing="md" align="center">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" colorPalette="blue" />
      </Stack>
    ),
    code: `<Spinner size="xs" />
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" colorPalette="blue" />`,
    description: 'Loading spinner with different sizes'
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'feedback',
    component: (
      <Stack spacing="sm">
        <Skeleton height="20px" />
        <Skeleton height="20px" width="80%" />
        <Skeleton height="100px" />
      </Stack>
    ),
    code: `<Skeleton height="20px" />
<Skeleton height="20px" width="80%" />
<Skeleton height="100px" />`,
    description: 'Skeleton placeholder for loading content'
  },

  // Previously Unused Components
  {
    id: 'icon',
    name: 'Icon',
    category: 'data',
    component: (
      <Stack spacing="md">
        <Stack direction="row" spacing="md" align="center">
          <Icon icon={HomeIcon} size="sm" />
          <Icon icon={StarIcon} size="md" color="orange.500" />
          <Icon icon={HeartIcon} size="lg" color="red.500" />
          <Icon icon={CheckIcon} size="xl" color="green.500" />
        </Stack>
        <Stack direction="row" spacing="md" align="center">
          <Icon icon={CogIcon} size="xs" />
          <Icon icon={UsersIcon} size="sm" color="blue.500" />
          <Icon icon={ShoppingCartIcon} size="md" color="purple.500" />
          <Icon icon={ChartBarIcon} size="lg" color="teal.500" />
        </Stack>
      </Stack>
    ),
    code: `import { HomeIcon, StarIcon, HeartIcon, CheckIcon } from '@heroicons/react/24/outline'

<Icon icon={HomeIcon} size="sm" />
<Icon icon={StarIcon} size="md" color="orange.500" />
<Icon icon={HeartIcon} size="lg" color="red.500" />
<Icon icon={CheckIcon} size="xl" color="green.500" />`,
    description: 'Icon wrapper for Heroicons with different sizes and colors'
  },
  {
    id: 'textareafield',
    name: 'TextareaField',
    category: 'forms',
    component: (
      <Stack spacing="sm">
        <TextareaField placeholder="Enter your message..." />
        <TextareaField placeholder="Required field" required />
        <TextareaField placeholder="Error state" invalid />
        <TextareaField placeholder="Disabled" disabled />
      </Stack>
    ),
    code: `<TextareaField placeholder="Enter your message..." />
<TextareaField placeholder="Required field" required />
<TextareaField placeholder="Error state" invalid />
<TextareaField placeholder="Disabled" disabled />`,
    description: 'Textarea input field with validation states'
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'forms',
    component: (
      <Stack spacing="sm">
        <Switch defaultChecked>Default checked</Switch>
        <Switch>Unchecked switch</Switch>
        <Switch disabled>Disabled switch</Switch>
        <Switch colorPalette="green" defaultChecked>Green switch</Switch>
        <Switch size="lg" defaultChecked>Large switch</Switch>
      </Stack>
    ),
    code: `<Switch defaultChecked>Default checked</Switch>
<Switch>Unchecked switch</Switch>
<Switch disabled>Disabled switch</Switch>
<Switch colorPalette="green" defaultChecked>Green switch</Switch>
<Switch size="lg" defaultChecked>Large switch</Switch>`,
    description: 'Toggle switch with different states and sizes'
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'navigation',
    component: (
      <Tabs defaultValue="tab1" variant="line">
        <TabList>
          <Tab value="tab1">First Tab</Tab>
          <Tab value="tab2">Second Tab</Tab>
          <Tab value="tab3">Third Tab</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="tab1">
            <Typography>Content of the first tab</Typography>
          </TabPanel>
          <TabPanel value="tab2">
            <Typography>Content of the second tab</Typography>
          </TabPanel>
          <TabPanel value="tab3">
            <Typography>Content of the third tab</Typography>
          </TabPanel>
        </TabPanels>
      </Tabs>
    ),
    code: `<Tabs defaultValue="tab1" variant="line">
  <TabList>
    <Tab value="tab1">First Tab</Tab>
    <Tab value="tab2">Second Tab</Tab>
    <Tab value="tab3">Third Tab</Tab>
  </TabList>
  <TabPanels>
    <TabPanel value="tab1">Content 1</TabPanel>
    <TabPanel value="tab2">Content 2</TabPanel>
    <TabPanel value="tab3">Content 3</TabPanel>
  </TabPanels>
</Tabs>`,
    description: 'Tabbed navigation with multiple panels'
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'feedback',
    component: (
      <Modal>
        <Button>Open Modal</Button>
        <ModalContent>
          <ModalHeader>
            <Typography variant="h5">Modal Title</Typography>
          </ModalHeader>
          <ModalBody>
            <Typography>This is the modal content. You can put any information here.</Typography>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline">Cancel</Button>
            <Button colorPalette="blue">Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    ),
    code: `<Modal>
  <Button>Open Modal</Button>
  <ModalContent>
    <ModalHeader>
      <Typography variant="h5">Modal Title</Typography>
    </ModalHeader>
    <ModalBody>
      <Typography>Modal content here</Typography>
    </ModalBody>
    <ModalFooter>
      <Button variant="outline">Cancel</Button>
      <Button colorPalette="blue">Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>`,
    description: 'Modal dialog with header, body and footer'
  },
  {
    id: 'formsection',
    name: 'FormSection',
    category: 'layout',
    component: (
      <FormSection title="User Information" description="Please fill in your details">
        <Stack spacing="md">
          <InputField placeholder="Full Name" />
          <InputField placeholder="Email Address" type="email" />
          <TextareaField placeholder="Bio" />
        </Stack>
      </FormSection>
    ),
    code: `<FormSection title="User Information" description="Please fill in your details">
  <Stack spacing="md">
    <InputField placeholder="Full Name" />
    <InputField placeholder="Email Address" type="email" />
    <TextareaField placeholder="Bio" />
  </Stack>
</FormSection>`,
    description: 'Form section with title and description'
  },
  {
    id: 'cardgrid',
    name: 'CardGrid',
    category: 'layout',
    component: (
      <CardGrid columns={{ base: 1, md: 2 }} spacing="md">
        <CardWrapper variant="elevated">
          <CardWrapper.Body>
            <Typography>First card content</Typography>
          </CardWrapper.Body>
        </CardWrapper>
        <CardWrapper variant="elevated">
          <CardWrapper.Body>
            <Typography>Second card content</Typography>
          </CardWrapper.Body>
        </CardWrapper>
        <CardWrapper variant="elevated">
          <CardWrapper.Body>
            <Typography>Third card content</Typography>
          </CardWrapper.Body>
        </CardWrapper>
        <CardWrapper variant="elevated">
          <CardWrapper.Body>
            <Typography>Fourth card content</Typography>
          </CardWrapper.Body>
        </CardWrapper>
      </CardGrid>
    ),
    code: `<CardGrid columns={{ base: 1, md: 2 }} spacing="md">
  <CardWrapper variant="elevated">
    <CardWrapper.Body>Content 1</CardWrapper.Body>
  </CardWrapper>
  <CardWrapper variant="elevated">
    <CardWrapper.Body>Content 2</CardWrapper.Body>
  </CardWrapper>
</CardGrid>`,
    description: 'Responsive grid layout for cards'
  }
];

const categoryColors = {
  layout: 'blue',
  forms: 'green',
  feedback: 'orange',
  navigation: 'purple',
  data: 'teal',
  business: 'pink'
} as const;

export default function ComponentsDebugger() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCode, setShowCode] = useState<Record<string, boolean>>({});

  const filteredComponents = componentExamples.filter(component => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(componentExamples.map(c => c.category)))];

  const toggleCode = (componentId: string) => {
    setShowCode(prev => ({ ...prev, [componentId]: !prev[componentId] }));
  };

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🧩 Component Library">
        <Typography variant="body" style={{ color: '#666', marginBottom: '24px' }}>
          Interactive showcase of all G-Admin Mini UI components. Test components with different props and states.
        </Typography>

        <Stack spacing="lg">
          {/* Filters */}
          <Section variant="elevated" title="Filters">
            <Stack direction="row" spacing="md" align="center" wrap="wrap">
              <Stack spacing="xs">
                <Typography variant="sm" fontWeight="medium">Search</Typography>
                <InputField
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  width="250px"
                />
              </Stack>

              <Stack spacing="xs">
                <Typography variant="sm" fontWeight="medium">Category</Typography>
                <SelectField
                  value={selectedCategory}
                  onValueChange={(e) => setSelectedCategory(e.target.value)}
                  width="200px"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </SelectField>
              </Stack>

              <Badge colorPalette="blue" size="lg">
                {filteredComponents.length} components
              </Badge>
            </Stack>
          </Section>

          {/* Components Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="lg">
            {filteredComponents.map(component => (
              <CardWrapper key={component.id} variant="elevated">
                <CardWrapper.Header>
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" align="center" spacing="sm">
                      <Typography variant="h6">{component.name}</Typography>
                      <Badge
                        colorPalette={categoryColors[component.category]}
                        size="sm"
                      >
                        {component.category}
                      </Badge>
                    </Stack>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCode(component.id)}
                    >
                      {showCode[component.id] ? 'Hide Code' : 'Show Code'}
                    </Button>
                  </Stack>
                  <Typography variant="sm" style={{ color: '#666' }}>
                    {component.description}
                  </Typography>
                </CardWrapper.Header>

                <CardWrapper.Body>
                  <Stack spacing="md">
                    {/* Component Preview */}
                    <Section variant="flat" title="Preview">
                      <Box
                        p="4"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        bg="gray.50"
                      >
                        {component.component}
                      </Box>
                    </Section>

                    {/* Code Example */}
                    {showCode[component.id] && (
                      <Section variant="flat" title="Code">
                        <Box
                          as="pre"
                          bg="gray.900"
                          color="gray.100"
                          p="3"
                          borderRadius="md"
                          fontSize="sm"
                          fontFamily="mono"
                          overflow="auto"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {component.code}
                        </Box>
                      </Section>
                    )}
                  </Stack>
                </CardWrapper.Body>
              </CardWrapper>
            ))}
          </SimpleGrid>

          {/* No Results */}
          {filteredComponents.length === 0 && (
            <Section variant="elevated" title="No Components Found">
              <Stack align="center" spacing="md">
                <Typography variant="body" style={{ color: '#666' }}>
                  No components match your current filters.
                </Typography>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </Stack>
            </Section>
          )}

          {/* Usage Guide */}
          <Section variant="elevated" title="📖 Usage Guide">
            <Stack spacing="sm">
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • Use the search to find specific components quickly
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • Filter by category to browse related components
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • Click "Show Code" to see implementation examples
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • All components follow the G-Admin Mini design system
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • Components automatically adapt to the current theme
              </Typography>
            </Stack>
          </Section>
        </Stack>
      </Section>
    </ContentLayout>
  );
}