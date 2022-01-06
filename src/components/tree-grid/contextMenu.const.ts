import {ContextMenuItemModel} from '@syncfusion/ej2-angular-grids';

export const CONTEXT_MENU_ITEMS: ContextMenuItemModel[] = [
  {
    text: 'Add Next Row  ',
    target: '.e-content',
    id: 'addNext'
  },
  {
    text: 'Add Child Row',
    target: '.e-content',
    id: 'addChild'
  },
  {
    text: 'Edit Row',
    target: '.e-content',
    id: 'editRow'
  },
  {
    text: 'Delete Row',
    target: '.e-content',
    id: 'delRow'
  },

  { text: 'Multi-Select', target: '.e-content', id: 'rmultiSelect' },
  {text: 'Copy', target: '.e-content', id: 'rcopy'},

  {text: 'Paste Sibling', target: '.e-content', id: 'rsibling'},
  {text: 'Paste Child', target: '.e-content', id: 'rchild'},
  {
    id: 'cut',
    text: 'Cut',
    target: '.e-content',
    iconCss: 'e-cm-icons e-cut'
  },
  // { text: 'Style', target: '.e-headercontent', id: 'style' },

  {text: 'Edit Column', target: '.e-headercontent', id: 'editCol'},
  {text: 'Add Column', target: '.e-headercontent', id: 'newCol'},

  {text: 'Delete Column', target: '.e-headercontent', id: 'deleteCol'},
  {text: 'Show', target: '.e-headercontent', id: 'columnChooser'},
  {text: 'Freeze', target: '.e-headercontent', id: 'freeze'},

  {text: 'Filter', target: '.e-headercontent', id: 'filter'},
  {text: 'Multi-Sort', target: '.e-headercontent', id: 'multiSort'}
];
