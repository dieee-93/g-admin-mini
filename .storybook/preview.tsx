import type { Preview } from '@storybook/react-vite'
import React from 'react'
import { Provider } from '../src/shared/ui/provider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff'
        },
        {
          name: 'dark',
          value: '#0f172a'
        },
        {
          name: 'surface',
          value: '#f8fafc'
        }
      ]
    }
  },
  decorators: [
    (Story) => (
      <Provider>
        <div style={{ padding: '20px', minHeight: '100vh' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default preview;