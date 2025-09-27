'use client';

import React from 'react';
import { Pagination as HeroUIPagination } from '@heroui/pagination';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Icon } from '@iconify/react';

export interface PaginationProps {
  /** Tổng số items */
  totalItems: number;
  /** Số items hiện tại trên trang */
  currentPage: number;
  /** Số items per page */
  itemsPerPage: number;
  /** Callback khi thay đổi trang */
  onPageChange: (page: number) => void;
  /** Callback khi thay đổi số items per page */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /** Các options cho items per page */
  itemsPerPageOptions?: number[];
  /** Có hiển thị thông tin tổng số items không */
  showTotal?: boolean;
  /** Có hiển thị items per page selector không */
  showItemsPerPage?: boolean;
  /** Có hiển thị quick jump không */
  showQuickJump?: boolean;
  /** Có hiển thị first/last page buttons không */
  showFirstLast?: boolean;
  /** Size của pagination */
  size?: 'sm' | 'md' | 'lg';
  /** Color theme */
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';
  /** Có hiển thị compact mode không */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

export function Pagination({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  showTotal = true,
  showItemsPerPage = true,
  showQuickJump = false,
  showFirstLast = true,
  size = 'md',
  color = 'primary',
  compact = false,
  className = '',
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);

    onItemsPerPageChange?.(newItemsPerPage);
    // Reset về trang 1 khi thay đổi items per page
    onPageChange(1);
  };

  const handleQuickJump = (page: number) => {
    handlePageChange(page);
  };

  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Thông tin tổng số items */}
      {showTotal && (
        <div className='text-sm text-gray-600'>
          Hiển thị {startItem}-{endItem} trong tổng số {totalItems} items
        </div>
      )}

      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Hiển thị:</span>
          <Select
            className='w-20'
            selectedKeys={[itemsPerPage.toString()]}
            size={size}
            onSelectionChange={keys => {
              const value = Array.from(keys)[0] as string;

              handleItemsPerPageChange(value);
            }}
          >
            {itemsPerPageOptions.map(option => (
              <SelectItem key={option.toString()}>{option}</SelectItem>
            ))}
          </Select>
          <span className='text-sm text-gray-600'>items/trang</span>
        </div>
      )}

      {/* Pagination controls */}
      <div className='flex items-center gap-2'>
        {/* First page button */}
        {showFirstLast && currentPage > 1 && (
          <Button
            isIconOnly
            className='min-w-8'
            size={size}
            variant='bordered'
            onPress={() => handlePageChange(1)}
          >
            <Icon className='w-4 h-4' icon='lucide:chevrons-left' />
          </Button>
        )}

        {/* Previous page button */}
        {currentPage > 1 && (
          <Button
            isIconOnly
            className='min-w-8'
            size={size}
            variant='bordered'
            onPress={() => handlePageChange(currentPage - 1)}
          >
            <Icon className='w-4 h-4' icon='lucide:chevron-left' />
          </Button>
        )}

        {/* Page numbers */}
        {!compact && (
          <HeroUIPagination
            showControls
            showShadow
            className='mx-2'
            color={color}
            page={currentPage}
            size={size}
            total={totalPages}
            onChange={handlePageChange}
          />
        )}

        {/* Compact mode - chỉ hiển thị current page */}
        {compact && (
          <div className='flex items-center gap-1'>
            <span className='text-sm text-gray-600'>Trang</span>
            <span className='px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-medium'>
              {currentPage}
            </span>
            <span className='text-sm text-gray-600'>/ {totalPages}</span>
          </div>
        )}

        {/* Next page button */}
        {currentPage < totalPages && (
          <Button
            isIconOnly
            className='min-w-8'
            size={size}
            variant='bordered'
            onPress={() => handlePageChange(currentPage + 1)}
          >
            <Icon className='w-4 h-4' icon='lucide:chevron-right' />
          </Button>
        )}

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages && (
          <Button
            isIconOnly
            className='min-w-8'
            size={size}
            variant='bordered'
            onPress={() => handlePageChange(totalPages)}
          >
            <Icon className='w-4 h-4' icon='lucide:chevrons-right' />
          </Button>
        )}
      </div>

      {/* Quick jump */}
      {showQuickJump && totalPages > 10 && (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Đi đến:</span>
          <input
            className='w-16 px-2 py-1 border border-gray-300 rounded text-sm'
            max={totalPages}
            min='1'
            placeholder='Trang'
            type='number'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const page = parseInt((e.target as HTMLInputElement).value);

                if (page && page >= 1 && page <= totalPages) {
                  handleQuickJump(page);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

// Hook để quản lý pagination state
export function usePagination(initialPage = 1, initialItemsPerPage = 10) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset về trang 1
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  };
}

// Utility functions
export const paginationUtils = {
  /**
   * Tính toán offset cho database query
   */
  getOffset: (page: number, itemsPerPage: number) => {
    return (page - 1) * itemsPerPage;
  },

  /**
   * Tính toán thông tin pagination từ API response
   */
  getPaginationInfo: (
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      totalPages,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  },

  /**
   * Tạo array các page numbers để hiển thị
   */
  getPageNumbers: (currentPage: number, totalPages: number, maxVisible = 5) => {
    const pages: number[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  },
};
