'use client';

import React from 'react';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Icon } from '@iconify/react';

export interface PaginationProps {
  totalItems: number;

  currentPage: number;

  itemsPerPage: number;

  onPageChange: (page: number) => void;

  onItemsPerPageChange?: (itemsPerPage: number) => void;

  itemsPerPageOptions?: number[];

  showTotal?: boolean;

  showItemsPerPage?: boolean;

  showQuickJump?: boolean;

  showFirstLast?: boolean;

  size?: 'sm' | 'md' | 'lg';

  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';

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
          <div className='flex items-center gap-1'>
            {paginationUtils
              .getPageNumbers(currentPage, totalPages, 5)
              .map((item, index) => {
                if (typeof item === 'string') {
                  // Render dấu chấm
                  return (
                    <span
                      key={`dots-${item}-${index}`}
                      className='px-2 text-gray-500'
                    >
                      ...
                    </span>
                  );
                } else {
                  // Render số trang
                  return (
                    <Button
                      key={`page-${item}`}
                      className='min-w-8'
                      color={item === currentPage ? color : 'default'}
                      size={size}
                      variant={item === currentPage ? 'solid' : 'bordered'}
                      onPress={() => handlePageChange(item)}
                    >
                      {item}
                    </Button>
                  );
                }
              })}
          </div>
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
   * Tạo array các page numbers để hiển thị với dots
   */
  getPageNumbers: (currentPage: number, totalPages: number, maxVisible = 5) => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= maxVisible, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);

      // Tính toán khoảng giữa
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(2, currentPage - half);
      let end = Math.min(totalPages - 1, currentPage + half);

      // Điều chỉnh để đảm bảo có đủ số trang hiển thị
      if (end - start + 1 < maxVisible - 2) {
        if (start === 2) {
          end = Math.min(totalPages - 1, start + maxVisible - 3);
        } else {
          start = Math.max(2, end - maxVisible + 3);
        }
      }

      // Thêm dấu chấm đầu nếu cần
      if (start > 2) {
        pages.push('dots-start');
      }

      // Thêm các trang giữa
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Thêm dấu chấm cuối nếu cần
      if (end < totalPages - 1) {
        pages.push('dots-end');
      }

      // Luôn hiển thị trang cuối
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  },
};
