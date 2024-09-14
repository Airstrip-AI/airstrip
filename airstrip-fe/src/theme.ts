'use client';

import { Menu, Modal, Overlay, Tooltip, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'dark',
  defaultRadius: 'md',
  components: {
    Menu: Menu.extend({
      defaultProps: {
        withArrow: true,
      },
    }),
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
    Tooltip: Tooltip.extend({
      defaultProps: {
        withArrow: true,
      },
    }),
  },
});

export default theme;
