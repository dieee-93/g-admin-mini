import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { Pagination } from '../Pagination';

const system = createSystem(defaultConfig);

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {ui}
    </ChakraProvider>
  );
};

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: vi.fn(),
    totalItems: 100,
    pageSize: 10,
    onPageSizeChange: vi.fn(),
  };

  it('should render correct number of page buttons', () => {
    renderWithProvider(<Pagination {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
  });

  it('should call onPageChange when clicking a page number', () => {
    renderWithProvider(<Pagination {...defaultProps} />);
    
    fireEvent.click(screen.getByText('2'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when clicking next button', () => {
    renderWithProvider(<Pagination {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Siguiente'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    renderWithProvider(<Pagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByText('Anterior');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    renderWithProvider(<Pagination {...defaultProps} currentPage={10} />);
    
    const nextButton = screen.getByText('Siguiente');
    expect(nextButton).toBeDisabled();
  });

  it('should show range text', () => {
    renderWithProvider(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Mostrando 1 - 10 de 100 resultados/)).toBeInTheDocument();
  });

  it('should render page size selector', () => {
    renderWithProvider(<Pagination {...defaultProps} />);
    expect(screen.getByText('Items por página:')).toBeInTheDocument();
  });
});
