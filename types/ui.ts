// UI Component Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export interface SelectItemProps {
  key: string;
  value?: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  isPressable?: boolean;
  isHoverable?: boolean;
  onPress?: () => void;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface SwitchProps {
  isSelected: boolean;
  onValueChange: (value: boolean) => void;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface AlertProps {
  children: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  placement?: 'center' | 'top' | 'top-center' | 'bottom' | 'bottom-center';
  backdrop?: 'opaque' | 'blur' | 'transparent';
  className?: string;
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

// Form Layout Types
export interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormColumnProps {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
}

// Table Types
export interface TableProps {
  children: React.ReactNode;
  className?: string;
  isStriped?: boolean;
  isCompact?: boolean;
  isBordered?: boolean;
  isHoverable?: boolean;
}

export interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

// Navigation Types
export interface NavbarProps {
  children: React.ReactNode;
  className?: string;
  isBlurred?: boolean;
  isBordered?: boolean;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface MenuProps {
  children: React.ReactNode;
  className?: string;
}

export interface MenuItemProps {
  children: React.ReactNode;
  key: string;
  onPress?: () => void;
  isActive?: boolean;
  className?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

// Layout Types
export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  isCentered?: boolean;
}

export interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}
