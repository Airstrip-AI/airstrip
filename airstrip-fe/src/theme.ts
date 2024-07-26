'use client';

import { Modal, Overlay, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'dark',
  defaultRadius: 'md',
  components: {
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: {
          transition: 'pop',
        },
        centered: true,
      },
    }),
    Overlay: Overlay.extend({
      defaultProps: {
        opacity: 0.8,
        blur: 12,
      },
    }),
  },
});

export default theme;