import { ContextMenuItemModel } from '@syncfusion/ej2-angular-grids';

export const CONTEXT_MENU_ITEMS: ContextMenuItemModel[] = [
  {text: 'Add Next Row', target: '.e-content', id: 'addNext'},
  {text: 'Add Child Row', target: '.e-content', id: 'addChild'},
  {text: 'Edit Row', target: '.e-content', id: 'editRow'},
  {text: 'Delete Row', target: '.e-content', id: 'delRow'},
  {text: 'Copy Rows', target: '.e-content', id: 'copyRows'},
  {text: 'Paste Rows Next', target: '.e-content', id: 'rowPasteNext'},
  {text: 'Paste Rows as Child', target: '.e-content', id: 'rowPasteChild'},
  {text: 'Cut Rows', target: '.e-content', id: 'rowCut'},
  {text: 'Disable Multi-Select', target: '.e-content', id: 'cancelMultiSelect'},
  {text: 'Enable Multi-Select', target: '.e-content', id: 'multiSelect'},

  {text: 'Edit Column', target: '.e-headercontent', id: 'editCol'},
  {text: 'Add Column', target: '.e-headercontent', id: 'newCol'},
  {text: 'Delete Column', target: '.e-headercontent', id: 'deleteCol'},
  {text: 'Column Chooser', target: '.e-headercontent', id: 'columnChooser'},
  {text: 'Freeze', target: '.e-headercontent', id: 'freeze'},
  {text: 'Unfilter', target: '.e-headercontent', id: 'unfilter'},
  {text: 'Filter', target: '.e-headercontent', id: 'filter'},
  {text: 'Multi-Sort', target: '.e-headercontent', id: 'multiSort'},
  {text: 'Disable Multi-Sort', target: '.e-headercontent', id: 'unmultiSort'},
];
